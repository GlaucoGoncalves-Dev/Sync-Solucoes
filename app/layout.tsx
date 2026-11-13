import type { Metadata, Viewport } from 'next';
import '@fontsource/unbounded/500.css';
import '@fontsource/unbounded/700.css';
import '@fontsource/instrument-sans/400.css';
import '@fontsource/instrument-sans/500.css';
import '@fontsource/space-mono/400.css';
import '@fontsource/space-mono/700.css';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.syncsolucoes.com.br'),
  title: 'Sync Soluções — Sistemas sob Medida, Sites, Landing Pages e Automação',
  description: 'A Sync existe para colocar a sua empresa em ordem. Sistemas de gestão, CRM com IA, sites institucionais e landing pages de alta conversão.',
  alternates: { canonical: 'https://www.syncsolucoes.com.br' },
  openGraph: {
    title: 'Sync Soluções — Sua empresa em sincronia',
    description: 'Sistemas sob medida, sites, landing pages e automação para pequenas e médias empresas.',
    url: 'https://www.syncsolucoes.com.br',
    siteName: 'Sync Soluções',
    images: ['/m/hero-poster.jpg'],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sync Soluções — Sua empresa em sincronia',
    description: 'Sistemas sob medida, sites, landing pages e automação para pequenas e médias empresas.',
    images: ['/m/hero-poster.jpg'],
  },
};

export const viewport: Viewport = { themeColor: '#0F1614', colorScheme: 'dark', viewportFit: 'cover' };

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'Sync Soluções',
      url: 'https://www.syncsolucoes.com.br',
      email: 'syncsolucoesbr@gmail.com',
      description: 'Desenvolvimento de sistemas sob medida, sites institucionais, landing pages e automação para empresas.',
    },
    {
      '@type': 'ItemList',
      name: 'Projetos Desenvolvidos pela Sync Soluções',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'JMeuren Arquitetura', url: 'https://jmeurenarquitetura.com.br' },
        { '@type': 'ListItem', position: 2, name: 'FaixaPro', url: 'https://faixapro.com.br' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Como funciona?',
          acceptedAnswer: { '@type': 'Answer', text: 'Você fala com a Sync, a gente entende a sua rotina e constrói o sistema, site ou landing page. O trabalho começa pelo que você já usa hoje.' },
        },
        {
          '@type': 'Question',
          name: 'Preciso trocar tudo que uso hoje?',
          acceptedAnswer: { '@type': 'Answer', text: 'Não. Nada de pacote pronto nem troca de uma vez — as partes vão se juntando até a rotina andar sozinha.' },
        },
        {
          '@type': 'Question',
          name: 'E se eu não entender de tecnologia?',
          acceptedAnswer: { '@type': 'Answer', text: 'Você não precisa entender. A Sync constrói, entrega funcionando e acompanha.' },
        },
        {
          '@type': 'Question',
          name: 'Para que tipo de empresa?',
          acceptedAnswer: { '@type': 'Answer', text: 'Para pequenas e médias empresas.' },
        },
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
