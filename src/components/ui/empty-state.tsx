import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils.ts";

/**
 * Estado vazio: o que a tela mostra quando ainda não existe nenhum dado.
 * Toda lista, tabela e quadro do app usa este bloco — nunca uma tela em branco.
 *
 *   <EmptyState
 *     icone={Users}
 *     titulo="Nenhum cliente ainda"
 *     descricao="Cadastre o primeiro cliente para começar a acompanhar as vendas."
 *     acao={<Button onClick={abrirDialogo}>Novo cliente</Button>}
 *   />
 *
 * Atenção: as propriedades são em português (`icone`, `titulo`, `descricao`,
 * `acao`) — este componente é nosso, não é do shadcn. `icone` recebe o
 * componente do lucide-react SEM renderizar: `icone={Users}`, não `<Users />`.
 */
type EmptyStateProps = {
  /** Ícone do lucide-react, passado como componente. */
  icone: LucideIcon;
  /** Frase curta que diz o que está faltando. */
  titulo: string;
  /** Uma linha explicando como sair do vazio. */
  descricao: string;
  /** Opcional: o botão que resolve (ex.: "Novo cliente"). */
  acao?: ReactNode;
  className?: string;
};

export function EmptyState({
  icone: Icone,
  titulo,
  descricao,
  acao,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-g border border-dashed border-borda bg-superficie px-6 py-14 text-center",
        className,
      )}
    >
      <span className="mb-1 flex size-12 items-center justify-center rounded-total bg-marca/10 text-marca">
        <Icone className="size-6" aria-hidden="true" />
      </span>
      <h3 className="text-base font-semibold text-balance text-tinta">
        {titulo}
      </h3>
      <p className="max-w-sm text-sm text-pretty text-suave">{descricao}</p>
      {acao ? <div className="mt-3 flex flex-wrap gap-2">{acao}</div> : null}
    </div>
  );
}
