/**
 * CLIENTES — a tabela com busca, ordenação e o cadastro completo (criar,
 * editar, excluir).
 *
 * Esta tela guarda a lista e manda nela; as peças que só desenham moram ao
 * lado: `LinhaDeCliente.tsx`, `DialogDeCliente.tsx` (com as regras do
 * formulário), `ConfirmacaoDeExclusao.tsx` e `status.ts`.
 *
 * ONDE PLUGAR DADOS REAIS: a lista sai de `src/data/demo/clientes.ts` e vive no
 * estado desta tela — recarregar a página desfaz tudo. Troque `CLIENTES` por
 * uma consulta a uma tabela `clientes` e mande `salvar` e `excluir` gravarem lá
 * em vez de só chamar `setClientes`.
 */
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Plus,
  Search,
  SearchX,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { PageHeader } from "../../components/layout/PageHeader.tsx";
import { Button } from "../../components/ui/button.tsx";
import { Card } from "../../components/ui/card.tsx";
import { EmptyState } from "../../components/ui/empty-state.tsx";
import { Input } from "../../components/ui/input.tsx";
import { Label } from "../../components/ui/label.tsx";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table.tsx";
import { cn, novoId } from "../../lib/utils.ts";
import { CLIENTES, STATUS, type Cliente } from "../../data/demo/clientes.ts";
import { ConfirmacaoDeExclusao } from "./ConfirmacaoDeExclusao.tsx";
import {
  CLIENTE_EM_BRANCO,
  DialogDeCliente,
  esquemaDoCliente,
  type CamposDoCliente,
} from "./DialogDeCliente.tsx";
import { LinhaDeCliente } from "./LinhaDeCliente.tsx";

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
              {lista.map((cliente) => (
                <LinhaDeCliente
                  key={cliente.id}
                  cliente={cliente}
                  aoEditar={abrirEdicao}
                  aoExcluir={setParaExcluir}
                />
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <DialogDeCliente
        aberto={dialogoAberto}
        aoMudarAbertura={setDialogoAberto}
        emEdicao={emEdicao}
        form={form}
        aoSalvar={salvar}
      />

      <ConfirmacaoDeExclusao
        cliente={paraExcluir}
        aoFechar={() => setParaExcluir(null)}
        aoConfirmar={excluir}
      />
    </>
  );
}
