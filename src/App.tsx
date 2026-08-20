import { Suspense } from "react";
import type { CSSProperties } from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AppShell, NOME_DO_APP } from "./components/layout/AppShell.tsx";
import { RequerSessao } from "./components/layout/RequerSessao.tsx";
import { buttonVariants } from "./components/ui/button.tsx";
import { PAGINAS, type PaginaDoApp } from "./pages.config.ts";

// Um cliente para o app inteiro. Fica fora do componente para não nascer de
// novo a cada render (isso jogaria o cache das consultas fora).
const queryClient = new QueryClient();

/**
 * Uma entrada do registro virando tela.
 *
 * REGRA DE LAYOUT — é aqui que ela mora, e em nenhum outro lugar:
 *   `protegida: true`  → moldura do app + guarda de sessão.
 *   `protegida: false` → tela cheia, sem moldura (o login, por exemplo).
 * Cada página pública desenha a própria página inteira; o roteador não impõe
 * nenhum enquadramento a ela.
 */
function Rota({ pagina }: { pagina: PaginaDoApp }) {
  const Pagina = pagina.pagina;

  const conteudo = (
    <>
      {/* O React 19 leva este <title> para o <head> sozinho e o desfaz quando
          a rota sai — por isso o 404 lá embaixo devolve o título do
          index.html. Precisa ser UM texto só, daí o template literal. */}
      <title>{`${pagina.titulo} · ${NOME_DO_APP}`}</title>
      <Suspense
        fallback={
          <p role="status" className="text-suave">
            Carregando…
          </p>
        }
      >
        <Pagina />
      </Suspense>
    </>
  );

  if (!pagina.protegida) return conteudo;

  return (
    <AppShell>
      <RequerSessao>{conteudo}</RequerSessao>
    </AppShell>
  );
}

/**
 * Endereço que não existe. Fica fora da moldura porque não é uma tela do app:
 * é o fim da linha, com uma saída de volta para o início.
 */
function PaginaNaoEncontrada() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 py-10 text-center">
      <p className="text-sm font-medium text-suave">Erro 404</p>
      <h1 className="text-2xl font-bold tracking-tight text-balance text-tinta sm:text-3xl">
        Página não encontrada
      </h1>
      <p className="max-w-sm text-pretty text-suave">
        O endereço que você abriu não existe ou saiu do ar.
      </p>
      <Link to="/" className={buttonVariants({ variant: "outline" })}>
        Voltar para o início
      </Link>
    </main>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {PAGINAS.map((pagina) => (
            <Route
              key={pagina.id}
              path={pagina.rota}
              element={<Rota pagina={pagina} />}
            />
          ))}
          <Route path="*" element={<PaginaNaoEncontrada />} />
        </Routes>
        {/* Avisos do app (sonner). Um só, no topo, e DENTRO do roteador para
            que um aviso possa levar um <Link>. "system" segue o tema do
            sistema, igual aos tokens.

            O sonner traz paleta própria (fundo branco fixo, cinza de borda) e
            desenharia a superfície mais repetida do app fora da identidade —
            por isso os três ganchos de cor dele (`--normal-bg`,
            `--normal-border`, `--normal-text`) e o raio apontam para os tokens.
            Rebrandear continua sendo editar UM arquivo.

            `mobileOffset`: abaixo de 600px o aviso nasce embaixo, bem em cima
            da barra de navegação do celular (ele vive num z-index altíssimo, a
            barra não tem como ganhar). Subir o rodapé dele para 5rem deixa a
            navegação sempre clicável. */}
        <Toaster
          theme="system"
          style={
            {
              "--normal-bg": "var(--superficie)",
              "--normal-border": "var(--borda)",
              "--normal-text": "var(--tinta)",
              "--border-radius": "var(--raio-m)",
              fontFamily: "var(--fonte)",
            } as CSSProperties
          }
          mobileOffset={{ bottom: "calc(env(safe-area-inset-bottom) + 5rem)" }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
