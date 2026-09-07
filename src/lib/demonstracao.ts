/**
 * Modo de demonstração.
 *
 * Existe SÓ no preview (servidor de desenvolvimento) e SÓ quando a plataforma
 * marca a visita com o cookie `via_demonstracao=1`. É assim que a conferência
 * automática da plataforma entra nas telas protegidas: sem conta e sem rede,
 * a guarda de sessão deixa passar e as telas mostram os dados de exemplo de
 * `src/data/demo`.
 *
 * A pessoa dona do projeto nunca cai neste modo: o preview dela não tem o
 * cookie. O site publicado é um build de produção e não o conhece.
 */
export const MODO_DEMONSTRACAO: boolean =
  import.meta.env.DEV &&
  typeof document !== "undefined" &&
  /(?:^|;\s*)via_demonstracao=1(?:;|$)/.test(document.cookie);
