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
     ÍCONES (SVG inline, estilo traço)
     ============================================================ */
  const ICONS = {
    home:`<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>`,
    globe:`<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>`,
    flag:`<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>`,
    trophy:`<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>`,
    ranking:`<path d="M3 3v18h18"/><rect x="7" y="11" width="3" height="7" rx="1"/><rect x="12" y="6" width="3" height="12" rx="1"/><rect x="17" y="14" width="3" height="4" rx="1"/>`,
    settings:`<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>`,
    eye:`<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>`,
    eyeOff:`<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>`,
    logout:`<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>`,
    user:`<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
    chevron:`<polyline points="9 18 15 12 9 6"/>`,
    back:`<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>`,
    check:`<polyline points="20 6 9 17 4 12"/>`,
    x:`<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`,
    calendar:`<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>`,
    plus:`<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>`,
    refresh:`<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>`,
    save:`<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>`,
    lock:`<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>`,
    medal:`<path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/><path d="M11 12 5.12 2.2"/><path d="m13 12 5.88-9.8"/><path d="M8 7h8"/><circle cx="12" cy="17" r="5"/><path d="M12 18v-2h-.5"/>`,
    edit:`<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>`,
    clock:`<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
  };
  function icon(name, cls){ return `<svg class="ic ${cls||''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]||''}</svg>`; }

  /* ============================================================
     BANDEIRAS (imagem via flagcdn, com fallback de iniciais)
     ============================================================ */
  function iniciais(team){ return team.replace(/[^A-Za-zÀ-ÿ]/g,"").slice(0,3).toUpperCase(); }
  function flagHTML(team, cls){
    const iso = (D.TEAM_ISO || {})[team];
    const ini = esc(iniciais(team));
    if (iso) return `<span class="flag ${cls||''}" data-i="${ini}"><img src="https://flagcdn.com/w160/${iso}.png" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentNode.classList.add('noimg');this.remove();"></span>`;
    return `<span class="flag noimg ${cls||''}" data-i="${ini}"></span>`;
  }

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
    const salt = saltB64 || "fb";
    let h = 5381; const str = salt + "|" + senha;
    for (let i=0;i<str.length;i++){ h = ((h<<5)+h) + str.charCodeAt(i); h |= 0; }
    return { hash: "fb_" + (h>>>0).toString(16), salt };
  }
  function senhaForte(s){ return s.length >= 8 && /[A-Za-z]/.test(s) && /[0-9]/.test(s); }

  /* ============================================================
     CAMADA DE DADOS
     ============================================================ */
  const LS = {
    get(k, def) { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } },
    set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
  };

  const Store = {
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
    auth: LS.get("babes_auth", null),
    view: "home",
    resultados: {},
    meuPalpite: null,
    palpites: [],
    _draft: {},    // rascunho por jogo (antes de confirmar)
    _editing: {},  // jogos em modo de edição
  };

  function pontuacao() { return Object.assign({}, D.PONTUACAO_PADRAO, State.resultados.pontuacao || {}); }
  function resultadosReais() { return Object.assign({}, D.RESULTADOS_INICIAIS || {}, State.resultados.jogos || {}); }
  function jogosEfetivos() {
    const edits = State.resultados.edits || {};
    const base = D.JOGOS_BASE.map((j) => Object.assign({}, j, edits[j.id] || {}));
    const custom = (State.resultados.custom || []).map((j) => Object.assign({ fase: "mata", grupo: "—" }, j, edits[j.id] || {}));
    return base.concat(custom);
  }
  function jogosDoBrasil() { return jogosEfetivos().filter((j) => j.casa === D.TIME_BRASIL || j.fora === D.TIME_BRASIL); }

  // ----- horário de início / trava (exibido no horário de Brasília) -----
  const TZ = "America/Sao_Paulo";
  function inicioISO(j){ return j.inicio || (j.data ? `${j.data}T16:00:00-03:00` : null); }
  function kickoffMs(j){ const i = inicioISO(j); return i ? Date.parse(i) : Infinity; }
  function jogoComecou(j){ return Date.now() >= kickoffMs(j); }
  function partesBR(j){
    const i = inicioISO(j); const dt = i ? new Date(i) : null;
    if (!dt || isNaN(dt)) return null;
    const p = new Intl.DateTimeFormat("sv-SE",{ timeZone:TZ, year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", hour12:false }).formatToParts(dt);
    const g = (t)=> (p.find(x=>x.type===t)||{}).value || "";
    return { y:g("year"), mo:g("month"), d:g("day"), h:g("hour"), mi:g("minute") };
  }
  function fmtDataHora(j){ const b = partesBR(j); return b ? `${b.d}/${b.mo} · ${b.h}:${b.mi}` : fmtData(j.data); }
  function fmtHora(j){ const b = partesBR(j); return b ? `${b.h}:${b.mi}` : ""; }
  function diaBR(j){ const b = partesBR(j); return b ? `${b.y}-${b.mo}-${b.d}` : (j.data||""); }
  // valor para <input type="datetime-local"> (horário de Brasília)
  function inicioLocalInput(j){ const b = partesBR(j); return b ? `${b.y}-${b.mo}-${b.d}T${b.h}:${b.mi}` : ""; }

  /* ============================================================
     PONTUAÇÃO
     ============================================================ */
  function sinal(a, b) { return a > b ? 1 : a < b ? -1 : 0; }
  // pj pode ser { tipo:'placar', c, f } ou { tipo:'vencedor', w:'c'|'e'|'f' }
  function pontosJogo(pj, real, P) {
    if (!pj || !real || real.c == null || real.f == null) return { pts: 0, tag: "aberto" };
    const ro = sinal(+real.c, +real.f);
    if (pj.tipo === "vencedor") {
      if (pj.w == null) return { pts: 0, tag: "sem" };
      const po = pj.w === "c" ? 1 : pj.w === "f" ? -1 : 0;
      return po === ro ? { pts: P.vencedor, tag: "parcial" } : { pts: 0, tag: "zero" };
    }
    if (pj.c == null || pj.f == null) return { pts: 0, tag: "sem" };
    const pc = +pj.c, pf = +pj.f;
    if (pc === +real.c && pf === +real.f) return { pts: P.placarExato, tag: "exato" };
    if (sinal(pc, pf) === ro) return { pts: P.vencedor, tag: "parcial" };
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
  function fmtData(iso){ if(!iso) return ""; const [y,m,d]=iso.split("-"); return `${d}/${m}`; }
  function toast(msg){ const t=document.getElementById("toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(toast._t); toast._t=setTimeout(()=>t.classList.remove("show"),2000); }
  function esc(s){ return String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
  const MOD_ICON = { brasil:"flag", completo:"globe", campeao:"trophy" };

  /* ============================================================
     TELA: LOGIN / CRIAR CONTA
     ============================================================ */
  function viewAuth() {
    const modo = State._authMode || "login";
    const signup = modo === "signup";
    root().innerHTML = `
      <div style="height:5vh"></div>
      <div class="auth-logo">
        <div class="logo-big">${icon("trophy")}</div>
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
          <button class="pwd-eye" type="button" data-eye="p" aria-label="Mostrar senha">${icon("eye")}</button>
        </div>

        ${signup ? `
          <div class="spacer"></div>
          <label>Confirmar senha</label>
          <div class="pwd-wrap">
            <input id="p2" type="password" placeholder="••••••••" autocomplete="new-password" />
            <button class="pwd-eye" type="button" data-eye="p2" aria-label="Mostrar senha">${icon("eye")}</button>
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
    `;
    root().querySelectorAll("[data-mode]").forEach((b)=> b.onclick=()=>{ State._authMode=b.dataset.mode; viewAuth(); });
    root().querySelectorAll("[data-eye]").forEach((b)=> b.onclick=()=>{
      const inp = document.getElementById(b.dataset.eye);
      const show = inp.type === "password";
      inp.type = show ? "text" : "password";
      b.innerHTML = icon(show ? "eyeOff" : "eye");
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
      toast(is_admin ? "Conta admin criada" : "Conta criada");
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
        <div class="brand"><div class="logo">${icon("trophy")}</div><div>BABES<small>Copa 2026</small></div></div>
        <div class="who"><span class="pill">${icon("user")} ${esc(State.auth.nome)}</span>
          <button class="iconbtn" data-logout title="Sair">${icon("logout")}</button></div>
      </div>`;
  }

  function nav() {
    const items = [
      ["home","home","Início"],
      ["brasil","flag","Brasil"],
      ["completo","globe","Completo"],
      ["ranking","ranking","Ranking"],
    ];
    if (State.auth.is_admin) items.push(["admin","settings","Admin"]);
    return `<div class="nav">${items.map(([v,ic,t]) =>
      `<button data-nav="${v}" class="${State.view===v||(State.view==='campeao'&&v==='home')?'active':''}">
        ${icon(ic,"ni")}<span>${t}</span></button>`).join("")}</div>`;
  }

  function teamCol(name){ return `<div class="team">${flagHTML(name,"lg")}<span class="nm">${esc(name)}</span></div>`; }
  const jogoById = {};
  function getDraft(j, pj){
    if (!State._draft[j.id]) State._draft[j.id] = { tipo: pj.tipo || "placar", c: pj.c ?? "", f: pj.f ?? "", w: pj.w ?? null };
    return State._draft[j.id];
  }
  function pickLabel(j, w){ return w==="e" ? "Empate" : w==="c" ? "Vitória: "+j.casa : "Vitória: "+j.fora; }

  // conteúdo interno do card (permite re-render isolado ao trocar de modo)
  function midSaved(j, pj){
    if (!pj || !pj.tipo) return `<div class="vs"><span class="score-show">–</span></div>`;
    if (pj.tipo === "vencedor") return `<div class="vs"><span class="pick-w">${pj.w==="e"?"=":icon("check")}</span></div>`;
    return `<div class="vs"><span class="score-show">${pj.c ?? "–"}</span><span class="x">×</span><span class="score-show">${pj.f ?? "–"}</span></div>`;
  }

  function cardBody(j){
    const real = resultadosReais()[j.id] || {};
    const temReal = real.c != null && real.f != null;
    const comecou = jogoComecou(j);
    const bloqueado = temReal || comecou;
    const pj = (State.meuPalpite.jogos || {})[j.id] || {};
    const confirmado = !!pj.tipo;
    const editing = !!State._editing[j.id];
    const P = pontuacao();

    const head = `
      <div class="top">
        <span class="badge">${j.fase==="grupos"?"Grupo "+j.grupo:(j.rotulo||"Mata-mata")}</span>
        <span class="when">${icon("clock")} ${fmtDataHora(j)}</span>
      </div>`;

    function resultLine(){
      const r = pontosJogo(pj, real, P);
      const map = {
        exato:`<span class="tag exato">${icon("check")} Placar exato +${P.placarExato}</span>`,
        parcial:`<span class="tag parcial">${icon("check")} Vencedor +${P.vencedor}</span>`,
        zero:`<span class="tag zero">${icon("x")} 0 pontos</span>`,
        sem:`<span class="tag aberto">Sem palpite</span>`,
      };
      return `<div class="result-line">Resultado <span class="real">${real.c} × ${real.f}</span> ${map[r.tag]||""}</div>`;
    }

    // 1) bloqueado: jogo começou ou já tem resultado → só leitura
    if (bloqueado){
      const teams = `<div class="teams">${teamCol(j.casa)}${midSaved(j,pj)}${teamCol(j.fora)}</div>`;
      const lbl = (confirmado && pj.tipo==="vencedor") ? `<div class="picked">Seu palpite: ${pickLabel(j,pj.w)}</div>` : "";
      const line = temReal ? resultLine() : `<div class="result-line">${icon("lock")} Jogo iniciado — palpites fechados</div>`;
      return head + teams + lbl + line;
    }

    // 2) já confirmado e não está editando → resumo + botão Editar
    if (confirmado && !editing){
      const teams = `<div class="teams">${teamCol(j.casa)}${midSaved(j,pj)}${teamCol(j.fora)}</div>`;
      const lbl = (pj.tipo==="vencedor") ? `<div class="picked">${icon("check")} ${pickLabel(j,pj.w)}</div>` : `<div class="picked">${icon("check")} Palpite salvo</div>`;
      const note = `<div class="result-line">Editável até o início (${fmtHora(j)})</div>`;
      return head + teams + lbl + note + `<button class="btn secondary edit-btn" data-edit>${icon("edit")} Editar palpite</button>`;
    }

    // 3) interativo (novo palpite ou em edição)
    const d = getDraft(j, pj);
    const seg = `
      <div class="seg bet-seg">
        <button class="seg-btn ${d.tipo==='placar'?'on':''}" data-bet="placar">Placar exato</button>
        <button class="seg-btn ${d.tipo==='vencedor'?'on':''}" data-bet="vencedor">Só vencedor</button>
      </div>`;

    let body;
    if (d.tipo === "vencedor"){
      body = `
        <div class="win-opts">
          <button class="win-opt ${d.w==='c'?'on':''}" data-w="c">${flagHTML(j.casa)}<span>${esc(j.casa)}</span></button>
          <button class="win-opt ${d.w==='e'?'on':''}" data-w="e"><span class="emp">=</span><span>Empate</span></button>
          <button class="win-opt ${d.w==='f'?'on':''}" data-w="f">${flagHTML(j.fora)}<span>${esc(j.fora)}</span></button>
        </div>`;
    } else {
      body = `
        <div class="teams">
          ${teamCol(j.casa)}
          <div class="vs">
            <input class="score-in" inputmode="numeric" data-side="c" value="${d.c}" placeholder="–" />
            <span class="x">×</span>
            <input class="score-in" inputmode="numeric" data-side="f" value="${d.f}" placeholder="–" />
          </div>
          ${teamCol(j.fora)}
        </div>`;
    }
    const txt = confirmado ? "Salvar alteração" : "Confirmar palpite";
    return head + seg + body + `<button class="btn confirm-btn" data-confirm>${icon("check")} ${txt}</button>`;
  }

  function matchCard(j){
    jogoById[j.id] = j;
    const real = resultadosReais()[j.id] || {};
    const temReal = real.c != null && real.f != null;
    const bloqueado = temReal || jogoComecou(j);
    return `<div class="match ${temReal?'done':''} ${bloqueado&&!temReal?'locked':''}" data-match="${j.id}">${cardBody(j)}</div>`;
  }

  function wireCard(card){
    const j = jogoById[card.dataset.match];
    if (!j) return;
    const d = State._draft[j.id];
    // troca de modo
    card.querySelectorAll("[data-bet]").forEach((b)=> b.onclick=()=>{
      // guarda o que já foi digitado antes de trocar
      const cEl = card.querySelector('[data-side="c"]'); const fEl = card.querySelector('[data-side="f"]');
      if (cEl) d.c = cEl.value; if (fEl) d.f = fEl.value;
      d.tipo = b.dataset.bet;
      card.innerHTML = cardBody(j); wireCard(card);
    });
    // escolha de vencedor
    card.querySelectorAll("[data-w]").forEach((b)=> b.onclick=()=>{
      d.w = b.dataset.w; card.innerHTML = cardBody(j); wireCard(card);
    });
    // sincroniza placar digitado no rascunho
    card.querySelectorAll(".score-in").forEach((inp)=> inp.addEventListener("input",()=>{
      const cEl=card.querySelector('[data-side="c"]'), fEl=card.querySelector('[data-side="f"]');
      d.c = cEl ? cEl.value : d.c; d.f = fEl ? fEl.value : d.f;
    }));
    // editar (reabre o palpite já salvo)
    const eb = card.querySelector("[data-edit]");
    if (eb) eb.onclick = ()=>{
      if (jogoComecou(j)) { toast("O jogo já começou"); return; }
      State._editing[j.id] = true; delete State._draft[j.id];
      card.innerHTML = cardBody(j); wireCard(card);
    };
    // confirmar / salvar
    const btn = card.querySelector("[data-confirm]");
    if (btn) btn.onclick = async ()=>{
      if (jogoComecou(j)) { toast("O jogo já começou — não dá mais para palpitar"); render(); return; }
      let palpite;
      if (d.tipo === "vencedor"){
        if (!d.w) return toast("Escolha quem vence (ou empate)");
        palpite = { tipo:"vencedor", w:d.w };
      } else {
        const cEl=card.querySelector('[data-side="c"]'), fEl=card.querySelector('[data-side="f"]');
        if (cEl.value==="" || fEl.value==="") return toast("Preencha os dois placares");
        const c=Math.max(0,Math.min(20,parseInt(cEl.value)||0)), f=Math.max(0,Math.min(20,parseInt(fEl.value)||0));
        palpite = { tipo:"placar", c, f };
      }
      State.meuPalpite.jogos = State.meuPalpite.jogos || {};
      State.meuPalpite.jogos[j.id] = palpite;
      delete State._draft[j.id];
      State._editing[j.id] = false;
      await Store.savePalpite(State.auth.username, { jogos: State.meuPalpite.jogos });
      toast("Palpite salvo");
      render();
    };
  }

  function ligarMatch(){ root().querySelectorAll(".match").forEach(wireCard); }

  /* ============================================================
     TELA: HOME
     ============================================================ */
  function viewHome() {
    const stats = calcular(State.meuPalpite);
    const mods = ["brasil","completo","campeao"];
    root().innerHTML = topbar() + `
      <div class="hero">
        <div class="hero-info">
          <div class="hero-hi">Olá, <b>${esc(State.auth.nome)}</b></div>
          <div class="hero-sub">Seus pontos no bolão</div>
        </div>
        <div class="hero-pts"><b>${stats.total}</b><span>pontos</span></div>
        <div class="hero-deco">${icon("trophy")}</div>
      </div>
      <div class="kpi">
        <div class="box"><b>${stats.exatos}</b><span>PLACARES EXATOS</span></div>
        <div class="box"><b>${stats.parciais}</b><span>VENCEDORES</span></div>
        <div class="box"><b>${stats.campeao?icon("check","kpi-ic"):"–"}</b><span>CAMPEÃO</span></div>
      </div>
      <div class="section-title">${icon("flag")} Seus bolões</div>
      <div class="mods">
        ${mods.map((v) => { const m=D.MODULOS[v]; return `
          <div class="mod ${v}" data-go="${v}">
            <div class="ico">${icon(MOD_ICON[v])}</div>
            <div class="meta"><b>${m.nome}</b><p>${m.desc}</p></div>
            <div class="chev">${icon("chevron")}</div>
          </div>`; }).join("")}
      </div>
    ` + nav();
    root().querySelectorAll("[data-go]").forEach((e)=> e.onclick=()=>{ State.view=e.dataset.go; render(); });
  }

  /* ============================================================
     TELA: BOLÃO BRASIL / COMPLETO
     ============================================================ */
  function viewJogos(tipo) {
    const isBrasil = tipo === "brasil";
    let jogos = isBrasil ? jogosDoBrasil() : jogosEfetivos();
    jogos = jogos.slice().sort((a,b)=> kickoffMs(a)-kickoffMs(b) || a.id.localeCompare(b.id));
    const m = D.MODULOS[tipo];
    const stats = calcular(State.meuPalpite);
    const pontos = isBrasil ? stats.brasil : stats.completo;

    const dias = [...new Set(jogos.map((j)=>diaBR(j)))].sort();
    const filtro = State._filtroDia || "todos";
    let lista = jogos;
    if (!isBrasil && filtro!=="todos") lista = jogos.filter((j)=>diaBR(j)===filtro);

    const tabs = isBrasil ? "" : `
      <div class="tabs">
        <div class="tab ${filtro==="todos"?"active":""}" data-dia="todos">Todos</div>
        ${dias.map((d)=>`<div class="tab ${filtro===d?"active":""}" data-dia="${d}">${fmtData(d)}</div>`).join("")}
      </div>`;

    root().innerHTML = topbar() + `
      <div class="section-title">${icon(MOD_ICON[tipo])} ${m.nome}</div>
      <div class="kpi"><div class="box"><b>${pontos}</b><span>SEUS PONTOS AQUI</span></div>
        <div class="box"><b>${lista.length}</b><span>JOGOS</span></div></div>
      <div class="legend">
        <span><i class="dot ok"></i> Placar exato +${pontuacao().placarExato}</span>
        <span><i class="dot gold"></i> Vencedor +${pontuacao().vencedor}</span>
      </div>
      <p class="hint" style="margin:0 2px 12px">Em cada jogo escolha <b>placar exato</b> ou <b>só o vencedor</b>. Dá para editar até o apito inicial.</p>
      ${tabs}
      ${lista.length ? lista.map(matchCard).join("") : `<div class="empty">Nenhum jogo aqui ainda.</div>`}
      <div class="spacer"></div>
      <button class="btn secondary" data-back>${icon("back")} Voltar ao início</button>
      <div class="spacer"></div>
    ` + nav();

    ligarMatch();
    root().querySelector("[data-back]").onclick = () => { State.view="home"; render(); };
    root().querySelectorAll("[data-dia]").forEach((e)=> e.onclick=()=>{ State._filtroDia=e.dataset.dia; render(); });
  }

  /* ============================================================
     TELA: CAMPEÃO
     ============================================================ */
  function viewCampeao() {
    const escolhido = State.meuPalpite.campeao;
    const oficial = State.resultados.campeao;
    const travado = !!oficial;   // só trava quando o admin define o campeão oficial
    const temp = State._campTemp ?? escolhido;
    const P = pontuacao();

    let topo = "";
    if (oficial) topo = `<p>Campeão oficial: <b class="gold-t">${esc(oficial)}</b> ${escolhido===oficial?`${icon("check")} você acertou!`:''}</p>`;
    else if (escolhido) topo = `<p>${icon("check")} Seu palpite: <b>${esc(escolhido)}</b> <span class="muted">(dá para trocar até definir o campeão)</span></p>`;
    else topo = `<p class="muted">Toque numa seleção e confirme. Você pode trocar enquanto o campeão não for definido.</p>`;

    root().innerHTML = topbar() + `
      <div class="section-title">${icon("trophy")} ${D.MODULOS.campeao.nome}</div>
      <div class="card">
        <p class="muted" style="margin-top:0">Quem vai levantar a taça da Copa 2026? Acertar vale <b class="gold-t">${P.campeao} pontos</b>.</p>
        ${topo}
      </div>
      <div class="champ-grid">
        ${D.TODAS_SELECOES.map((t)=>`
          <div class="champ ${temp===t?"sel":""} ${travado?"off":""}" data-champ="${esc(t)}">
            ${flagHTML(t,"lg")}<div class="nm">${esc(t)}</div>
          </div>`).join("")}
      </div>
      ${(!travado) ? `<div class="spacer"></div><button class="btn" id="confCamp" ${temp?'':'disabled'}>${icon("check")} Confirmar campeão</button>` : ``}
      <div class="spacer"></div>
      <button class="btn secondary" data-back>${icon("back")} Voltar ao início</button>
      <div class="spacer"></div>
    ` + nav();

    root().querySelectorAll("[data-champ]").forEach((e)=> e.onclick=()=>{
      if (travado) return;
      State._campTemp = e.dataset.champ; viewCampeao();
    });
    const cc = document.getElementById("confCamp");
    if (cc) cc.onclick = async()=>{
      if (!State._campTemp) return;
      State.meuPalpite.campeao = State._campTemp;
      await Store.savePalpite(State.auth.username, { campeao: State._campTemp });
      State._campTemp = null;
      toast("Palpite de campeão salvo");
      render();
    };
    root().querySelector("[data-back]").onclick = () => { State.view="home"; State._campTemp=null; render(); };
  }

  /* ============================================================
     TELA: RANKING
     ============================================================ */
  function viewRanking() {
    const aba = State._rankAba || "geral";
    const rows = State.palpites.map((p)=>({ p, s: calcular(p) }));
    const keyMap = { geral:"total", completo:"completo", brasil:"brasil", campeao:"campeao" };
    const k = keyMap[aba] || "total";
    rows.sort((a,b)=> b.s[k]-a.s[k] || (a.p.nome||a.p.id||"").localeCompare(b.p.nome||b.p.id||""));
    const abas = [["geral","Geral"],["completo","Completo"],["brasil","Brasil"],["campeao","Campeão"]];

    root().innerHTML = topbar() + `
      <div class="section-title">${icon("ranking")} Ranking</div>
      <div class="tabs">
        ${abas.map(([v,t])=>`<div class="tab ${aba===v?"active":""}" data-aba="${v}">${t}</div>`).join("")}
      </div>
      <div class="card list">
        ${rows.length ? rows.map((row,i)=>{
          const nome = row.p.nome || row.p.id || "?";
          const me = (row.p.id||"") === State.auth.username;
          const pos = i+1, cls = pos<=3?"p"+pos:"";
          const s = row.s;
          const sub = aba==="geral" ? `${s.completo} dos jogos + ${s.campeao} do campeão`
                    : aba==="completo" ? `${s.exatos} exatos · ${s.parciais} vencedores`
                    : aba==="brasil" ? `pontos nos jogos do Brasil`
                    : (row.p.campeao ? `palpite: ${esc(row.p.campeao)}` : "sem palpite");
          return `<div class="rank-row ${me?"me":""}">
            <div class="rank-pos ${cls}">${pos<=3?icon("medal"):pos}</div>
            <div class="rank-name">${esc(nome)}${me?" (você)":""}<small>${sub}</small></div>
            <div class="rank-pts">${s[k]}<small> pts</small></div>
          </div>`;
        }).join("") : `<div class="empty">Ninguém pontuou ainda.</div>`}
      </div>
      <button class="btn ghost small" data-refresh>${icon("refresh")} Atualizar</button>
      <div class="spacer"></div>
    ` + nav();

    root().querySelectorAll("[data-aba]").forEach((e)=> e.onclick=()=>{ State._rankAba=e.dataset.aba; render(); });
    root().querySelector("[data-refresh]").onclick = async()=>{ State.palpites=await Store.getAllPalpites(); toast("Atualizado"); render(); };
  }

  /* ============================================================
     TELA: ADMIN
     ============================================================ */
  function viewAdmin() {
    if (!State.auth.is_admin) { State.view="home"; return viewHome(); }
    const P = pontuacao();
    let jogos = jogosEfetivos().slice().sort((a,b)=> kickoffMs(a)-kickoffMs(b) || a.id.localeCompare(b.id));
    const real = resultadosReais();

    root().innerHTML = topbar() + `
      <div class="section-title">${icon("settings")} Painel Admin</div>
      <div class="mode-banner">${MODO==="compartilhado"?"Ranking compartilhado ativo (Supabase)":"Modo local — sem Supabase"}</div>

      <div class="card">
        <b>Definir campeão da Copa</b>
        <p class="muted" style="font-size:12px;margin:6px 0 8px">Pontua o "Bolão do Campeão" (+${P.campeao}).</p>
        <select id="campeao">
          <option value="">— ainda não definido —</option>
          ${D.TODAS_SELECOES.map((t)=>`<option value="${esc(t)}" ${State.resultados.campeao===t?"selected":""}>${esc(t)}</option>`).join("")}
        </select>
        <div class="spacer"></div>
        <button class="btn gold small" id="salvarCampeao">${icon("save")} Salvar campeão</button>
      </div>

      <div class="card">
        <b>Adicionar jogo de mata-mata</b>
        <p class="muted" style="font-size:12px;margin:6px 0 8px">Oitavas, quartas, semi e final, conforme definirem.</p>
        <div class="row"><select id="nc">${optTimes()}</select><select id="nf">${optTimes()}</select></div>
        <div class="spacer"></div>
        <div class="row"><input id="nrot" placeholder="Rótulo (ex: Oitavas)" /><input id="ndata" type="date" value="2026-06-28" /></div>
        <div class="spacer"></div>
        <label>Início (horário de Brasília)</label>
        <input id="nhora" type="time" value="16:00" />
        <div class="spacer"></div>
        <button class="btn secondary small" id="addJogo">${icon("plus")} Adicionar jogo</button>
      </div>

      <div class="section-title" style="font-size:15px">Resultados dos jogos</div>
      ${jogos.map((j)=>{
        const r = real[j.id] || {};
        return `<div class="admin-match" data-adm="${j.id}">
          <div class="hd">${j.fase==="grupos"?"Grupo "+j.grupo:(j.rotulo||"Mata-mata")}</div>
          <div class="teams">
            ${teamCol(j.casa)}
            <div class="vs">
              <input class="score-in" inputmode="numeric" data-r="c" value="${r.c ?? ""}" placeholder="–" />
              <span class="x">×</span>
              <input class="score-in" inputmode="numeric" data-r="f" value="${r.f ?? ""}" placeholder="–" />
            </div>
            ${teamCol(j.fora)}
          </div>
          <div class="adm-ini"><span>${icon("clock")} Início:</span><input type="datetime-local" data-ini value="${inicioLocalInput(j)}" /></div>
        </div>`;
      }).join("")}
      <div class="spacer"></div>
      <button class="btn" id="salvarResultados">${icon("save")} Salvar todos os resultados</button>
      <div class="spacer"></div>
    ` + nav();

    document.getElementById("salvarCampeao").onclick = async()=>{
      State.resultados.campeao = document.getElementById("campeao").value || null;
      await Store.saveResultados({ campeao: State.resultados.campeao });
      toast("Campeão salvo");
    };
    document.getElementById("addJogo").onclick = async()=>{
      const casa=document.getElementById("nc").value, fora=document.getElementById("nf").value;
      const rotulo=document.getElementById("nrot").value.trim()||"Mata-mata";
      const data=document.getElementById("ndata").value;
      const hora=document.getElementById("nhora").value||"16:00";
      if (casa===fora) return toast("Escolha times diferentes");
      State.resultados.custom = State.resultados.custom || [];
      State.resultados.custom.push({ id:"K"+Date.now(), casa, fora, rotulo, data, inicio:`${data}T${hora}:00-03:00`, fase:"mata", grupo:"—" });
      await Store.saveResultados({ custom: State.resultados.custom });
      toast("Jogo adicionado"); render();
    };
    document.getElementById("salvarResultados").onclick = async()=>{
      const novos = Object.assign({}, real);
      const novosEdits = JSON.parse(JSON.stringify(State.resultados.edits || {}));
      root().querySelectorAll("[data-adm]").forEach((card)=>{
        const id=card.dataset.adm;
        const c=card.querySelector('[data-r="c"]').value;
        const f=card.querySelector('[data-r="f"]').value;
        if (c===""||f==="") delete novos[id];
        else novos[id]={ c:Math.max(0,parseInt(c)||0), f:Math.max(0,parseInt(f)||0) };
        // horário de início
        const ini=card.querySelector('[data-ini]').value;
        if (ini){ (novosEdits[id]=novosEdits[id]||{}).inicio = `${ini}:00-03:00`; }
      });
      State.resultados.jogos = novos;
      State.resultados.edits = novosEdits;
      await Store.saveResultados({ jogos: novos, edits: novosEdits });
      State.palpites = await Store.getAllPalpites();
      toast("Resultados e horários salvos");
    };
  }
  function optTimes(){ return D.TODAS_SELECOES.map((t)=>`<option value="${esc(t)}">${esc(t)}</option>`).join(""); }

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
    document.querySelectorAll("[data-nav]").forEach((b)=> b.onclick=()=>{ State.view=b.dataset.nav; State._filtroDia="todos"; render(); });
    const lo = document.querySelector("[data-logout]"); if (lo) lo.onclick = logout;
  }

  /* ============================================================
     PWA
     ============================================================ */
  function gerarAppleIcon() {
    try {
      const size=180, c=document.createElement("canvas"); c.width=c.height=size; const x=c.getContext("2d");
      const g=x.createLinearGradient(0,0,size,size); g.addColorStop(0,"#15875a"); g.addColorStop(1,"#0e5e3e");
      x.fillStyle=g; x.fillRect(0,0,size,size);
      x.font="92px serif"; x.textAlign="center"; x.textBaseline="middle"; x.fillStyle="#f4b400"; x.fillText("🏆",size/2,size/2-6);
      x.fillStyle="#fff"; x.font="900 26px -apple-system,Arial"; x.fillText("BABES",size/2,size-26);
      const link=document.getElementById("apple-icon"); if(link) link.href=c.toDataURL("image/png");
    } catch(e){}
  }
  function registrarSW(){ if("serviceWorker" in navigator && location.protocol!=="file:") navigator.serviceWorker.register("sw.js").catch(()=>{}); }

  (async function init(){ gerarAppleIcon(); registrarSW(); await render(); })();
})();
