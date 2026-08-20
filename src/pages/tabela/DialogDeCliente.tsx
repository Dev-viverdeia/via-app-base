/**
 * O diálogo que cria e edita cliente — os dois casos no mesmo formulário,
 * porque os campos são exatamente os mesmos.
 *
 * Ele não guarda nada: recebe o formulário já montado (react-hook-form) e
 * entrega os campos preenchidos em `aoSalvar`. Quem grava na lista é
 * `Tabela.tsx`. As regras do formulário ficam aqui embaixo, ao lado dos campos
 * que elas validam.
 */
import { Controller } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { Button } from "../../components/ui/button.tsx";
import { CampoDeTexto } from "../../components/ui/campo-de-texto.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog.tsx";
import { Label } from "../../components/ui/label.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select.tsx";
import { STATUS, type Cliente } from "../../data/demo/clientes.ts";
import { APARENCIA_DO_STATUS } from "./status.ts";

/* -------------------------------------------------------------------------
   Formulário do cliente. As mensagens são o que a pessoa lê, então elas
   nascem em português aqui.
------------------------------------------------------------------------- */

export const esquemaDoCliente = z.object({
  nome: z.string().trim().min(2, "Informe o nome do cliente."),
  email: z.email("Informe um e-mail válido."),
  whatsapp: z
    .string()
    .trim()
    .min(1, "Informe o WhatsApp.")
    // Contamos os dígitos, não os caracteres: assim "(11) 98812-4477" e
    // "11988124477" valem a mesma coisa.
    .refine(
      (texto) => texto.replace(/\D/g, "").length >= 10,
      "Informe o WhatsApp com DDD, como (11) 98888-7777.",
    ),
  cidade: z.string().trim().min(2, "Informe a cidade."),
  status: z.enum(STATUS),
  // O campo é `type="number"`: o navegador já devolve "1890.5" mesmo quando a
  // pessoa digita "1890,5".
  valor: z
    .string()
    .trim()
    .min(1, "Informe o total comprado (use 0 se ainda não comprou).")
    .refine((texto) => Number(texto) >= 0, "O total não pode ser negativo."),
});

export type CamposDoCliente = z.infer<typeof esquemaDoCliente>;

export const CLIENTE_EM_BRANCO: CamposDoCliente = {
  nome: "",
  email: "",
  whatsapp: "",
  cidade: "",
  status: "ativo",
  valor: "0",
};

export function DialogDeCliente({
  aberto,
  aoMudarAbertura,
  emEdicao,
  form,
  aoSalvar,
}: {
  aberto: boolean;
  aoMudarAbertura: (aberto: boolean) => void;
  /** `null` = está criando; com cliente = está editando aquele. */
  emEdicao: Cliente | null;
  form: UseFormReturn<CamposDoCliente>;
  aoSalvar: (campos: CamposDoCliente) => void;
}) {
  const erros = form.formState.errors;

  return (
    <Dialog open={aberto} onOpenChange={aoMudarAbertura}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {emEdicao ? "Editar cliente" : "Novo cliente"}
          </DialogTitle>
          <DialogDescription>
            {emEdicao
              ? `Mudanças em ${emEdicao.nome}.`
              : "Preencha os dados para começar a acompanhar este cliente."}
          </DialogDescription>
        </DialogHeader>

        {/* `noValidate`: quem valida é o zod, em português. */}
        <form
          noValidate
          onSubmit={form.handleSubmit(aoSalvar)}
          className="grid gap-4 sm:grid-cols-2"
        >
          <CampoDeTexto
            rotulo="Nome"
            {...form.register("nome")}
            autoComplete="name"
            placeholder="Ana Beatriz Souza"
            erro={erros.nome?.message}
            className="sm:col-span-2"
          />

          <CampoDeTexto
            rotulo="E-mail"
            {...form.register("email")}
            type="email"
            autoComplete="email"
            placeholder="voce@email.com"
            erro={erros.email?.message}
          />

          <CampoDeTexto
            rotulo="WhatsApp"
            {...form.register("whatsapp")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(11) 98888-7777"
            erro={erros.whatsapp?.message}
          />

          <CampoDeTexto
            rotulo="Cidade"
            {...form.register("cidade")}
            autoComplete="address-level2"
            placeholder="São Paulo"
            erro={erros.cidade?.message}
          />

          <div className="grid gap-2">
            <Label htmlFor="cliente-status">Status</Label>
            {/* O Select do Radix não é um `<input>`, então quem o liga ao
                react-hook-form é o Controller. */}
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="cliente-status" onBlur={field.onBlur}>
                    <SelectValue placeholder="Escolha o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {APARENCIA_DO_STATUS[status].rotulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <CampoDeTexto
            rotulo="Total comprado (R$)"
            {...form.register("valor")}
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            placeholder="0"
            erro={erros.valor?.message}
            className="sm:col-span-2"
          />

          <DialogFooter className="sm:col-span-2">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit">
              {emEdicao ? "Salvar mudanças" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
