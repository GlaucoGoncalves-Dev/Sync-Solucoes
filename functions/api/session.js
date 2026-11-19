import { json, safeEqual, createSession, sessionCookie, clearCookie, isAuthed, sameOrigin } from '../_lib/auth.js';

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
  if (!safeEqual(body.password || '', env.ADMIN_PASSWORD)) {
    await new Promise((r) => setTimeout(r, 900)); // atrasa tentativas erradas
    return json({ error: 'Senha incorreta.' }, 401);
  }
  const token = await createSession(env);
  return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie(token, request) });
}

// DELETE /api/session -> sai
export async function onRequestDelete({ request }) {
  return json({ ok: true }, 200, { 'Set-Cookie': clearCookie(request) });
}
