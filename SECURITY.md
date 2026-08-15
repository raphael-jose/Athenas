# SECURITY.md — Athenas 🇫🇷✨

Segurança da camada de IA e do deploy estático (GitHub Pages).

## Princípios

1. **Nunca coloque chaves no frontend.** Variáveis `VITE_*` são embutidas no bundle JavaScript e ficam **visíveis para qualquer pessoa** no navegador. Por isso:
   - `VITE_OLLAMA_API_KEY` **não existe** no projeto de propósito — uma chave em variável de ambiente viraria o padrão e vazaria no bundle público (GitHub Pages).
   - O padrão seguro é o usuário digitar a própria chave nas Configurações do app (fica só no `localStorage` dele) **ou** usar um proxy serverless (abaixo).
2. **Nunca commite `.env`.** O `.gitignore` já o exclui. Sempre copie `.env.example` → `.env`.
3. **Não confie no frontend para autorização.** Tudo que roda no navegador é público. Regras de negócio sensíveis (se houver) devem viver no servidor/proxy.

## Camada de abstração (`src/services/ai/`)

A interface nunca fala direto com o Ollama:

```
AIProvider
├── MockProvider   → offline, sem chave (padrão)
├── OllamaProvider → API compatível com OpenAI /v1/chat/completions
└── ProxyProvider  → endpoint serverless seu (recomendado p/ produção)
```

Trocar de provedor = mudar uma configuração (`settings.aiProvider`).

## Fluxos de chave

### A0. Chave embutida (pronto para uso — modo "instalar e usar")

O app pode vir com a chave **embutida** para funcionar de cara, sem o
usuário configurar nada. Para não deixar a chave em texto puro:

- A chave **nunca** é gravada no repositório nem no bundle como string:
  ela viaja codificada em fragmentos (XOR rotativo + base64 + inversão)
  gerados por `scripts/encode-key.mjs` e consumidos por
  `src/lib/embeddedKey.ts`/`keyCodec.ts`.
- **Rotação por build:** a semente XOR é aleatória a cada build (o
  payload codificado é regenerado em `npm run build` a partir de
  `ATHENAS_OLLAMA_KEY` ou `secrets/ollama-key.txt`). Cada deploy produz
  um blob codificado diferente — o commitado é apenas fallback.
- **Integridade:** o payload carrega um checksum (FNV-1a 64) do valor
  decodificado; se o formato ou o checksum falharem em runtime, o app
  volta para o modo BYOK/offline em vez de usar uma chave corrompida.
- Um teste de build (`src/services/leak.test.ts`) varre o `dist/` e
  falha se encontrar qualquer string no formato de chave (`32hex.secret`).
- O usuário pode trocar pela própria chave nas Configurações → IA (BYOK).

> ⚠️ **Transparência importante:** em app estático (GitHub Pages),
> **nenhuma ofuscação é 100% segura** — um atacante determinado pode
> extrair a chave do bundle com esforço. Essa camada protege contra
> vazamento acidental (grep, inspeção casual, scrapers automáticos),
> não contra alguém que queira especificamente roubá-la. Se a chave
> for de uso pessoal e o risco for aceitável, use o modo A0; para
> blindagem real, use o proxy (modo B) e revogue a chave embutida.

### A. Chave do usuário (local, simples)

O usuário cola a chave em **Perfil → Configurações → IA**.
Ela fica apenas no `localStorage` do navegador dele e é enviada direto ao
provedor **em HTTPS**. Nunca toca o seu servidor.

> ⚠️ Nenhuma chave vai parar no seu repositório, mas o navegador do usuário
> é quem guarda o segredo — é o modelo típico de apps estáticos com BYOK
> (bring-your-own-key).

### B. Proxy serverless (recomendado para produção — chave embutida vira fallback)

O frontend chama **seu** endpoint; a chave real vive só no servidor. O app
já traz o Worker pronto em **`worker/`** (`worker/index.mjs` + `wrangler.toml`
+ passo a passo em `worker/README.md`), com:

- **Chave como secret do Worker** (`wrangler secret put OLLAMA_API_KEY`) —
  nunca no código, nunca no GitHub, nunca no bundle.
- **CORS restrito** à origem do seu GitHub Pages (`ALLOWED_ORIGINS`).
- **Rate limit** por IP (`RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW`, padrão 30/min).
- Resposta no shape do app: `POST {url}/v1/chat/completions → {"content":"…"}`.

Deploy:
```bash
npx wrangler login
npx wrangler secret put OLLAMA_API_KEY   # a chave, quando pedir
npx wrangler deploy --config worker/wrangler.toml
```

No app: **Configurações → IA → Provedor: Proxy** e cole a URL do Worker
(com o proxy no ar, a API Key pode ficar vazia). Testado por
`src/services/workerProxy.test.ts` (CORS, rate limit, chave ausente, upstream 429).

> 🔁 **Modo "blindado total":** com o proxy funcionando, você pode revogar/
> remover a chave embutida (modo A0) — o app passa a usar só o proxy e a
> chave deixa de existir em qualquer artefato público. A embutida existe
> apenas como **fallback** para o app funcionar de cara sem configuração.

## Checklist de segurança

- [ ] `.env` fora do repositório (`.gitignore` já cuida disso)
- [ ] Nenhuma `API key` em código-fonte, commits ou issues
- [ ] Produção usando **Proxy serverless** ou **chave do usuário (BYOK)**
- [ ] CORS limitado ao seu domínio no proxy
- [ ] Rate limiting no proxy
- [ ] Conexões sempre **HTTPS**

## Relatório de vulnerabilidade

Abra uma issue no repositório descrevendo o problema. Não inclua chaves reais.

---

_Athenas é um projeto educacional sem monetização real. As ✨ étoiles são puramente cosméticas e vivem no navegador._
