import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { PAGINAS } from "../../pages.config.ts";
import { supabase } from "../../lib/supabase.ts";
import { cn } from "../../lib/utils.ts";

/**
 * Nome do app exibido na marca. Renomear o app = trocar aqui
 * (e o <title> do index.html, que é o nome antes do app abrir).
 */
export const NOME_DO_APP = "Meu app";

/** A navegação é o registro de páginas: nada de menu escrito na mão. */
const ITENS_DA_NAVEGACAO = PAGINAS.filter((pagina) => pagina.naNavbar);

/**
 * Encerra a sessão. Não navegamos daqui: quem observa a sessão é o
 * `RequerSessao`, e ele já leva a pessoa para `/login` no instante em que ela
 * morre — navegar aqui também seria mandar duas vezes.
 *
 * O supabase-js apaga a sessão local mesmo quando a revogação no servidor
 * falha, então o aviso é o mesmo nos dois casos; o erro do servidor vai só
 * para o console. O `catch` existe porque essa chamada também RELANÇA (trava
 * de sessão, storage bloqueado) — sem ele, o clique não faria nada visível.
 */
async function sair() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) console.error(error);
    toast.success("Você saiu.");
  } catch (erro) {
    console.error(erro);
    toast.error("Não foi possível sair agora. Tente de novo.");
  }
}

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

        {/* Rodapé da barra lateral: a saída fica longe da navegação, no canto
            de baixo, onde ninguém clica sem querer. */}
        <div className="shrink-0 border-t border-borda p-3">
          <button
            type="button"
            onClick={sair}
            className="flex w-full items-center gap-3 rounded-m px-3 py-2 text-sm font-medium text-suave transition-colors hover:bg-fundo hover:text-tinta"
          >
            <LogOut className="size-5 shrink-0" aria-hidden="true" />
            Sair
          </button>
        </div>
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

        {/* No celular a saída é o último item da barra, com a mesma linguagem
            visual dos outros — só que ela não leva a lugar nenhum. */}
        <button
          type="button"
          onClick={sair}
          className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium text-suave transition-colors"
        >
          <LogOut className="size-5 shrink-0" aria-hidden="true" />
          Sair
        </button>
      </nav>
    </div>
  );
}
