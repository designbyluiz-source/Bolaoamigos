/* ============================================================
   CONFIGURAÇÃO DO SUPABASE (ranking compartilhado entre todos)
   ------------------------------------------------------------
   COMO ATIVAR O MODO COMPARTILHADO:

   1. Crie uma conta grátis em  https://supabase.com  e um novo projeto.
   2. No painel do projeto, vá em "Project Settings" (engrenagem) >
      "Data API" (ou "API"). Copie:
         - "Project URL"      -> cole em `url`
         - chave "anon public"-> cole em `anonKey`
   3. Vá no "SQL Editor", cole o conteúdo do arquivo
      `supabase-schema.sql` e clique em RUN (cria as tabelas e libera
      o acesso público, sem login).
   4. Preencha os valores abaixo no lugar dos "SEU_...".

   Enquanto estiver com "SEU_...", o app roda em MODO LOCAL (só neste
   aparelho, ótimo para testar). Ao preencher, vira compartilhado.

   Obs: a chave "anon public" é feita para ficar no front-end — não é
   segredo. Quem controla o que pode ser lido/escrito são as políticas
   (RLS) do schema.
   ============================================================ */

window.SUPABASE_CONFIG = {
  url: "SEU_PROJECT_URL",        // ex: https://abcdxyz.supabase.co
  anonKey: "SEU_ANON_PUBLIC_KEY" // chave "anon public"
};

// Senha simples para abrir o Painel Admin (troque por algo seu).
// Não é segurança forte — só evita que qualquer um edite os resultados.
window.ADMIN_SENHA = "babes2026";
