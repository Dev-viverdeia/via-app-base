import type { ComponentProps } from "react";
import { cn } from "../../lib/utils.ts";

/**
 * Tabela. O `<Table>` já vem dentro de uma caixa que rola de lado no celular,
 * então a tabela nunca estoura a largura da tela. A caixa é `relative` de
 * propósito: um texto só para leitor de tela (`sr-only`, posicionado) dentro
 * de uma célula fora da vista escapava do recorte e esticava a página inteira.
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
 * Lista de cadastros no celular: <Table empilharNoCelular aria-label="Clientes">,
 * <TableCell rotulo="Cidade">…</TableCell>. Use destaque na identidade e nas
 * ações (linha inteira). O mesmo DOM adapta a tabela; não duplique controles.
 * Nesse modo o cabeçalho some visualmente no celular: forneça ordenação fora
 * dele (como em pages/tabela). Não use esse modo em planilha comparativa larga.
 * Lista vazia? Não renderize uma tabela sem linhas: mostre o `<EmptyState />`.
 */
/** empilharNoCelular exige rotulo em cada TableCell; mantenha ordenação fora do cabeçalho no celular. */
export function Table({ className, empilharNoCelular = false, ...props }: ComponentProps<"table"> & { empilharNoCelular?: boolean }) {
  return (
    <div
      className="relative min-w-0 w-full overflow-x-auto"
      role="region"
      tabIndex={0}
      aria-label="Tabela com rolagem horizontal"
    >
      <table
        // 16px pela mesma razão do botão: célula com quatro palavras ou mais
        // abaixo disso é recusa de desenho na conferência da plataforma.
        role="table"
        className={cn("w-full caption-bottom text-base text-tinta", empilharNoCelular && "tabela-registros", className)}
        {...props}
      />
    </div>
  );
}

export function TableHeader({ className, ...props }: ComponentProps<"thead">) {
  return (
    <thead role="rowgroup"
      className={cn("[&_tr]:border-b [&_tr]:border-borda", className)}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return (
    <tbody role="rowgroup" className={cn("[&_tr:last-child]:border-0", className)} {...props} />
  );
}

export function TableFooter({ className, ...props }: ComponentProps<"tfoot">) {
  return (
    <tfoot
      className={cn(
        "border-t border-borda font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr role="row"
      className={cn(
        "border-b border-borda transition-colors duration-[var(--t-rapido)] ease-[var(--curva)] hover:bg-marca/5 data-[state=selected]:bg-marca/10",
        className,
      )}
      {...props}
    />
  );
}

/** Célula de cabeçalho (`<th>`): use uma por coluna, dentro do TableHeader. */
export function TableHead({ className, ...props }: ComponentProps<"th">) {
  return (
    <th role="columnheader" scope="col"
      className={cn(
        "h-11 px-2.5 text-left align-middle text-sm font-medium text-suave whitespace-nowrap",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, rotulo, destaque, children, ...props }: ComponentProps<"td"> & { rotulo?: string; destaque?: boolean }) {
  return (
    <td role="cell" data-destaque={destaque || undefined} className={cn("px-2.5 py-3.5 align-middle", className)} {...props}>
      {rotulo ? <span className="rotulo-da-celula">{rotulo}</span> : null}
      <div className="conteudo-da-celula">{children}</div>
    </td>
  );
}

/** Legenda embaixo da tabela — bom lugar para "12 clientes no total". */
export function TableCaption({
  className,
  ...props
}: ComponentProps<"caption">) {
  return (
    <caption className={cn("mt-4 text-base text-suave", className)} {...props} />
  );
}
