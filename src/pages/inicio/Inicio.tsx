import { PageHeader } from "../../components/layout/PageHeader.tsx";

/**
 * Tela inicial — versão provisória, só para a rota existir.
 * É aqui que entra o painel do app (indicadores, gráfico, atividades).
 */
export default function Inicio() {
  return (
    <>
      <PageHeader titulo="Início" />

      <section className="rounded-g border border-borda bg-superficie p-6 shadow-p sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight text-tinta">
          Seu app está pronto para começar.
        </h2>
        <p className="mt-2 text-pretty text-suave">
          Descreva no chat o que você quer construir. A primeira versão da sua
          ideia nasce a partir daqui.
        </p>
      </section>
    </>
  );
}
