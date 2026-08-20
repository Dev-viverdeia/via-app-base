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
 * As cores saem dos tokens de estado: success = `--positivo`,
 * warning = `--atencao`, destructive = `--destrutivo`. As três são preenchidas
 * (fundo forte + `--marca-tinta`) porque a versão desbotada não alcança o
 * contraste mínimo de leitura no tema claro.
 * Cor nunca é a única pista: o texto da etiqueta já diz o estado.
 */
export const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-total border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-transparent bg-marca text-marca-tinta",
        secondary: "border-transparent bg-marca/10 text-tinta",
        outline: "border-borda bg-superficie text-suave",
        success: "border-transparent bg-positivo text-marca-tinta",
        warning: "border-transparent bg-atencao text-marca-tinta",
        destructive: "border-transparent bg-destrutivo text-marca-tinta",
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
