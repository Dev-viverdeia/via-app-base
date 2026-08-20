import type { ComponentProps } from "react";
import { cn } from "../../lib/utils.ts";

/**
 * Bloco cinza pulsando no lugar do conteúdo que ainda está carregando.
 * Dê o tamanho pela classe, imitando o conteúdo que vai entrar ali:
 *
 *   {carregando ? <Skeleton className="h-10 w-48" /> : <p>{nome}</p>}
 *
 * Para uma tela inteira, empilhe alguns dentro de um contêiner avisado:
 *
 *   <div role="status" aria-label="Carregando…" className="space-y-3">
 *     <Skeleton className="h-6 w-1/3" />
 *     <Skeleton className="h-24 w-full" />
 *   </div>
 */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-m bg-borda", className)}
      {...props}
    />
  );
}
