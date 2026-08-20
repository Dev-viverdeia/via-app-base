import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Junta classes do Tailwind resolvendo conflitos: a última vence.
 * `cn("p-2", condicao && "p-4")` devolve "p-4" quando a condição for verdadeira.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
