// Daia Studio v29 — repaginada aprovada pela Daia em 07/11/2026:
// menu Hoje · Criar · + · Crescer · Bloco; "Faça agora" na tela Hoje; botão + com as ferramentas;
// Parcerias e Curso dentro de Crescer; Prontos dentro de Criar; avisos no celular em Ajustes.

// ---------- ✨ FAÇA AGORA (no lugar do "Já passou da hora") ----------
function facaAgoraCard(posts, meta){
  const agora = new Date().getHours() * 60 + new Date().getMinutes();
  const lista = (posts || []).map((p, i) => ({p, i, m: minDe(p.h)})).filter(x => !state.done[todayKey + "-" + x.i]);
  const atras = lista.filter(x => x.m !== null && x.m <= agora);
  const prox = lista.filter(x => x.m === null || x.m > agora);
  const alvo = atras[0] || prox[0];
  if (alvo) {
    const quando = alvo.m !== null && alvo.m <= agora ? "já passou das " + alvo.p.h : (alvo.p.h ? "às " + alvo.p.h : "hoje");
    return '<article class="card faca"><div class="meta"><span class="tag">✨ Faça agora</span><span class="why">' + esc(quando) + (atras.length > 1 ? ' · mais ' + (atras.length - 1) + ' atrasado' + (atras.length > 2 ? 's' : '') : '') + '</span></div>' +
      '<h3 class="title">' + esc(alvo.p.t) + '</h3>' + (alvo.p.g ? '<p class="how">“' + esc(alvo.p.g) + '”</p>' : '') +
      '<div class="actions"><button class="btn" data-facaver="' + alvo.i + '">Ver o roteiro</button></div></article>';
  }
  const shopee = meta && meta.linhas.find(l => l.id === "shopee");
  if (shopee && shopee.feito < shopee.n) return '<article class="card faca"><div class="meta"><span class="tag">✨ Faça agora</span><span class="why">Shopee Vídeo</span></div>' +
    '<h3 class="title">Faltam ' + (shopee.n - shopee.feito) + ' Shopee Vídeo' + (shopee.n - shopee.feito > 1 ? 's' : '') + '</h3><div class="actions"><button class="btn" data-facasec="shopee">Ver os produtos de hoje</button></div></article>';
  if (meta && meta.feitos < meta.total) return '<article class="card faca"><div class="meta"><span class="tag">✨ Faça agora</span></div><h3 class="title">Falta pouco para a meta!</h3><p class="how">Veja nas bolinhas o que falta.</p></article>';
  return '<article class="card faca"><div class="meta"><span class="tag">✨ Tudo feito</span></div><h3 class="title">Meta de hoje batida! 🎉</h3><p class="how">Quer um bônus? Toque no + e crie um conteúdo.</p></article>';
}
function abrirSecao(id){ state.secoes = state.secoes || {}; state.secoes[id] = true; save(); renderHoje(); setTimeout(() => { const d = document.querySelector('[data-sec="' + id + '"]'); if (d) d.scrollIntoView({behavior: "smooth", block: "start"}); }, 60); }

// ---------- ferramentas do botão + que aparecem no topo da tela Hoje ----------
let hojeFerr = null;
function ferrPainel(){
  if (!hojeFerr) return "";
  const t = {extra: ["✅", "Postei algo"], conversor: ["🔗", "Converter link"], respostas: ["💬", "Respostas prontas"]}[hojeFerr];
  const corpo = hojeFerr === "extra" ? extrasCard() : hojeFerr === "conversor" ? conversorCard() : respostasCard();
  return '<article class="card ferr"><div class="meta"><span class="tag casa">' + t[0] + ' ' + t[1] + '</span><button class="btn mini" data-ferrfechar="1" style="margin-left:auto">✕ Fechar</button></div>' + corpo + '</article>';
}

// ---------- botão + ----------
function maisAbrir(on){ $("maisMenu").hidden = !on; $("maisVeu").hidden = !on; const b = document.querySelector("[data-mais]"); if (b) b.setAttribute("aria-expanded", on); }
document.addEventListener("click", e => {
  const q = s => e.target.closest(s);
  if (q("[data-mais]")) { maisAbrir($("maisMenu").hidden); return; }
  if (q("#maisVeu")) { maisAbrir(false); return; }
  const ir = q("[data-maisir]");
  if (ir) {
    maisAbrir(false);
    const v = ir.dataset.maisir;
    if (v === "criar") { show("criar"); return; }
    if (v === "ideia") { state.blocoPasta = "ideias"; save(); blocoAberta = "nova"; show("bloco"); setTimeout(() => { const t = $("bT"); if (t) t.focus(); }, 120); return; }
    hojeFerr = v; cur = todayKey; show("hoje"); return;
  }
  if (q("[data-ferrfechar]")) { hojeFerr = null; renderHoje(); return; }
  const fv = q("[data-facaver]");
  if (fv) { abrirSecao("tiktok"); setTimeout(() => { const c = document.querySelector('#cards [data-i="' + fv.dataset.facaver + '"]'); if (c) { c.classList.add("aberto"); c.scrollIntoView({behavior: "smooth", block: "center"}); } }, 140); return; }
  const fs = q("[data-facasec]"); if (fs) { abrirSecao(fs.dataset.facasec); return; }
  const st = q("[data-subtab]"); if (st) { show(st.dataset.subtab); return; }
});

// ---------- menu de baixo: grupos de abas ----------
const GRUPO = {hoje: "hoje", criar: "criar", prontos: "criar", crescer: "crescer", parcerias: "crescer", curso: "crescer", bloco: "bloco"};
const SUBTABS = {
  criar: [["criar", "✨ Criar novo"], ["prontos", "🖼️ Prontos"]],
  crescer: [["crescer", "📈 Números"], ["parcerias", "🤝 Parcerias"], ["curso", "🎓 Curso"]]
};
function poeSubtabs(){
  Object.keys(SUBTABS).forEach(g => SUBTABS[g].forEach(([tab]) => {
    const sec = $("tab-" + tab); if (!sec || sec.querySelector(".subtabs")) return;
    const div = document.createElement("div"); div.className = "subtabs";
    div.innerHTML = SUBTABS[g].map(([t, nome]) => '<button type="button" data-subtab="' + t + '" aria-pressed="' + (t === tab) + '">' + nome + '</button>').join("");
    const head = sec.querySelector("header"); if (head) head.after(div); else sec.prepend(div);
  }));
}
function renderCrescer(){
  $("crescerBox").innerHTML = relatorioCard() + '<h2>📊 Minha semana</h2>' + semanaCard();
}
const show26 = show;
show = function(t){
  show26(t);
  if (t === "crescer") renderCrescer();
  const g = GRUPO[t];
  document.querySelectorAll("nav.tabs button[data-tab]").forEach(b => b.setAttribute("aria-selected", !!g && b.dataset.tab === g));
  try { sessionStorage.setItem("daia-tab", t); } catch(_) {}
};

// ---------- Ajustes: avisos no celular (ntfy) + o que antes ficava nas Ferramentas ----------
const renderAjustes26 = renderAjustes;
renderAjustes = function(){
  renderAjustes26();
  const bt = (attrs, em, t, s) => '<button type="button" class="aj-bt" ' + attrs + '><span>' + em + '</span><div><b>' + t + '</b><small>' + s + '</small></div></button>';
  $("ajBox").insertAdjacentHTML("afterbegin", bt('data-pagina="avisos"', '🔔', 'Avisos no celular', 'hora de postar, vídeo que bombou, ofertas prontas'));
};
function paginaAvisos(){
  const t = conteudo().lembretes || "daledaia-3a257998-7c24";
  return '<article class="card"><div class="meta"><span class="tag casa">Como ligar (1 vez só)</span></div><ol class="script">' +
    '<li>Instale o app grátis <b>ntfy</b> (não precisa de conta).</li><li>Abra o ntfy, toque no <b>+</b> e cole o seu canal: <b class="sel">' + esc(t) + '</b></li><li>Pronto. O celular apita sozinho, mesmo com o app fechado.</li></ol>' +
    '<div class="actions"><a class="btn wine" style="text-decoration:none" href="https://play.google.com/store/apps/details?id=io.heckel.ntfy" target="_blank" rel="noopener">Baixar o ntfy</a><button class="btn" data-avcopy="' + esc(t) + '">Copiar meu canal</button></div></article>' +
    '<article class="card"><div class="meta"><span class="tag trend">O que vai apitar</span></div><ul class="script">' +
    '<li>⏰ <b>Hora de postar</b>: 12h, 18h30 e 21h (robô do Google, grátis).</li>' +
    '<li>🔥 <b>Vídeo que bombou</b>, 💡 <b>influenciadoras novas</b> e 🛒 <b>ofertas prontas</b>: às 8h30, com o que o robô da meia-noite achou.</li></ul>' +
    '<p class="why">Nenhum aviso gasta o seu Claude a mais: vêm dos robôs que já rodam.</p></article>';
}
const renderPagina27 = renderPagina;
renderPagina = function(){
  if (paginaAtual !== "avisos") return renderPagina27();
  $("pagTit").innerHTML = 'Avisos no <em>celular</em>'; $("pagSub").textContent = "O celular apita na hora certa, mesmo com o app fechado.";
  $("pagBox").innerHTML = paginaAvisos();
};
document.addEventListener("click", e => { const c = e.target.closest("[data-avcopy]"); if (c) copyText(c.dataset.avcopy); });

// ---------- começa ----------
poeSubtabs();
try { const t0 = sessionStorage.getItem("daia-tab") || "hoje"; show(GRUPO[t0] || ["pagina", "ajustes", "ia", "produtos", "ideias"].indexOf(t0) >= 0 ? t0 : "hoje"); } catch(_) { show("hoje"); }
