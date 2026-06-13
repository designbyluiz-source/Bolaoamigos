/* ============================================================
   BOLÃO DOS BABES — App (Copa do Mundo 2026)
   Front puro. Modo COMPARTILHADO via Firebase (se configurado)
   ou modo LOCAL (localStorage) para testar sem configurar nada.
   ============================================================ */
(function () {
  "use strict";

  const D = window.BOLAO_DATA;
  const CFG = window.SUPABASE_CONFIG || {};
  const ADMIN_SENHA = window.ADMIN_SENHA || "babes2026";

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
     CAMADA DE DADOS (mesma interface para os dois modos)
     Supabase: tabelas `config(id text pk, data jsonb)` e
     `palpites(id text pk, data jsonb)`. Veja supabase-schema.sql.
     ============================================================ */
  const LS = {
    get(k, def) { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } },
    set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
  };

  const Store = {
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
    async getPalpite(nome) {
      const id = nome.toLowerCase();
      if (sb) {
        const { data, error } = await sb.from("palpites").select("data").eq("id", id).maybeSingle();
        if (error) { console.warn(error); return null; }
        return data ? data.data : null;
      }
      return LS.get("babes_palpites", {})[id] || null;
    },
    async savePalpite(nome, partial) {
      const id = nome.toLowerCase();
      if (sb) {
        const atual = (await this.getPalpite(nome)) || {};
        const doc = Object.assign({ nome, id }, atual, partial, { updatedAt: Date.now() });
        const { error } = await sb.from("palpites").upsert({ id, data: doc });
        if (error) { console.warn(error); toast("Erro ao salvar (veja o console)"); }
      } else {
        const map = LS.get("babes_palpites", {});
        const doc = Object.assign({ nome, id }, map[id] || {}, partial, { updatedAt: Date.now() });
        map[id] = doc;
        LS.set("babes_palpites", map);
      }
    },
  };

  /* ============================================================
     ESTADO
     ============================================================ */
  const State = {
    user: LS.get("babes_user", null),     // nome do usuário neste aparelho
    view: "home",
    resultados: {},   // { jogos:{id:{c,f}}, campeao, edits:{id:{casa,fora,data}}, custom:[...], pontuacao:{} }
    meuPalpite: null, // { jogos:{id:{c,f}}, campeao }
    palpites: [],     // todos (para ranking)
  };

  function pontuacao() {
    return Object.assign({}, D.PONTUACAO_PADRAO, State.resultados.pontuacao || {});
  }

  /* Lista efetiva de jogos = base (com edições do admin) + custom (mata-mata) */
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

  // pontos de um palpite em um jogo específico
  function pontosJogo(palpiteJogo, real, P) {
    if (!palpiteJogo || !real) return { pts: 0, tag: "aberto" };
    if (real.c == null || real.f == null) return { pts: 0, tag: "aberto" };
    if (palpiteJogo.c == null || palpiteJogo.f == null) return { pts: 0, tag: "zero" };
    const pc = +palpiteJogo.c, pf = +palpiteJogo.f, rc = +real.c, rf = +real.f;
    if (pc === rc && pf === rf) return { pts: P.placarExato, tag: "exato" };
    if (sinal(pc, pf) === sinal(rc, rf)) return { pts: P.vencedor, tag: "parcial" };
    return { pts: 0, tag: "zero" };
  }

  // calcula totais por módulo para um palpite
  function calcular(palpite) {
    const P = pontuacao();
    const real = State.resultados.jogos || {};
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
    if (State.resultados.campeao && palpite && palpite.campeao === State.resultados.campeao) {
      campeao = P.campeao;
    }
    return { completo, brasil, campeao, total: completo + campeao, exatos, parciais };
  }

  /* ============================================================
     HELPERS DE UI
     ============================================================ */
  const root = () => document.getElementById("root");
  const flag = (t) => D.BANDEIRAS[t] || "🏳️";
  function fmtData(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}`;
  }
  function toast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 1800);
  }
  function esc(s){ return String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  async function carregarTudo() {
    State.resultados = await Store.getResultados();
    if (State.user) State.meuPalpite = (await Store.getPalpite(State.user)) || { jogos: {}, campeao: null };
  }

  /* ============================================================
     TELA: ONBOARDING (escolher nome de usuário)
     ============================================================ */
  function viewOnboard() {
    root().innerHTML = `
      <div style="height:8vh"></div>
      <div class="card center">
        <div class="brand" style="justify-content:center;margin-bottom:6px">
          <div class="logo">🏆</div>
          <div>BOLÃO DOS BABES<small>Copa do Mundo 2026</small></div>
        </div>
        <p class="muted" style="margin:8px 0 18px">Escolha seu nome de usuário para participar. Sem senha — só o nome.</p>
        <label>Seu nome / apelido</label>
        <input id="nome" placeholder="Ex: Luiz" maxlength="20" autocomplete="off" />
        <div class="spacer"></div>
        <button class="btn" id="entrar">Entrar no bolão ⚽</button>
        <p class="muted" style="font-size:12px;margin-top:14px">
          ${MODO === "compartilhado"
            ? "Modo compartilhado: todos veem o mesmo ranking."
            : "Modo local: rodando só neste aparelho (configure o Firebase para compartilhar)."}
        </p>
      </div>`;
    const inp = document.getElementById("nome");
    inp.focus();
    document.getElementById("entrar").onclick = async () => {
      const nome = inp.value.trim();
      if (nome.length < 2) return toast("Digite um nome válido");
      State.user = nome;
      LS.set("babes_user", nome);
      await Store.savePalpite(nome, { jogos: {}, campeao: null });
      State.meuPalpite = (await Store.getPalpite(nome)) || { jogos: {}, campeao: null };
      State.view = "home";
      render();
    };
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") document.getElementById("entrar").click(); });
  }

  /* ============================================================
     COMPONENTES
     ============================================================ */
  function topbar() {
    return `
      <div class="topbar">
        <div class="brand"><div class="logo">🏆</div><div>BABES<small>Copa 2026</small></div></div>
        <div class="who"><span class="pill">👤 ${esc(State.user)}</span></div>
      </div>`;
  }

  function nav() {
    const items = [
      ["home", "🏠", "Início"],
      ["brasil", "🇧🇷", "Brasil"],
      ["completo", "🌎", "Completo"],
      ["ranking", "📊", "Ranking"],
      ["admin", "⚙️", "Admin"],
    ];
    return `<div class="nav">${items.map(([v, i, t]) =>
      `<button data-nav="${v}" class="${State.view === v || (State.view==='campeao'&&v==='home') ? "active" : ""}">
        <span class="ni">${i}</span>${t}</button>`).join("")}</div>`;
  }

  // Card de um jogo com inputs de palpite
  function matchCard(j) {
    const real = (State.resultados.jogos || {})[j.id] || {};
    const temReal = real.c != null && real.f != null;
    const pj = (State.meuPalpite.jogos || {})[j.id] || {};
    const P = pontuacao();
    const r = pontosJogo(pj, real, P);
    let tagHtml = "";
    if (temReal) {
      const map = { exato: `✓ Placar exato +${P.placarExato}`, parcial: `✓ Vencedor +${P.vencedor}`, zero: "✗ 0 pontos" };
      tagHtml = `<span class="tag ${r.tag}">${map[r.tag] || ""}</span>`;
    }
    const lock = temReal ? "disabled" : "";
    return `
      <div class="match" data-match="${j.id}">
        <div class="top">
          <span class="badge">${j.fase === "grupos" ? "Grupo " + j.grupo : (j.rotulo || "Mata-mata")}</span>
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
        ${temReal ? `<div class="result-line">Resultado real: <span class="real">${real.c} x ${real.f}</span> ${tagHtml}</div>`
                  : `<div class="result-line muted">Aguardando o jogo… edite seu palpite quando quiser.</div>`}
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
          await Store.savePalpite(State.user, { jogos: State.meuPalpite.jogos });
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
      ["brasil", "brasil", D.MODULOS.brasil],
      ["completo", "completo", D.MODULOS.completo],
      ["campeao", "campeao", D.MODULOS.campeao],
    ];
    root().innerHTML = topbar() + `
      <div class="kpi">
        <div class="box"><b>${stats.total}</b><span>PONTOS TOTAIS</span></div>
        <div class="box"><b>${stats.exatos}</b><span>PLACARES EXATOS</span></div>
        <div class="box"><b>${stats.parciais}</b><span>VENCEDORES</span></div>
      </div>
      <div class="section-title">Escolha um bolão</div>
      <div class="mods">
        ${mods.map(([v, cls, m]) => `
          <div class="mod ${cls}" data-go="${v}">
            <div class="ico">${m.emoji}</div>
            <div class="meta"><b>${m.nome}</b><p>${m.desc}</p></div>
            <div class="chev">›</div>
          </div>`).join("")}
      </div>
      <div class="mode-banner">${MODO === "compartilhado"
        ? "🟢 Ranking compartilhado ativo"
        : "🟡 Modo local (só este aparelho). Veja o README para ativar o compartilhado."}</div>
    ` + nav();
    root().querySelectorAll("[data-go]").forEach((e) =>
      e.onclick = () => { State.view = e.dataset.go; render(); });
  }

  /* ============================================================
     TELA: BOLÃO BRASIL / COMPLETO (palpites de jogos)
     ============================================================ */
  function viewJogos(tipo) {
    const isBrasil = tipo === "brasil";
    let jogos = isBrasil ? jogosDoBrasil() : jogosEfetivos();
    jogos = jogos.slice().sort((a, b) => (a.data || "").localeCompare(b.data || "") || a.id.localeCompare(b.id));

    const m = isBrasil ? D.MODULOS.brasil : D.MODULOS.completo;
    const stats = calcular(State.meuPalpite);
    const pontos = isBrasil ? stats.brasil : stats.completo;

    // filtro por dia (para o completo)
    const dias = [...new Set(jogos.map((j) => j.data))].sort();
    const filtro = State._filtroDia || "todos";
    let lista = jogos;
    if (!isBrasil && filtro !== "todos") lista = jogos.filter((j) => j.data === filtro);

    const tabs = isBrasil ? "" : `
      <div class="tabs">
        <div class="tab ${filtro === "todos" ? "active" : ""}" data-dia="todos">Todos</div>
        ${dias.map((d) => `<div class="tab ${filtro === d ? "active" : ""}" data-dia="${d}">${fmtData(d)}</div>`).join("")}
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
    root().querySelector("[data-back]").onclick = () => { State.view = "home"; render(); };
    root().querySelectorAll("[data-dia]").forEach((e) =>
      e.onclick = () => { State._filtroDia = e.dataset.dia; render(); });
  }

  /* ============================================================
     TELA: BOLÃO DO CAMPEÃO
     ============================================================ */
  function viewCampeao() {
    const escolhido = State.meuPalpite.campeao;
    const oficial = State.resultados.campeao;
    const P = pontuacao();
    const times = D.TODAS_SELECOES;
    root().innerHTML = topbar() + `
      <div class="section-title">🏆 ${D.MODULOS.campeao.nome}</div>
      <div class="card">
        <p class="muted" style="margin-top:0">Quem vai levantar a taça da Copa 2026? Acertar vale <b style="color:var(--gold)">${P.campeao} pontos</b>.</p>
        ${oficial ? `<p>Campeão oficial: <b style="color:var(--gold)">${flag(oficial)} ${esc(oficial)}</b> ${escolhido===oficial?'— você acertou! 🎉':''}</p>` : ``}
        ${escolhido ? `<p>Seu palpite atual: <b>${flag(escolhido)} ${esc(escolhido)}</b></p>` : `<p class="muted">Toque numa seleção para escolher.</p>`}
      </div>
      <div class="champ-grid">
        ${times.map((t) => `
          <div class="champ ${escolhido === t ? "sel" : ""}" data-champ="${esc(t)}">
            <div class="flag">${flag(t)}</div><div class="nm">${esc(t)}</div>
          </div>`).join("")}
      </div>
      <div class="spacer"></div>
      <button class="btn secondary" data-back>‹ Voltar ao início</button>
      <div class="spacer"></div>
    ` + nav();

    const lock = !!oficial;
    root().querySelectorAll("[data-champ]").forEach((e) => e.onclick = async () => {
      if (lock) return toast("O campeão já foi definido");
      State.meuPalpite.campeao = e.dataset.champ;
      await Store.savePalpite(State.user, { campeao: e.dataset.champ });
      toast("Campeão escolhido 🏆");
      render();
    });
    root().querySelector("[data-back]").onclick = () => { State.view = "home"; render(); };
  }

  /* ============================================================
     TELA: RANKING
     ============================================================ */
  function viewRanking() {
    const aba = State._rankAba || "completo";
    const rows = State.palpites.map((p) => ({ p, s: calcular(p) }));
    const keyMap = { completo: "total", brasil: "brasil", campeao: "campeao" };
    const k = keyMap[aba];
    rows.sort((a, b) => b.s[k] - a.s[k] || (a.p.nome || "").localeCompare(b.p.nome || ""));

    root().innerHTML = topbar() + `
      <div class="section-title">📊 Ranking</div>
      <div class="tabs">
        <div class="tab ${aba==="completo"?"active":""}" data-aba="completo">🌎 Geral</div>
        <div class="tab ${aba==="brasil"?"active":""}" data-aba="brasil">🇧🇷 Brasil</div>
        <div class="tab ${aba==="campeao"?"active":""}" data-aba="campeao">🏆 Campeão</div>
      </div>
      <div class="card">
        ${rows.length ? rows.map((row, i) => {
          const me = row.p.nome === State.user;
          const pos = i + 1;
          const cls = pos <= 3 ? "p" + pos : "";
          const s = row.s;
          const sub = aba === "completo"
            ? `${s.exatos} exatos · ${s.parciais} vencedores${s.campeao?' · campeão ✓':''}`
            : aba === "brasil" ? `pontos nos jogos do Brasil`
            : (row.p.campeao ? `palpite: ${flag(row.p.campeao)} ${esc(row.p.campeao)}` : "sem palpite");
          return `<div class="rank-row ${me?"me":""}">
            <div class="rank-pos ${cls}">${pos}</div>
            <div class="rank-name">${esc(row.p.nome||"?")}${me?" (você)":""}<small>${sub}</small></div>
            <div class="rank-pts">${s[k]}<small> pts</small></div>
          </div>`;
        }).join("") : `<div class="empty">Ninguém pontuou ainda.<br>Os pontos aparecem quando o admin lançar resultados.</div>`}
      </div>
      <button class="btn ghost small" data-refresh>↻ Atualizar</button>
      <div class="spacer"></div>
    ` + nav();

    root().querySelectorAll("[data-aba]").forEach((e) =>
      e.onclick = () => { State._rankAba = e.dataset.aba; render(); });
    root().querySelector("[data-refresh]").onclick = async () => {
      State.palpites = await Store.getAllPalpites(); toast("Atualizado ✓"); render();
    };
  }

  /* ============================================================
     TELA: ADMIN (lançar resultados + campeão)
     ============================================================ */
  function viewAdmin() {
    if (!State._adminOk) {
      root().innerHTML = topbar() + `
        <div class="section-title">⚙️ Painel Admin</div>
        <div class="card">
          <p class="muted" style="margin-top:0">Área para lançar os resultados oficiais. Digite a senha de admin.</p>
          <label>Senha</label>
          <input id="senha" type="password" placeholder="••••••" />
          <div class="spacer"></div>
          <button class="btn" id="login">Entrar</button>
        </div>` + nav();
      document.getElementById("login").onclick = () => {
        if (document.getElementById("senha").value === ADMIN_SENHA) { State._adminOk = true; render(); }
        else toast("Senha incorreta");
      };
      return;
    }

    const P = pontuacao();
    let jogos = jogosEfetivos().slice().sort((a,b)=>(a.data||"").localeCompare(b.data||"")||a.id.localeCompare(b.id));
    const real = State.resultados.jogos || {};

    root().innerHTML = topbar() + `
      <div class="section-title">⚙️ Painel Admin</div>

      <div class="card">
        <b>🏆 Definir campeão da Copa</b>
        <p class="muted" style="font-size:12px;margin:6px 0 8px">Define o campeão e pontua o "Bolão do Campeão" (+${P.campeao}).</p>
        <select id="campeao">
          <option value="">— ainda não definido —</option>
          ${D.TODAS_SELECOES.map((t)=>`<option value="${esc(t)}" ${State.resultados.campeao===t?"selected":""}>${flag(t)} ${esc(t)}</option>`).join("")}
        </select>
        <div class="spacer"></div>
        <button class="btn gold small" id="salvarCampeao">Salvar campeão</button>
      </div>

      <div class="card">
        <b>⚽ Adicionar jogo de mata-mata</b>
        <p class="muted" style="font-size:12px;margin:6px 0 8px">Use para incluir oitavas, quartas, semi e final conforme forem definidas.</p>
        <div class="row"><select id="nc">${optTimes()}</select><select id="nf">${optTimes()}</select></div>
        <div class="spacer"></div>
        <div class="row">
          <input id="nrot" placeholder="Rótulo (ex: Oitavas)" />
          <input id="ndata" type="date" value="2026-06-28" />
        </div>
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
      <button class="btn ghost small" id="sairAdmin">Sair do admin</button>
      <div class="spacer"></div>
    ` + nav();

    document.getElementById("salvarCampeao").onclick = async () => {
      State.resultados.campeao = document.getElementById("campeao").value || null;
      await Store.saveResultados({ campeao: State.resultados.campeao });
      toast("Campeão salvo 🏆");
    };
    document.getElementById("addJogo").onclick = async () => {
      const casa = document.getElementById("nc").value, fora = document.getElementById("nf").value;
      const rotulo = document.getElementById("nrot").value.trim() || "Mata-mata";
      const data = document.getElementById("ndata").value;
      if (casa === fora) return toast("Escolha times diferentes");
      State.resultados.custom = State.resultados.custom || [];
      State.resultados.custom.push({ id: "K" + Date.now(), casa, fora, rotulo, data, fase: "mata", grupo: "—" });
      await Store.saveResultados({ custom: State.resultados.custom });
      toast("Jogo adicionado ✓"); render();
    };
    document.getElementById("salvarResultados").onclick = async () => {
      const novos = Object.assign({}, real);
      root().querySelectorAll("[data-adm]").forEach((card) => {
        const id = card.dataset.adm;
        const c = card.querySelector('[data-r="c"]').value;
        const f = card.querySelector('[data-r="f"]').value;
        if (c === "" || f === "") { delete novos[id]; }
        else novos[id] = { c: Math.max(0,parseInt(c)||0), f: Math.max(0,parseInt(f)||0) };
      });
      State.resultados.jogos = novos;
      await Store.saveResultados({ jogos: novos });
      State.palpites = await Store.getAllPalpites();
      toast("Resultados salvos ✓ ranking atualizado");
    };
    document.getElementById("sairAdmin").onclick = () => { State._adminOk = false; State.view = "home"; render(); };
  }
  function optTimes(){ return D.TODAS_SELECOES.map((t)=>`<option value="${esc(t)}">${flag(t)} ${esc(t)}</option>`).join(""); }

  /* ============================================================
     ROTEADOR
     ============================================================ */
  async function render() {
    if (!State.user) return viewOnboard();
    // recarrega dados a cada navegação para ranking/resultados frescos
    State.resultados = await Store.getResultados();
    State.meuPalpite = (await Store.getPalpite(State.user)) || { jogos: {}, campeao: null };
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
    // liga navegação inferior
    document.querySelectorAll("[data-nav]").forEach((b) =>
      b.onclick = () => { State.view = b.dataset.nav; State._adminOk = State._adminOk; render(); });
  }

  /* ============================================================
     PWA: gera ícone PNG p/ tela inicial do iPhone (via canvas)
     ============================================================ */
  function gerarAppleIcon() {
    try {
      const size = 180, c = document.createElement("canvas");
      c.width = c.height = size; const x = c.getContext("2d");
      const g = x.createLinearGradient(0, 0, size, size);
      g.addColorStop(0, "#00d4a0"); g.addColorStop(.55, "#0ea5e9"); g.addColorStop(1, "#7c3aed");
      x.fillStyle = g; x.fillRect(0, 0, size, size);
      x.font = "92px serif"; x.textAlign = "center"; x.textBaseline = "middle";
      x.fillText("🏆", size/2, size/2 - 6);
      x.fillStyle = "#fff"; x.font = "900 26px -apple-system,Arial";
      x.fillText("BABES", size/2, size - 26);
      const url = c.toDataURL("image/png");
      const link = document.getElementById("apple-icon");
      if (link) link.href = url;
    } catch (e) { /* mantém o SVG */ }
  }

  function registrarSW() {
    if ("serviceWorker" in navigator && location.protocol !== "file:") {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }
  }

  /* ============================================================
     INÍCIO
     ============================================================ */
  (async function init() {
    gerarAppleIcon();
    registrarSW();
    await carregarTudo();
    render();
  })();
})();
