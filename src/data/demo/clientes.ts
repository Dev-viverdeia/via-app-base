/**
 * Dados de demonstração da tela de clientes — a carteira de um negócio local.
 *
 * PARA PLUGAR DADOS REAIS: troque `CLIENTES` por uma consulta a uma tabela
 * `clientes` (nome, email, whatsapp, cidade, status, valor, ultima_compra) e
 * mande criar/editar/excluir da tela para o banco em vez do estado da página.
 * Os e-mails abaixo terminam em `@example.com` de propósito: é o domínio que a
 * RFC 2606 reserva para exemplo, e nada enviado para lá chega em alguém.
 */
import { subDays } from "date-fns";

/** Situação do cliente. Lista curta de propósito: vira um `<Select>`. */
export type StatusDoCliente = "ativo" | "pendente" | "inativo";

/**
 * A mesma lista que a tela usa para montar o `<Select>` e para validar o
 * formulário. Uma fonte só: acrescentar um status aqui basta.
 */
export const STATUS: ReadonlyArray<StatusDoCliente> = [
  "ativo",
  "pendente",
  "inativo",
];

export type Cliente = {
  id: string;
  nome: string;
  email: string;
  /** Com DDD, do jeito que se escreve aqui: "(11) 98812-4477". */
  whatsapp: string;
  cidade: string;
  status: StatusDoCliente;
  /** Quanto essa pessoa já comprou, em reais. */
  valor: number;
  ultimaCompra: Date;
};

const HOJE = new Date();

export const CLIENTES: Cliente[] = [
  {
    id: "cli-01",
    nome: "Ana Beatriz Souza",
    email: "ana.souza@example.com",
    whatsapp: "(11) 98812-4477",
    cidade: "São Paulo",
    status: "ativo",
    valor: 3420,
    ultimaCompra: subDays(HOJE, 3),
  },
  {
    id: "cli-02",
    nome: "Bruno Carvalho",
    email: "bruno.carvalho@example.com",
    whatsapp: "(21) 99145-2093",
    cidade: "Rio de Janeiro",
    status: "ativo",
    valor: 1890.5,
    ultimaCompra: subDays(HOJE, 6),
  },
  {
    id: "cli-03",
    nome: "Carla Menezes",
    email: "carla.menezes@example.com",
    whatsapp: "(31) 98877-1230",
    cidade: "Belo Horizonte",
    status: "pendente",
    valor: 640,
    ultimaCompra: subDays(HOJE, 11),
  },
  {
    id: "cli-04",
    nome: "Diego Nakamura",
    email: "diego.nakamura@example.com",
    whatsapp: "(41) 99612-8845",
    cidade: "Curitiba",
    status: "ativo",
    valor: 2275,
    ultimaCompra: subDays(HOJE, 2),
  },
  {
    id: "cli-05",
    nome: "Eduarda Lima",
    email: "eduarda.lima@example.com",
    whatsapp: "(85) 98104-6672",
    cidade: "Fortaleza",
    status: "inativo",
    valor: 310,
    ultimaCompra: subDays(HOJE, 96),
  },
  {
    id: "cli-06",
    nome: "Felipe Andrade",
    email: "felipe.andrade@example.com",
    whatsapp: "(51) 99283-4410",
    cidade: "Porto Alegre",
    status: "ativo",
    valor: 4180,
    ultimaCompra: subDays(HOJE, 8),
  },
  {
    id: "cli-07",
    nome: "Gabriela Rocha",
    email: "gabriela.rocha@example.com",
    whatsapp: "(71) 98330-5521",
    cidade: "Salvador",
    status: "pendente",
    valor: 1125,
    ultimaCompra: subDays(HOJE, 14),
  },
  {
    id: "cli-08",
    nome: "Henrique Barros",
    email: "henrique.barros@example.com",
    whatsapp: "(62) 99417-0088",
    cidade: "Goiânia",
    status: "ativo",
    valor: 980.9,
    ultimaCompra: subDays(HOJE, 5),
  },
  {
    id: "cli-09",
    nome: "Isabela Tavares",
    email: "isabela.tavares@example.com",
    whatsapp: "(81) 98625-7734",
    cidade: "Recife",
    status: "inativo",
    valor: 455,
    ultimaCompra: subDays(HOJE, 72),
  },
  {
    id: "cli-10",
    nome: "João Pedro Martins",
    email: "joao.martins@example.com",
    whatsapp: "(48) 99871-2205",
    cidade: "Florianópolis",
    status: "ativo",
    valor: 5260,
    ultimaCompra: subDays(HOJE, 1),
  },
  {
    id: "cli-11",
    nome: "Larissa Fontes",
    email: "larissa.fontes@example.com",
    whatsapp: "(27) 99610-3348",
    cidade: "Vitória",
    status: "ativo",
    valor: 2740,
    ultimaCompra: subDays(HOJE, 9),
  },
  {
    id: "cli-12",
    nome: "Marcos Vinícius Prado",
    email: "marcos.prado@example.com",
    whatsapp: "(61) 98254-9917",
    cidade: "Brasília",
    status: "pendente",
    valor: 1560,
    ultimaCompra: subDays(HOJE, 19),
  },
];
