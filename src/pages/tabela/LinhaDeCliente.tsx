/**
 * Uma linha da tabela de clientes: os dados à esquerda, os dois botões de ação
 * à direita. Ela não guarda nada — quem tem a lista é `Tabela.tsx`; aqui só se
 * desenha e se avisa quem clicou em quê.
 */
import { Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "../../components/ui/badge.tsx";
import { Button } from "../../components/ui/button.tsx";
import { TableCell, TableRow } from "../../components/ui/table.tsx";
import { emReais } from "../../lib/utils.ts";
import type { Cliente } from "../../data/demo/clientes.ts";
import { APARENCIA_DO_STATUS } from "./status.ts";

export function LinhaDeCliente({
  cliente,
  aoEditar,
  aoExcluir,
}: {
  cliente: Cliente;
  aoEditar: (cliente: Cliente) => void;
  aoExcluir: (cliente: Cliente) => void;
}) {
  const status = APARENCIA_DO_STATUS[cliente.status];

  return (
    <TableRow>
      <TableCell>
        <p className="font-medium text-tinta">{cliente.nome}</p>
        <p className="text-xs text-suave">{cliente.email}</p>
      </TableCell>
      <TableCell className="whitespace-nowrap text-suave tabular-nums">
        {cliente.whatsapp}
      </TableCell>
      <TableCell className="whitespace-nowrap text-suave">
        {cliente.cidade}
      </TableCell>
      <TableCell>
        <Badge variant={status.variante}>{status.rotulo}</Badge>
      </TableCell>
      <TableCell className="whitespace-nowrap text-suave">
        <time dateTime={cliente.ultimaCompra.toISOString()}>
          {format(cliente.ultimaCompra, "d 'de' MMM", { locale: ptBR })}
        </time>
      </TableCell>
      <TableCell className="text-right font-medium whitespace-nowrap tabular-nums">
        {emReais(cliente.valor)}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          {/* O nome vai no `aria-label`: doze linhas iguais dariam doze botões
              "Editar" sem dizer editar o quê. */}
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Editar ${cliente.nome}`}
            onClick={() => aoEditar(cliente)}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Excluir ${cliente.nome}`}
            onClick={() => aoExcluir(cliente)}
          >
            <Trash2 />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
