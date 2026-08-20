#!/usr/bin/env node
/**
 * Verificador estrutural do template via-app-base.
 *
 * Roda com `npm run verificar`. É node puro, ZERO dependências de propósito:
 * toda devDependency extra encarece o `npm install` de cada preview do aluno.
 *
 * O que ele protege (as regras que o template inteiro assume como verdade):
 *   1. bijeção entre as pastas `src/pages/<id>` e as linhas `id: "<id>"`
 *      do registro, nas DUAS direções — nada de pasta órfã nem rota fantasma;
 *   2. cada página ocupa UMA linha entre os marcadores — o seletor de telas
 *      da plataforma apaga páginas removendo linha, então linha quebrada
 *      significa arquivo corrompido na mão do aluno;
 *   3. `build` do package.json é exatamente "vite build";
 *   4. nenhuma dependência em faixa (`^` ou `~`) — o preview precisa instalar
 *      exatamente a versão que nós testamos;
 *   5. `CLAUDE.md` existe e cabe em 32.000 caracteres.
 *
 * NOTA DE ORDEM (Task 6 → Task 7): quando este script nasceu, o CLAUDE.md
 * ainda NÃO existia — ele é entregue na Task 7. Por isso, no commit desta
 * task, o esperado é 4 checks verdes e o check 5 vermelho: essa falha é a
 * prova de que o verificador realmente enxerga a ausência do arquivo.
 * O verde completo só chega com a Task 7.
 *
 * Saída: uma linha `ok`/`FALHA` por check, os detalhes das falhas logo abaixo,
 * e código de saída 1 se qualquer check falhar (0 se todos passarem).
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// A raiz é deduzida da posição deste arquivo (scripts/verificar.mjs), e não do
// diretório em que o comando foi chamado — assim `node caminho/verificar.mjs`
// funciona de qualquer lugar.
const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const CAMINHO_REGISTRO = join(RAIZ, "src", "pages.config.ts");
const CAMINHO_PAGES = join(RAIZ, "src", "pages");
const CAMINHO_PACKAGE = join(RAIZ, "package.json");
const CAMINHO_CLAUDE_MD = join(RAIZ, "CLAUDE.md");

const MARCADOR_ABRE = "// <via:paginas>";
const MARCADOR_FECHA = "// </via:paginas>";
const LIMITE_CLAUDE_MD = 32000;

/** Caminho bonito pra mensagem de erro: sempre relativo à raiz, com barra `/`. */
function relativo(caminho) {
  return caminho.slice(RAIZ.length + 1).split("\\").join("/");
}

function lerTextoOuNulo(caminho) {
  try {
    return readFileSync(caminho, "utf8");
  } catch {
    return null;
  }
}

/**
 * Devolve só a parte de código da linha, sem o comentário `//` do fim — e sem
 * confundir com as barras que moram dentro de aspas (`"https://…"`, `"./pages/x"`).
 * Assim `{ … }, // nova tela` continua sendo uma entrada válida de uma linha.
 */
function codigoDaLinha(linha) {
  let aspas = null;
  for (let i = 0; i < linha.length; i++) {
    const c = linha[i];
    if (aspas) {
      if (c === "\\") i++;
      else if (c === aspas) aspas = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") aspas = c;
    else if (c === "/" && linha[i + 1] === "/") return linha.slice(0, i).trim();
  }
  return linha.trim();
}

/**
 * Conta o saldo de chaves `{` e `}` de uma linha ignorando o que está dentro
 * de aspas (o registro tem strings com barras e parênteses).
 */
function saldoDeChaves(linha) {
  let saldo = 0;
  let aspas = null;
  for (let i = 0; i < linha.length; i++) {
    const c = linha[i];
    if (aspas) {
      if (c === "\\") i++;
      else if (c === aspas) aspas = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") aspas = c;
    else if (c === "{") saldo++;
    else if (c === "}") saldo--;
  }
  return saldo;
}

/**
 * TODOS os ids `id: "…"` de uma linha, na ordem em que aparecem. É de propósito
 * que a busca seja global: duas entradas coladas na mesma linha passam pelas
 * checagens de chaves, e uma busca que parasse no primeiro id faria o check 1
 * jurar que a segunda página não está no registro — mentira que leva o aluno a
 * cadastrar de novo uma rota que já existe.
 */
function idsDaLinha(codigo) {
  return [...codigo.matchAll(/\bid\s*:\s*"([^"]*)"/g)].map((m) => m[1]);
}

/* ------------------------------------------------------------------ *
 * Leitura do registro: acha os marcadores e separa as linhas de dentro.
 * ------------------------------------------------------------------ */

/**
 * Devolve `{ erro }` quando o registro nem pode ser lido, ou
 * `{ linhas: [{ numero, texto, codigo }] }` com as linhas entre os marcadores
 * (já sem as linhas em branco e sem os comentários soltos). `texto` é a linha
 * como o aluno a vê — é ela que aparece nas mensagens; `codigo` é a mesma linha
 * sem o comentário do fim, e é sobre ela que os checks raciocinam.
 */
function lerBlocoDoRegistro() {
  const fonte = lerTextoOuNulo(CAMINHO_REGISTRO);
  if (fonte === null) {
    return {
      erro:
        `${relativo(CAMINHO_REGISTRO)} não foi encontrado. ` +
        `Conserte: este arquivo é o registro único das páginas e não pode sumir — ` +
        `restaure-o com \`git checkout src/pages.config.ts\`.`,
    };
  }

  const todas = fonte.split(/\r?\n/);
  // Guardamos TODAS as ocorrências de cada marcador, não só a primeira: marcador
  // repetido é exatamente o estrago que este script existe para pegar (a plataforma
  // insere e remove linhas entre o primeiro par, e o segundo par vira zona morta).
  const linhasAbre = [];
  const linhasFecha = [];
  todas.forEach((l, i) => {
    const t = l.trim();
    if (t === MARCADOR_ABRE) linhasAbre.push(i + 1);
    else if (t === MARCADOR_FECHA) linhasFecha.push(i + 1);
  });

  // Repetição vem antes da checagem do par porque é o diagnóstico mais preciso:
  // com um marcador a mais, o par que o script acha pode até parecer válido.
  const repetido = linhasAbre.length > 1 ? MARCADOR_ABRE : linhasFecha.length > 1 ? MARCADOR_FECHA : null;
  if (repetido !== null) {
    const numeros = repetido === MARCADOR_ABRE ? linhasAbre : linhasFecha;
    return {
      erro:
        `${relativo(CAMINHO_REGISTRO)}: o marcador \`${repetido}\` aparece ${numeros.length} vezes ` +
        `(linhas ${numeros.join(", ")}) — ele precisa ser único no arquivo. ` +
        `Conserte: deixe UM \`${MARCADOR_ABRE}\` e UM \`${MARCADOR_FECHA}\`, com todas as páginas ` +
        `entre eles, e apague os marcadores repetidos. A plataforma trabalha sempre no primeiro par: ` +
        `tudo que estiver no par de baixo vira código que nenhum check enxerga e ninguém mantém.`,
    };
  }

  const iAbre = linhasAbre.length > 0 ? linhasAbre[0] - 1 : -1;
  const iFecha = linhasFecha.length > 0 ? linhasFecha[0] - 1 : -1;

  if (iAbre === -1 || iFecha === -1 || iFecha < iAbre) {
    return {
      erro:
        `${relativo(CAMINHO_REGISTRO)} está sem o par de marcadores ` +
        `\`${MARCADOR_ABRE}\` … \`${MARCADOR_FECHA}\`. ` +
        `Conserte: devolva as duas linhas de marcador em volta da lista de páginas — ` +
        `sem elas a plataforma não sabe onde acrescentar nem onde remover uma tela.`,
    };
  }

  const linhas = [];
  for (let i = iAbre + 1; i < iFecha; i++) {
    const texto = todas[i].trim();
    const codigo = codigoDaLinha(texto);
    // Linha em branco e linha só de comentário (inclusive entrada comentada)
    // não atrapalham ninguém: sobra código nenhum para checar.
    if (codigo === "") continue;
    linhas.push({ numero: i + 1, texto, codigo }); // numero = 1-based, igual ao editor
  }
  return { linhas };
}

/* ------------------------------------------------------------------ *
 * Os 5 checks. Cada um devolve um array de mensagens de erro (vazio = ok).
 * ------------------------------------------------------------------ */

/**
 * Marca as linhas do bloco que NÃO são uma entrada inteira e bem formada.
 * Devolve um Map `numero da linha -> mensagem`. Serve pro check 2 (que é o
 * dono dessa falha) e pro check 1 (que ignora essas linhas em vez de acusar
 * "entrada sem id" em cima do mesmo estrago).
 */
function acharLinhasMalformadas(bloco) {
  const malformadas = new Map();
  const comoConsertar =
    `Conserte: junte a entrada inteira numa única linha, no formato ` +
    `\`{ id: "…", titulo: "…", rota: "…", icone: …, pagina: lazy(() => import("./pages/…/…")), naNavbar: …, protegida: … },\`. ` +
    `A plataforma cria e apaga telas mexendo em linhas inteiras deste bloco; ` +
    `entrada partida em várias linhas quebra esse mecanismo.`;

  for (const { numero, texto, codigo } of bloco.linhas) {
    // Duas entradas coladas numa linha só: o diagnóstico mais específico vem
    // primeiro, porque ele explica sozinho qualquer estranheza de chaves.
    const ids = idsDaLinha(codigo);
    if (ids.length > 1) {
      malformadas.set(
        numero,
        `${relativo(CAMINHO_REGISTRO)} linha ${numero}: ${ids.length === 2 ? "duas" : ids.length} entradas ` +
          `na mesma linha (ids ${ids.map((id) => `"${id}"`).join(", ")}) — ` +
          `separe em uma linha por entrada: \`${texto}\`. ` +
          // Aqui o conserto é o inverso do das outras falhas (quebrar, não juntar),
          // então a linha tem mensagem própria em vez do `comoConsertar` comum.
          `Conserte: parta esta linha em ${ids.length}, uma entrada por linha, cada uma no formato ` +
          `\`{ id: "…", titulo: "…", rota: "…", icone: …, pagina: lazy(() => import("./pages/…/…")), naNavbar: …, protegida: … },\`. ` +
          `A plataforma apaga uma tela removendo a linha inteira: com ${ids.length === 2 ? "duas" : ids.length} entradas ` +
          `grudadas, apagar uma leva ${ids.length === 2 ? "a outra" : "as outras"} junto.`,
      );
      continue;
    }
    if (!codigo.startsWith("{")) {
      malformadas.set(
        numero,
        `${relativo(CAMINHO_REGISTRO)} linha ${numero}: a linha não começa com \`{\` ` +
          `(parece a continuação de uma entrada quebrada em várias linhas): \`${texto}\`. ` +
          comoConsertar,
      );
      continue;
    }
    if (!codigo.endsWith("},") && !codigo.endsWith("}")) {
      malformadas.set(
        numero,
        `${relativo(CAMINHO_REGISTRO)} linha ${numero}: a entrada abre com \`{\` mas não fecha ` +
          `com \`},\` na mesma linha — ela foi quebrada em várias linhas: \`${texto}\`. ` +
          comoConsertar,
      );
      continue;
    }
    if (saldoDeChaves(codigo) !== 0) {
      malformadas.set(
        numero,
        `${relativo(CAMINHO_REGISTRO)} linha ${numero}: as chaves \`{\` e \`}\` não fecham ` +
          `dentro da própria linha: \`${texto}\`. ` + comoConsertar,
      );
    }
  }
  return malformadas;
}

/** Check 2 — cada entrada em UMA linha. */
function checarUmaLinhaPorPagina(bloco, malformadas) {
  if (bloco.erro) return [bloco.erro];
  return [...malformadas.values()];
}

/** Check 1 — bijeção registro ↔ pastas, nas duas direções. */
function checarBijecaoRegistroPastas(bloco, malformadas) {
  if (bloco.erro) return [bloco.erro];

  const erros = [];

  // Lado do registro: os ids são colhidos de TODA linha que tenha `id: "…"` —
  // inclusive de uma entrada quebrada em várias linhas e de uma linha com duas
  // entradas coladas (daí `idsDaLinha` ser global). Senão o check 1 acusaria
  // "pasta órfã" por um estrago que é do check 2. Só a reclamação de "entrada
  // sem id" é que fica calada nas linhas que o check 2 já domina.
  const idsPorLinha = new Map(); // id -> [numeros de linha]
  for (const { numero, texto, codigo } of bloco.linhas) {
    const ids = idsDaLinha(codigo);
    if (ids.length === 0) {
      if (malformadas.has(numero)) continue; // quem cobra o conserto é o check 2
      erros.push(
        `${relativo(CAMINHO_REGISTRO)} linha ${numero}: entrada sem \`id: "…"\`: \`${texto}\`. ` +
          `Conserte: toda página precisa de um \`id\` entre aspas duplas, igualzinho ao nome da ` +
          `pasta em \`src/pages/<id>/\`.`,
      );
      continue;
    }
    for (const id of ids) {
      if (!idsPorLinha.has(id)) idsPorLinha.set(id, []);
      idsPorLinha.get(id).push(numero);
    }
  }

  for (const [id, numeros] of idsPorLinha) {
    if (numeros.length > 1) {
      erros.push(
        `o id "${id}" aparece ${numeros.length} vezes no registro (linhas ${numeros.join(", ")}). ` +
          `Conserte: deixe UMA única linha por página em ${relativo(CAMINHO_REGISTRO)} e apague as repetidas.`,
      );
    }
  }

  // Lado do disco: um diretório por página.
  let pastas;
  try {
    pastas = readdirSync(CAMINHO_PAGES, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
  } catch {
    erros.push(
      `a pasta ${relativo(CAMINHO_PAGES)} não existe. ` +
        `Conserte: é ela que guarda o componente de cada tela — restaure-a com ` +
        `\`git checkout src/pages\` ou crie \`src/pages/<id>/\` para cada id do registro.`,
    );
    return erros;
  }

  const conjuntoPastas = new Set(pastas);

  // Direção 1: registro → disco.
  for (const [id, numeros] of idsPorLinha) {
    if (!conjuntoPastas.has(id)) {
      const onde = `${numeros.length === 1 ? "linha" : "linhas"} ${numeros.join(", ")}`;
      erros.push(
        `o id "${id}" está no registro (${relativo(CAMINHO_REGISTRO)} ${onde}) mas a pasta ` +
          `\`src/pages/${id}/\` não existe. ` +
          `Conserte: ou crie \`src/pages/${id}/\` com o componente da tela, ou remova ` +
          `${numeros.length === 1 ? "essa linha" : "essas linhas"} de ${relativo(CAMINHO_REGISTRO)}. ` +
          `Do jeito que está, a rota carrega e quebra.`,
      );
    }
  }

  // Direção 2: disco → registro.
  for (const pasta of pastas) {
    if (!idsPorLinha.has(pasta)) {
      erros.push(
        `a pasta \`src/pages/${pasta}/\` existe mas não há linha \`id: "${pasta}"\` no registro. ` +
          `Conserte: ou acrescente UMA linha com \`id: "${pasta}"\` entre \`${MARCADOR_ABRE}\` e ` +
          `\`${MARCADOR_FECHA}\` em ${relativo(CAMINHO_REGISTRO)}, ou apague a pasta. ` +
          `Página fora do registro não vira rota nem aparece na navegação — é código morto no bundle.`,
      );
    }
  }

  return erros;
}

/** Lê e faz o parse do package.json uma vez só, pros checks 3 e 4. */
function lerPackageJson() {
  const bruto = lerTextoOuNulo(CAMINHO_PACKAGE);
  if (bruto === null) {
    return {
      erro:
        `package.json não foi encontrado na raiz do projeto. ` +
        `Conserte: restaure-o com \`git checkout package.json\`.`,
    };
  }
  try {
    return { pacote: JSON.parse(bruto) };
  } catch (e) {
    return {
      erro:
        `package.json não é JSON válido (${e.message}). ` +
        `Conserte: corrija a sintaxe — vírgula sobrando e aspas simples são as causas de sempre.`,
    };
  }
}

/** Check 3 — o script de build é exatamente "vite build". */
function checarScriptDeBuild(pkg) {
  if (pkg.erro) return [pkg.erro];

  const build = pkg.pacote?.scripts?.build;
  if (build === "vite build") return [];

  if (build === undefined) {
    return [
      `package.json não tem \`scripts.build\`. ` +
        `Conserte: acrescente \`"build": "vite build"\` em \`scripts\` — ` +
        `é esse comando exato que a publicação roda para gerar \`dist/\`.`,
    ];
  }
  return [
    `package.json: \`scripts.build\` é \`"${build}"\`, mas precisa ser exatamente \`"vite build"\`. ` +
      `Conserte: volte para \`"build": "vite build"\`. A publicação chama esse script esperando ` +
      `o \`dist/\` do Vite; qualquer outra coisa (tsc, prefixos, flags) quebra o deploy do aluno.`,
  ];
}

/** Check 4 — nenhuma dependência em faixa (`^` ou `~`), em deps e devDeps. */
function checarVersoesExatas(pkg) {
  if (pkg.erro) return [pkg.erro];

  const erros = [];
  for (const bloco of ["dependencies", "devDependencies"]) {
    const mapa = pkg.pacote?.[bloco];
    if (!mapa) continue;
    for (const [nome, versao] of Object.entries(mapa)) {
      if (typeof versao !== "string") continue;
      if (!/[\^~]/.test(versao)) continue;
      erros.push(
        `package.json → \`${bloco}."${nome}"\` está em faixa: \`"${versao}"\`. ` +
          `Conserte: troque pela versão exata, sem \`^\` nem \`~\` ` +
          `(ex.: \`"${versao.replace(/[\^~]/g, "")}"\`). ` +
          `Faixa faz o preview do aluno instalar uma versão que a gente nunca testou.`,
      );
    }
  }
  return erros;
}

/** Check 5 — CLAUDE.md existe e cabe no limite de caracteres. */
function checarClaudeMd() {
  const conteudo = lerTextoOuNulo(CAMINHO_CLAUDE_MD);
  if (conteudo === null) {
    return [
      `CLAUDE.md não existe na raiz do projeto. ` +
        `Conserte: crie o CLAUDE.md com as instruções do template (as regras que o agente do aluno ` +
        `precisa seguir: registro de páginas, uma linha por tela, versões exatas). ` +
        `Sem ele, o agente que abrir este projeto começa às cegas.`,
    ];
  }

  // Normalizamos antes de contar para que o mesmo arquivo meça o mesmo em toda
  // máquina: com `core.autocrlf` (padrão no Windows) e sem `.gitattributes`, o
  // checkout troca cada `\n` por `\r\n` e o `\r` extra inflaria a conta — o
  // mesmo CLAUDE.md daria 32.000 no Linux e 32.799 no Windows, e o verde ou
  // vermelho do check dependeria de quem rodou. O BOM inicial, pelo mesmo
  // motivo, é marca de codificação e não conteúdo.
  const normalizado = conteudo.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");

  const caracteres = normalizado.length;
  if (caracteres > LIMITE_CLAUDE_MD) {
    return [
      `CLAUDE.md tem ${caracteres.toLocaleString("pt-BR")} caracteres, acima do limite de ` +
        `${LIMITE_CLAUDE_MD.toLocaleString("pt-BR")}. ` +
        `Conserte: enxugue o arquivo (corte exemplos longos e repetições) ou mova o detalhe para ` +
        `\`docs/\` e deixe só o essencial. CLAUDE.md entra inteiro no contexto de toda conversa — ` +
        `arquivo gordo custa em todo turno do aluno.`,
    ];
  }
  return [];
}

/* ------------------------------------------------------------------ *
 * Execução: roda os 5 checks, imprime o placar e decide o exit code.
 * ------------------------------------------------------------------ */

const bloco = lerBlocoDoRegistro();
const pkg = lerPackageJson();
const malformadas = bloco.erro ? new Map() : acharLinhasMalformadas(bloco);

const checks = [
  { nome: "registro ↔ pastas em src/pages (bijeção)", erros: checarBijecaoRegistroPastas(bloco, malformadas) },
  { nome: "uma linha por página no registro", erros: checarUmaLinhaPorPagina(bloco, malformadas) },
  { nome: 'script de build === "vite build"', erros: checarScriptDeBuild(pkg) },
  { nome: "dependências em versão exata (sem ^ ou ~)", erros: checarVersoesExatas(pkg) },
  { nome: `CLAUDE.md existe e cabe em ${LIMITE_CLAUDE_MD.toLocaleString("pt-BR")} caracteres`, erros: checarClaudeMd() },
];

console.log("Verificador estrutural do template via-app-base");
console.log("");

checks.forEach((check, i) => {
  const rotulo = check.erros.length === 0 ? "ok   " : "FALHA";
  console.log(`  ${rotulo}  ${i + 1}. ${check.nome}`);
});

const comFalha = checks.filter((c) => c.erros.length > 0);

if (comFalha.length > 0) {
  console.log("");
  for (const check of comFalha) {
    console.log(`FALHA em "${check.nome}":`);
    for (const erro of check.erros) console.log(`  - ${erro}`);
    console.log("");
  }
  const quantos = comFalha.length;
  console.log(
    `${quantos} de ${checks.length} ${quantos === 1 ? "check falhou" : "checks falharam"}. ` +
      `Corrija os pontos acima e rode \`npm run verificar\` de novo.`,
  );
  // `exitCode` em vez de `process.exit(1)`: quando a saída vai para um pipe
  // (é o caso de `npm run`), sair na marra pode cortar o texto antes de a
  // escrita terminar — e mensagem cortada é justamente o que não pode faltar aqui.
  process.exitCode = 1;
} else {
  console.log("");
  console.log(`Todos os ${checks.length} checks passaram.`);
}
