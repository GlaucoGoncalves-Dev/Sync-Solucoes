// Sessão do admin: cookie HttpOnly com token assinado (HMAC-SHA256).
// Segredos vêm das variáveis de ambiente da Cloudflare:
//   ADMIN_PASSWORD  -> senha da área admin
//   SESSION_SECRET  -> texto longo e aleatório usado para assinar a sessão
export const COOKIE = 'sync_admin';
const SESSION_HOURS = 12;

const enc = new TextEncoder();
const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64uText = (txt) => b64u(enc.encode(txt));
const fromB64u = (s) => atob(s.replace(/-/g, '+').replace(/_/g, '/'));

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64u(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

// Comparação em tempo constante para strings.
export function safeEqual(a, b) {
  a = String(a); b = String(b);
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

// Hash e verificação da senha do admin (com suporte a alteração salva no KV).
export async function hashPassword(password, salt) {
  if (!salt) {
    const saltBytes = new Uint8Array(16);
    crypto.getRandomValues(saltBytes);
    salt = Array.from(saltBytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  const data = enc.encode(`${salt}:${password}`);
  const hashBuf = await crypto.subtle.digest('SHA-256', data);
  const hash = Array.from(new Uint8Array(hashBuf), (b) => b.toString(16).padStart(2, '0')).join('');
  return `${salt}:${hash}`;
}

export async function verifyPassword(password, env) {
  let stored = null;
  if (env.PROJECTS) {
    try {
      stored = await env.PROJECTS.get('admin:password_hash');
    } catch {}
  }
  if (stored) {
    const [salt, expectedHash] = stored.split(':');
    if (salt && expectedHash) {
      const computed = await hashPassword(password, salt);
      return safeEqual(computed, stored);
    }
  }
  return safeEqual(password || '', env.ADMIN_PASSWORD || '');
}

export async function setPassword(newPassword, env) {
  if (!env.PROJECTS) throw new Error('Armazenamento KV não conectado.');
  const hashed = await hashPassword(newPassword);
  await env.PROJECTS.put('admin:password_hash', hashed);
  // Invalida imediatamente todas as sessões ativas anteriores
  await env.PROJECTS.put('admin:session_version', Date.now().toString());
}

function secretOf(env) {
  if (!env.SESSION_SECRET || !env.ADMIN_PASSWORD) throw new Error('missing-secrets');
  return env.SESSION_SECRET;
}

export async function createSession(env) {
  let ver = 0;
  if (env.PROJECTS) {
    try {
      const v = await env.PROJECTS.get('admin:session_version');
      if (v) ver = Number(v) || 0;
    } catch {}
  }
  const payload = b64uText(JSON.stringify({ exp: Date.now() + SESSION_HOURS * 3600e3, ver }));
  const sig = await hmac(secretOf(env), payload);
  return `${payload}.${sig}`;
}

export async function isAuthed(request, env) {
  try {
    const raw = (request.headers.get('Cookie') || '').split(/;\s*/).find((c) => c.startsWith(COOKIE + '='));
    if (!raw) return false;
    const [payload, sig] = raw.slice(COOKIE.length + 1).split('.');
    if (!payload || !sig) return false;
    if (!safeEqual(sig, await hmac(secretOf(env), payload))) return false;
    const { exp, ver } = JSON.parse(fromB64u(payload));
    if (typeof exp !== 'number' || exp <= Date.now()) return false;
    if (env.PROJECTS) {
      const currentVerStr = await env.PROJECTS.get('admin:session_version');
      if (currentVerStr) {
        const currentVer = Number(currentVerStr) || 0;
        if ((ver || 0) < currentVer) return false; // Sessão revogada após troca de senha
      }
    }
    return true;
  } catch {
    return false;
  }
}

export function sessionCookie(token, request) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_HOURS * 3600}${secure}`;
}

export function clearCookie(request) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}`;
}

// Bloqueia escrita vinda de outro site (proteção extra contra CSRF).
export function sameOrigin(request) {
  const origin = request.headers.get('Origin');
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}

export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers } });

export async function requireAdmin(request, env) {
  if (!env.PROJECTS) return json({ error: 'O armazenamento (KV) PROJECTS não está ligado ao site.' }, 500);
  if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) return json({ error: 'Faltam as variáveis ADMIN_PASSWORD e SESSION_SECRET na Cloudflare.' }, 500);
  if (!(await isAuthed(request, env))) return json({ error: 'Sessão expirada. Entre de novo.' }, 401);
  if (request.method !== 'GET' && !sameOrigin(request)) return json({ error: 'Origem não permitida.' }, 403);
  return null;
}
