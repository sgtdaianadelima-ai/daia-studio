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
  const total = plano + ia + car;
  const frase = total === 0 ? "Essa semana ainda está em branco. Bora começar hoje? Um post já conta! 🤍" : total < 7 ? "Você começou! Cada post te deixa mais perto das vendas. ✨" : total < 15 ? "Que semana boa! Continua assim. 💪" : "Você está voando! Semana incrível. 🎉";
  return {plano, planoTotal, ia, car, seguidos, total, frase};
}
function semanaCard(){
  const r = resumoSemana();
  return '<article class="card"><div class="meta"><span class="tag casa">Sua semana</span><span class="why">últimos 7 dias</span></div>' +
    '<div class="semana"><div><b>' + r.plano + '</b><small>de ' + r.planoTotal + ' posts do plano</small></div><div><b>' + r.ia + '</b><small>Shopee Vídeos</small></div><div><b>' + r.car + '</b><small>carrosséis</small></div><div><b>' + r.seguidos + '</b><small>' + (r.seguidos === 1 ? 'dia seguido' : 'dias seguidos') + '</small></div></div>' +
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
  $("cards").innerHTML = (cur === todayKey ? recadoCard() + pendentesCard() + iaCards() + packsCard() : "") + prontoCard + semPlano + posts.map((p, i) => {
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
  }).join("") + (cur === todayKey ? semanaCard() + '<details class="card ferramentas"><summary>🧰 Ferramentas <small>converter link, respostas, lembretes e planilha</small></summary>' + conversorCard() + respostasCard() + lembretesCard() + editarCard() + '</details>' : "");
}
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
    COPY.push(j.link);
    out.innerHTML = '<p class="how"><b>Seu link:</b> ' + esc(j.link) + '</p><div class="actions"><button class="btn main" data-copy="' + (COPY.length-1) + '">Copiar meu link</button></div>';
    copyText(j.link);
  } catch(e) { out.innerHTML = '<p class="how">Não consegui converter: ' + esc(e.message) + '. Confira se é um link da Shopee.</p>'; }
}
function respostasCard(){
  const daPlanilha = (conteudo().respostas || []).map(x => [x.nome, String(x.texto).replace(/\{link\}/g, LINK_PAGINA).replace(/\{vip\}/g, LINK_VIP)]);
  const r = daPlanilha.length ? daPlanilha : [
    ["Pediu o link (geral)", "Oi! 🤍 Todos os meus achados estão aqui: " + LINK_PAGINA + "\nE no grupo VIP eu mando as promoções do dia: " + LINK_VIP],
    ["Quer entrar no grupo", "Que bom! 🤍 Entra aqui no grupo VIP, todo dia tem oferta boa: " + LINK_VIP],
    ["Resposta no comentário", "Te mandei no direct! 🤍 Se não chegar, o link está na minha bio."],
    ["Perguntou se é bom", "É sim! Tem muitas avaliações boas e eu indico 🤍 O link está no meu perfil, e qualquer dúvida me chama aqui."]
  ];
  return '<article class="card"><div class="meta"><span class="tag trend">Respostas prontas</span><span class="why">copie e cole</span></div>' +
    '<p class="how">Para comentários e directs do Instagram e do TikTok.</p><div class="actions" style="flex-wrap:wrap">' + r.map(x => copyBtn(x[1], x[0])).join("") + '</div></article>';
}
async function loadIA(tent){
  try {
    const r = await fetch(ROBO); const j = await r.json();
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
