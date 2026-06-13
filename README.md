# 🏆 Bolão dos Babes — Copa do Mundo 2026

App de bolão entre amigos (PWA, instala na tela inicial do iPhone). Sem dados sensíveis, sem senha — cada pessoa entra só com um nome de usuário.

## Os 3 bolões

1. **🇧🇷 Bolão do Brasil** — palpite só nos jogos do Brasil.
2. **🌎 Bolão Completo** — palpite em todos os jogos da Copa.
3. **🏆 Bolão do Campeão** — quem levanta a taça em 2026.

## Pontuação (padrão de bolão)

- **Placar exato:** 5 pontos
- **Acertou só o vencedor (ou empate):** 2 pontos
- **Campeão da Copa:** 10 pontos

Dá pra mudar esses valores no código (`data.js`, `PONTUACAO_PADRAO`).

## Como funciona

- Cada pessoa escolhe um **nome de usuário** e dá seus palpites de placar.
- Você (admin) lança os **resultados oficiais** no Painel Admin (engrenagem ⚙️).
- O ranking é calculado sozinho, com abas: Geral, Brasil e Campeão.
- O painel admin também deixa **definir o campeão** e **adicionar jogos do mata-mata** (oitavas, quartas, semi, final) conforme forem definidos.
- Senha do admin: `babes2026` (troque em `firebase-config.js`, campo `ADMIN_SENHA`).

## Modo local x compartilhado

- **Modo local (padrão, sem configurar nada):** funciona na hora, mas os palpites ficam só no aparelho. Ótimo pra testar.
- **Modo compartilhado (recomendado):** todos veem o mesmo ranking. Precisa configurar o Supabase (grátis, ~5 min) — passo a passo abaixo.

### Ativar o modo compartilhado (Supabase grátis)

1. Crie uma conta em <https://supabase.com> e um **novo projeto** (plano gratuito).
2. Vá em **SQL Editor**, abra o arquivo **`supabase-schema.sql`** desta pasta, cole tudo e clique em **RUN**. Isso cria as tabelas `palpites` e `config` e libera o acesso público (sem login).
3. Vá em **Project Settings → Data API** (ou **API**) e copie:
   - **Project URL**
   - chave **anon public**
4. Abra **`config.js`** e cole nos campos `url` e `anonKey` (no lugar dos `SEU_...`).
5. Pronto — ao abrir o app, aparece "🟢 Ranking compartilhado ativo".

> A chave **anon public** é feita para ficar no front-end, não é segredo. Quem controla o acesso são as políticas (RLS) já criadas pelo schema.

## Como publicar na Vercel (para todos acessarem pelo link)

O app é só arquivos estáticos — a Vercel serve direto, sem build.

**Opção A — pelo site (mais fácil):**
1. Suba esta pasta para um repositório no GitHub.
2. Em <https://vercel.com> → **Add New → Project** → importe o repositório.
3. Framework Preset: **Other**. Não precisa configurar build nem output. Clique em **Deploy**.
4. Você recebe um link `https://...vercel.app` para compartilhar.

**Opção B — pelo terminal:**
```bash
npm i -g vercel
cd Bolaoamigos
vercel        # segue o assistente; depois `vercel --prod` para publicar
```

Já incluí um `vercel.json` com os cabeçalhos certos para o service worker e o manifest.

> O PWA (instalar na tela inicial) só funciona por **https://** — o link da Vercel já é https. Abrir o arquivo direto do computador (`file://`) serve pra testar, mas não instala como app.

## Instalar no iPhone (tela inicial)

1. Abra o link do app no **Safari**.
2. Toque no botão **Compartilhar** (quadrado com seta pra cima).
3. **Adicionar à Tela de Início**.
4. O ícone do troféu aparece como um app. Abrindo por ali, roda em tela cheia, sem barra do navegador.

(No Android é parecido, pelo menu do Chrome → "Instalar app".)

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | Página principal |
| `app.js` | Toda a lógica (telas, palpites, pontuação, admin, ranking) |
| `data.js` | Grupos, jogos, bandeiras, regras de pontuação |
| `config.js` | Config do Supabase (url + anonKey) + senha do admin |
| `supabase-schema.sql` | SQL para criar as tabelas no Supabase |
| `vercel.json` | Cabeçalhos para deploy na Vercel |
| `styles.css` | Visual |
| `manifest.json` + `sw.js` + `icon.svg` | PWA (instalável/offline) |

(O arquivo `firebase-config.js` ficou obsoleto e pode ser apagado.)

## Ajustar os jogos

Os 72 jogos da fase de grupos são gerados a partir dos grupos em `data.js`. Se algum confronto, data ou seleção estiver diferente da tabela oficial, é só corrigir em `data.js` (grupos/datas) **ou** pelo Painel Admin no app. Os jogos do mata-mata você adiciona pelo Admin quando os times se definirem.
