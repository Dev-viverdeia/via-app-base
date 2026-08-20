/**
 * Dados de demonstração do quadro (kanban) — o funil de um negócio local.
 *
 * PARA PLUGAR DADOS REAIS: troque `CARTOES` por uma consulta a uma tabela
 * `oportunidades` (colunas: cliente, origem, valor, coluna, criado_em) e mande
 * o arrastar salvar a coluna nova. `COLUNAS` é a estrutura do quadro, não
 * dado: mude aqui se as etapas do seu funil forem outras.
 */
import { subDays } from "date-fns";

/** Etapas do funil. O `id` é o que fica gravado em cada cartão. */
export type ColunaDoQuadro = "novo" | "conversa" | "proposta" | "fechado";

export const COLUNAS: ReadonlyArray<{
  id: ColunaDoQuadro;
  titulo: string;
}> = [
  { id: "novo", titulo: "Novo" },
  { id: "conversa", titulo: "Em conversa" },
  { id: "proposta", titulo: "Proposta" },
  { id: "fechado", titulo: "Fechado" },
];

/** De onde o contato apareceu. Lista curta de propósito: vira um `<Select>`. */
export type OrigemDoCartao = "Indicação" | "Instagram" | "WhatsApp" | "Site";

export const ORIGENS: ReadonlyArray<OrigemDoCartao> = [
  "Indicação",
  "Instagram",
  "WhatsApp",
  "Site",
];

export type Cartao = {
  id: string;
  /** Nome da pessoa ou do negócio do outro lado. */
  cliente: string;
  origem: OrigemDoCartao;
  /** Valor estimado da oportunidade, em reais. */
  valor: number;
  coluna: ColunaDoQuadro;
  criadoEm: Date;
};

const HOJE = new Date();

export const CARTOES: Cartao[] = [
  {
    id: "opo-1",
    cliente: "Buffet da Cida",
    origem: "Indicação",
    valor: 2400,
    coluna: "novo",
    criadoEm: subDays(HOJE, 1),
  },
  {
    id: "opo-2",
    cliente: "Padaria Pão Nosso",
    origem: "Instagram",
    valor: 890,
    coluna: "novo",
    criadoEm: subDays(HOJE, 2),
  },
  {
    id: "opo-3",
    cliente: "Studio Bela Face",
    origem: "WhatsApp",
    valor: 1350,
    coluna: "novo",
    criadoEm: subDays(HOJE, 3),
  },
  {
    id: "opo-4",
    cliente: "Oficina do Zé",
    origem: "Site",
    valor: 3200,
    coluna: "conversa",
    criadoEm: subDays(HOJE, 5),
  },
  {
    id: "opo-5",
    cliente: "Mercadinho Boa Vista",
    origem: "Indicação",
    valor: 1780,
    coluna: "conversa",
    criadoEm: subDays(HOJE, 6),
  },
  {
    id: "opo-6",
    cliente: "Clínica Vida Leve",
    origem: "Instagram",
    valor: 5400,
    coluna: "proposta",
    criadoEm: subDays(HOJE, 8),
  },
  {
    id: "opo-7",
    cliente: "Academia Corpo & Ação",
    origem: "WhatsApp",
    valor: 4100,
    coluna: "proposta",
    criadoEm: subDays(HOJE, 10),
  },
  {
    id: "opo-8",
    cliente: "Pizzaria Forno a Lenha",
    origem: "Indicação",
    valor: 2950,
    coluna: "fechado",
    criadoEm: subDays(HOJE, 12),
  },
  {
    id: "opo-9",
    cliente: "Pet Shop Amigo Fiel",
    origem: "Site",
    valor: 1620,
    coluna: "fechado",
    criadoEm: subDays(HOJE, 15),
  },
];
