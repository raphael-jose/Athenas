# 🚀 Deploy do Athenas no GitHub Pages

Guia passo a passo para publicar o Athenas na internet (grátis, via GitHub Pages).
O repositório já vem preparado: `.gitignore` protegendo segredos, workflow de
deploy pronto (`.github/workflows/deploy.yml`) e o build 100% estático.

> ⏱️ Tempo total: ~15 minutos.

---

## 0. Pré-requisitos

- Uma conta no [GitHub](https://github.com) (grátis).
- O **Git** instalado no computador (`git --version` para conferir).

---

## 1. Crie o repositório no GitHub

1. Acesse https://github.com/new
2. **Repository name**: `athenas` (ou o nome que quiser)
3. Deixe **Private** ou **Public** — tanto faz para o Pages funcionar.
4. **NÃO** marque "Add a README" nem ".gitignore" (o projeto já tem tudo).
5. Crie o repositório.

A página seguinte mostra duas URLs. Copie a **HTTPS** do bloco
"…or push an existing repository from the command line"
(ex.: `https://github.com/SEU-USUARIO/athenas.git`).

---

## 2. Primeiro commit local

Abra o terminal **na pasta do projeto** e rode:

```bash
git add .
git commit -m "Athenas: o RPG de francês mais fofo"
```

> 🔒 **Antes de commitar, o app já está protegido:**
> - A chave da IA **nunca** está em texto puro no repositório — só em
>   fragmentos codificados (e a pasta `secrets/` é ignorada pelo Git).
> - `dist/`, `node_modules/`, `.env`, `.freebuff/` e `worker/.dev.vars`
>   também são ignorados.
>
> Confira o que entraria no commit com `git status` antes de fechar.

---

## 3. Envie para o GitHub

```bash
git remote add origin https://github.com/SEU-USUARIO/athenas.git
git branch -M main
git push -u origin main
```

(Se pedir usuário/senha, use um **Personal Access Token** — veja
[Troubleshooting](#troubleshooting) no fim.)

---

## 4. Ative o GitHub Pages

1. No repositório no GitHub: **Settings → Pages** (menu à esquerda).
2. Em **Build and deployment → Source**, escolha **GitHub Actions**.
3. Pronto — não precisa configurar mais nada.

---

## 5. (Recomendado) Adicione o secret da chave

Isso ativa a **rotação de chave por build**: cada deploy gera um payload
codificado diferente (camada extra de ofuscação).

1. GitHub → **Settings → Secrets and variables → Actions → New repository secret**.
2. **Name**: `ATHENAS_OLLAMA_KEY`
3. **Value**: a chave do Ollama
4. Salve.

> Se você pular este passo, o app usa o fallback commitado — funciona igual,
> só sem a rotação por build.

---

## 6. Acompanhe o deploy

1. No repositório, abra a aba **Actions**.
2. O workflow **"Deploy Athenas 🇫🇷 para GitHub Pages"** começa sozinho.
3. Ele roda: instala dependências → build → typecheck → **testes (150)** →
   publica a pasta `dist/`.
4. Quando ficar verde (✓), o site está no ar.

O endereço aparece na página do workflow, em **Deployment → pages**:
`https://SEU-USUARIO.github.io/athenas/`

---

## 7. Teste o site publicado

- Abra a URL no **celular** e no computador.
- Complete o onboarding (ou veja a tela de boas-vindas de quem já tem conta).
- **Instale como app:** no celular, no primeiro login aparece o modal
  "Instala o Athenas no celular 🌸" — ou faça manual: navegador →
  Compartilhar/Menu → **"Adicionar à tela inicial"**.
- Fale com a Lulu (IA): no modo offline funciona de cara; com a chave
  embutida, a IA online também já vem pronta.

---

## 8. Atualizações futuras

Depois do primeiro deploy, **toda vez que você fizer `git push` na `main`**,
o site atualiza sozinho (o workflow roda de novo):

```bash
git add .
git commit -m "novidade: ..."
git push
```

O app instalado no celular também se atualiza sozinho (Service Worker).

---

## 🔒 Modo blindado (opcional): proxy serverless

Se quiser **remover a chave do bundle** e deixar o app 100% blindado, use o
Cloudflare Worker que já está pronto na pasta `worker/`:

```bash
npx wrangler login
npx wrangler secret put OLLAMA_API_KEY   # a chave, quando pedir
npx wrangler deploy --config worker/wrangler.toml
```

Depois, no app: **Configurações → IA → Provedor: Proxy** → cole a URL do Worker.
Guia completo em [`worker/README.md`](worker/README.md).

---

## Troubleshooting

**"remote: Support for password authentication was removed"**
O GitHub não aceita mais senha no push. Crie um token:
GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained
tokens** → Generate → marque **Contents: Read and write** → use o token como senha
no push. Ou instale o [GitHub CLI](https://cli.github.com/) e rode `gh auth login`.

**O site abriu mas está sem estilo/em branco**
O deploy pode ter ficado com cache velho: abra em aba anônima ou force reload
(Ctrl+F5 no computador). Se persistir, veja a aba **Actions** por erros no build.

**Quero um nome de domínio próprio** (`athenas.com.br`…)
GitHub Pages permite domínio customizado: Settings → Pages → Custom domain
+ configurar o DNS (instruções na própria tela).

**O app instalado no celular está desatualizado**
Feche o app, abra de novo (a atualização do Service Worker acontece no
segundo carregamento) — ou remova o atalho e adicione de novo.

---

_Qualquer erro: abra uma issue no repositório ou me chame aqui. 💗_
