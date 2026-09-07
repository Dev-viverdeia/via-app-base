import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase.ts";
import { MODO_DEMONSTRACAO } from "../../lib/demonstracao.ts";

/**
 * Porteiro das telas protegidas.
 *
 * Toda página com `protegida: true` no registro entra embrulhada aqui (quem
 * faz isso é o `App.tsx` — ninguém precisa lembrar disso ao criar uma tela).
 * Sem sessão, o visitante vai para `/login`; a rota que ele tentou abrir viaja
 * junto no `state` da navegação para que o login devolva ele ao lugar certo.
 *
 * A sessão é ouvida em tempo real: entrar ou sair em outra aba do navegador
 * muda o que esta guarda decide, sem recarregar a página.
 */
export function RequerSessao({ children }: { children: ReactNode }) {
  const local = useLocation();
  // `undefined` = ainda perguntando ao Supabase (não decida nada nesse meio
  // tempo, senão o usuário logado pisca no login); `null` = sem sessão.
  const [sessao, setSessao] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    // Em modo de demonstração não há sessão para ouvir.
    if (MODO_DEMONSTRACAO) return;
    let vivo = true;

    // A sessão guardada no navegador. Sem nenhuma salva, isto responde na
    // hora e sem rede.
    void supabase.auth.getSession().then(({ data }) => {
      if (vivo) setSessao(data.session);
    });

    // Entrar, sair ou renovar o token muda a resposta desta guarda na hora.
    const { data: assinatura } = supabase.auth.onAuthStateChange(
      (_evento, sessaoAtual) => {
        if (vivo) setSessao(sessaoAtual);
      },
    );

    return () => {
      vivo = false;
      assinatura.subscription.unsubscribe();
    };
  }, []);

  // Modo de demonstração (só no preview, com o cookie da plataforma): a
  // conferência automática entra sem conta e vê as telas com os dados de
  // exemplo. Ver `src/lib/demonstracao.ts`.
  if (MODO_DEMONSTRACAO) return <>{children}</>;

  if (sessao === undefined) {
    return (
      <p role="status" className="text-suave">
        Carregando…
      </p>
    );
  }

  if (sessao === null) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ de: `${local.pathname}${local.search}` }}
      />
    );
  }

  return <>{children}</>;
}
