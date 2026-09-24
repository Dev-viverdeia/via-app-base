# Telas de sistemas

Use os tokens de cor, fonte e vidro do projeto; a marca do cliente prevalece. Preserve AppShell, o registro das páginas, os NavLinks e o único h1 de PageHeader.

- Lista: Table empilharNoCelular + TableCell rotulo/destaque, uma só representação dos dados. Busca e ordenação ficam alcançáveis nos dois tamanhos. Para planilhas comparativas, mantenha a rolagem interna normal de Table.
- Formulário: FormGrid mede o espaço real; CampoDeTexto liga rótulo, ajuda e erro. Campos largos usam col-span-full. Dialog preserva foco, Escape, rolagem e ações alcançáveis. Cancelar não envia; sucesso exige gravação confirmada.
- Indicadores: Indicadores recebe valores formatados e dados do período real. null é indisponível, zero é zero; carregando preserva espaço sem reapresentar variações antigas. A grade e o número se ajustam sem cortar o valor.

Referências vivas: pages/tabela, pages/tabela/DialogDeCliente e pages/inicio. Elas usam dados de demonstração; a conexão ao banco permanece responsabilidade da implementação do negócio. O molde atualizado só entra em novos projetos; não substitui telas existentes.
