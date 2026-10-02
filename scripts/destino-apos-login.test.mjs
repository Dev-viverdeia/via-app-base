import assert from "node:assert/strict";
import { test } from "node:test";
import { destinoAposLogin } from "../src/lib/destino-apos-login.ts";

const origem = "https://app.exemplo.com";
const pagina = (rota, protegida = true, naNavbar = true) => ({ rota, protegida, naNavbar });
const misto = [pagina("/", false), pagina("/login", false, false), pagina("/projetos")];

test("site público na raiz leva quem entrou à primeira tela interna", () => {
  assert.equal(destinoAposLogin(null, misto, origem), "/projetos");
});
test("sistema com início protegido preserva a raiz", () => {
  assert.equal(destinoAposLogin(null, [pagina("/"), pagina("/projetos")], origem), "/");
});
test("preserva destino solicitado, busca e âncora", () => {
  assert.equal(destinoAposLogin({ de: "/projetos/42?aba=arquivos#anexo" }, misto, origem), "/projetos/42?aba=arquivos#anexo");
});
test("recusa endereços externos e variantes com barras, sem perder a área interna", () => {
  for (const de of ["https://outro.com", "//outro.com", "/\\outro.com", "javascript:alert(1)", "", 2, null]) {
    assert.equal(destinoAposLogin({ de }, misto, origem), "/projetos");
  }
});
test("prefere tela interna do menu a uma tela auxiliar", () => {
  assert.equal(destinoAposLogin({}, [pagina("/ajuda", true, false), ...misto], origem), "/projetos");
});
test("rotas de detalhe e coringas não viram destino sem contexto", () => {
  assert.equal(destinoAposLogin(null, [pagina("/projetos/:id"), pagina("/arquivos/*"), ...misto], origem), "/projetos");
});
test("sem tela de menu, pode abrir a primeira rota interna estática", () => {
  assert.equal(destinoAposLogin(null, [pagina("/area", true, false)], origem), "/area");
});
test("não usa origem externa do registro e mantém fallback quando não há área interna", () => {
  assert.equal(destinoAposLogin(null, [pagina("//outro.com"), pagina("/\\outro.com"), pagina("/", false)], origem), "/");
});
