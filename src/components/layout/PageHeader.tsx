import type { ReactNode } from "react";

type PageHeaderProps = {
  /** Título da tela. Costuma ser o mesmo `titulo` registrado em pages.config. */
  titulo: string;
  /** Uma linha embaixo do título: o recorte ou o contexto da tela ("Hoje · quarta-feira, 16 de setembro"). */
  descricao?: string;
  /** Slot da direita: botões e filtros da tela (ex.: "Novo cliente"). */
  acoes?: ReactNode;
};

/**
 * Cabeçalho padrão das páginas: título à esquerda (o único `<h1>` da tela,
 * com 40px no computador e 28px no celular), ações à direita.
 * Toda tela começa por ele — é o que dá o mesmo ritmo visual ao app inteiro.
 */
export function PageHeader({ titulo, descricao, acoes }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 sm:mb-8">
      <div className="min-w-0">
        <h1 className="text-[1.75rem] leading-tight font-semibold tracking-tight text-balance text-tinta sm:text-[2.5rem]">
          {titulo}
        </h1>
        {descricao ? (
          <p className="mt-1.5 text-base text-pretty text-suave">{descricao}</p>
        ) : null}
      </div>
      {acoes ? <div className="flex items-center gap-2">{acoes}</div> : null}
    </header>
  );
}
