#!/usr/bin/env node
/**
 * OS GANCHOS DE CONFERÊNCIA DO KIT.
 *
 * Roda com `npm run ganchos`. Abre o template num navegador de verdade e prova
 * que os seletores que a conferência da plataforma escreve SOZINHA — os
 * naturais, os que qualquer um chuta — existem mesmo no DOM.
 *
 * POR QUE ELE EXISTE: "tela de pedidos com filtro por status" caiu três
 * medições seguidas no mesmo passo. A verificação clicava no gatilho do Select
 * e depois em `[role="option"][data-value="entregue"]`; o Radix desenha a opção
 * sem valor nenhum no DOM, e o inspetor respondia "Elemento não encontrado na
 * tela" nos dois aparelhos. O conserto foi o `data-value` no `SelectItem` e no
 * `TabsTrigger` — este arquivo é o que impede o conserto de ser desfeito sem
 * ninguém perceber.
 *
 * As mesmas dependências (e as mesmas ressalvas) de `scripts/regua.mjs`:
 * playwright vem do repositório da plataforma, nada entra no package.json.
 *
 *   VIA_CASA=/caminho/do/repo npm run ganchos
 */

import { createRequire } from "node:module";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CASA = process.env.VIA_CASA ?? join(process.env.HOME ?? "", ".cache", "claude", "builder-work");

let chromium;
try {
  ({ chromium } = createRequire(join(CASA, "package.json"))("playwright"));
} catch (erro) {
  console.error(
    `Não consegui carregar o playwright a partir de ${CASA}.\n` +
      `Conserte: aponte VIA_CASA para o repositório do produto, ou rode numa máquina que o tenha. ` +
      `O template funciona sem isto — só esta prova é que não roda.\nDetalhe: ${erro.message}`,
  );
  process.exit(2);
}

const { createServer } = await import("vite");
const servidor = await createServer({
  root: RAIZ,
  server: { host: "127.0.0.1", port: 0, strictPort: true },
  logLevel: "warn",
});
await servidor.listen();
const origem = `http://127.0.0.1:${servidor.httpServer.address().port}`;

const falhas = [];
const navegador = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-gpu"] });

/**
 * Um caso: abre a rota, roda os passos e diz se o gancho existe. Os passos são
 * os do inspetor (`click`, `expectVisible`), escritos do mesmo jeito.
 */
async function provar(nome, rota, passos) {
  const contexto = await navegador.newContext({ viewport: { width: 1280, height: 800 }, locale: "pt-BR", reducedMotion: "reduce" });
  contexto.setDefaultTimeout(4_000);
  await contexto.addCookies([{ name: "via_demonstracao", value: "1", url: origem }]);
  const pagina = await contexto.newPage();
  try {
    await pagina.goto(origem + rota, { waitUntil: "load" });
    await pagina.locator("body").waitFor();
    // O template carrega as telas sob demanda: sem esta espera o primeiro
    // seletor bate numa tela que ainda é "Carregando…".
    await pagina.waitForTimeout(1_500);
    for (const passo of passos) {
      const alvo = pagina.locator(passo.seletor);
      if (passo.acao === "clicar") await alvo.click();
      else await alvo.waitFor({ state: "visible" });
    }
    console.log(`  ok     ${nome}`);
  } catch (erro) {
    falhas.push(`${nome}: ${String(erro.message).split("\n")[0].slice(0, 160)}`);
    console.log(`  FALHA  ${nome}`);
  } finally {
    await contexto.close();
  }
}

console.log("Ganchos de conferência do kit\n");
try {
  // Select: o gatilho abre com um clique de mouse e a opção é achável PELO VALOR.
  await provar("Select · a opção existe por [data-value]", "/tabela", [
    { acao: "clicar", seletor: 'button:has-text("Novo cliente")' },
    { acao: "clicar", seletor: "#cliente-status" },
    { acao: "esperar", seletor: '[role="option"][data-value="ativo"]' },
    { acao: "clicar", seletor: '[role="option"][data-value="pendente"]' },
    { acao: "esperar", seletor: '#cliente-status:has-text("Pendente")' },
  ]);

  // Abas: a aba e o painel dela, os dois pelo valor.
  await provar("Abas · a aba e o painel existem por [data-value]", "/login", [
    { acao: "clicar", seletor: '[role="tab"][data-value="criar-conta"]' },
    { acao: "esperar", seletor: '[role="tabpanel"][data-value="criar-conta"]' },
  ]);

  // Diálogo e toast já se acham pelo papel — o que este caso prova é que
  // continuam se achando, porque é neles que a conferência procura resultado.
  await provar("Diálogo · acha-se por role e fecha", "/tabela", [
    { acao: "clicar", seletor: 'button:has-text("Novo cliente")' },
    { acao: "esperar", seletor: '[role="dialog"]' },
    { acao: "esperar", seletor: '[role="dialog"] h2' },
  ]);
} finally {
  await navegador.close();
  await servidor.close();
}

if (falhas.length) {
  console.log("");
  for (const f of falhas) console.log(`FALHA: ${f}`);
  console.log(`\n${falhas.length} gancho(s) sumiram do DOM. Conserte antes de publicar o template: ` +
    `é por eles que a conferência automática confirma um filtro, uma aba e um diálogo.`);
  process.exitCode = 1;
} else {
  console.log("\nTodos os ganchos no lugar.");
}
