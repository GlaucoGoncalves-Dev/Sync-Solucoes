# Site da Sync Soluções — publicação na Cloudflare

O site é publicado no **Cloudflare Pages**. A área admin (`/admin`) usa:

- **Pages Functions**: a pasta `functions/`, que é a API.
- **Cloudflare KV**: onde ficam os projetos e as imagens.

## O que tem aqui

| Pasta / arquivo | O que é |
|---|---|
| `public/` | O site (`index.html`), a área admin (`admin/index.html`) e as imagens, fontes e vídeo (`assets/`). |
| `functions/` | A API dos projetos: login, cadastrar, editar, excluir, publicar e enviar imagem. |
| `wrangler.toml` | Configuração do projeto. Ligue aqui o KV. |
| `.dev.vars.exemplo` | Modelo das variáveis para testar no computador. |

## Publicar (uma vez)

**1. Crie o KV.**
- No painel da Cloudflare, vá em **Storage & Databases → KV → Create** e dê o nome `sync-projetos`.
- Copie o **ID** do namespace e cole no `wrangler.toml`, no lugar de `COLOQUE_AQUI_O_ID_DO_KV`.

**2. Publique.** Escolha um dos caminhos:

- **Pelo terminal:**
  ```
  npx wrangler login
  npx wrangler pages deploy
  ```
  O nome do projeto (`sync-solucoes`) e a pasta (`public`) já estão no `wrangler.toml`.
- **Pelo GitHub:**
  - Suba esta pasta num repositório e conecte em **Workers & Pages → Create → Pages → Connect to Git**.
  - Use *Build command* vazio e *Build output directory* = `public`.
  - Depois, em **Settings → Bindings**, adicione o KV com o nome de variável `PROJECTS`.

**3. Crie as duas variáveis secretas.** Vá em **Workers & Pages → sync-solucoes → Settings → Variables and Secrets → Add** e crie:

| Nome | Tipo | Valor |
|---|---|---|
| `ADMIN_PASSWORD` | Secret | A senha que você vai usar no `/admin` |
| `SESSION_SECRET` | Secret | Um texto longo e aleatório, com 32 caracteres ou mais. Ninguém precisa decorar. |

Também pelo terminal:
```
npx wrangler pages secret put ADMIN_PASSWORD
npx wrangler pages secret put SESSION_SECRET
```

**4. Publique de novo** (`npx wrangler pages deploy`) para as variáveis valerem.

**5. Ligue o domínio.** Em **Custom domains**, aponte `syncsolucoes.com.br`.

## Usar a área admin

1. Abra `https://syncsolucoes.com.br/admin` e entre com a senha.
2. Use **Novo projeto** para cadastrar. **Editar** altera um projeto, e **Despublicar** o esconde do site sem apagar. **Excluir** remove o projeto e a imagem dele, e não dá para desfazer.
3. A imagem de capa é reduzida no navegador antes do envio (até 1600 px). Prints de 16:10 ficam melhores.
4. A **ordem** define a posição no site: o menor número aparece primeiro.
5. As alterações aparecem no site em até 1 minuto (cache).

Os dois projetos atuais (J.Meuren e FaixaPro) já aparecem cadastrados no primeiro acesso. Se todos os projetos forem despublicados ou excluídos, a seção "Projetos" some do site.

## Testar no computador (opcional)

```
cp .dev.vars.exemplo .dev.vars    # troque a senha
npx wrangler pages dev
```
Depois abra http://localhost:8788 e http://localhost:8788/admin.

## Segurança

- A senha nunca fica no código. Ela vive só nas variáveis secretas da Cloudflare.
- O login cria uma sessão de 12 horas num cookie protegido (`HttpOnly`, `SameSite=Strict`, `Secure`).
- Toda alteração exige a sessão e só é aceita quando vem do próprio site.
- Tentativas de senha errada demoram cerca de 1 segundo para responder.
- Para mais proteção, dá para colocar o `/admin` atrás do **Cloudflare Access** (Zero Trust), que é gratuito para poucos usuários.
- Não envie o arquivo `.dev.vars` para o GitHub.
