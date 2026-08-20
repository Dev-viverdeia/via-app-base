import type { ReactNode } from "react";

type PageHeaderProps = {
  /** Título da tela. Costuma ser o mesmo `titulo` registrado em pages.config. */
  titulo: string;
  /** Slot da direita: botões e filtros da tela (ex.: "Novo cliente"). */
  acoes?: ReactNode;
};

/**
 * Cabeçalho padrão das páginas: título à esquerda, ações à direita.
 * Toda tela começa por ele — é o que dá o mesmo ritmo visual ao app inteiro.
 */
export function PageHeader({ titulo, acoes }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3 sm:mb-8">
      <h1 className="text-2xl font-bold tracking-tight text-balance text-tinta sm:text-3xl">
        {titulo}
      </h1>
      {acoes ? <div className="flex items-center gap-2">{acoes}</div> : null}
    </header>
  );
}
