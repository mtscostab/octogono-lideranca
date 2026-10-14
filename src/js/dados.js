// Conteúdo estruturado da proposta. Fonte única: proposta comercial v4 (outubro/2026),
// artefatos/cliente-rodrigo-minotauro/projetos/proposta-comercial-champion/v4/index.html.
// Preços: dados pelo Ricardo em 08/10/2026 (README da v4). Não inventar texto aqui.

/** Os passos da cena do Octógono: abertura, Encarada, os 8 Rounds e o Corner. */
export const PASSOS_OCTOGONO = [
  { tipo: 'abertura' },
  {
    tipo: 'encarada', num: '00', nome: 'Encarada', tema: 'O ponto de partida',
    marco: 'Imersão com Rodrigo e o Ser do Líder.', quando: 'Kick-off', formato: 'ambos',
  },
  { tipo: 'round', vertice: 0, num: '01', nome: 'Posição', tema: 'Diagnóstico e direção', marco: 'KPI único e Relatório 30 Dias.', formato: 'ambos' },
  { tipo: 'round', vertice: 1, num: '02', nome: 'Preparo', tema: 'Rotina e energia', marco: 'Rotina não negociável e energia.', formato: 'ambos' },
  { tipo: 'round', vertice: 2, num: '03', nome: 'Combate', tema: 'Decisão sob pressão', marco: 'A decisão adiada, enfim tomada.', formato: 'ambos' },
  { tipo: 'round', vertice: 3, num: '04', nome: 'Equipe', tema: 'Feedback e desenvolvimento', marco: 'Time mapeado, cada um com PDI.', formato: 'ambos' },
  { tipo: 'round', vertice: 4, num: '05', nome: 'Vitória', tema: 'KPIs e evidências', marco: 'Painel executivo com ata assinada.', formato: 'ambos' },
  { tipo: 'round', vertice: 5, num: '06', nome: 'Legado', tema: 'Conhecimento que permanece', marco: 'Certificado e Levantando o Cinturão.', formato: 'ambos' },
  { tipo: 'round', vertice: 6, num: '07', nome: 'Futuro', tema: 'IA aplicada à liderança', marco: 'IA em uso.', formato: 'premium' },
  { tipo: 'round', vertice: 7, num: '08', nome: 'Cultura', tema: 'Melhoria contínua', marco: 'Melhoria contínua instalada.', formato: 'premium' },
  {
    tipo: 'corner', num: 'C', nome: 'O Corner', tema: 'Inteligência emocional, com a SBIE',
    ringue: 'Entre um round e outro, o corner muda a luta.',
    texto: 'O Corner trabalha pressão, frustração e provocação em todos os Rounds, com a metodologia da SBIE, sem alongar o programa.',
  },
];

export const FORMATOS = {
  seis: {
    nome: 'Formação · 6 meses',
    total: 39990,
    meses: 6,
    linhas: {
      duracao: '6 meses + 1 bônus',
      rounds: 'Encarada + 1 a 6',
      alta: '—',
      presenciais: '3',
      taticos: '2',
      masterclasses: '6',
      trilhas: '6',
      horas: '42 h',
    },
  },
  oito: {
    nome: 'Formação · 8 meses · Premium',
    total: 48980,
    meses: 8,
    linhas: {
      duracao: '8 meses + 1 bônus',
      rounds: 'Encarada + 1 a 8',
      alta: 'O mês 1 inteiro',
      presenciais: '5',
      taticos: '4',
      masterclasses: '8',
      trilhas: '8',
      horas: '49 h',
    },
  },
};

export const MINIMO_LIDERES = 12;

/** A jornada mês a mês. `so: 'premium'` some no formato de 6 meses. */
export const JORNADA = [
  { id: 'alta', round: 'Alta liderança', marco: 'OKRs do programa assinados pelos C-levels e sponsors nomeados.', so: 'premium' },
  { id: 'encarada', round: 'Encarada', marco: 'Imersão com Rodrigo e o Ser do Líder.', kickoff: true },
  { id: 'posicao', round: 'Posição', marco: 'KPI único e Relatório 30 Dias.' },
  { id: 'preparo', round: 'Preparo', marco: 'Rotina não negociável e energia.' },
  { id: 'combate', round: 'Combate', marco: 'A decisão adiada, enfim tomada.' },
  { id: 'equipe', round: 'Equipe', marco: 'Time mapeado, cada um com PDI.' },
  { id: 'vitoria', round: 'Vitória', marco: 'Painel executivo com ata assinada.' },
  { id: 'legado', round: 'Legado', marco: 'Certificado e Levantando o Cinturão.' },
  { id: 'futuro', round: 'Futuro e Cultura', marco: 'IA em uso e melhoria contínua instalada.', so: 'premium' },
  { id: 'bonus', round: 'Bônus', marco: 'Acesso à Central, com autonomia.', bonus: true },
];

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 2 });
const NUM = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

export const formatarBRL = (v) => BRL.format(v).replace(/ /g, ' ');
export const formatarNumero = (v) => NUM.format(v);
/** "6.122,50" — mensal sempre com centavos quando houver. */
export const formatarMensal = (v) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 }).format(v);
