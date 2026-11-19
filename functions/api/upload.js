import { json, requireAdmin } from '../_lib/auth.js';

const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const MAX = 4 * 1024 * 1024; // 4 MB

// Validação dos magic bytes para garantir que o binário é realmente uma imagem
function isValidImage(buf, type) {
  const u8 = new Uint8Array(buf);
  if (u8.length < 12) return false;
  if (type === 'image/jpeg') {
    return u8[0] === 0xff && u8[1] === 0xd8 && u8[2] === 0xff;
  }
  if (type === 'image/png') {
    return u8[0] === 0x89 && u8[1] === 0x50 && u8[2] === 0x4e && u8[3] === 0x47;
  }
  if (type === 'image/webp') {
    return (
      u8[0] === 0x52 && u8[1] === 0x49 && u8[2] === 0x46 && u8[3] === 0x46 && // RIFF
      u8[8] === 0x57 && u8[9] === 0x45 && u8[10] === 0x42 && u8[11] === 0x50  // WEBP
    );
  }
  return false;
}

// POST /api/upload (corpo = bytes da imagem, Content-Type = tipo) -> { image: "/img/<id>" }
export async function onRequestPost({ request, env }) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;
  const type = (request.headers.get('Content-Type') || '').split(';')[0].trim();
  if (!TYPES[type]) return json({ error: 'Envie uma imagem JPG, PNG ou WebP.' }, 415);
  const buf = await request.arrayBuffer();
  if (!buf.byteLength) return json({ error: 'A imagem chegou vazia. Tente de novo.' }, 400);
  if (buf.byteLength > MAX) return json({ error: 'Imagem acima de 4 MB. Use uma menor.' }, 413);
  if (!isValidImage(buf, type)) return json({ error: 'Arquivo inválido. O conteúdo não corresponde a uma imagem válida.' }, 415);
  const id = `${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}.${TYPES[type]}`;
  await env.PROJECTS.put('img:' + id, buf, { metadata: { type } });
  return json({ image: '/img/' + id }, 201);
}
