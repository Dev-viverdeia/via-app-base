import type { ComponentProps } from "react";
import { cn } from "../../lib/utils.ts";

/**
 * Cartão: a caixa padrão de conteúdo do app (indicador, formulário, lista).
 *
 *   <Card>
 *     <CardHeader>
 *       <CardTitle>Clientes</CardTitle>
 *       <CardDescription>Quem comprou nos últimos 30 dias.</CardDescription>
 *     </CardHeader>
 *     <CardContent>…</CardContent>
 *     <CardFooter><Button>Salvar</Button></CardFooter>
 *   </Card>
 *
 * As partes são opcionais: um `<Card className="p-6">` com conteúdo direto
 * também vale para caixas simples.
 */
export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-g border border-borda bg-superficie text-tinta shadow-p",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />
  );
}

/** Vira `<h3>`: o `<h1>` da tela é do PageHeader. */
export function CardTitle({ className, ...props }: ComponentProps<"h3">) {
  return (
    <h3
      className={cn(
        "text-lg font-semibold tracking-tight text-balance text-tinta",
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p className={cn("text-sm text-pretty text-suave", className)} {...props} />
  );
}

export function CardContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-3 p-6 pt-0", className)}
      {...props}
    />
  );
}
