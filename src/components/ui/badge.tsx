import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils.ts";

/**
 * Etiqueta curta de status: "Ativo", "Pendente", "Cancelado", "3 novos".
 *
 *   <Badge>Novo</Badge>
 *   <Badge variant="success">Pago</Badge>
 *   <Badge variant="warning">Aguardando</Badge>
 *   <Badge variant="destructive">Cancelado</Badge>
 *
 * Status é SUSSURRADO: um ponto colorido e a palavra em texto normal, nunca
 * uma pílula cheia de cor gritando na tabela. As cores do ponto saem dos
 * tokens de estado: success = `--positivo`, warning = `--atencao`,
 * destructive = `--destrutivo`. Cor nunca é a única pista: o texto da
 * etiqueta já diz o estado.
 */
export const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-total text-xs font-medium whitespace-nowrap [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-marca/10 px-2.5 py-0.5 text-marca",
        secondary: "bg-tinta/6 px-2.5 py-0.5 text-tinta",
        outline: "vidro px-2.5 py-0.5 text-suave",
        success: "text-tinta before:size-1.5 before:shrink-0 before:rounded-total before:bg-positivo before:content-['']",
        warning: "text-tinta before:size-1.5 before:shrink-0 before:rounded-total before:bg-atencao before:content-['']",
        destructive: "text-tinta before:size-1.5 before:shrink-0 before:rounded-total before:bg-destrutivo before:content-['']",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export type BadgeProps = ComponentProps<"span"> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
