/* ============================================================
   BOLÃO DOS BABES — App (Copa do Mundo 2026)
   Login (username único + senha com hash) via Supabase, ou modo
   LOCAL (localStorage) para testar sem configurar nada.
   ============================================================ */
(function () {
  "use strict";

  const D = window.BOLAO_DATA;
  const CFG = window.SUPABASE_CONFIG || {};
  const ADMIN_CODE = window.ADMIN_CODE || "";

  /* ---------- detecta modo compartilhado (Supabase) ---------- */
  const supaOK =
    typeof window.supabase !== "undefined" &&
    CFG.url && !String(CFG.url).startsWith("SEU_") &&
    CFG.anonKey && !String(CFG.anonKey).startsWith("SEU_");

  let sb = null;
  if (supaOK) {
    try { sb = window.supabase.createClient(CFG.url, CFG.anonKey); }
    catch (e) { console.warn("Supabase falhou, usando modo local:", e); }
  }
  const MODO = sb ? "compartilhado" : "local";

  /* ============================================================
     CRIPTOGRAFIA DE SENHA (PBKDF2; nunca guarda texto puro)
     ============================================================ */
  function bufToB64(buf){ const b=new Uint8Array(buf); let s=""; for(const x of b) s+=String.fromCharCode(x); return btoa(s); }
  function b64ToBuf(b64){ const s=atob(b64); const a=new Uint8Array(s.length); for(let i=0;i<s.length;i++) a[i]=s.charCodeAt(i); return a; }
  async function derivar(senha, saltB64){
    if (typeof crypto !== "undefined" && crypto.subtle){
      const salt = saltB64 ? b64ToBuf(saltB64) : crypto.getRandomValues(new Uint8Array(16));
      const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(senha), { name:"PBKDF2" }, false, ["deriveBits"]);
      const bits = await crypto.subtle.deriveBits({ name:"PBKDF2", salt, iterations:120000, hash:"SHA-256" }, key, 256);
      return { hash: bufToB64(bits), salt: bufToB64(salt) };
    }
    // fallback p/ contexto inseguro (ex: abrir via file://) — menos seguro
    const salt = saltB64 || "fb";
    let h = 5381; const str = salt + "|" + senha;
    for (let i=0;i<str.length;i++){ h = ((h<<5)+h) + str.charCodeAt(i); h |= 0; }
    return { hash: "fb_" + (h>>>0).toString(16), salt };
  }
  function senhaForte(s){ return s.length >= 8 && /[A-Za-z]/.test(s) && /[0-9]/.test(s); }

  /* ============================================================
     CAMADA DE DADOS (mesma interface nos dois modos)
     ============================================================ */
  const LS = {
    get(k, def) { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } },
    set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
  };

  const Store = {
    /* ---- usuários ---- */
    async getUsuario(username){
      const id = username.toLowerCase();
      if (sb){
        const { data, error } = await sb.from("usuarios").select("*").eq("username", id).maybeSingle();
        if (error){ console.warn(error); return null; }
        return data || null;
      }
      return LS.get("babes_usuarios", {})[id] || null;
    },
    async criarUsuario(row){
      if (sb){
        const { error } = await sb.from("usuarios").insert(row);
        if (error) throw error;
      } else {
        const map = LS.get("babes_usuarios", {});
        if (map[row.username]) throw new Error("duplicate");
        map[row.username] = row; LS.set("babes_usuarios", map);
      }
    },
    /* ---- resultados/config ---- */
    async getResultados() {
      if (sb) {
        const { data, error } = await sb.from("config").select("data").eq("id", "resultados").maybeSingle();
        if (error) { console.warn(error); return {}; }
        return (data && data.data) || {};
      }
      return LS.get("babes_resultados", {});
    },
    async saveResultados(partial) {
      if (sb) {
        const atual = await this.getResultados();
        const merged = Object.assign({}, atual, partial);
        const { error } = await sb.from("config").upsert({ id: "resultados", data: merged });
        if (error) { console.warn(error); toast("Erro ao salvar (veja o console)"); }
      } else {
        const atual = LS.get("babes_resultados", {});
        LS.set("babes_resultados", Object.assign({}, atual, partial));
      }
    },
    /* ---- palpites ---- */
    async getAllPalpites() {
      if (sb) {
        const { data, error } = await sb.from("palpites").select("data");
        if (error) { console.warn(error); return []; }
        return (data || []).map((r) => r.data).filter(Boolean);
      }
      return Object.values(LS.get("babes_palpites", {}));
    },
    async getPalpite(username) {
      const id = username.toLowerCase();
      if (sb) {
        const { data, error } = await sb.from("palpites").select("data").eq("id", id).maybeSingle();
        if (error) { console.warn(error); return null; }
        return data ? data.data : null;
      }
      return LS.get("babes_palpites", {})[id] || null;
    },
    async savePalpite(username, partial) {
      const id = username.toLowerCase();
      if (sb) {
        const atual = (await this.getPalpite(id)) || {};
        const doc = Object.assign({ id }, atual, partial, { updatedAt: Date.now() });
        const { error } = await sb.from("palpites").upsert({ id, data: doc });
        if (error) { console.warn(error); toast("Erro ao salvar (veja o console)"); }
      } else {
        const map = LS.get("babes_palpites", {});
        const doc = Object.assign({ id }, map[id] || {}, partial, { updatedAt: Date.now() });
        map[id] = doc; LS.set("babes_palpites", map);
      }
    },
  };

  /* ============================================================
     ESTADO
     ============================================================ */
  const State = {
    auth: LS.get("babes_auth", null),  // { username, nome, is_admin }
    view: "home",
    resultados: {},
    meuPalpite: null,
    palpites: [],
  };

  function pontuacao() { return Object.assign({}, D.PONTUACAO_PADRAO, State.resultados.pontuacao || {}); }
  // resultados reais = jogos já jogados (base) + lançamentos do admin
  function resultadosReais() { return Object.assign({}, D.RESULTADOS_INICIAIS || {}, State.resultados.jogos || {}); }

  function jogosEfetivos() {
    const edits = State.resultados.edits || {};
    const base = D.JOGOS_BASE.map((j) => Object.assign({}, j, edits[j.id] || {}));
    const custom = (State.resultados.custom || []).map((j) => Object.assign({ fase: "mata", grupo: "—" }, j));
    return base.concat(custom);
  }
  function jogosDoBrasil() {
    return jogosEfetivos().filter((j) => j.casa === D.TIME_BRASIL || j.fora === D.TIME_BRASIL);
  }

  /* ============================================================
     PONTUAÇÃO
     ============================================================ */
  function sinal(a, b) { return a > b ? 1 : a < b ? -1 : 0; }
  function pontosJogo(palpiteJogo, real, P) {
    if (!palpiteJogo || !real) return { pts: 0, tag: "aberto" };
    if (real.c == null || real.f == null) return { pts: 0, tag: "aberto" };
    if (palpiteJogo.c == null || palpiteJogo.f == null) return { pts: 0, tag: "zero" };
    const pc = +palpiteJogo.c, pf = +palpiteJogo.f, rc = +real.c, rf = +real.f;
    if (pc === rc && pf === rf) return { pts: P.placarExato, tag: "exato" };
    if (sinal(pc, pf) === sinal(rc, rf)) return { pts: P.vencedor, tag: "parcial" };
    return { pts: 0, tag: "zero" };
  }
  function calcular(palpite) {
    const P = pontuacao();
    const real = resultadosReais();
    const jogos = jogosEfetivos();
    const brasilIds = new Set(jogosDoBrasil().map((j) => j.id));
    let completo = 0, brasil = 0, exatos = 0, parciais = 0;
    const pj = (palpite && palpite.jogos) || {};
    jogos.forEach((j) => {
      const r = pontosJogo(pj[j.id], real[j.id], P);
      completo += r.pts;
      if (brasilIds.has(j.id)) brasil += r.pts;
      if (r.tag === "exato") exatos++;
      if (r.tag === "parcial") parciais++;
    });
    let campeao = 0;
    if (State.resultados.campeao && palpite && palpite.campeao === State.resultados.campeao) campeao = P.campeao;
    return { completo, brasil, campeao, total: completo + campeao, exatos, parciais };
  }

  /* ============================================================
     HELPERS DE UI
     ============================================================ */
  const root = () => document.getElementById("root");
  const flag = (t) => D.BANDEIRAS[t] || "🏳️";
  function fmtData(iso){ if(!iso) return ""; const [y,m,d]=iso.split("-"); return `${d}/${m}`; }
  function toast(msg){ const t=document.getElementById("toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(toast._t); toast._t=setTimeout(()=>t.classList.remove("show"),2000); }
  function esc(s){ return String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  /* ============================================================
     TELA: LOGIN / CRIAR CONTA
     ============================================================ */
  function viewAuth() {
    const modo = State._authMode || "login";
    const signup = modo === "signup";
    const banner = MODO === "compartilhado"
      ? "🟢 Ranking compartilhado ativo"
      : "🟡 Modo local (configure o Supabase para compartilhar)";
    root().innerHTML = `
      <div style="height:5vh"></div>
      <div class="auth-logo">
        <div class="logo-big">🏆</div>
        <h1>BOLÃO DOS BABES</h1>
        <p class="muted">Copa do Mundo 2026</p>
      </div>
      <div class="card">
        <h2 class="auth-title">${signup ? "Crie sua conta" : "Bem-vindo de volta!"}</h2>
        <p class="auth-sub">${signup ? "Escolha um usuário e uma senha para participar." : "Entre para dar seus palpites."}</p>

        <label>Usuário</label>
        <input id="u" placeholder="seu_usuario" autocapitalize="none" autocomplete="username" maxlength="20" />
        <div class="spacer"></div>

        <label>Senha</label>
        <div class="pwd-wrap">
          <input id="p" type="password" placeholder="••••••••" autocomplete="${signup?'new-password':'current-password'}" />
          <button class="pwd-eye" type="button" data-eye="p" aria-label="Mostrar senha">👁️</button>
        </div>

        ${signup ? `
          <div class="spacer"></div>
          <label>Confirmar senha</label>
          <div class="pwd-wrap">
            <input id="p2" type="password" placeholder="••••••••" autocomplete="new-password" />
            <button class="pwd-eye" type="button" data-eye="p2" aria-label="Mostrar senha">👁️</button>
          </div>
          <div class="spacer"></div>
          <label>Código de admin <span class="muted">(opcional)</span></label>
          <input id="code" placeholder="deixe em branco se não for admin" autocapitalize="none" />
          <p class="hint">A senha precisa ter no mínimo 8 caracteres, com letras e números.</p>
        ` : `<div class="forgot">A senha não pode ser recuperada — anote num lugar seguro.</div>`}

        <div class="spacer"></div>
        <button class="btn" id="go">${signup ? "Criar conta e entrar" : "Entrar"}</button>

        <div class="auth-foot">
          ${signup
            ? `Já tem conta? <span class="link" data-mode="login">Entrar</span>`
            : `Não tem conta? <span class="link" data-mode="signup">Criar agora</span>`}
        </div>
      </div>
      <div class="mode-banner">${banner}</div>
    `;
    root().querySelectorAll("[data-mode]").forEach((b)=> b.onclick=()=>{ State._authMode=b.dataset.mode; viewAuth(); });
    root().querySelectorAll("[data-eye]").forEach((b)=> b.onclick=()=>{
      const inp = document.getElementById(b.dataset.eye);
      const show = inp.type === "password";
      inp.type = show ? "text" : "password";
      b.textContent = show ? "🙈" : "👁️";
    });
    document.getElementById("go").onclick = signup ? doSignup : doLogin;
    [...root().querySelectorAll("input")].forEach((inp)=> inp.addEventListener("keydown",(e)=>{ if(e.key==="Enter") document.getElementById("go").click(); }));
  }

  async function doLogin(){
    const username = document.getElementById("u").value.trim().toLowerCase();
    const senha = document.getElementById("p").value;
    if (!username || !senha) return toast("Preencha usuário e senha");
    const btn = document.getElementById("go"); btn.disabled = true; btn.textContent = "Entrando…";
    try {
      const user = await Store.getUsuario(username);
      if (!user) { toast("Usuário não encontrado"); return; }
      const { hash } = await derivar(senha, user.salt);
      if (hash !== user.senha_hash) { toast("Senha incorreta"); return; }
      State.auth = { username: user.username, nome: user.nome, is_admin: !!user.is_admin };
      LS.set("babes_auth", State.auth);
      State.view = "home";
      await render();
    } catch (e) { console.warn(e); toast("Erro ao entrar"); }
    finally { btn.disabled = false; btn.textContent = "Entrar"; }
  }

  async function doSignup(){
    const raw = document.getElementById("u").value.trim();
    const username = raw.toLowerCase();
    const senha = document.getElementById("p").value;
    const senha2 = document.getElementById("p2").value;
    const code = document.getElementById("code").value.trim();
    if (!/^[a-z0-9._-]{3,20}$/.test(username)) return toast("Usuário: 3-20 letras/números (sem espaço)");
    if (!senhaForte(senha)) return toast("Senha fraca: mín. 8 caracteres, com letras e números");
    if (senha !== senha2) return toast("As senhas não conferem");
    const btn = document.getElementById("go"); btn.disabled = true; btn.textContent = "Criando…";
    try {
      const existe = await Store.getUsuario(username);
      if (existe) { toast("Esse usuário já existe — escolha outro"); return; }
      const { hash, salt } = await derivar(senha);
      const is_admin = !!(ADMIN_CODE && code && code === ADMIN_CODE);
      await Store.criarUsuario({ username, nome: raw, senha_hash: hash, salt, is_admin });
      await Store.savePalpite(username, { nome: raw, jogos: {}, campeao: null });
      State.auth = { username, nome: raw, is_admin };
      LS.set("babes_auth", State.auth);
      State.view = "home";
      toast(is_admin ? "Conta admin criada 🛠️" : "Conta criada 🎉");
      await render();
    } catch (e) {
      console.warn(e);
      toast(e && /duplicate|unique/i.test(e.message||e.code||"") ? "Esse usuário já existe" : "Erro ao criar conta");
    } finally { btn.disabled = false; btn.textContent = "Criar conta e entrar"; }
  }

  function logout(){ State.auth=null; localStorage.removeItem("babes_auth"); State.view="home"; viewAuth(); }

  /* ============================================================
     COMPONENTES
     ============================================================ */
  function topbar() {
    return `
      <div class="topbar">
        <div class="brand"><div class="logo">🏆</div><div>BABES<small>Copa 2026</small></div></div>
        <div class="who"><span class="pill">👤 ${esc(State.auth.nome)}</span>
          <button class="iconbtn" data-logout title="Sair">⎋</button></div>
      </div>`;
  }

  function nav() {
    const items = [
      ["home", "🏠", "Início"],
      ["brasil", "🇧🇷", "Brasil"],
      ["completo", "🌎", "Completo"],
      ["ranking", "📊", "Ranking"],
    ];
    if (State.auth.is_admin) items.push(["admin", "🛠️", "Admin"]);
    return `<div class="nav">${items.map(([v,i,t]) =>
      `<button data-nav="${v}" class="${State.view===v||(State.view==='campeao'&&v==='home')?'active':''}">
        <span class="ni">${i}</span>${t}</button>`).join("")}</div>`;
  }

  function matchCard(j) {
    const real = resultadosReais()[j.id] || {};
    const temReal = real.c != null && real.f != null;
    const pj = (State.meuPalpite.jogos || {})[j.id] || {};
    const P = pontuacao();
    const r = pontosJogo(pj, real, P);
    let tagHtml = "";
    if (temReal) {
      const map = { exato:`✓ Placar exato +${P.placarExato}`, parcial:`✓ Vencedor +${P.vencedor}`, zero:"✗ 0 pontos" };
      tagHtml = `<span class="tag ${r.tag}">${map[r.tag]||""}</span>`;
    }
    const lock = temReal ? "disabled" : "";
    return `
      <div class="match ${temReal?'done':''}" data-match="${j.id}">
        <div class="top">
          <span class="badge">${j.fase==="grupos"?"Grupo "+j.grupo:(j.rotulo||"Mata-mata")}</span>
          <span>${fmtData(j.data)}</span>
        </div>
        <div class="teams">
          <div class="team"><span class="flag">${flag(j.casa)}</span><span class="nm">${esc(j.casa)}</span></div>
          <div class="vs">
            <input class="score-in" inputmode="numeric" data-side="c" value="${pj.c ?? ""}" ${lock} />
            <span class="x">x</span>
            <input class="score-in" inputmode="numeric" data-side="f" value="${pj.f ?? ""}" ${lock} />
          </div>
          <div class="team"><span class="flag">${flag(j.fora)}</span><span class="nm">${esc(j.fora)}</span></div>
        </div>
        ${temReal ? `<div class="result-line">Resultado: <span class="real">${real.c} x ${real.f}</span> ${tagHtml}</div>`
                  : `<div class="result-line muted">Faça seu palpite — salva sozinho.</div>`}
      </div>`;
  }

  function ligarMatchInputs() {
    root().querySelectorAll(".match").forEach((card) => {
      const id = card.dataset.match;
      card.querySelectorAll(".score-in").forEach((inp) => {
        inp.addEventListener("change", async () => {
          const cEl = card.querySelector('[data-side="c"]');
          const fEl = card.querySelector('[data-side="f"]');
          const c = cEl.value === "" ? null : Math.max(0, Math.min(20, parseInt(cEl.value) || 0));
          const f = fEl.value === "" ? null : Math.max(0, Math.min(20, parseInt(fEl.value) || 0));
          if (c != null) cEl.value = c;
          if (f != null) fEl.value = f;
          State.meuPalpite.jogos = State.meuPalpite.jogos || {};
          State.meuPalpite.jogos[id] = { c, f };
          await Store.savePalpite(State.auth.username, { jogos: State.meuPalpite.jogos });
          toast("Palpite salvo ✓");
        });
      });
    });
  }

  /* ============================================================
     TELA: HOME
     ============================================================ */
  function viewHome() {
    const stats = calcular(State.meuPalpite);
    const mods = [
      ["brasil","brasil",D.MODULOS.brasil],
      ["completo","completo",D.MODULOS.completo],
      ["campeao","campeao",D.MODULOS.campeao],
    ];
    root().innerHTML = topbar() + `
      <div class="hero">
        <div class="hero-hi">Olá, <b>${esc(State.auth.nome)}</b> 👋</div>
        <div class="hero-pts"><b>${stats.total}</b><span>pontos</span></div>
      </div>
      <div class="kpi">
        <div class="box"><b>${stats.exatos}</b><span>PLACARES EXATOS</span></div>
        <div class="box"><b>${stats.parciais}</b><span>VENCEDORES</span></div>
        <div class="box"><b>${stats.campeao?'✓':'—'}</b><span>CAMPEÃO</span></div>
      </div>
      <div class="section-title">Seus bolões</div>
      <div class="mods">
        ${mods.map(([v,cls,m]) => `
          <div class="mod ${cls}" data-go="${v}">
            <div class="ico">${m.emoji}</div>
            <div class="meta"><b>${m.nome}</b><p>${m.desc}</p></div>
            <div class="chev">›</div>
          </div>`).join("")}
      </div>
      <div class="mode-banner">${MODO==="compartilhado"?"🟢 Ranking compartilhado ativo":"🟡 Modo local (só este aparelho)"}</div>
    ` + nav();
    root().querySelectorAll("[data-go]").forEach((e)=> e.onclick=()=>{ State.view=e.dataset.go; render(); });
  }

  /* ============================================================
     TELA: BOLÃO BRASIL / COMPLETO
     ============================================================ */
  function viewJogos(tipo) {
    const isBrasil = tipo === "brasil";
    let jogos = isBrasil ? jogosDoBrasil() : jogosEfetivos();
    jogos = jogos.slice().sort((a,b)=>(a.data||"").localeCompare(b.data||"")||a.id.localeCompare(b.id));
    const m = isBrasil ? D.MODULOS.brasil : D.MODULOS.completo;
    const stats = calcular(State.meuPalpite);
    const pontos = isBrasil ? stats.brasil : stats.completo;

    const dias = [...new Set(jogos.map((j)=>j.data))].sort();
    const filtro = State._filtroDia || "todos";
    let lista = jogos;
    if (!isBrasil && filtro!=="todos") lista = jogos.filter((j)=>j.data===filtro);

    const tabs = isBrasil ? "" : `
      <div class="tabs">
        <div class="tab ${filtro==="todos"?"active":""}" data-dia="todos">Todos</div>
        ${dias.map((d)=>`<div class="tab ${filtro===d?"active":""}" data-dia="${d}">${fmtData(d)}</div>`).join("")}
      </div>`;

    root().innerHTML = topbar() + `
      <div class="section-title">${m.emoji} ${m.nome}</div>
      <div class="kpi"><div class="box"><b>${pontos}</b><span>SEUS PONTOS AQUI</span></div>
        <div class="box"><b>${lista.length}</b><span>JOGOS</span></div></div>
      <div class="legend">
        <span><i class="dot" style="background:var(--ok)"></i> Placar exato +${pontuacao().placarExato}</span>
        <span><i class="dot" style="background:var(--gold)"></i> Vencedor +${pontuacao().vencedor}</span>
      </div>
      ${tabs}
      ${lista.length ? lista.map(matchCard).join("") : `<div class="empty">Nenhum jogo aqui ainda.</div>`}
      <div class="spacer"></div>
      <button class="btn secondary" data-back>‹ Voltar ao início</button>
      <div class="spacer"></div>
    ` + nav();

    ligarMatchInputs();
    root().querySelector("[data-back]").onclick = () => { State.view="home"; render(); };
    root().querySelectorAll("[data-dia]").forEach((e)=> e.onclick=()=>{ State._filtroDia=e.dataset.dia; render(); });
  }

  /* ============================================================
     TELA: CAMPEÃO
     ============================================================ */
  function viewCampeao() {
    const escolhido = State.meuPalpite.campeao;
    const oficial = State.resultados.campeao;
    const P = pontuacao();
    root().innerHTML = topbar() + `
      <div class="section-title">🏆 ${D.MODULOS.campeao.nome}</div>
      <div class="card">
        <p class="muted" style="margin-top:0">Quem vai levantar a taça da Copa 2026? Acertar vale <b style="color:var(--gold-d)">${P.campeao} pontos</b>.</p>
        ${oficial ? `<p>Campeão oficial: <b style="color:var(--gold-d)">${flag(oficial)} ${esc(oficial)}</b> ${escolhido===oficial?'— você acertou! 🎉':''}</p>` : ``}
        ${escolhido ? `<p>Seu palpite: <b>${flag(escolhido)} ${esc(escolhido)}</b></p>` : `<p class="muted">Toque numa seleção para escolher.</p>`}
      </div>
      <div class="champ-grid">
        ${D.TODAS_SELECOES.map((t)=>`
          <div class="champ ${escolhido===t?"sel":""}" data-champ="${esc(t)}">
            <div class="flag">${flag(t)}</div><div class="nm">${esc(t)}</div>
          </div>`).join("")}
      </div>
      <div class="spacer"></div>
      <button class="btn secondary" data-back>‹ Voltar ao início</button>
      <div class="spacer"></div>
    ` + nav();

    const lock = !!oficial;
    root().querySelectorAll("[data-champ]").forEach((e)=> e.onclick=async()=>{
      if (lock) return toast("O campeão já foi definido");
      State.meuPalpite.campeao = e.dataset.champ;
      await Store.savePalpite(State.auth.username, { campeao: e.dataset.champ });
      toast("Campeão escolhido 🏆"); render();
    });
    root().querySelector("[data-back]").onclick = () => { State.view="home"; render(); };
  }

  /* ============================================================
     TELA: RANKING
     ============================================================ */
  function viewRanking() {
    const aba = State._rankAba || "completo";
    const rows = State.palpites.map((p)=>({ p, s: calcular(p) }));
    const keyMap = { completo:"total", brasil:"brasil", campeao:"campeao" };
    const k = keyMap[aba];
    rows.sort((a,b)=> b.s[k]-a.s[k] || (a.p.nome||a.p.id||"").localeCompare(b.p.nome||b.p.id||""));

    root().innerHTML = topbar() + `
      <div class="section-title">📊 Ranking</div>
      <div class="tabs">
        <div class="tab ${aba==="completo"?"active":""}" data-aba="completo">🌎 Geral</div>
        <div class="tab ${aba==="brasil"?"active":""}" data-aba="brasil">🇧🇷 Brasil</div>
        <div class="tab ${aba==="campeao"?"active":""}" data-aba="campeao">🏆 Campeão</div>
      </div>
      <div class="card">
        ${rows.length ? rows.map((row,i)=>{
          const nome = row.p.nome || row.p.id || "?";
          const me = (row.p.id||"") === State.auth.username;
          const pos = i+1, cls = pos<=3?"p"+pos:"";
          const s = row.s;
          const sub = aba==="completo" ? `${s.exatos} exatos · ${s.parciais} vencedores${s.campeao?' · campeão ✓':''}`
                    : aba==="brasil" ? `pontos nos jogos do Brasil`
                    : (row.p.campeao ? `palpite: ${flag(row.p.campeao)} ${esc(row.p.campeao)}` : "sem palpite");
          return `<div class="rank-row ${me?"me":""}">
            <div class="rank-pos ${cls}">${pos}</div>
            <div class="rank-name">${esc(nome)}${me?" (você)":""}<small>${sub}</small></div>
            <div class="rank-pts">${s[k]}<small> pts</small></div>
          </div>`;
        }).join("") : `<div class="empty">Ninguém pontuou ainda.</div>`}
      </div>
      <button class="btn ghost small" data-refresh>↻ Atualizar</button>
      <div class="spacer"></div>
    ` + nav();

    root().querySelectorAll("[data-aba]").forEach((e)=> e.onclick=()=>{ State._rankAba=e.dataset.aba; render(); });
    root().querySelector("[data-refresh]").onclick = async()=>{ State.palpites=await Store.getAllPalpites(); toast("Atualizado ✓"); render(); };
  }

  /* ============================================================
     TELA: ADMIN (só para usuários admin)
     ============================================================ */
  function viewAdmin() {
    if (!State.auth.is_admin) { State.view="home"; return viewHome(); }
    const P = pontuacao();
    let jogos = jogosEfetivos().slice().sort((a,b)=>(a.data||"").localeCompare(b.data||"")||a.id.localeCompare(b.id));
    const real = resultadosReais();

    root().innerHTML = topbar() + `
      <div class="section-title">🛠️ Painel Admin</div>

      <div class="card">
        <b>🏆 Definir campeão da Copa</b>
        <p class="muted" style="font-size:12px;margin:6px 0 8px">Pontua o "Bolão do Campeão" (+${P.campeao}).</p>
        <select id="campeao">
          <option value="">— ainda não definido —</option>
          ${D.TODAS_SELECOES.map((t)=>`<option value="${esc(t)}" ${State.resultados.campeao===t?"selected":""}>${flag(t)} ${esc(t)}</option>`).join("")}
        </select>
        <div class="spacer"></div>
        <button class="btn gold small" id="salvarCampeao">Salvar campeão</button>
      </div>

      <div class="card">
        <b>⚽ Adicionar jogo de mata-mata</b>
        <p class="muted" style="font-size:12px;margin:6px 0 8px">Oitavas, quartas, semi e final, conforme definirem.</p>
        <div class="row"><select id="nc">${optTimes()}</select><select id="nf">${optTimes()}</select></div>
        <div class="spacer"></div>
        <div class="row"><input id="nrot" placeholder="Rótulo (ex: Oitavas)" /><input id="ndata" type="date" value="2026-06-28" /></div>
        <div class="spacer"></div>
        <button class="btn secondary small" id="addJogo">+ Adicionar jogo</button>
      </div>

      <div class="section-title" style="font-size:16px">Resultados dos jogos</div>
      ${jogos.map((j)=>{
        const r = real[j.id] || {};
        return `<div class="admin-match" data-adm="${j.id}">
          <div class="hd">${j.fase==="grupos"?"Grupo "+j.grupo:(j.rotulo||"Mata-mata")} · ${fmtData(j.data)}</div>
          <div class="teams">
            <div class="team"><span class="flag">${flag(j.casa)}</span><span class="nm">${esc(j.casa)}</span></div>
            <div class="vs">
              <input class="score-in" inputmode="numeric" data-r="c" value="${r.c ?? ""}" />
              <span class="x">x</span>
              <input class="score-in" inputmode="numeric" data-r="f" value="${r.f ?? ""}" />
            </div>
            <div class="team"><span class="flag">${flag(j.fora)}</span><span class="nm">${esc(j.fora)}</span></div>
          </div>
        </div>`;
      }).join("")}
      <div class="spacer"></div>
      <button class="btn" id="salvarResultados">💾 Salvar todos os resultados</button>
      <div class="spacer"></div>
    ` + nav();

    document.getElementById("salvarCampeao").onclick = async()=>{
      State.resultados.campeao = document.getElementById("campeao").value || null;
      await Store.saveResultados({ campeao: State.resultados.campeao });
      toast("Campeão salvo 🏆");
    };
    document.getElementById("addJogo").onclick = async()=>{
      const casa=document.getElementById("nc").value, fora=document.getElementById("nf").value;
      const rotulo=document.getElementById("nrot").value.trim()||"Mata-mata";
      const data=document.getElementById("ndata").value;
      if (casa===fora) return toast("Escolha times diferentes");
      State.resultados.custom = State.resultados.custom || [];
      State.resultados.custom.push({ id:"K"+Date.now(), casa, fora, rotulo, data, fase:"mata", grupo:"—" });
      await Store.saveResultados({ custom: State.resultados.custom });
      toast("Jogo adicionado ✓"); render();
    };
    document.getElementById("salvarResultados").onclick = async()=>{
      const novos = Object.assign({}, real);
      root().querySelectorAll("[data-adm]").forEach((card)=>{
        const id=card.dataset.adm;
        const c=card.querySelector('[data-r="c"]').value;
        const f=card.querySelector('[data-r="f"]').value;
        if (c===""||f==="") delete novos[id];
        else novos[id]={ c:Math.max(0,parseInt(c)||0), f:Math.max(0,parseInt(f)||0) };
      });
      State.resultados.jogos = novos;
      await Store.saveResultados({ jogos: novos });
      State.palpites = await Store.getAllPalpites();
      toast("Resultados salvos ✓");
    };
  }
  function optTimes(){ return D.TODAS_SELECOES.map((t)=>`<option value="${esc(t)}">${flag(t)} ${esc(t)}</option>`).join(""); }

  /* ============================================================
     ROTEADOR
     ============================================================ */
  async function render() {
    if (!State.auth) return viewAuth();
    State.resultados = await Store.getResultados();
    State.meuPalpite = (await Store.getPalpite(State.auth.username)) || { jogos:{}, campeao:null };
    State.palpites = await Store.getAllPalpites();

    switch (State.view) {
      case "home": viewHome(); break;
      case "brasil": viewJogos("brasil"); break;
      case "completo": viewJogos("completo"); break;
      case "campeao": viewCampeao(); break;
      case "ranking": viewRanking(); break;
      case "admin": viewAdmin(); break;
      default: viewHome();
    }
    document.querySelectorAll("[data-nav]").forEach((b)=> b.onclick=()=>{ State.view=b.dataset.nav; render(); });
    const lo = document.querySelector("[data-logout]"); if (lo) lo.onclick = logout;
  }

  /* ============================================================
     PWA
     ============================================================ */
  function gerarAppleIcon() {
    try {
      const size=180, c=document.createElement("canvas"); c.width=c.height=size; const x=c.getContext("2d");
      const g=x.createLinearGradient(0,0,size,size); g.addColorStop(0,"#1b5e44"); g.addColorStop(1,"#0f3d2e");
      x.fillStyle=g; x.fillRect(0,0,size,size);
      x.font="92px serif"; x.textAlign="center"; x.textBaseline="middle"; x.fillText("🏆",size/2,size/2-6);
      x.fillStyle="#f5b301"; x.font="900 26px -apple-system,Arial"; x.fillText("BABES",size/2,size-26);
      const link=document.getElementById("apple-icon"); if(link) link.href=c.toDataURL("image/png");
    } catch(e){}
  }
  function registrarSW(){ if("serviceWorker" in navigator && location.protocol!=="file:") navigator.serviceWorker.register("sw.js").catch(()=>{}); }

  (async function init(){ gerarAppleIcon(); registrarSW(); await render(); })();
})();
