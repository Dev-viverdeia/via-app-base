import type { ComponentProps } from "react";
import { cn } from "../../lib/utils.ts";

/** Colunas pela largura disponível, inclusive em diálogos. Campo largo: className="col-span-full". */
export function FormGrid({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("campos-do-formulario", className)} {...props} />;
}
