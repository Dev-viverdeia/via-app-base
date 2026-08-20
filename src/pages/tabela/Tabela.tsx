/**
 * CLIENTES — a tabela com busca, ordenação e o cadastro completo (criar,
 * editar, excluir).
 *
 * ONDE PLUGAR DADOS REAIS: a lista sai de `src/data/demo/clientes.ts` e vive no
 * estado desta tela — recarregar a página desfaz tudo. Troque `CLIENTES` por
 * uma consulta a uma tabela `clientes` e mande `salvar` e `excluir` gravarem lá
 * em vez de só chamar `setClientes`.
 */
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Pencil,
  Plus,
  Search,
  SearchX,
  Trash2,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { PageHeader } from "../../components/layout/PageHeader.tsx";
import { Badge, type BadgeProps } from "../../components/ui/badge.tsx";
import { Button } from "../../components/ui/button.tsx";
import { Card } from "../../components/ui/card.tsx";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table.tsx";
import { cn, emReais } from "../../lib/utils.ts";
import {
  CLIENTES,
  STATUS,
  type Cliente,
  type StatusDoCliente,
} from "../../data/demo/clientes.ts";

/* -------------------------------------------------------------------------
   Como cada status aparece. A cor nunca é a única pista: o texto da etiqueta
   já diz o estado.
------------------------------------------------------------------------- */

const APARENCIA_DO_STATUS: Record<
  StatusDoCliente,
  { rotulo: string; variante: BadgeProps["variant"] }
> = {
  ativo: { rotulo: "Ativo", variante: "success" },
  pendente: { rotulo: "Pendente", variante: "warning" },
  inativo: { rotulo: "Inativo", variante: "outline" },
};

/* -------------------------------------------------------------------------
   Busca e ordenação.
------------------------------------------------------------------------- */

/**
 * Tira acento e caixa para comparar: assim "sao paulo" encontra "São Paulo",
 * que é como as pessoas realmente digitam na busca.
 */
function semAcento(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

type CampoDeOrdem = "nome" | "cidade" | "status" | "ultimaCompra" | "valor";
type Ordenacao = { campo: CampoDeOrdem; direcao: "asc" | "desc" };

function comparar(a: Cliente, b: Cliente, campo: CampoDeOrdem): number {
  switch (campo) {
    case "valor":
      return a.valor - b.valor;
    case "ultimaCompra":
      return a.ultimaCompra.getTime() - b.ultimaCompra.getTime();
    // Ordem do funil (ativo, pendente, inativo), não ordem alfabética.
    case "status":
      return STATUS.indexOf(a.status) - STATUS.indexOf(b.status);
    default:
      // "pt-BR" é o que põe "Ácido" antes de "Ana" em vez de depois de "Zé".
      return a[campo].localeCompare(b[campo], "pt-BR");
  }
}

/** Cabeçalho que ordena a tabela ao ser clicado. */
function CabecalhoOrdenavel({
  campo,
  ordenacao,
  aoOrdenar,
  className,
  children,
}: {
  campo: CampoDeOrdem;
  ordenacao: Ordenacao;
  aoOrdenar: (campo: CampoDeOrdem) => void;
  className?: string;
  children: ReactNode;
}) {
  const ativo = ordenacao.campo === campo;
  const Icone = !ativo
    ? ArrowUpDown
    : ordenacao.direcao === "asc"
      ? ArrowUp
      : ArrowDown;

  return (
    <TableHead
      className={className}
      aria-sort={
        ativo
          ? ordenacao.direcao === "asc"
            ? "ascending"
            : "descending"
          : "none"
      }
    >
      <button
        type="button"
        onClick={() => aoOrdenar(campo)}
        className="inline-flex items-center gap-1.5 rounded-p text-xs font-semibold tracking-wide uppercase transition-colors hover:text-tinta"
      >
        {children}
        <Icone
          className={cn("size-3.5 shrink-0", ativo && "text-marca")}
          aria-hidden="true"
        />
      </button>
    </TableHead>
  );
}

/* -------------------------------------------------------------------------
   Formulário do cliente. As mensagens são o que a pessoa lê, então elas
   nascem em português aqui.
------------------------------------------------------------------------- */

const esquemaDoCliente = z.object({
  nome: z.string().trim().min(2, "Informe o nome do cliente."),
  email: z.email("Informe um e-mail válido."),
  whatsapp: z
    .string()
    .trim()
    .min(1, "Informe o WhatsApp.")
    // Contamos os dígitos, não os caracteres: assim "(11) 98812-4477" e
    // "11988124477" valem a mesma coisa.
    .refine(
      (texto) => texto.replace(/\D/g, "").length >= 10,
      "Informe o WhatsApp com DDD, como (11) 98888-7777.",
    ),
  cidade: z.string().trim().min(2, "Informe a cidade."),
  status: z.enum(STATUS),
  // O campo é `type="number"`: o navegador já devolve "1890.5" mesmo quando a
  // pessoa digita "1890,5".
  valor: z
    .string()
    .trim()
    .min(1, "Informe o total comprado (use 0 se ainda não comprou).")
    .refine((texto) => Number(texto) >= 0, "O total não pode ser negativo."),
});

type CamposDoCliente = z.infer<typeof esquemaDoCliente>;

const CLIENTE_EM_BRANCO: CamposDoCliente = {
  nome: "",
  email: "",
  whatsapp: "",
  cidade: "",
  status: "ativo",
  valor: "0",
};

/**
 * Id do cliente criado na tela. Existe só enquanto a demo é em memória: com
 * banco de verdade, quem gera o id é o banco.
 */
let sequencia = 0;
function novoId(): string {
  sequencia += 1;
  return `novo-${sequencia}`;
}

/* -------------------------------------------------------------------------
   A tela.
------------------------------------------------------------------------- */

export default function Tabela() {
  const [clientes, setClientes] = useState<Cliente[]>(CLIENTES);
  const [busca, setBusca] = useState("");
  const [ordenacao, setOrdenacao] = useState<Ordenacao>({
    campo: "nome",
    direcao: "asc",
  });
  const [dialogoAberto, setDialogoAberto] = useState(false);
  /** `null` = o diálogo está criando; com cliente = está editando aquele. */
  const [emEdicao, setEmEdicao] = useState<Cliente | null>(null);
  /** Quem está na fila da exclusão, esperando a confirmação. */
  const [paraExcluir, setParaExcluir] = useState<Cliente | null>(null);

  const form = useForm<CamposDoCliente>({
    resolver: zodResolver(esquemaDoCliente),
    defaultValues: CLIENTE_EM_BRANCO,
  });

  const lista = useMemo(() => {
    const procurado = semAcento(busca.trim());
    const filtrados = procurado
      ? clientes.filter((cliente) =>
          semAcento(
            `${cliente.nome} ${cliente.email} ${cliente.cidade} ${cliente.whatsapp}`,
          ).includes(procurado),
        )
      : clientes;

    // `toSorted` não: copiamos antes porque `sort` mexe no array original.
    return [...filtrados].sort(
      (a, b) =>
        comparar(a, b, ordenacao.campo) * (ordenacao.direcao === "asc" ? 1 : -1),
    );
  }, [clientes, busca, ordenacao]);

  function ordenarPor(campo: CampoDeOrdem) {
    setOrdenacao((atual) =>
      atual.campo === campo
        ? { campo, direcao: atual.direcao === "asc" ? "desc" : "asc" }
        : // Número e data começam do maior/mais recente; texto começa do A.
          {
            campo,
            direcao:
              campo === "valor" || campo === "ultimaCompra" ? "desc" : "asc",
          },
    );
  }

  function abrirNovo() {
    setEmEdicao(null);
    form.reset(CLIENTE_EM_BRANCO);
    setDialogoAberto(true);
  }

  function abrirEdicao(cliente: Cliente) {
    setEmEdicao(cliente);
    form.reset({
      nome: cliente.nome,
      email: cliente.email,
      whatsapp: cliente.whatsapp,
      cidade: cliente.cidade,
      status: cliente.status,
      valor: String(cliente.valor),
    });
    setDialogoAberto(true);
  }

  function salvar(campos: CamposDoCliente) {
    const dados = {
      nome: campos.nome.trim(),
      email: campos.email.trim(),
      whatsapp: campos.whatsapp.trim(),
      cidade: campos.cidade.trim(),
      status: campos.status,
      valor: Number(campos.valor),
    };

    if (emEdicao) {
      setClientes((atuais) =>
        atuais.map((cliente) =>
          cliente.id === emEdicao.id ? { ...cliente, ...dados } : cliente,
        ),
      );
      // "Cadastro de X atualizado" e não "X foi atualizada": o nome pode ser
      // de qualquer gênero e a frase não pode chutar.
      toast.success(`Cadastro de ${dados.nome} atualizado.`);
    } else {
      setClientes((atuais) => [
        { id: novoId(), ...dados, ultimaCompra: new Date() },
        ...atuais,
      ]);
      toast.success(`${dados.nome} entrou na lista.`);
    }

    setDialogoAberto(false);
    setEmEdicao(null);
  }

  function excluir() {
    if (!paraExcluir) return;
    setClientes((atuais) =>
      atuais.filter((cliente) => cliente.id !== paraExcluir.id),
    );
    toast.success(`${paraExcluir.nome} saiu da lista.`);
    setParaExcluir(null);
  }

  const contagem = busca.trim()
    ? `${lista.length} de ${clientes.length} ${clientes.length === 1 ? "cliente" : "clientes"}`
    : `${clientes.length} ${clientes.length === 1 ? "cliente" : "clientes"}`;

  return (
    <>
      <PageHeader
        titulo="Clientes"
        acoes={
          <Button onClick={abrirNovo}>
            <Plus />
            Novo cliente
          </Button>
        }
      />

      {/* --- Busca e contagem -------------------------------------------- */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Label htmlFor="busca-de-clientes" className="sr-only">
            Buscar cliente
          </Label>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-suave"
            aria-hidden="true"
          />
          <Input
            id="busca-de-clientes"
            type="search"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            placeholder="Buscar por nome, cidade ou e-mail"
            className="pl-9"
          />
        </div>
        <p role="status" className="text-sm text-suave tabular-nums">
          {contagem}
        </p>
      </div>

      {/* --- A tabela (ou o vazio) --------------------------------------- */}
      {lista.length === 0 ? (
        clientes.length === 0 ? (
          <EmptyState
            icone={Users}
            titulo="Nenhum cliente ainda"
            descricao="Cadastre o primeiro cliente para começar a acompanhar as vendas."
            acoes={
              <Button onClick={abrirNovo}>
                <Plus />
                Novo cliente
              </Button>
            }
          />
        ) : (
          <EmptyState
            icone={SearchX}
            titulo="Nada encontrado"
            descricao={`Nenhum cliente combina com "${busca.trim()}". Tente outro nome, cidade ou e-mail.`}
            acoes={
              <Button variant="outline" onClick={() => setBusca("")}>
                Limpar busca
              </Button>
            }
          />
        )
      ) : (
        <Card className="p-2">
          <Table>
            <TableHeader>
              <TableRow>
                <CabecalhoOrdenavel
                  campo="nome"
                  ordenacao={ordenacao}
                  aoOrdenar={ordenarPor}
                >
                  Cliente
                </CabecalhoOrdenavel>
                <TableHead>WhatsApp</TableHead>
                <CabecalhoOrdenavel
                  campo="cidade"
                  ordenacao={ordenacao}
                  aoOrdenar={ordenarPor}
                >
                  Cidade
                </CabecalhoOrdenavel>
                <CabecalhoOrdenavel
                  campo="status"
                  ordenacao={ordenacao}
                  aoOrdenar={ordenarPor}
                >
                  Status
                </CabecalhoOrdenavel>
                <CabecalhoOrdenavel
                  campo="ultimaCompra"
                  ordenacao={ordenacao}
                  aoOrdenar={ordenarPor}
                >
                  Última compra
                </CabecalhoOrdenavel>
                <CabecalhoOrdenavel
                  campo="valor"
                  ordenacao={ordenacao}
                  aoOrdenar={ordenarPor}
                  className="text-right"
                >
                  Total
                </CabecalhoOrdenavel>
                <TableHead className="text-right">
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {lista.map((cliente) => {
                const status = APARENCIA_DO_STATUS[cliente.status];
                return (
                  <TableRow key={cliente.id}>
                    <TableCell>
                      <p className="font-medium text-tinta">{cliente.nome}</p>
                      <p className="text-xs text-suave">{cliente.email}</p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-suave tabular-nums">
                      {cliente.whatsapp}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-suave">
                      {cliente.cidade}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variante}>{status.rotulo}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-suave">
                      <time dateTime={cliente.ultimaCompra.toISOString()}>
                        {format(cliente.ultimaCompra, "d 'de' MMM", {
                          locale: ptBR,
                        })}
                      </time>
                    </TableCell>
                    <TableCell className="text-right font-medium whitespace-nowrap tabular-nums">
                      {emReais(cliente.valor)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Editar ${cliente.nome}`}
                          onClick={() => abrirEdicao(cliente)}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Excluir ${cliente.nome}`}
                          onClick={() => setParaExcluir(cliente)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* --- Diálogo de criar/editar ------------------------------------- */}
      <Dialog open={dialogoAberto} onOpenChange={setDialogoAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {emEdicao ? "Editar cliente" : "Novo cliente"}
            </DialogTitle>
            <DialogDescription>
              {emEdicao
                ? `Mudanças em ${emEdicao.nome}.`
                : "Preencha os dados para começar a acompanhar este cliente."}
            </DialogDescription>
          </DialogHeader>

          {/* `noValidate`: quem valida é o zod, em português. */}
          <form
            noValidate
            onSubmit={form.handleSubmit(salvar)}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="cliente-nome">Nome</Label>
              <Input
                {...form.register("nome")}
                id="cliente-nome"
                autoComplete="name"
                placeholder="Ana Beatriz Souza"
                aria-invalid={!!form.formState.errors.nome}
                aria-describedby={
                  form.formState.errors.nome ? "cliente-nome-erro" : undefined
                }
              />
              {form.formState.errors.nome ? (
                <p id="cliente-nome-erro" className="text-sm text-destrutivo">
                  {form.formState.errors.nome.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cliente-email">E-mail</Label>
              <Input
                {...form.register("email")}
                id="cliente-email"
                type="email"
                autoComplete="email"
                placeholder="voce@email.com"
                aria-invalid={!!form.formState.errors.email}
                aria-describedby={
                  form.formState.errors.email ? "cliente-email-erro" : undefined
                }
              />
              {form.formState.errors.email ? (
                <p id="cliente-email-erro" className="text-sm text-destrutivo">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cliente-whatsapp">WhatsApp</Label>
              <Input
                {...form.register("whatsapp")}
                id="cliente-whatsapp"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="(11) 98888-7777"
                aria-invalid={!!form.formState.errors.whatsapp}
                aria-describedby={
                  form.formState.errors.whatsapp
                    ? "cliente-whatsapp-erro"
                    : undefined
                }
              />
              {form.formState.errors.whatsapp ? (
                <p
                  id="cliente-whatsapp-erro"
                  className="text-sm text-destrutivo"
                >
                  {form.formState.errors.whatsapp.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cliente-cidade">Cidade</Label>
              <Input
                {...form.register("cidade")}
                id="cliente-cidade"
                autoComplete="address-level2"
                placeholder="São Paulo"
                aria-invalid={!!form.formState.errors.cidade}
                aria-describedby={
                  form.formState.errors.cidade ? "cliente-cidade-erro" : undefined
                }
              />
              {form.formState.errors.cidade ? (
                <p id="cliente-cidade-erro" className="text-sm text-destrutivo">
                  {form.formState.errors.cidade.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cliente-status">Status</Label>
              {/* O Select do Radix não é um `<input>`, então quem o liga ao
                  react-hook-form é o Controller. */}
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="cliente-status" onBlur={field.onBlur}>
                      <SelectValue placeholder="Escolha o status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {APARENCIA_DO_STATUS[status].rotulo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="cliente-valor">Total comprado (R$)</Label>
              <Input
                {...form.register("valor")}
                id="cliente-valor"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                placeholder="0"
                aria-invalid={!!form.formState.errors.valor}
                aria-describedby={
                  form.formState.errors.valor ? "cliente-valor-erro" : undefined
                }
              />
              {form.formState.errors.valor ? (
                <p id="cliente-valor-erro" className="text-sm text-destrutivo">
                  {form.formState.errors.valor.message}
                </p>
              ) : null}
            </div>

            <DialogFooter className="sm:col-span-2">
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="submit">
                {emEdicao ? "Salvar mudanças" : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- Confirmação de exclusão ------------------------------------- */}
      <Dialog
        open={paraExcluir !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setParaExcluir(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir cliente</DialogTitle>
            <DialogDescription>
              {paraExcluir
                ? `${paraExcluir.nome} sai da lista e não dá para desfazer.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button variant="destructive" onClick={excluir}>
              <Trash2 />
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
