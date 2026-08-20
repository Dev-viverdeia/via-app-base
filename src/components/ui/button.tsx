import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils.ts";

/**
 * Botão do app.
 *
 *   <Button>Salvar</Button>
 *   <Button variant="outline" size="sm">Cancelar</Button>
 *   <Button variant="destructive"><Trash2 />Excluir</Button>
 *   <Button size="icon" aria-label="Fechar"><X /></Button>
 *
 * Para um LINK com cara de botão, use as classes direto (não existe `asChild`):
 *   <Link to="/tabela" className={buttonVariants({ variant: "outline" })}>Ver</Link>
 *
 * O anel de foco vem do `:focus-visible` global (globals.css) — não repita aqui.
 * Precisa de um estilo novo? Acrescente uma variante abaixo em vez de escrever
 * classes de cor soltas na tela.
 */
export const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-m",
    "text-sm font-medium whitespace-nowrap transition-colors",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        /** Ação principal da tela. Use uma só por tela. */
        default: "bg-marca text-marca-tinta shadow-p hover:bg-marca/90",
        /** Ação de apoio: mesmo peso visual, sem gritar. */
        secondary: "bg-marca/10 text-tinta hover:bg-marca/20",
        /** Contorno: some no fundo e aparece na borda. */
        outline:
          "border border-borda bg-superficie text-tinta shadow-p hover:bg-marca/10",
        /** Sem fundo nem borda: barras de ferramentas, ícones. */
        ghost: "text-tinta hover:bg-marca/10",
        /** Excluir, cancelar assinatura, esvaziar. Confirme antes. */
        destructive:
          "bg-destrutivo text-marca-tinta shadow-p hover:bg-destrutivo/90",
        /** Cara de link, comportamento de botão. */
        link: "text-marca underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-p px-3",
        lg: "h-11 px-6 text-base",
        /** Quadrado, só ícone — sempre com `aria-label`. */
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
