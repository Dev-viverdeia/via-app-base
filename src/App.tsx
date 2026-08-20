import { cn } from "./lib/utils.ts";

export default function App() {
  return (
    <main className="grid min-h-dvh place-items-center bg-fundo p-6 font-sans">
      <section
        className={cn(
          "w-full max-w-2xl rounded-g border border-borda bg-superficie",
          "p-8 shadow-m sm:p-12",
        )}
      >
        <p className="text-sm font-semibold tracking-wide text-marca">
          Viver de IA Studio
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-balance text-tinta sm:text-5xl">
          Seu app está pronto para começar.
        </h1>
        <p className="mt-4 text-lg text-pretty text-suave">
          Descreva no chat o que você quer construir. A primeira versão da sua
          ideia nasce a partir daqui.
        </p>
      </section>
    </main>
  );
}
