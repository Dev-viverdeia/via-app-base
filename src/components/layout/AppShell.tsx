import { useEffect, useRef, useState, type ReactNode } from "react";
import { matchPath, NavLink, useLocation } from "react-router-dom";
import { Check, Grid2X2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { PAGINAS } from "../../pages.config.ts";
import { supabase } from "../../lib/supabase.ts";
import { cn } from "../../lib/utils.ts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog.tsx";

/**
 * Nome do app exibido na marca. Renomear o app = trocar aqui
 * (e o <title> do index.html, que é o nome antes do app abrir).
 */
export const NOME_DO_APP = "Meu app";

/**
 * O logo do negócio, quando existe um arquivo em `public/`. Aponte para ele
 * (`"/logo.png"`, `"/logo.jpg"` ou `"/logo.webp"`) e a marca vira a imagem na
 * moldura e no login; em `null`, fica o nome em texto. É constante, e não uma
 * busca pelo arquivo, porque `public/` não passa pelo empacotador: procurar em
 * tempo de execução faria a marca piscar de texto para imagem a cada abertura.
 */
export const LOGO_DO_APP: string | null = null;

/** A navegação é o registro de páginas: nada de menu escrito na mão. */
const ITENS_DA_NAVEGACAO = PAGINAS.filter((pagina) => pagina.naNavbar);
// A ordem do registro define os acessos principais. Três destinos deixam os
// nomes legíveis também em 320px; todas as áreas continuam no menu Mais.
const ITENS_PRINCIPAIS = ITENS_DA_NAVEGACAO.slice(0, 3);
const ITENS_ADICIONAIS = ITENS_DA_NAVEGACAO.slice(3);

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
  "flex items-center gap-3 rounded-m px-3 py-2.5 text-base font-medium transition-colors duration-[var(--t-rapido)] ease-[var(--curva)] toque";

/**
 * Moldura do app: barra lateral de vidro flutuando no desktop, barra
 * inferior de vidro no celular, e no meio a área de conteúdo onde cada
 * página entra (começando pelo `PageHeader`). Cores, raios e sombras vêm
 * todos dos tokens; o vidro, de `globals.css`.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const { pathname } = useLocation();
  const moldura = useRef<HTMLDivElement>(null);
  const barra = useRef<HTMLElement>(null);
  const painel = useRef<HTMLDivElement>(null);
  const areaAdicional = ITENS_ADICIONAIS.find(pagina =>
    matchPath({ path: pagina.rota, end: pagina.rota === "/" }, pathname),
  );

  useEffect(() => { setMenuAberto(false); }, [pathname]);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 48rem)");
    const fecharNoDesktop = () => { if (desktop.matches) setMenuAberto(false); };
    desktop.addEventListener("change", fecharNoDesktop);
    const medir = () => {
      if (!barra.current || !moldura.current) return;
      const altura = barra.current.getBoundingClientRect().height;
      const base = Number.parseFloat(getComputedStyle(barra.current).bottom) || 0;
      // Inclui o vidro, a área segura do aparelho e 12px de respiro. A mesma
      // medida serve ao conteúdo e ao campo de conversa de qualquer página.
      moldura.current.style.setProperty("--app-bottom-inset", `${altura ? Math.ceil(altura + base + 12) : 0}px`);
    };
    const observer = new ResizeObserver(medir);
    if (barra.current) observer.observe(barra.current);
    medir();
    window.addEventListener("resize", medir);
    return () => { observer.disconnect(); window.removeEventListener("resize", medir); desktop.removeEventListener("change", fecharNoDesktop); };
  }, []);

  return (
    <div ref={moldura} className="app-shell min-h-dvh">
      {/* --- Desktop: barra lateral de vidro, solta da borda ------------- */}
      <aside className="fixed inset-y-3 left-3 z-30 hidden w-60 flex-col rounded-g vidro-alto md:flex">
        {/* A marca. O logo entra NO LUGAR do nome, não ao lado: logo de
            negócio quase sempre já traz o nome desenhado, e os dois juntos
            escreveriam a marca duas vezes na mesma linha. A faixa tem altura
            fixa nos dois casos, para a navegação não pular quando um projeto
            ganha logo. */}
        <div className="flex h-16 shrink-0 items-center px-5">
          {LOGO_DO_APP ? (
            <img
              src={LOGO_DO_APP}
              alt={NOME_DO_APP}
              className="h-9 w-auto max-w-full object-contain object-left"
            />
          ) : (
            <p className="text-[17px] font-semibold tracking-tight text-tinta">
              {NOME_DO_APP}
            </p>
          )}
        </div>
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
              <span className="min-w-0 [overflow-wrap:anywhere]">{pagina.titulo}</span>
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
        {/* No celular a barra lateral some, e com ela a marca — então o logo
            reaparece aqui, acima do título da tela. Sem logo não nasce faixa
            nenhuma: o nome em texto aqui só repetiria, em letra menor, o que o
            título da tela já diz. */}
        {LOGO_DO_APP ? (
          <header className="px-4 pt-6 md:hidden">
            <img
              src={LOGO_DO_APP}
              alt={NOME_DO_APP}
              className="h-8 w-auto max-w-[60%] object-contain object-left"
            />
          </header>
        ) : null}
        <main className="mx-auto w-full max-w-6xl px-4 pt-6 pb-[var(--app-bottom-inset)] md:px-8 md:py-10">
          {children}
        </main>
      </div>

      {/* --- Celular: barra inferior de vidro ----------------------------- */}
      <Dialog open={menuAberto} onOpenChange={setMenuAberto}>
      <nav
        ref={barra}
        aria-label="Navegação principal"
        className="app-mobile-nav fixed inset-x-3 bottom-[calc(.75rem+env(safe-area-inset-bottom,0px))] z-30 mx-auto flex max-w-lg gap-1 rounded-g vidro-alto p-1 md:hidden"
      >
        {ITENS_PRINCIPAIS.map((pagina) => (
          <NavLink
            key={pagina.id}
            to={pagina.rota}
            end={pagina.rota === "/"}
            title={pagina.titulo}
            className={({ isActive }) =>
              cn(
                "app-mobile-item",
                isActive ? "bg-marca/10 font-semibold text-tinta [&>svg]:text-marca" : "text-suave",
              )
            }
          >
            <pagina.icone className="size-5 shrink-0" aria-hidden="true" />
            <span className="line-clamp-2 max-w-full [overflow-wrap:anywhere]">{pagina.titulo}</span>
          </NavLink>
        ))}

        <DialogTrigger asChild>
        <button
          type="button"
          data-via-navigation-trigger
          aria-label={areaAdicional ? `Mais, área atual: ${areaAdicional.titulo}` : "Mais"}
          className={cn("app-mobile-item", areaAdicional ? "bg-marca/10 font-semibold text-tinta [&>svg]:text-marca" : "text-suave")}
        >
          <Grid2X2 className="size-5 shrink-0" aria-hidden="true" />
          <span>Mais</span>
        </button>
        </DialogTrigger>
      </nav>
      <DialogContent ref={painel} aria-describedby={undefined} className="gap-3"
        onOpenAutoFocus={event => {
          event.preventDefault();
          (painel.current?.querySelector<HTMLElement>('a[aria-current="page"]') ?? painel.current?.querySelector<HTMLElement>('a, button'))?.focus();
        }}>
        <DialogHeader>
          <p className="text-sm text-suave">{NOME_DO_APP}</p>
          <DialogTitle>Todas as áreas</DialogTitle>
        </DialogHeader>
        <nav aria-label="Navegação principal" className="flex flex-col gap-1">
          {ITENS_DA_NAVEGACAO.map(pagina => (
            <NavLink key={pagina.id} to={pagina.rota} end={pagina.rota === "/"}
              onClick={() => setMenuAberto(false)}
              className={({ isActive }) => cn(ITEM_LATERAL, "min-h-12", isActive ? "bg-marca/10 font-semibold text-tinta" : "text-suave hover:bg-tinta/5 hover:text-tinta")}
            >
              {({ isActive }) => <>
                <pagina.icone className={cn("size-5 shrink-0", isActive && "text-marca")} aria-hidden="true" />
                <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{pagina.titulo}</span>
                {isActive && <Check className="size-4 shrink-0 text-marca" aria-hidden="true" />}
              </>}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-borda pt-3">
          <button type="button" onClick={() => { setMenuAberto(false); void sair(); }}
            className={cn(ITEM_LATERAL, "min-h-12 w-full text-suave hover:bg-tinta/5 hover:text-tinta")}>
            <LogOut className="size-5 shrink-0" aria-hidden="true" />Sair da conta
          </button>
        </div>
      </DialogContent>
      </Dialog>
    </div>
  );
}
