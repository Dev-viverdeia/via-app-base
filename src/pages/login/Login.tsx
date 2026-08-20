import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  isAuthRetryableFetchError,
  type AuthError,
  type Session,
} from "@supabase/supabase-js";
import { NOME_DO_APP } from "../../components/layout/AppShell.tsx";
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

type CamposEntrar = z.infer<typeof esquemaEntrar>;
type CamposCriarConta = z.infer<typeof esquemaCriarConta>;

/**
 * A frase para quando não sabemos dizer nada melhor. Ela aparece em dois
 * lugares (erro sem tradução e falha relançada), e nos dois o objeto real vai
 * para o console — a tela fica em português, o diagnóstico não se perde.
 */
const MENSAGEM_GENERICA =
  "Não foi possível concluir agora. Tente de novo em instantes.";

/**
 * Traduz o erro que o Supabase devolve para uma frase que o usuário entende.
 * O texto técnico (em inglês) nunca vai para a tela.
 */
function mensagemDoErro(erro: AuthError): string {
  // Sem internet, servidor fora do ar ou endereço errado no .env.
  if (isAuthRetryableFetchError(erro)) {
    return "Não conseguimos falar com o servidor. Verifique sua conexão e tente de novo.";
  }

  switch (erro.code) {
    case "invalid_credentials":
      return "E-mail ou senha incorretos.";
    case "email_not_confirmed":
      return "Confirme o e-mail que enviamos antes de entrar.";
    case "user_already_exists":
    case "email_exists":
      return "Já existe uma conta com este e-mail. Use a aba Entrar.";
    case "weak_password":
      return "Escolha uma senha mais forte: misture letras, números e símbolos.";
    case "email_address_invalid":
      return "Este endereço de e-mail não é aceito. Tente outro.";
    case "signup_disabled":
      return "O cadastro está desativado neste aplicativo.";
    case "user_banned":
      return "Esta conta está bloqueada. Fale com o suporte.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Muitas tentativas seguidas. Espere um minuto e tente de novo.";
    default:
      // Código que ainda não traduzimos — inclusive os que denunciam o
      // ambiente errado (chave publicável trocada, projeto pausado). A tela
      // segue em português; o objeto de verdade vai para o console, senão
      // esse erro fica impossível de diagnosticar.
      console.error(erro);
      return MENSAGEM_GENERICA;
  }
}

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

  const formEntrar = useForm<CamposEntrar>({
    resolver: zodResolver(esquemaEntrar),
    defaultValues: { email: "", senha: "" },
  });

  const formCriarConta = useForm<CamposCriarConta>({
    resolver: zodResolver(esquemaCriarConta),
    defaultValues: { email: "", senha: "" },
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

  // A senha do cadastro mostra dica OU erro no mesmo lugar, então a mensagem
  // sai numa variável só: é ela que decide as duas props do campo.
  const erroDaSenhaNova = formCriarConta.formState.errors.senha?.message;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-10">
      {/* Página standalone: o `<h1>` do documento é este — não há PageHeader
          aqui para trazê-lo. */}
      <h1 className="text-2xl font-bold tracking-tight text-marca">
        {NOME_DO_APP}
      </h1>

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

            {/* --- Entrar ------------------------------------------------ */}
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
                    className="rounded-m border border-destrutivo/40 bg-destrutivo/10 px-3 py-2 text-sm text-destrutivo"
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
              </form>
            </TabsContent>

            {/* --- Criar conta ------------------------------------------- */}
            <TabsContent value="criar-conta">
              <form
                noValidate
                onSubmit={formCriarConta.handleSubmit(criarConta)}
                className="grid gap-4"
              >
                {erroCriarConta ? (
                  <p
                    role="alert"
                    className="rounded-m border border-destrutivo/40 bg-destrutivo/10 px-3 py-2 text-sm text-destrutivo"
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

                {/* Dica e erro dividem o mesmo lugar: a regra da senha aparece
                    enquanto ninguém errou, e some no instante em que o erro
                    tem algo mais urgente a dizer. */}
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
    </main>
  );
}
