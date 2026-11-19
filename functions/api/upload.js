import { json, requireAdmin } from '../_lib/auth.js';

const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const MAX = 4 * 1024 * 1024; // 4 MB

// POST /api/upload (corpo = bytes da imagem, Content-Type = tipo) -> { image: "/img/<id>" }
export async function onRequestPost({ request, env }) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;
  const type = (request.headers.get('Content-Type') || '').split(';')[0].trim();
  if (!TYPES[type]) return json({ error: 'Envie uma imagem JPG, PNG ou WebP.' }, 415);
  const buf = await request.arrayBuffer();
  if (!buf.byteLength) return json({ error: 'A imagem chegou vazia. Tente de novo.' }, 400);
  if (buf.byteLength > MAX) return json({ error: 'Imagem acima de 4 MB. Use uma menor.' }, 413);
  const id = `${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}.${TYPES[type]}`;
  await env.PROJECTS.put('img:' + id, buf, { metadata: { type } });
  return json({ image: '/img/' + id }, 201);
}
