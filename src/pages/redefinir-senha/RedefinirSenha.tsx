/**
 * SENHA NOVA — página PÚBLICA (no registro: `protegida: false, naNavbar: false`).
 *
 * É o destino do link que o Supabase manda quando alguém pede "esqueci minha
 * senha" na tela de entrada. O link traz consigo uma sessão de recuperação: o
 * cliente do Supabase a lê do endereço sozinho (`detectSessionInUrl`, ligado
 * por padrão) antes desta tela montar, então aqui basta PERGUNTAR se há sessão.
 *
 * Sem sessão = link vencido, já usado, ou alguém que abriu este endereço na
 * mão. Os três terminam na mesma tela, com o caminho de volta para pedir outro.
 *
 * Por ser pública ela desenha a tela inteira sozinha, sem a moldura do app.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";
import { LOGO_DO_APP, NOME_DO_APP } from "../../components/layout/AppShell.tsx";
import { Button, buttonVariants } from "../../components/ui/button.tsx";
import { CampoDeTexto } from "../../components/ui/campo-de-texto.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card.tsx";
import { MODO_DEMONSTRACAO } from "../../lib/demonstracao.ts";
import { MENSAGEM_GENERICA, mensagemDoErro } from "../../lib/erros-de-acesso.ts";
import { supabase } from "../../lib/supabase.ts";

// A MESMA regra do cadastro, com a mesma frase: duas medidas diferentes para a
// mesma senha seriam duas explicações para a pessoa decorar.
const esquemaSenhaNova = z.object({
  senha: z.string().min(8, "A senha precisa de pelo menos 8 caracteres."),
});

type CamposSenhaNova = z.infer<typeof esquemaSenhaNova>;

export default function RedefinirSenha() {
  const navegar = useNavigate();

  // `undefined` = ainda perguntando ao Supabase; `null` = sem sessão de
  // recuperação. É a mesma leitura do porteiro (`RequerSessao`).
  const [sessao, setSessao] = useState<Session | null | undefined>(undefined);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const form = useForm<CamposSenhaNova>({
    resolver: zodResolver(esquemaSenhaNova),
    defaultValues: { senha: "" },
  });

  useEffect(() => {
    // Em modo de demonstração não há sessão para ouvir.
    if (MODO_DEMONSTRACAO) return;
    let vivo = true;

    // `getSession` espera o cliente terminar de ler o endereço, então a
    // resposta dele já contempla a sessão que veio no link.
    void supabase.auth.getSession().then(({ data }) => {
      if (vivo) setSessao(data.session);
    });

    // E o evento cobre a ordem inversa: o link lido depois desta tela montar.
    const { data: assinatura } = supabase.auth.onAuthStateChange(
      (_evento, sessaoAtual) => {
        if (vivo) setSessao(sessaoAtual);
      },
    );

    return () => {
      vivo = false;
      assinatura.subscription.unsubscribe();
    };
  }, []);

  async function salvar(campos: CamposSenhaNova) {
    setErro(null);

    // Modo de demonstração: sem banco ligado não há senha para gravar, e
    // dizer que gravamos seria mentira. A tela continua inteira.
    if (MODO_DEMONSTRACAO) {
      setAviso("Nesta demonstração a senha não é gravada.");
      return;
    }

    // O mesmo cuidado do login: o que o supabase-js relança precisa virar
    // frase na tela, não um formulário que para de girar em silêncio.
    try {
      const { error } = await supabase.auth.updateUser({
        password: campos.senha,
      });

      if (error) {
        setErro(mensagemDoErro(error));
        return;
      }
    } catch (falha) {
      console.error(falha);
      setErro(MENSAGEM_GENERICA);
      return;
    }

    toast.success("Senha nova salva. Bom te ver de volta!");
    navegar("/", { replace: true });
  }

  // A senha mostra dica OU erro no mesmo lugar, igual ao cadastro.
  const erroDaSenha = form.formState.errors.senha?.message;
  const temSessao = MODO_DEMONSTRACAO || (sessao !== null && sessao !== undefined);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-10">
      {/* Página standalone: o `<h1>` do documento é este — não há PageHeader
          aqui para trazê-lo. Com logo, a imagem entra DENTRO do `<h1>` (o
          `alt` é o nome), igual à tela de entrada. */}
      <h1 className="text-[1.75rem] font-semibold tracking-tight text-tinta sm:text-[2.5rem]">
        {LOGO_DO_APP ? (
          <img
            src={LOGO_DO_APP}
            alt={NOME_DO_APP}
            className="block h-12 w-auto max-w-[16rem] object-contain sm:h-14"
          />
        ) : (
          NOME_DO_APP
        )}
      </h1>

      {!MODO_DEMONSTRACAO && sessao === undefined ? (
        <p role="status" className="text-suave">
          Carregando…
        </p>
      ) : temSessao ? (
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Crie uma senha nova</CardTitle>
            <CardDescription>
              Escolha a senha que você vai usar para entrar daqui em diante.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {aviso ? (
              <p role="status" className="text-base text-suave">
                {aviso}
              </p>
            ) : (
              /* `noValidate`: quem valida é o zod, em português. */
              <form
                noValidate
                onSubmit={form.handleSubmit(salvar)}
                className="grid gap-4"
              >
                {erro ? (
                  <p
                    role="alert"
                    className="rounded-m bg-destrutivo/10 px-3.5 py-2.5 text-base text-destrutivo"
                  >
                    {erro}
                  </p>
                ) : null}

                <CampoDeTexto
                  rotulo="Senha nova"
                  {...form.register("senha")}
                  type="password"
                  autoComplete="new-password"
                  erro={erroDaSenha}
                  dica={erroDaSenha ? undefined : "Pelo menos 8 caracteres."}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" aria-hidden="true" />
                      Salvando…
                    </>
                  ) : (
                    "Salvar e entrar"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Este link não vale mais</CardTitle>
            <CardDescription>
              O link da senha vale por uma hora e serve uma vez só. Peça outro
              para continuar.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* O estado leva a entrada direto ao pedido do link, em vez de
                largar a pessoa nas abas para ela procurar de novo. */}
            <Link
              to="/login"
              state={{ esqueci: true }}
              className={buttonVariants({ className: "w-full" })}
            >
              Pedir outro link
            </Link>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
