// Daia Studio v40 — 💬 Respostas prontas (abre pelo botão +).
// Mostra as frases da pasta "Frases prontas" do Bloco (as dela, que vão para a planilha).
// 11/11/2026: a Daia reescreveu o Instagram (3 de comentário, 2 de direct com 1 link, 2 com vários) e tirou o TikTok
// (no TikTok Shop o produto já vai no carrinho do vídeo).
// {link} = 1º link colado aqui em cima, {lista} = todos os produtos colados (nome + link), {vip} = grupo, {pagina} = página de links.

const RESP_FINAL = "\n\nAproveita e entra também no meu grupo VIP de promoções no WhatsApp 📲✨ Lá eu sempre solto achadinhos, descontos exclusivos e ofertas que nem aparecem no feed! 💕\n\n{vip}";
const RESP_AVISO = "\n\n⚠️ Se o link não ficar clicável, me manda um “REENVIAR” aqui que eu te mando de novo, tá? 🥰";
const RESP_NOVAS = [
  ["Instagram comentário: te mandei no direct", "Te mandei no direct! 💌 Caso não consiga ver, olha nas suas Solicitações de mensagem, tá? ✨"],
  ["Instagram comentário: te mandei, amiga", "Te mandei, amiga! Confere aí 🥰💌"],
  ["Instagram comentário: prontinho, linda", "Prontinho, linda! Já tá no seu direct 💖 Se não aparecer, procura em Solicitações de mensagem 😉"],
  ["Instagram comentário: não achou a mensagem", "Mandei sim, amiga! 💌 Como a gente ainda não se segue, cai em Solicitações de mensagem: abre o direct e toca em “Solicitações”, lá em cima ✨"],
  ["Instagram 1 link: oi, maravilhosa", "Oi, maravilhosa! 😍 Aqui está o link que você pediu 🛍️✨\n\n👉 {link}" + RESP_FINAL + RESP_AVISO + "\n\nBeijo e fica com Deus! 💖"],
  ["Instagram 1 link: oi, amor", "Oi, amor! 🥰 Prontinho, segue o seu link 💌\n\n🛍️ {link}" + RESP_FINAL + RESP_AVISO + "\n\nAté a próxima! 💕✨"],
  ["Instagram vários links: oi, amiga", "Oi, amiga! 🥰 Aqui estão os links que você pediu 🛍️✨\n\n{lista}" + RESP_FINAL + RESP_AVISO + "\n\nAté a próxima! Fica com Deus 💖"],
  ["Instagram vários links: oi, diva", "Oi, diva! 💖 Separei tudinho pra você 😍\n\n{lista}" + RESP_FINAL + RESP_AVISO + "\n\nUm beijo e boas compras! 🛍️💕"]
];
// frases antigas que saíram em 11/11 (só as que o app criou; as que ela mesma escreveu ficam)
const RESP_VELHAS = ["tiktok: pediu o link (comentário)", "tiktok: garotas apoiam garotas", "tiktok: garotas apoiam garotas (2)", "tiktok: garotas apoiam garotas (3)", "tiktok: garotas apoiam garotas (4)",
  "instagram: resposta no comentário", "instagram: direct com o link", "instagram: comentário (te mandei os links)", "instagram: direct com vários links", "instagram: não achou a mensagem",
  "tiktok shop: pediu o link", "tiktok shop: não achou o carrinho", "tiktok shop: perguntou o preço", "tiktok shop: é confiável?"];
const RESP_EXTRAS = [
  ["Tem outras cores?", "Tem sim! 🤍 No link você escolhe a cor e o tamanho antes de comprar."],
  ["Demora pra chegar?", "Depende da sua cidade 🤍 O app mostra o prazo certinho antes de você finalizar a compra."]
];
// grupos, na ordem da tela (pelo começo do título da frase). TikTok não aparece mais.
const RESP_GRUPOS = [
  ["coment", "💬 Instagram · resposta no comentário", t => /^instagram\s*coment/i.test(t)],
  ["um", "📩 Direct · 1 link", t => /^instagram\s*1\s*link/i.test(t)],
  ["varios", "📩 Direct · vários links", t => /^instagram\s*v[áa]rios/i.test(t)],
  ["insta", "📸 Instagram · outras", t => /^instagram/i.test(t) && !/^instagram\s*(coment|1\s*link|v[áa]rios)/i.test(t)],
  ["zap", "💚 WhatsApp", t => /^whats/i.test(t)],
  ["outras", "❓ Dúvidas e outras", t => !/^(instagram|tiktok|whats)/i.test(t)]
];
function respSemente(){
  blocoDaNuvem();
  const b = BL(); if (b.semente3) return;
  const agora = Date.now();
  b.notas = b.notas.filter(n => !(n.pasta === "frases" && RESP_VELHAS.includes(String(n.t || "").toLowerCase())));
  const tem = {}; b.notas.forEach(n => { tem[String(n.t || "").toLowerCase()] = 1; });
  RESP_NOVAS.concat(RESP_EXTRAS).forEach(f => { if (!tem[f[0].toLowerCase()]) b.notas.push({id: novoId(), pasta: "frases", t: f[0], txt: f[1], upd: agora}); });
  b.semente2 = b.semente3 = 1; blocoMudou();
}
// produtos colados aqui em cima: [{n: nome, l: link}], até 5
const RESP_MAX = 5;
function respProds(){
  let p = state.respProds;
  if (!Array.isArray(p) || !p.length) p = state.respProds = [{n: "", l: state.respLink || state.ultimoLink || ""}];
  return p;
}
const respLink = () => (respProds().find(x => x.l) || {}).l || "";
function respLista(){
  const ps = respProds().filter(x => x.l);
  if (!ps.length) return Array.from({length: RESP_MAX}, (_, i) => "✨ Produto " + (i + 1) + ":\n🔗 (cole o link)").join("\n\n");
  return ps.map((x, i) => "✨ " + (x.n || "Produto " + (i + 1)) + ":\n" + x.l).join("\n\n");
}
const respTexto = t => String(t).replace(/\{vip\}/g, LINK_VIP).replace(/\{pagina\}/g, LINK_PAGINA).replace(/\{nome\}/g, "amiga")
  .replace(/\{lista\}/g, respLista()).replace(/\{link\}/g, respLink() || "[cole o link aqui em cima]");
let RESP_TAB = [];
function renderRespostas(){
  respSemente();
  const b = BL(), frases = b.notas.filter(n => n.pasta === "frases");
  (conteudo().respostas || []).forEach(x => { if (x.nome && !frases.some(n => n.t === x.nome)) frases.push({id: "pl-" + x.nome, t: x.nome, txt: x.texto}); });
  const aberto = state.respAberto2 || {coment: 1, um: 1, varios: 1};
  RESP_TAB = [];
  const cartao = n => {
    RESP_TAB.push(n); const i = RESP_TAB.length - 1;
    let nome = String(n.t || "").replace(/^[^:]*:\s*/, ""); nome = nome.charAt(0).toUpperCase() + nome.slice(1);
    return '<article class="card rs-frase"><b class="rs-nome">' + esc(nome || "Frase") + '</b><p class="how rs-txt">' + esc(respTexto(n.txt)) + '</p>' +
      '<button class="btn wine full" data-rscopy="' + i + '">📋 Copiar</button></article>';
  };
  const grupos = RESP_GRUPOS.map(([id, titulo, f]) => {
    const l = frases.filter(n => f(n.t || "")); if (!l.length) return "";
    return '<details class="secao rs-grupo" data-rsg="' + id + '"' + (aberto[id] ? " open" : "") + '><summary><span class="sec-txt"><b>' + titulo + '</b><small>' + l.length + (l.length === 1 ? ' opção' : ' opções') + '</small></span><span class="sec-seta"></span></summary><div class="sec-corpo">' + l.map(cartao).join("") + '</div></details>';
  }).join("");
  const ps = respProds(), temAlgum = ps.some(x => x.l || x.n);
  $("respBox").innerHTML =
    '<article class="card rs-link"><b>🔗 Produtos do vídeo</b> <small>(entram no direct)</small>' +
      ps.map((x, i) => '<div class="rs-prod"><input class="input" data-rsn="' + i + '" placeholder="Nome do produto ' + (i + 1) + ' (ex.: Veludo)" value="' + esc(x.n) + '">' +
        '<div class="rs-linha"><input class="input" data-rsl="' + i + '" type="url" inputmode="url" placeholder="Cole aqui o link" value="' + esc(x.l) + '">' +
        '<button class="btn" data-rscolar="' + i + '">Colar</button></div></div>').join("") +
      '<div class="actions">' + (ps.length < RESP_MAX ? '<button class="btn" data-rsmais="1">+ Outro produto</button>' : '') +
      (temAlgum ? '<button class="btn" data-rslimpar="1">Apagar tudo</button>' : '') + '</div></article>' +
    grupos +
    '<div class="actions"><button class="btn full" data-rseditar="1">✏️ Mudar ou criar uma frase</button></div>' +
    '<p class="note">As frases ficam no Bloco › 💬 Frases prontas. Para aparecer no grupo certo, comece o título com “Instagram comentário:”, “Instagram 1 link:”, “Instagram vários links:” ou “WhatsApp:”.</p>';
}
function respGuarda(){
  document.querySelectorAll("#respBox [data-rsn]").forEach(el => { const p = respProds()[el.dataset.rsn]; if (p) p.n = el.value.trim(); });
  document.querySelectorAll("#respBox [data-rsl]").forEach(el => { const p = respProds()[el.dataset.rsl]; if (p) p.l = el.value.trim(); });
  save();
}
document.addEventListener("click", async e => {
  if (!e.target.closest("#respBox")) return;
  const q = s => e.target.closest(s);
  const c = q("[data-rscopy]");
  if (c) { respGuarda(); const n = RESP_TAB[c.dataset.rscopy]; if (!n) return;
    if (/\{link\}/.test(n.txt) && !respLink()) { toast("Cole o link do produto lá em cima primeiro."); window.scrollTo({top: 0, behavior: "smooth"}); return; }
    copyText(respTexto(n.txt)); c.textContent = "✓ Copiado! Agora é só colar"; setTimeout(() => { c.textContent = "📋 Copiar"; }, 2500); return; }
  const col = q("[data-rscolar]");
  if (col) { respGuarda();
    try { const t = (await navigator.clipboard.readText()).trim(); if (!t) throw 0; respProds()[col.dataset.rscolar].l = t; save(); renderRespostas(); toast("Link colado 🤍"); }
    catch(_) { toast("Toque no campo, segure e escolha Colar."); }
    return; }
  if (q("[data-rsmais]")) { respGuarda(); const ps = respProds(); if (ps.length < RESP_MAX) ps.push({n: "", l: ""}); save(); renderRespostas(); return; }
  if (q("[data-rslimpar]")) { state.respProds = [{n: "", l: ""}]; state.respLink = ""; state.ultimoLink = ""; save(); renderRespostas(); return; }
  if (q("[data-rseditar]")) { state.blocoPasta = "frases"; save(); show("bloco"); return; }
});
document.addEventListener("toggle", e => {
  const d = e.target; if (!d.matches || !d.matches("[data-rsg]")) return;
  state.respAberto2 = state.respAberto2 || {coment: 1, um: 1, varios: 1}; state.respAberto2[d.dataset.rsg] = d.open ? 1 : 0; save();
}, true);
// atualiza enquanto ela digita (no "change" o texto mudava na hora do toque e o botão Copiar fugia do dedo)
document.addEventListener("input", e => {
  if (!e.target.closest("#respBox") || !e.target.matches("[data-rsn],[data-rsl]")) return; respGuarda();
  // atualiza só o texto das frases, sem redesenhar (senão o campo que ela está digitando perde o foco)
  document.querySelectorAll("#respBox .rs-frase").forEach((el, i) => { const t = el.querySelector(".rs-txt"); if (t && RESP_TAB[i]) t.textContent = respTexto(RESP_TAB[i].txt); });
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
