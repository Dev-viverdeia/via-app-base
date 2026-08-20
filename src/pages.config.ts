/**
 * Registro único das páginas do app.
 *
 * Criar uma tela = criar a pasta `src/pages/<id>/` e acrescentar UMA linha
 * dentro dos marcadores lá embaixo. Ninguém escreve rota na mão em nenhum
 * outro lugar: `App.tsx` monta as rotas a partir desta lista e o `AppShell`
 * monta a navegação a partir dela também.
 */
import { lazy } from "react";
import type { ComponentType, LazyExoticComponent } from "react";
import type { LucideIcon } from "lucide-react";
import { LayoutDashboard } from "lucide-react";

export type PaginaDoApp = {
  id: string;            // = nome da pasta em src/pages/<id>
  titulo: string;        // navbar e <title>
  rota: string;
  icone: LucideIcon;
  pagina: LazyExoticComponent<ComponentType>;
  naNavbar: boolean;     // páginas públicas de captação ficam fora
  protegida: boolean;    // true = exige sessão (Task 4)
};

// REGRA DE OURO: uma página = UMA linha dentro dos marcadores.
// O seletor de telas da plataforma remove linhas daqui e apaga a pasta
// correspondente. Nunca quebre uma entrada em várias linhas.
export const PAGINAS: PaginaDoApp[] = [
  // <via:paginas>
  { id: "inicio", titulo: "Início", rota: "/", icone: LayoutDashboard, pagina: lazy(() => import("./pages/inicio/Inicio")), naNavbar: true, protegida: true },
  // </via:paginas>
];
