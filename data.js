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

// Lista base de jogos (fase de grupos). O admin pode adicionar mata-matas.
const JOGOS_BASE = gerarJogosFaseDeGrupos();

// Brasil: jogos do "Bolão do Brasil" = jogos da fase de grupos com o Brasil
const TIME_BRASIL = "Brasil";

// Todas as seleções (para o palpite de campeão)
const TODAS_SELECOES = Object.values(GRUPOS).flat().sort((a, b) => a.localeCompare(b, "pt"));

// Regras de pontuação (o admin pode ajustar no painel)
const PONTUACAO_PADRAO = {
  placarExato: 5,   // acertou o placar exato
  vencedor: 2,      // acertou só quem venceu / empate
  campeao: 10,      // acertou o campeão da Copa
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
  PONTUACAO_PADRAO, MODULOS, RESULTADOS_INICIAIS,
};
