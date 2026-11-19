// GET /img/:name -> serve a imagem guardada no KV
export async function onRequestGet({ env, params }) {
  if (!env.PROJECTS || !/^[\w.-]+$/.test(params.name)) return new Response('Não encontrado', { status: 404 });
  const { value, metadata } = await env.PROJECTS.getWithMetadata('img:' + params.name, 'arrayBuffer');
  if (!value) return new Response('Não encontrado', { status: 404 });
  return new Response(value, {
    headers: {
      'Content-Type': (metadata && metadata.type) || 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
