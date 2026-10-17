// Daia Studio — app (Hoje, Produtos, Ideias, Editar). Tudo fica salvo só neste celular.
const DAYS = Object.keys(PLAN).sort();
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
let cur = PLAN[todayKey] ? todayKey : (todayKey < DAYS[0] ? DAYS[0] : DAYS[DAYS.length-1]);
const daysToXmas = k => { const d = fromKey(k); return Math.round((new Date(d.getFullYear(), 11, 25) - d) / 864e5); };
function renderHoje(){
  const posts = PLAN[cur] || [];
  const dd = fmtDay(cur, {day:"numeric", month:"short"});
  $("dayTitle").innerHTML = (cur === todayKey ? "Hoje" : esc(fmtDay(cur, {weekday:"long"}))) + ", <em>" + esc(dd) + "</em>";
  $("daySub").innerHTML = "<span>Faltam <b>" + daysToXmas(cur) + " dias</b> para o Natal</span><span>Série às 21h</span>";
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
  $("cards").innerHTML = prontoCard + posts.map((p, i) => {
    const k = cur + "-" + i, d = !!state.done[k];
    return '<article class="card' + (d ? " done" : "") + '" data-i="' + i + '">' +
      '<div class="meta"><span>' + esc(p.h) + '</span><span class="tag ' + p.k + '">' + LABEL[p.k] + '</span><span class="why">' + WHY[p.k] + '</span></div>' +
      '<h3 class="title">' + esc(p.t) + '</h3>' +
      '<div class="say"><small>Comece dizendo</small>' + esc(p.g) + '</div>' +
      '<p class="how">' + esc(p.m) + '</p>' +
      (p.r ? '<ol class="script">' + p.r.map(l => '<li>' + esc(l) + '</li>').join("") + '</ol>' : '') +
      '<p class="cta">' + esc(CTA[p.k]) + '</p>' +
      '<details class="tips"><summary>Como editar e onde postar</summary><p>1) Aba Editar: escolha o vídeo e toque em Editar (tira as pausas). 2) Toque em Enviar para o TikTok. 3) No TikTok: Legendas, música e postar.</p><p><b>' + esc(ONDE[p.k]) + '</b></p></details>' +
      '<div class="actions"><button class="btn main" data-act="done">' + (d ? "Postado ✓" : "Marcar como postado") + '</button>' +
      (p.r ? '' : '<button class="btn" data-act="roteiro">Roteiro no Claude</button>') +
      '<button class="btn" data-act="editar">Editar vídeo</button></div>' +
    '</article>';
  }).join("");
}
$("cards").addEventListener("click", e => {
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
  ["s2","s3","s4"].forEach(id => $(id).classList.add("off")); analysis = null;
  try {
    analysis = await analyzeAudio(f);
    if (analysis.duration > 185) { $("pickInfo").textContent = "Esse vídeo tem mais de 3 minutos. Escolha um mais curto."; return; }
    $("pickInfo").textContent = "Duração: " + fmt(analysis.duration) + ". Toque para trocar.";
  } catch (err) {
    analysis = {duration: await videoDuration(vurl), env:null};
    $("pickInfo").textContent = "Não consegui ler o áudio. O vídeo vai sair só com o título, sem tirar pausas.";
  }
  $("s2").classList.remove("off"); $("s3").classList.remove("off"); showPlan();
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
  return {duration: audio.duration, env, step: 0.02};
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
  try {
    outBlob = await render(segmentsFor(analysis, level), $("vTitle").value.trim(), $("vZoom").checked, mime);
    $("vOut").src = URL.createObjectURL(outBlob); $("s4").classList.remove("off");
    vSetStatus("Pronto! Confira o vídeo abaixo."); $("s4").scrollIntoView({behavior:"smooth", block:"start"});
  } catch (err) { vSetStatus("A edição parou no meio. Tente de novo sem sair da tela. Se repetir, escolha \"Só as longas\".", true); }
  try { wake && wake.release(); } catch(_) {}
  $("vGo").disabled = false;
});
async function render(segs, title, zoom, mime){
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
  const draw = () => { if (!running) return; const z = zoom && segIndex % 2 === 1 ? 1.12 : 1, dw = W*z, dh = H*z; ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H); ctx.drawImage(v, (W-dw)/2, (H-dh)*0.42, dw, dh); drawTitle(ctx, W, H, title); requestAnimationFrame(draw); };
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
function prontoDoDia(k){ const i = Math.max(0, DAYS.indexOf(k)); return PRONTOS[i % PRONTOS.length]; }
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
  const img = n === 0 || n === total - 1 ? imgs[0] : (imgs[n % 2 === 1 ? 1 : 0] || imgs[0]);
  paintPhoto(ctx, W, H, img, n === 0 ? 0 : 1, opt.zoom, opt.dx, opt.dy);
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
    let y = H*0.66 - blockH/2 + rise;
    ctx.fillStyle = "#F1D29A"; ctx.font = "italic " + sn + "px " + SERIF; y += sn; ctx.fillText(String(n).padStart(2,"0"), W/2, y); y += sn*0.3;
    ctx.fillStyle = "#FFFFFF"; ctx.font = "italic " + st + "px " + SERIF; lt.forEach(l => { y += st*1.08; ctx.fillText(l, W/2, y); });
    y += W*0.03; ctx.font = "600 " + sb + "px " + SANS; lb.forEach(l => { y += sb*1.35; ctx.fillText(l, W/2, y); });
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
function loadImgURL(u){ return new Promise(res => { if (!u) return res(null); const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = u; }); }
function loadImg(blob){ return blob ? loadImgURL(URL.createObjectURL(blob)) : Promise.resolve(null); }
async function prontoImgs(p){
  const own = await loadImg(await getPhoto("bg-" + p.id));
  const [f1, f2] = await Promise.all([loadImgURL("f-" + p.id + "-1.jpg"), loadImgURL("f-" + p.id + "-2.jpg")]);
  return [own || f1 || f2, f2 || f1];
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
  $("prontoList").innerHTML = PRONTOS.map(p => {
    const open = openPronto === p.id, done = state.prontos[p.id];
    return '<article class="card" data-pid="' + p.id + '">' +
      '<div class="pr-head"><img class="pr-cover" data-cover="' + p.id + '" src="f-' + p.id + '-1.jpg" loading="lazy" alt=""><div class="info"><h3 class="title" style="font-size:19px">' + esc(p.c1 + " " + p.c2) + '</h3>' +
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
        '<div class="field"><span class="lab">Vídeo pronto (TikTok e Reels)</span><p class="note">As mesmas imagens viram um vídeo de uns ' + Math.round((p.s.length + 2) * 2.4) + ' segundos, com movimento. No TikTok, coloque um áudio em alta.</p>' +
        '<button class="btn wine" data-pa="video">Criar vídeo</button><p class="status" id="vs-' + p.id + '"></p><video id="vv-' + p.id + '" controls playsinline hidden></video>' +
        '<div class="actions" id="va-' + p.id + '" hidden><button class="btn wine" data-pa="vshare">Enviar vídeo para o TikTok</button><button class="btn" data-pa="vsave">Salvar vídeo</button></div></div>' : '') +
    '</article>';
  }).join("");
  for (const p of PRONTOS) {
    const own = await getPhoto("bg-" + p.id);
    if (own) { const el = document.querySelector('[data-cover="' + p.id + '"]'); if (el) el.src = URL.createObjectURL(own); }
  }
  if (openPronto) {
    const p = PRONTOS.find(x => x.id === openPronto), key = p.id + "-" + prFormat;
    if (!prOutputs[key]) prOutputs[key] = await buildPronto(p);
    const box = $("sl-" + p.id); if (!box) return;
    const urls = prOutputs[key].map(b => URL.createObjectURL(b));
    box.innerHTML = urls.map(u => '<img src="' + u + '" alt="">').join("");
    const cv = document.querySelector('[data-cover="' + p.id + '"]'); if (cv) cv.src = urls[0];
  }
}
$("prontoList").addEventListener("click", async e => {
  const b = e.target.closest("[data-pa]"); if (!b) return;
  const pid = b.closest("[data-pid]").dataset.pid, p = PRONTOS.find(x => x.id === pid), a = b.dataset.pa;
  if (a === "toggle") { openPronto = openPronto === pid ? null : pid; renderProntos(); return; }
  if (a === "fmt") { const v = e.target.closest("button[data-v]")?.dataset.v; if (v && v !== prFormat) { prFormat = v; renderProntos(); } return; }
  const blobs = prOutputs[pid + "-" + prFormat]; const text = p.leg + "\n\n" + p.tags;
  if (a === "copy") { try { await navigator.clipboard.writeText(text); toast("Legenda copiada."); } catch(_) { toast("Segure o texto da legenda para copiar."); } }
  if (a === "done") { state.prontos[pid] = !state.prontos[pid]; save(); renderProntos(); }
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
show(first);
setTimeout(() => $("splash").classList.add("hide"), 500);
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
