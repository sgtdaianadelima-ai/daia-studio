// Daia Studio — app (Hoje, Produtos, Ideias, Editar). Tudo fica salvo só neste celular.
let DAYS = Object.keys(PLAN).sort();
let PR = PRONTOS; // carrosséis: os do arquivo, ou os da planilha quando ela responde
const CTA = {
  serie: "Final: \"Que nota vocês dão pra minha árvore hoje, de 0 a 10? Segue pra ver o próximo episódio.\"",
  casa: "Final: \"Comenta QUERO que eu te mando o link.\"",
  trend: "Final: \"Segue pra mais.\""
};
const LABEL = {serie:"Série da árvore", casa:"Casa Shopee", trend:"Trend / vida"};
const WHY = {serie:"faz seguir", casa:"faz vender", trend:"mostra você"};
const ONDE = {
  serie: "Poste no TikTok e no Reels.",
  casa: "Poste no TikTok, no Reels e na Shopee Vídeo (com o link do produto).",
  trend: "Poste no TikTok e no Reels. Use a música do próprio TikTok."
};
const CATS = ["Natal","Sala","Cozinha","Banheiro","Quarto","Limpeza","Organização","Roupa","Beleza","Outros"];
const STATUS = {tenho:"Já tenho", caminho:"A caminho", chegou:"Chegou"};
const CONTEXTO = "Sou afiliada da Shopee no nicho casa: minha casa toda foi decorada com produtos da Shopee. Estou fazendo a série de Natal \"Minha Primeira Árvore\", transformando minha primeira árvore até o dia 24. Eu apareço e falo para a câmera, tom de amiga, gravo à noite em casa, vídeos de 20 a 40 segundos. O que está dando certo: pedir nota de 0 a 10, \"Decorei minha casa toda com a Dona Shô\", antes e depois gastando pouco, transformação com 1 produto barato, série em partes, \"Salva pra fazer depois\".";

// ---------- util ----------
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));
const pad = n => String(n).padStart(2,"0");
const keyOf = d => d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const fromKey = k => { const [y,m,d] = k.split("-").map(Number); return new Date(y, m-1, d); };
const fmtDay = (k, o) => fromKey(k).toLocaleDateString("pt-BR", o);
const todayKey = keyOf(new Date());
function toast(t, ms){ const el = $("toast"); el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => el.hidden = true, ms || 3500); }

// ---------- estado (localStorage) ----------
const LS = "daia-app-v1";
let state = {done:{}, grav:{}, products:[], ideas:[]};
try { const s = JSON.parse(localStorage.getItem(LS) || "null"); if (s) state = Object.assign(state, s); } catch(_) {}
function save(){ try { localStorage.setItem(LS, JSON.stringify(state)); } catch(_) { toast("Não consegui salvar. O celular pode estar sem espaço."); } }
try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch(_) {}

// ---------- fotos (IndexedDB) ----------
let idb = null;
function openDB(){ return new Promise((res) => { try { const r = indexedDB.open("daia-fotos", 1); r.onupgradeneeded = () => r.result.createObjectStore("f"); r.onsuccess = () => res(r.result); r.onerror = () => res(null); } catch(_) { res(null); } }); }
async function putPhoto(id, blob){ idb = idb || await openDB(); if (!idb) return; return new Promise(res => { const t = idb.transaction("f","readwrite"); t.objectStore("f").put(blob, id); t.oncomplete = res; t.onerror = res; }); }
async function getPhoto(id){ idb = idb || await openDB(); if (!idb) return null; return new Promise(res => { const r = idb.transaction("f").objectStore("f").get(id); r.onsuccess = () => res(r.result || null); r.onerror = () => res(null); }); }
async function delPhoto(id){ idb = idb || await openDB(); if (!idb) return; idb.transaction("f","readwrite").objectStore("f").delete(id); }
function shrink(file, max){
  return new Promise(res => {
    const img = new Image(), u = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas"); c.width = Math.round(img.width*s); c.height = Math.round(img.height*s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
      c.toBlob(b => res(b || file), "image/jpeg", 0.85);
    };
    img.onerror = () => { URL.revokeObjectURL(u); res(file); };
    img.src = u;
  });
}
const thumbs = {};
async function thumbURL(id){ if (thumbs[id]) return thumbs[id]; const b = await getPhoto(id); if (!b) return null; return thumbs[id] = URL.createObjectURL(b); }

// ---------- pedir ao Claude ----------
async function askClaude(text, photoBlob){
  try { await navigator.clipboard.writeText(text); } catch(_) {}
  if (photoBlob && navigator.canShare) {
    const f = new File([photoBlob], "produto.jpg", {type:"image/jpeg"});
    if (navigator.canShare({files:[f]})) {
      try { await navigator.share({files:[f], text, title:"Daia Studio"}); toast("Escolha o Claude. O pedido também foi copiado: se não aparecer, cole na conversa.", 6000); return; }
      catch(e) { if (e && e.name === "AbortError") return; }
    }
  }
  if (navigator.share) {
    try { await navigator.share({text, title:"Daia Studio"}); toast("Escolha o Claude na lista.", 4000); return; }
    catch(e) { if (e && e.name === "AbortError") return; }
  }
  window.open("https://claude.ai/new?q=" + encodeURIComponent(text), "_blank");
}
function promptProduto(p){
  return CONTEXTO + "\n\nProduto" + (p.hasPhoto ? " da foto" : "") + ": " + p.n + " (categoria: " + p.cat + ")." + (p.note ? " O que eu quero fazer: " + p.note + "." : "") +
    "\n\nCrie 3 vídeos DIFERENTES com esse mesmo produto, cada um num formato diferente que costuma viralizar (escolha entre: antes e depois, parece caro mas é da Shopee, testei/vale a pena, POV ou humor, tutorial rápido, nota de 0 a 10, comprei e me arrependi" + (p.cat === "Natal" ? ", episódio da série Minha Primeira Árvore" : "") + ")." +
    " Para cada vídeo: 1) título; 2) roteiro palavra por palavra dividido por segundos, com a primeira frase prendendo nos 3 primeiros segundos; 3) termine com \"Comenta QUERO que eu te mando o link\"; 4) legenda de até 2 frases e 5 hashtags. Português simples, sem enrolação.";
}
function promptIdeia(i){
  return CONTEXTO + "\n\nMinha ideia" + (i.hasPhoto ? " (veja a foto)" : "") + ": " + i.text +
    "\n\nTransforme essa ideia em 3 vídeos diferentes para TikTok e Reels, cada um num formato que costuma viralizar. Para cada um: título, roteiro palavra por palavra dividido por segundos (primeira frase prende nos 3 primeiros segundos), final com chamada (seguir ou comentar QUERO) e legenda com 5 hashtags. Português simples.";
}
function promptRoteiro(p){
  return CONTEXTO + "\n\nEscreva o roteiro completo, palavra por palavra, deste vídeo de 20 a 40 segundos, dividido por segundos (4 a 6 partes, uma por linha: \"0 a 3 s — o que aparece: fala\"). A primeira frase tem que prender. " + CTA[p.k] +
    "\n\nVídeo: " + p.t + "\nComeço: " + p.g + "\nO que mostrar: " + p.m + "\n\nDepois do roteiro, dê a legenda (até 2 frases) e 5 hashtags.";
}

// ---------- HOJE ----------
// O dia de hoje sempre existe na lista, mesmo quando o plano ainda não chegou nele.
const rebuildDays = () => { DAYS = [...new Set(Object.keys(PLAN).concat(todayKey))].sort(); };
rebuildDays();
let cur = todayKey;
const daysToXmas = k => { const d = fromKey(k); return Math.round((new Date(d.getFullYear(), 11, 25) - d) / 864e5); };
// ---------- CONTEÚDO DA PLANILHA (abas "App - ..." na planilha do robô) ----------
const PLANILHA = "https://docs.google.com/spreadsheets/d/1aVQHfnnTc8kui8VHRQxt7vyP75S87wBq-RuoiOyyJyU/edit";
const conteudo = () => (state.ia && state.ia.conteudo) || {};
function applyConteudo(){
  const c = conteudo();
  if (c.prontos && c.prontos.length) PR = c.prontos.map(p => ({id: p.id, tipo: "achados", c1: p.c1, c2: p.c2, capa: p.capa, fim: p.fim || "Salva pra comprar depois", leg: p.leg || "", tags: p.tags || "", album: p.album || "",
    itens: p.itens.map(i => [i.n, i.d, i.link, i.foto]), s: p.itens.map(i => [i.n, i.d])}));
  if (c.plano && c.plano.length) {
    const extra = {};
    c.plano.forEach(r => { const m = String(r.data).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/); if (!m || !r.t) return;
      const k = m[3] + "-" + pad(m[2]) + "-" + pad(m[1]);
      (extra[k] = extra[k] || []).push({h: r.h || "", k: LABEL[r.k] ? r.k : "casa", t: r.t, g: r.g || "", m: r.m || "", r: r.r && r.r.length ? r.r : null}); });
    Object.assign(PLAN, extra); rebuildDays();
  }
}
function recadoCard(){
  const r = conteudo().recado;
  return r ? '<article class="card recado"><p>' + esc(r) + '</p></article>' : '';
}
function editarCard(){
  return '<article class="card"><div class="meta"><span class="tag trend">Mudar o conteúdo</span><span class="why">pela planilha</span></div>' +
    '<p class="how">Recado do topo, respostas prontas, carrosséis e plano de postagens ficam na planilha, nas abas que começam com <b>App -</b>. Mudou lá, o app muda sozinho (feche e abra o app).</p>' +
    '<div class="actions"><a class="btn" style="text-decoration:none" href="' + PLANILHA + '" target="_blank" rel="noopener">✏️ Abrir a planilha</a></div></article>';
}
// ---------- RESUMO DA SEMANA (o que ela marcou como postado nos últimos 7 dias) ----------
function resumoSemana(){
  const dias = []; for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); dias.push(keyOf(d)); }
  const naSemana = k => dias.indexOf(k) >= 0;
  let plano = 0, planoTotal = 0;
  dias.forEach(d => { const ps = PLAN[d] || []; planoTotal += ps.length; ps.forEach((p, i) => { if (state.done[d + "-" + i]) plano++; }); });
  const ia = Object.values(state.iaDone || {}).filter(v => typeof v === "string" && naSemana(v)).length;
  const car = Object.values(state.prontos || {}).filter(v => typeof v === "string" && naSemana(v)).length;
  const postouNo = d => (PLAN[d] || []).some((p, i) => state.done[d + "-" + i]) || Object.values(state.iaDone || {}).includes(d) || Object.values(state.prontos || {}).includes(d);
  let seguidos = 0; for (let i = 0; i < 60; i++) { const d = new Date(); d.setDate(d.getDate() - i); const k = keyOf(d); if (postouNo(k)) seguidos++; else if (i > 0) break; }
  const extras = extrasLista().filter(x => naSemana(x.data)).length;
  const total = plano + ia + car + extras;
  const frase = total === 0 ? "Essa semana ainda está em branco. Bora começar hoje? Um post já conta! 🤍" : total < 7 ? "Você começou! Cada post te deixa mais perto das vendas. ✨" : total < 15 ? "Que semana boa! Continua assim. 💪" : "Você está voando! Semana incrível. 🎉";
  return {plano, planoTotal, ia, car, extras, seguidos, total, frase};
}
function semanaCard(){
  const r = resumoSemana();
  return '<article class="card"><div class="meta"><span class="tag casa">Sua semana</span><span class="why">últimos 7 dias</span></div>' +
    '<div class="semana"><div><b>' + r.plano + '</b><small>de ' + r.planoTotal + ' posts do plano</small></div><div><b>' + r.ia + '</b><small>Shopee Vídeos</small></div><div><b>' + r.car + '</b><small>carrosséis</small></div><div><b>' + r.extras + '</b><small>extras</small></div><div><b>' + r.seguidos + '</b><small>' + (r.seguidos === 1 ? 'dia seguido' : 'dias seguidos') + '</small></div></div>' +
    '<p class="how">' + esc(r.frase) + '</p></article>';
}
// ---------- LEMBRETES ----------
const minDe = h => { const m = String(h).match(/(\d{1,2})h(\d{2})?/); return m ? Number(m[1]) * 60 + Number(m[2] || 0) : null; };
function pendentesCard(){
  const agora = new Date().getHours() * 60 + new Date().getMinutes();
  const falta = (PLAN[todayKey] || []).map((p, i) => ({p, i})).filter(x => !state.done[todayKey + "-" + x.i] && minDe(x.p.h) !== null && minDe(x.p.h) <= agora);
  if (!falta.length) return "";
  return '<article class="card pendente"><p>⏰ Já passou da hora e ainda falta:</p><ul>' + falta.map(x => '<li><b>' + esc(x.p.h) + '</b> · ' + esc(x.p.t) + '</li>').join("") + '</ul></article>';
}
function lembretesCard(){
  const t = conteudo().lembretes;
  if (!t) return "";
  COPY.push(t);
  return '<article class="card"><div class="meta"><span class="tag trend">Lembretes no celular</span><span class="why">12h · 18h30 · 21h</span></div>' +
    '<p class="how">Para o celular apitar na hora de postar, mesmo com o app fechado:</p>' +
    '<ol class="script"><li>Instale o app grátis <b>ntfy</b> (não precisa de conta).</li><li>Abra o ntfy, toque em <b>+</b> e cole o seu tópico: <b class="sel">' + esc(t) + '</b></li><li>Pronto! A Dalinha avisa nos horários do plano.</li></ol>' +
    '<div class="actions"><a class="btn" style="text-decoration:none" href="https://play.google.com/store/apps/details?id=io.heckel.ntfy" target="_blank" rel="noopener">Baixar o ntfy</a><button class="btn" data-copy="' + (COPY.length - 1) + '">Copiar meu tópico</button></div></article>';
}
function renderHoje(){
  const posts = PLAN[cur] || [];
  const dd = fmtDay(cur, {day:"numeric", month:"short"});
  $("dayTitle").innerHTML = (cur === todayKey ? "Hoje" : esc(fmtDay(cur, {weekday:"long"}))) + ", <em>" + esc(dd) + "</em>";
  const xm = daysToXmas(cur);
  $("daySub").innerHTML = (xm > 0 ? "<span>Faltam <b>" + xm + " dias</b> para o Natal</span>" : "") + (posts.length ? "<span>" + posts.length + " posts no plano</span>" : "");
  const done = posts.filter((p, i) => state.done[cur+"-"+i]).length;
  $("barFill").style.width = (posts.length ? done/posts.length*100 : 0) + "%";
  $("progText").textContent = done === posts.length && posts.length ? "Dia completo!" : done + " de " + posts.length + " postados";
  $("prev").disabled = cur <= DAYS[0]; $("next").disabled = cur >= DAYS[DAYS.length-1];

  const arrived = state.products.filter(p => p.status === "chegou" && p.at === cur);
  $("arrived").innerHTML = arrived.map(p => '<div class="alert"><span><b>Chegou: ' + esc(p.n) + '</b><br>Grave o unboxing hoje: ele vira um episódio extra.</span><button class="btn wine" data-ask="' + esc(p.id) + '">Criar 3 vídeos com ele</button></div>').join("");

  const pr = prontoDoDia(cur);
  const prDone = state.prontos && state.prontos[pr.id];
  const prontoCard = '<article class="card" style="border-color:var(--gold)"><div class="meta"><span class="tag casa">Sem tempo pra gravar?</span><span class="why">post pronto</span></div>' +
    '<h3 class="title">' + esc(pr.c1 + " " + pr.c2) + '</h3><p class="how">Carrossel pronto, com legenda e hashtags. Serve para o Instagram e para o TikTok (modo foto).' + (prDone ? ' <b>Já postado ✓</b>' : '') + '</p>' +
    '<div class="actions"><button class="btn wine" data-pronto="' + esc(pr.id) + '">Abrir post pronto</button></div></article>';
  COPY = [];
  const semPlano = posts.length ? '' : '<article class="card"><div class="meta"><span class="tag trend">Plano de postagens</span></div><p class="how">Ainda não tem plano para este dia. Me peça um plano novo no Claude, ou escreva os posts na aba <b>App - Plano</b> da planilha.</p></article>';
  const videos = semPlano + posts.map((p, i) => {
    const k = cur + "-" + i, d = !!state.done[k];
    return '<article class="card' + (d ? " done" : "") + '" data-i="' + i + '">' +
      '<div class="meta"><span>' + esc(p.h) + '</span><span class="tag ' + p.k + '">' + LABEL[p.k] + '</span><span class="why">' + WHY[p.k] + '</span></div>' +
      '<h3 class="title">' + esc(p.t) + '</h3>' +
      '<div class="say det"><small>Comece dizendo</small>' + esc(p.g) + '</div>' +
      '<p class="how det">' + esc(p.m) + '</p>' +
      (p.r ? '<ol class="script det">' + p.r.map(l => '<li>' + esc(l) + '</li>').join("") + '</ol>' : '') +
      '<p class="cta det">' + esc(CTA[p.k]) + '</p>' +
      '<details class="tips det"><summary>Como editar e onde postar</summary><p>1) Aba Editar: escolha o vídeo e toque em Editar (tira as pausas). 2) Toque em Enviar para o TikTok. 3) No TikTok: Legendas, música e postar.</p><p><b>' + esc(ONDE[p.k]) + '</b></p></details>' +
      '<div class="actions"><button class="btn main" data-act="done">' + (d ? "Postado ✓" : "Marcar como postado") + '</button>' +
      (p.r ? '' : '<button class="btn" data-act="roteiro">Roteiro no Claude</button>') +
      '<button class="btn" data-act="editar">Editar vídeo</button></div>' +
    '</article>';
  }).join("");
  const hoje = cur === todayKey;
  const iaV = hoje && state.ia && state.ia.videos ? state.ia.videos : [];
  const iaFeitos = iaV.filter(v => state.iaDone && state.iaDone[efetivo(v).id]).length;
  const nPacks = hoje && state.ia && state.ia.packs ? state.ia.packs.length : 0;
  const resumoSem = hoje ? resumoSemana() : null;
  const nExtras = hoje ? extrasLista().filter(x => x.data === todayKey).length : 0;
  const meta = hoje ? metaDoDia(posts, done, iaFeitos, !!prDone, nExtras) : null;
  if (meta) { $("barFill").style.width = (meta.feitos / meta.total * 100) + "%"; $("progText").textContent = meta.feitos >= meta.total ? "Meta batida! 🎉" : meta.feitos + " de " + meta.total + " da meta"; }
  const extrasDoDia = extrasLista().filter(x => x.data === cur);
  const extrasNoPlano = extrasDoDia.map(x => '<article class="card done extra-plano"><div class="meta"><span class="tag trend">Extra</span><span class="why">' + esc((x.onde || []).join(", ")) + '</span></div><h3 class="title">' + esc(x.t) + '</h3>' +
    (x.claude ? '<p class="how extra-claude">💬 ' + esc(x.claude) + '</p>' : '') + '<div class="actions"><span class="why">✓ Postado fora do plano</span></div></article>').join("");
  $("cards").innerHTML = (hoje ? metaCard(meta) + recadoCard() + pendentesCard() : "") +
    (hoje ? secao("shopee", "🛍️", "Shopee Vídeo", "3 vídeos de IA" + (nPacks ? " + " + nPacks + " dos packs" : ""), iaFeitos + "/" + (iaV.length || 3), iaFeitos >= 3, iaCards() + packsCard()) : "") +
    secao("tiktok", "🎵", "TikTok e Reels", posts.length ? "vídeos para gravar hoje" : "sem plano neste dia", done + "/" + posts.length, posts.length && done === posts.length, videos + extrasNoPlano +
      (posts.length ? '<p class="how nota">📸 Postou no TikTok? Poste o mesmo vídeo no Reels do Instagram.</p>' : '')) +
    secao("insta", "📸", "Instagram", "carrossel pronto do dia", prDone ? "1/1" : "0/1", !!prDone, prontoCard) +
    (hoje ? secao("extra", "✨", "Postei algo fora do plano", "trend, achado ou ideia sua", nExtras ? nExtras + " hoje" : "", false, extrasCard()) +
      secao("semana", "📊", "Minha semana", resumoSem.total + " posts em 7 dias", "", false, analiseCard() + semanaCard()) +
      secao("ferramentas", "🧰", "Ferramentas", "converter link, respostas, lembretes", "", false, conversorCard() + respostasCard() + lembretesCard() + editarCard()) : "");
}
// Tópico da tela Hoje: toca no título e abre; toca de novo e fecha. Lembra o que estava aberto.
// ---------- META DO DIA (quanto falta postar hoje) ----------
function metaDoDia(posts, feitosPlano, iaFeitos, prDone, nExtras){
  const nShopee = 3, fShopee = Math.min(iaFeitos, nShopee);
  const total = posts.length + nShopee + 1, feitos = feitosPlano + fShopee + (prDone ? 1 : 0);
  const falta = [], f1 = nShopee - fShopee, f2 = posts.length - feitosPlano;
  if (f1) falta.push(f1 + (f1 === 1 ? " Shopee Vídeo" : " Shopee Vídeos"));
  if (f2) falta.push(f2 + (f2 === 1 ? " vídeo do plano (TikTok/Reels)" : " vídeos do plano (TikTok/Reels)"));
  if (!prDone) falta.push("1 carrossel no Instagram");
  return {total, feitos, falta, extras: nExtras};
}
function metaCard(m){
  if (!m) return "";
  const pronto = m.feitos >= m.total;
  const frase = pronto ? "Meta de hoje batida! Você é demais. 🎉" :
    m.feitos === 0 ? "Hoje você tem que postar " + m.total + " vezes. Bora começar pelo mais fácil? 🤍" :
    "Você já postou " + m.feitos + ". Faltam " + (m.total - m.feitos) + ". Tá quase! 💪";
  return '<article class="card meta-dia' + (pronto ? " ok" : "") + '"><div class="meta-topo"><b>🎯 Meta de hoje</b><span>' + m.feitos + ' de ' + m.total + '</span></div>' +
    '<div class="meta-barra"><i style="width:' + Math.min(100, m.feitos / m.total * 100) + '%"></i></div>' +
    '<p>' + esc(frase) + '</p>' + (m.falta.length ? '<p class="meta-falta"><b>Falta:</b> ' + esc(m.falta.join(" · ")) + '</p>' : '') +
    (m.extras ? '<p class="meta-falta">✨ + ' + m.extras + (m.extras === 1 ? ' post extra' : ' posts extras') + ' fora do plano. Bônus!</p>' : '') + '</article>';
}
function secao(id, emoji, titulo, sub, conta, ok, corpo){
  const aberto = state.secoes && state.secoes[id];
  return '<details class="secao' + (ok ? " ok" : "") + '" data-sec="' + id + '"' + (aberto ? " open" : "") + '>' +
    '<summary><span class="sec-emoji" aria-hidden="true">' + emoji + '</span><span class="sec-txt"><b>' + titulo + '</b><small>' + esc(sub) + '</small></span>' +
    (conta ? '<span class="sec-conta">' + (ok ? "✓ " : "") + conta + '</span>' : '') + '<span class="sec-seta" aria-hidden="true"></span></summary>' +
    '<div class="sec-corpo">' + corpo + '</div></details>';
}
$("cards").addEventListener("input", e => { if (e.target.id === "xTxt" || e.target.id === "xLink") { rascunhoExtra(); save(); } });
$("cards").addEventListener("toggle", e => {
  const d = e.target; if (!d.matches || !d.matches("details.secao")) return;
  state.secoes = state.secoes || {}; state.secoes[d.dataset.sec] = d.open; save();
}, true);
// ---------- SHOPEE VÍDEO DE HOJE (o robô do Google escolhe 3 produtos todo dia às 6h) ----------
const ROBO = "https://script.google.com/macros/s/AKfycbzdJLT5-Lwb9oKNOAcwa4nZzZ95bw21W3QWOenf8ORFQmjH2QeHviIrVaPvmxLBDsKI/exec";
const LINK_PAGINA = "https://daledaia.github.io", LINK_VIP = "https://chat.whatsapp.com/E6jfFnVCMfN9Byt4p1nEtm";
let COPY = [];
const copyBtn = (txt, label, cls) => { COPY.push(txt); return '<button class="btn' + (cls ? " " + cls : "") + '" data-copy="' + (COPY.length-1) + '">' + label + '</button>'; };
const respostaProduto = v => "Oi! 🤍 Aqui está o link do " + v.nome + ": " + v.link + "\nQualquer dúvida me chama! E no meu grupo VIP tem promoção todo dia: " + LINK_VIP;
function iaCards(){
  const ia = state.ia;
  if (!ia || !ia.videos || !ia.videos.length) return '<article class="card" style="border-color:var(--wine)"><div class="meta"><span class="tag serie">Shopee Vídeo de hoje</span></div><p class="how">Buscando os 3 produtos de hoje… Se não aparecer, confira a internet e abra o app de novo.</p></article>';
  const feitos = ia.videos.filter(v => state.iaDone && state.iaDone[v.id]).length;
  return '<article class="card" style="border-color:var(--wine)"><div class="meta"><span class="tag serie">Shopee Vídeo de hoje</span><span class="why">' + feitos + ' de ' + ia.videos.length + ' postados</span></div>' +
    '<h3 class="title">3 vídeos de IA, um por produto</h3>' +
    '<p class="how det">O robô escolhe pelo equilíbrio: comissão boa, vendas no meio termo (nem pouco, nem demais) e nota alta. Faça um de cada vez.</p>' +
    '<details class="tips det"><summary>Regras e dicas da Shopee Vídeo</summary><p>• <b>Mostre todas as cores.</b> A Shopee esconde o vídeo quando o produto do link tem cores ou modelos que não aparecem. Use a "foto das cores" como figurinha no vídeo.<br>• O produto do vídeo tem que ser igual ao do link (mesma cor e modelo).<br>• Um produto por vídeo.<br>• Marque que o vídeo é feito com IA.<br>• Coloque sua marca d\'água "Dale Daia" no canto (no YouTube Create: Texto).<br>• Entre pelo produto (Compartilhe para ganhar → Shopee Vídeo): assim o link já vai junto.<br>• Poste 3 por dia, todo dia.</p></details></article>' +
    ia.videos.map((v0, n) => {
      const v = efetivo(v0), d = !!(state.iaDone && state.iaDone[v.id]);
      return '<article class="card' + (d ? " done" : "") + '" data-ia="' + esc(v.id) + '">' +
        '<div class="meta"><span class="tag casa">Vídeo ' + (n+1) + '</span><span class="why">' + esc(v.preco) + ' · comissão ' + esc(v.comissao) + ' · ' + esc(v.vendas) + ' vendidos</span></div>' +
        (v.foto ? '<img src="' + esc(v.foto) + '" alt="" loading="lazy" style="width:100%;max-height:260px;object-fit:contain;border-radius:12px;background:#fff">' : '') +
        '<h3 class="title">' + esc(v.nome) + '</h3>' + (v.trocado ? '<p class="how">🔁 Você trocou por este. <button class="link-btn" data-destroca="' + n + '">Voltar ao primeiro</button></p>' : '') +
        fotosBloco(v, n) + coresBloco(v, n) +
        '<div class="passo"><b>1 · Foto bonita</b><span class="det">Manda a foto e o pedido juntos para o ChatGPT. Ele cria uma foto linda do produto: salve no celular.</span>' +
          '<div class="actions"><button class="btn wine" data-gpt="' + n + '">📸 Fazer a foto no ChatGPT</button>' + copyBtn(v.pedidoFoto, "Só copiar o pedido") + '</div></div>' +
        '<div class="passo"><b>2 · Vídeo</b><span class="det">No YouTube Create: Gerar vídeo › escolha a foto do ChatGPT › cole o pedido › Usar vídeo › seta para cima › salvar.</span>' +
          '<div class="actions">' + copyBtn(v.pedidoVideo, "Copiar pedido do vídeo") + '</div></div>' +
        '<div class="passo"><b>3 · Postar na Shopee Vídeo</b><span class="det">Abra o produto › Compartilhe para ganhar › Shopee Vídeo › escolha o vídeo › cole a legenda. Marque que é feito com IA.</span>' +
          '<div class="actions"><a class="btn" style="text-decoration:none" href="' + esc(v.link) + '" target="_blank" rel="noopener">Abrir o produto</a>' + copyBtn(v.legenda + "\n\n" + v.hashtags, "Copiar legenda") + '</div></div>' +
        opcoesBloco(v0, n) +
        '<div class="actions"><button class="btn main" data-iadone="' + esc(v.id) + '">' + (d ? "Postado ✓" : "Marcar como postado") + '</button></div></article>';
    }).join("");
}
// ---- fotos extras, foto das cores e opções parecidas ----
function efetivo(v){
  const t = state.iaTroca && state.iaTroca[v.id];
  if (!t) return v;
  const troca = x => String(x || "").split(v.nome).join(t.n);
  return Object.assign({}, v, {nome: t.n, preco: t.preco, comissao: t.com, vendas: t.vendas, link: t.link, foto: t.foto,
    pedidoFoto: troca(v.pedidoFoto), pedidoVideo: troca(v.pedidoVideo), legenda: troca(v.legenda), fotos: [], cores: [], trocado: true});
}
const vid = n => efetivo(state.ia.videos[n]);
const grande = u => String(u || "").replace(/_tn$/, "");
function fotosBloco(v, n){
  const chave = u => String(u).split("/").pop().replace(/_tn$/, "");
  const fs = [v.foto].concat(v.fotos || []).filter((u, i, a) => u && a.findIndex(x => chave(x) === chave(u)) === i).slice(0, 6);
  if (fs.length < 2) return "";
  return '<div class="passo"><b>📷 Mais fotos do produto</b><span class="det">Toque numa foto para salvar. Use a mais bonita no ChatGPT.</span>' +
    '<div class="galeria">' + fs.map((u, i) => '<button type="button" data-salvarfoto="' + n + '-' + i + '" aria-label="Salvar foto ' + (i+1) + '"><img src="' + esc(grande(u)) + '" alt="" loading="lazy"></button>').join("") + '</div></div>';
}
function coresBloco(v, n){
  const cs = v.cores || [];
  if (cs.length < 2) return "";
  return '<div class="passo cores"><b>🎨 Tem ' + cs.length + ' opções: mostre todas</b><span class="det">A Shopee pede que o vídeo mostre todas as cores. Salve a foto das cores e coloque como figurinha no vídeo.</span>' +
    '<div class="cores-mini">' + cs.slice(0, 12).map(c => '<span><img src="' + esc(grande(c.img)) + '" alt="" loading="lazy"><small>' + esc(c.n) + '</small></span>').join("") + '</div>' +
    '<div class="actions"><button class="btn wine" data-corfoto="' + n + '">🎨 Salvar foto das cores</button></div></div>';
}
function opcoesBloco(v, n){
  const os = (v.opcoes || []).filter(o => o && o.n && o.link);
  const dica = '<p class="how">💡 Antes de gravar, abra o produto no app da Shopee e toque em <b>Compartilhe para ganhar</b>: se tiver muita afiliada divulgando, troque por um parecido.</p>';
  if (!os.length) return '<details class="tips det"><summary>Será que muita gente já divulga?</summary>' + dica + '</details>';
  const atual = state.iaTroca && state.iaTroca[v.id];
  return '<details class="tips det"><summary>🔁 Outras opções boas do mesmo tema (' + os.length + ')</summary>' + dica +
    os.map((o, i) => '<div class="opcao">' + (o.foto ? '<img src="' + esc(o.foto) + '" alt="" loading="lazy">' : '') +
      '<div><b>' + esc(o.n) + '</b><small>' + esc(o.preco) + ' · comissão ' + esc(o.com) + ' · ' + esc(o.vendas) + ' vendidos' + (o.nota ? ' · ⭐ ' + esc(o.nota) : '') + '</small>' +
      '<div class="actions"><a class="btn" style="text-decoration:none" href="' + esc(o.link) + '" target="_blank" rel="noopener">Ver</a>' +
      (atual && atual.link === o.link ? '<span class="why">✓ usando este</span>' : '<button class="btn wine" data-troca="' + n + '-' + i + '">Usar este</button>') + '</div></div></div>').join("") + '</details>';
}
async function compartilharArquivo(blob, nome){
  const f = new File([blob], nome, {type: blob.type || "image/jpeg"});
  if (navigator.canShare && navigator.canShare({files: [f]})) { await navigator.share({files: [f]}); return true; }
  return false;
}
async function salvarUrl(u){
  try { const b = await (await fetch(u)).blob(); if (await compartilharArquivo(b, "produto.jpg")) return; }
  catch(e) { if (e && e.name === "AbortError") return; }
  window.open(u, "_blank"); toast("Segure o dedo na foto e toque em Baixar imagem.", 5000);
}
function carregarImg(u){
  return new Promise(ok => { const i = new Image(); i.crossOrigin = "anonymous"; i.onload = () => ok(i); i.onerror = () => ok(null); i.src = u; });
}
function retRedondo(g, x, y, w, h, r){
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
// Junta as cores numa imagem só (fundo branco arredondado, nome embaixo) para usar como figurinha.
async function montarCores(v){
  const cs = (v.cores || []).slice(0, 12);
  const imgs = await Promise.all(cs.map(c => carregarImg(grande(c.img))));
  const col = cs.length <= 4 ? 2 : 3, lin = Math.ceil(cs.length / col);
  const W = 1080, pad = 40, gap = 24, cel = Math.floor((W - pad*2 - gap*(col-1)) / col), txt = 64, topo = 130;
  const H = topo + lin * (cel + txt) + (lin-1) * gap + pad;
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d");
  const cor = getComputedStyle(document.documentElement).getPropertyValue("--wine").trim() || "#7A1F2B";
  g.fillStyle = "#ffffff"; retRedondo(g, 0, 0, W, H, 48); g.fill();
  g.fillStyle = cor; g.font = "700 56px system-ui, sans-serif"; g.textAlign = "center";
  g.fillText("Tem em " + cs.length + " opções 🤍", W/2, 88);
  cs.forEach((x, i) => {
    const cx = pad + (i % col) * (cel + gap), cy = topo + Math.floor(i / col) * (cel + txt + gap);
    g.save(); retRedondo(g, cx, cy, cel, cel, 28); g.clip();
    g.fillStyle = "#f4f1ee"; g.fillRect(cx, cy, cel, cel);
    const im = imgs[i];
    if (im) { const s = Math.max(cel / im.width, cel / im.height), w = im.width * s, h = im.height * s; g.drawImage(im, cx + (cel - w)/2, cy + (cel - h)/2, w, h); }
    g.restore();
    g.fillStyle = "#3a2a2a"; g.font = "600 34px system-ui, sans-serif";
    const cheio = String(x.n || ""); let nome = cheio;
    while (nome.length > 3 && g.measureText(nome + "…").width > cel) nome = nome.slice(0, -1);
    g.fillText(nome === cheio ? nome : nome + "…", cx + cel/2, cy + cel + 46);
  });
  return new Promise(ok => { try { c.toBlob(ok, "image/png"); } catch(_) { ok(null); } });
}
async function fotoDasCores(v){
  toast("Montando a foto das cores…");
  const blob = await montarCores(v);
  if (!blob) { toast("Não consegui montar a foto. Tire um print das cores na página do produto.", 6000); return; }
  try { if (await compartilharArquivo(blob, "cores.png")) return; } catch(e) { if (e && e.name === "AbortError") return; }
  window.open(URL.createObjectURL(blob), "_blank"); toast("Segure o dedo na foto e toque em Baixar imagem.", 5000);
}
function conversorCard(){
  return '<article class="card" style="border-color:var(--gold)"><div class="meta"><span class="tag casa">Converter link</span><span class="why">vira o SEU link</span></div>' +
    '<p class="how">Copiou um link da Shopee de um pack, do Telegram ou de outra pessoa? Cole aqui e eu troco pelo seu link de afiliada.</p>' +
    '<input id="convIn" type="url" inputmode="url" placeholder="Cole o link da Shopee aqui" style="width:100%;box-sizing:border-box;padding:12px;border-radius:12px;border:1px solid var(--line, #ddd);font:inherit">' +
    '<div class="actions"><button class="btn wine" data-conv="1">Converter</button></div><div id="convOut"></div></article>';
}
function packsCard(){
  const ps = (state.ia && state.ia.packs) || [];
  if (!ps.length) return "";
  return '<article class="card" style="border-color:var(--wine)"><div class="meta"><span class="tag serie">Vídeos dos seus packs</span><span class="why">já com o seu link</span></div>' +
    '<ol class="script"><li>Toque em <b>Abrir no Telegram</b>: abre direto no vídeo certo.</li><li>No Telegram, toque no vídeo › ⋮ (três pontinhos) › <b>Salvar na galeria</b>.</li><li>Volte aqui, toque em <b>Copiar meu link</b> e <b>Copiar legenda</b> e poste (Shopee Vídeo, TikTok ou Reels).</li></ol>' +
    ps.map(p => '<div style="border-top:1px solid var(--line, #eee);padding-top:10px;margin-top:10px"><b>' + esc(p.nicho || "Achado") + '</b><br><small>Onde está: Telegram › PACK VIP STORYS/VIDEOS › tópico "' + esc(/natal/i.test(p.nicho) ? "*Vídeo* Natal" : "*Vídeo* casa decoração") + '"</small>' +
      '<div class="actions">' + (p.tg ? '<a class="btn" style="text-decoration:none" href="' + esc(p.tg) + '" target="_blank" rel="noopener">Abrir no Telegram</a>' : '') +
      copyBtn(p.link, "Copiar meu link") + copyBtn((p.legenda || "Achadinho da Shopee que vale a pena 🤍 Toca no link!") + "\n\n#achadinhosshopee #shopeevideo #casa", "Copiar legenda") + '</div></div>').join("") + '</article>';
}
async function converter(){
  const v = $("convIn").value.trim(), out = $("convOut");
  if (!v) { toast("Cole um link primeiro."); return; }
  out.innerHTML = '<p class="how">Convertendo…</p>';
  try {
    const j = await (await fetch(ROBO + "?link=" + encodeURIComponent(v))).json();
    if (!j.link) throw new Error(j.erro || "não deu");
    COPY.push(j.link); state.ultimoLink = j.link; save();
    out.innerHTML = '<p class="how"><b>Seu link:</b> ' + esc(j.link) + '</p><div class="actions"><button class="btn main" data-copy="' + (COPY.length-1) + '">Copiar meu link</button></div>';
    copyText(j.link);
  } catch(e) { out.innerHTML = '<p class="how">Não consegui converter: ' + esc(e.message) + '. Confira se é um link da Shopee.</p>'; }
}
// ---------- RESPOSTAS PRONTAS (toca, vê a mensagem, ajusta e copia) ----------
// {link} = página de links, {vip} = grupo VIP, {produto} = link do produto (o último que ela converteu).
const RESP_BASE = [
  ["🎵 TikTok", [
    ["Comentário: pediu o link", "Oi! 🤍 É a opção A. O link está na minha bio, em “Achadinhos”. Se preferir, me chama no direct que eu te mando!"],
    ["Direct: mandar o link", "Oi! 🤍 Aqui está o link da opção A:\n{produto}\n\n💡 O TikTok não deixa o link clicável. Copia e cola no WhatsApp (pode mandar pra você mesma) e toca nele: abre direto na Shopee."],
    ["Comentário: qual é o produto?", "É a opção A! 🤍 Está na minha bio, em “Achadinhos”. Corre que costuma esgotar!"]]],
  ["📸 Instagram", [
    ["Resposta no comentário", "Te mandei no direct! 🤍 Se não chegar, olha em “Solicitações de mensagem” ou no link da minha bio."],
    ["Direct: mandar o link", "Oi! 🤍 Aqui está o link da opção A:\n{produto}\n\nE todos os meus achados ficam aqui: {link}"],
    ["Pediu o link (geral)", "Oi! 🤍 Todos os meus achados estão aqui: {link}\nE no grupo VIP eu mando as promoções do dia: {vip}"]]],
  ["💬 WhatsApp", [
    ["Quer entrar no grupo", "Que bom! 🤍 Entra aqui no grupo VIP, todo dia tem oferta boa: {vip}"],
    ["Mandar o link no WhatsApp", "Oi! 🤍 Esse é o link da opção A, é só tocar:\n{produto}"]]],
  ["❓ Dúvidas", [
    ["Perguntou se é bom", "É sim! Tem muitas avaliações boas e eu indico 🤍 O link está no meu perfil, e qualquer dúvida me chama aqui."],
    ["Perguntou o preço", "O preço muda toda hora na Shopee e às vezes tem cupom 🤍 Confere no link da opção A: lá aparece o valor de agora!"],
    ["Tem outras cores?", "Tem sim! 🤍 No link você escolhe a cor e o tamanho antes de comprar."],
    ["Demora pra chegar?", "Depende da sua cidade 🤍 A Shopee mostra o prazo certinho antes de você finalizar a compra."],
    ["É confiável?", "É sim 🤍 A compra é pela própria Shopee: se não chegar ou vier errado, você pede o dinheiro de volta pelo app."],
    ["Comprou e agradeceu", "Ahh que bom! 🤍 Depois me conta o que achou. Se puder, me marca no story!"]]]
];
let RESP = [];
function respostasCard(){
  const daPlanilha = {}; (conteudo().respostas || []).forEach(x => { daPlanilha[x.nome] = x.texto; });
  RESP = [];
  const usados = {};
  const grupo = (titulo, lista) => '<p class="resp-grupo">' + titulo + '</p><div class="actions" style="flex-wrap:wrap">' +
    lista.map(x => { usados[x[0]] = 1; RESP.push({nome: x[0], texto: daPlanilha[x[0]] || x[1]}); return '<button class="btn" data-resp="' + (RESP.length - 1) + '">' + esc(x[0]) + '</button>'; }).join("") + '</div>';
  let html = RESP_BASE.map(g => grupo(g[0], g[1])).join("");
  const minhas = Object.keys(daPlanilha).filter(n => !usados[n]).map(n => [n, daPlanilha[n]]);
  if (minhas.length) html += grupo("⭐ Minhas", minhas);
  return '<article class="card"><div class="meta"><span class="tag trend">Respostas prontas</span><span class="why">toque para ver</span></div>' +
    '<p class="how">Toque numa resposta: ela aparece aqui embaixo. Você pode mudar o texto antes de copiar.</p>' + html + '<div id="respPrev"></div></article>';
}
function montaResp(t){
  const prod = state.ultimoLink || "[cole aqui o link do produto]";
  return String(t).replace(/\{link\}/g, LINK_PAGINA).replace(/\{vip\}/g, LINK_VIP).replace(/\{produto\}/g, prod);
}
function abrirResp(i){
  const r = RESP[i], box = $("respPrev"); if (!r || !box) return;
  const txt = montaResp(r.texto), temOpcao = /opção [A-E]\b/.test(txt), temProd = /\{produto\}/.test(r.texto);
  box.innerHTML = '<div class="resp-prev"><b>' + esc(r.nome) + '</b>' +
    (temOpcao ? '<div class="chips" aria-label="Qual opção">' + "ABCDE".split("").map(l => '<button type="button" class="chip" data-letra="' + l + '" aria-pressed="' + (txt.indexOf("opção " + l) >= 0) + '">Opção ' + l + '</button>').join("") + '</div>' : '') +
    '<textarea class="input" id="respTxt" rows="6" aria-label="Mensagem">' + esc(txt) + '</textarea>' +
    (temProd ? '<p class="how nota">' + (state.ultimoLink ? '🔗 Usei o último link que você converteu. Se for outro produto, toque em “Colar outro link”.' : '🔗 Converta o link do produto em “Converter link” (aqui em cima) ou toque em “Colar outro link”.') + '</p>' : '') +
    '<div class="actions"><button class="btn main" data-respcopiar="1">📋 Copiar</button>' +
    (temProd ? '<button class="btn" data-respcolar="1">Colar outro link</button>' : '') +
    '<button class="btn" data-respfechar="1">Fechar</button></div></div>';
  box.scrollIntoView({block: "nearest", behavior: "smooth"});
}
async function colarLinkResp(){
  const ta = $("respTxt"); if (!ta) return;
  let novo = "";
  try { novo = (await navigator.clipboard.readText()).trim(); } catch(_) {}
  if (!/^https?:\/\//.test(novo)) { toast("Copie o link do produto primeiro e toque de novo. Ou apague e cole no texto.", 5000); return; }
  const velho = state.ultimoLink || "[cole aqui o link do produto]";
  ta.value = ta.value.split(velho).join(novo);
  if (/s\.shopee|shopee\.com/.test(novo)) { state.ultimoLink = novo; save(); }
  toast("Link colocado na mensagem.");
}
// ---------- POSTEI ALGO EXTRA (fora do plano) ----------
const X_ONDE = ["TikTok", "Reels", "Story", "Carrossel/foto", "Shopee Vídeo", "WhatsApp"];
const X_TIPO = ["Trend", "Achadinho", "Ideia minha", "Bastidores", "Outro"];
function extrasLista(){
  const srv = conteudo().extras || [], porId = {};
  srv.forEach(x => { if (x.id) porId[x.id] = x; });
  const locais = (state.extras || []).map(x => Object.assign({}, x, {claude: porId[x.id] ? porId[x.id].claude : ""}));
  const ids = {}; locais.forEach(x => { ids[x.id] = 1; });
  const deFora = srv.filter(x => x.id && !ids[x.id] && !(state.extrasApagados || {})[x.id]).map(x => {
    const m = String(x.data).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    return {id: x.id, data: m ? m[3] + "-" + pad(m[2]) + "-" + pad(m[1]) : "", onde: String(x.onde || "").split(", ").filter(Boolean), tipo: x.tipo, t: x.t, link: x.link, claude: x.claude, env: true};
  });
  return locais.concat(deFora).sort((a, b) => String(b.data).localeCompare(String(a.data)));
}
function extrasCard(){
  const r = state.extraRasc || {onde: [], tipo: ""};
  const chip = (attr, v, on) => '<button type="button" class="chip" ' + attr + '="' + esc(v) + '" aria-pressed="' + !!on + '">' + esc(v) + '</button>';
  const lista = extrasLista().slice(0, 10);
  return '<article class="card"><p class="how">Postou uma trend, um achado ou uma ideia sua que não estava no plano? Anote aqui. No dia seguinte o Claude olha os números e diz se está no caminho certo.</p>' +
    '<div class="field"><span class="lab">Onde você postou?</span><div class="chips" id="xOnde">' + X_ONDE.map(v => chip("data-xonde", v, r.onde.indexOf(v) >= 0)).join("") + '</div></div>' +
    '<div class="field"><span class="lab">O que foi?</span><div class="chips" id="xTipo">' + X_TIPO.map(v => chip("data-xtipo", v, r.tipo === v)).join("") + '</div></div>' +
    '<div class="field"><label for="xTxt">O que você postou?</label><textarea class="input" id="xTxt" rows="3" placeholder="Ex.: trend do “parece caro” com o pisca-pisca da sala">' + esc(r.t || "") + '</textarea></div>' +
    '<div class="field"><label for="xLink">Link do post (se quiser)</label><input class="input" id="xLink" type="url" inputmode="url" placeholder="Cole o link do TikTok ou do Instagram" value="' + esc(r.link || "") + '"></div>' +
    '<div class="actions"><button class="btn main" data-xsalvar="1">✅ Salvar o que postei</button></div>' +
    (lista.length ? '<p class="resp-grupo">Seus extras</p>' + lista.map(x => '<div class="extra-item"><div><b>' + esc(x.data ? fmtDay(x.data, {day: "numeric", month: "short"}) : "") + ' · ' + esc((x.onde || []).join(", ") || "—") + (x.tipo ? ' · ' + esc(x.tipo) : '') + '</b>' +
      '<p>' + esc(x.t) + '</p>' + (x.link ? '<a href="' + esc(x.link) + '" target="_blank" rel="noopener">Ver o post</a>' : '') +
      (x.claude ? '<p class="extra-claude">💬 ' + esc(x.claude) + '</p>' : '<small>' + (x.env ? 'O Claude analisa amanhã.' : 'Vai para o Claude quando tiver internet.') + '</small>') + '</div>' +
      '<button class="btn mini" data-xapagar="' + esc(x.id) + '" aria-label="Apagar">✕</button></div>').join("") : '') + '</article>';
}
function rascunhoExtra(){
  state.extraRasc = state.extraRasc || {onde: [], tipo: ""};
  if ($("xTxt")) state.extraRasc.t = $("xTxt").value;
  if ($("xLink")) state.extraRasc.link = $("xLink").value;
  return state.extraRasc;
}
async function enviarExtra(x){
  const q = new URLSearchParams({acao: "extra", id: x.id, onde: (x.onde || []).join(", "), tipo: x.tipo || "", t: x.t, url: x.link || ""});
  if (x.apagar) q.set("apagar", "1");
  try { const j = await (await fetch(ROBO + "?" + q)).json(); return !!(j && j.ok); } catch(_) { return false; }
}
async function salvarExtra(){
  const r = rascunhoExtra(), t = String(r.t || "").trim();
  if (!t) { toast("Escreva o que você postou."); $("xTxt")?.focus(); return; }
  if (!r.onde.length) { toast("Toque onde você postou."); return; }
  const x = {id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), data: todayKey, onde: r.onde.slice(), tipo: r.tipo || "", t: t, link: String(r.link || "").trim(), env: false};
  state.extras = [x].concat(state.extras || []).slice(0, 60);
  state.extraRasc = {onde: [], tipo: ""}; save(); renderHoje();
  toast("Anotado! 🤍 Amanhã o Claude te conta como foi.");
  x.env = await enviarExtra(x); save();
  if (!x.env) toast("Salvei aqui no celular. Mando para o Claude quando a internet voltar.", 5000);
  else renderHoje();
}
async function apagarExtra(id){
  const x = extrasLista().find(e => e.id === id); if (!x) return;
  state.extras = (state.extras || []).filter(e => e.id !== id);
  state.extrasApagados = state.extrasApagados || {}; state.extrasApagados[id] = 1;
  save(); renderHoje(); toast("Apagado.");
  if (x.env) enviarExtra({id: id, t: "-", apagar: true});
}
async function reenviarExtras(){
  const pend = (state.extras || []).filter(x => !x.env);
  for (const x of pend) { x.env = await enviarExtra(x); }
  if (pend.length) save();
}
function analiseCard(){
  const a = conteudo().analise;
  if (!a) return "";
  return '<article class="card" style="border-color:var(--wine)"><div class="meta"><span class="tag serie">Como estou indo</span><span class="why">o Claude olhou seus números</span></div><p class="how" style="white-space:pre-line">' + esc(a) + '</p></article>';
}
async function loadIA(tent){
  try {
    const r = await fetch(ROBO); const j = await r.json();
    reenviarExtras();
    if (j && j.videos) { j.videos = j.videos.slice(-3); const novo = JSON.stringify(j) !== JSON.stringify(state.ia); state.ia = j; save();
      if (novo) { applyConteudo(); Object.keys(prOutputs).forEach(k => delete prOutputs[k]); const aba = document.querySelector('nav.tabs button[aria-selected="true"]')?.dataset.tab; if (aba === "hoje") renderHoje(); if (aba === "prontos") renderProntos(); } }
  } catch(_) { if ((tent || 0) < 3) setTimeout(() => loadIA((tent || 0) + 1), 4000); }
}
async function copyText(t){
  try { await navigator.clipboard.writeText(t); toast("Copiado! Agora é só colar."); }
  catch(_) { const a = document.createElement("textarea"); a.value = t; document.body.appendChild(a); a.select(); try { document.execCommand("copy"); toast("Copiado! Agora é só colar."); } catch(__) { toast("Não consegui copiar."); } a.remove(); }
}
// Manda a foto do produto + o pedido juntos (o celular abre a lista: escolha o ChatGPT ou o Gemini).
async function fotoNoChatGPT(v){
  try { await navigator.clipboard.writeText(v.pedidoFoto); } catch(_) {}
  try {
    const b = await (await fetch(v.foto)).blob();
    const f = new File([b], "produto.jpg", {type: b.type || "image/jpeg"});
    if (navigator.canShare && navigator.canShare({files: [f]})) { await navigator.share({files: [f], text: v.pedidoFoto}); toast("Escolha o ChatGPT. Se o pedido não aparecer escrito, é só colar: ele já está copiado.", 6000); return; }
  } catch(e) { if (e && e.name === "AbortError") return; }
  toast("O pedido está copiado. Salve a foto e mande no ChatGPT junto com o pedido.", 6000); salvarFoto(v);
}
async function salvarFoto(v){
  try {
    const b = await (await fetch(v.foto)).blob();
    const f = new File([b], "produto.jpg", {type: b.type || "image/jpeg"});
    if (navigator.canShare && navigator.canShare({files:[f]})) { await navigator.share({files:[f]}); return; }
  } catch(e) { if (e && e.name === "AbortError") return; }
  window.open(v.foto, "_blank"); toast("Segure o dedo na foto e toque em Baixar imagem.", 5000);
}

$("cards").addEventListener("click", e => {
  const cb = e.target.closest("button[data-copy]"); if (cb) { copyText(COPY[Number(cb.dataset.copy)]); return; }
  const rb = e.target.closest("button[data-resp]"); if (rb) { abrirResp(Number(rb.dataset.resp)); return; }
  const lb = e.target.closest("button[data-letra]"); if (lb) { const ta = $("respTxt"); ta.value = ta.value.replace(/opção [A-E]\b/g, "opção " + lb.dataset.letra); lb.parentNode.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", c === lb)); return; }
  if (e.target.closest("button[data-respcopiar]")) { copyText($("respTxt").value); return; }
  if (e.target.closest("button[data-respcolar]")) { colarLinkResp(); return; }
  if (e.target.closest("button[data-respfechar]")) { $("respPrev").innerHTML = ""; return; }
  const xo = e.target.closest("button[data-xonde]"); if (xo) { const r = rascunhoExtra(), v = xo.dataset.xonde, i = r.onde.indexOf(v); if (i >= 0) r.onde.splice(i, 1); else r.onde.push(v); xo.setAttribute("aria-pressed", i < 0); save(); return; }
  const xt = e.target.closest("button[data-xtipo]"); if (xt) { const r = rascunhoExtra(); r.tipo = r.tipo === xt.dataset.xtipo ? "" : xt.dataset.xtipo; xt.parentNode.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", c.dataset.xtipo === r.tipo)); save(); return; }
  if (e.target.closest("button[data-xsalvar]")) { salvarExtra(); return; }
  const xa = e.target.closest("button[data-xapagar]"); if (xa) { apagarExtra(xa.dataset.xapagar); return; }
  if (e.target.closest("button[data-conv]")) { converter(); return; }
  const gb = e.target.closest("button[data-gpt]"); if (gb) { fotoNoChatGPT(vid(Number(gb.dataset.gpt))); return; }
  const fb = e.target.closest("button[data-foto]"); if (fb) { salvarFoto(vid(Number(fb.dataset.foto))); return; }
  const sf = e.target.closest("button[data-salvarfoto]"); if (sf) { salvarUrl(grande(sf.querySelector("img").src)); return; }
  const cf = e.target.closest("button[data-corfoto]"); if (cf) { fotoDasCores(vid(Number(cf.dataset.corfoto))); return; }
  const tb = e.target.closest("button[data-troca]"); if (tb) { const [n, i] = tb.dataset.troca.split("-").map(Number), v0 = state.ia.videos[n]; state.iaTroca = state.iaTroca || {}; state.iaTroca[v0.id] = v0.opcoes[i]; save(); renderHoje(); toast("Trocado! Os pedidos e a legenda já estão com o produto novo."); return; }
  const dt = e.target.closest("button[data-destroca]"); if (dt) { const v0 = state.ia.videos[Number(dt.dataset.destroca)]; if (state.iaTroca) delete state.iaTroca[v0.id]; save(); renderHoje(); return; }
  const db = e.target.closest("button[data-iadone]"); if (db) { state.iaDone = state.iaDone || {}; state.iaDone[db.dataset.iadone] = state.iaDone[db.dataset.iadone] ? false : todayKey; save(); renderHoje(); return; }
  const pb = e.target.closest("button[data-pronto]");
  if (pb) { openPronto = pb.dataset.pronto; show("prontos"); setTimeout(() => document.querySelector('[data-pid="' + openPronto + '"]')?.scrollIntoView({block:"start"}), 50); return; }
  const b = e.target.closest("button[data-act]"); if (!b) return;
  const i = Number(b.closest(".card").dataset.i), p = PLAN[cur][i], k = cur + "-" + i;
  if (b.dataset.act === "done") { state.done[k] = !state.done[k]; save(); renderHoje(); }
  if (b.dataset.act === "roteiro") askClaude(promptRoteiro(p));
  if (b.dataset.act === "editar") { $("vTitle").value = p.k === "serie" ? p.t.split(" — ")[0].replace("Ep.", "MINHA PRIMEIRA ÁRVORE — EP.").toUpperCase() : p.t.toUpperCase(); show("editar"); }
});
$("arrived").addEventListener("click", e => { const id = e.target.closest("button[data-ask]")?.dataset.ask; if (id) askProduct(id); });
$("prev").onclick = () => { const i = DAYS.indexOf(cur); if (i > 0) { cur = DAYS[i-1]; renderHoje(); } };
$("next").onclick = () => { const i = DAYS.indexOf(cur); if (i < DAYS.length-1) { cur = DAYS[i+1]; renderHoje(); } };

// ---------- PRODUTOS ----------
let newPhoto = null, newCat = "Natal", newStatus = "tenho", filter = "Todos", confirmDel = null;
$("pCat").innerHTML = CATS.map(c => '<button type="button" class="chip" data-v="' + c + '" aria-pressed="' + (c === newCat) + '">' + c + '</button>').join("");
function chipGroup(el, set){ el.addEventListener("click", e => { const b = e.target.closest("button[data-v]"); if (!b) return; el.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b)); set(b.dataset.v); }); }
chipGroup($("pCat"), v => newCat = v);
chipGroup($("pStatus"), v => newStatus = v);
$("openAdd").onclick = () => { $("addForm").hidden = false; $("openAdd").hidden = true; $("pName").focus(); };
function resetAdd(){ $("addForm").reset(); $("addForm").hidden = true; $("openAdd").hidden = false; newPhoto = null; $("pPrev").hidden = true; $("pPhotoTxt").textContent = "Tirar ou escolher foto"; }
$("cancelAdd").onclick = resetAdd;
$("pPhoto").addEventListener("change", async e => {
  const f = e.target.files && e.target.files[0]; if (!f) return;
  newPhoto = await shrink(f, 900); $("pPrev").src = URL.createObjectURL(newPhoto); $("pPrev").hidden = false; $("pPhotoTxt").textContent = "Trocar foto";
});
$("addForm").addEventListener("submit", async e => {
  e.preventDefault();
  const n = $("pName").value.trim(); if (!n) return;
  const id = "p" + Date.now();
  if (newPhoto) await putPhoto(id, newPhoto);
  state.products.unshift({id, n, cat:newCat, status:newStatus, at: newStatus === "chegou" ? todayKey : null, note:$("pNote").value.trim(), hasPhoto: !!newPhoto, videos:0});
  save(); resetAdd(); renderProdutos(); toast("Produto salvo. Toque em \"Criar 3 vídeos\" quando quiser.");
});
async function askProduct(id){
  const p = state.products.find(x => x.id === id); if (!p) return;
  askClaude(promptProduto(p), p.hasPhoto ? await getPhoto(id) : null);
}
async function renderProdutos(){
  const cats = ["Todos"].concat(CATS.filter(c => state.products.some(p => p.cat === c)));
  $("pFilter").innerHTML = state.products.length ? cats.map(c => '<button class="chip" data-v="' + c + '" aria-pressed="' + (c === filter) + '">' + c + '</button>').join("") : "";
  const list = state.products.filter(p => filter === "Todos" || p.cat === filter);
  if (!state.products.length) { $("prodList").innerHTML = '<div class="empty">Nenhum produto ainda.<br>Toque em <b>+ Adicionar produto</b>, tire uma foto e pronto.<br>Comece pelas coisas de Natal que você comprou.</div>'; return; }
  $("prodList").innerHTML = list.map(p =>
    '<div class="prod" data-id="' + esc(p.id) + '">' +
      (p.hasPhoto ? '<img class="ph" data-ph="' + esc(p.id) + '" alt="">' : '<div class="ph">' + esc(p.n.charAt(0).toUpperCase()) + '</div>') +
      '<div class="info"><div class="n">' + esc(p.n) + '</div><div class="sm">' + esc(p.cat) + (p.note ? ' · ' + esc(p.note) : '') + '</div>' +
      '<button class="st ' + p.status + '" data-act="status">' + STATUS[p.status] + (p.status === "chegou" && p.at ? " " + esc(fmtDay(p.at, {day:"numeric", month:"short"})) : "") + '</button>' +
      '<div class="sm">' + (p.videos ? p.videos + " pedido(s) de vídeo" : "Ainda sem vídeo") + '</div></div>' +
      '<div class="actions"><button class="btn wine" data-act="ask">Criar 3 vídeos</button><button class="btn" data-act="del" aria-label="Apagar">Apagar</button></div>' +
      (confirmDel === p.id ? '<div class="confirm">Apagar este produto? <button class="btn wine" data-act="delyes">Sim, apagar</button><button class="btn" data-act="delno">Não</button></div>' : '') +
    '</div>').join("");
  for (const img of $("prodList").querySelectorAll("img[data-ph]")) { const u = await thumbURL(img.dataset.ph); if (u) img.src = u; }
}
$("pFilter").addEventListener("click", e => { const v = e.target.closest("button[data-v]")?.dataset.v; if (v) { filter = v; renderProdutos(); } });
$("prodList").addEventListener("click", async e => {
  const b = e.target.closest("button[data-act]"); if (!b) return;
  const id = b.closest(".prod").dataset.id, p = state.products.find(x => x.id === id); if (!p) return;
  const a = b.dataset.act;
  if (a === "ask") { p.videos = (p.videos || 0) + 1; save(); renderProdutos(); askProduct(id); }
  if (a === "status") { const order = ["tenho","caminho","chegou"]; p.status = order[(order.indexOf(p.status)+1) % 3]; p.at = p.status === "chegou" ? todayKey : null; save(); renderProdutos(); }
  if (a === "del") { confirmDel = id; renderProdutos(); }
  if (a === "delno") { confirmDel = null; renderProdutos(); }
  if (a === "delyes") { state.products = state.products.filter(x => x.id !== id); confirmDel = null; delPhoto(id); save(); renderProdutos(); }
});

// ---------- IDEIAS ----------
let ideaPhoto = null;
$("iPhoto").addEventListener("change", async e => {
  const f = e.target.files && e.target.files[0]; if (!f) return;
  ideaPhoto = await shrink(f, 900); $("iPrev").src = URL.createObjectURL(ideaPhoto); $("iPrev").hidden = false; $("iPhotoTxt").textContent = "Trocar foto";
});
async function saveIdea(andAsk){
  const text = $("iText").value.trim(); if (!text) { $("iText").focus(); return; }
  const id = "i" + Date.now();
  if (ideaPhoto) await putPhoto(id, ideaPhoto);
  const idea = {id, text, hasPhoto: !!ideaPhoto, at: todayKey};
  state.ideas.unshift(idea); save();
  const blob = ideaPhoto; $("ideaForm").reset(); ideaPhoto = null; $("iPrev").hidden = true; $("iPhotoTxt").textContent = "Foto (opcional)";
  renderIdeias();
  if (andAsk) askClaude(promptIdeia(idea), blob); else toast("Ideia salva.");
}
$("ideaForm").addEventListener("submit", e => { e.preventDefault(); saveIdea(true); });
$("iSaveOnly").onclick = () => saveIdea(false);
async function renderIdeias(){
  $("ideaList").innerHTML = state.ideas.map(i =>
    '<div class="prod" data-id="' + esc(i.id) + '">' +
      (i.hasPhoto ? '<img class="ph" data-ph="' + esc(i.id) + '" alt="">' : '<div class="ph">?</div>') +
      '<div class="info"><div class="n">' + esc(i.text) + '</div><div class="sm">' + esc(fmtDay(i.at, {day:"numeric", month:"short"})) + '</div></div>' +
      '<div class="actions"><button class="btn wine" data-act="ask">Criar vídeo</button><button class="btn" data-act="del">Apagar</button></div></div>').join("");
  for (const img of $("ideaList").querySelectorAll("img[data-ph]")) { const u = await thumbURL(img.dataset.ph); if (u) img.src = u; }
  renderGravar();
}
$("ideaList").addEventListener("click", async e => {
  const b = e.target.closest("button[data-act]"); if (!b) return;
  const id = b.closest(".prod").dataset.id, i = state.ideas.find(x => x.id === id); if (!i) return;
  if (b.dataset.act === "ask") askClaude(promptIdeia(i), i.hasPhoto ? await getPhoto(id) : null);
  if (b.dataset.act === "del") { state.ideas = state.ideas.filter(x => x.id !== id); delPhoto(id); save(); renderIdeias(); }
});
function renderGravar(){
  const i0 = Math.max(0, DAYS.indexOf(PLAN[todayKey] ? todayKey : cur));
  const ks = DAYS.slice(i0, i0 + 7), grav = [];
  ks.forEach(k => PLAN[k].forEach((p, i) => { if (p.k !== "serie") grav.push({k, i, p}); }));
  $("gravNote").textContent = grav.filter(g => state.grav[g.k+"-"+g.i]).length + " de " + grav.length + " gravados nos próximos 7 dias. A série fica de fora: depende do que chegar.";
  $("gravList").innerHTML = grav.map(g => { const id = "g-" + g.k + "-" + g.i; return '<label class="row" for="' + id + '"><input type="checkbox" id="' + id + '" data-g="' + g.k + "-" + g.i + '"' + (state.grav[g.k+"-"+g.i] ? " checked" : "") + '><span><b>' + esc(g.p.t) + '</b><br><span class="note">' + esc(fmtDay(g.k, {weekday:"short", day:"numeric"})) + ' · ' + LABEL[g.p.k] + '</span></span></label>'; }).join("");
}
$("gravList").addEventListener("change", e => { const g = e.target.dataset.g; if (g) { state.grav[g] = e.target.checked; save(); renderGravar(); } });

// ---------- EDITAR ----------
const LEVELS = {leve:{minSil:0.70, pad:0.20, k:0.25}, normal:{minSil:0.40, pad:0.12, k:0.33}, forte:{minSil:0.25, pad:0.07, k:0.40}};
let vfile = null, vurl = null, analysis = null, level = "normal", outBlob = null, outExt = "mp4";
const fmt = s => { s = Math.max(0, Math.round(s)); return Math.floor(s/60) + ":" + pad(s%60); };
$("vFile").addEventListener("change", async e => {
  const f = e.target.files && e.target.files[0]; if (!f) return;
  vfile = f; if (vurl) URL.revokeObjectURL(vurl); vurl = URL.createObjectURL(f);
  $("pickText").textContent = f.name; $("pickInfo").textContent = "Lendo o áudio do vídeo...";
  ["s2","s3","s4"].forEach(id => $(id).classList.add("off")); analysis = null; legVez++; legendas = null; legPromessa = null; mostrarLegendas(); legStatus("");
  try {
    analysis = await analyzeAudio(f);
    if (analysis.duration > 185) { $("pickInfo").textContent = "Esse vídeo tem mais de 3 minutos. Escolha um mais curto."; return; }
    $("pickInfo").textContent = "Duração: " + fmt(analysis.duration) + ". Toque para trocar.";
  } catch (err) {
    analysis = {duration: await videoDuration(vurl), env:null};
    $("pickInfo").textContent = "Não consegui ler o áudio. O vídeo vai sair só com o título, sem tirar pausas.";
  }
  $("s2").classList.remove("off"); $("s3").classList.remove("off"); showPlan();
  $("legBox").hidden = !$("vLeg").checked; transcrever();
});
function videoDuration(u){ return new Promise((res, rej) => { const v = document.createElement("video"); v.preload = "metadata"; v.onloadedmetadata = () => res(v.duration); v.onerror = rej; v.src = u; }); }
async function analyzeAudio(f){
  const buf = await f.arrayBuffer();
  const AC = window.AudioContext || window.webkitAudioContext, ac = new AC();
  const audio = await ac.decodeAudioData(buf); ac.close();
  const sr = audio.sampleRate, win = Math.round(sr * 0.02), n = Math.floor(audio.length / win);
  const chans = []; for (let c = 0; c < audio.numberOfChannels; c++) chans.push(audio.getChannelData(c));
  const env = new Float32Array(n);
  for (let i = 0; i < n; i++) { let s = 0; const a = i * win; for (let j = 0; j < win; j++) { let x = 0; for (const ch of chans) x += ch[a+j]; x /= chans.length; s += x*x; } env[i] = 10 * Math.log10(s / win + 1e-10); }
  let wav = null; try { wav = await wav16k(audio); } catch(_) {}
  return {duration: audio.duration, env, step: 0.02, wav};
}
// ---------- LEGENDA AUTOMÁTICA ----------
// O som vai (WAV 16 kHz, mono) para o robô do Google, que pede ao Gemini o texto.
// O tempo de cada pedaço é calculado aqui, pelos trechos em que ela está falando.
async function wav16k(audio){
  const sr = 16000, len = Math.max(1, Math.ceil(audio.duration * sr));
  const oc = new OfflineAudioContext(1, len, sr), s = oc.createBufferSource();
  s.buffer = audio; s.connect(oc.destination); s.start();
  const d = (await oc.startRendering()).getChannelData(0);
  const out = new ArrayBuffer(44 + d.length * 2), v = new DataView(out);
  const txt = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
  txt(0, "RIFF"); v.setUint32(4, 36 + d.length * 2, true); txt(8, "WAVEfmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); txt(36, "data"); v.setUint32(40, d.length * 2, true);
  for (let i = 0; i < d.length; i++) { const x = Math.max(-1, Math.min(1, d[i])); v.setInt16(44 + i * 2, x < 0 ? x * 0x8000 : x * 0x7FFF, true); }
  return new Uint8Array(out);
}
function base64De(u8){ let s = ""; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); }
let legendas = null, legPromessa = null, legVez = 0, legEstilo = "branca";
// Espalha os pedaços de texto pelos momentos de fala (proporcional ao tamanho de cada pedaço).
// Cada frase (termina em . ! ? …) fica entre as maiores pausas da fala.
function alinharLegenda(falas, an){
  const runs = an.env ? segmentsFor(an, "forte") : [{s: 0, e: an.duration}];
  let grupos = [], g = [];
  falas.forEach(f => { g.push(f); if (/[.!?…]["”'»)]?$/.test(f.t.trim())) { grupos.push(g); g = []; } });
  if (g.length) grupos.push(g);
  let regioes;
  if (grupos.length > 1 && runs.length >= grupos.length) {
    const cortes = runs.slice(1).map((r, i) => ({i, d: r.s - runs[i].e})).sort((a, b) => b.d - a.d).slice(0, grupos.length - 1).map(x => x.i).sort((a, b) => a - b);
    regioes = []; let ini = 0;
    cortes.forEach(i => { regioes.push(runs.slice(ini, i + 1)); ini = i + 1; });
    regioes.push(runs.slice(ini));
  } else { grupos = [falas]; regioes = [runs]; }
  const out = [];
  grupos.forEach((gr, k) => out.push(...espalhar(gr, regioes[k])));
  return out;
}
// Espalha os pedaços pelos trechos de fala, proporcional ao tamanho de cada pedaço.
function espalhar(falas, runs){
  const total = runs.reduce((a, r) => a + r.e - r.s, 0);
  const pesos = falas.map(f => Math.max(4, f.t.replace(/[^\p{L}\p{N}]/gu, "").length + 2));
  const soma = pesos.reduce((a, b) => a + b, 0);
  const em = x => { let falta = x * total; for (const r of runs) { const d = r.e - r.s; if (falta <= d + 1e-6) return r.s + falta; falta -= d; } return runs[runs.length - 1].e; };
  let acc = 0;
  return falas.map((f, i) => { const s = em(acc / soma); acc += pesos[i]; return {s, e: em(acc / soma), t: f.t}; });
}
function mostrarLegendas(){
  const box = $("legLista"); if (!box) return;
  box.innerHTML = (legendas || []).map((l, i) => '<label><small>' + fmt(l.s) + '</small><input class="input" data-leg="' + i + '" value="' + esc(l.t) + '" aria-label="Legenda ' + (i + 1) + '"></label>').join("");
}
function legStatus(t, err){ $("legStatus").textContent = t; $("legStatus").className = "status" + (err ? " err" : ""); }
async function transcrever(){
  if (!analysis || !$("vLeg").checked) return;
  if (!analysis.wav) { legStatus("Não consegui ler o som deste vídeo. Ele vai sair sem legenda.", true); return; }
  const vez = ++legVez; legendas = null; mostrarLegendas();
  const t0 = Date.now(), relogio = setInterval(() => { if (vez !== legVez || legendas) return clearInterval(relogio); const s = Math.round((Date.now() - t0) / 1000); legStatus(s > 90 ? "O robô demorou. Tentando de novo… " + s + " s" : "Escrevendo a legenda… " + s + " s (leva até 1 minuto). Pode ir escolhendo o resto."); }, 1000);
  legStatus("Escrevendo a legenda… leva até 1 minuto. Pode ir escolhendo o resto.");
  legPromessa = (async () => {
    try {
      const corpo = JSON.stringify({acao: "legenda", mime: "audio/wav", audio: base64De(analysis.wav)});
      // às vezes o Gemini trava: espera até 90 s e tenta mais uma vez
      let j = null;
      for (let tent = 0; tent < 2 && !j; tent++) {
        const ctl = new AbortController(), limite = setTimeout(() => ctl.abort(), 90000);
        try { j = await (await fetch(ROBO, {method: "POST", headers: {"Content-Type": "text/plain;charset=utf-8"}, body: corpo, signal: ctl.signal})).json(); }
        catch (e) { if (tent === 1 || vez !== legVez) throw e; }
        finally { clearTimeout(limite); }
      }
      if (vez !== legVez) return;
      if (!j.falas) throw new Error(j.erro || "sem resposta");
      if (!j.falas.length) { legStatus("Não ouvi fala neste vídeo. Ele vai sair sem legenda."); return; }
      legendas = alinharLegenda(j.falas, analysis); mostrarLegendas();
      legStatus("Legenda pronta! Toque numa linha para corrigir. Apague o texto para tirar a linha.");
    } catch (e) { if (vez === legVez) legStatus("Não consegui fazer a legenda (" + (/fetch|abort/i.test(e.message || "") || !e.message ? "a internet caiu ou o robô demorou demais" : e.message) + "). Tente de novo desmarcando e marcando a caixa.", true); }
    finally { clearInterval(relogio); }
  })();
  return legPromessa;
}
$("vLeg").addEventListener("change", () => { $("legBox").hidden = !$("vLeg").checked; if ($("vLeg").checked && !legendas) transcrever(); });
$("legLista").addEventListener("input", e => { const i = e.target.dataset.leg; if (i != null && legendas && legendas[i]) legendas[i].t = e.target.value; });
chipGroup($("legEstilo"), v => { legEstilo = v; });
function legendaEm(t){ if (!legendas) return ""; for (const l of legendas) if (t >= l.s && t < l.e) return l.t.trim(); return ""; }
function drawLegenda(ctx, W, H, text){
  if (!text) return;
  const size = Math.round(W * 0.072);
  ctx.font = "900 " + size + "px 'Nunito Sans', system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const lines = wrapLines(ctx, text, W * 0.86), lh = size * 1.2, y0 = H * 0.72 - (lines.length - 1) * lh / 2;
  if (legEstilo === "vinho") {
    const padX = size * 0.5, padY = size * 0.3, boxW = Math.min(W * 0.94, Math.max(...lines.map(l => ctx.measureText(l).width)) + padX * 2), boxH = lines.length * lh + padY * 2;
    const x = (W - boxW) / 2, y = y0 - lh / 2 - padY, r = size * 0.4;
    ctx.fillStyle = "rgba(142,27,58,0.92)"; ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+boxW,y,x+boxW,y+boxH,r); ctx.arcTo(x+boxW,y+boxH,x,y+boxH,r); ctx.arcTo(x,y+boxH,x,y,r); ctx.arcTo(x,y,x+boxW,y,r); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#FFFFFF"; lines.forEach((l, i) => ctx.fillText(l, W / 2, y0 + lh * i));
    return;
  }
  ctx.lineJoin = "round"; ctx.lineWidth = size * 0.2; ctx.strokeStyle = "#000000"; ctx.fillStyle = legEstilo === "amarela" ? "#FFE14D" : "#FFFFFF";
  lines.forEach((l, i) => { ctx.strokeText(l, W / 2, y0 + lh * i); ctx.fillText(l, W / 2, y0 + lh * i); });
}
function segmentsFor(an, lv){
  const L = LEVELS[lv];
  if (!an.env) return [{s:0, e:an.duration}];
  const sorted = Array.from(an.env).sort((a,b) => a-b);
  const floor = sorted[Math.floor(sorted.length*0.10)], peak = sorted[Math.floor(sorted.length*0.95)];
  if (peak - floor < 6) return [{s:0, e:an.duration}];
  const thr = floor + (peak - floor) * L.k, runs = []; let start = -1;
  for (let i = 0; i <= an.env.length; i++) { const on = i < an.env.length && an.env[i] > thr; if (on && start < 0) start = i; if (!on && start >= 0) { runs.push({s:start*an.step, e:i*an.step}); start = -1; } }
  if (!runs.length) return [{s:0, e:an.duration}];
  const merged = []; for (const r of runs) { const last = merged[merged.length-1]; if (last && r.s - last.e < L.minSil) last.e = r.e; else merged.push({s:r.s, e:r.e}); }
  const segs = merged.filter(r => r.e - r.s >= 0.12).map(r => ({s:Math.max(0, r.s - L.pad), e:Math.min(an.duration, r.e + L.pad)}));
  const out = []; for (const r of segs) { const last = out[out.length-1]; if (last && r.s <= last.e + 0.05) last.e = Math.max(last.e, r.e); else out.push(r); }
  return out.length ? out : [{s:0, e:an.duration}];
}
function showPlan(){
  if (!analysis) return;
  const segs = segmentsFor(analysis, level), kept = segs.reduce((a, r) => a + r.e - r.s, 0);
  $("vStats").innerHTML = "<span>Antes <b>" + fmt(analysis.duration) + "</b></span><span>Depois <b>" + fmt(kept) + "</b></span><span>Cortes <b>" + Math.max(0, segs.length-1) + "</b></span>";
  const tl = $("vTimeline"); tl.innerHTML = "";
  segs.forEach(r => { const i = document.createElement("i"); i.style.left = (r.s/analysis.duration*100) + "%"; i.style.width = ((r.e-r.s)/analysis.duration*100) + "%"; tl.appendChild(i); });
  tl.hidden = false;
}
chipGroup($("level"), v => { level = v; showPlan(); });
function pickMime(){
  const opts = ["video/mp4;codecs=avc1.42E01E,mp4a.40.2","video/mp4;codecs=avc1,mp4a","video/mp4","video/webm;codecs=vp9,opus","video/webm;codecs=vp8,opus","video/webm"];
  for (const m of opts) if (window.MediaRecorder && MediaRecorder.isTypeSupported(m)) return m;
  return "";
}
function wrapLines(ctx, text, maxW){ const words = text.split(/\s+/), lines = []; let line = ""; for (const w of words) { const t = line ? line + " " + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; } if (line) lines.push(line); return lines.slice(0, 2); }
function drawTitle(ctx, W, H, text){
  if (!text) return;
  const size = Math.round(W * 0.062);
  ctx.font = "900 " + size + "px 'Nunito Sans', system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const lines = wrapLines(ctx, text, W * 0.84), lh = size * 1.18, padX = size * 0.6, padY = size * 0.4;
  const boxW = Math.min(W * 0.92, Math.max(...lines.map(l => ctx.measureText(l).width)) + padX*2), boxH = lines.length * lh + padY*2;
  const x = (W - boxW)/2, y = H * 0.09, r = size * 0.45;
  ctx.fillStyle = "rgba(142,27,58,0.92)";
  ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+boxW,y,x+boxW,y+boxH,r); ctx.arcTo(x+boxW,y+boxH,x,y+boxH,r); ctx.arcTo(x,y+boxH,x,y,r); ctx.arcTo(x,y,x+boxW,y,r); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#FFFFFF"; lines.forEach((l, i) => ctx.fillText(l, W/2, y + padY + lh*(i+0.5)));
}
function vSetStatus(t, err){ $("vStatus").textContent = t; $("vStatus").className = "status" + (err ? " err" : ""); }
$("vGo").addEventListener("click", async () => {
  if (!vfile || !analysis) return;
  const mime = pickMime();
  if (!mime) { vSetStatus("Este celular não consegue gravar o vídeo editado. Abra o app pelo Chrome.", true); return; }
  outExt = mime.startsWith("video/mp4") ? "mp4" : "webm";
  $("vGo").disabled = true; $("vBarBox").hidden = false; $("s4").classList.add("off");
  let wake = null; try { wake = await navigator.wakeLock?.request("screen"); } catch(_) {}
  if ($("vLeg").checked && legPromessa && !legendas) { vSetStatus("Esperando a legenda ficar pronta…"); await legPromessa; }
  try {
    outBlob = await render(segmentsFor(analysis, level), $("vTitle").value.trim(), $("vZoom").checked, mime);
    $("vOut").src = URL.createObjectURL(outBlob); $("s4").classList.remove("off");
    vSetStatus("Pronto! Confira o vídeo abaixo."); $("s4").scrollIntoView({behavior:"smooth", block:"start"});
  } catch (err) { vSetStatus("A edição parou no meio. Tente de novo sem sair da tela. Se repetir, escolha \"Só as longas\".", true); }
  try { wake && wake.release(); } catch(_) {}
  $("vGo").disabled = false;
});
async function render(segs, title, zoom, mime){
  const comLegenda = $("vLeg").checked && legendas && legendas.length;
  try { await document.fonts.load("900 40px 'Nunito Sans'"); } catch(_) {}
  const v = document.createElement("video"); v.playsInline = true; v.preload = "auto"; v.src = vurl;
  await new Promise((res, rej) => { v.onloadedmetadata = res; v.onerror = rej; });
  const vw = v.videoWidth || 720, vh = v.videoHeight || 1280, sc = Math.min(1, 1280 / Math.max(vw, vh));
  const W = Math.round(vw*sc/2)*2, H = Math.round(vh*sc/2)*2, cv = $("cv"); cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d");
  const AC = window.AudioContext || window.webkitAudioContext, actx = new AC(); await actx.resume();
  const src = actx.createMediaElementSource(v), dest = actx.createMediaStreamDestination(); src.connect(dest);
  const stream = new MediaStream([...cv.captureStream(30).getVideoTracks(), ...dest.stream.getAudioTracks()]);
  const rec = new MediaRecorder(stream, {mimeType: mime, videoBitsPerSecond: 6000000, audioBitsPerSecond: 128000});
  const chunks = []; rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
  const stopped = new Promise(res => rec.onstop = res);
  let segIndex = 0, running = true;
  const draw = () => { if (!running) return; const z = zoom && segIndex % 2 === 1 ? 1.12 : 1, dw = W*z, dh = H*z; ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H); ctx.drawImage(v, (W-dw)/2, (H-dh)*0.42, dw, dh); drawTitle(ctx, W, H, title); drawLegenda(ctx, W, H, comLegenda ? legendaEm(v.currentTime) : ""); requestAnimationFrame(draw); };
  const total = segs.reduce((a, r) => a + r.e - r.s, 0); let done = 0;
  const seek = t => new Promise(res => { v.onseeked = () => res(); v.currentTime = t; });
  await seek(segs[0].s); requestAnimationFrame(draw);
  rec.start(500); rec.pause();
  for (let i = 0; i < segs.length; i++) {
    const r = segs[i]; segIndex = i;
    if (i > 0) await seek(r.s);
    await new Promise(res => setTimeout(res, 60));
    rec.resume(); await v.play();
    await new Promise(res => { const tick = () => { const p = done + Math.max(0, v.currentTime - r.s); $("vBar").style.width = Math.min(100, p/total*100) + "%"; vSetStatus("Editando... " + fmt(p) + " de " + fmt(total)); if (v.currentTime >= r.e || v.ended) { v.pause(); res(); } else setTimeout(tick, 15); }; tick(); });
    rec.pause(); done += r.e - r.s;
  }
  rec.resume(); await new Promise(res => setTimeout(res, 120)); rec.stop(); await stopped;
  running = false; actx.close(); $("vBar").style.width = "100%";
  return new Blob(chunks, {type: mime.split(";")[0]});
}
function outName(){ const d = new Date(); return "daia-editado-" + d.getFullYear() + pad(d.getMonth()+1) + pad(d.getDate()) + "-" + pad(d.getHours()) + pad(d.getMinutes()) + "." + outExt; }
$("vShare").addEventListener("click", async () => {
  if (!outBlob) return;
  const f = new File([outBlob], outName(), {type: outBlob.type});
  if (navigator.canShare && navigator.canShare({files:[f]})) { try { await navigator.share({files:[f]}); return; } catch(e) { if (e && e.name === "AbortError") return; } }
  $("vSaveStatus").textContent = "Este celular não deixou enviar direto. Toque em Salvar no celular e suba pelo TikTok.";
});
$("vSave").addEventListener("click", () => {
  if (!outBlob) return;
  const a = document.createElement("a"); a.href = URL.createObjectURL(outBlob); a.download = outName(); document.body.appendChild(a); a.click(); a.remove();
  $("vSaveStatus").textContent = "Salvo na pasta Downloads. Ele aparece na galeria em \"Downloads\".";
});

// ---------- PRONTOS (carrosséis gerados no celular) ----------
let openPronto = null, prFormat = "ig";
const prOutputs = {}, prVideos = {};
state.prontos = state.prontos || {};
function prontoDoDia(k){ const i = Math.max(0, DAYS.indexOf(k)); return PR[i % PR.length]; }
$("handle").value = state.handle || "";
$("handle").addEventListener("change", () => { state.handle = $("handle").value.trim(); save(); Object.keys(prOutputs).forEach(k => delete prOutputs[k]); renderProntos(); });
// Estilo Dale Daia: foto real em todas as imagens, texto branco, letra fina inclinada + letra grossa.
const SERIF = "'DM Serif Display', Georgia, serif", SANS = "'Nunito Sans', sans-serif";
function wrapText(ctx, text, maxW, maxLines){
  const words = String(text).split(/\s+/), lines = []; let line = "";
  for (const w of words) { const t = line ? line + " " + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
  if (line) lines.push(line);
  return maxLines ? lines.slice(0, maxLines) : lines;
}
// zoom/dx/dy servem para o movimento suave do vídeo
function paintPhoto(ctx, W, H, img, dark, zoom, dx, dy){
  ctx.fillStyle = "#1A1114"; ctx.fillRect(0, 0, W, H);
  if (img) {
    const z = zoom || 1, s = Math.max(W / img.width, H / img.height) * z, dw = img.width * s, dh = img.height * s;
    ctx.drawImage(img, (W - dw) / 2 + (dx || 0) * W, (H - dh) / 2 + (dy || 0) * H, dw, dh);
  }
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "rgba(15,8,10," + (0.10 + dark*0.2) + ")");
  g.addColorStop(0.45, "rgba(15,8,10," + (0.18 + dark*0.35) + ")");
  g.addColorStop(1, "rgba(15,8,10," + (0.55 + dark*0.3) + ")");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function shadowOn(ctx, W){ ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = W*0.02; ctx.shadowOffsetY = W*0.003; }
function shadowOff(ctx){ ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; }
function drawHandle(ctx, W, H, extra){
  const h = state.handle || "";
  ctx.font = "700 " + Math.round(W*0.03) + "px " + SANS; ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.textAlign = "center"; ctx.fillText([h, extra].filter(Boolean).join("   ·   "), W/2, H*0.95);
}
// a = quanto do texto já apareceu (0 a 1), usado no vídeo
function drawProntoSlide(ctx, W, H, p, n, total, imgs, opt){
  opt = opt || {}; const a = opt.a == null ? 1 : opt.a;
  // imgs = [capa, final, dica 1, dica 2, ...]: cada imagem do carrossel tem a sua foto
  const img = n === 0 ? imgs[0] : n === total - 1 ? (imgs[1] || imgs[0]) : (imgs[n + 1] || imgs[0]);
  paintPhoto(ctx, W, H, img, n === 0 ? 0 : (p.tipo === "achados" && n < total - 1 ? 0.15 : 0.6), opt.zoom, opt.dx, opt.dy);
  ctx.textBaseline = "alphabetic"; ctx.fillStyle = "#FFFFFF"; ctx.globalAlpha = a; shadowOn(ctx, W);
  const mw = W * 0.84, rise = (1 - a) * W * 0.03;
  if (n === 0) {
    ctx.textAlign = "center";
    const s1 = Math.round(W*0.105), s2 = Math.round(W*0.092);
    ctx.font = "italic " + s1 + "px " + SERIF; const l1 = wrapText(ctx, p.c1, mw, 2);
    ctx.font = "900 " + s2 + "px " + SANS; const l2 = wrapText(ctx, p.c2, mw, 3);
    const blockH = l1.length*s1*1.05 + l2.length*s2*1.08;
    let y = H*0.70 - blockH/2 + rise;
    ctx.font = "italic " + s1 + "px " + SERIF; l1.forEach(l => { y += s1*1.05; ctx.fillText(l, W/2, y); });
    ctx.font = "900 " + s2 + "px " + SANS; l2.forEach(l => { y += s2*1.08; ctx.fillText(l, W/2, y); });
    shadowOff(ctx); drawHandle(ctx, W, H, opt.video ? "" : "arrasta →");
  } else if (n < total - 1) {
    const [t, body] = p.s[n-1];
    ctx.textAlign = "center";
    const sn = Math.round(W*0.06), st = Math.round(W*0.088), sb = Math.round(W*0.05);
    ctx.font = "italic " + st + "px " + SERIF; const lt = wrapText(ctx, t, mw, 3);
    ctx.font = "600 " + sb + "px " + SANS; const lb = wrapText(ctx, body, mw*0.95, 5);
    const blockH = sn*1.3 + lt.length*st*1.08 + W*0.03 + lb.length*sb*1.35;
    let y = H*0.885 - blockH - (p.tipo === "achados" ? W*0.075 : 0) + rise; // texto embaixo, para o produto aparecer na foto
    ctx.fillStyle = "#F1D29A"; ctx.font = "italic " + sn + "px " + SERIF; y += sn; ctx.fillText((p.tipo === "achados" ? "Achado " : "") + String(n).padStart(2,"0"), W/2, y); y += sn*0.3;
    ctx.fillStyle = "#FFFFFF"; ctx.font = "italic " + st + "px " + SERIF; lt.forEach(l => { y += st*1.08; ctx.fillText(l, W/2, y); });
    y += W*0.03; ctx.font = "600 " + sb + "px " + SANS; lb.forEach(l => { y += sb*1.35; ctx.fillText(l, W/2, y); });
    if (p.tipo === "achados") { ctx.font = "800 " + Math.round(W*0.034) + "px " + SANS; ctx.fillStyle = "#F1D29A"; ctx.fillText("Comenta QUERO que eu te mando o link", W/2, y + W*0.065); }
    shadowOff(ctx); drawHandle(ctx, W, H, opt.video ? "" : (n+1) + "/" + total);
  } else {
    ctx.textAlign = "center";
    const s1 = Math.round(W*0.1); ctx.font = "italic " + s1 + "px " + SERIF;
    const ls = wrapText(ctx, p.fim, mw, 4); let y = H*0.55 - (ls.length*s1*1.08)/2 + rise;
    ls.forEach(l => { y += s1*1.08; ctx.fillText(l, W/2, y); });
    ctx.font = "800 " + Math.round(W*0.042) + "px " + SANS; ctx.fillStyle = "#F1D29A";
    ctx.fillText("Promoções reais no grupo · link na bio", W/2, y + W*0.1);
    shadowOff(ctx); drawHandle(ctx, W, H, opt.video ? "" : total + "/" + total);
  }
  ctx.globalAlpha = 1;
}
function loadImgURL(u){ return new Promise(res => { if (!u) return res(null); const i = new Image(); if (/^https?:\/\//.test(u) &&!u.startsWith(location.origin)) i.crossOrigin = "anonymous"; i.onload = () => res(i); i.onerror = () => res(null); i.src = u; }); }
function loadImg(blob){ return blob ? loadImgURL(URL.createObjectURL(blob)) : Promise.resolve(null); }
async function prontoImgs(p){
  const own = await loadImg(await getPhoto("bg-" + p.id));
  if (p.tipo === "achados") { const capa = await loadImgURL(p.capa || "c-" + p.id + ".jpg"); const fotos = await Promise.all(p.itens.map((it, i) => loadImgURL(it[3] || "p-" + p.id + "-" + (i + 1) + ".jpg"))); return [own || capa, own || capa].concat(fotos.map(f => f || capa)); }
  const [f1, f2] = await Promise.all([loadImgURL("f-" + p.id + "-1.jpg"), loadImgURL("f-" + p.id + "-2.jpg")]);
  const dicas = await Promise.all(p.s.map((_, i) => loadImgURL("s-" + p.id + "-" + (i + 1) + ".jpg")));
  return [own || f1 || f2, f2 || f1].concat(dicas.map(d => d || f2 || f1));
}
async function fontsReady(){ try { await Promise.all([document.fonts.load("italic 60px 'DM Serif Display'"), document.fonts.load("900 60px 'Nunito Sans'"), document.fonts.load("600 40px 'Nunito Sans'"), document.fonts.load("700 30px 'Nunito Sans'"), document.fonts.load("800 30px 'Nunito Sans'")]); } catch(_) {} }
async function buildPronto(p){
  await fontsReady();
  const W = 1080, H = prFormat === "ig" ? 1350 : 1920, total = p.s.length + 2, imgs = await prontoImgs(p);
  const c = document.createElement("canvas"); c.width = W; c.height = H; const ctx = c.getContext("2d");
  const blobs = [];
  for (let n = 0; n < total; n++) { drawProntoSlide(ctx, W, H, p, n, total, imgs); blobs.push(await new Promise(r => c.toBlob(r, "image/jpeg", 0.9))); }
  return blobs;
}
// Vídeo pronto (9:16): cada imagem ~2,4 s com zoom suave e o texto subindo. Sem som: o áudio em alta você escolhe no TikTok.
async function buildVideo(p, onProgress){
  await fontsReady();
  const mime = pickMime(); if (!mime) throw new Error("sem gravador");
  const W = 720, H = 1280, total = p.s.length + 2, imgs = await prontoImgs(p), per = 2.4, fps = 30;
  const c = document.createElement("canvas"); c.width = W; c.height = H; const ctx = c.getContext("2d");
  drawProntoSlide(ctx, W, H, p, 0, total, imgs, {a:0, zoom:1, video:true});
  const stream = c.captureStream(fps), rec = new MediaRecorder(stream, {mimeType: mime, videoBitsPerSecond: 5000000});
  const chunks = []; rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
  const stopped = new Promise(r => rec.onstop = r);
  rec.start(500);
  const t0 = performance.now(), dur = total * per * 1000;
  await new Promise(res => {
    const step = () => {
      const t = performance.now() - t0; if (t >= dur) return res();
      const n = Math.min(total - 1, Math.floor(t / (per*1000))), local = (t - n*per*1000) / (per*1000);
      const dir = n % 2 ? -1 : 1;
      drawProntoSlide(ctx, W, H, p, n, total, imgs, {a: Math.min(1, local / 0.25), zoom: 1.04 + local*0.06, dx: dir*local*0.015, dy: -local*0.01, video:true});
      onProgress && onProgress(t / dur);
      setTimeout(step, 1000/fps);
    };
    step();
  });
  rec.stop(); await stopped;
  return new Blob(chunks, {type: mime.split(";")[0]});
}
async function renderProntos(){
  $("prontoList").innerHTML = PR.map(p => {
    const open = openPronto === p.id, done = state.prontos[p.id];
    return '<article class="card" data-pid="' + p.id + '">' +
      '<div class="pr-head"><img class="pr-cover" data-cover="' + p.id + '" src="' + esc(p.tipo === "achados" ? (p.capa || "c-" + p.id + ".jpg") : "f-" + p.id + "-1.jpg") + '" loading="lazy" alt=""><div class="info"><h3 class="title" style="font-size:19px">' + esc(p.c1 + " " + p.c2) + '</h3>' +
      '<p class="note">' + (p.s.length + 2) + ' imagens' + (done ? ' · <b>postado ✓</b>' : '') + '</p>' +
      '<div class="actions"><button class="btn ' + (open ? '' : 'wine') + '" data-pa="toggle">' + (open ? "Fechar" : "Abrir") + '</button></div></div></div>' +
      (open ? '<div class="field"><span class="lab">Formato</span><div class="chips" data-pa="fmt">' +
        '<button type="button" class="chip" data-v="ig" aria-pressed="' + (prFormat === "ig") + '">Instagram (4:5)</button>' +
        '<button type="button" class="chip" data-v="tt" aria-pressed="' + (prFormat === "tt") + '">TikTok (9:16)</button></div></div>' +
        '<label class="photo" for="bg-' + p.id + '"><span>Usar uma foto sua na capa (opcional)</span><input type="file" accept="image/*" id="bg-' + p.id + '" data-pa="bg"></label>' +
        '<div class="slides" id="sl-' + p.id + '"><p class="note">Gerando as imagens...</p></div>' +
        '<div class="leg sel">' + esc(p.leg + "\n\n" + p.tags) + '</div>' +
        '<div class="actions"><button class="btn wine" data-pa="share">Postar (envia as imagens)</button><button class="btn" data-pa="copy">Copiar legenda</button><button class="btn" data-pa="save">Salvar imagens</button>' +
        '<button class="btn main" data-pa="done">' + (done ? "Postado ✓" : "Marcar como postado") + '</button></div>' +
        (p.itens ? '<div class="field"><span class="lab">Alguém comentou QUERO?</span><p class="note">Copie e mande no direct: já vai com os 5 links, todos SEUS links de afiliada. (Fotos dos produtos: Telegram › PACK VIP DE FOTOS PARA CARROSSEL › CASA/DECORAÇÃO › ' + esc(p.album) + '.)</p><button class="btn" data-pa="links">Copiar resposta com os links</button></div>' : '') +
        '<div class="field"><span class="lab">Quer vídeo?</span><p class="note">Os vídeos de IA dos produtos e os vídeos prontos dos seus packs ficam na tela Hoje.</p></div>' : '') +
    '</article>';
  }).join("");
  for (const p of PR) {
    const own = await getPhoto("bg-" + p.id);
    if (own) { const el = document.querySelector('[data-cover="' + p.id + '"]'); if (el) el.src = URL.createObjectURL(own); }
  }
  if (openPronto) {
    const p = PR.find(x => x.id === openPronto), key = p.id + "-" + prFormat;
    if (!prOutputs[key]) prOutputs[key] = await buildPronto(p);
    const box = $("sl-" + p.id); if (!box) return;
    const urls = prOutputs[key].map(b => URL.createObjectURL(b));
    box.innerHTML = urls.map(u => '<img src="' + u + '" alt="">').join("");
    const cv = document.querySelector('[data-cover="' + p.id + '"]'); if (cv) cv.src = urls[0];
  }
}
$("prontoList").addEventListener("click", async e => {
  const b = e.target.closest("[data-pa]"); if (!b) return;
  const pid = b.closest("[data-pid]").dataset.pid, p = PR.find(x => x.id === pid), a = b.dataset.pa;
  if (a === "toggle") { openPronto = openPronto === pid ? null : pid; renderProntos(); return; }
  if (a === "fmt") { const v = e.target.closest("button[data-v]")?.dataset.v; if (v && v !== prFormat) { prFormat = v; renderProntos(); } return; }
  const blobs = prOutputs[pid + "-" + prFormat]; const text = p.leg + "\n\n" + p.tags;
  if (a === "copy") { try { await navigator.clipboard.writeText(text); toast("Legenda copiada."); } catch(_) { toast("Segure o texto da legenda para copiar."); } }
  if (a === "done") { state.prontos[pid] = state.prontos[pid] ? false : todayKey; save(); renderProntos(); }
  if (a === "links") { copyText("Oi! 🤍 Aqui estão os links:\n" + p.itens.map((it, i) => (i+1) + ". " + it[0] + ": " + (/^https?:/.test(it[2]) ? it[2] : "https://s.shopee.com.br/" + it[2])).join("\n") + "\n\nE no meu grupo VIP tem promoção todo dia: " + LINK_VIP); return; }
  if (a === "video") {
    b.disabled = true; const st = $("vs-" + pid);
    let wake = null; try { wake = await navigator.wakeLock?.request("screen"); } catch(_) {}
    try {
      const v = await buildVideo(p, f => { st.textContent = "Criando o vídeo... " + Math.round(f*100) + "%"; });
      prVideos[pid] = v; const el = $("vv-" + pid); el.src = URL.createObjectURL(v); el.hidden = false; $("va-" + pid).hidden = false;
      st.textContent = "Pronto! No TikTok, escolha um áudio em alta antes de postar.";
    } catch(_) { st.textContent = "Não consegui criar o vídeo neste celular. Tente pelo Chrome."; }
    try { wake && wake.release(); } catch(_) {}
    b.disabled = false; return;
  }
  if (a === "vshare" || a === "vsave") {
    const v = prVideos[pid]; if (!v) return;
    const name = p.id + "." + (v.type.includes("mp4") ? "mp4" : "webm"), f = new File([v], name, {type: v.type});
    try { await navigator.clipboard.writeText(text); } catch(_) {}
    if (a === "vshare" && navigator.canShare && navigator.canShare({files:[f]})) { try { await navigator.share({files:[f], text}); toast("A legenda está copiada: é só colar."); } catch(err) { if (!err || err.name !== "AbortError") toast("Não deu para enviar. Use Salvar vídeo."); } return; }
    const l = document.createElement("a"); l.href = URL.createObjectURL(f); l.download = name; document.body.appendChild(l); l.click(); l.remove();
    toast("Vídeo salvo na pasta Downloads. A legenda está copiada."); return;
  }
  if (!blobs) return;
  const files = blobs.map((bl, i) => new File([bl], p.id + "-" + (i+1) + ".jpg", {type:"image/jpeg"}));
  if (a === "share") {
    try { await navigator.clipboard.writeText(text); } catch(_) {}
    if (navigator.canShare && navigator.canShare({files})) {
      try { await navigator.share({files, text}); toast("Escolha o Instagram ou o TikTok. A legenda está copiada: é só colar.", 6000); } catch(err) { if (!err || err.name !== "AbortError") toast("Não deu para enviar. Use Salvar imagens."); }
    } else toast("Este celular não deixou enviar direto. Use Salvar imagens.");
  }
  if (a === "save") {
    for (const f of files) { const l = document.createElement("a"); l.href = URL.createObjectURL(f); l.download = f.name; document.body.appendChild(l); l.click(); l.remove(); await new Promise(r => setTimeout(r, 300)); }
    toast("Imagens salvas na pasta Downloads.");
  }
});
$("prontoList").addEventListener("change", async e => {
  if (e.target.dataset.pa !== "bg") return;
  const f = e.target.files && e.target.files[0]; if (!f) return;
  const pid = e.target.closest("[data-pid]").dataset.pid;
  await putPhoto("bg-" + pid, await shrink(f, 1600));
  delete prOutputs[pid + "-ig"]; delete prOutputs[pid + "-tt"];
  renderProntos(); toast("Foto colocada na capa.");
});

// ---------- abas ----------
function show(t){
  document.querySelectorAll("nav.tabs button").forEach(b => b.setAttribute("aria-selected", b.dataset.tab === t));
  ["hoje","prontos","produtos","ideias","editar"].forEach(x => $("tab-" + x).hidden = x !== t);
  if (t === "hoje") renderHoje(); if (t === "prontos") renderProntos(); if (t === "produtos") renderProdutos(); if (t === "ideias") renderIdeias();
  window.scrollTo(0, 0);
  try { sessionStorage.setItem("daia-tab", t); } catch(_) {}
}
document.querySelector("nav.tabs").addEventListener("click", e => { const t = e.target.closest("button")?.dataset.tab; if (t) show(t); });
let first = "hoje"; try { first = sessionStorage.getItem("daia-tab") || "hoje"; } catch(_) {}
applyConteudo();
show(first);
loadIA();
document.addEventListener("visibilitychange", () => { if (!document.hidden) loadIA(); });
setTimeout(() => $("splash").classList.add("hide"), 500);
// Atualização: quando sobe uma versão nova no GitHub, o app avisa e atualiza com um toque.
function avisoAtualizacao(){
  const el = $("toast"); el.innerHTML = 'Atualizei o app ✨ <button class="btn wine" style="margin-left:8px" onclick="location.reload()">Ver agora</button>'; el.hidden = false; clearTimeout(toast.t);
}
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").then(reg => {
  reg.addEventListener("updatefound", () => { const w = reg.installing; if (w) w.addEventListener("statechange", () => { if (w.state === "activated" && navigator.serviceWorker.controller) avisoAtualizacao(); }); });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) reg.update().catch(() => {}); });
}).catch(() => {});
