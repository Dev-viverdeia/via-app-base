import type { ComponentProps } from "react";
import { cn } from "../../lib/utils.ts";

/**
 * Campo de texto. Sempre com um `<Label htmlFor>` apontando para o `id`:
 *
 *   <Label htmlFor="email">E-mail</Label>
 *   <Input id="email" type="email" placeholder="voce@email.com" />
 *
 * Com erro de formulário (react-hook-form + zod), marque `aria-invalid` —
 * o fio fica vermelho sozinho — e ligue a mensagem pelo `aria-describedby`:
 *
 *   <Input id="email" aria-invalid={!!erro} aria-describedby="email-erro" />
 *   {erro ? <p id="email-erro" className="text-base text-destrutivo">{erro}</p> : null}
 *
 * Em formulário, prefira o `<CampoDeTexto>` (`campo-de-texto.tsx`): ele já é
 * este bloco inteiro — rótulo, campo, erro e os ids ligados — em uma linha.
 * O visual (fio, halo no foco, erro) vem da classe `campo` em globals.css.
 */
export function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "campo toque h-10 min-w-0 w-full rounded-m px-3.5 py-2",
        "text-base text-tinta placeholder:text-suave/80",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-tinta",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
