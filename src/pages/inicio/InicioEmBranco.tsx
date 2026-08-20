/**
 * BOAS-VINDAS — a tela inicial do modo "começar do zero", quando o app nasce
 * sem nenhuma tela pronta. A plataforma promove este arquivo a `Inicio.tsx` na
 * criação do projeto; ao construir a primeira tela de verdade, o agente
 * SUBSTITUI este conteúdo — a boas-vindas só faz sentido enquanto o app é vazio.
 */
import { Sparkles } from "lucide-react";
import { NOME_DO_APP } from "../../components/layout/AppShell.tsx";
import { EmptyState } from "../../components/ui/empty-state.tsx";

export default function InicioEmBranco() {
  return (
    // Esta tela roda nos DOIS lugares: dentro da moldura do app
    // (`protegida: true`) e sozinha na página (`protegida: false`, quando o app
    // nasce sem login). Por isso ela se centra por conta própria — e numa
    // `<div>`, não num `<main>`: dentro da moldura o `<main>` já é o do
    // AppShell, e dois deles na mesma página não existem. A altura desconta
    // 10rem da tela porque é isso que o AppShell gasta de respiro em volta do
    // conteúdo (8,5rem no celular, 5rem no desktop): sem o desconto, a página
    // ganharia uma rolagem de nada dentro da moldura.
    <div className="flex min-h-[calc(100dvh_-_10rem)] flex-col items-center justify-center gap-6 px-4">
      {/* Sem PageHeader: o `<h1>` do documento é este, dentro ou fora da moldura. */}
      <h1 className="text-2xl font-bold tracking-tight text-balance text-marca sm:text-3xl">
        {NOME_DO_APP}
      </h1>

      {/* Sem `acoes`: o que tira o app do vazio é a conversa na plataforma, e
          ela acontece fora daqui — botão nenhum nesta tela resolveria. */}
      <EmptyState
        icone={Sparkles}
        titulo="Seu app começa aqui"
        descricao="Descreva no chat o que ele precisa fazer e o agente constrói a primeira tela — ela entra no lugar desta."
        className="w-full max-w-md"
      />
    </div>
  );
}
