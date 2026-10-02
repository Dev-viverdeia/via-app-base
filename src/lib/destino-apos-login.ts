type PaginaDeDestino = {
  rota: string;
  protegida: boolean;
  naNavbar: boolean;
};

function caminhoInterno(caminho: unknown, origem: string): caminho is string {
  if (typeof caminho !== "string" || !caminho.startsWith("/")) return false;
  try {
    return new URL(caminho, origem).origin === origem;
  } catch {
    return false;
  }
}

/** Volta à tela solicitada ou abre a área interna, mesmo com site público em "/". */
export function destinoAposLogin(
  estado: unknown,
  paginas: readonly PaginaDeDestino[],
  origem: string,
): string {
  const de = (estado as { de?: unknown } | null)?.de;
  if (caminhoInterno(de, origem)) return de;

  // Uma rota de detalhe (/:id) precisa de contexto; não serve de entrada padrão.
  const internas = paginas.filter((pagina) =>
    pagina.protegida &&
    caminhoInterno(pagina.rota, origem) &&
    !pagina.rota.split("/").some((parte) => parte.startsWith(":") || parte.includes("*")),
  );
  return (internas.find((pagina) => pagina.naNavbar) ?? internas[0])?.rota ?? "/";
}
