import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { type Session } from "@supabase/supabase-js";
import { LOGO_DO_APP, NOME_DO_APP } from "../../components/layout/AppShell.tsx";
import { Button } from "../../components/ui/button.tsx";
import { CampoDeTexto } from "../../components/ui/campo-de-texto.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card.tsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs.tsx";
import { MODO_DEMONSTRACAO } from "../../lib/demonstracao.ts";
import {
  eLimiteDeEnvio,
  MENSAGEM_GENERICA,
  mensagemDoErro,
} from "../../lib/erros-de-acesso.ts";
import { supabase } from "../../lib/supabase.ts";

/* -------------------------------------------------------------------------
   Regras dos formulários. As mensagens são as que o usuário lê, então elas
   nascem em português aqui — nada de texto do zod em inglês na tela.
------------------------------------------------------------------------- */

const esquemaEntrar = z.object({
  email: z.email("Informe um e-mail válido."),
  senha: z.string().min(1, "Informe sua senha."),
});

const esquemaCriarConta = z.object({
  email: z.email("Informe um e-mail válido."),
  senha: z.string().min(8, "A senha precisa de pelo menos 8 caracteres."),
});

const esquemaEsqueci = z.object({
  email: z.email("Informe um e-mail válido."),
});

type CamposEntrar = z.infer<typeof esquemaEntrar>;
type CamposCriarConta = z.infer<typeof esquemaCriarConta>;
type CamposEsqueci = z.infer<typeof esquemaEsqueci>;

/**
 * A resposta do "esqueci minha senha" é SEMPRE esta, exista a conta ou não.
 * Um "não encontramos este e-mail" transformaria esta tela num jeito de
 * descobrir quem é cliente do app — por isso a frase não muda nunca.
 */
const RESPOSTA_DO_PEDIDO =
  "Se este e-mail tiver uma conta, você vai receber um link para criar uma senha nova.";

/**
 * De onde o visitante veio antes de bater na guarda de sessão. Só aceitamos
 * caminho de dentro do app — um endereço de fora aqui seria um convite a
 * redirecionar o usuário para longe depois do login.
 */
function rotaDeVolta(estado: unknown): string {
  const de = (estado as { de?: unknown } | null)?.de;
  // Exigir "/" no começo já barra endereço absoluto ("https://…", "mailto:…").
  if (typeof de !== "string" || !de.startsWith("/")) return "/";

  // Quem decide se o destino continua dentro de casa é o próprio parser de
  // URL do navegador, não um teste de texto: "/\evil.com" passaria por
  // qualquer comparação de prefixo (o parser trata a barra invertida como
  // barra) e levaria a pessoa para fora depois do login.
  try {
    return new URL(de, window.location.origin).origin === window.location.origin
      ? de
      : "/";
  } catch {
    return "/";
  }
}

/**
 * Tela de entrada — a única página pública do template.
 *
 * Ela é `protegida: false` no registro, então o `App.tsx` a renderiza SEM a
 * moldura do app: cartão sozinho, centrado sobre o fundo. As duas abas usam o
 * mesmo cartão porque são a mesma tarefa ("chegar ao app"), só que por
 * caminhos diferentes.
 */
export default function Login() {
  const navegar = useNavigate();
  const local = useLocation();
  const destino = rotaDeVolta(local.state);

  // Erro do servidor (o do campo quem mostra é o zod, logo abaixo do campo).
  const [erroEntrar, setErroEntrar] = useState<string | null>(null);
  const [erroCriarConta, setErroCriarConta] = useState<string | null>(null);
  const [erroEsqueci, setErroEsqueci] = useState<string | null>(null);

  /**
   * `"abas"` = entrar/criar conta; `"esqueci"` = o pedido do link da senha.
   * A página da senha nova manda `esqueci` no estado da navegação quando o
   * link venceu, para a pessoa cair direto no pedido de outro.
   */
  const [modo, setModo] = useState<"abas" | "esqueci">(
    (local.state as { esqueci?: unknown } | null)?.esqueci === true
      ? "esqueci"
      : "abas",
  );
  /** A resposta do pedido, já enviado. Com texto, o formulário sai da frente. */
  const [respostaDoPedido, setRespostaDoPedido] = useState<string | null>(null);

  const formEntrar = useForm<CamposEntrar>({
    resolver: zodResolver(esquemaEntrar),
    defaultValues: { email: "", senha: "" },
  });

  const formCriarConta = useForm<CamposCriarConta>({
    resolver: zodResolver(esquemaCriarConta),
    defaultValues: { email: "", senha: "" },
  });

  const formEsqueci = useForm<CamposEsqueci>({
    resolver: zodResolver(esquemaEsqueci),
    defaultValues: { email: "" },
  });

  async function entrar(campos: CamposEntrar) {
    setErroEntrar(null);

    // O `try` cobre só a chamada: nem toda falha volta em `error`. Algumas o
    // supabase-js RELANÇA (a trava de sessão estourando o tempo, o storage do
    // navegador bloqueado). Sem o catch, o react-hook-form relança de novo e a
    // pessoa vê o botão parar de girar sem uma linha de explicação.
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: campos.email,
        password: campos.senha,
      });

      if (error) {
        setErroEntrar(mensagemDoErro(error));
        return;
      }
    } catch (erro) {
      console.error(erro);
      setErroEntrar(MENSAGEM_GENERICA);
      return;
    }

    toast.success("Tudo certo. Bom te ver de volta!");
    navegar(destino, { replace: true });
  }

  async function criarConta(campos: CamposCriarConta) {
    setErroCriarConta(null);

    // Mesmo cuidado do `entrar`: o que o supabase-js relança precisa virar
    // frase na tela, não um formulário que para de girar em silêncio.
    let sessaoCriada: Session | null = null;
    try {
      const { data, error } = await supabase.auth.signUp({
        email: campos.email,
        password: campos.senha,
      });

      if (error) {
        setErroCriarConta(mensagemDoErro(error));
        return;
      }

      sessaoCriada = data.session;
    } catch (erro) {
      console.error(erro);
      setErroCriarConta(MENSAGEM_GENERICA);
      return;
    }

    // Com confirmação de e-mail ligada no projeto, o cadastro não abre sessão:
    // a pessoa continua nesta tela até clicar no link que recebeu.
    if (!sessaoCriada) {
      toast.success("Conta criada. Confirme o e-mail que enviamos para entrar.");
      return;
    }

    toast.success("Conta criada. Boas-vindas!");
    navegar(destino, { replace: true });
  }

  /** Abre o pedido do link já com o e-mail que a pessoa digitou para entrar. */
  function abrirEsqueci() {
    setErroEntrar(null);
    setErroEsqueci(null);
    setRespostaDoPedido(null);
    formEsqueci.reset({ email: formEntrar.getValues("email") });
    setModo("esqueci");
  }

  async function pedirLinkDeSenha(campos: CamposEsqueci) {
    setErroEsqueci(null);

    // Modo de demonstração: sem banco ligado não há e-mail para mandar, e
    // dizer que mandamos seria mentira. A tela continua inteira.
    if (MODO_DEMONSTRACAO) {
      setRespostaDoPedido("Nesta demonstração nenhum e-mail é enviado.");
      return;
    }

    // O mesmo cuidado do `entrar`: o que o supabase-js relança precisa virar
    // frase na tela, não um formulário que para de girar em silêncio.
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(campos.email, {
        // Volta para uma página DESTE app — é o endereço que o Supabase
        // precisa ter na lista de permitidos do projeto.
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });

      if (error) {
        // O balde de envio do Supabase merece frase própria: responder "se
        // este e-mail tiver uma conta…" quando nada saiu seria mentira.
        setErroEsqueci(
          eLimiteDeEnvio(error)
            ? "Aguarde um minuto antes de pedir outro link."
            : mensagemDoErro(error),
        );
        return;
      }
    } catch (erro) {
      console.error(erro);
      setErroEsqueci(MENSAGEM_GENERICA);
      return;
    }

    setRespostaDoPedido(RESPOSTA_DO_PEDIDO);
  }

  function voltarParaEntrar() {
    setErroEsqueci(null);
    setRespostaDoPedido(null);
    setModo("abas");
  }

  // A senha do cadastro mostra dica OU erro no mesmo lugar, então a mensagem
  // sai numa variável só: é ela que decide as duas props do campo.
  const erroDaSenhaNova = formCriarConta.formState.errors.senha?.message;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-10">
      {/* Página standalone: o `<h1>` do documento é este — não há PageHeader
          aqui para trazê-lo. Com logo, a imagem entra DENTRO do `<h1>` (o
          `alt` é o nome): a página continua com um título principal, que é o
          que a régua da casa cobra, e a marca aparece do jeito do dono. */}
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

      {modo === "esqueci" ? (
        /* --- Esqueci minha senha ------------------------------------- */
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Esqueci minha senha</CardTitle>
            {/* Com o pedido já feito, a instrução sai de cena: pedir o e-mail
                de novo logo acima da resposta seria falar por cima dela. */}
            {respostaDoPedido ? null : (
              <CardDescription>
                Informe seu e-mail e enviamos um link para criar uma senha nova.
              </CardDescription>
            )}
          </CardHeader>

          <CardContent>
            {respostaDoPedido ? (
              <div className="grid gap-4">
                <p role="status" className="text-base text-suave">
                  {respostaDoPedido}
                </p>
                <Button variant="outline" onClick={voltarParaEntrar}>
                  Voltar para a entrada
                </Button>
              </div>
            ) : (
              /* `noValidate`: quem valida é o zod, em português. */
              <form
                noValidate
                onSubmit={formEsqueci.handleSubmit(pedirLinkDeSenha)}
                className="grid gap-4"
              >
                {erroEsqueci ? (
                  <p
                    role="alert"
                    className="rounded-m bg-destrutivo/10 px-3.5 py-2.5 text-base text-destrutivo"
                  >
                    {erroEsqueci}
                  </p>
                ) : null}

                <CampoDeTexto
                  rotulo="E-mail"
                  {...formEsqueci.register("email")}
                  type="email"
                  autoComplete="email"
                  placeholder="voce@email.com"
                  erro={formEsqueci.formState.errors.email?.message}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={formEsqueci.formState.isSubmitting}
                >
                  {formEsqueci.formState.isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" aria-hidden="true" />
                      Enviando…
                    </>
                  ) : (
                    "Enviar link"
                  )}
                </Button>

                <Button
                  variant="ghost"
                  className="justify-self-center"
                  onClick={voltarParaEntrar}
                >
                  Voltar para a entrada
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Acesse sua conta</CardTitle>
            <CardDescription>
              Entre com seu e-mail e senha — ou crie uma conta em segundos.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="entrar">
              <TabsList className="w-full">
                <TabsTrigger value="entrar">Entrar</TabsTrigger>
                <TabsTrigger value="criar-conta">Criar conta</TabsTrigger>
              </TabsList>

              {/* --- Entrar ---------------------------------------------- */}
              <TabsContent value="entrar">
                {/* `noValidate`: quem valida é o zod, em português. */}
                <form
                  noValidate
                  onSubmit={formEntrar.handleSubmit(entrar)}
                  className="grid gap-4"
                >
                  {erroEntrar ? (
                    <p
                      role="alert"
                      className="rounded-m bg-destrutivo/10 px-3.5 py-2.5 text-base text-destrutivo"
                    >
                      {erroEntrar}
                    </p>
                  ) : null}

                  <CampoDeTexto
                    rotulo="E-mail"
                    {...formEntrar.register("email")}
                    type="email"
                    autoComplete="email"
                    placeholder="voce@email.com"
                    erro={formEntrar.formState.errors.email?.message}
                  />

                  <CampoDeTexto
                    rotulo="Senha"
                    {...formEntrar.register("senha")}
                    type="password"
                    autoComplete="current-password"
                    erro={formEntrar.formState.errors.senha?.message}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={formEntrar.formState.isSubmitting}
                  >
                    {formEntrar.formState.isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" aria-hidden="true" />
                        Entrando…
                      </>
                    ) : (
                      "Entrar"
                    )}
                  </Button>

                  {/* Quem esqueceu a senha ficava trancado do lado de fora. O
                      pedido do link troca o conteúdo deste mesmo cartão. */}
                  <Button
                    variant="link"
                    className="justify-self-center"
                    onClick={abrirEsqueci}
                  >
                    Esqueci minha senha
                  </Button>
                </form>
              </TabsContent>

              {/* --- Criar conta ----------------------------------------- */}
              <TabsContent value="criar-conta">
                <form
                  noValidate
                  onSubmit={formCriarConta.handleSubmit(criarConta)}
                  className="grid gap-4"
                >
                  {erroCriarConta ? (
                    <p
                      role="alert"
                      className="rounded-m bg-destrutivo/10 px-3.5 py-2.5 text-base text-destrutivo"
                    >
                      {erroCriarConta}
                    </p>
                  ) : null}

                  <CampoDeTexto
                    rotulo="E-mail"
                    {...formCriarConta.register("email")}
                    type="email"
                    autoComplete="email"
                    placeholder="voce@email.com"
                    erro={formCriarConta.formState.errors.email?.message}
                  />

                  {/* Dica e erro dividem o mesmo lugar: a regra da senha
                      aparece enquanto ninguém errou, e some no instante em que
                      o erro tem algo mais urgente a dizer. */}
                  <CampoDeTexto
                    rotulo="Senha"
                    {...formCriarConta.register("senha")}
                    type="password"
                    autoComplete="new-password"
                    erro={erroDaSenhaNova}
                    dica={erroDaSenhaNova ? undefined : "Pelo menos 8 caracteres."}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={formCriarConta.formState.isSubmitting}
                  >
                    {formCriarConta.formState.isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" aria-hidden="true" />
                        Criando conta…
                      </>
                    ) : (
                      "Criar conta"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
