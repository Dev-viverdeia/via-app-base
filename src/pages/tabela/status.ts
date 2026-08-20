/**
 * Como cada status aparece na tela. A cor nunca é a única pista: o texto da
 * etiqueta já diz o estado.
 *
 * Mora aqui, e não em `data/demo/clientes.ts`, porque aparência é escolha da
 * tela — e a linha da tabela e o formulário precisam da MESMA lista de nomes.
 */
import type { BadgeProps } from "../../components/ui/badge.tsx";
import type { StatusDoCliente } from "../../data/demo/clientes.ts";

export const APARENCIA_DO_STATUS: Record<
  StatusDoCliente,
  { rotulo: string; variante: BadgeProps["variant"] }
> = {
  ativo: { rotulo: "Ativo", variante: "success" },
  pendente: { rotulo: "Pendente", variante: "warning" },
  inativo: { rotulo: "Inativo", variante: "outline" },
};
