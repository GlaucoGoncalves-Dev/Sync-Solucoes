// Armazenamento dos projetos no Cloudflare KV (binding: PROJECTS).
//   chave "projects"  -> lista JSON de projetos
//   chave "img:<id>"  -> bytes da imagem de capa (metadata.type = content-type)

export const DEFAULTS = [
  {
    id: 'jmeuren',
    title: 'J.Meuren Arquitetura & Interiores',
    tags: ['Site institucional', 'Portfólio 3D'],
    meta1Label: 'Segmento', meta1Value: 'Arquitetura',
    meta2Label: 'Local', meta2Value: 'Brasília, DF',
    description: 'Site do estúdio de arquitetura de Brasília, com croquis em nanquim, portfólio de projetos em carrossel 3D e uma experiência sonora opcional.',
    url: 'https://www.jmeurenarquitetura.com.br',
    image: '/assets/proj-jmeuren.jpg',
    imageAlt: 'Tela inicial do site J.Meuren Arquitetura & Interiores',
    order: 1, published: true, updatedAt: '2026-11-18T00:00:00.000Z',
  },
  {
    id: 'faixapro',
    title: 'FaixaPro',
    tags: ['Sistema SaaS', 'Landing page'],
    meta1Label: 'Segmento', meta1Value: 'Artes marciais',
    meta2Label: 'Entrega', meta2Value: 'Sistema + site',
    description: 'Sistema de gestão para academias de artes marciais: presença pelo celular, mensalidades com lembrete no WhatsApp, graduação de faixas e cadastro de alunos.',
    url: 'https://www.faixapro.com.br',
    image: '/assets/proj-faixapro.jpg',
    imageAlt: 'Tela inicial do site FaixaPro',
    order: 2, published: true, updatedAt: '2026-11-18T00:00:00.000Z',
  },
];

export async function loadAll(env) {
  const list = await env.PROJECTS.get('projects', 'json');
  return Array.isArray(list) ? list : DEFAULTS.map((p) => ({ ...p }));
}

export async function saveAll(env, list) {
  await env.PROJECTS.put('projects', JSON.stringify(list));
}

export const sortProjects = (list) => [...list].sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.title.localeCompare(b.title, 'pt-BR'));

const clip = (v, n) => String(v ?? '').trim().slice(0, n);

// Valida e normaliza o que vem do formulário. Retorna { value } ou { error }.
export function clean(input, existing = {}) {
  const p = { ...existing };
  p.title = clip(input.title, 120);
  if (!p.title) return { error: 'Informe o nome do projeto.' };
  const url = clip(input.url, 300);
  if (url && !/^https?:\/\/[^\s]+\.[^\s]+$/i.test(url)) return { error: 'O link precisa começar com https:// e ser um endereço válido.' };
  p.url = url;
  p.description = clip(input.description, 600);
  if (!p.description) return { error: 'Escreva uma descrição curta do projeto.' };
  const tags = Array.isArray(input.tags) ? input.tags : String(input.tags ?? '').split(',');
  p.tags = tags.map((t) => clip(t, 40)).filter(Boolean).slice(0, 4);
  p.meta1Label = clip(input.meta1Label, 30); p.meta1Value = clip(input.meta1Value, 60);
  p.meta2Label = clip(input.meta2Label, 30); p.meta2Value = clip(input.meta2Value, 60);
  p.imageAlt = clip(input.imageAlt, 160) || `Tela do projeto ${p.title}`;
  const order = Number.parseInt(input.order, 10);
  p.order = Number.isFinite(order) ? Math.max(0, Math.min(999, order)) : (existing.order ?? 999);
  p.published = input.published === undefined ? (existing.published ?? true) : Boolean(input.published);
  if (typeof input.image === 'string' && (input.image === '' || /^\/(img|assets)\/[\w.\-/]+$/.test(input.image))) p.image = input.image;
  p.updatedAt = new Date().toISOString();
  return { value: p };
}

export function newId(title) {
  const base = String(title).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'projeto';
  return `${base}-${crypto.randomUUID().slice(0, 6)}`;
}
