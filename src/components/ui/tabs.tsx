import type { ComponentProps } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../lib/utils.ts";

/**
 * Abas: fatias da MESMA tela (ex.: "Entrar" e "Criar conta").
 * Se o conteúdo merece um endereço próprio, faça uma página, não uma aba.
 *
 *   <Tabs defaultValue="entrar">
 *     <TabsList>
 *       <TabsTrigger value="entrar">Entrar</TabsTrigger>
 *       <TabsTrigger value="criar">Criar conta</TabsTrigger>
 *     </TabsList>
 *     <TabsContent value="entrar">…</TabsContent>
 *     <TabsContent value="criar">…</TabsContent>
 *   </Tabs>
 *
 * O `value` do TabsTrigger e o do TabsContent têm que ser iguais.
 * Setas do teclado, `role="tab"` e `aria-selected` vêm do Radix.
 */
export const Tabs = TabsPrimitive.Root;

export function TabsList({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-total bg-tinta/5 p-1",
        className,
      )}
      {...props}
    />
  );
}

/**
 * A ABA CARREGA O `data-value` DELA, pela mesma razão do `SelectItem`: o Radix
 * esconde o valor num `id` com prefixo sorteado (`radix-_r_0_-trigger-entrar`),
 * que ninguém consegue escrever num seletor. `[role="tab"][data-value="entrar"]`
 * é o palpite natural de quem confere — aqui ele existe.
 */
export function TabsTrigger({
  className,
  value,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      value={value}
      data-value={value}
      className={cn(
        "toque inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-total px-3.5 whitespace-nowrap",
        "text-sm font-medium text-suave transition-colors duration-[var(--t-rapido)] ease-[var(--curva)] hover:text-tinta",
        "data-[state=active]:bg-superficie data-[state=active]:text-tinta data-[state=active]:shadow-m",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({
  className,
  value,
  ...props
}: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      value={value}
      data-value={value}
      className={cn("mt-4", className)}
      {...props}
    />
  );
}
