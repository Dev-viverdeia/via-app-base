/**
 * CAPTAÇÃO — página PÚBLICA (no registro: `protegida: false, naNavbar: false`).
 * Por ser pública ela desenha a tela inteira sozinha, sem a moldura do app —
 * é o endereço que se manda por link, story ou anúncio.
 *
 * ONDE PLUGAR DADOS REAIS: hoje o envio só espera meio segundo e troca a tela
 * (nada sai do navegador). Peça no chat: "conecte o envio desta página a uma
 * tabela `leads` no Supabase" — é dentro de `enviar()` que a gravação entra.
 */
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CircleCheckBig, Loader2, Send } from "lucide-react";
import { NOME_DO_APP } from "../../components/layout/AppShell.tsx";
import { Button } from "../../components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card.tsx";
import { CampoDeTexto } from "../../components/ui/campo-de-texto.tsx";

/* -------------------------------------------------------------------------
   Regras do formulário. As mensagens são o que o visitante lê, então elas
   nascem em português aqui.
------------------------------------------------------------------------- */

const esquemaDaCaptacao = z.object({
  nome: z.string().trim().min(2, "Informe seu nome."),
  email: z.email("Informe um e-mail válido."),
  whatsapp: z
    .string()
    .trim()
    .min(1, "Informe seu WhatsApp.")
    // Contamos os dígitos, não os caracteres: assim "(11) 98888-7777" e
    // "11988887777" valem a mesma coisa.
    .refine(
      (texto) => texto.replace(/\D/g, "").length >= 10,
      "Informe o WhatsApp com DDD, como (11) 98888-7777.",
    ),
});

type CamposDaCaptacao = z.infer<typeof esquemaDaCaptacao>;

const EM_BRANCO: CamposDaCaptacao = { nome: "", email: "", whatsapp: "" };

export default function Captacao() {
  /** `null` = ainda preenchendo; com texto = já enviou (guarda o primeiro nome). */
  const [enviadoPor, setEnviadoPor] = useState<string | null>(null);
  const tituloDoObrigado = useRef<HTMLHeadingElement>(null);

  const form = useForm<CamposDaCaptacao>({
    resolver: zodResolver(esquemaDaCaptacao),
    defaultValues: EM_BRANCO,
  });

  // Enviou: o foco vai para o título da confirmação. Sem isso o foco fica no
  // botão que acabou de sumir, e quem usa leitor de tela não ouve o obrigado.
  useEffect(() => {
    if (enviadoPor) tituloDoObrigado.current?.focus();
  }, [enviadoPor]);

  async function enviar(campos: CamposDaCaptacao) {
    // DEMONSTRAÇÃO: a espera existe só para o botão mostrar que está enviando.
    // Troque este bloco pela gravação de verdade (ex.: um insert na tabela
    // `leads`) e trate o erro devolvendo uma frase em português para a tela.
    await new Promise((resolva) => setTimeout(resolva, 500));

    const nome = campos.nome.trim();
    setEnviadoPor(nome.split(" ")[0] || nome);
  }

  function comecarDeNovo() {
    form.reset(EM_BRANCO);
    setEnviadoPor(null);
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-10">
      <p className="text-2xl font-bold tracking-tight text-marca">
        {NOME_DO_APP}
      </p>

      {enviadoPor ? (
        /* --- Tela de obrigado ------------------------------------------ */
        <Card className="w-full max-w-sm text-center">
          <CardContent className="flex flex-col items-center gap-2 p-8">
            <span className="mb-2 flex size-14 items-center justify-center rounded-total bg-positivo/10 text-positivo">
              <CircleCheckBig className="size-7" aria-hidden="true" />
            </span>
            {/* `tabIndex={-1}` deixa o foco pousar aqui sem entrar na ordem do
                Tab; o `:focus-visible` global só desenha o anel para quem
                chegou pelo teclado. */}
            <CardTitle ref={tituloDoObrigado} tabIndex={-1} className="text-xl">
              Obrigado, {enviadoPor}!
            </CardTitle>
            <CardDescription className="text-base">
              Recebemos seu contato e retornamos pelo WhatsApp em breve.
            </CardDescription>
            <Button variant="outline" className="mt-4" onClick={comecarDeNovo}>
              Enviar outra resposta
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* --- Formulário ------------------------------------------------- */
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Fale com a gente</CardTitle>
            <CardDescription>
              Deixe seu contato que a gente responde pelo WhatsApp — sem
              compromisso.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* `noValidate`: quem valida é o zod, em português. */}
            <form
              noValidate
              onSubmit={form.handleSubmit(enviar)}
              className="grid gap-4"
            >
              <CampoDeTexto
                rotulo="Nome"
                {...form.register("nome")}
                autoComplete="name"
                placeholder="Ana Beatriz Souza"
                erro={form.formState.errors.nome?.message}
              />

              <CampoDeTexto
                rotulo="E-mail"
                {...form.register("email")}
                type="email"
                autoComplete="email"
                placeholder="voce@email.com"
                erro={form.formState.errors.email?.message}
              />

              <CampoDeTexto
                rotulo="WhatsApp"
                {...form.register("whatsapp")}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="(11) 98888-7777"
                erro={form.formState.errors.whatsapp?.message}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden="true" />
                    Enviando…
                  </>
                ) : (
                  <>
                    <Send />
                    Quero ser atendido
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-pretty text-suave">
                Seus dados ficam só com a gente. Nada de spam.
              </p>
            </form>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
