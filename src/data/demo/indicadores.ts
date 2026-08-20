/**
 * Dados de demonstração da tela Início — um negócio local em 30 dias.
 *
 * PARA PLUGAR DADOS REAIS: troque as três exportações abaixo por consultas
 * (Supabase, API própria, planilha) devolvendo os MESMOS formatos. A tela só
 * conhece `FATURAMENTO_POR_DIA`, `RESUMO` e `ATIVIDADES` — ela não sabe, nem
 * precisa saber, de onde os números vieram.
 */
import { format, subDays, subHours } from "date-fns";

/**
 * O "hoje" da demonstração, calculado UMA vez na carga do módulo. Se fosse
 * chamado a cada render, o gráfico se remontaria sozinho de tempos em tempos.
 */
const HOJE = new Date();

export type DiaDeFaturamento = {
  /** O dia em si — cada tela formata do jeito que precisa. */
  data: Date;
  /** Rótulo curto para o eixo do gráfico ("05/08"). */
  rotulo: string;
  /** Faturamento do dia, em reais. */
  faturamento: number;
  /** Quantos pedidos entraram no dia. */
  pedidos: number;
};

/**
 * 30 dias de [pedidos, faturamento em reais], do mais antigo para o mais novo.
 * Números inventados, mas no tamanho de um comércio de bairro: perto de doze
 * pedidos por dia e ticket médio na casa dos R$ 150.
 */
const TRINTA_DIAS: ReadonlyArray<readonly [number, number]> = [
  [8, 1128],
  [11, 1584],
  [13, 1937],
  [9, 1305],
  [7, 994],
  [12, 1740],
  [16, 2432],
  [14, 2058],
  [10, 1420],
  [9, 1287],
  [12, 1704],
  [15, 2205],
  [18, 2718],
  [13, 1885],
  [8, 1136],
  [11, 1573],
  [14, 2016],
  [12, 1728],
  [10, 1450],
  [16, 2384],
  [19, 2869],
  [15, 2190],
  [9, 1314],
  [12, 1752],
  [13, 1911],
  [11, 1617],
  [17, 2533],
  [20, 3040],
  [14, 2100],
  [12, 1788],
];

export const FATURAMENTO_POR_DIA: DiaDeFaturamento[] = TRINTA_DIAS.map(
  ([pedidos, faturamento], indice) => {
    const data = subDays(HOJE, TRINTA_DIAS.length - 1 - indice);
    return { data, rotulo: format(data, "dd/MM"), faturamento, pedidos };
  },
);

const totalFaturado = FATURAMENTO_POR_DIA.reduce(
  (soma, dia) => soma + dia.faturamento,
  0,
);
const totalDePedidos = FATURAMENTO_POR_DIA.reduce(
  (soma, dia) => soma + dia.pedidos,
  0,
);

/**
 * Os quatro números do topo da tela.
 *
 * Faturamento, pedidos e ticket médio são SOMADOS do gráfico aqui em cima —
 * assim o cartão e a curva nunca se contradizem. Já as variações são fixas:
 * para calculá-las seria preciso ter também os 30 dias anteriores.
 */
export const RESUMO = {
  faturamento: totalFaturado,
  pedidos: totalDePedidos,
  ticketMedio: totalFaturado / totalDePedidos,
  novosClientes: 37,
  /** Variação percentual contra os 30 dias anteriores. */
  variacao: {
    faturamento: 12.4,
    pedidos: 8.1,
    ticketMedio: 3.9,
    novosClientes: -5.2,
  },
};

export type TipoDeAtividade = "venda" | "cliente" | "pagamento" | "proposta";

export type Atividade = {
  id: string;
  /** Decide o ícone que a tela mostra ao lado da linha. */
  tipo: TipoDeAtividade;
  titulo: string;
  detalhe: string;
  /** Quando aconteceu — a tela mostra em "há 2 horas". */
  quando: Date;
};

export const ATIVIDADES: Atividade[] = [
  {
    id: "atv-1",
    tipo: "venda",
    titulo: "Pedido #1042 fechado",
    detalhe: "Ana Beatriz Souza · R$ 320,00",
    quando: subHours(HOJE, 2),
  },
  {
    id: "atv-2",
    tipo: "cliente",
    titulo: "Novo cliente cadastrado",
    detalhe: "Diego Nakamura, de Curitiba",
    quando: subHours(HOJE, 5),
  },
  {
    id: "atv-3",
    tipo: "pagamento",
    titulo: "Pagamento confirmado",
    detalhe: "Pix de R$ 1.180,00 · Larissa Fontes",
    quando: subHours(HOJE, 9),
  },
  {
    id: "atv-4",
    tipo: "proposta",
    titulo: "Orçamento enviado",
    detalhe: "Buffet da Cida · R$ 2.400,00",
    quando: subHours(HOJE, 26),
  },
  {
    id: "atv-5",
    tipo: "venda",
    titulo: "Pedido #1039 fechado",
    detalhe: "Gabriela Rocha · R$ 245,00",
    quando: subHours(HOJE, 31),
  },
  {
    id: "atv-6",
    tipo: "cliente",
    titulo: "Cliente reativado",
    detalhe: "Henrique Barros voltou a comprar",
    quando: subHours(HOJE, 50),
  },
];
