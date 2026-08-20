import { Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AppShell, NOME_DO_APP } from "./components/layout/AppShell.tsx";
import { PAGINAS, type PaginaDoApp } from "./pages.config.ts";

// Um cliente para o app inteiro. Fica fora do componente para não nascer de
// novo a cada render (isso jogaria o cache das consultas fora).
const queryClient = new QueryClient();

/** Uma entrada do registro virando tela: moldura + carregamento preguiçoso. */
function Rota({ pagina }: { pagina: PaginaDoApp }) {
  const Pagina = pagina.pagina;

  // O título da aba do navegador acompanha a página aberta.
  useEffect(() => {
    document.title = `${pagina.titulo} · ${NOME_DO_APP}`;
  }, [pagina.titulo]);

  return (
    <AppShell>
      <Suspense fallback={<p className="text-suave">Carregando…</p>}>
        <Pagina />
      </Suspense>
    </AppShell>
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
        </Routes>
      </BrowserRouter>
      {/* Avisos do app (sonner). Um só, no topo. "system" segue o tema do
          sistema, igual aos tokens. */}
      <Toaster theme="system" />
    </QueryClientProvider>
  );
}
