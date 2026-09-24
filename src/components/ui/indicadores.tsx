import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "./card.tsx";
import { Skeleton } from "./skeleton.tsx";

export type Indicador = {
  id: string;
  rotulo: string;
  /** Valor já formatado. null significa indisponível; zero continua sendo zero. */
  valor: string | number | null;
  apoio?: ReactNode;
  icone?: LucideIcon;
};

/** Reutilize em painéis; receba valores reais e período da consulta, nunca invente resultados. */
export function Indicadores({ itens, carregando = false }: { itens: readonly Indicador[]; carregando?: boolean }) {
  return (
    <div className="area-indicadores">
      <div className={`grade-indicadores${itens.length === 4 ? " quatro-indicadores" : ""}${itens.some(item => String(item.valor ?? "").length > 16) ? " valores-longos" : ""}`} aria-busy={carregando}>
        {itens.map(({ id, rotulo, valor, apoio, icone: Icone }) => (
          <Card key={id}>
            <CardContent className="p-5">
              <div className="flex min-w-0 items-center justify-between gap-3">
                <p className="text-base font-medium text-suave [overflow-wrap:anywhere]">{rotulo}</p>
                {Icone ? <span className="flex size-10 shrink-0 items-center justify-center rounded-total bg-marca/10 text-marca"><Icone className="size-5" aria-hidden="true" /></span> : null}
              </div>
              {carregando ? <Skeleton className="mt-3 h-10 w-3/4" aria-label="Carregando valor" /> : <p className="valor-indicador mt-3 font-semibold tracking-tight text-tinta tabular-nums">{valor ?? "—"}</p>}
              {carregando ? <Skeleton className="mt-2 h-6 w-full" /> : apoio ? <div className="mt-2 text-base text-suave [overflow-wrap:anywhere]">{apoio}</div> : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
