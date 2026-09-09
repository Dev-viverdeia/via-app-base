// Ponte da plataforma Viver de IA Builder (versão 2).
// Dois serviços para o editor da plataforma (parent): o modo "apontar" (a
// pessoa clica num elemento do preview e o editor recebe um resumo estrutural
// para anexar ao pedido) e o aviso de erro na tela (código que quebrou, promessa
// que falhou, arquivo que não compila) para o botão "Corrigir com o Agente".
// Fora do editor (site publicado, aba solta) este arquivo é inerte: sai no
// primeiro guarda. Não remova nem edite — o editor depende dele e o ambiente
// o atualiza sozinho.
(function () {
  "use strict";
  if (window.parent === window) return;

  var PARENT_PERMITIDOS = [
    "https://via-vibecode-platform.rafaelmilagre.workers.dev",
    "http://localhost:3000",
  ];
  var V = 1;
  var editorOrigin = null;
  var armado = false;
  var highlight = null;

  function enviar(mensagem) {
    if (editorOrigin) window.parent.postMessage(mensagem, editorOrigin);
  }

  function textoLimpo(valor) {
    return String(valor || "")
      .replace(/[\u0000-\u001f\u007f]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120);
  }

  function seletorDe(el) {
    if (el.id) {
      var porId = "#" + (window.CSS && CSS.escape ? CSS.escape(el.id) : el.id);
      try {
        if (document.querySelectorAll(porId).length === 1) return porId.slice(0, 300);
      } catch (e) { /* id não-seletorável: cai pra cadeia */ }
    }
    var partes = [];
    var atual = el;
    for (var i = 0; i < 4 && atual && atual !== document.body; i += 1) {
      var parte = atual.tagName.toLowerCase();
      var classe = (atual.classList && atual.classList[0]) || null;
      if (classe && /^[a-zA-Z0-9_-]+$/.test(classe)) parte += "." + classe;
      var pai = atual.parentElement;
      if (pai) {
        var irmaos = pai.children;
        var indice = 0;
        var iguais = 0;
        for (var j = 0; j < irmaos.length; j += 1) {
          if (irmaos[j].tagName === atual.tagName) {
            iguais += 1;
            if (irmaos[j] === atual) indice = iguais;
          }
        }
        if (iguais > 1) parte += ":nth-of-type(" + indice + ")";
      }
      partes.unshift(parte);
      var seletor = partes.join(" > ");
      try {
        if (document.querySelectorAll(seletor).length === 1) return seletor.slice(0, 300);
      } catch (e) { /* segue subindo */ }
      atual = pai;
    }
    return partes.join(" > ").slice(0, 300);
  }

  function componentesDe(el) {
    try {
      var chave = null;
      var chaves = Object.keys(el);
      for (var i = 0; i < chaves.length; i += 1) {
        if (chaves[i].indexOf("__reactFiber$") === 0) { chave = chaves[i]; break; }
      }
      if (!chave) return [];
      var fibra = el[chave];
      var nomes = [];
      while (fibra && nomes.length < 5) {
        var tipo = fibra.type;
        var nome = tipo && (tipo.displayName || tipo.name);
        if (typeof nome === "string" && nome && nomes.indexOf(nome) === -1) {
          nomes.push(nome.slice(0, 64));
        }
        fibra = fibra.return;
      }
      return nomes;
    } catch (e) {
      return [];
    }
  }

  function criarHighlight() {
    var el = document.createElement("div");
    el.style.cssText =
      "position:fixed;pointer-events:none;z-index:2147483647;" +
      "outline:2px solid #2563eb;outline-offset:1px;border-radius:4px;" +
      "background:rgba(37,99,235,0.08);display:none;";
    document.documentElement.appendChild(el);
    return el;
  }

  function seguir(event) {
    if (!highlight) return;
    var alvo = event.target;
    if (!(alvo instanceof Element)) return;
    var caixa = alvo.getBoundingClientRect();
    highlight.style.display = "block";
    highlight.style.left = caixa.left + "px";
    highlight.style.top = caixa.top + "px";
    highlight.style.width = caixa.width + "px";
    highlight.style.height = caixa.height + "px";
  }

  function engolir(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  function escolher(event) {
    engolir(event);
    var alvo = event.target;
    if (!(alvo instanceof Element)) return;
    var link = alvo.closest ? alvo.closest("a[href]") : null;
    enviar({
      source: "via-ponte",
      v: V,
      type: "selecionado",
      payload: {
        seletor: seletorDe(alvo),
        tag: alvo.tagName.toLowerCase(),
        id: alvo.id ? String(alvo.id).slice(0, 64) : null,
        classes: Array.prototype.slice.call(alvo.classList || [], 0, 8)
          .map(function (c) { return String(c).slice(0, 64); }),
        texto: textoLimpo(alvo.innerText),
        componentes: componentesDe(alvo),
        rota: location.pathname,
        href: link ? String(link.getAttribute("href") || "").slice(0, 300) : null,
      },
    });
    desarmar();
  }

  function teclado(event) {
    if (event.key === "Escape") {
      engolir(event);
      desarmar();
      enviar({ source: "via-ponte", v: V, type: "cancelado" });
    }
  }

  // Captura também pointerdown/mousedown/mouseup/auxclick: só interceptar o
  // click deixaria o app reagir ao mousedown antes do clique ser engolido
  // (dropdown abre, modal fecha) — péssimo pra quem só queria apontar.
  var ENGOLIDOS = ["pointerdown", "mousedown", "mouseup", "auxclick"];

  function armar() {
    if (armado) return;
    armado = true;
    if (!highlight) highlight = criarHighlight();
    document.documentElement.style.cursor = "crosshair";
    document.addEventListener("mousemove", seguir, true);
    document.addEventListener("click", escolher, true);
    document.addEventListener("keydown", teclado, true);
    ENGOLIDOS.forEach(function (nome) {
      document.addEventListener(nome, engolir, true);
    });
  }

  function desarmar() {
    if (!armado) return;
    armado = false;
    document.documentElement.style.cursor = "";
    if (highlight) highlight.style.display = "none";
    document.removeEventListener("mousemove", seguir, true);
    document.removeEventListener("click", escolher, true);
    document.removeEventListener("keydown", teclado, true);
    ENGOLIDOS.forEach(function (nome) {
      document.removeEventListener(nome, engolir, true);
    });
  }

  // ── Erros da tela → editor ─────────────────────────────────────────────
  // Sem a origem do editor ainda (ela só chega com o primeiro "inspecionar"),
  // o aviso vai para cada origem permitida; o postMessage descarta em
  // silêncio as que não casam com o parent real. Nunca "*".
  function difundir(mensagem) {
    PARENT_PERMITIDOS.forEach(function (origem) {
      try { window.parent.postMessage(mensagem, origem); } catch (e) { /* origem não casa */ }
    });
  }

  function textoDeErro(valor, max) {
    return String(valor == null ? "" : valor)
      .replace(/[\u0000-\u0008\u000b-\u001f\u007f]+/g, " ")
      .replace(/[ \t]+/g, " ")
      .trim()
      .slice(0, max);
  }

  // "https://porta-id.viverdeai.ai/src/pages/Inicio.tsx?t=123" → "src/pages/Inicio.tsx"
  function arquivoRelativo(valor) {
    var texto = textoDeErro(valor, 400);
    if (!texto) return null;
    var semQuery = texto.split("?")[0];
    var idx = semQuery.indexOf(location.origin + "/");
    if (idx === 0) semQuery = semQuery.slice(location.origin.length + 1);
    return semQuery.slice(0, 200) || null;
  }

  function quadros(pilha) {
    var linhas = String(pilha || "").split("\n");
    var saida = [];
    for (var i = 0; i < linhas.length && saida.length < 5; i += 1) {
      var linha = textoDeErro(linhas[i], 300);
      if (!linha || linha.indexOf("at ") !== 0 && linha.indexOf("@") === -1) continue;
      saida.push(linha.replace(/\?t=\d+/g, "").split(location.origin + "/").join("").slice(0, 200));
    }
    return saida;
  }

  var ultimosDoConsole = [];
  var vistos = {};
  var enviados = 0;
  var MAX_ERROS = 20;

  function reportar(tipo, mensagem, pilha, arquivo, linha, coluna) {
    try {
      var texto = textoDeErro(mensagem, 500) || "Erro sem mensagem";
      var assinatura = tipo + "|" + texto.slice(0, 160) + "|" + (arquivo || "") + ":" + (linha || "");
      if (vistos[assinatura] || enviados >= MAX_ERROS) return;
      vistos[assinatura] = true;
      enviados += 1;
      difundir({
        source: "via-ponte",
        v: V,
        type: "erro",
        payload: {
          tipo: tipo,
          mensagem: texto,
          pilha: quadros(pilha),
          arquivo: arquivo || null,
          linha: typeof linha === "number" && linha > 0 ? linha : null,
          coluna: typeof coluna === "number" && coluna > 0 ? coluna : null,
          rota: location.pathname,
          console: ultimosDoConsole.slice(0, 3),
        },
      });
    } catch (e) { /* a ponte nunca pode derrubar a página */ }
  }

  // Código que quebrou em uso (inclui erro de renderização do React, que o
  // React relança). Erro de carregar recurso (imagem, script) chega com
  // target de elemento e não interessa aqui.
  window.addEventListener("error", function (event) {
    if (!event || (event.target && event.target !== window)) return;
    var erro = event.error;
    if (erro && typeof erro === "object") {
      reportar("execucao", erro.message || String(erro), erro.stack, arquivoRelativo(event.filename), event.lineno, event.colno);
    } else if (event.message) {
      reportar("execucao", event.message, "", arquivoRelativo(event.filename), event.lineno, event.colno);
    }
  }, true);

  window.addEventListener("unhandledrejection", function (event) {
    var motivo = event && event.reason;
    var mensagem = motivo && typeof motivo === "object" && motivo.message ? motivo.message : String(motivo);
    reportar("promessa", mensagem, motivo && motivo.stack, null, null, null);
  });

  // Erro de compilação: o servidor de desenvolvimento desenha uma sobreposição
  // própria; lê-se a mensagem e o arquivo de dentro dela.
  function lerSobreposicao(no) {
    try {
      var raiz = no.shadowRoot || no;
      var corpo = raiz.querySelector(".message-body") || raiz.querySelector(".message") || raiz;
      var arquivo = raiz.querySelector(".file-link") || raiz.querySelector(".file");
      reportar("compilacao", corpo.textContent, "", arquivo ? arquivoRelativo(arquivo.textContent) : null, null, null);
    } catch (e) { /* sobreposição em outro formato */ }
  }
  try {
    new MutationObserver(function (mutacoes) {
      for (var i = 0; i < mutacoes.length; i += 1) {
        var adicionados = mutacoes[i].addedNodes;
        for (var j = 0; j < adicionados.length; j += 1) {
          var no = adicionados[j];
          if (no && no.tagName === "VITE-ERROR-OVERLAY") lerSobreposicao(no);
        }
      }
    }).observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) { /* sem observador: os outros avisos seguem valendo */ }

  // O que o app mandou para o console de erros vai junto do próximo aviso,
  // como contexto; sozinho não é aviso (bibliotecas reclamam de tudo).
  try {
    var consoleErro = console.error;
    console.error = function () {
      try {
        var partes = [];
        for (var i = 0; i < arguments.length && i < 3; i += 1) {
          var a = arguments[i];
          partes.push(textoDeErro(a && typeof a === "object" && a.message ? a.message : a, 160));
        }
        ultimosDoConsole.unshift(partes.join(" ").slice(0, 200));
        ultimosDoConsole = ultimosDoConsole.slice(0, 3);
      } catch (e) { /* segue */ }
      return consoleErro.apply(console, arguments);
    };
  } catch (e) { /* console imutável: segue sem contexto */ }

  window.addEventListener("message", function (event) {
    if (event.source !== window.parent) return;
    if (PARENT_PERMITIDOS.indexOf(event.origin) === -1) return;
    var dado = event.data;
    if (!dado || dado.source !== "via-editor" || dado.v !== V) return;
    if (dado.type !== "inspecionar" || typeof dado.ativo !== "boolean") return;
    editorOrigin = event.origin;
    if (dado.ativo) armar();
    else desarmar();
  });

  // Announce: uma vez por origem permitida — postMessage descarta em
  // silêncio quando o parent real não casa. Nenhum "*" no protocolo.
  PARENT_PERMITIDOS.forEach(function (origem) {
    try {
      window.parent.postMessage({ source: "via-ponte", v: V, type: "ready" }, origem);
    } catch (e) { /* origem não casa com o parent real */ }
  });
})();
