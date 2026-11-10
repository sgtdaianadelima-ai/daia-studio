// Daia Studio v26 — Bloco de notas, frases editáveis, links úteis, TikTok Shop, regras e ofertas do grupo.
// Usa as funções do app.js: $, esc, state, save, toast, copyText, conteudo, ROBO, show, abrirLink, todayKey.

// ---------- BLOCO DE NOTAS ----------
// Fica no celular e uma cópia vai para a planilha (aba "App - Notas"), então não se perde.
const PASTAS = [
  ["ideias", "💡", "Ideias rápidas"], ["frases", "💬", "Frases prontas"], ["links", "🔗", "Links úteis"],
  ["videos", "🎬", "Links dos vídeos"], ["curso", "📚", "Do curso"], ["geral", "🗒️", "Geral"]
];
const pastaDe = id => PASTAS.find(p => p[0] === id) || PASTAS[5];
const novoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const SEED_FRASES = [
  ["TikTok: pediu o link (comentário)", "Oi, {nome}! 🤍 Copia esse texto e cola no seu WhatsApp (pode mandar pra você mesma) que o link fica clicável: {link}"],
  ["TikTok: garotas apoiam garotas", "Te apoiei! 🤍 Me apoia também?"],
  ["TikTok: garotas apoiam garotas (2)", "Apoiada, amiga! Me segue de volta? 🫶"],
  ["TikTok: garotas apoiam garotas (3)", "Seguindo! Bora crescer juntas? 🤍✨"],
  ["TikTok: garotas apoiam garotas (4)", "Já te segui, linda! Me apoia também 💕"],
  ["Instagram: resposta no comentário", "Te mandei no direct! 🤍 Se não chegar, olha em “Solicitações de mensagem”."],
  ["Instagram: direct com o link", "Oi! 🤍 Aqui está o link:\n{link}\n\nE no meu grupo VIP tem oferta todo dia: {vip}"],
  ["WhatsApp: convite para o grupo", "Entra no meu grupo VIP 🤍 Todo dia tem achadinho de casa com desconto: {vip}"],
  ["Chamada discreta (story)", "Encontrei no grupo VIP 🤍 link no destaque"],
  ["Perguntou o preço", "O preço muda toda hora e às vezes tem cupom 🤍 Confere no link: lá aparece o valor de agora!"],
  ["É confiável?", "É sim 🤍 A compra é pela própria Shopee: se não chegar ou vier errado, você pede o dinheiro de volta pelo app."],
  ["Comprou e agradeceu", "Ahh que bom! 🤍 Depois me conta o que achou. Se puder, me marca no story!"]
];
const SEED_LINKS = [
  ["Shopee", "Painel de afiliados (comissões e links): https://affiliate.shopee.com.br\nCentro de Criação · Shopee Vídeo (vendas por vídeo e por produto): https://creator.shopee.com.br\nMinha vitrine: https://collshp.com/daledaia?view=storefront\nCupons para divulgar: https://s.shopee.com.br/50ZwF95lgK\nRegras de originalidade da Shopee Vídeo: https://help.shopee.com.br/portal/10/article/224501\nNíveis de criador (nível 0, 1 e 2): https://help.shopee.com.br/portal/10/article/224365\n\nNo app da Shopee: Eu › Criadores e afiliados › Central do Criador (nível e Saúde do vídeo)."],
  ["TikTok", "TikTok Studio (métricas): https://www.tiktok.com/tiktokstudio\nDiretrizes da comunidade: https://www.tiktok.com/community-guidelines/pt\n@daledaia: https://www.tiktok.com/@daledaia\n@daiana.lima95: https://www.tiktok.com/@daiana.lima95\n\nNo app: pesquise “Creator Search Insights” para ver o que suas seguidoras procuram.\nTikTok Shop (ativo): TikTok Studio › Monetização › TikTok Shop para Criadores."],
  ["Instagram", "@daledaia: https://www.instagram.com/daledaia/\nDiretrizes da comunidade: https://help.instagram.com/477434105621119\nMeta Business Suite (agendar posts): https://business.facebook.com\n\nNo app: Painel profissional › Insights."],
  ["Meus links", "Página de links (bio): https://daledaia.github.io\nGrupo VIP: https://chat.whatsapp.com/E6jfFnVCMfN9Byt4p1nEtm\nMagalu: https://www.magazinevoce.com.br/magazinedaledaia/\nNatura: https://www.natura.com.br/consultoria/daledaia\nMercado Livre: https://www.mercadolivre.com.br/social/gustavomachadodeassis\nApp Daia Studio: https://sgtdaianadelima-ai.github.io/daia-studio/"]
];
const BL = () => {
  const b = state.bloco = state.bloco || {notas: [], v: 0};
  if (!b.semente) {
    const agora = Date.now();
    SEED_FRASES.forEach(f => b.notas.push({id: novoId(), pasta: "frases", t: f[0], txt: f[1], upd: agora}));
    SEED_LINKS.forEach(f => b.notas.push({id: novoId(), pasta: "links", t: f[0], txt: f[1], fix: f[0] === "Meus links", upd: agora}));
    b.semente = 1; b.v = agora; save();
  }
  return b;
};
// pega a versão da planilha se ela for mais nova (ex.: celular trocado ou app reinstalado)
function blocoDaNuvem(){
  const n = conteudo().notas, b = BL();
  if (n && Array.isArray(n.notas) && Number(n.v) > Number(b.v || 0) && !b.sujo) { b.notas = n.notas; b.v = n.v; b.semente = 1; save(); }
}
let blocoT = null;
function blocoMudou(){
  const b = BL(); b.v = Date.now(); b.sujo = 1; save();
  clearTimeout(blocoT);
  blocoT = setTimeout(async () => {
    try {
      const r = await (await fetch(ROBO, {method: "POST", headers: {"Content-Type": "text/plain;charset=utf-8"}, body: JSON.stringify({acao: "notas", notas: JSON.stringify({v: b.v, notas: b.notas})})})).json();
      if (r && r.ok) { b.sujo = 0; save(); }
    } catch(_) {}
  }, 2500);
}
window.blocoNovo = function(pasta, t, txt){ const b = BL(); b.notas.unshift({id: novoId(), pasta, t, txt, upd: Date.now()}); blocoMudou(); };
const linkify = s => esc(s).replace(/https?:\/\/[^\s<]+/g, u => '<a href="' + u + '" target="_blank" rel="noopener">' + u + '</a>').replace(/\n/g, "<br>");
const preencher = t => String(t).replace(/\{vip\}/g, LINK_VIP).replace(/\{link\}/g, state.ultimoLink || LINK_PAGINA).replace(/\{nome\}/g, "amiga");
let blocoAberta = null, blocoApagar = null;
function renderBloco(){
  blocoDaNuvem();
  const b = BL(), f = state.blocoPasta || "todas", busca = (state.blocoBusca || "").toLowerCase();
  const lista = b.notas.filter(n => (f === "todas" || n.pasta === f) && (!busca || (n.t + " " + n.txt).toLowerCase().indexOf(busca) >= 0))
    .sort((x, y) => (y.fix ? 1 : 0) - (x.fix ? 1 : 0) || (y.upd || 0) - (x.upd || 0));
  const chip = (v, t) => '<button type="button" class="chip" data-bpasta="' + v + '" aria-pressed="' + (f === v) + '">' + t + '</button>';
  const conta = id => b.notas.filter(n => n.pasta === id).length;
  $("blocoBox").innerHTML =
    '<div class="chips bl-pastas">' + chip("todas", "Tudo · " + b.notas.length) + PASTAS.map(p => chip(p[0], p[1] + " " + p[2] + " · " + conta(p[0]))).join("") + '</div>' +
    '<div class="field"><input class="input" id="bBusca" placeholder="🔎 Procurar nas notas" value="' + esc(state.blocoBusca || "") + '"></div>' +
    '<div class="actions"><button class="btn wine full" data-bnova="1">+ Nova nota' + (f !== "todas" ? " em " + esc(pastaDe(f)[2]) : "") + '</button></div>' +
    (blocoAberta === "nova" ? editorNota({id: "nova", pasta: f === "todas" ? "ideias" : f, t: "", txt: ""}) : "") +
    '<div class="list bl-lista">' + (lista.length ? lista.map(n => blocoAberta === n.id ? editorNota(n) : cartaoNota(n)).join("") : '<p class="note">Nada aqui ainda.</p>') + '</div>' +
    '<p class="note">☁️ Suas notas ficam no celular e uma cópia vai para a planilha' + (b.sujo ? ' (enviando…)' : ' ✓') + '.</p>';
}
function cartaoNota(n){
  const p = pastaDe(n.pasta), frase = n.pasta === "frases";
  return '<article class="card bl-nota' + (n.fix ? " fix" : "") + '"><div class="meta"><span class="tag">' + p[1] + ' ' + esc(p[2]) + '</span>' + (n.fix ? '<span class="why">📌 fixada</span>' : '') + '</div>' +
    (n.t ? '<h3 class="title">' + esc(n.t) + '</h3>' : '') + '<p class="how bl-txt">' + linkify(frase ? preencher(n.txt) : n.txt) + '</p>' +
    '<div class="actions"><button class="btn main" data-bcopy="' + n.id + '">📋 Copiar</button><button class="btn" data-bedit="' + n.id + '">✏️ Editar</button></div></article>';
}
function editorNota(n){
  const nova = n.id === "nova";
  return '<article class="card bl-ed" data-bed="' + n.id + '"><div class="field"><label>Pasta</label><div class="chips">' + PASTAS.map(p => '<button type="button" class="chip" data-bedpasta="' + p[0] + '" aria-pressed="' + (n.pasta === p[0]) + '">' + p[1] + ' ' + p[2] + '</button>').join("") + '</div></div>' +
    '<div class="field"><label for="bT">Título</label><input class="input" id="bT" value="' + esc(n.t) + '" placeholder="Ex.: ideia do tapete, aula de ganchos…"></div>' +
    '<div class="field"><label for="bTxt">Texto</label><textarea class="input" id="bTxt" rows="7">' + esc(n.txt) + '</textarea></div>' +
    (n.pasta === "frases" ? '<p class="why">Use {link} para o último link convertido, {vip} para o grupo e {nome} para trocar pelo nome.</p>' : '') +
    '<div class="actions"><button class="btn wine" data-bsalvar="' + n.id + '">💾 Salvar</button><button class="btn" data-busar="1">📋 Copiar sem salvar</button>' +
    (nova ? '' : '<button class="btn" data-bfix="' + n.id + '">' + (n.fix ? "Desafixar" : "📌 Fixar") + '</button>') +
    '<button class="btn" data-bfechar="1">Fechar</button>' +
    (nova ? '' : blocoApagar === n.id ? '<button class="btn" style="color:var(--wine)" data-bapagar="' + n.id + '">Toque de novo para apagar</button>' : '<button class="btn" data-bapagar="' + n.id + '">🗑️ Apagar</button>') + '</div></article>';
}
document.addEventListener("click", e => {
  if (!e.target.closest("#blocoBox")) return;
  const b = BL(), q = s => e.target.closest(s);
  const edPasta = () => { const ed = document.querySelector(".bl-ed .chip[aria-pressed=true]"); return ed ? ed.dataset.bedpasta : "ideias"; };
  if (q("[data-bpasta]")) { state.blocoPasta = q("[data-bpasta]").dataset.bpasta; blocoAberta = null; save(); renderBloco(); return; }
  if (q("[data-bnova]")) { blocoAberta = "nova"; blocoApagar = null; renderBloco(); setTimeout(() => $("bT") && $("bT").focus(), 50); return; }
  if (q("[data-bedpasta]")) { const c = q("[data-bedpasta]"); c.parentNode.querySelectorAll(".chip").forEach(x => x.setAttribute("aria-pressed", x === c)); return; }
  if (q("[data-bcopy]")) { const n = b.notas.find(x => x.id === q("[data-bcopy]").dataset.bcopy); if (n) copyText(n.pasta === "frases" ? preencher(n.txt) : n.txt); return; }
  if (q("[data-bedit]")) { blocoAberta = q("[data-bedit]").dataset.bedit; blocoApagar = null; renderBloco(); return; }
  if (q("[data-bfechar]")) { blocoAberta = null; renderBloco(); return; }
  if (q("[data-busar]")) { copyText(preencher($("bTxt").value)); return; }
  if (q("[data-bsalvar]")) {
    const id = q("[data-bsalvar]").dataset.bsalvar, t = $("bT").value.trim(), txt = $("bTxt").value;
    if (!t && !txt.trim()) { toast("Escreva alguma coisa."); return; }
    if (id === "nova") b.notas.unshift({id: novoId(), pasta: edPasta(), t, txt, upd: Date.now()});
    else { const n = b.notas.find(x => x.id === id); if (n) { n.t = t; n.txt = txt; n.pasta = edPasta(); n.upd = Date.now(); } }
    blocoAberta = null; blocoMudou(); renderBloco(); toast("Salvo 🤍"); return;
  }
  if (q("[data-bfix]")) { const n = b.notas.find(x => x.id === q("[data-bfix]").dataset.bfix); if (n) { n.fix = !n.fix; blocoMudou(); renderBloco(); } return; }
  if (q("[data-bapagar]")) { const id = q("[data-bapagar]").dataset.bapagar; if (blocoApagar !== id) { blocoApagar = id; renderBloco(); return; }
    b.notas = b.notas.filter(x => x.id !== id); blocoApagar = null; blocoAberta = null; blocoMudou(); renderBloco(); toast("Apagada."); }
});
document.addEventListener("input", e => { if (e.target.id !== "bBusca") return; state.blocoBusca = e.target.value; save(); clearTimeout(renderBloco.t); renderBloco.t = setTimeout(() => { renderBloco(); const i = $("bBusca"); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 400); });

// ---------- PÁGINAS DOS AJUSTES: TikTok Shop, Regras e níveis, Ofertas do grupo ----------
let paginaAtual = "tiktokshop";
function abrirPagina(p){ paginaAtual = p; show("pagina"); }
function renderPagina(){
  const P = {tiktokshop: [paginaTTS, "TikTok", "Shop", "Ativo! Até 10 vídeos por dia até os 2 mil. Depois, rumo aos 10 mil."],
    regras: [paginaRegras, "Regras", "e níveis", "Diretrizes da Shopee Vídeo, TikTok e Instagram, níveis e a limpa."],
    ofertas: [paginaOfertas, "Ofertas", "do grupo", "Ofertas com o seu link, prontas para mandar no grupo VIP."]}[paginaAtual] || [paginaTTS, "", "", ""];
  $("pagTit").innerHTML = esc(P[1]) + ' <em>' + esc(P[2]) + '</em>'; $("pagSub").textContent = P[3];
  $("pagBox").innerHTML = P[0]();
}
const ck = (id, txt) => { const on = !!(state.cks && state.cks[id]); return '<label class="ck"><input type="checkbox" data-ck="' + id + '"' + (on ? " checked" : "") + '><span>' + txt + '</span></label>'; };
document.addEventListener("change", e => { const c = e.target.closest("[data-ck]"); if (!c) return; state.cks = state.cks || {}; state.cks[c.dataset.ck] = c.checked; save(); });
function seguidoresDe(conta){ const s = (conteudo().seguidores || []).filter(x => String(x.conta).toLowerCase().indexOf(conta) >= 0); return s.length ? Number(String(s[s.length - 1].n).replace(/\D/g, "")) || 0 : 0; }

// --- TikTok Shop ---
const FORMATOS_10 = [
  ["POV", "POV: você achou {p} e sua casa nunca mais foi a mesma (texto na tela + som em alta, 7 s)"],
  ["Mãos mostrando", "Só as mãos abrindo e usando {p}, bem de perto, sem falar (10 s)"],
  ["Antes e depois", "A bagunça antes → {p} resolvendo → o depois limpinho (12 s)"],
  ["Storytelling", "“Eu vivia com esse problema até achar {p}…” contando como uma amiga (20 s)"],
  ["Unboxing", "Abrindo a caixa de {p}, primeira impressão sincera (15 s)"],
  ["3 motivos", "3 motivos para ter {p} em casa, um por cena (15 s)"],
  ["No ambiente", "{p} no lugar onde ele é usado de verdade, com luz bonita (8 s)"],
  ["Erro comum", "“Para de fazer isso…” mostrando o erro e {p} como solução (12 s)"],
  ["Resposta a comentário", "Respondendo um comentário de dúvida sobre {p} (15 s)"],
  ["ASMR / detalhe", "Sons e detalhes de {p}: abrir, encaixar, fechar (10 s)"]
];
function paginaTTS(){
  const seg = seguidoresDe("daledaia"), alvo = seg < 2000 ? 2000 : 10000, falta = Math.max(0, alvo - seg), pct = Math.min(100, Math.round(seg / alvo * 100));
  const tts = state.tts = state.tts || {produtos: []};
  const prods = tts.produtos;
  return '<article class="card"><div class="meta"><span class="tag serie">✅ TikTok Shop ativo</span><span class="why">@daledaia</span></div>' +
      '<h3 class="title">' + seg.toLocaleString("pt-BR") + ' de ' + alvo.toLocaleString("pt-BR") + ' seguidores</h3><div class="barra"><span style="width:' + pct + '%"></span></div>' +
      '<p class="how">' + (alvo === 2000 ? "Faltam " + falta.toLocaleString("pt-BR") + " para os 2 mil. Até lá, o TikTok Shop deixa postar <b>10 vídeos por dia</b>. Depois dos 2 mil, a meta é <b>10 mil</b>." : falta ? "Passou dos 2 mil: já pode postar mais de 10 por dia. Faltam " + falta.toLocaleString("pt-BR") + " para os 10 mil." : "Chegou nos 10 mil! 🎉") + '</p></article>' +
    '<details class="secao"><summary><span class="sec-emoji">⚠️</span><span class="sec-txt"><b>Conta em dia</b><small>o que conferir no TikTok Shop</small></span><span class="sec-seta"></span></summary><div class="sec-corpo"><article class="card">' +
      ck("tts1", "Nunca comprar seguidor (reprova na verificação do TikTok Shop)") + ck("tts3", "Postei vídeo nos últimos 180 dias e tenho 18 anos ou mais") + ck("tts4", "Fiz a verificação de identidade e os dados fiscais (TikTok Studio › TikTok Shop para Criadores)") + ck("tts5", "Pus a chave Pix em Receita (pagamento toda quarta)") +
      '<p class="how">Integridade da conta começa com 200 pontos: confira sempre e use a pré-verificação antes de postar.</p></article></div></details>' +
    '<details class="secao"><summary><span class="sec-emoji">⛏️</span><span class="sec-txt"><b>Minerar produto</b><small>a peneira antes de pedir amostra</small></span><span class="sec-seta"></span></summary><div class="sec-corpo"><article class="card">' +
      '<p class="how">Responda e o app diz se vale:</p>' +
      '<div class="mina"><label>Nota <input class="input" id="mNota" inputmode="decimal" placeholder="4.7"></label><label>% positivas <input class="input" id="mPos" inputmode="numeric" placeholder="92"></label>' +
      '<label>Estoque <input class="input" id="mEst" inputmode="numeric" placeholder="800"></label><label>Comissão % <input class="input" id="mCom" inputmode="decimal" placeholder="12"></label><label>Valor R$ <input class="input" id="mVal" inputmode="decimal" placeholder="29"></label></div>' +
      '<div class="actions"><button class="btn wine" data-minerar="1">Vale a pena?</button></div><div id="mRes"></div>' +
      '<ul class="script"><li>Nota acima de 4,6 e mais de 90% de avaliações boas (para você não se queimar).</li><li>Estoque de 500 a 1.000 ou mais.</li><li>Comissão de 10% para cima. Compare vendedores do mesmo item e pegue a maior.</li><li>Para começar: ticket baixo (R$ 15 a 30), serve para todo mundo, e já tem vídeo viralizando dele no TikTok.</li><li>Do nicho casa e com a sua cara minimalista. Nada de marca famosa.</li></ul></article></div></details>' +
    '<details class="secao"><summary><span class="sec-emoji">📦</span><span class="sec-txt"><b>Amostras</b><small>onde pedir e o que fazer quando chega</small></span><span class="sec-seta"></span></summary><div class="sec-corpo"><article class="card">' +
      '<p class="how"><b>Amostra grátis:</b> Mercado de Produtos › filtro “Amostra grátis” (prefira vendedor com alta aprovação). Até 5 por vez. Acompanhe em Gerenciar amostras.<br><b>Reembolsável:</b> você compra e recebe o dinheiro de volta se bater a meta de vendas no prazo (ex.: 1 venda em 60 dias).<br><b>Convites de colaboração:</b> Central do criador › Convites. Peça amostra pelo convite (não gasta sua cota). Nunca “Adicionar tudo”.<br><b>Regra:</b> chegou, gravou. Sem amostra? Use o que você já tem em casa: procure no Mercado de Produtos e adicione na vitrine.</p></article>' +
      '<article class="card"><div class="meta"><span class="tag casa">Meus produtos para gravar</span><span class="why">10 vídeos de cada</span></div>' +
      '<div class="field"><input class="input" id="tProd" placeholder="Nome do produto (amostra ou de casa)"></div><div class="actions"><button class="btn wine" data-tadd="1">+ Adicionar</button></div>' +
      (prods.length ? prods.map((p, i) => '<div class="tts-prod"><div><b>' + esc(p.n) + '</b><small>' + (p.feitos || 0) + ' de 10 gravados · ' + esc(p.st || "em casa") + '</small><div class="bolas">' +
        Array.from({length: 10}, (_, k) => '<button type="button" class="bola' + (k < (p.feitos || 0) ? " on" : "") + '" data-tbola="' + i + ':' + (k + 1) + '" aria-label="' + (k + 1) + ' gravados"></button>').join("") + '</div></div>' +
        '<div class="actions"><button class="btn mini" data-tst="' + i + '">' + ({"pedida": "📦 Chegou", "chegou": "🏠 Em casa"}[p.st] || "📮 Pedida") + '</button><button class="btn mini" data-t10="' + i + '">🎬 10 vídeos</button><button class="btn mini" data-tdel="' + i + '" aria-label="Tirar">✕</button></div>' +
        (tts.aberto === i ? '<ol class="script">' + FORMATOS_10.map(f => '<li><b>' + f[0] + ':</b> ' + esc(f[1].replace(/\{p\}/g, p.n)) + '</li>').join("") + '</ol><div class="actions"><button class="btn wine mini" data-tcriar="' + i + '">✨ Roteiros completos no Criar</button></div>' : '') + '</div>').join("") : '<p class="note">Adicione os produtos que chegaram ou que você tem em casa.</p>') + '</article></div></details>' +
    '<details class="secao"><summary><span class="sec-emoji">⏱️</span><span class="sec-txt"><b>Estratégia 60x60</b><small>60 vídeos em 60 minutos</small></span><span class="sec-seta"></span></summary><div class="sec-corpo"><article class="card">' +
      '<p class="how">Escolha <b>6 produtos</b> e grave <b>10 vídeos curtos de cada</b> (7 a 25 s), um atrás do outro. Grave e salve no <b>rascunho</b> do TikTok, sem editar. Depois é só pôr som, legenda e produto e soltar ao longo do dia.</p>' +
      '<ul class="script"><li>Repita os produtos que já venderam: grave mais 10 deles.</li><li>Grave cada produto no ambiente dele (xícara na cozinha, lençol na cama).</li><li>Varie: POV, mãos, falando, antes e depois (use “🎬 10 vídeos” acima).</li><li>Não poste os 10 de uma vez: espace (ex.: 8h, 10h, 12h, 14h, 16h, 18h, 19h, 20h, 21h, 22h).</li><li>Nunca apague vídeo que foi mal: ele pode voltar a ser entregue semanas depois.</li></ul>' +
      '<div class="semana"><div><b>Seg</b><span>🎥 grava 60</span></div><div><b>Ter</b><span>10 posts</span></div><div><b>Qua</b><span>10 posts</span></div><div><b>Qui</b><span>🎥 grava 60</span></div><div><b>Sex</b><span>10 posts</span></div><div><b>Sáb</b><span>10 posts</span></div><div><b>Dom</b><span>10 posts</span></div></div>' +
      '<p class="why">Nos dias de gravar você também posta 10 do rascunho. 2 horas por semana gravando = 70 vídeos.</p></article></div></details>';
}
document.addEventListener("click", e => {
  if (!e.target.closest("#pagBox")) return;
  const tts = state.tts = state.tts || {produtos: []}, q = s => e.target.closest(s);
  if (q("[data-minerar]")) {
    const n = v => Number(String($(v).value).replace(",", ".")) || 0;
    const nota = n("mNota"), pos = n("mPos"), est = n("mEst"), com = n("mCom"), val = n("mVal");
    const it = [[nota >= 4.6, "Nota " + (nota || "?") + (nota >= 4.6 ? " ✓" : " (precisa 4,6+)")], [pos >= 90, (pos || "?") + "% positivas" + (pos >= 90 ? " ✓" : " (precisa 90%+)")],
      [est >= 500, "Estoque " + (est || "?") + (est >= 500 ? " ✓" : " (precisa 500+)")], [com >= 10, "Comissão " + (com || "?") + "%" + (com >= 10 ? " ✓" : " (precisa 10%+)")], [!val || val <= 150, val ? "Valor R$ " + val + (val <= 150 ? " ✓" : " (acima de R$ 150 vende menos)") : "Valor: não informado"]];
    const ok = it.filter(x => x[0]).length;
    $("mRes").innerHTML = '<p class="how"><b>' + (ok === 5 ? "✅ Vale pedir!" : ok >= 4 ? "🤔 Quase. Veja o que falta:" : "🙅 Melhor procurar outro.") + '</b><br>' + it.map(x => (x[0] ? "✅ " : "❌ ") + esc(x[1])).join("<br>") + '</p>'; return;
  }
  if (q("[data-tadd]")) { const v = $("tProd").value.trim(); if (!v) return; tts.produtos.unshift({n: v, feitos: 0, st: "em casa"}); save(); renderPagina(); return; }
  const idx = s => Number(q(s).getAttribute(s.slice(1, -1)));
  if (q("[data-tbola]")) { const [i, k] = q("[data-tbola]").dataset.tbola.split(":").map(Number); const p = tts.produtos[i]; p.feitos = p.feitos === k ? k - 1 : k; save(); renderPagina(); return; }
  if (q("[data-tst]")) { const p = tts.produtos[idx("[data-tst]")]; p.st = {"em casa": "pedida", "pedida": "chegou", "chegou": "em casa"}[p.st || "em casa"]; save(); renderPagina(); return; }
  if (q("[data-t10]")) { const i = idx("[data-t10]"); tts.aberto = tts.aberto === i ? null : i; save(); renderPagina(); return; }
  if (q("[data-tdel]")) { tts.produtos.splice(idx("[data-tdel]"), 1); tts.aberto = null; save(); renderPagina(); return; }
  if (q("[data-tcriar]")) { const p = tts.produtos[idx("[data-tcriar]")]; const c = CR(); c.modo = "produto"; c.objetivo = "vender"; c.loja = "TikTok Shop"; c.lojaEscolhida = true; c.redes = ["TikTok @daledaia"]; c.formato = "Reels / vídeo"; c.texto = p.n; c.atual = null; save(); show("criar"); return; }
  const of = q("[data-ofcopy]"); if (of) { copyText(OFS[Number(of.dataset.ofcopy)]); return; }
  const ow = q("[data-ofzap]"); if (ow) { abrirLink("https://wa.me/?text=" + encodeURIComponent(OFS[Number(ow.dataset.ofzap)])); return; }
});

// --- Regras e níveis ---
function paginaRegras(){
  return '<details class="secao" open><summary><span class="sec-emoji">🏅</span><span class="sec-txt"><b>Níveis da Shopee Vídeo</b><small>atualiza toda terça, olhando as últimas 4 semanas</small></span><span class="sec-seta"></span></summary><div class="sec-corpo"><article class="card">' +
      '<div class="niveis"><div><b>Nível 0</b><small>todo mundo começa aqui · comissão base 1,5% · 30 produtos na live</small></div>' +
      '<div><b>Nível 1</b><small>5+ dias ativos · 100+ pedidos · conteúdo aprovado · 70 produtos · comissão base sobe (aluna foi para 3%)</small></div>' +
      '<div><b>Nível 2</b><small>12+ dias ativos · 300+ pedidos · 20+ produtos com conteúdo · aprovado · selo dourado e mais views</small></div></div>' +
      '<p class="how"><b>Dia ativo</b> = postar pelo menos 1 vídeo com <b>mais de 10 segundos</b> (vídeo de 8 s não conta!).<br><b>6 pontos de penalidade</b> = volta para o nível 0 na hora. Com 15, pode ser bloqueada.</p>' +
      '<p class="how"><b>Seu caminho para o nível 2:</b></p>' + ck("n1", "Postar todo dia pelo menos 1 vídeo de 11 s ou mais (meta: 3)") + ck("n2", "Vídeos autorais (os mesmos do Instagram, editados para a Shopee)") + ck("n3", "Variar os produtos: 20 diferentes em 4 semanas") + ck("n4", "Conferir a Saúde do vídeo toda semana (Central do Criador)") + ck("n5", "Apelar quando o produto for igual e a Shopee marcar como irrelevante") +
      '<p class="why">Onde ver: app da Shopee › Eu › Live e vídeo › seu perfil › Central do Criador.</p></article></div></details>' +
    '<details class="secao"><summary><span class="sec-emoji">🛡️</span><span class="sec-txt"><b>Vídeos antigos da Shopee Vídeo</b><small>decidido: não apagar</small></span><span class="sec-seta"></span></summary><div class="sec-corpo"><article class="card">' +
      '<p class="how"><b>Decisão de 08/11:</b> não vamos apagar os vídeos antigos. Apagar chama a atenção do robô da Shopee e pode dar penalidade.</p>' +
      '<ul class="script"><li>Se chegar aviso de penalidade: veja o motivo em Central do Criador › Saúde do vídeo.</li><li>Produto igual ao do link? Toque em <b>Apelar</b> (1 a 3 dias).</li><li>Só apague se a própria Shopee mandar, ou se o vídeo ficou sem sacolinha por mais de 7 dias.</li><li>Foco agora: postar vídeos novos do seu nicho todo dia. Os novos empurram os antigos para baixo.</li></ul></article></div></details>' +
    '<details class="secao"><summary><span class="sec-emoji">🛍️</span><span class="sec-txt"><b>Shopee Vídeo: pode e não pode</b><small>diretrizes resumidas</small></span><span class="sec-seta"></span></summary><div class="sec-corpo"><article class="card"><ul class="script">' +
      '<li>✅ Vídeo seu, vertical 9:16, HD, em movimento (nunca foto parada em slide).</li><li>✅ Produto IGUAL ao do link (marca, cor e modelo). Mostre todas as cores (print das cores como figurinha).</li><li>✅ Pack só com edição: corte, inverta partes, troque a música, marca d’água, transição. Nunca o vídeo cru.</li><li>✅ Marque “Conteúdo gerado por IA” quando for de IA.</li><li>✅ Chamada “toca na sacolinha”. Responda os comentários.</li>' +
      '<li>❌ Citar TikTok, Instagram, Mercado Livre ou outras lojas.</li><li>❌ Marcas famosas/réplicas (Apple, Nike, Stanley, Dior…) e nome de marca na legenda.</li><li>❌ Criança (até na embalagem), animal, faca/faqueiro, arma, bebida, cigarro, política, conteúdo com duplo sentido.</li><li>❌ Promessa milagrosa e o mesmo vídeo repetido. Nada de troca de engajamento com outras afiliadas.</li><li>💡 O algoritmo demora 1 a 2 meses para entregar: poste Natal em outubro, Páscoa em fevereiro.</li><li>💡 Link de vídeo da Shopee só ganha se a pessoa comprar o produto do vídeo. No grupo, mande o link do produto (vale 7 dias para tudo).</li></ul></article></div></details>' +
    '<details class="secao"><summary><span class="sec-emoji">🎵</span><span class="sec-txt"><b>TikTok: pode e não pode</b><small>para crescer sem travar a conta</small></span><span class="sec-seta"></span></summary><div class="sec-corpo"><article class="card"><ul class="script">' +
      '<li>✅ Conteúdo autoral. Pack e vídeo de outra pessoa não entram no Para Você.</li><li>✅ Uma conta, um estilo (vídeo ou carrossel) e um nicho.</li><li>✅ Gancho forte nos 3 primeiros segundos, vídeos de 7 a 25 s, áudio em alta.</li><li>✅ Seguir e comentar devagar. Após uns 10 comentários iguais, troque uma palavra ou emoji. Se bloquear, pare 24 h.</li>' +
      '<li>❌ Comprar seguidores (reprova na verificação antitrapaça do TikTok Shop).</li><li>❌ Seguir dezenas de contas em poucos minutos.</li><li>❌ Link ou preço no vídeo, citar Shopee ou outras redes.</li><li>❌ Apagar vídeo que foi mal (ele pode viralizar depois).</li><li>💡 Filtre palavras nos comentários: Configurações › Privacidade › Comentários › Filtrar palavras (golpe, falso, PV, link).</li></ul></article></div></details>' +
    '<details class="secao"><summary><span class="sec-emoji">📸</span><span class="sec-txt"><b>Instagram: pode e não pode</b><small>para crescer sem bloqueio</small></span><span class="sec-seta"></span></summary><div class="sec-corpo"><article class="card"><ul class="script">' +
      '<li>✅ Fotos e vídeos seus ou de licença livre (Unsplash/Pexels). Nunca Pinterest.</li><li>✅ 2 h entre posts. Picos 8h, 12h e 18h. Story a cada 12 h.</li><li>✅ Responder comentário mandando o link no direct.</li><li>❌ Comprar seguidor, seguir/deixar de seguir em massa, apps que automatizam curtidas.</li><li>❌ Música sem licença em conta comercial (use a biblioteca do Instagram).</li><li>❌ Publicidade sem avisar: em parceria paga, marque “Parceria paga”.</li></ul></article></div></details>' +
    '<details class="secao"><summary><span class="sec-emoji">🧭</span><span class="sec-txt"><b>Estratégia do TikTok</b><small>só a @daledaia</small></span><span class="sec-seta"></span></summary><div class="sec-corpo"><article class="card">' +
      '<p class="how"><b>@daledaia (a conta do TikTok Shop):</b> é a única onde você posta agora. Até 10 vídeos por dia, espalhados no dia (veja “TikTok Shop · 10 por dia” na tela Hoje). Meta: <b>2 mil</b> (libera mais vídeos) e depois <b>10 mil</b>.</p>' +
      '<p class="how"><b>@daiana.lima95 (pessoal):</b> parada desde 10/11. Os vídeos bons de lá voltam na @daledaia com gancho novo (os “♻️ Reciclar”).</p></article></div></details>';
}

// --- Ofertas do grupo (as que o robô pega do grupo de referência, com o seu link) ---
let OFS = [];
function paginaOfertas(){
  OFS = [];
  const os = (conteudo().ofertas || []).slice().reverse();
  const topo = '<article class="card"><p class="how">O robô do computador lê as ofertas do grupo <b>Promoções do Dia #17</b> (só lê), troca pelo <b>seu link</b> e coloca aqui. Você confere e toca em <b>Mandar no grupo</b>: o WhatsApp abre com o texto pronto.</p>' +
    '<p class="meta-falta">Shopee, Magalu e Natura já trocam. Mercado Livre: me mande 1 link do ML já convertido com a sua tag para eu ver o formato.</p></article>';
  if (!os.length) return topo + '<p class="note">Ainda sem ofertas. Elas aparecem quando o robô do computador rodar (PC ligado e Chrome aberto).</p>';
  return topo + '<div class="list">' + os.map(o => {
    const txt = (o.txt || o.n || "") + (o.link ? "\n\n👉 " + o.link : ""); OFS.push(txt); const i = OFS.length - 1;
    return '<article class="card">' + (o.foto ? '<img src="' + esc(o.foto) + '" alt="" loading="lazy" class="of-foto">' : '') + '<div class="meta"><span class="tag casa">' + esc(o.loja || "Oferta") + '</span><span class="why">' + esc(o.data || "") + '</span></div>' +
      '<p class="how">' + linkify(txt) + '</p>' + (o.link ? '' : '<p class="meta-falta">Sem o seu link ainda (não mande assim).</p>') +
      '<div class="actions">' + (o.link ? '<button class="btn wine" data-ofzap="' + i + '">💬 Mandar no grupo</button>' : '') + '<button class="btn" data-ofcopy="' + i + '">📋 Copiar</button></div></article>';
  }).join("") + '</div>';
}

// ---------- PARCERIAS: quanto oferecer + mensagem editável antes de copiar ----------
const OPCOES_PARC = {
  permuta: ["🤝 Troca (permuta)", "Sem dinheiro: você divulga o meu grupo e eu divulgo o seu perfil no meu Instagram e no grupo VIP (1 story meu por 1 story seu)."],
  resultado: ["🎯 Por resultado", "Pago R$ 1 a cada pessoa que clicar no seu link (até R$ 50 no mês). O link é só seu e conta os cliques sozinho."],
  fixo: ["💵 Valor fixo", "R$ {valor} por uma sequência de 3 stories com o link do meu grupo, com a arte e o texto prontos que eu te mando."]
};
function faixaValor(seg){
  const n = Number(String(seg || "").toLowerCase().replace(/mil|k/, "000").replace(/\D/g, "")) || 0;
  if (n && n < 5000) return {v: "30", t: "até 5 mil seguidores: R$ 20 a 50 por sequência de stories, ou troca"};
  if (n && n < 15000) return {v: "80", t: "5 a 15 mil: R$ 50 a 120 por sequência de stories"};
  if (n) return {v: "150", t: "15 a 30 mil: R$ 100 a 250 por sequência de stories"};
  return {v: "50", t: "sem o número de seguidores: comece oferecendo R$ 50 ou troca"};
}
function valoresCard(){
  return '<details class="secao"><summary><span class="sec-emoji">💰</span><span class="sec-txt"><b>Quanto oferecer?</b><small>o que costuma funcionar com perfis pequenos</small></span><span class="sec-seta"></span></summary><div class="sec-corpo"><article class="card">' +
    '<div class="valores"><div><b>🤝 Troca (permuta)</b><small>Melhor para começar e para perfis até 5 mil. Você divulga ela, ela divulga você. Custa R$ 0.</small></div>' +
    '<div><b>🎯 Por resultado</b><small>R$ 0,50 a R$ 1 por clique no link dela, com teto no mês. Você só paga se funcionar. Bom quando ela tem dúvida do retorno.</small></div>' +
    '<div><b>💵 Valor fixo (sequência de 3 stories)</b><small>Até 5 mil seguidores: R$ 20 a 50 · 5 a 15 mil: R$ 50 a 120 · 15 a 30 mil: R$ 100 a 250. Reels custa 2 a 3 vezes mais que stories.</small></div></div>' +
    '<p class="how"><b>Dicas:</b> peça os prints de alcance dos últimos stories antes de pagar. Comece com 1 teste. Pague metade antes e metade depois. Engajamento vale mais que número de seguidores. Peça para ela marcar “parceria paga”.</p>' +
    '<p class="why">Valores de referência de agências e guias de influência para micro e nano influenciadoras (não há tabela oficial). Guias citam R$ 300 a 1.500 por story para micro (10 a 100 mil); para perfis bem pequenos o comum é bem menos ou troca.</p></article></div></details>';
}
let parcEd = null; // {id, tipo: "msg1"|"prop", op}
function parceriaCard(p){
  const st = parcStatus(p), cl = (conteudo().cliques || {})[refDe(p.id)] || 0, h = refDe(p.id);
  COPY.push(linkVipDe(p.id)); const i3 = COPY.length - 1;
  const ed = parcEd && parcEd.id === p.id ? parcEd : null;
  let editor = "";
  if (ed) {
    const fx = faixaValor(p.seg), op = ed.op || "fixo";
    const texto = ed.tipo === "msg1" ? msg1(p) : "Que bom" + (p.nome ? ", " + p.nome.split(" ")[0] : "") + "! Minha proposta:\n\n" + OPCOES_PARC[op][1].replace("{valor}", fx.v) +
      "\n\nSeu link: " + linkVipDe(p.id) + "\n\nEu te mando a arte e o texto prontinhos. O que acha? 🤍";
    editor = '<div class="parc-ed">' + (ed.tipo === "prop" ? '<div class="chips">' + Object.keys(OPCOES_PARC).map(k => '<button type="button" class="chip" data-pop="' + k + '" aria-pressed="' + (k === op) + '">' + OPCOES_PARC[k][0] + '</button>').join("") + '</div><p class="why">💡 ' + esc(fx.t) + '</p>' : '') +
      '<textarea class="input" id="pTxt" rows="9" aria-label="Mensagem">' + esc(texto) + '</textarea>' +
      '<div class="actions"><button class="btn wine" data-pcopiar="1">📋 Copiar</button><a class="btn" style="text-decoration:none" href="https://ig.me/m/' + esc(h) + '" target="_blank" rel="noopener">Abrir conversa</a><button class="btn" data-pfechar="1">Fechar</button></div>' +
      '<p class="why">Mude o que quiser antes de copiar.</p></div>';
  }
  return '<article class="card parc" data-parc="' + esc(p.id) + '"><div class="parc-topo"><a class="parc-handle" href="https://www.instagram.com/' + esc(h) + '/" target="_blank" rel="noopener">@' + esc(h) + '</a>' +
    '<button class="btn mini" data-pdisp="' + esc(p.id) + '" aria-label="Não quero">✕</button></div>' +
    '<p class="how"><b>' + esc(p.nome || "") + '</b>' + (p.seg ? ' · ' + esc(p.seg) + ' seguidores' : '') + (p.nicho ? ' · ' + esc(p.nicho) : '') + '</p>' +
    (p.porque ? '<p class="how">' + esc(p.porque) + '</p>' : '') + (p.obs ? '<p class="meta-falta">' + esc(p.obs) + '</p>' : '') +
    '<div class="chips">' + P_ST.map(s => '<button type="button" class="chip" data-pst="' + esc(s) + '" aria-pressed="' + (s === st) + '">' + P_EMO[s] + ' ' + esc(s) + '</button>').join("") + '</div>' +
    '<div class="actions"><button class="btn wine" data-ped="msg1">✍️ 1ª mensagem</button><button class="btn" data-ped="prop">✍️ Proposta</button><button class="btn" data-copy="' + i3 + '">Copiar link dela</button></div>' +
    editor + '<p class="meta-falta">🔗 Cliques pelo link dela: <b>' + cl + '</b></p></article>';
}
$("parcBox").addEventListener("click", e => {
  const card = e.target.closest("[data-parc]"), q = s => e.target.closest(s);
  if (q("[data-ped]") && card) { const t = q("[data-ped]").dataset.ped; parcEd = parcEd && parcEd.id === card.dataset.parc && parcEd.tipo === t ? null : {id: card.dataset.parc, tipo: t, op: "fixo"}; renderParcerias(); setTimeout(() => { const x = $("pTxt"); if (x) x.scrollIntoView({block: "center", behavior: "smooth"}); }, 50); return; }
  if (q("[data-pop]")) { parcEd.op = q("[data-pop]").dataset.pop; renderParcerias(); return; }
  if (q("[data-pcopiar]")) { copyText($("pTxt").value); return; }
  if (q("[data-pfechar]")) { parcEd = null; renderParcerias(); }
});

// se o app abriu direto numa aba nova (depois de atualizar), desenha agora
try { if (!$("tab-bloco").hidden) renderBloco(); if (!$("tab-pagina").hidden) renderPagina(); } catch(_) {}
