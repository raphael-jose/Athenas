# ☁️ Athenas — Proxy seguro da IA (Cloudflare Worker)

O **modo mais blindado** do Athenas: a chave do Ollama vive **só aqui, no servidor**
— nunca no GitHub, nunca no bundle, nunca no navegador. O app (GitHub Pages)
chama este Worker, e o Worker fala com o Ollama em nome do app.

> A chave embutida do app continua existindo **apenas como fallback** (app
> funciona de cara, sem configurar nada). Com o proxy no ar, você pode até
> apagar a chave embutida do navegador — o app passa a usar só o proxy.

## Deploy em 4 passos

1. **Instale o Wrangler** (uma vez):
   ```bash
   npm i -g wrangler   # ou use npx wrangler
   ```

2. **Faça login na Cloudflare** (conta gratuita serve):
   ```bash
   npx wrangler login
   ```

3. **Guarde a chave do Ollama como secret** (nunca vai para o repo):
   ```bash
   npx wrangler secret put OLLAMA_API_KEY
   # cole a chave quando pedir
   ```

4. **Faça o deploy**:
   ```bash
   npx wrangler deploy --config worker/wrangler.toml
   ```
   Ele imprime a URL final, algo como:
   `https://athenas-ai-proxy.SEU-SUBDOMINIO.workers.dev`

## ⚙️ Configure o app para usar o proxy

No app (Perfil → Configurações → IA):
1. **Provedor → Proxy**
2. **URL do proxy**: a URL do Worker (ex.: `https://athenas-ai-proxy.SEU-SUBDOMINIO.workers.dev`)
3. **Testar sinal** → deve aparecer a resposta da Lulu.
4. **API Key pode ficar vazia** — a chave vive no servidor.

## 🔒 CORS (importante!)

Em produção, limite as origens permitidas para o seu app. No dashboard da
Cloudflare (Workers → athenas-ai-proxy → Settings → Variables) ou editando
`worker/wrangler.toml`:

```toml
ALLOWED_ORIGINS = "https://SEU-USUARIO.github.io"
```

- Vazio = aceita **qualquer origem** (use só em dev).
- Várias origens: separadas por vírgula.
- O Worker bloqueia chamadas de outras origens com `403`.

## 🛡️ Rate limit

Por padrão: **30 requisições por IP por minuto** (variáveis `RATE_LIMIT_MAX` /
`RATE_LIMIT_WINDOW`). Protege contra abuso e queima de créditos da sua chave.

## 🧪 Testar localmente

```bash
cp worker/.dev.vars.example worker/.dev.vars   # e preencha a chave
npx wrangler dev --config worker/wrangler.toml
```

Teste rápido:
```bash
curl -X POST http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"default","messages":[{"role":"user","content":"Dis bonjour !"}]}'
# → {"content":"Bonjour ! ..."}
```

## 🔁 Alternativas equivalentes

A mesma arquitetura (o `ProxyProvider` do app só precisa de um endpoint
`POST /v1/chat/completions` que devolva `{"content":"…"}`) funciona com:
Vercel Functions, Netlify Functions, Deno Deploy, ou um servidorzinho Node seu.
