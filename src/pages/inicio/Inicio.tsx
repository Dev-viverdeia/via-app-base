import { Inbox, Plus, Search, Trash2 } from "lucide-react";
import { PageHeader } from "../../components/layout/PageHeader.tsx";
import { Badge } from "../../components/ui/badge.tsx";
import { Button } from "../../components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Skeleton } from "../../components/ui/skeleton.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table.tsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs.tsx";

/**
 * Tela inicial — VITRINE PROVISÓRIA do kit de componentes.
 * Serve só para conferir o visual (claro e escuro) enquanto o app não tem
 * conteúdo. A Task 5 substitui esta página inteira pelo painel de verdade.
 */
export default function Inicio() {
  return (
    <>
      <PageHeader
        titulo="Início"
        acoes={
          <Button size="icon" variant="ghost" aria-label="Buscar">
            <Search />
          </Button>
        }
      />

      <div className="grid gap-6">
        {/* --- Botões e etiquetas ---------------------------------------- */}
        <Card>
          <CardHeader>
            <CardTitle>Botões e etiquetas</CardTitle>
            <CardDescription>
              Uma variante para cada peso de ação; a cor sai sempre dos tokens.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button>
              <Plus />
              Novo
            </Button>
            <Button variant="secondary">Secundário</Button>
            <Button variant="outline">Contorno</Button>
            <Button variant="ghost">Fantasma</Button>
            <Button variant="destructive">
              <Trash2 />
              Excluir
            </Button>
            <Button variant="link">Saiba mais</Button>
            <Button size="sm" variant="outline">
              Pequeno
            </Button>
            <Button size="lg">Grande</Button>
            <Button disabled>Desativado</Button>
            <Badge>Novo</Badge>
            <Badge variant="secondary">Rascunho</Badge>
            <Badge variant="outline">Arquivado</Badge>
            <Badge variant="success">Pago</Badge>
            <Badge variant="warning">Aguardando</Badge>
            <Badge variant="destructive">Cancelado</Badge>
          </CardContent>
        </Card>

        {/* --- Formulário e diálogo -------------------------------------- */}
        <Card>
          <CardHeader>
            <CardTitle>Campos e diálogo</CardTitle>
            <CardDescription>
              Todo campo tem rótulo; o diálogo fecha no Esc e devolve o foco.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="vitrine-nome">Nome</Label>
              <Input id="vitrine-nome" placeholder="Ana Souza" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vitrine-status">Status</Label>
              <Select>
                <SelectTrigger id="vitrine-status">
                  <SelectValue placeholder="Escolha um status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="novo">Novo</SelectItem>
                  <SelectItem value="conversa">Em conversa</SelectItem>
                  <SelectItem value="fechado">Fechado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Abrir diálogo</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo cliente</DialogTitle>
                    <DialogDescription>
                      Exemplo de formulário dentro do diálogo.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-2">
                    <Label htmlFor="vitrine-email">E-mail</Label>
                    <Input
                      id="vitrine-email"
                      type="email"
                      placeholder="voce@email.com"
                    />
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button>Salvar</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* --- Abas: tabela, vazio e carregando -------------------------- */}
        <Tabs defaultValue="tabela">
          <TabsList>
            <TabsTrigger value="tabela">Tabela</TabsTrigger>
            <TabsTrigger value="vazio">Estado vazio</TabsTrigger>
            <TabsTrigger value="carregando">Carregando</TabsTrigger>
          </TabsList>

          <TabsContent value="tabela">
            <Card className="p-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Ana Souza</TableCell>
                    <TableCell>
                      <Badge variant="success">Pago</Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      R$ 1.200
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Bruno Lima</TableCell>
                    <TableCell>
                      <Badge variant="warning">Aguardando</Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      R$ 480
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Carla Dias</TableCell>
                    <TableCell>
                      <Badge variant="destructive">Cancelado</Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      R$ 0
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="vazio">
            <EmptyState
              icone={Inbox}
              titulo="Nenhum cliente ainda"
              descricao="Cadastre o primeiro cliente para começar a acompanhar as vendas."
              acao={
                <Button>
                  <Plus />
                  Novo cliente
                </Button>
              }
            />
          </TabsContent>

          <TabsContent value="carregando">
            <Card>
              <CardContent
                className="grid gap-3 pt-6"
                role="status"
                aria-label="Carregando…"
              >
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-6 w-2/3" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
