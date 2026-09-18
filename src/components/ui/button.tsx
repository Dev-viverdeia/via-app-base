import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils.ts";

/**
 * Botão do app: pílula, com o brilho e a sombra da marca no cheio.
 *
 *   <Button>Salvar</Button>
 *   <Button variant="outline" size="sm">Cancelar</Button>
 *   <Button variant="destructive"><Trash2 />Excluir</Button>
 *   <Button size="icon" aria-label="Fechar"><X /></Button>
 *
 * UMA ação principal por tela (`default`): as outras são `secondary`,
 * `outline` ou `ghost`. Dois botões cheios da cor da marca na mesma tela
 * brigam pela atenção.
 *
 * Para um LINK com cara de botão, use as classes direto (não existe `asChild`):
 *   <Link to="/tabela" className={buttonVariants({ variant: "outline" })}>Ver</Link>
 *
 * O padrão é `type="button"`, então um botão solto DENTRO de um `<form>` nunca
 * envia o formulário sem querer. O botão que envia precisa dizer isso:
 *   <Button type="submit">Salvar</Button>
 *
 * O anel de foco vem do `:focus-visible` global (globals.css) — não repita aqui.
 * Precisa de um estilo novo? Acrescente uma variante abaixo em vez de escrever
 * classes de cor soltas na tela.
 */
export const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-total toque",
    // 16px, NÃO 15: a régua da plataforma recusa texto corrido de quatro
    // palavras ou mais abaixo de 16px, e rótulo de botão passa dessas quatro
    // palavras o tempo todo ("Voltar para o início"). Com 15px aqui, qualquer
    // app nascido deste template levava uma recusa de desenho na primeira
    // conferência — e o conserto era pago uma vez por app.
    "text-base font-medium whitespace-nowrap",
    "transition-[background-color,color,box-shadow,transform,filter] duration-[var(--t-rapido)] ease-[var(--curva)]",
    "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        /** Ação principal da tela. Use uma só por tela. */
        default:
          "bg-marca text-marca-tinta shadow-[inset_0_1px_0_var(--brilho),var(--sombra-marca)] hover:brightness-105",
        /** Ação de apoio: a cor da marca, sem peso. */
        secondary: "bg-marca/10 text-marca hover:bg-marca/15",
        /** Vidro: some no fundo e aparece no aro. */
        outline: "vidro text-tinta hover:bg-superficie",
        /** Sem fundo nem aro: barras de ferramentas, ícones. */
        ghost: "text-tinta hover:bg-tinta/5",
        /** Excluir, cancelar assinatura, esvaziar. Confirme antes. */
        destructive:
          "bg-destrutivo text-marca-tinta shadow-[inset_0_1px_0_var(--brilho)] hover:brightness-105",
        /** Cara de link, comportamento de botão. */
        link: "text-marca underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 px-3.5 text-sm",
        lg: "h-12 px-6 text-base",
        /** Redondo, só ícone — sempre com `aria-label`. */
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
      type="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
