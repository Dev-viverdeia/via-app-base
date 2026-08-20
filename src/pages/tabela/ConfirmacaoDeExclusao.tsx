/**
 * A pergunta antes de excluir. Ele abre sozinho quando `cliente` deixa de ser
 * `null` — quem põe alguém na fila é a lixeira da linha, em `Tabela.tsx`.
 */
import { Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog.tsx";
import type { Cliente } from "../../data/demo/clientes.ts";

export function ConfirmacaoDeExclusao({
  cliente,
  aoFechar,
  aoConfirmar,
}: {
  /** `null` = ninguém na fila, diálogo fechado. */
  cliente: Cliente | null;
  aoFechar: () => void;
  aoConfirmar: () => void;
}) {
  return (
    <Dialog
      open={cliente !== null}
      onOpenChange={(aberto) => {
        if (!aberto) aoFechar();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Excluir cliente</DialogTitle>
          <DialogDescription>
            {cliente
              ? `${cliente.nome} sai da lista e não dá para desfazer.`
              : ""}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button variant="destructive" onClick={aoConfirmar}>
            <Trash2 />
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
