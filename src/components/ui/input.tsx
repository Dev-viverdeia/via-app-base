import type { ComponentProps } from "react";
import { cn } from "../../lib/utils.ts";

/**
 * Campo de texto. Sempre com um `<Label htmlFor>` apontando para o `id`:
 *
 *   <Label htmlFor="email">E-mail</Label>
 *   <Input id="email" type="email" placeholder="voce@email.com" />
 *
 * Com erro de formulário (react-hook-form + zod), marque `aria-invalid` —
 * a borda fica vermelha sozinha — e ligue a mensagem pelo `aria-describedby`:
 *
 *   <Input id="email" aria-invalid={!!erro} aria-describedby="email-erro" />
 *   {erro ? <p id="email-erro" className="text-sm text-destrutivo">{erro}</p> : null}
 *
 * Em formulário, prefira o `<CampoDeTexto>` (`campo-de-texto.tsx`): ele já é
 * este bloco inteiro — rótulo, campo, erro e os ids ligados — em uma linha.
 */
export function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-10 w-full rounded-m border border-borda bg-superficie px-3 py-2",
        "text-sm text-tinta shadow-p transition-colors placeholder:text-suave",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-tinta",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destrutivo",
        className,
      )}
      {...props}
    />
  );
}
