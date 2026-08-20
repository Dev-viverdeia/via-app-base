/**
 * BOAS-VINDAS — a tela inicial do modo "começar do zero", quando o app nasce
 * sem nenhuma tela pronta. Na criação do projeto, a plataforma copia este
 * conteúdo para dentro do `Inicio.tsx` (se você está lendo isto lá, foi isso
 * que aconteceu). Ao construir a primeira tela de verdade, SUBSTITUA este
 * conteúdo inteiro voltando ao padrão da casa: `PageHeader` no topo, sem
 * `min-h` nem `<h1>` próprios — a boas-vindas só faz sentido enquanto o app
 * é vazio.
 */
import { Sparkles } from "lucide-react";
import { EmptyState } from "../../components/ui/empty-state.tsx";

export default function InicioEmBranco() {
  return (
    // Esta tela roda nos DOIS lugares: dentro da moldura do app
    // (`protegida: true`) e sozinha na página (`protegida: false`, quando o app
    // nasce sem login). Por isso ela se centra por conta própria — e numa
    // `<div>`, não num `<main>`: dentro da moldura o `<main>` já é o do
    // AppShell, e dois deles na mesma página não existem. Os 10rem descontados
    // da altura são folga com margem: cobrem os 8,5rem de respiro do AppShell
    // no celular e os 5rem no desktop — sem o desconto, a página ganharia uma
    // rolagem de nada dentro da moldura.
    <div className="flex min-h-[calc(100dvh_-_10rem)] flex-col items-center justify-center gap-6 px-4 py-10">
      {/* Sem PageHeader e sem o nome do app: no nascimento ele ainda é um
          placeholder ("Meu app"), e a barra lateral já o exibe quando existe.
          O `<h1>` do documento é a própria boas-vindas. */}
      <h1 className="text-2xl font-bold tracking-tight text-balance text-marca sm:text-3xl">
        Seu app nasce aqui
      </h1>

      {/* Sem `acoes`: o que tira o app do vazio é a conversa na plataforma, e
          ela acontece fora daqui — botão nenhum nesta tela resolveria. */}
      <EmptyState
        icone={Sparkles}
        titulo="Nada por aqui ainda"
        descricao="Conte no chat o que o seu app precisa fazer — a primeira tela aparece no lugar desta."
        className="w-full max-w-md"
      />
    </div>
  );
}
