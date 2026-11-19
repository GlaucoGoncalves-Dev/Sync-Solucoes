import { json, requireAdmin, isAuthed } from '../_lib/auth.js';
import { DEFAULTS, loadAll, saveAll, sortProjects, clean, newId } from '../_lib/projects.js';

// GET /api/projects        -> projetos publicados (público)
// GET /api/projects?all=1  -> todos, inclusive rascunhos (só admin)
export async function onRequestGet({ request, env }) {
  if (!env.PROJECTS) return json({ projects: sortProjects(DEFAULTS) }, 200, { 'Cache-Control': 'public, max-age=60' });
  const all = new URL(request.url).searchParams.get('all') === '1';
  const list = sortProjects(await loadAll(env));
  if (all) {
    if (!(await isAuthed(request, env))) return json({ error: 'Sessão expirada. Entre de novo.' }, 401);
    return json({ projects: list });
  }
  return json({ projects: list.filter((p) => p.published) }, 200, { 'Cache-Control': 'public, max-age=60' });
}

// POST /api/projects -> cria projeto (só admin)
export async function onRequestPost({ request, env }) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Dados inválidos.' }, 400); }
  const { value, error } = clean(body);
  if (error) return json({ error }, 400);
  const list = await loadAll(env);
  value.id = newId(value.title);
  if (value.order === 999) value.order = list.length + 1;
  list.push(value);
  await saveAll(env, list);
  return json({ project: value }, 201);
}
