import { useId } from "react";
import type { ComponentProps } from "react";
import { cn } from "../../lib/utils.ts";
import { Input } from "./input.tsx";
import { Label } from "./label.tsx";

/**
 * Campo de formulário inteiro: rótulo + campo + mensagem de erro, com o
 * `aria-invalid` e o `aria-describedby` já ligados entre eles.
 *
 *   <CampoDeTexto
 *     rotulo="E-mail"
 *     {...form.register("email")}
 *     type="email"
 *     placeholder="voce@email.com"
 *     erro={form.formState.errors.email?.message}
 *   />
 *
 * Os ids nascem aqui dentro (`useId`), então ninguém precisa inventar
 * "cliente-email" e "cliente-email-erro" na mão — nem se preocupar com dois
 * formulários iguais na mesma tela. Passe `id` só quando algo de fora
 * precisar apontar para o campo.
 *
 * `className` veste o BLOCO todo (é ali que vai um `sm:col-span-2` dentro de
 * um grid); o resto das props vai direto no `<input>`.
 */
type PropsDoCampoDeTexto = ComponentProps<"input"> & {
  /** O texto do `<label>`. */
  rotulo: string;
  /** A mensagem de erro. Preenchida = borda vermelha e campo inválido. */
  erro?: string;
  /** Uma linha de ajuda, lida junto com o rótulo. */
  dica?: string;
};

export function CampoDeTexto({
  rotulo,
  erro,
  dica,
  className,
  id,
  ...props
}: PropsDoCampoDeTexto) {
  const gerado = useId();
  const idDoCampo = id ?? gerado;
  const idDaDica = `${idDoCampo}-dica`;
  const idDoErro = `${idDoCampo}-erro`;

  // Dica primeiro, erro depois — é a ordem em que o leitor de tela lê. Sem
  // nenhum dos dois o atributo não existe (um `aria-describedby` vazio
  // aponta para lugar nenhum).
  const descricao = [dica ? idDaDica : null, erro ? idDoErro : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={idDoCampo}>{rotulo}</Label>
      <Input
        id={idDoCampo}
        aria-invalid={!!erro}
        aria-describedby={descricao || undefined}
        {...props}
      />
      {dica ? (
        <p id={idDaDica} className="text-sm text-suave">
          {dica}
        </p>
      ) : null}
      {erro ? (
        <p id={idDoErro} className="text-sm text-destrutivo">
          {erro}
        </p>
      ) : null}
    </div>
  );
}
