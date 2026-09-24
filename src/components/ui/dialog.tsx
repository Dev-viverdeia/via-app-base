import { useRef, type ComponentProps } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../lib/utils.ts";

/**
 * Diálogo (modal): formulário de criar/editar, confirmação de exclusão.
 *
 *   <Dialog>
 *     <DialogTrigger asChild><Button>Novo cliente</Button></DialogTrigger>
 *     <DialogContent>
 *       <DialogHeader>
 *         <DialogTitle>Novo cliente</DialogTitle>
 *         <DialogDescription>Preencha os dados abaixo.</DialogDescription>
 *       </DialogHeader>
 *       <form …>…</form>
 *       <DialogFooter>
 *         <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
 *         <Button type="submit">Salvar</Button>
 *       </DialogFooter>
 *     </DialogContent>
 *   </Dialog>
 *
 * Para abrir/fechar pelo código (ex.: fechar depois de salvar), controle:
 * `<Dialog open={aberto} onOpenChange={setAberto}>` — e nesse caso o
 * DialogTrigger é dispensável.
 *
 * O `<DialogTitle>` é OBRIGATÓRIO (é ele que dá nome ao diálogo no leitor de
 * tela). Diálogo sem descrição: passe `aria-describedby={undefined}` no
 * DialogContent. O resto da acessibilidade — Esc fecha, foco preso dentro,
 * foco volta para o botão que abriu, fundo travado — vem do Radix.
 */
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

function DialogOverlay({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn("fixed inset-0 z-50 bg-sobreposicao backdrop-blur-sm", className)}
      {...props}
    />
  );
}

export function DialogContent({
  className,
  children,
  onOpenAutoFocus,
  onCloseAutoFocus,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
  const origemDoFoco = useRef<HTMLElement | null>(null);
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        onOpenAutoFocus={event => {
          origemDoFoco.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
          onOpenAutoFocus?.(event);
        }}
        onCloseAutoFocus={event => {
          onCloseAutoFocus?.(event);
          // Diálogos controlados podem abrir sem DialogTrigger (botão de cada registro).
          if (!event.defaultPrevented && origemDoFoco.current?.isConnected) {
            event.preventDefault();
            origemDoFoco.current.focus();
          }
        }}
        className={cn(
          "surgir vidro-alto fixed z-50 flex min-w-0 flex-col gap-4 overflow-y-auto overscroll-contain p-5 text-tinta sm:p-6 [overflow-wrap:anywhere]",
          // Computador: centrado. Celular: folha que sobe do fundo, com a
          // largura toda e o respiro da barra do sistema.
          "sm:top-1/2 sm:left-1/2 sm:w-[calc(100%-2rem)] sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-g sm:max-h-[calc(100dvh-2rem)]",
          "max-sm:inset-x-0 max-sm:bottom-0 max-sm:max-h-[calc(100dvh-3rem)] max-sm:rounded-t-g max-sm:pb-[max(1.5rem,env(safe-area-inset-bottom))]",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute top-3 right-3 flex size-11 items-center justify-center rounded-total text-suave transition-colors duration-[var(--t-rapido)] ease-[var(--curva)] hover:bg-tinta/5 hover:text-tinta">
          <X className="size-4" aria-hidden="true" />
          <span className="sr-only">Fechar</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 pr-8 text-left", className)}
      {...props}
    />
  );
}

/** Rodapé: ações à direita no desktop, empilhadas no celular. */
export function DialogFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mt-2 flex flex-col-reverse flex-wrap gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn(
        "text-lg font-semibold tracking-tight text-balance text-tinta",
        className,
      )}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-base text-pretty text-suave", className)}
      {...props}
    />
  );
}
