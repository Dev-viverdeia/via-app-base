import type { ComponentProps } from "react";
import { cn } from "../../lib/utils.ts";

/**
 * Tabela. O `<Table>` já vem dentro de uma caixa que rola de lado no celular,
 * então a tabela nunca estoura a largura da tela.
 *
 *   <Table>
 *     <TableHeader>
 *       <TableRow>
 *         <TableHead>Cliente</TableHead>
 *         <TableHead className="text-right">Valor</TableHead>
 *       </TableRow>
 *     </TableHeader>
 *     <TableBody>
 *       <TableRow>
 *         <TableCell>Ana</TableCell>
 *         <TableCell className="text-right tabular-nums">R$ 1.200</TableCell>
 *       </TableRow>
 *     </TableBody>
 *   </Table>
 *
 * Lista vazia? Não renderize uma tabela sem linhas: mostre o `<EmptyState />`.
 */
export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div
      className="w-full overflow-x-auto"
      role="region"
      tabIndex={0}
      aria-label="Tabela com rolagem horizontal"
    >
      <table
        className={cn("w-full caption-bottom text-sm text-tinta", className)}
        {...props}
      />
    </div>
  );
}

export function TableHeader({ className, ...props }: ComponentProps<"thead">) {
  return (
    <thead
      className={cn("[&_tr]:border-b [&_tr]:border-borda", className)}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return (
    <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
  );
}

export function TableFooter({ className, ...props }: ComponentProps<"tfoot">) {
  return (
    <tfoot
      className={cn(
        "border-t border-borda bg-marca/5 font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      className={cn(
        "border-b border-borda transition-colors hover:bg-marca/5 data-[state=selected]:bg-marca/10",
        className,
      )}
      {...props}
    />
  );
}

/** Célula de cabeçalho (`<th>`): use uma por coluna, dentro do TableHeader. */
export function TableHead({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "h-11 px-3 text-left align-middle text-xs font-semibold tracking-wide text-suave uppercase whitespace-nowrap",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: ComponentProps<"td">) {
  return (
    <td className={cn("px-3 py-3 align-middle", className)} {...props} />
  );
}

/** Legenda embaixo da tabela — bom lugar para "12 clientes no total". */
export function TableCaption({
  className,
  ...props
}: ComponentProps<"caption">) {
  return (
    <caption className={cn("mt-4 text-sm text-suave", className)} {...props} />
  );
}
