import type { ComponentProps } from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "../../lib/utils.ts";

/**
 * Rótulo de campo. O `htmlFor` tem que ser igual ao `id` do campo — é isso
 * que faz o clique no texto focar o campo e o leitor de tela anunciar o nome.
 *
 *   <Label htmlFor="nome">Nome</Label>
 *   <Input id="nome" />
 *
 * (Radix cuida de não selecionar o texto quando se clica duas vezes.)
 */
export function Label({
  className,
  ...props
}: ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn(
        "text-sm leading-none font-medium text-tinta select-none",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
