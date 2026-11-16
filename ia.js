// v60 — Robozinho da IA em todas as telas (novo.html e telas de antes).
// Junta: falar com a Dalinha, abrir ChatGPT / Gemini / Claude e pedidos prontos com o nicho e as regras dela.
// Não gasta nada: só abre a IA com o pedido escrito (ela manda se quiser).
(function () {
  const ANTIGO = !!document.querySelector("script[src='voz.js']");
  const NICHO = "Sou a Daia (@daledaia), afiliada de casa, decoração e organização (Shopee, TikTok Shop, Magalu, Natura). Estilo minimalista e delicado, sem preço, pouco texto. Títulos sempre pela dor. POV e vídeos curtos não têm CTA. TikTok divulga o TikTok Shop (CTA: toca na sacolinha); Instagram divulga a Shopee e agrega valor, sem cara de venda.";
  const PEDIDOS = [
    ["10 ganchos pela dor", t => "Escreva 10 ganchos curtos para vídeo de TikTok sobre: " + t + ". Cada gancho começa pela dor da pessoa (casa, rotina, bagunça). Sem preço."],
    ["Roteiro POV", t => "Escreva um roteiro de vídeo POV de 10 a 15 segundos sobre: " + t + ". Cenas curtas, texto na tela, sem CTA no final."],
    ["10 vídeos de um produto", t => "Monte 10 roteiros de TikTok diferentes para o produto: " + t + ". Varie os formatos (POV, mãos mostrando, antes e depois, 3 motivos, unboxing, demonstração, storytelling). Para cada um: gancho pela dor, cenas, texto na tela e CTA de sacolinha só nos formatos que pedem."],
    ["Vídeo de valor para o Instagram", t => "Crie um roteiro de Reels que agregue na vida das pessoas (dica, organização, rotina) usando: " + t + ". Não pode parecer venda. Termine convidando a salvar o vídeo."],
    ["Legenda + SEO", t => "Escreva uma legenda curta com palavras de busca (SEO) para um vídeo sobre: " + t + ". Sem preço. 3 a 5 hashtags."],
    ["Responder comentário", t => "Sugira 3 respostas simpáticas e curtas para este comentário: " + t + ". Se pedirem o link, diga que mandei no direct ou que está na sacolinha."]
  ];
  const fab = document.createElement("button");
  fab.className = "ia-fab"; fab.type = "button"; fab.setAttribute("aria-label", "Abrir a IA"); fab.textContent = "🤖";
  const folha = document.createElement("div");
  folha.className = "ia-folha"; folha.hidden = true;
  folha.innerHTML = '<div class="ia-in"><div class="ia-alca"></div>' +
    '<div class="ia-top"><b>Falar com a IA</b><button type="button" class="ia-bt" data-iafecha="1">Fechar</button></div>' +
    '<button type="button" class="ia-bt ia-main" data-iadal="1">🎤 Falar com a Dalinha</button>' +
    '<p class="ia-mini">Abrir uma IA (sem gastar nada daqui):</p>' +
    '<div class="ia-apps"><a href="https://chatgpt.com" target="_blank" rel="noopener">ChatGPT<small>roteiros</small></a><a href="https://gemini.google.com" target="_blank" rel="noopener">Gemini<small>imagens</small></a><a href="https://claude.ai" target="_blank" rel="noopener">Claude<small>planejar</small></a></div>' +
    '<p class="ia-mini">Pedidos prontos (já vão com o seu nicho e as suas regras):</p>' +
    '<input id="iaTema6" placeholder="Produto ou tema (ex.: vila natalina)" aria-label="Produto ou tema">' +
    '<div class="ia-peds">' + PEDIDOS.map((p, i) => '<button type="button" data-iaped="' + i + '">' + p[0] + '</button>').join("") + '</div>' +
    '<p class="ia-mini" id="iaMsg6">O pedido é copiado e o Claude abre com ele escrito. É só enviar.</p></div>';
  function monta() { document.body.appendChild(fab); document.body.appendChild(folha); }
  if (document.body) monta(); else document.addEventListener("DOMContentLoaded", monta);
  fab.onclick = () => { folha.hidden = false; };
  folha.addEventListener("click", e => {
    if (e.target === folha || e.target.closest("[data-iafecha]")) { folha.hidden = true; return; }
    if (e.target.closest("[data-iadal]")) {
      folha.hidden = true;
      const v = document.querySelector(".voz-fab");
      if (v) v.click(); else { try { sessionStorage.setItem("daia-dalinha", "1"); } catch (_) {} location.href = "index.html?antigo=1&tab=hoje"; }
      return;
    }
    const p = e.target.closest("[data-iaped]");
    if (p) {
      const t = (document.getElementById("iaTema6").value || "").trim() || "um achadinho de casa";
      const txt = NICHO + "\n\n" + PEDIDOS[+p.dataset.iaped][1](t);
      try { navigator.clipboard && navigator.clipboard.writeText(txt); } catch (_) {}
      document.getElementById("iaMsg6").textContent = "Copiado! Abrindo o Claude…";
      window.open("https://claude.ai/new?q=" + encodeURIComponent(txt), "_blank", "noopener");
    }
  });
  const st = document.createElement("style");
  st.textContent = `
.ia-fab{position:fixed;right:max(16px,env(safe-area-inset-right,0px));bottom:calc(80px + env(safe-area-inset-bottom,0px));width:54px;height:54px;border-radius:50%;background:var(--acc,var(--wine,#7A2E3A));color:#fff;font-size:25px;display:grid;place-items:center;box-shadow:0 8px 20px rgba(0,0,0,.18);z-index:35;border:0;cursor:pointer}
.voz-fab{display:none!important}
.ia-folha{position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.28);display:flex;align-items:flex-end}
.ia-folha[hidden]{display:none!important}
.ia-in{width:100%;max-height:80vh;overflow:auto;background:var(--card,var(--surface,#fff));color:var(--ink,#2A2220);border-radius:22px 22px 0 0;padding:14px max(16px,env(safe-area-inset-right,0px)) calc(18px + env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px));display:grid;gap:10px;font-family:var(--f,var(--body,system-ui))}
.ia-in>*{max-width:560px;width:100%;margin:0 auto}
.ia-alca{width:40px;height:4px;border-radius:99px;background:var(--line,#ECE5E0)}
.ia-top{display:flex;align-items:center}.ia-top b{flex:1;font-size:16px}
.ia-bt{border:1px solid var(--line,#ECE5E0);border-radius:10px;padding:8px 13px;font-size:13.5px;font-weight:600;background:var(--card,var(--surface,#fff));color:inherit;cursor:pointer}
.ia-main{background:var(--ink,#2A2220);color:var(--bg,#fff);border-color:var(--ink,#2A2220);padding:11px}
.ia-mini{font-size:12px;color:var(--mute,var(--muted,#857873));margin:0}
.ia-apps{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.ia-apps a{display:grid;gap:2px;padding:10px;border:1px solid var(--line,#ECE5E0);border-radius:14px;text-decoration:none;color:inherit;text-align:center;font-weight:600;font-size:13.5px}
.ia-apps small{color:var(--mute,var(--muted,#857873));font-weight:400;font-size:11px}
#iaTema6{font:inherit;padding:10px 12px;border:1px solid var(--line,#ECE5E0);border-radius:12px;background:var(--bg,#fff);color:inherit}
.ia-peds{display:flex;gap:6px;flex-wrap:wrap}.ia-peds button{padding:8px 12px;border-radius:99px;border:1px solid var(--line,#ECE5E0);background:transparent;color:inherit;font:inherit;font-size:13px;cursor:pointer}`;
  document.head.appendChild(st);
  // telas de antes: veio do botão "Falar com a Dalinha" no Início novo
  if (ANTIGO) document.addEventListener("DOMContentLoaded", () => { try { if (sessionStorage.getItem("daia-dalinha")) { sessionStorage.removeItem("daia-dalinha"); setTimeout(() => { const v = document.querySelector(".voz-fab"); if (v) v.click(); }, 900); } } catch (_) {} });
})();
