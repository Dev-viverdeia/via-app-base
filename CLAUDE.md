# Este projeto

Este é o app de negócio de um aluno do Viver de IA Studio, construído por conversa: o dono descreve o que quer e você edita este código. Ele nasceu de um template com login, painel, kanban, tabela de clientes e formulário de captação — o trabalho quase nunca é criar do nada, é adaptar o que existe ao negócio do dono.

Quando a plataforma souber quem é a empresa do dono (nome, ramo, público, tom), esse contexto chega **pelas instruções do seu turno** — não procure num arquivo do projeto. Se ele não veio, pergunte ao dono no chat.

Regras que valem para TODO o arquivo que você tocar:

- **Copy em pt-BR com acentos corretos** — em botão, título, erro, toast e comentário. O dono e os clientes dele leem em português.
- **Cores, raios e sombras SÓ pelos tokens** (`src/styles/tokens.css`) — nunca um hex, `rgb()` ou classe de paleta solta. É isso que faz o app inteiro trocar de tema e de marca de uma vez.
- **Você não tem terminal.** Nada de `npm install`, `npm run`, `tsc`. O build não checa tipos e você não consegue compilar para conferir — então escreva com cuidado redobrado: confira nomes de props no arquivo do componente antes de usar, siga os exemplos dos cabeçalhos-doc, e prefira mudanças pequenas e verificáveis a reescritas grandes.

## Identidade visual: um arquivo

`src/styles/tokens.css` define a identidade INTEIRA como variáveis CSS, com tema claro e escuro. **Rebrandear o app = editar esse arquivo e mais nada.** Cada token tem um comentário dizendo para que existe; ao mudar um valor, preserve a invariante que o comentário declara (ex.: `--sobreposicao` precisa ser mais escuro que `--fundo`). As classes Tailwind dos tokens (`bg-fundo`, `bg-superficie`, `border-borda`, `text-tinta`, `text-suave`, `text-marca`, `bg-marca`, `text-marca-tinta`, `text-positivo`, `text-atencao`, `text-destrutivo`, `rounded-p/m/g/total`, `shadow-p/m/g`, `bg-sobreposicao`) vêm do bloco `@theme inline` — se você precisar de um token novo, declare-o nos DOIS temas e no `@theme`, com comentário.

## Como criar uma página

1. Crie a pasta `src/pages/<id>/` com o componente em `export default`.
2. Acrescente **UMA linha** em `src/pages.config.ts`, entre `// <via:paginas>` e `// </via:paginas>`.

É só isso: a rota, o item da navegação e o título da aba nascem dessa linha. As regras do registro:

- **Cada entrada ocupa exatamente uma linha.** Nunca quebre uma entrada em várias linhas, nunca ponha duas na mesma. A plataforma corta telas removendo linhas deste bloco — entrada fora do padrão quebra esse mecanismo.
- `protegida: true` = a página exige login e renderiza dentro do AppShell (sidebar/barra). `protegida: false` = página pública e **standalone** (sem shell — ela desenha o próprio `<main>`, como `login` e `captacao`).
- `naNavbar: false` tira a página da navegação sem tirá-la do ar.
- **Helpers ficam FORA de `src/pages/`** (em `src/lib/` ou junto do componente que os usa). O verificador trata qualquer pasta de `src/pages/` como página e vai acusar pasta órfã.

Depois de mexer no registro, no `package.json` ou em `CLAUDE.md`, o dono pode rodar `npm run verificar` — mensagens de erro dizem o que quebrou e como consertar. Não edite `scripts/verificar.mjs`.

## O kit de componentes

`src/components/ui/` tem os blocos de construção: `button`, `card`, `input`, `label`, `select`, `dialog`, `table`, `badge`, `tabs`, `empty-state`, `skeleton`, `campo-de-texto`. **Leia o cabeçalho-doc do componente antes de usar** — ele traz JSX pronto e o erro clássico a evitar (ex.: `Select` nunca aceita `value=""`; `DialogTitle` é obrigatório; `icone={Users}`, não `icone={<Users />}`).

Convenção de nomes: os **primitivos têm API em inglês** (`variant`, `size` — padrão shadcn); os **compostos nossos têm props em pt-BR** (`EmptyState` com `icone/titulo/descricao/acoes`, `PageHeader` com `titulo/acoes`, `CampoDeTexto` com `rotulo/erro/dica`). Siga a convenção do arquivo em que estiver.

- Precisa de um visual novo? **Crie uma variante no componente existente** (cva) em vez de duplicar o arquivo ou estilizar por fora.
- Campo de formulário = `CampoDeTexto` — ele já liga `label`, `id`, `aria-invalid` e `aria-describedby` entre si. Não escreva esse quarteto à mão.
- Todo estado vazio usa `EmptyState` (com ação quando houver o que fazer). Toda ação que salva/exclui confirma com `toast` do sonner, em frase neutra de gênero ("X entrou na lista", não "X foi cadastrado").
- `Button` já é `type="button"` por padrão; num `<form>`, o botão de envio precisa de `type="submit"` explícito.

## Dados e formulários

- **Leitura de dados: `@tanstack/react-query`** (`useQuery`), montada DENTRO do componente, com estados de carregando (`Skeleton`) e erro. As telas do template usam dados demo de `src/data/demo/` montados na carga do módulo — ao plugar dados reais, siga o cabeçalho-doc da tela: ele diz exatamente o que mover para dentro do componente.
- **Todo formulário: `react-hook-form` + `zod`**, mensagens do schema em pt-BR. Reuse os arrays de opções nos enums (`z.enum(STATUS)`) para uma lista só governar formulário e dados.
- Dinheiro formata com `emReais()` de `src/lib/utils.ts`; datas com `date-fns` + locale `ptBR`; ids de demo com `novoId()`.

## Supabase (o banco do dono)

- `src/lib/supabase.ts` é o ÚNICO cliente. Não crie outro, não mude as env vars, e **nunca leia nem edite `.env`** — as chaves chegam pelo ambiente da plataforma.
- **Tabela, coluna, policy ou function novas: SÓ pelo fluxo de migração da plataforma** (você propõe a migração no chat; o dono aprova antes de aplicar). Nunca invente outra via.
- **Toda tabela nasce com política RLS.** Sem RLS, o link público do preview dá acesso ao banco do dono — é o pior erro possível neste projeto. Se a tela é pública (ex.: captação gravando em `leads`), a política é de INSERT anônimo estrito; leitura fica para usuários autenticados.
- Login, cadastro e a guarda de sessão (`RequerSessao`) já existem e funcionam com o Supabase do dono. Não reimplemente autenticação.

## Dependências

Quase tudo que um app de negócio precisa **já está instalado**: react-router-dom, react-query, react-hook-form + zod, lucide-react (ícones), recharts (gráficos), dnd-kit (arrastar), date-fns, sonner (toasts), Radix nos primitivos. **Não adicione dependência sem necessidade real.** A instalação acontece fora do seu turno, no religamento do preview — se você escrever uma versão errada no `package.json`, o preview morre sem te mostrar o erro. Se realmente precisar de algo novo, adicione com versão EXATA (sem `^`/`~`) e avise o dono no chat de que o preview vai reinstalar.

## Conectores (no site publicado)

Quando o dono libera um conector para o site, a página chama `POST /via/conectores/{conector}/{OPERACAO}` com corpo JSON — mesma origem, sem token nenhum no código (a resposta vem como `{ok, dados}` ou `{ok:false, erro:{codigo, mensagem}}`; trate os dois). As instruções do seu turno dizem QUAIS conectores e operações existem neste projeto. Nunca invente endpoint de conector nem cole chave de API em código.

## O que não tocar

- `scripts/verificar.mjs`, `public/_redirects`, `vercel.json` — infraestrutura do template.
- Os marcadores `// <via:paginas>` / `// </via:paginas>` e o formato das entradas.
- `package-lock.json` à mão (só muda via `package.json`).
- `src/lib/supabase.ts` além do que ele já é.
- `tokens.css` você toca SÓ para rebrand consciente — nunca para resolver um problema pontual de uma tela (para isso, variante no componente).
