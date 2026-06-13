# 🏆 Bolão dos Babes — Copa do Mundo 2026

App de bolão entre amigos (PWA, instala na tela inicial do iPhone). Cada pessoa entra com **usuário + senha** (a senha é guardada com hash, nunca em texto puro).

## Os 3 bolões

1. **🇧🇷 Bolão do Brasil** — palpite só nos jogos do Brasil.
2. **🌎 Bolão Completo** — palpite em todos os jogos da Copa.
3. **🏆 Bolão do Campeão** — quem levanta a taça em 2026.

## Pontuação (padrão de bolão)

- **Placar exato:** 5 pontos
- **Acertou só o vencedor (ou empate):** 2 pontos
- **Campeão da Copa:** 10 pontos

Dá pra mudar esses valores no código (`data.js`, `PONTUACAO_PADRAO`).

### Palpite por jogo (dois campos)

Em cada jogo a pessoa preenche **os dois**, obrigatórios:

- **Quem vence** — vitória de um lado ou empate → +2 se acertar.
- **Placar exato** — o placar do jogo → +5 se acertar.

Os dois são contados de forma independente (dá para somar 7 num jogo). Não dá para salvar com algum dos dois em branco.

**Trava no apito:** cada jogo tem um **horário de início**. Você pode salvar e **editar** seu palpite à vontade até esse horário; quando o jogo começa, trava sozinho. Já o **palpite de campeão trava ao confirmar** — depois não pode ser alterado.

Os horários vêm com valores padrão (horário de Brasília) e são **editáveis no Painel Admin**, jogo a jogo — ajuste para os horários oficiais.

## Como funciona

- Cada pessoa cria uma conta com **usuário (único) + senha** e dá seus palpites de placar.
- O ranking é calculado sozinho, com 4 abas: **Geral** (soma tudo: jogos + campeão), **Completo** (só os jogos), **Brasil** (só jogos do Brasil) e **Campeão**.
- Os palpites travam automaticamente quando o jogo já tem resultado lançado.

### Login e senha

- Na tela inicial há "Entrar" e "Criar agora".
- O usuário tem que ser único (3 a 20 caracteres, letras/números). A senha precisa ter no mínimo 8 caracteres, com letras e números.
- A senha é guardada com **hash PBKDF2 + salt** — nem você nem o Supabase veem a senha original. Por isso ela **não pode ser recuperada**; se alguém esquecer, é só criar outra conta (ou você apaga a linha do usuário no Supabase).

### Admin (só você vê)

- O Painel Admin (aba 🛠️) **só aparece para contas de administrador**. Os outros usuários nem enxergam.
- Para virar admin: na tela "Criar conta", preencha o campo **Código de admin** com o valor de `ADMIN_CODE` (em `config.js`, padrão `babes-admin-2026` — troque pelo seu).
- No admin você **lança os placares**, **define o campeão** e **adiciona jogos do mata-mata** (oitavas, quartas, semi, final).
- Dica: crie sua conta admin primeiro e guarde o código só com você.

## Modo local x compartilhado

- **Modo local (padrão, sem configurar nada):** funciona na hora, mas os palpites ficam só no aparelho. Ótimo pra testar.
- **Modo compartilhado (recomendado):** todos veem o mesmo ranking. Precisa configurar o Supabase (grátis, ~5 min) — passo a passo abaixo.

### Ativar o modo compartilhado (Supabase grátis)

1. Crie uma conta em <https://supabase.com> e um **novo projeto** (plano gratuito).
2. Vá em **SQL Editor**, abra o arquivo **`supabase-schema.sql`** desta pasta, cole tudo e clique em **RUN**. Isso cria as tabelas `usuarios`, `palpites` e `config` e libera o acesso.
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
| `config.js` | Config do Supabase (url + anonKey) + código de admin |
| `supabase-schema.sql` | SQL para criar as tabelas no Supabase |
| `vercel.json` | Cabeçalhos para deploy na Vercel |
| `styles.css` | Visual |
| `manifest.json` + `sw.js` + `icon.svg` | PWA (instalável/offline) |

(O arquivo `firebase-config.js` ficou obsoleto e pode ser apagado.)

## Ajustar os jogos

Os 72 jogos da fase de grupos são gerados a partir dos grupos em `data.js`. Se algum confronto, data ou seleção estiver diferente da tabela oficial, é só corrigir em `data.js` (grupos/datas) **ou** pelo Painel Admin no app. Os jogos do mata-mata você adiciona pelo Admin quando os times se definirem.

Alguns resultados já jogados vêm pré-carregados em `data.js` (`RESULTADOS_INICIAIS`): México 2×0 África do Sul, Coreia do Sul 2×1 Rep. Tcheca, Canadá 1×1 Bósnia e Estados Unidos 4×1 Paraguai. Dá pra editar qualquer um pelo Painel Admin.
