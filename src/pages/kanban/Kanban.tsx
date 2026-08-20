/**
 * QUADRO (KANBAN) — as oportunidades do funil, arrastáveis entre as etapas.
 *
 * ONDE PLUGAR DADOS REAIS: os cartões saem de `src/data/demo/cartoes.ts` e
 * vivem no estado desta tela — recarregar a página desfaz tudo. Troque
 * `CARTOES` por uma consulta a uma tabela `oportunidades` e mande o `aoSoltar`
 * (mover) e o `criarCartao` (novo) gravarem lá em vez de só chamar `setCartoes`.
 */
import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type {
  Active,
  Announcements,
  DragEndEvent,
  DragStartEvent,
  ScreenReaderInstructions,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { GripVertical, Inbox, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { PageHeader } from "../../components/layout/PageHeader.tsx";
import { Badge } from "../../components/ui/badge.tsx";
import { Button } from "../../components/ui/button.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog.tsx";
import { EmptyState } from "../../components/ui/empty-state.tsx";
import { Input } from "../../components/ui/input.tsx";
import { Label } from "../../components/ui/label.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select.tsx";
import { cn, emReais } from "../../lib/utils.ts";
import {
  CARTOES,
  COLUNAS,
  ORIGENS,
  type Cartao,
  type ColunaDoQuadro,
} from "../../data/demo/cartoes.ts";

/* -------------------------------------------------------------------------
   Formulário do cartão novo. As mensagens são o que a pessoa lê, então elas
   nascem em português aqui.
------------------------------------------------------------------------- */

const esquemaDoCartao = z.object({
  cliente: z.string().trim().min(2, "Informe o nome do cliente."),
  // O campo é `type="number"`: o navegador já devolve "2400.5" mesmo quando a
  // pessoa digita "2400,5", então basta conferir se sobrou um número > 0.
  valor: z
    .string()
    .trim()
    .min(1, "Informe o valor estimado.")
    .refine((texto) => Number(texto) > 0, "O valor precisa ser maior que zero."),
  origem: z.enum(ORIGENS),
});

type CamposDoCartao = z.infer<typeof esquemaDoCartao>;

const CARTAO_EM_BRANCO: CamposDoCartao = {
  cliente: "",
  valor: "",
  origem: "Indicação",
};

/**
 * Id do cartão criado na tela. Existe só enquanto a demo é em memória: com
 * banco de verdade, quem gera o id é o banco.
 */
let sequencia = 0;
function novoId(): string {
  sequencia += 1;
  return `novo-${sequencia}`;
}

/* -------------------------------------------------------------------------
   Acessibilidade do arrastar: sem isto o dnd-kit narra em inglês.
------------------------------------------------------------------------- */

function clienteDoCartao(item: Active): string {
  const cliente = item.data.current?.cliente;
  return typeof cliente === "string" ? cliente : "sem nome";
}

function tituloDaColuna(id: UniqueIdentifier | undefined): string {
  return COLUNAS.find((coluna) => coluna.id === id)?.titulo ?? "";
}

const ANUNCIOS: Announcements = {
  onDragStart: ({ active }) => `Cartão ${clienteDoCartao(active)} levantado.`,
  onDragOver: ({ active, over }) =>
    over
      ? `Cartão ${clienteDoCartao(active)} está sobre a coluna ${tituloDaColuna(over.id)}.`
      : undefined,
  onDragEnd: ({ active, over }) =>
    over
      ? `Cartão ${clienteDoCartao(active)} foi para a coluna ${tituloDaColuna(over.id)}.`
      : `Cartão ${clienteDoCartao(active)} voltou para o lugar de onde saiu.`,
  onDragCancel: ({ active }) =>
    `Movimento cancelado. O cartão ${clienteDoCartao(active)} ficou onde estava.`,
};

const INSTRUCOES: ScreenReaderInstructions = {
  draggable:
    "Para mover um cartão pelo teclado, aperte a barra de espaço para levantá-lo, use as setas para levá-lo até outra coluna e a barra de espaço de novo para soltar. Esc cancela.",
};

/* -------------------------------------------------------------------------
   Peças do quadro.
------------------------------------------------------------------------- */

const CLASSE_DO_CARTAO =
  "rounded-m border border-borda bg-superficie p-3 text-left shadow-p";

/** O miolo do cartão, usado na coluna e também na cópia que segue o cursor. */
function ConteudoDoCartao({ cartao }: { cartao: Cartao }) {
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-balance text-tinta">
          {cartao.cliente}
        </p>
        <GripVertical className="size-4 shrink-0 text-suave" aria-hidden="true" />
      </div>
      <p className="mt-1.5 text-base font-bold text-tinta tabular-nums">
        {emReais(cartao.valor)}
      </p>
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
        <Badge variant="outline">{cartao.origem}</Badge>
        {/* Data de entrada, não "há X minutos": o cartão fica parado na tela
            e um tempo relativo envelheceria mentindo. */}
        <time
          dateTime={cartao.criadoEm.toISOString()}
          className="text-xs whitespace-nowrap text-suave"
        >
          <span className="sr-only">Entrou em </span>
          {format(cartao.criadoEm, "d 'de' MMM", { locale: ptBR })}
        </time>
      </div>
    </>
  );
}

/**
 * Um cartão que se deixa arrastar. O `attributes` do dnd-kit já traz
 * `role="button"`, `tabIndex` e as descrições que o leitor de tela anuncia;
 * `touch-none` é o que impede a página de rolar quando o dedo arrasta o cartão.
 */
function CartaoArrastavel({ cartao }: { cartao: Cartao }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: cartao.id,
    data: { cliente: cartao.cliente },
    // Sem isto o leitor de tela anuncia "draggable", em inglês.
    attributes: { roleDescription: "cartão arrastável" },
  });

  return (
    <li>
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className={cn(
          CLASSE_DO_CARTAO,
          "w-full cursor-grab touch-none transition-colors hover:border-marca/40",
          // Enquanto arrasta, o original desbota: quem se move é a cópia.
          isDragging && "opacity-40",
        )}
      >
        <ConteudoDoCartao cartao={cartao} />
      </div>
    </li>
  );
}

/** Uma etapa do funil: cabeçalho com contador e a área que recebe os cartões. */
function ColunaDoFunil({
  coluna,
  cartoes,
}: {
  coluna: (typeof COLUNAS)[number];
  cartoes: Cartao[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: coluna.id });
  const total = cartoes.reduce((soma, cartao) => soma + cartao.valor, 0);

  return (
    <section className="flex w-72 shrink-0 flex-col gap-3 lg:w-auto">
      <div className="px-1">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-tinta">{coluna.titulo}</h2>
          <Badge variant="secondary">
            {cartoes.length}
            <span className="sr-only">
              {cartoes.length === 1 ? " cartão" : " cartões"}
            </span>
          </Badge>
        </div>
        <p className="mt-0.5 text-xs text-suave tabular-nums">
          {emReais(total)}
        </p>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-40 flex-1 flex-col rounded-g border p-3 transition-colors",
          isOver ? "border-marca bg-marca/10" : "border-borda bg-marca/5",
        )}
      >
        {cartoes.length === 0 ? (
          <EmptyState
            icone={Inbox}
            titulo="Coluna vazia"
            descricao="Arraste um cartão de outra coluna para cá."
            className="flex-1 border-none bg-transparent px-3 py-6"
          />
        ) : (
          // `flex flex-col` e não `grid`: numa grade, o cartão mais largo
          // estica a coluna inteira e vaza para fora dela.
          <ul className="flex flex-col gap-3">
            {cartoes.map((cartao) => (
              <CartaoArrastavel key={cartao.id} cartao={cartao} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------
   A tela.
------------------------------------------------------------------------- */

export default function Kanban() {
  const [cartoes, setCartoes] = useState<Cartao[]>(CARTOES);
  const [arrastando, setArrastando] = useState<Cartao | null>(null);
  const [dialogoAberto, setDialogoAberto] = useState(false);

  const form = useForm<CamposDoCartao>({
    resolver: zodResolver(esquemaDoCartao),
    defaultValues: CARTAO_EM_BRANCO,
  });

  // `distance: 6` deixa o clique comum passar: só vira arrasto depois de andar
  // 6 pixels com o botão apertado.
  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  /** Os cartões separados por etapa, na ordem das colunas. */
  const porColuna = useMemo(() => {
    const mapa = Object.fromEntries(
      COLUNAS.map((coluna) => [coluna.id, [] as Cartao[]]),
    ) as Record<ColunaDoQuadro, Cartao[]>;

    for (const cartao of cartoes) mapa[cartao.coluna]?.push(cartao);
    return mapa;
  }, [cartoes]);

  function aoLevantar(evento: DragStartEvent) {
    setArrastando(cartoes.find((cartao) => cartao.id === evento.active.id) ?? null);
  }

  function aoSoltar(evento: DragEndEvent) {
    setArrastando(null);

    // Só as colunas são alvo de soltura, então procurar na lista de colunas já
    // valida o destino — e evita um `as` na tipagem.
    const destino = COLUNAS.find((coluna) => coluna.id === evento.over?.id);
    if (!destino) return;

    setCartoes((atuais) =>
      atuais.map((cartao) =>
        cartao.id === evento.active.id && cartao.coluna !== destino.id
          ? { ...cartao, coluna: destino.id }
          : cartao,
      ),
    );
  }

  function abrirDialogo() {
    form.reset(CARTAO_EM_BRANCO);
    setDialogoAberto(true);
  }

  /** Cartão novo entra sempre em "Novo": é a primeira etapa do funil. */
  function criarCartao(campos: CamposDoCartao) {
    const cartao: Cartao = {
      id: novoId(),
      cliente: campos.cliente.trim(),
      origem: campos.origem,
      valor: Number(campos.valor),
      coluna: "novo",
      criadoEm: new Date(),
    };

    setCartoes((atuais) => [cartao, ...atuais]);
    setDialogoAberto(false);
    toast.success(`${cartao.cliente} entrou na coluna Novo.`);
  }

  return (
    <>
      <PageHeader
        titulo="Kanban"
        acoes={
          <Button onClick={abrirDialogo}>
            <Plus />
            Novo cartão
          </Button>
        }
      />

      <DndContext
        sensors={sensores}
        collisionDetection={closestCorners}
        accessibility={{
          announcements: ANUNCIOS,
          screenReaderInstructions: INSTRUCOES,
        }}
        onDragStart={aoLevantar}
        onDragEnd={aoSoltar}
        onDragCancel={() => setArrastando(null)}
      >
        {/* No celular as colunas rolam de lado; a partir do lg elas viram grade. */}
        <div className="flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-2 lg:overflow-visible xl:grid-cols-4">
          {COLUNAS.map((coluna) => (
            <ColunaDoFunil
              key={coluna.id}
              coluna={coluna}
              cartoes={porColuna[coluna.id]}
            />
          ))}
        </div>

        {/* A cópia que segue o cursor. Ela vive fora das colunas, então não é
            cortada pela área que rola de lado. Sem animação de pouso: a padrão
            volta para o lugar de origem, o que fica errado depois de mudar de
            coluna. */}
        <DragOverlay dropAnimation={null}>
          {arrastando ? (
            <div
              className={cn(
                CLASSE_DO_CARTAO,
                "w-full cursor-grabbing border-marca shadow-g",
              )}
            >
              <ConteudoDoCartao cartao={arrastando} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* --- Diálogo do cartão novo ------------------------------------- */}
      <Dialog open={dialogoAberto} onOpenChange={setDialogoAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo cartão</DialogTitle>
            <DialogDescription>
              Ele entra na coluna "Novo"; depois é só arrastar para a etapa
              certa.
            </DialogDescription>
          </DialogHeader>

          {/* `noValidate`: quem valida é o zod, em português. */}
          <form
            noValidate
            onSubmit={form.handleSubmit(criarCartao)}
            className="grid gap-4"
          >
            <div className="grid gap-2">
              <Label htmlFor="cartao-cliente">Cliente</Label>
              <Input
                {...form.register("cliente")}
                id="cartao-cliente"
                placeholder="Padaria Pão Nosso"
                aria-invalid={!!form.formState.errors.cliente}
                aria-describedby={
                  form.formState.errors.cliente ? "cartao-cliente-erro" : undefined
                }
              />
              {form.formState.errors.cliente ? (
                <p id="cartao-cliente-erro" className="text-sm text-destrutivo">
                  {form.formState.errors.cliente.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cartao-valor">Valor estimado (R$)</Label>
              <Input
                {...form.register("valor")}
                id="cartao-valor"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                placeholder="2400"
                aria-invalid={!!form.formState.errors.valor}
                aria-describedby={
                  form.formState.errors.valor ? "cartao-valor-erro" : undefined
                }
              />
              {form.formState.errors.valor ? (
                <p id="cartao-valor-erro" className="text-sm text-destrutivo">
                  {form.formState.errors.valor.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cartao-origem">Origem</Label>
              {/* O Select do Radix não é um `<input>`, então quem o liga ao
                  react-hook-form é o Controller. */}
              <Controller
                control={form.control}
                name="origem"
                render={({ field }) => (
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="cartao-origem" onBlur={field.onBlur}>
                      <SelectValue placeholder="Escolha a origem" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORIGENS.map((origem) => (
                        <SelectItem key={origem} value={origem}>
                          {origem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="submit">Criar cartão</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
