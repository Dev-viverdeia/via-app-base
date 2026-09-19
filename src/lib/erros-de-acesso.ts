import {
  isAuthRetryableFetchError,
  type AuthError,
} from "@supabase/supabase-js";

/**
 * O erro do Supabase virando frase em português.
 *
 * Mora aqui, e não dentro de uma tela, porque DUAS telas dependem dele: o
 * login (entrar e criar conta) e a redefinição de senha. Duas cópias desta
 * tradução virariam duas listas que envelhecem em ritmos diferentes.
 */

/**
 * A frase para quando não sabemos dizer nada melhor. Ela aparece em dois
 * lugares (erro sem tradução e falha relançada), e nos dois o objeto real vai
 * para o console — a tela fica em português, o diagnóstico não se perde.
 */
export const MENSAGEM_GENERICA =
  "Não foi possível concluir agora. Tente de novo em instantes.";

/**
 * Traduz o erro que o Supabase devolve para uma frase que o usuário entende.
 * O texto técnico (em inglês) nunca vai para a tela.
 */
export function mensagemDoErro(erro: AuthError): string {
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
    case "same_password":
      return "A senha nova precisa ser diferente da anterior.";
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

/** Os dois códigos do balde de envio do Supabase, que pedem frase própria. */
export function eLimiteDeEnvio(erro: AuthError): boolean {
  return (
    erro.code === "over_email_send_rate_limit" ||
    erro.code === "over_request_rate_limit"
  );
}
