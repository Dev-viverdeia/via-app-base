#!/usr/bin/env node
/** Prova o tema do template real, nas duas preferências do aparelho.
 * VIA_CASA=/caminho/da/plataforma npm run test:tema
 * Playwright vem da plataforma, como em regua.mjs; nenhuma dependência no app.
 * Dados de demonstração, sem credenciais reais nem acesso a serviços externos.
 */
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const casa = process.env.VIA_CASA;
if (!casa) throw new Error("Aponte VIA_CASA para o repositório da plataforma, com Playwright instalado.");
const { chromium } = createRequire(join(casa, "package.json"))("playwright");
const { createServer } = await import("vite");
const servidor = await createServer({
  root: raiz, logLevel: "warn",
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify("http://127.0.0.1:54321"),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify("sb_publishable_local_fixture"),
  },
  server: { host: "127.0.0.1", port: 0, strictPort: true, hmr: false },
});
await servidor.listen();
const origem = `http://127.0.0.1:${servidor.httpServer.address().port}`;
let navegador;
try {
  navegador = await chromium.launch({ headless: true });
  for (const width of [1280, 390]) {
    const contexto = await navegador.newContext({ viewport: { width, height: 844 }, reducedMotion: "reduce", colorScheme: "dark", ...(width === 390 ? { isMobile: true, hasTouch: true } : {}) });
    contexto.setDefaultTimeout(5000);
    try {
      await contexto.addCookies([{ name: "via_demonstracao", value: "1", url: origem }]);
      await contexto.route("**/*", r => new URL(r.request().url()).origin === origem ? r.continue() : r.abort());
      const pagina = await contexto.newPage();
      await pagina.goto(origem + "/tabela");
      await pagina.locator("main h1").waitFor();
      for (const escolha of [null, "dark"]) {
        await pagina.evaluate(tema => {
          if (tema) document.documentElement.dataset.theme = tema;
          else delete document.documentElement.dataset.theme;
        }, escolha);
        for (const colorScheme of ["dark", "light"]) {
          await pagina.emulateMedia({ colorScheme });
          await pagina.waitForFunction(escuro => {
            const body = getComputedStyle(document.body);
            return body.backgroundColor === (escuro ? "rgb(7, 13, 26)" : "rgb(244, 246, 251)")
              && body.color === (escuro ? "rgb(232, 238, 251)" : "rgb(15, 23, 41)")
              && getComputedStyle(document.documentElement).colorScheme === (escuro ? "dark" : "light");
          }, escolha === "dark", { timeout: 2000 });
          // A escolha padrão do Sonner não pode voltar a acompanhar o aparelho.
          if (!escolha) {
            await pagina.getByRole("button", { name: /^Editar /u }).first().click();
            await pagina.getByRole("button", { name: "Salvar mudanças" }).click();
            assert.equal(await pagina.locator("[data-sonner-toaster]").getAttribute("data-sonner-theme"), "light");
          }
          console.log(`ok · ${width}px · produto ${escolha ?? "padrão"} · aparelho ${colorScheme}`);
        }
      }
    } finally { await contexto.close(); }
  }
} finally {
  await navegador?.close();
  await servidor.close();
}
