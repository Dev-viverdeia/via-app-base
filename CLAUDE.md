# Este projeto

Este é o projeto de um aluno do Viver de IA Builder, construído por conversa: o dono descreve o que quer e você edita este código. Ele nasceu de um template com peças de app (login, painel, kanban, tabela, captação) — mas isso é ponto de partida, não destino: o trabalho é adaptar o que existe ao pedido do dono, inclusive jogando fora o que não serve.

## Site ou app? Leia o pedido do dono ANTES de construir

O projeto pode ser um **app** (sistema com login, painel, dados) ou um **site** (página pessoal, portfólio, landing, institucional). Decida pela linguagem do dono:

- Pediu **site / landing / página / portfólio / institucional** → entregue CARA DE SITE: páginas com `protegida: false` (standalone, sem AppShell, sem sidebar, sem login), cada uma desenhando o próprio `<main>` — hero, seções, rodapé, navegação por âncoras quando precisar. Apague `src/pages/login/` e as demais telas de app que não servirem (com as linhas delas no registro). Um site de uma página = só `inicio` com `protegida: false`. `PageHeader` e o chrome do app NÃO entram num site — são peças de app; os tokens e o kit de componentes continuam valendo.
- Pediu **app / sistema / painel / gestão** → o caminho protegido de sempre (`protegida: true`, AppShell, login).
- Na dúvida, pergunte no chat em uma frase antes de mexer na estrutura.

Quando a plataforma souber quem é a empresa do dono (nome, ramo, público, tom), esse contexto chega **pelas instruções do seu turno** — não procure num arquivo do projeto. Se ele não veio, pergunte ao dono no chat.

Regras que valem para TODO o arquivo que você tocar:

- **Copy em pt-BR com acentos corretos** — em botão, título, erro, toast e comentário. O dono e os clientes dele leem em português.
- **Cores, raios e sombras SÓ pelos tokens** (`src/styles/tokens.css`) — nunca um hex, `rgb()` ou classe de paleta solta. É isso que faz o app inteiro trocar de tema e de marca de uma vez.
- **Você não tem terminal.** Nada de `npm install`, `npm run`, `tsc`. O build não checa tipos e você não consegue compilar para conferir — então escreva com cuidado redobrado: confira nomes de props no arquivo do componente antes de usar, siga os exemplos dos cabeçalhos-doc, e prefira mudanças pequenas e verificáveis a reescritas grandes.

## Vidro por padrão (a régua visual dos apps)

O kit já nasce premium: superfícies de vidro (translúcidas, com aro de luz, sem borda desenhada) sobre uma atmosfera de luz, botões em pílula, campos com halo no foco, status sussurrado (ponto + palavra). O seu trabalho é COMPOR com ele, não redesenhá-lo:

- **Superfície = `Card`** (ou as classes `vidro` / `vidro-alto` num bloco seu). Nunca escreva `border`, `border-borda`, `shadow-*` ou `bg-superficie` à mão para desenhar uma caixa. `border-borda` serve só para UM fio de separação (linha de tabela, divisória), nunca para contornar.
- **Uma ação principal por tela** (`<Button>` padrão, cheio da cor da marca). As outras são `secondary`, `outline` ou `ghost`. Dois botões cheios da marca na mesma tela é erro — inclusive repetir o mesmo botão no topo e no fim da lista.
- **Status e etiqueta = `Badge`** (`success`, `warning` e `destructive` viram ponto colorido + palavra). Nada de pílula cheia de cor escrita à mão.
- **Toda tela de app começa com `PageHeader`** (`titulo` e, quando ajudar, uma `descricao` de uma linha). Lista vazia = `EmptyState`.
- **Texto corrido com 16px ou mais** (`text-base`). `text-sm` só para rótulo e meta curta (até três palavras); `text-xs` só em rótulo em caixa alta com `tracking-[0.08em]`. Nada cortado com `truncate` ou `line-clamp`: o texto quebra a linha.
- **Título da tela:** um só `<h1>` por página — o do `PageHeader` (numa página standalone, o seu), com 40px no computador e 28px no celular. É o tamanho que o `PageHeader` já dá; não o encolha.
- **Alvo de toque:** os controles do kit já têm 40px (44 no toque, pela classe `toque`). Não encolha botão nem campo abaixo disso.
- **Movimento:** só transições curtas (`duration-[var(--t-rapido)] ease-[var(--curva)]`), nada em laço; menus e diálogos entram com a classe `surgir`.
- **Cores só pelos tokens**, inclusive nas classes de vidro: `bg-vidro`, `bg-vidro-alto` existem para casos raros; o caminho normal é a classe `vidro`.

## Identidade visual: um arquivo

`src/styles/tokens.css` define a identidade INTEIRA como variáveis CSS, com tema claro e escuro. **Rebrandear o app = editar esse arquivo e mais nada.** Cada token tem um comentário dizendo para que existe; ao mudar um valor, preserve a invariante que o comentário declara (ex.: `--sobreposicao` precisa ser mais escuro que `--fundo`). As classes Tailwind dos tokens (`bg-fundo`, `bg-superficie`, `border-borda`, `text-tinta`, `text-suave`, `text-marca`, `bg-marca`, `text-marca-tinta`, `text-positivo`, `text-atencao`, `text-destrutivo`, `bg-vidro`, `bg-vidro-alto`, `rounded-p/m/g/total`, `shadow-p/m/g`, `bg-sobreposicao`) vêm do bloco `@theme inline`; o vidro, o campo, o alvo de toque e o movimento (`vidro`, `vidro-alto`, `campo`, `toque`, `surgir`) vêm de `globals.css` — se você precisar de um token novo, declare-o nos DOIS temas e no `@theme`, com comentário.

## Como criar uma página

1. Crie a pasta `src/pages/<id>/` com o componente em `export default`.
2. Acrescente **UMA linha** em `src/pages.config.ts`, entre `// <via:paginas>` e `// </via:paginas>`.

É só isso: a rota, o item da navegação e o título da aba nascem dessa linha. As regras do registro:

- **Cada entrada ocupa exatamente uma linha.** Nunca quebre uma entrada em várias linhas, nunca ponha duas na mesma. A plataforma corta telas removendo linhas deste bloco — entrada fora do padrão quebra esse mecanismo.
- `protegida: true` = a página exige login e renderiza dentro do AppShell (sidebar/barra). `protegida: false` = página pública e **standalone** (sem shell — ela desenha o próprio `<main>`, como `login` e `captacao`).
- `naNavbar: false` tira a página da navegação sem tirá-la do ar.
- **PASTA nova dentro de `src/pages/` é sempre uma página** — o verificador cobra a bijeção pasta ↔ registro e acusa pasta órfã. Já **ARQUIVO auxiliar de uma tela** pode morar ao lado do componente dela (é o que `src/pages/tabela/` faz) ou em `src/lib/` quando serve a mais de uma tela.

Depois de mexer no registro, no `package.json` ou em `CLAUDE.md`, o dono pode rodar `npm run verificar` — mensagens de erro dizem o que quebrou e como consertar. Não edite `scripts/verificar.mjs`.

## O kit de componentes

`src/components/ui/` tem os blocos de construção: `button`, `card`, `input`, `label`, `select`, `dialog`, `table`, `badge`, `tabs`, `empty-state`, `skeleton`, `campo-de-texto`. **Leia o cabeçalho-doc do componente antes de usar** — ele traz JSX pronto e o erro clássico a evitar (ex.: `Select` nunca aceita `value=""`; `DialogTitle` é obrigatório; `icone={Users}`, não `icone={<Users />}`).

Convenção de nomes: os **primitivos têm API em inglês** (`variant`, `size` — padrão shadcn); os **compostos nossos têm props em pt-BR** (`EmptyState` com `icone/titulo/descricao/acoes`, `PageHeader` com `titulo/acoes`, `CampoDeTexto` com `rotulo/erro/dica`). Siga a convenção do arquivo em que estiver.

**Ícones: NUNCA importe ícones de marca do `lucide-react`.** Ícones de redes sociais e marcas — `Instagram`, `Facebook`, `Twitter`, `Youtube`, `Linkedin`, `Github`, `Whatsapp` e afins — **não existem** neste pacote (foram removidos por marca registrada) e importar qualquer um deles **quebra o site inteiro numa tela em branco**, sem erro visível. Para contato e redes sociais use `AtSign`, `Mail`, `Phone`, `MessageCircle`, `Send`, `Link` ou `Share2`, ou um link de texto simples (`<a href="https://instagram.com/...">Instagram</a>`). Na dúvida sobre um ícone existir, use um genérico seguro (`Circle`, `Star`, `Heart`) em vez de arriscar um nome de marca.

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
- **Modo de demonstração** (`src/lib/demonstracao.ts`): no preview, quando a plataforma marca a visita com o cookie `via_demonstracao=1`, a guarda deixa entrar sem conta e as telas mostram os dados de exemplo de `src/data/demo` — é assim que a conferência automática vê as telas protegidas. Toda tela protegida nova precisa abrir nesse modo sem rede: quando `MODO_DEMONSTRACAO` for verdadeiro, mostre dados de exemplo em vez de consultar o Supabase. Nunca remova o modo nem o condicione a login; ele não existe no site publicado.

## Dependências

Quase tudo que um app de negócio precisa **já está instalado**: react-router-dom, react-query, react-hook-form + zod, lucide-react (ícones), recharts (gráficos), dnd-kit (arrastar), date-fns, sonner (toasts), Radix nos primitivos. **Não adicione dependência sem necessidade real.** A instalação acontece fora do seu turno, no religamento do preview — se você escrever uma versão errada no `package.json`, o preview morre sem te mostrar o erro. Se realmente precisar de algo novo, adicione com versão EXATA (sem `^`/`~`) e avise o dono no chat de que o preview vai reinstalar.

## Conectores (no site publicado)

Quando o dono libera um conector para o site, a página chama `POST /via/conectores/{conector}/{OPERACAO}` com corpo JSON — mesma origem, sem token nenhum no código (a resposta vem como `{ok, dados}` ou `{ok:false, erro:{codigo, mensagem}}`; trate os dois). As instruções do seu turno dizem QUAIS conectores e operações existem neste projeto. Nunca invente endpoint de conector nem cole chave de API em código.

## O que não tocar

- `scripts/verificar.mjs`, `public/_redirects`, `vercel.json` — infraestrutura do template.
- `public/via-ponte.js` e a tag dele no `index.html` — é a ponte de inspeção da plataforma (o botão "Apontar" do editor depende dela; fora do editor ela é inerte).
- Os marcadores `// <via:paginas>` / `// </via:paginas>` e o formato das entradas.
- `package-lock.json` à mão (só muda via `package.json`).
- `src/lib/supabase.ts` além do que ele já é.
- `tokens.css` você toca SÓ para rebrand consciente — nunca para resolver um problema pontual de uma tela (para isso, variante no componente).
