// Daia Studio v30 — Assunto da vez (aprovado pela Daia em 07/11/2026).
// 1 assunto = 3 vídeos diferentes; o mesmo vídeo vai para Reels, TikTok e Shopee Vídeo.
// O robô da noite sugere o próximo assunto; ela pode trocar e pedir para gerar tudo.

const ONDES = [["reels", "Reels"], ["tiktok", "TikTok"], ["shopee", "Shopee Vídeo"]];
let assBusy = false, assEditando = false, ASS = [];
const AS = () => state.assunto || null;
function sugestaoRobo(){ const s = conteudo().assunto; return s && s.t ? s : null; }
function assuntoDe(s, origem){ return {t: s.t, porque: s.porque || "", videos: Array.isArray(s.videos) ? s.videos.slice(0, 3) : (s.videos && s.videos.videos ? s.videos.videos.slice(0, 3) : []), onde: {}, origem: origem, criado: todayKey, dataSug: s.data || ""}; }
function assConcluido(a){ return !!(a && a.videos.length && a.videos.every((v, i) => a.onde[i] && (a.onde[i].reels || a.onde[i].tiktok || a.onde[i].shopee))); }
// adota a sugestão do robô quando ainda não tem assunto, ou quando o atual acabou e chegou sugestão nova
function assuntoAtual(){
  const s = sugestaoRobo(), a = AS();
  if (!a && s) { state.assunto = assuntoDe(s, "robô"); save(); }
  return AS();
}
function marcasHoje(){
  const a = AS(), c = {reels: 0, tiktok: 0, shopee: 0};
  if (!a) return c;
  Object.values(a.onde || {}).forEach(o => ONDES.forEach(([k]) => { if (o && o[k] === todayKey) c[k]++; }));
  (state.assHist || []).forEach(h => Object.values(h.onde || {}).forEach(o => ONDES.forEach(([k]) => { if (o && o[k] === todayKey) c[k]++; })));
  return c;
}

function videoAssCard(v, i, a){
  const o = a.onde[i] || {}, feito = ONDES.some(([k]) => o[k]);
  const cp = t => { ASS.push(t); return ASS.length - 1; };
  const roteiro = (v.roteiro || []).join("\n");
  return '<article class="card ass-vid' + (feito ? ' done' : '') + '" data-avid="' + i + '"><div class="meta"><span class="tag casa">' + (i + 1) + ' · ' + esc(v.formato || "Vídeo") + '</span>' + (v.audio ? '<span class="why">🎵 ' + esc(v.audio) + '</span>' : '') + '</div>' +
    '<h3 class="title">' + esc(v.titulo || "") + '</h3>' +
    (v.gancho ? '<div class="say"><small>Gancho (3 s)</small>' + esc(v.gancho) + '</div>' : '') +
    (roteiro ? '<ol class="script">' + (v.roteiro || []).map(l => '<li>' + esc(l) + '</li>').join("") + '</ol>' : '') +
    '<details class="cr-bloco"><summary class="cr-tit"><b>🎙️ Narração, texto na tela e legenda</b></summary>' +
      (v.narracao ? '<div class="cr-leg"><div class="cr-tit"><small class="lab">Narração</small><button class="btn mini" data-acopy="' + cp(v.narracao) + '">Copiar</button></div><p class="how">' + esc(v.narracao) + '</p></div>' : '') +
      (v.texto_tela ? '<div class="cr-leg"><div class="cr-tit"><small class="lab">Texto na tela</small><button class="btn mini" data-acopy="' + cp(v.texto_tela) + '">Copiar</button></div><p class="how">' + esc(v.texto_tela) + '</p></div>' : '') +
      (v.legenda || v.hashtags ? '<div class="cr-leg"><div class="cr-tit"><small class="lab">Legenda + hashtags</small><button class="btn mini" data-acopy="' + cp([v.legenda, v.hashtags].filter(Boolean).join("\n\n")) + '">Copiar</button></div><p class="how">' + esc(v.legenda || "") + (v.hashtags ? '<br><span class="why">' + esc(v.hashtags) + '</span>' : '') + '</p></div>' : '') +
    '</details>' +
    '<p class="why">Postou? Toque onde postou:</p><div class="chips">' + ONDES.map(([k, n]) => '<button type="button" class="chip" data-aonde="' + i + ':' + k + '" aria-pressed="' + !!o[k] + '">' + (o[k] ? '✓ ' : '') + n + '</button>').join("") + '</div></article>';
}
function assuntoCorpo(){
  ASS = [];
  const a = assuntoAtual(), s = sugestaoRobo();
  const editor = '<article class="card ass-ed"><div class="field"><label for="aT">Qual é o assunto?</label><input class="input" id="aT" placeholder="Ex.: Operação Natal ep. 6 — enfeites de chenille" value="' + esc(a && assEditando ? a.t : "") + '"></div>' +
    '<div class="field"><label for="aX">Quer contar algo? (opcional)</label><textarea class="input" id="aX" rows="2" placeholder="Ex.: o produto é o kit de chenille da Shopee; quero mostrar o boneco de neve"></textarea></div>' +
    '<div class="actions"><button class="btn wine" data-agerar="1">✨ Gerar os 3 vídeos</button>' + (s && (!a || s.t !== a.t) ? '<button class="btn" data-asug="1">Usar a sugestão do robô</button>' : '') + (a ? '<button class="btn" data-aedfechar="1">Cancelar</button>' : '') + '</div>' +
    (s && (!a || s.t !== a.t) ? '<p class="why">💡 Sugestão do robô: <b>' + esc(s.t) + '</b>' + (s.porque ? ' — ' + esc(s.porque) : '') + '</p>' : '') +
    '<p class="why">Eu crio 3 vídeos diferentes com gancho, roteiro, narração, texto na tela, legenda e hashtags.</p></article>';
  if (!a || assEditando) return editor + '<div id="aStatus"></div>';
  const feitos = a.videos.filter((v, i) => ONDES.some(([k]) => (a.onde[i] || {})[k])).length;
  const topo = '<article class="card ass-topo"><div class="meta"><span class="tag serie">' + (a.origem === "você" ? "✍️ Seu assunto" : "💡 Sugestão do robô") + '</span><span class="why">' + feitos + ' de ' + (a.videos.length || 3) + ' postados</span></div>' +
    '<h3 class="title">' + esc(a.t) + '</h3>' + (a.porque ? '<p class="how">' + esc(a.porque) + '</p>' : '') +
    '<div class="actions"><button class="btn" data-aeditar="1">🔄 Trocar o assunto</button>' + (a.videos.length ? '<button class="btn" data-arefazer="1">✨ Gerar de novo</button>' : '') + '</div></article>';
  const vids = a.videos.length ? a.videos.map((v, i) => videoAssCard(v, i, a)).join("") :
    '<article class="card"><p class="how">Ainda não tem os 3 vídeos deste assunto.</p><div class="actions"><button class="btn wine" data-arefazer="1">✨ Gerar os 3 vídeos</button></div></article>';
  const fim = assConcluido(a) ? '<article class="card faca"><div class="meta"><span class="tag">🎉 Assunto concluído</span></div><h3 class="title">Bora para o próximo?</h3><div class="actions">' +
    (s && s.t !== a.t ? '<button class="btn" data-asug="1">Próximo: ' + esc(s.t) + '</button>' : '') + '<button class="btn lite" data-aeditar="1">Escrever outro assunto</button></div></article>' : '';
  return topo + '<div id="aStatus"></div>' + vids + fim;
}
function assuntoSecao(){
  const a = assuntoAtual(), n = a ? a.videos.filter((v, i) => ONDES.some(([k]) => (a.onde[i] || {})[k])).length : 0;
  return secao("assunto", "🎬", "Assunto da vez", a ? a.t : "escolha um assunto", a ? n + "/" + (a.videos.length || 3) : "", assConcluido(a), assuntoCorpo());
}
function trendExtra(posts){
  const t = (posts || []).filter(p => p.k === "trend");
  if (!t.length) return "";
  return secao("trend", "🔥", "Trend do dia", "extra · só se der tempo", "", false, t.map(p => '<article class="card"><h3 class="title">' + esc(p.t) + '</h3>' + (p.g ? '<div class="say"><small>Comece dizendo</small>' + esc(p.g) + '</div>' : '') + (p.m ? '<p class="how">' + esc(p.m) + '</p>' : '') +
    '<div class="actions"><button class="btn" data-atrend="' + esc(p.t.replace(/^Trend do dia:\s*/i, "")) + '">Usar como assunto</button></div></article>').join(""));
}
function assStatus(t, html){ const el = $("aStatus"); if (el) el.innerHTML = t ? '<article class="card"><p class="how">' + (html ? t : esc(t)) + '</p></article>' : ""; }
async function gerarAssunto(tema, extra, origem){
  if (assBusy || !tema) { if (!tema) toast("Escreva o assunto."); return; }
  assBusy = true; assStatus("✨ Criando os 3 vídeos… leva uns 20 segundos.");
  let j = null;
  try {
    const ctl = new AbortController(), lim = setTimeout(() => ctl.abort(), 90000);
    try { j = await (await fetch(ROBO, {method: "POST", headers: {"Content-Type": "text/plain;charset=utf-8"}, body: JSON.stringify({acao: "assunto", assunto: tema, extra: extra || ""}), signal: ctl.signal})).json(); } finally { clearTimeout(lim); }
  } catch(_) { j = null; }
  assBusy = false;
  if (j && j.r && j.r.videos) {
    const velho = AS();
    if (velho && velho.t !== tema && Object.keys(velho.onde || {}).length) { state.assHist = [velho].concat(state.assHist || []).slice(0, 20); }
    state.assunto = {t: j.r.assunto || tema, porque: "", videos: j.r.videos.slice(0, 3), onde: velho && velho.t === tema ? velho.onde : {}, origem: origem, criado: todayKey};
    assEditando = false; save(); renderHoje(); abrirSecao("assunto"); return;
  }
  // sem resposta da IA grátis: guarda o assunto e oferece fazer no Claude
  const velho = AS();
  if (!velho || velho.t !== tema) { if (velho && Object.keys(velho.onde || {}).length) state.assHist = [velho].concat(state.assHist || []).slice(0, 20); state.assunto = {t: tema, porque: "", videos: [], onde: {}, origem: origem, criado: todayKey}; save(); }
  assEditando = false; renderHoje(); abrirSecao("assunto");
  const pedido = "Sou a Daia (Dale Daia), afiliada de casa e decoração, tom de amiga, estética minimalista, nunca cito preço. Gravo 1 vídeo e posto o mesmo no Reels, no TikTok e na Shopee Vídeo (mais de 10 s, produto igual ao do link). Assunto: " + tema + (extra ? ". " + extra : "") +
    ". Crie 3 vídeos DIFERENTES (ex.: POV, só as mãos, antes e depois), cada um com: gancho dos 3 primeiros segundos, roteiro por segundos, narração de 15 a 25 s, texto na tela, legenda (no Instagram: comente a palavra do produto, nunca QUERO) e até 5 hashtags. Português simples.";
  ASS.push(pedido);
  setTimeout(() => assStatus('A IA grátis não respondeu agora (o limite do dia acabou). Leve o pedido para o Claude: ele faz igualzinho.<div class="actions" style="margin-top:8px"><button class="btn wine" data-aclaude="' + (ASS.length - 1) + '">Fazer no Claude</button><button class="btn" data-arefazer="1">Tentar de novo</button></div>', true), 200);
}
document.addEventListener("click", async e => {
  if (!e.target.closest("#cards")) return;
  const q = s => e.target.closest(s);
  const cp = q("[data-acopy]"); if (cp) { e.preventDefault(); copyText(ASS[Number(cp.dataset.acopy)]); return; }
  const on = q("[data-aonde]");
  if (on) { const [i, k] = on.dataset.aonde.split(":"); const a = AS(); a.onde[i] = a.onde[i] || {}; a.onde[i][k] = a.onde[i][k] ? null : todayKey; if (!a.onde[i][k]) delete a.onde[i][k]; save(); renderHoje(); if (assConcluido(a)) toast("🎉 Assunto concluído!"); return; }
  if (q("[data-aeditar]")) { assEditando = true; renderHoje(); setTimeout(() => { const t = $("aT"); if (t) t.focus(); }, 60); return; }
  if (q("[data-aedfechar]")) { assEditando = false; renderHoje(); return; }
  if (q("[data-agerar]")) { gerarAssunto($("aT").value.trim(), $("aX").value.trim(), "você"); return; }
  if (q("[data-arefazer]")) { const a = AS(); if (a) gerarAssunto(a.t, "", a.origem); return; }
  if (q("[data-asug]")) { const s = sugestaoRobo(), a = AS(); if (!s) return; if (a && Object.keys(a.onde || {}).length) state.assHist = [a].concat(state.assHist || []).slice(0, 20); state.assunto = assuntoDe(s, "robô"); assEditando = false; save(); renderHoje(); abrirSecao("assunto"); if (!state.assunto.videos.length) gerarAssunto(s.t, s.porque, "robô"); return; }
  const tr = q("[data-atrend]"); if (tr) { assEditando = true; renderHoje(); abrirSecao("assunto"); setTimeout(() => { const t = $("aT"); if (t) { t.value = tr.dataset.atrend; t.focus(); } }, 120); return; }
  const cl = q("[data-aclaude]"); if (cl) { const t = ASS[Number(cl.dataset.aclaude)]; try { await navigator.clipboard.writeText(t); } catch(_) {} abrirLink("https://claude.ai/new?q=" + encodeURIComponent(t)); }
});

// ---------- a meta conta sozinha os vídeos do assunto marcados hoje ----------
const metaDoDia29 = metaDoDia;
metaDoDia = function(posts, feitosPlano, iaFeitos, prDone){
  assuntoAtual();
  const m = metaDoDia29(posts, feitosPlano, iaFeitos, prDone), c = marcasHoje(), map = {shopee: c.shopee, tiktok: c.tiktok, insta: c.reels};
  m.linhas.forEach(l => { l.feito = Math.min(l.n, Math.max(l.feito, map[l.id] || 0)); });
  m.feitos = m.linhas.reduce((s, l) => s + l.feito, 0);
  return m;
};
// ---------- Faça agora: o próximo vídeo do assunto ----------
const facaAgora29 = facaAgoraCard;
facaAgoraCard = function(posts, meta){
  const a = assuntoAtual();
  if (a && a.videos.length) {
    const i = a.videos.findIndex((v, k) => !ONDES.some(([o]) => (a.onde[k] || {})[o]));
    if (i >= 0) return '<article class="card faca"><div class="meta"><span class="tag">✨ Faça agora</span><span class="why">vídeo ' + (i + 1) + ' de 3</span></div><h3 class="title">' + esc(a.t) + '</h3><p class="how">' + esc(a.videos[i].formato || "") + (a.videos[i].gancho ? ': “' + esc(a.videos[i].gancho) + '”' : '') + '</p>' +
      '<div class="actions"><button class="btn" data-facasec="assunto">Ver o roteiro</button></div></article>';
  }
  if (!a) return '<article class="card faca"><div class="meta"><span class="tag">✨ Faça agora</span></div><h3 class="title">Escolha o assunto da vez</h3><div class="actions"><button class="btn" data-facasec="assunto">Escolher</button></div></article>';
  return facaAgora29([], meta);
};
try { if (!$("tab-hoje").hidden) renderHoje(); } catch(_) {}
