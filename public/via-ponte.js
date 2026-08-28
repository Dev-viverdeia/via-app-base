// Ponte de inspeção da plataforma Viver de IA Builder.
// Permite ao editor da plataforma (parent) armar um modo "apontar": o aluno
// clica num elemento do preview e o editor recebe um resumo estrutural para
// anexar ao pedido. Fora do editor (site publicado, aba solta) este arquivo
// é inerte: sai no primeiro guarda. Não remova nem edite — o botão "Apontar"
// do editor depende dele.
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
