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

/** O item da navegação lateral: pílula suave, ativo na cor da marca. */
const ITEM_LATERAL =
  "flex items-center gap-3 rounded-m px-3 py-2.5 text-[15px] font-medium transition-colors duration-[var(--t-rapido)] ease-[var(--curva)] toque";

/**
 * Moldura do app: barra lateral de vidro flutuando no desktop, barra
 * inferior de vidro no celular, e no meio a área de conteúdo onde cada
 * página entra (começando pelo `PageHeader`). Cores, raios e sombras vêm
 * todos dos tokens; o vidro, de `globals.css`.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      {/* --- Desktop: barra lateral de vidro, solta da borda ------------- */}
      <aside className="fixed inset-y-3 left-3 z-30 hidden w-60 flex-col rounded-g vidro-alto md:flex">
        <p className="flex h-16 shrink-0 items-center px-5 text-[17px] font-semibold tracking-tight text-tinta">
          {NOME_DO_APP}
        </p>
        <nav
          aria-label="Navegação principal"
          className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-4"
        >
          {ITENS_DA_NAVEGACAO.map((pagina) => (
            <NavLink
              key={pagina.id}
              to={pagina.rota}
              end={pagina.rota === "/"}
              className={({ isActive }) =>
                cn(
                  ITEM_LATERAL,
                  isActive
                    ? "bg-marca/10 font-semibold text-tinta [&>svg]:text-marca"
                    : "text-suave hover:bg-tinta/5 hover:text-tinta",
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
        <div className="shrink-0 p-3">
          <button
            type="button"
            onClick={sair}
            className={cn(ITEM_LATERAL, "w-full text-suave hover:bg-tinta/5 hover:text-tinta")}
          >
            <LogOut className="size-5 shrink-0" aria-hidden="true" />
            Sair
          </button>
        </div>
      </aside>

      {/* --- Conteúdo da página ------------------------------------------ */}
      <div className="md:pl-[16.5rem]">
        <main className="mx-auto w-full max-w-6xl px-4 pt-6 pb-32 md:px-8 md:py-10">
          {children}
        </main>
      </div>

      {/* --- Celular: barra inferior de vidro ----------------------------- */}
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-3 bottom-3 z-30 flex rounded-total vidro-alto p-1 md:hidden"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        {ITENS_DA_NAVEGACAO.map((pagina) => (
          <NavLink
            key={pagina.id}
            to={pagina.rota}
            end={pagina.rota === "/"}
            className={({ isActive }) =>
              cn(
                "flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 rounded-total py-1.5 text-[11px] font-medium transition-colors duration-[var(--t-rapido)] ease-[var(--curva)]",
                isActive ? "bg-marca/10 font-semibold text-tinta [&>svg]:text-marca" : "text-suave",
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
          className="flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 rounded-total py-1.5 text-[11px] font-medium text-suave"
        >
          <LogOut className="size-5 shrink-0" aria-hidden="true" />
          Sair
        </button>
      </nav>
    </div>
  );
}
