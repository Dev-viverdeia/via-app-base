import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase.ts";
import { MODO_DEMONSTRACAO } from "../../lib/demonstracao.ts";

const ContextoDaSessao = createContext<Session | null | undefined>(undefined);
export const useSessaoDoApp = () => useContext(ContextoDaSessao);

type Estado = { session: Session | null | undefined; client: QueryClient; generation: number };

/** A conta define a vida dos dados e dos rascunhos, inclusive em rotas públicas.
 * RLS continua protegendo o banco; este limite impede reaproveitar a memória
 * da interface de outra pessoa. Renovar o token não reinicia o aplicativo. */
export function SessaoDoApp({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>(() => ({ session: undefined, client: new QueryClient(), generation: 0 }));
  const atual = useRef(estado);

  useEffect(() => {
    if (MODO_DEMONSTRACAO) return;
    let vivo = true;
    let eventos = 0;
    const receber = (session: Session | null) => {
      if (!vivo) return;
      const antes = atual.current;
      const mudouPessoa = (antes.session?.user.id ?? null) !== (session?.user.id ?? null);
      if (mudouPessoa) {
        // Cancela consultas e descarta também o cache de mutações. Uma resposta
        // tardia continua ligada ao cliente antigo, nunca ao da próxima conta.
        antes.client.clear();
        toast.dismiss();
      }
      const proximo = {
        session,
        client: mudouPessoa ? new QueryClient() : antes.client,
        generation: antes.generation + (mudouPessoa ? 1 : 0),
      };
      atual.current = proximo;
      setEstado(proximo);
    };
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      eventos++;
      receber(session);
    });
    const leitura = eventos;
    void supabase.auth.getSession().then(({ data }) => {
      // Uma leitura iniciada antes de entrar/sair não restaura a conta antiga.
      if (eventos === leitura) receber(data.session);
    }).catch(() => {
      if (eventos === leitura) receber(null);
    });
    return () => { vivo = false; data.subscription.unsubscribe(); };
  }, []);

  return (
    <ContextoDaSessao.Provider value={estado.session}>
      <QueryClientProvider key={estado.generation} client={estado.client}>
        {children}
      </QueryClientProvider>
    </ContextoDaSessao.Provider>
  );
}
