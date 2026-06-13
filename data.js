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

// Datas (rodada por grupo) — fase de grupos, Copa 2026
// [Rodada1, Rodada2, Rodada3]
const DATAS_GRUPO = {
  A: ["2026-06-11", "2026-06-18", "2026-06-24"],
  B: ["2026-06-12", "2026-06-18", "2026-06-24"],
  C: ["2026-06-13", "2026-06-19", "2026-06-24"],
  D: ["2026-06-13", "2026-06-19", "2026-06-25"],
  E: ["2026-06-14", "2026-06-20", "2026-06-25"],
  F: ["2026-06-14", "2026-06-20", "2026-06-25"],
  G: ["2026-06-15", "2026-06-21", "2026-06-26"],
  H: ["2026-06-15", "2026-06-21", "2026-06-26"],
  I: ["2026-06-16", "2026-06-22", "2026-06-26"],
  J: ["2026-06-16", "2026-06-22", "2026-06-27"],
  K: ["2026-06-17", "2026-06-23", "2026-06-27"],
  L: ["2026-06-17", "2026-06-23", "2026-06-27"],
};

/* Gera os 6 jogos de cada grupo seguindo o padrão de pontos corridos:
   Rodada 1: (1 x 2), (3 x 4)
   Rodada 2: (1 x 3), (4 x 2)
   Rodada 3: (4 x 1), (2 x 3)
   Cada jogo recebe um id estável tipo "C1".."C6".               */
function gerarJogosFaseDeGrupos() {
  const jogos = [];
  for (const g of Object.keys(GRUPOS)) {
    const t = GRUPOS[g];
    const d = DATAS_GRUPO[g];
    const confrontos = [
      [t[0], t[1], d[0]],
      [t[2], t[3], d[0]],
      [t[0], t[2], d[1]],
      [t[3], t[1], d[1]],
      [t[3], t[0], d[2]],
      [t[1], t[2], d[2]],
    ];
    confrontos.forEach((c, i) => {
      jogos.push({
        id: g + (i + 1),
        grupo: g,
        fase: "grupos",
        casa: c[0],
        fora: c[1],
        data: c[2],
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

window.BOLAO_DATA = {
  GRUPOS, BANDEIRAS, JOGOS_BASE, TODAS_SELECOES, TIME_BRASIL,
  PONTUACAO_PADRAO, MODULOS,
};
