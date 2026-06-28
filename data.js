/* ============================================================
   BOLÃO DOS BABES — Dados da Copa do Mundo 2026
   ------------------------------------------------------------
   Composição dos 12 grupos (A–L). A posição 1 é a cabeça de chave.
   Os jogos da fase de grupos são gerados automaticamente a partir
   destes grupos. Você pode EDITAR qualquer jogo, data ou time pelo
   Painel Admin dentro do app (e também adicionar jogos do mata-mata).
   ============================================================ */

const GRUPOS = {
  A: ["México", "África do Sul", "Coreia do Sul", "Rep. Tcheca"],
  B: ["Canadá", "Bósnia e Herz.", "Catar", "Suíça"],
  C: ["Brasil", "Marrocos", "Haiti", "Escócia"],
  D: ["Estados Unidos", "Paraguai", "Austrália", "Turquia"],
  E: ["Alemanha", "Curaçao", "Costa do Marfim", "Equador"],
  F: ["Holanda", "Japão", "Suécia", "Tunísia"],
  G: ["Bélgica", "Egito", "Irã", "Nova Zelândia"],
  H: ["Espanha", "Cabo Verde", "Arábia Saudita", "Uruguai"],
  I: ["França", "Senegal", "Iraque", "Noruega"],
  J: ["Argentina", "Argélia", "Áustria", "Jordânia"],
  K: ["Portugal", "RD Congo", "Uzbequistão", "Colômbia"],
  L: ["Inglaterra", "Croácia", "Gana", "Panamá"],
};

// Bandeiras (emoji) por seleção — usadas na interface
const BANDEIRAS = {
  "México": "🇲🇽", "África do Sul": "🇿🇦", "Coreia do Sul": "🇰🇷", "Rep. Tcheca": "🇨🇿",
  "Canadá": "🇨🇦", "Bósnia e Herz.": "🇧🇦", "Catar": "🇶🇦", "Suíça": "🇨🇭",
  "Brasil": "🇧🇷", "Marrocos": "🇲🇦", "Haiti": "🇭🇹", "Escócia": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Estados Unidos": "🇺🇸", "Paraguai": "🇵🇾", "Austrália": "🇦🇺", "Turquia": "🇹🇷",
  "Alemanha": "🇩🇪", "Curaçao": "🇨🇼", "Costa do Marfim": "🇨🇮", "Equador": "🇪🇨",
  "Holanda": "🇳🇱", "Japão": "🇯🇵", "Suécia": "🇸🇪", "Tunísia": "🇹🇳",
  "Bélgica": "🇧🇪", "Egito": "🇪🇬", "Irã": "🇮🇷", "Nova Zelândia": "🇳🇿",
  "Espanha": "🇪🇸", "Cabo Verde": "🇨🇻", "Arábia Saudita": "🇸🇦", "Uruguai": "🇺🇾",
  "França": "🇫🇷", "Senegal": "🇸🇳", "Iraque": "🇮🇶", "Noruega": "🇳🇴",
  "Argentina": "🇦🇷", "Argélia": "🇩🇿", "Áustria": "🇦🇹", "Jordânia": "🇯🇴",
  "Portugal": "🇵🇹", "RD Congo": "🇨🇩", "Uzbequistão": "🇺🇿", "Colômbia": "🇨🇴",
  "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Croácia": "🇭🇷", "Gana": "🇬🇭", "Panamá": "🇵🇦",
};

// Código ISO (flagcdn) de cada seleção — para mostrar a bandeira como imagem
const TEAM_ISO = {
  "México":"mx","África do Sul":"za","Coreia do Sul":"kr","Rep. Tcheca":"cz",
  "Canadá":"ca","Bósnia e Herz.":"ba","Catar":"qa","Suíça":"ch",
  "Brasil":"br","Marrocos":"ma","Haiti":"ht","Escócia":"gb-sct",
  "Estados Unidos":"us","Paraguai":"py","Austrália":"au","Turquia":"tr",
  "Alemanha":"de","Curaçao":"cw","Costa do Marfim":"ci","Equador":"ec",
  "Holanda":"nl","Japão":"jp","Suécia":"se","Tunísia":"tn",
  "Bélgica":"be","Egito":"eg","Irã":"ir","Nova Zelândia":"nz",
  "Espanha":"es","Cabo Verde":"cv","Arábia Saudita":"sa","Uruguai":"uy",
  "França":"fr","Senegal":"sn","Iraque":"iq","Noruega":"no",
  "Argentina":"ar","Argélia":"dz","Áustria":"at","Jordânia":"jo",
  "Portugal":"pt","RD Congo":"cd","Uzbequistão":"uz","Colômbia":"co",
  "Inglaterra":"gb-eng","Croácia":"hr","Gana":"gh","Panamá":"pa",
};

/* AGENDA OFICIAL (fonte: tabela enviada). Data + horário de cada jogo.
   Os horários estão em EDT (horário do leste dos EUA, fuso da Copa) e o
   app exibe convertido para o horário de Brasília automaticamente.
   IDs estáveis: <grupo><n>, onde os 6 jogos de cada grupo seguem o padrão:
   1:(t1×t2) 2:(t3×t4) 3:(t1×t3) 4:(t4×t2) 5:(t4×t1) 6:(t2×t3).      */
const AGENDA = {
  // Grupo A
  A1: ["2026-06-11","16:00"], A2: ["2026-06-11","19:00"], A3: ["2026-06-18","21:00"],
  A4: ["2026-06-18","12:00"], A5: ["2026-06-24","21:00"], A6: ["2026-06-24","21:00"],
  // Grupo B
  B1: ["2026-06-12","16:00"], B2: ["2026-06-13","15:00"], B3: ["2026-06-18","18:00"],
  B4: ["2026-06-18","15:00"], B5: ["2026-06-24","15:00"], B6: ["2026-06-24","15:00"],
  // Grupo C
  C1: ["2026-06-13","18:00"], C2: ["2026-06-13","21:00"], C3: ["2026-06-19","20:30"],
  C4: ["2026-06-19","18:00"], C5: ["2026-06-24","18:00"], C6: ["2026-06-24","18:00"],
  // Grupo D
  D1: ["2026-06-12","19:00"], D2: ["2026-06-14","00:00"], D3: ["2026-06-19","15:00"],
  D4: ["2026-06-19","23:00"], D5: ["2026-06-25","22:00"], D6: ["2026-06-25","22:00"],
  // Grupo E
  E1: ["2026-06-14","13:00"], E2: ["2026-06-14","19:00"], E3: ["2026-06-20","16:00"],
  E4: ["2026-06-20","20:00"], E5: ["2026-06-25","16:00"], E6: ["2026-06-25","16:00"],
  // Grupo F
  F1: ["2026-06-14","16:00"], F2: ["2026-06-14","22:00"], F3: ["2026-06-20","13:00"],
  F4: ["2026-06-21","00:00"], F5: ["2026-06-25","19:00"], F6: ["2026-06-25","19:00"],
  // Grupo G
  G1: ["2026-06-15","15:00"], G2: ["2026-06-15","21:00"], G3: ["2026-06-21","15:00"],
  G4: ["2026-06-21","21:00"], G5: ["2026-06-26","23:00"], G6: ["2026-06-26","23:00"],
  // Grupo H
  H1: ["2026-06-15","12:00"], H2: ["2026-06-15","18:00"], H3: ["2026-06-21","12:00"],
  H4: ["2026-06-21","18:00"], H5: ["2026-06-26","20:00"], H6: ["2026-06-26","20:00"],
  // Grupo I
  I1: ["2026-06-16","15:00"], I2: ["2026-06-16","18:00"], I3: ["2026-06-22","17:00"],
  I4: ["2026-06-22","20:00"], I5: ["2026-06-26","15:00"], I6: ["2026-06-26","15:00"],
  // Grupo J
  J1: ["2026-06-16","21:00"], J2: ["2026-06-17","00:00"], J3: ["2026-06-22","13:00"],
  J4: ["2026-06-22","23:00"], J5: ["2026-06-27","22:00"], J6: ["2026-06-27","22:00"],
  // Grupo K
  K1: ["2026-06-17","13:00"], K2: ["2026-06-17","22:00"], K3: ["2026-06-23","13:00"],
  K4: ["2026-06-23","22:00"], K5: ["2026-06-27","19:30"], K6: ["2026-06-27","19:30"],
  // Grupo L
  L1: ["2026-06-17","16:00"], L2: ["2026-06-17","19:00"], L3: ["2026-06-23","16:00"],
  L4: ["2026-06-23","19:00"], L5: ["2026-06-27","17:00"], L6: ["2026-06-27","17:00"],
};

function gerarJogosFaseDeGrupos() {
  const jogos = [];
  for (const g of Object.keys(GRUPOS)) {
    const t = GRUPOS[g];
    const confrontos = [
      [t[0], t[1]], // n1
      [t[2], t[3]], // n2
      [t[0], t[2]], // n3
      [t[3], t[1]], // n4
      [t[3], t[0]], // n5
      [t[1], t[2]], // n6
    ];
    confrontos.forEach((c, i) => {
      const id = g + (i + 1);
      const ag = AGENDA[id] || ["2026-06-30", "16:00"];
      jogos.push({
        id,
        grupo: g,
        fase: "grupos",
        casa: c[0],
        fora: c[1],
        data: ag[0],
        inicio: `${ag[0]}T${ag[1]}:00-04:00`, // EDT (fuso da Copa)
      });
    });
  }
  return jogos;
}

/* ============================================================
   FASE MATA-MATA — Copa do Mundo 2026
   ------------------------------------------------------------
   Confrontos definidos após a fase de grupos. Horários em
   horário de Brasília (-03:00). Times com placeholder (ex.
   "Vencedor Brasil/Japão") são preenchidos conforme avança a
   competição — basta editar o jogo no Painel Admin.
   Nomes normalizados p/ casar com as bandeiras:
   Países Baixos→Holanda, Congo→RD Congo, Bósnia e Herzegovina→Bósnia e Herz.
   ============================================================ */
function gerarJogosMataMata() {
  const m = (id, rotulo, casa, fora, data, hora) => ({
    id, fase: "mata", grupo: "—", rotulo, casa, fora,
    data, inicio: `${data}T${hora}:00-03:00`,
  });
  return [
    // ---- 16-avos de final (Round of 32) ----
    m("M73", "16-avos", "África do Sul", "Canadá", "2026-06-28", "16:00"),
    m("M74", "16-avos", "Brasil", "Japão", "2026-06-29", "14:00"),
    m("M75", "16-avos", "Alemanha", "Paraguai", "2026-06-29", "17:30"),
    m("M76", "16-avos", "Holanda", "Marrocos", "2026-06-29", "22:00"),
    m("M77", "16-avos", "Costa do Marfim", "Noruega", "2026-06-30", "14:00"),
    m("M78", "16-avos", "França", "Suécia", "2026-06-30", "18:00"),
    m("M79", "16-avos", "México", "Equador", "2026-06-30", "22:00"),
    m("M80", "16-avos", "Inglaterra", "RD Congo", "2026-07-01", "13:00"),
    m("M81", "16-avos", "Bélgica", "Senegal", "2026-07-01", "17:00"),
    m("M82", "16-avos", "Estados Unidos", "Bósnia e Herz.", "2026-07-01", "21:00"),
    m("M83", "16-avos", "Espanha", "Áustria", "2026-07-02", "16:00"),
    m("M84", "16-avos", "Portugal", "Croácia", "2026-07-02", "20:00"),
    m("M85", "16-avos", "Suíça", "Argélia", "2026-07-03", "00:00"),
    m("M86", "16-avos", "Austrália", "Egito", "2026-07-03", "15:00"),
    m("M87", "16-avos", "Argentina", "Cabo Verde", "2026-07-03", "19:00"),
    m("M88", "16-avos", "Colômbia", "Gana", "2026-07-03", "22:30"),
    // ---- Oitavas de final ----
    m("M89", "Oitavas", "Vencedor Alemanha/Paraguai", "Vencedor França/Suécia", "2026-07-04", "14:00"),
    m("M90", "Oitavas", "Vencedor África do Sul/Canadá", "Vencedor Holanda/Marrocos", "2026-07-04", "18:00"),
    m("M91", "Oitavas", "Vencedor Brasil/Japão", "Vencedor Costa do Marfim/Noruega", "2026-07-05", "17:00"),
    m("M92", "Oitavas", "Vencedor México/Equador", "Vencedor Inglaterra/RD Congo", "2026-07-05", "21:00"),
    m("M93", "Oitavas", "Vencedor Portugal/Croácia", "Vencedor Espanha/Áustria", "2026-07-06", "16:00"),
    m("M94", "Oitavas", "Vencedor Estados Unidos/Bósnia e Herz.", "Vencedor Bélgica/Senegal", "2026-07-06", "21:00"),
    m("M95", "Oitavas", "Vencedor Argentina/Cabo Verde", "Vencedor Austrália/Egito", "2026-07-07", "13:00"),
    m("M96", "Oitavas", "Vencedor Suíça/Argélia", "Vencedor Colômbia/Gana", "2026-07-07", "17:00"),
    // ---- Quartas de final (vencedores das oitavas, em ordem) ----
    m("M97", "Quartas", "Vencedor Oitava 1", "Vencedor Oitava 2", "2026-07-09", "17:00"),
    m("M98", "Quartas", "Vencedor Oitava 3", "Vencedor Oitava 4", "2026-07-10", "16:00"),
    m("M99", "Quartas", "Vencedor Oitava 5", "Vencedor Oitava 6", "2026-07-11", "18:00"),
    m("M100", "Quartas", "Vencedor Oitava 7", "Vencedor Oitava 8", "2026-07-11", "22:00"),
    // ---- Semifinais ----
    m("M101", "Semifinal", "Vencedor Quartas 1", "Vencedor Quartas 2", "2026-07-14", "16:00"),
    m("M102", "Semifinal", "Vencedor Quartas 3", "Vencedor Quartas 4", "2026-07-15", "16:00"),
    // ---- Disputa de 3º lugar ----
    m("M103", "3º lugar", "Perdedor Semifinal 1", "Perdedor Semifinal 2", "2026-07-18", "18:00"),
    // ---- Final ----
    m("M104", "Final", "Vencedor Semifinal 1", "Vencedor Semifinal 2", "2026-07-19", "16:00"),
  ];
}

// Lista base de jogos: fase de grupos + mata-mata. O admin ainda pode
// editar qualquer jogo ou adicionar avulsos pelo painel.
const JOGOS_BASE = gerarJogosFaseDeGrupos().concat(gerarJogosMataMata());

/* ============================================================
   CHAVEAMENTO — quem alimenta cada confronto
   ------------------------------------------------------------
   Cada jogo do mata-mata (a partir das oitavas) é alimentado por
   dois jogos anteriores. tipo "V" = vencedor; "L" = perdedor
   (usado só na disputa de 3º lugar). Quando o resultado do jogo
   de origem é salvo, o time já aparece sozinho no confronto seguinte.
   ============================================================ */
const BRACKET = {
  // Oitavas (alimentadas pelos 16-avos)
  M89: { casa: { jogo: "M75", tipo: "V" }, fora: { jogo: "M78", tipo: "V" } },
  M90: { casa: { jogo: "M73", tipo: "V" }, fora: { jogo: "M76", tipo: "V" } },
  M91: { casa: { jogo: "M74", tipo: "V" }, fora: { jogo: "M77", tipo: "V" } },
  M92: { casa: { jogo: "M79", tipo: "V" }, fora: { jogo: "M80", tipo: "V" } },
  M93: { casa: { jogo: "M84", tipo: "V" }, fora: { jogo: "M83", tipo: "V" } },
  M94: { casa: { jogo: "M82", tipo: "V" }, fora: { jogo: "M81", tipo: "V" } },
  M95: { casa: { jogo: "M87", tipo: "V" }, fora: { jogo: "M86", tipo: "V" } },
  M96: { casa: { jogo: "M85", tipo: "V" }, fora: { jogo: "M88", tipo: "V" } },
  // Quartas (alimentadas pelas oitavas, na ordem)
  M97:  { casa: { jogo: "M89", tipo: "V" }, fora: { jogo: "M90", tipo: "V" } },
  M98:  { casa: { jogo: "M91", tipo: "V" }, fora: { jogo: "M92", tipo: "V" } },
  M99:  { casa: { jogo: "M93", tipo: "V" }, fora: { jogo: "M94", tipo: "V" } },
  M100: { casa: { jogo: "M95", tipo: "V" }, fora: { jogo: "M96", tipo: "V" } },
  // Semifinais
  M101: { casa: { jogo: "M97", tipo: "V" }, fora: { jogo: "M98", tipo: "V" } },
  M102: { casa: { jogo: "M99", tipo: "V" }, fora: { jogo: "M100", tipo: "V" } },
  // Disputa de 3º lugar (perdedores das semis) e Final (vencedores)
  M103: { casa: { jogo: "M101", tipo: "L" }, fora: { jogo: "M102", tipo: "L" } },
  M104: { casa: { jogo: "M101", tipo: "V" }, fora: { jogo: "M102", tipo: "V" } },
};

// Brasil: jogos do "Bolão do Brasil" = jogos da fase de grupos com o Brasil
const TIME_BRASIL = "Brasil";

// Todas as seleções (para o palpite de campeão)
const TODAS_SELECOES = Object.values(GRUPOS).flat().sort((a, b) => a.localeCompare(b, "pt"));

// Regras de pontuação (o admin pode ajustar no painel)
const PONTUACAO_PADRAO = {
  placarExato: 5,   // acertou o placar exato
  vencedor: 2,      // acertou só quem venceu / empate
  campeao: 10,      // acertou o campeão da Copa
  penalti: 1,       // (mata-mata) cravou que o jogo iria para os pênaltis
};

// Configuração dos três módulos / bolões
const MODULOS = {
  brasil:  { nome: "Bolão do Brasil",  emoji: "🇧🇷", desc: "Palpite só nos jogos do Brasil" },
  completo:{ nome: "Bolão Completo",   emoji: "🌎", desc: "Palpite em todos os jogos da Copa" },
  campeao: { nome: "Bolão do Campeão", emoji: "🏆", desc: "Quem levanta a taça em 2026?" },
};

// Resultados de jogos que JÁ aconteceram (carregados de base).
// O admin pode sobrescrever qualquer um pelo painel.
//  A1 = México x África do Sul | A2 = Coreia do Sul x Rep. Tcheca
//  B1 = Canadá x Bósnia e Herz. | D1 = Estados Unidos x Paraguai
const RESULTADOS_INICIAIS = {
  A1: { c: 2, f: 0 },
  A2: { c: 2, f: 1 },
  B1: { c: 1, f: 1 },
  D1: { c: 4, f: 1 },
};

window.BOLAO_DATA = {
  GRUPOS, BANDEIRAS, TEAM_ISO, JOGOS_BASE, TODAS_SELECOES, TIME_BRASIL,
  PONTUACAO_PADRAO, MODULOS, RESULTADOS_INICIAIS, BRACKET,
};
