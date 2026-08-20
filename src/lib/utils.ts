import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Junta classes do Tailwind resolvendo conflitos: a última vence.
 * `cn("p-2", condicao && "p-4")` devolve "p-4" quando a condição for verdadeira.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * O formatador é criado UMA vez: montar um `Intl.NumberFormat` é caro, e este
 * aqui roda em toda célula de tabela e em todo cartão do quadro.
 */
const FORMATO_EM_REAIS = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Dinheiro do jeito que se lê aqui: `emReais(1200)` devolve "R$ 1.200,00". */
export function emReais(valor: number): string {
  return FORMATO_EM_REAIS.format(valor);
}

/**
 * Id de item criado na tela ("novo-1", "novo-2"…). Existe só enquanto a lista
 * é em memória: com banco de verdade, quem gera o id é o banco.
 */
let sequencia = 0;
export function novoId(): string {
  sequencia += 1;
  return `novo-${sequencia}`;
}
