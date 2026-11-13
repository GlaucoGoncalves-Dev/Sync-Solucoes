export interface Projeto {
  id: string;
  nome: string;
  dominio: string;
  url: string;
  categoria: string;
  descricao: string;
  imagem: string;
  ativo: boolean;
}

export const STORAGE_KEY = 'sync_projetos_v1';
export const WHATSAPP_STORAGE_KEY = 'sync_whatsapp_v1';

export const PROJETOS_INICIAIS: Projeto[] = [
  {
    id: 'jmeuren',
    nome: 'JMeuren Arquitetura',
    dominio: 'jmeurenarquitetura.com.br',
    url: 'https://jmeurenarquitetura.com.br',
    categoria: 'Site Institucional & Portfólio',
    descricao: 'Arquitetura residencial, comercial e interiores com apresentação visual de projetos e captação de clientes.',
    imagem: '/m/proj-jmeuren.jpg',
    ativo: true,
  },
  {
    id: 'faixapro',
    nome: 'FaixaPro',
    dominio: 'faixapro.com.br',
    url: 'https://faixapro.com.br',
    categoria: 'SaaS & Landing Page',
    descricao: 'Sistema SaaS multi-tenant e landing page de alta conversão para gestão inteligente de academias de artes marciais.',
    imagem: '/m/proj-faixapro.jpg',
    ativo: true,
  },
];

export function getThumbnailForUrl(url: string, customImage?: string): string {
  if (customImage && customImage.trim()) return customImage.trim();
  return `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`;
}

