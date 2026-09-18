/**
 * TELA INICIAL — o painel que abre o app.
 *
 * ONDE PLUGAR DADOS REAIS: tudo o que aparece aqui vem de
 * `src/data/demo/indicadores.ts` (`RESUMO`, `FATURAMENTO_POR_DIA`,
 * `ATIVIDADES`) e a lista `INDICADORES` lá embaixo é montada na hora em que o
 * módulo carrega — ao trocar por consultas ao banco, mova essa montagem para
 * dentro do componente (`useQuery`) e desenhe os estados de carregando e de
 * erro, porque o dado deixa de estar pronto antes da primeira pintura.
 */
import {
  Activity,
  FileText,
  Receipt,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { format, formatDistanceToNowStrict } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "../../components/layout/PageHeader.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card.tsx";
import { EmptyState } from "../../components/ui/empty-state.tsx";
import { cn, emReais } from "../../lib/utils.ts";
import {
  ATIVIDADES,
  FATURAMENTO_POR_DIA,
  RESUMO,
  type DiaDeFaturamento,
  type TipoDeAtividade,
} from "../../data/demo/indicadores.ts";

/* -------------------------------------------------------------------------
   Os quatro números do topo. O ícone é escolha da tela, não do dado: por isso
   ele mora aqui e não em `indicadores.ts`.
------------------------------------------------------------------------- */

const INDICADORES: ReadonlyArray<{
  id: string;
  rotulo: string;
  valor: string;
  variacao: number;
  icone: LucideIcon;
}> = [
  {
    id: "faturamento",
    rotulo: "Faturamento",
    valor: emReais(RESUMO.faturamento),
    variacao: RESUMO.variacao.faturamento,
    icone: Wallet,
  },
  {
    id: "pedidos",
    rotulo: "Pedidos",
    valor: RESUMO.pedidos.toLocaleString("pt-BR"),
    variacao: RESUMO.variacao.pedidos,
    icone: ShoppingBag,
  },
  {
    id: "novos-clientes",
    rotulo: "Novos clientes",
    valor: RESUMO.novosClientes.toLocaleString("pt-BR"),
    variacao: RESUMO.variacao.novosClientes,
    icone: UserPlus,
  },
  {
    id: "ticket-medio",
    rotulo: "Ticket médio",
    valor: emReais(RESUMO.ticketMedio),
    variacao: RESUMO.variacao.ticketMedio,
    icone: Receipt,
  },
];

/**
 * O tamanho dos números, UM para a fileira inteira.
 *
 * O número é o herói e nasce em 28px, mas o cartão mais estreito do app tem
 * 186px de conteúdo (quatro colunas a 1280) e nesse tamanho só cabem 12
 * caracteres — o décimo terceiro vazava para fora e atropelava o cartão
 * vizinho. Como os algarismos são tabulares, contar caracteres É medir a
 * largura: a escala cai um degrau por vez até 22px, onde ainda cabem 16
 * ("R$ 99.999.999,99"). Nada é cortado e o número continua sendo o maior
 * texto do cartão — o rótulo tem 11px e a variação, 14px.
 *
 * O degrau vale para os quatro de uma vez, ditado pelo valor mais comprido:
 * cartões iguais lado a lado com números de tamanhos diferentes fariam o
 * faturamento do mês parecer menos importante que "37".
 *
 * Ao plugar dados reais, isto se move para dentro do componente junto com
 * `INDICADORES` — o tamanho depende dos valores, e eles passam a chegar
 * depois da primeira pintura.
 */
const TAMANHO_DOS_VALORES = (() => {
  const maior = Math.max(...INDICADORES.map((indicador) => indicador.valor.length));
  if (maior > 14) return "text-[1.375rem]";
  if (maior > 12) return "text-2xl";
  return "text-[1.75rem]";
})();

/** Cada tipo de atividade tem o seu ícone. */
const ICONE_DA_ATIVIDADE: Record<TipoDeAtividade, LucideIcon> = {
  venda: ShoppingBag,
  cliente: UserPlus,
  pagamento: Wallet,
  proposta: FileText,
};

/**
 * A variação contra os 30 dias anteriores. A cor não é a única pista: a seta
 * e o sinal (+/−) dizem a mesma coisa para quem não distingue verde de vermelho.
 */
function Variacao({ percentual }: { percentual: number }) {
  const subiu = percentual >= 0;
  const Seta = subiu ? TrendingUp : TrendingDown;
  const numero = Math.abs(percentual).toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return (
    <p className="mt-2 flex flex-wrap items-center gap-x-1.5 text-sm text-suave">
      <span
        className={cn(
          "inline-flex items-center gap-1 font-semibold",
          subiu ? "text-positivo" : "text-destrutivo",
        )}
      >
        <Seta className="size-3.5 shrink-0" aria-hidden="true" />
        {subiu ? "+" : "−"}
        {numero}%
      </span>
      vs. mês anterior
    </p>
  );
}

export default function Inicio() {
  return (
    <>
      <PageHeader
        titulo="Início"
        descricao="Como o negócio está indo nos últimos 30 dias."
      />

      {/* --- Os quatro indicadores -------------------------------------- */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {INDICADORES.map((indicador) => (
          <Card key={indicador.id}>
            {/* O ícone divide a linha com o RÓTULO, e o número fica com a
                largura inteira do cartão na linha de baixo. Enquanto os dois
                eram vizinhos na mesma linha, o número não tinha para onde
                crescer e passava por cima do ícone. */}
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold tracking-[0.08em] text-suave uppercase">{indicador.rotulo}</p>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-total bg-marca/10 text-marca">
                  <indicador.icone className="size-5" aria-hidden="true" />
                </span>
              </div>
              <p
                className={cn(
                  "mt-3 leading-none font-semibold tracking-tight text-tinta tabular-nums",
                  TAMANHO_DOS_VALORES,
                )}
              >
                {indicador.valor}
              </p>
              <Variacao percentual={indicador.variacao} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        {/* --- Gráfico de faturamento ----------------------------------- */}
        <Card className="min-w-0 xl:col-span-3">
          <CardHeader>
            <CardTitle>Faturamento por dia</CardTitle>
            <CardDescription>
              Últimos 30 dias, em reais. Passe o dedo (ou o mouse) sobre a curva
              para ver o valor de cada dia.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {FATURAMENTO_POR_DIA.length === 0 ? (
              <EmptyState
                icone={Activity}
                titulo="Sem movimento ainda"
                descricao="Assim que a primeira venda entrar, a curva do período aparece aqui."
              />
            ) : (
              <div className="h-56 w-full sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={FATURAMENTO_POR_DIA}
                    margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
                  >
                    <defs>
                      {/* O degradê usa a cor da marca: troque o token e ele troca junto. */}
                      <linearGradient
                        id="gradiente-do-faturamento"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="var(--marca)"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="100%"
                          stopColor="var(--marca)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="4 4"
                      stroke="var(--borda)"
                    />
                    <XAxis
                      dataKey="rotulo"
                      tickLine={false}
                      axisLine={false}
                      minTickGap={24}
                      tick={{ fill: "var(--suave)", fontSize: 12 }}
                    />
                    <YAxis
                      width={52}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "var(--suave)", fontSize: 12 }}
                      tickFormatter={(valor) => Number(valor).toLocaleString("pt-BR")}
                    />
                    <Tooltip
                      // O padrão do recharts é " : ", com espaço antes.
                      separator=": "
                      cursor={{ stroke: "var(--marca)", strokeWidth: 1 }}
                      // O recharts SUBSTITUI estes objetos de estilo pelos dele
                      // quando a gente não passa (não há mistura), então cada
                      // propriedade que importa está escrita aqui — em tokens.
                      contentStyle={{
                        margin: 0,
                        padding: "0.5rem 0.75rem",
                        backgroundColor: "var(--superficie)",
                        border: 0,
                        borderRadius: "var(--raio-m)",
                        boxShadow: "var(--sombra-vidro)",
                        whiteSpace: "nowrap",
                      }}
                      labelStyle={{
                        color: "var(--suave)",
                        fontSize: "0.75rem",
                        marginBottom: "0.125rem",
                      }}
                      itemStyle={{
                        display: "block",
                        padding: 0,
                        color: "var(--tinta)",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                      }}
                      labelFormatter={(rotulo, itens) => {
                        const ponto = itens?.[0]?.payload as
                          | DiaDeFaturamento
                          | undefined;
                        return ponto
                          ? format(ponto.data, "EEEE, d 'de' MMMM", {
                              locale: ptBR,
                            })
                          : String(rotulo);
                      }}
                      formatter={(valor) => [emReais(Number(valor)), "Faturamento"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="faturamento"
                      name="Faturamento"
                      stroke="var(--marca)"
                      strokeWidth={2}
                      fill="url(#gradiente-do-faturamento)"
                      activeDot={{ r: 4, fill: "var(--marca)", stroke: "var(--superficie)", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* --- Últimas atividades --------------------------------------- */}
        <Card className="min-w-0 xl:col-span-2">
          <CardHeader>
            <CardTitle>Últimas atividades</CardTitle>
            <CardDescription>O que aconteceu por último no app.</CardDescription>
          </CardHeader>
          <CardContent>
            {ATIVIDADES.length === 0 ? (
              <EmptyState
                icone={Activity}
                titulo="Nada por aqui ainda"
                descricao="Cada venda, cadastro ou pagamento vira uma linha nesta lista."
              />
            ) : (
              // `flex flex-col` e não `grid`: numa grade, a linha mais larga
              // estica a coluna inteira e vaza para fora do cartão.
              <ul className="flex flex-col gap-1">
                {ATIVIDADES.map((atividade) => {
                  const Icone = ICONE_DA_ATIVIDADE[atividade.tipo];
                  return (
                    <li
                      key={atividade.id}
                      className="flex items-start gap-3 rounded-m px-2 py-2.5 transition-colors duration-[var(--t-rapido)] ease-[var(--curva)] hover:bg-marca/5"
                    >
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-total bg-marca/10 text-marca">
                        <Icone className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-base font-medium text-pretty text-tinta">
                            {atividade.titulo}
                          </p>
                          {/* `<time>` guarda a data exata; o texto fica curto. */}
                          <time
                            dateTime={atividade.quando.toISOString()}
                            className="shrink-0 text-xs whitespace-nowrap text-suave"
                          >
                            {formatDistanceToNowStrict(atividade.quando, {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </time>
                        </div>
                        <p className="text-base text-pretty text-suave">
                          {atividade.detalhe}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
