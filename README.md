# Athenas 🇫🇷✨

**O RPG mais fofo para aprender francês** — do zero absoluto ao Modo Deus Supremo.

> "Estou jogando um RPG fofo enquanto, sem perceber, estou ficando fluente em francês."

Aplicativo **web/mobile-first**, **PWA instalável**, 100% estático e compatível com **GitHub Pages**.

---

## ✨ O que é

Athenas é uma plataforma gamificada de francês com:

- 🌱 **Onboarding acolhedor** — autodiagnóstico (5 perfis) + teste adaptativo que estima seu CEFR (A0 → C2)
- 🗺️ **Mapa de 15 mundos** — de *Première Rencontre* a *Native Mode* (Modo Deus Supremo 👑)
- 📖 **95 aulas jogáveis (A0–C1)** com teoria, exemplos e 7 tipos de exercício
- ⚔️ **12 boss fights** — mistura de tudo no fim de cada mundo
- 🧠 **Repetição espaçada** (SM-2) — "Aujourd'hui, ton cerveau veut réviser ça 🧠✨"
- 🧭 **Mentor** — guia pessoal: plano do dia (revisão → treino → aula), insights, dica do dia e conselho de estudos
- 🧠 **World 9 · Pensée (C1)** — hipóteses (si + conditionnel), plus-que-parfait, subjonctif passé, debate e dúvida
- 📚 **World 10 · Culture (C1)** — literatura, cinema, música, arte, história e gastronomia francesas
- 🎭 **World 11 · Expressions (C1)** — expressões idiomáticas (la fin des haricots, poser un lapin), ironia e sarcasmo, duplo sentido, gírias (bouffer, filer) e o subtexto — o que o francês *realmente* entende
- 📡 **World 12 · Immersion (C1)** — francês de verdade: o JT e a imprensa, redes sociais (faire le buzz), verlan (ouf, chelou), regionalismos (chocolatine, Quebec, septante) e a conversa real (du coup, en fait)
- 🎮 **Gamificação completa** — XP, níveis com nomes, streak acolhedor, conquistas, ✨ étoiles, missões diárias
- ⚔️ **Grammar Duel** — duelo de respostas rápidas contra a Lulu com a gramática dos tópicos liberados (timer, HP, vidas); amostragem por faixa garante que o duelo traga as perguntas do SEU nível (C1: hipóteses, subjonctif passé e concordância)
- ⚖️ **Négociation salariale** — mini-game onde a Lulu interpreta a recrutadora em 8 momentos de negociação; escolha a resposta mais estratégica (0–3 pts cada), receba a reação e a análise da Lulu, e feche o acordo em 4 desfechos possíveis (de elite a "trop gentil·le") com dicas por rodada
- 🤖 **Lulu, a professora IA** — funciona offline (MockProvider) ou com Ollama Cloud; cada resposta dela no chat tem botão **🔊 Ouvir o francês** (TTS) — a Lulu extrai só os trechos em francês da resposta e fala com a voz feminina do sistema. Quando você escreve uma frase em francês que dá para melhorar, a resposta ganha um **mini-card "Mais natural"** com a sugestão e áudio (mesma regra do modo de análise)
- 🎭 **Modo Conversa** — 9 cenários (padaria, aeroporto, hotel, café, entrevista, médico, restaurante, encontro e imprevistos) com **revisão com variações**: refazer um cenário usa falas diferentes e o feedback compara sua evolução. Cada fala da personagem tem **botão de áudio (TTS)** durante a conversa e, no feedback, o card **"Como um francês diria — ouça de novo"** permite rever e ouvir todas as falas do cenário. E agora com **🎙️ push-to-talk estilo WhatsApp**: segure o botão do microfone, fale em francês (com transcrição ao vivo), solte e a Lulu responde — vícios de fala ("euh", "tipo", "né", palavras repetidas, gaguejos) são filtrados automaticamente para a resposta soar natural. A **entrevista de emprego simulada** tem 7 perguntas do recrutador (apresentação, motivação, situação difícil, qualidades/defeitos, salário, perguntas ao recrutador e fechamento) e **feedback por competência** — cada resposta é avaliada com nota e dica (Apresentação, Motivação, Experiência, Pontos fortes, Negociação, Interesse no posto e Profissionalismo)
- 🇫🇷 **"Ça sonne français ?"** — vai além do correto: o que um francês *realmente* diria. Na **análise por regras**, escreva uma frase e a Lulu corrige com a versão mais natural — cada sugestão **"Mais natural"** tem **botão de áudio (TTS)** para ouvir como soa. Inclui o desafio **"Qui sonne français ?"**: 8 frases gramaticalmente corretas mas artificiais e você escolhe a versão natural de conversa (ne sumido, on no lugar de nous, dislocação, pergunta só com entonação…), com explicação do porquê e recompensa por naturalidade — no feedback de cada questão, a frase natural aparece **com áudio (TTS)**: ela toca sozinha e dá para repetir com um toque
- 👩‍🏫 **Modo Professor** — planos de aula, exercícios, provas e erros comuns gerados pela IA
- 📚 **Árvore de gramática** — dos pronomes às nuances avançadas
- 🎀 **Loja de étoiles** — temas, avatares e personalização (sem monetização real)
- 📡 **PWA + offline** — instala no celular, Service Worker, fallback offline, e um **modal no primeiro login** convidando a criar o atalho na tela inicial
- 🔐 **Login com memória** — sempre logada no dispositivo: ao abrir, uma tela de boas-vindas mostra quem você é (streak, nível, XP) e **onde você parou** (rota salva ou próxima aula do plano), com um toque para continuar de onde parou

## 🛠️ Stack

| Camada | Escolha |
|---|---|
| Framework | React 19 + TypeScript (strict) |
| Build | Vite 6 (`base: "./"` → funciona em qualquer subpath do Pages) |
| Roteamento | Hash router próprio (sem 404 no refresh) |
| Estado | Context + `localStorage` (persistência local; pronto para backend futuro) |
| IA | Camada `AIProvider` — Mock / Ollama / Proxy (OpenAI-compatible) |
| PWA | `vite-plugin-pwa` (manifest, icons, service worker) |
| Ícones | Phosphor Icons (bundled, offline, acompanham os temas) |
| Confetes | `canvas-confetti` |
| Testes | Vitest (65 testes) |

## 🚀 Começando

```bash
npm install        # instala dependências
npm run dev        # servidor de desenvolvimento (http://localhost:5173)
```

Scripts:

```bash
npm run dev        # dev server
npm run typecheck  # valida TypeScript (strict)
npm test           # roda os testes
npm run build      # typecheck + build de produção em dist/
npm run preview    # serve o build localmente
```

O logo: coloque um PNG na raiz do projeto (ou defina `LOGO_PATH` no `.env`).
O script `scripts/prepare.mjs` copia para `public/logo.png` e gera os ícones PWA.

## ☁️ Deploy no GitHub Pages

O repositório já vem preparado (`.gitignore` + workflow). Siga o guia
completo passo a passo em **[`DEPLOY.md`](DEPLOY.md)** — ~15 minutos:

1. Crie o repositório no GitHub e envie o código (branch `main`).
2. GitHub → **Settings → Pages → Source: GitHub Actions**.
3. (Recomendado) Secret `ATHENAS_OLLAMA_KEY` para rotação de chave por build.
4. O workflow em `.github/workflows/deploy.yml` faz: `npm ci` → `build` →
   `typecheck` → `test` (150) → publica `dist/`.

O `base: "./"` + hash routing garantem que assets e rotas funcionem em
`https://usuario.github.io/repo/` sem configuração extra.

## 🤖 Configuração da IA (Ollama)

Athenas usa **Ollama Cloud** (compatível com OpenAI `/v1/chat/completions`) através de uma
camada de abstração — o frontend nunca conversa direto com a API.

**Modo offline (padrão):** nada a configurar. A Lulu responde com conteúdo didático local.

**Pronto para usar:** o app já embarca a chave do Ollama (ofuscada em camadas —
nunca em texto puro no código ou bundle, com **semente rotativa por build** e
**checksum de integridade**) e funciona assim que abrir, sem configurar nada.
A chave embutida existe como **fallback**; o modo blindado é o proxy (abaixo).

**Modo Ollama (chave do usuário, BYOK):**
1. Perfil → Configurações → IA → Provedor: **Ollama**
2. Base URL: `https://ollama.com/api` · Modelo: `qwen3:8b` (ou seu modelo)
3. Cole sua **API key** (fica só no seu navegador) → **Testar sinal** → Salvar

**Modo Proxy (recomendado p/ produção — blindagem total):** o app já traz um
**Cloudflare Worker** pronto em `worker/` (`worker/index.mjs` + `wrangler.toml`),
que guarda a chave do Ollama como **secret do servidor** — nada de chave no
GitHub, no bundle ou no navegador. Deploy em `worker/README.md` (4 passos com
`npx wrangler`) e a arquitetura completa em `SECURITY.md`.

### Variáveis de ambiente (`.env`)

Copie `.env.example` → `.env`:

```env
VITE_AI_PROVIDER=mock        # mock | ollama | proxy
VITE_OLLAMA_BASE_URL=https://ollama.com/api
VITE_OLLAMA_MODEL=qwen3:8b
VITE_AI_PROXY_URL=           # URL do seu proxy serverless
```

> 🔒 **Não existe `VITE_OLLAMA_API_KEY` de propósito**: variável `VITE_*` vira o padrão e
> vaza no bundle público do GitHub Pages. A chave vai só no `localStorage` do navegador
> (Configurações → IA) ou atrás de um proxy serverless. Veja `SECURITY.md`.

## 🗂️ Arquitetura

```
src/
├── components/        # UI base + Mascot (Lulu) + Exercícios + Navegação
├── features/
│   ├── onboarding/    # boas-vindas + diagnóstico adaptativo
│   ├── home/          # dashboard fofo
│   ├── map/           # mapa de mundos + detalhe do mundo
│   ├── learning/      # player de aula, boss, gramática
│   ├── review/        # repetição espaçada
│   ├── ai/            # chat, conversa, "ça sonne?", professor
│   └── profile/       # perfil, conquistas, loja
├── data/              # conteúdo data-driven (mundos, aulas, palavras, cenários…)
├── hooks/             # useApp (estado global) + useSpeech (TTS)
├── services/          # storage, srs, gamificação, ai/{mock,ollama,proxy}
├── lib/               # utils, router, constantes, confetti, keyCodec
└── types/             # tipos centrais

worker/                # Cloudflare Worker (proxy seguro da IA — deploy opcional)
scripts/               # prepare.mjs + encode-key.mjs (rotação da chave por build)
```

**Conteúdo é data-driven:** novas aulas/mundos entram em `src/data/` sem tocar na interface.

## 🔐 Segurança

- Sem secrets no frontend; abstração `AIProvider` (Mock/Ollama/Proxy)
- Chave embutida **ofuscada em camadas**: fragmentos XOR+base64 gerados por build
  (semente rotativa por build + checksum de integridade em `src/lib/keyCodec.ts`)
- Teste anti-vazamento no build (`src/services/leak.test.ts` — falha se o bundle
  tiver uma chave em texto puro) e testes do proxy (`workerProxy.test.ts`)
- `worker/` com **Cloudflare Worker pronto** (chave no servidor, CORS + rate limit)
- `.env.example` documentado; `.env` e `secrets/` no `.gitignore`
- `SECURITY.md` com a arquitetura recomendada (proxy serverless + CORS + rate limit)

## 🗺️ Roadmap

**Fase atual (v1.6)** — jogável de ponta a ponta: onboarding → diagnóstico → mapa (12 mundos, 95 aulas, 12 bosses, A0–C1) → XP/níveis/streak/conquistas/missões → revisão espaçada → IA offline + Ollama → conversa (9 cenários, incluindo entrevista simulada com feedback por competência) → Grammar Duel + Négociation salariale → PWA → deploy Pages.

- [ ] Mundos 11–12 (Expressions → Immersion): conteúdo C1
- [ ] Mundo 13–15: Advanced French, Mastery e Native Mode (Modo Deus Supremo completo)
- [ ] Reconhecimento de fala e exercícios de pronúncia (arquitetura pronta via Web Speech API)
- [ ] Login/backend + sincronização (persistência já preparada para migração)
- [ ] Mais mini-games (Memory, Listening com áudio real)
- [ ] Notificações internas e lembretes carinhosos

---

Feito com 💗 — *Ton aventure française commence ici. 🌸*
