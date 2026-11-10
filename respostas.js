// Daia Studio v38 — aba 💬 Respostas (pedido da Daia em 10/11/2026: "coisa urgente, quero achar na hora").
// Mostra as frases da pasta "Frases prontas" do Bloco (as dela, que vão para a planilha), separadas por rede.
// Toque em Copiar e cole no Instagram. {link} = link do produto colado aqui em cima, {vip} = grupo, {pagina} = página de links.

const RESP_NOVAS = [
  ["Instagram: comentário (te mandei os links)", "Te mandei os links no direct! 🤍 Se não achar, olha na sua caixa de mensagens, em “Solicitações de mensagem”."],
  ["Instagram: direct com vários links", "Oi! 🤍 Aqui estão os links do vídeo:\n{link}\n\nTodos os meus achados ficam aqui: {pagina}"],
  ["Instagram: não achou a mensagem", "Mandei sim! 🤍 Como a gente ainda não se segue, cai em “Solicitações de mensagem”: abre o direct e toca em Solicitações, lá em cima."],
  ["TikTok Shop: pediu o link", "Oi! 🤍 Toca no carrinho laranja 🛒 aqui no vídeo: o produto está lá!"],
  ["TikTok Shop: não achou o carrinho", "O carrinho 🛒 fica embaixo, perto da legenda do vídeo 🤍 Se não aparecer, entra no meu perfil e toca na sacolinha (Vitrine)."],
  ["TikTok Shop: perguntou o preço", "Muda toda hora e às vezes tem cupom 🤍 Toca no carrinho 🛒 do vídeo que aparece o valor de agora!"],
  ["TikTok Shop: é confiável?", "É sim 🤍 A compra é pelo próprio TikTok Shop: se não chegar ou vier errado, você pede o dinheiro de volta pelo app."],
  ["Tem outras cores?", "Tem sim! 🤍 No link você escolhe a cor e o tamanho antes de comprar."],
  ["Demora pra chegar?", "Depende da sua cidade 🤍 O app mostra o prazo certinho antes de você finalizar a compra."]
];
// grupos, na ordem da tela (o título da frase começa com o nome da rede)
const RESP_GRUPOS = [
  ["insta", "📸 Instagram", t => /^instagram/i.test(t)],
  ["tts", "🛍️ TikTok Shop", t => /^tiktok shop/i.test(t)],
  ["zap", "💬 WhatsApp", t => /^whats/i.test(t)],
  ["outras", "❓ Dúvidas e outras", t => !/^(instagram|tiktok|whats)/i.test(t)],
  ["tt", "🎵 TikTok antigo (Garotas apoiam garotas)", t => /^tiktok(?! shop)/i.test(t)]
];
function respSemente(){
  blocoDaNuvem();
  const b = BL(), tem = {}; b.notas.forEach(n => { tem[(n.t || "").toLowerCase()] = 1; });
  if (b.semente2) return;
  const agora = Date.now(); let mudou = 0;
  RESP_NOVAS.forEach(f => { if (!tem[f[0].toLowerCase()]) { b.notas.push({id: novoId(), pasta: "frases", t: f[0], txt: f[1], upd: agora}); mudou = 1; } });
  b.semente2 = 1; if (mudou) blocoMudou(); else save();
}
const respLink = () => state.respLink || state.ultimoLink || "";
const respTexto = t => String(t).replace(/\{vip\}/g, LINK_VIP).replace(/\{pagina\}/g, LINK_PAGINA).replace(/\{nome\}/g, "amiga")
  .replace(/\{link\}/g, respLink() || "[cole o link aqui em cima]");
let RESP_TAB = [];
function renderRespostas(){
  respSemente();
  const b = BL(), frases = b.notas.filter(n => n.pasta === "frases");
  (conteudo().respostas || []).forEach(x => { if (x.nome && !frases.some(n => n.t === x.nome)) frases.push({id: "pl-" + x.nome, t: x.nome, txt: x.texto}); });
  const aberto = state.respAberto || {insta: 1, tts: 1};
  RESP_TAB = [];
  const cartao = n => {
    RESP_TAB.push(n); const i = RESP_TAB.length - 1;
    let nome = String(n.t || "").replace(/^(instagram|tiktok shop|tiktok|whatsapp)\s*:\s*/i, ""); nome = nome.charAt(0).toUpperCase() + nome.slice(1);
    return '<article class="card rs-frase"><b class="rs-nome">' + esc(nome || "Frase") + '</b><p class="how rs-txt">' + esc(respTexto(n.txt)) + '</p>' +
      '<button class="btn wine full" data-rscopy="' + i + '">📋 Copiar</button></article>';
  };
  const grupos = RESP_GRUPOS.map(([id, titulo, f]) => {
    const l = frases.filter(n => f(n.t || "")); if (!l.length) return "";
    return '<details class="secao rs-grupo" data-rsg="' + id + '"' + (aberto[id] ? " open" : "") + '><summary><span class="sec-txt"><b>' + titulo + '</b><small>' + l.length + (l.length === 1 ? ' frase' : ' frases') + '</small></span><span class="sec-seta"></span></summary><div class="sec-corpo">' + l.map(cartao).join("") + '</div></details>';
  }).join("");
  const lk = respLink();
  $("respBox").innerHTML =
    '<article class="card rs-link"><label for="rsLink"><b>🔗 Link do produto</b> <small>(entra nas frases com link)</small></label>' +
      '<div class="rs-linha"><input class="input" id="rsLink" type="url" inputmode="url" placeholder="Cole aqui o link" value="' + esc(lk) + '">' +
      '<button class="btn" data-rscolar="1">Colar</button></div>' +
      (lk ? '<button class="btn mini" data-rslimpar="1">Apagar o link</button>' : '') + '</article>' +
    grupos +
    '<div class="actions"><button class="btn full" data-rseditar="1">✏️ Mudar ou criar uma frase</button></div>' +
    '<p class="note">As frases ficam no Bloco › 💬 Frases prontas. Para aparecer no grupo certo, comece o título com “Instagram:”, “TikTok Shop:” ou “WhatsApp:”.</p>';
}
document.addEventListener("click", async e => {
  if (!e.target.closest("#respBox")) return;
  const q = s => e.target.closest(s);
  const c = q("[data-rscopy]");
  if (c) { const n = RESP_TAB[c.dataset.rscopy]; if (!n) return;
    if (/\{link\}/.test(n.txt) && !respLink()) { toast("Cole o link do produto lá em cima primeiro."); $("rsLink").focus(); return; }
    copyText(respTexto(n.txt)); c.textContent = "✓ Copiado! Agora é só colar"; setTimeout(() => { c.textContent = "📋 Copiar"; }, 2500); return; }
  if (q("[data-rscolar]")) {
    try { const t = (await navigator.clipboard.readText()).trim(); if (!t) throw 0; state.respLink = t; save(); renderRespostas(); toast("Link colado 🤍"); }
    catch(_) { toast("Toque no campo, segure e escolha Colar."); $("rsLink").focus(); }
    return; }
  if (q("[data-rslimpar]")) { state.respLink = ""; state.ultimoLink = ""; save(); renderRespostas(); return; }
  if (q("[data-rseditar]")) { state.blocoPasta = "frases"; save(); show("bloco"); return; }
});
document.addEventListener("toggle", e => {
  const d = e.target; if (!d.matches || !d.matches("[data-rsg]")) return;
  state.respAberto = state.respAberto || {insta: 1, tts: 1}; state.respAberto[d.dataset.rsg] = d.open ? 1 : 0; save();
}, true);
document.addEventListener("change", e => {
  if (e.target.id !== "rsLink") return; state.respLink = e.target.value.trim(); save(); renderRespostas();
});

// abre pelo botão + › Respostas prontas (a Daia preferiu assim em 10/11; não fica no menu de baixo)
const showResp = show;
show = function(t){
  if (t === "respostas") {
    showResp("hoje");
    $("tab-hoje").hidden = true; $("tab-respostas").hidden = false; renderRespostas(); window.scrollTo(0, 0);
    document.querySelectorAll("nav.tabs button[data-tab]").forEach(b => b.setAttribute("aria-selected", false));
    try { sessionStorage.setItem("daia-tab", "respostas"); } catch(_) {}
    return;
  }
  $("tab-respostas").hidden = true; showResp(t);
};
document.addEventListener("click", e => { if (e.target.closest("[data-respvoltar]")) show("hoje"); });
document.addEventListener("click", e => {
  const ir = e.target.closest('[data-maisir="respostas"]'); if (!ir) return;
  e.stopImmediatePropagation(); maisAbrir(false); show("respostas");
}, true);
try { if (sessionStorage.getItem("daia-tab") === "respostas") show("respostas"); } catch(_) {}
