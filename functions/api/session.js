import { json, createSession, sessionCookie, clearCookie, isAuthed, sameOrigin, verifyPassword, setPassword, requireAdmin } from '../_lib/auth.js';

// GET /api/session -> { authed: true|false }
export async function onRequestGet({ request, env }) {
  return json({ authed: await isAuthed(request, env) });
}

// POST /api/session { password } -> entra
export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) return json({ error: 'Faltam as variáveis ADMIN_PASSWORD e SESSION_SECRET na Cloudflare.' }, 500);
  if (!sameOrigin(request)) return json({ error: 'Origem não permitida.' }, 403);
  let body = {};
  try { body = await request.json(); } catch {}
  const valid = await verifyPassword(body.password, env);
  if (!valid) {
    await new Promise((r) => setTimeout(r, 900)); // atrasa tentativas erradas
    return json({ error: 'Senha incorreta.' }, 401);
  }
  const token = await createSession(env);
  return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie(token, request) });
}

// PUT /api/session { currentPassword, newPassword } -> altera a senha do admin
export async function onRequestPut({ request, env }) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;

  let body = {};
  try { body = await request.json(); } catch {}
  const currentPassword = String(body.currentPassword || '');
  const newPassword = String(body.newPassword || '');

  if (!newPassword || newPassword.length < 6) {
    return json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' }, 400);
  }

  const valid = await verifyPassword(currentPassword, env);
  if (!valid) {
    await new Promise((r) => setTimeout(r, 900));
    return json({ error: 'Senha atual incorreta.' }, 401);
  }

  await setPassword(newPassword, env);
  return json({ ok: true, message: 'Senha alterada com sucesso!' });
}

// DELETE /api/session -> sai
export async function onRequestDelete({ request }) {
  return json({ ok: true }, 200, { 'Set-Cookie': clearCookie(request) });
}
