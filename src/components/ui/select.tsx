import type { ComponentProps } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils.ts";

/**
 * Seleção de uma opção numa lista curta (status, categoria, responsável).
 *
 *   <Label htmlFor="status">Status</Label>
 *   <Select defaultValue="novo" onValueChange={setStatus}>
 *     <SelectTrigger id="status"><SelectValue placeholder="Escolha…" /></SelectTrigger>
 *     <SelectContent>
 *       <SelectItem value="novo">Novo</SelectItem>
 *       <SelectItem value="fechado">Fechado</SelectItem>
 *     </SelectContent>
 *   </Select>
 *
 * Controlado: `value={status} onValueChange={setStatus}`.
 * Em formulário nativo/react-hook-form, use `name="status"` no `<Select>`.
 * Teclado, foco e `aria-expanded` vêm do Radix; `value` nunca pode ser "".
 */
export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "flex h-10 w-full items-center justify-between gap-2 rounded-m border border-borda bg-superficie px-3 py-2",
        "text-left text-sm text-tinta shadow-p transition-colors data-[placeholder]:text-suave",
        "disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destrutivo",
        "[&>span]:line-clamp-1",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="size-4 shrink-0 text-suave" aria-hidden="true" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position={position}
        className={cn(
          "relative z-50 max-h-64 min-w-32 overflow-hidden rounded-m border border-borda bg-superficie text-tinta shadow-g",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" && "w-full min-w-[var(--radix-select-trigger-width)]",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

/** Título de um grupo de opções, dentro de um `<SelectGroup>`. */
export function SelectLabel({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      className={cn("px-3 py-1.5 text-xs font-semibold text-suave", className)}
      {...props}
    />
  );
}

export function SelectItem({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex w-full cursor-default items-center rounded-p py-2 pr-8 pl-3 text-sm outline-hidden select-none",
        "data-[highlighted]:bg-marca/10 data-[highlighted]:text-tinta",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <span className="absolute right-2 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="size-4 text-marca" aria-hidden="true" />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  );
}

export function SelectSeparator({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      className={cn("-mx-1 my-1 h-px bg-borda", className)}
      {...props}
    />
  );
}
