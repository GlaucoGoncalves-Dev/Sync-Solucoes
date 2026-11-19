import { json, requireAdmin } from '../../_lib/auth.js';
import { loadAll, saveAll, clean } from '../../_lib/projects.js';

async function find(env, id) {
  const list = await loadAll(env);
  const i = list.findIndex((p) => p.id === id);
  return { list, i };
}

// PUT /api/projects/:id -> atualiza (só admin)
export async function onRequestPut({ request, env, params }) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Dados inválidos.' }, 400); }
  const { list, i } = await find(env, params.id);
  if (i < 0) return json({ error: 'Projeto não encontrado. Ele pode ter sido excluído.' }, 404);
  const { value, error } = clean(body, list[i]);
  if (error) return json({ error }, 400);
  value.id = list[i].id;
  // Imagem trocada ou removida: apaga a antiga do KV.
  const old = list[i].image || '';
  if (old.startsWith('/img/') && old !== value.image) await env.PROJECTS.delete('img:' + old.slice(5));
  list[i] = value;
  await saveAll(env, list);
  return json({ project: value });
}

// PATCH /api/projects/:id -> muda só "published" ou "order" (só admin)
export async function onRequestPatch({ request, env, params }) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Dados inválidos.' }, 400); }
  const { list, i } = await find(env, params.id);
  if (i < 0) return json({ error: 'Projeto não encontrado.' }, 404);
  if (typeof body.published === 'boolean') list[i].published = body.published;
  if (Number.isFinite(body.order)) list[i].order = Math.max(0, Math.min(999, Math.round(body.order)));
  list[i].updatedAt = new Date().toISOString();
  await saveAll(env, list);
  return json({ project: list[i] });
}

// DELETE /api/projects/:id -> exclui (só admin)
export async function onRequestDelete({ request, env, params }) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;
  const { list, i } = await find(env, params.id);
  if (i < 0) return json({ error: 'Projeto não encontrado.' }, 404);
  const [removed] = list.splice(i, 1);
  if ((removed.image || '').startsWith('/img/')) await env.PROJECTS.delete('img:' + removed.image.slice(5));
  await saveAll(env, list);
  return json({ ok: true });
}
