# Sync Soluções — página (design package v1)

Next.js 15 + React 19, exportada como site estático. É a réplica do protótipo aprovado (`modelo-prototipo-claude/`): mesmos textos, mesma ordem das seções (Topo, Quem, Rotina, Áreas, Segure, Perguntas, Fechamento) e a mesma rolagem.

## Rodar no computador

Requisito: Node 18.18 ou mais novo.

```
npm install
npm run dev        # abre em http://localhost:3000
```

## Gerar o site

```
npm run build      # gera a pasta out/ (HTML, CSS, JS e vídeos)
npm start          # serve a pasta out/ para conferir
```

## Publicar em endereço temporário (nunca na raiz antes do ok)

Os dois caminhos usam o Cloudflare Pages e geram um endereço `*.pages.dev`, que é o endereço temporário do package (§9 e §10).

- **Upload direto (sem GitHub):** no painel da Cloudflare, abra Workers & Pages › Create › Pages › Upload assets e envie a pasta `out/`. O pacote `site-pronto-out.zip` já traz essa pasta pronta.
- **Pelo GitHub:** suba este projeto num repositório e conecte no Cloudflare Pages com estas configurações:
  - Framework preset: Next.js (Static HTML Export)
  - Build command: `npx next build`
  - Build output directory: `out`
  - Variável de ambiente: `NODE_VERSION = 20`

O domínio `www.syncsolucoes.com.br` só deve ser ligado ao projeto depois do ok separado para trocar a raiz.

## Onde está cada coisa

- `app/page.tsx`: todas as seções e os textos (copiados do protótipo, caractere por caractere).
- `app/components/`:
  - `Loader`: o "SYNC" acendendo letra por letra.
  - `HeroVideo`: o vídeo do herói, que fica parado no poster quando o sistema pede menos movimento.
  - `ScrollEffects`: os efeitos de rolagem.
  - `Segure`: a interação do botão.
  - `CopyEmail`: o botão de copiar o e-mail.
- `app/contato.ts`: o e-mail, que fica num lugar só.
- `app/globals.css`: o CSS do protótipo.
- `public/m/`: o vídeo do herói, o poster e as 4 mini-animações das Áreas, recortadas do motion reel.

## Marcação para o vídeo de divulgação

A página já sai com os atributos `data-flyover` que o kit de render do fly-over usa: `hero`, `second-title`, `card` (12 itens), `stand` (o botão Segure) e `footer-title`. Para filmar, basta pôr o endereço temporário no `url` do `flyover.config.json` do kit.

## Observações

- As fontes (Unbounded, Space Grotesk, Space Mono) vêm do pacote @fontsource e são servidas pelo próprio site, sem chamar o Google na hora de abrir a página.
- O `npm audit` ainda aponta o PostCSS e o sharp que vêm dentro do Next. O PostCSS só roda na hora do build, sobre o CSS do próprio projeto. O sharp serve para otimizar imagens no servidor, o que não acontece num site estático.
