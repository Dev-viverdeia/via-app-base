import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { PAGINAS } from "../../pages.config.ts";
import { cn } from "../../lib/utils.ts";

/**
 * Nome do app exibido na marca. Renomear o app = trocar aqui
 * (e o <title> do index.html, que é o nome antes do app abrir).
 */
export const NOME_DO_APP = "Meu app";

/** A navegação é o registro de páginas: nada de menu escrito na mão. */
const ITENS_DA_NAVEGACAO = PAGINAS.filter((pagina) => pagina.naNavbar);

/**
 * Moldura do app: barra lateral fixa no desktop, barra inferior no celular,
 * e no meio a área de conteúdo onde cada página entra (começando pelo
 * `PageHeader`). Cores, raios e sombras vêm todos dos tokens.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      {/* --- Desktop: barra lateral fixa --------------------------------- */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-borda bg-superficie md:flex">
        <p className="flex h-16 shrink-0 items-center px-6 text-lg font-bold tracking-tight text-marca">
          {NOME_DO_APP}
        </p>
        <nav
          aria-label="Navegação principal"
          className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-6"
        >
          {ITENS_DA_NAVEGACAO.map((pagina) => (
            <NavLink
              key={pagina.id}
              to={pagina.rota}
              end={pagina.rota === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-m px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-marca text-marca-tinta shadow-p"
                    : "text-suave hover:bg-fundo hover:text-tinta",
                )
              }
            >
              <pagina.icone className="size-5 shrink-0" aria-hidden="true" />
              {pagina.titulo}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* --- Conteúdo da página ------------------------------------------ */}
      <div className="md:pl-64">
        <main className="mx-auto w-full max-w-6xl px-4 pt-6 pb-28 md:px-8 md:py-10">
          {children}
        </main>
      </div>

      {/* --- Celular: barra inferior -------------------------------------- */}
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-borda bg-superficie pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {ITENS_DA_NAVEGACAO.map((pagina) => (
          <NavLink
            key={pagina.id}
            to={pagina.rota}
            end={pagina.rota === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors",
                isActive ? "text-marca" : "text-suave",
              )
            }
          >
            <pagina.icone className="size-5 shrink-0" aria-hidden="true" />
            {pagina.titulo}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
