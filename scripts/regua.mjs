#!/usr/bin/env node
/**
 * A RÉGUA VISUAL DA CASA CONTRA O TEMPLATE INTEIRO.
 *
 * Roda com `npm run regua`. Sobe o MESMO servidor de desenvolvimento que a
 * plataforma usa no preview, abre TODAS as rotas do registro
 * (`src/pages.config.ts`) mais a página de não-encontrado, nos dois aparelhos
 * da conferência — computador 1280×800 e celular 390×844 com toque e modo
 * móvel — e mede cada tela com a MESMA régua que a plataforma roda depois da
 * entrega. Sai 1 se alguma tela levar recusa.
 *
 * TEM QUE SER O SERVIDOR DE DESENVOLVIMENTO, não o `dist/`: o modo de
 * demonstração (`src/lib/demonstracao.ts`) exige `import.meta.env.DEV`, então
 * num build de produção a guarda de sessão manda toda tela protegida para o
 * /login — e a medição sairia limpa medindo o login três vezes em vez das
 * telas. Foi o primeiro resultado errado que este script deu.
 *
 * POR QUE ELE EXISTE: um defeito que nasce no template é pago por TODO app
 * criado a partir dele, uma rodada de conserto por vez. Achar aqui custa uma
 * vez só.
 *
 * DEPENDE DO REPOSITÓRIO DA PLATAFORMA, E DE PROPÓSITO NÃO ENTRA NO BUILD.
 * A régua e o navegador moram lá; copiá-los para cá criaria uma segunda régua
 * que envelhece sozinha. Este arquivo é a ÚNICA porta: `vite build`, `npm run
 * verificar` e o app do aluno não o importam nunca, e o `package.json` não
 * ganha dependência nenhuma por causa dele. Sem o repositório da plataforma na
 * máquina, o comando explica e sai — não quebra o template.
 *
 *   VIA_CASA=/caminho/do/repo npm run regua     (padrão: ~/.cache/claude/builder-work)
 */

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CASA = process.env.VIA_CASA ?? join(process.env.HOME ?? "", ".cache", "claude", "builder-work");

/** Os dois aparelhos, iguaizinhos aos do inspetor (browser-verification-worker.mjs). */
const APARELHOS = [
  { id: "computador", width: 1280, height: 800 },
  { id: "celular", width: 390, height: 844, toque: true },
];

/* --- a casa ------------------------------------------------------------- */

async function carregarACasa() {
  const managed = join(CASA, "runner", "managed");
  try {
    const exigir = createRequire(join(CASA, "package.json"));
    const { chromium } = exigir("playwright");
    const regua = await import(pathToFileURL(join(managed, "regua-visual.ts")).href);
    const contrato = await import(pathToFileURL(join(managed, "project-quality-contract.ts")).href);
    const inspetor = await import(pathToFileURL(join(managed, "browser-verification-worker.mjs")).href);
    return { chromium, ...regua, settle: contrato.settle, requestAllowed: inspetor.requestAllowed };
  } catch (erro) {
    console.error(
      `Não consegui carregar a régua da plataforma a partir de ${CASA}.\n` +
        `Conserte: aponte VIA_CASA para o repositório do produto (aquele que tem ` +
        `runner/managed/regua-visual.ts e o playwright instalado), ou rode este comando ` +
        `numa máquina que o tenha. O template funciona sem isto — só esta medição é que não roda.\n` +
        `Detalhe: ${erro.message}`,
    );
    process.exit(2);
  }
}

/* --- as telas ----------------------------------------------------------- */

/**
 * As rotas saem do registro por leitura de TEXTO, não por import: o registro é
 * TypeScript com `lazy(() => import(...))` dentro, e este script é node puro.
 * A regra "uma página = uma linha" é o que torna isso confiável.
 */
function rotasDoRegistro() {
  const fonte = readFileSync(join(RAIZ, "src", "pages.config.ts"), "utf8");
  const dentro = fonte.slice(
    fonte.indexOf("// <via:paginas>"),
    fonte.indexOf("// </via:paginas>"),
  );
  const telas = [];
  for (const linha of dentro.split(/\r?\n/)) {
    const id = /\bid\s*:\s*"([^"]+)"/.exec(linha);
    const rota = /\brota\s*:\s*"([^"]+)"/.exec(linha);
    if (id && rota) telas.push({ nome: id[1], rota: rota[1] });
  }
  // A página de não-encontrado é tela que a pessoa vê, então ela também mede.
  telas.push({ nome: "nao-encontrada", rota: "/esta-rota-nao-existe" });
  return telas;
}

/* --- o preview ---------------------------------------------------------- */

/**
 * O Vite sobe DENTRO deste processo (API de node), não como comando à parte:
 * assim a porta é conhecida sem adivinhação e o servidor morre junto com o
 * script, mesmo se a medição estourar no meio.
 */
async function subirOPreview() {
  const { createServer } = await import("vite");
  const servidor = await createServer({
    root: RAIZ,
    // Porta 0 = o sistema escolhe uma livre; `strictPort` impede o Vite de
    // sair procurando outra e mentir sobre onde subiu.
    server: { host: "127.0.0.1", port: 0, strictPort: true },
    logLevel: "warn",
  });
  await servidor.listen();
  return servidor;
}

/* --- a medição ---------------------------------------------------------- */

async function medirUmAparelho(casa, origem, telas, aparelho) {
  const navegador = await casa.chromium.launch({
    headless: true,
    args: ["--disable-dev-shm-usage", "--disable-gpu", "--no-sandbox"],
  });
  const achados = new Map();
  try {
    for (const tela of telas) {
      const contexto = await navegador.newContext({
        viewport: { width: aparelho.width, height: aparelho.height },
        ...(aparelho.toque ? { hasTouch: true, isMobile: true } : {}),
        locale: "pt-BR",
        reducedMotion: "reduce",
        serviceWorkers: "block",
      });
      contexto.setDefaultTimeout(4_000);
      // Modo de demonstração: é assim que a conferência da plataforma entra nas
      // telas protegidas sem conta.
      await contexto.addCookies([{ name: "via_demonstracao", value: "1", url: origem }]);
      // A MESMA cerca de rede do inspetor: sem ela a medição veria o banco do
      // aluno e um asset externo pendurado seguraria a página.
      await contexto.route("**/*", async (rota) => {
        const pedido = rota.request();
        let liberado = false;
        try { liberado = casa.requestAllowed(pedido, origem); } catch { /* endereço torto */ }
        if (!liberado) return rota.abort("blockedbyclient");
        return rota.continue();
      });
      const pagina = await contexto.newPage();
      try {
        const resposta = await pagina.goto(origem + tela.rota, { waitUntil: "load" });
        if (!resposta || resposta.status() >= 400) throw new Error("a tela não abriu");
        await pagina.locator("body").waitFor();
        await casa.settle(pagina);
        achados.set(tela.nome, await pagina.evaluate(casa.EXPRESSAO_DA_MEDICAO));
      } catch (erro) {
        achados.set(tela.nome, [{ id: "__nao-mediu", detalhe: String(erro.message).slice(0, 140) }]);
      } finally {
        await contexto.close();
      }
    }
  } finally {
    await navegador.close();
  }
  return achados;
}

/* --- o relatório -------------------------------------------------------- */

function imprimir(telas, porAparelho, casa) {
  let recusas = 0;
  let avisos = 0;
  console.log("Régua visual da casa · template via-app-base\n");
  for (const tela of telas) {
    console.log(`── ${tela.nome}  (${tela.rota})`);
    for (const aparelho of APARELHOS) {
      const lista = porAparelho.get(aparelho.id).get(tela.nome) ?? [];
      const recusa = lista.filter((a) => casa.GRAVIDADE_POR_ID[a.id] === "recusa");
      const aviso = lista.filter((a) => casa.GRAVIDADE_POR_ID[a.id] === "aviso");
      const naoMediu = lista.filter((a) => a.id === "__nao-mediu");
      recusas += recusa.length;
      avisos += aviso.length;
      const placar = naoMediu.length
        ? `NÃO MEDIU — ${naoMediu[0].detalhe}`
        : recusa.length || aviso.length
          ? `${recusa.length} recusa(s), ${aviso.length} aviso(s)`
          : "limpo";
      console.log(`   ${aparelho.id.padEnd(11)} ${placar}`);
      for (const a of recusa) console.log(`      RECUSA  ${a.id}: ${a.detalhe}`);
      for (const a of aviso) console.log(`      aviso   ${a.id}: ${a.detalhe}`);
    }
  }
  console.log(`\nTotal: ${recusas} recusa(s), ${avisos} aviso(s) em ${telas.length} telas × ${APARELHOS.length} aparelhos.`);
  return recusas;
}

/* --- execução ----------------------------------------------------------- */

const casa = await carregarACasa();
const telas = rotasDoRegistro();
const servidor = await subirOPreview();
const origem = `http://127.0.0.1:${servidor.httpServer.address().port}`;
try {
  // Um aparelho de cada vez: o relatório fica estável e a máquina não briga
  // consigo mesma por CPU — o que mudaria a medição de movimento.
  const porAparelho = new Map();
  for (const aparelho of APARELHOS) {
    porAparelho.set(aparelho.id, await medirUmAparelho(casa, origem, telas, aparelho));
  }
  process.exitCode = imprimir(telas, porAparelho, casa) > 0 ? 1 : 0;
} finally {
  await servidor.close();
}
