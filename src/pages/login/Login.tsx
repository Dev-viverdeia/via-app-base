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
} from "@supabase/supabase-js";
import { NOME_DO_APP } from "../../components/layout/AppShell.tsx";
import { Button } from "../../components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card.tsx";
import { Input } from "../../components/ui/input.tsx";
import { Label } from "../../components/ui/label.tsx";
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
      return "Não foi possível concluir agora. Tente de novo em instantes.";
  }
}

/**
 * De onde o visitante veio antes de bater na guarda de sessão. Só aceitamos
 * caminho de dentro do app — um endereço de fora aqui seria um convite a
 * redirecionar o usuário para longe depois do login.
 */
function rotaDeVolta(estado: unknown): string {
  const de = (estado as { de?: unknown } | null)?.de;
  if (typeof de === "string" && de.startsWith("/") && !de.startsWith("//")) {
    return de;
  }
  return "/";
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
    const { error } = await supabase.auth.signInWithPassword({
      email: campos.email,
      password: campos.senha,
    });

    if (error) {
      setErroEntrar(mensagemDoErro(error));
      return;
    }

    toast.success("Tudo certo. Bom te ver de volta!");
    navegar(destino, { replace: true });
  }

  async function criarConta(campos: CamposCriarConta) {
    setErroCriarConta(null);
    const { data, error } = await supabase.auth.signUp({
      email: campos.email,
      password: campos.senha,
    });

    if (error) {
      setErroCriarConta(mensagemDoErro(error));
      return;
    }

    // Com confirmação de e-mail ligada no projeto, o cadastro não abre sessão:
    // a pessoa continua nesta tela até clicar no link que recebeu.
    if (!data.session) {
      toast.success("Conta criada. Confirme o e-mail que enviamos para entrar.");
      return;
    }

    toast.success("Conta criada. Boas-vindas!");
    navegar(destino, { replace: true });
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-10">
      <p className="text-2xl font-bold tracking-tight text-marca">
        {NOME_DO_APP}
      </p>

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

                <div className="grid gap-2">
                  <Label htmlFor="entrar-email">E-mail</Label>
                  <Input
                    {...formEntrar.register("email")}
                    id="entrar-email"
                    type="email"
                    autoComplete="email"
                    placeholder="voce@email.com"
                    aria-invalid={!!formEntrar.formState.errors.email}
                    aria-describedby={
                      formEntrar.formState.errors.email
                        ? "entrar-email-erro"
                        : undefined
                    }
                  />
                  {formEntrar.formState.errors.email ? (
                    <p id="entrar-email-erro" className="text-sm text-destrutivo">
                      {formEntrar.formState.errors.email.message}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="entrar-senha">Senha</Label>
                  <Input
                    {...formEntrar.register("senha")}
                    id="entrar-senha"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={!!formEntrar.formState.errors.senha}
                    aria-describedby={
                      formEntrar.formState.errors.senha
                        ? "entrar-senha-erro"
                        : undefined
                    }
                  />
                  {formEntrar.formState.errors.senha ? (
                    <p id="entrar-senha-erro" className="text-sm text-destrutivo">
                      {formEntrar.formState.errors.senha.message}
                    </p>
                  ) : null}
                </div>

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

                <div className="grid gap-2">
                  <Label htmlFor="criar-conta-email">E-mail</Label>
                  <Input
                    {...formCriarConta.register("email")}
                    id="criar-conta-email"
                    type="email"
                    autoComplete="email"
                    placeholder="voce@email.com"
                    aria-invalid={!!formCriarConta.formState.errors.email}
                    aria-describedby={
                      formCriarConta.formState.errors.email
                        ? "criar-conta-email-erro"
                        : undefined
                    }
                  />
                  {formCriarConta.formState.errors.email ? (
                    <p
                      id="criar-conta-email-erro"
                      className="text-sm text-destrutivo"
                    >
                      {formCriarConta.formState.errors.email.message}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="criar-conta-senha">Senha</Label>
                  <Input
                    {...formCriarConta.register("senha")}
                    id="criar-conta-senha"
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={!!formCriarConta.formState.errors.senha}
                    aria-describedby={
                      formCriarConta.formState.errors.senha
                        ? "criar-conta-senha-erro"
                        : "criar-conta-senha-dica"
                    }
                  />
                  {formCriarConta.formState.errors.senha ? (
                    <p
                      id="criar-conta-senha-erro"
                      className="text-sm text-destrutivo"
                    >
                      {formCriarConta.formState.errors.senha.message}
                    </p>
                  ) : (
                    <p id="criar-conta-senha-dica" className="text-sm text-suave">
                      Pelo menos 8 caracteres.
                    </p>
                  )}
                </div>

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
