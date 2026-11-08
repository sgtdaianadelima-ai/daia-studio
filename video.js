// Daia Studio v31 — Criar › 📹 Meu vídeo (pedido da Daia em 08/11/2026).
// Ela escolhe o vídeo (ou foto) que já editou; o app tira 6 quadros e o robô devolve SUGESTÕES:
// narrar ou não, texto da narração, texto na tela, título, gancho, capa, áudio, legendas, ajustes e se serve para a Shopee Vídeo.
// O app não edita o vídeo.

let vidInfo = null; // {dur, tipo: "video"|"foto", nome}
const chipV = (attr, v, on, txt) => '<button type="button" class="chip" ' + attr + '="' + esc(v) + '" aria-pressed="' + !!on + '">' + (txt || esc(v)) + '</button>';
const criarForm30 = criarForm;
criarForm = function(){
  const c = CR();
  if (c.modo !== "video") {
    // acrescenta o botão “Meu vídeo” junto de Produto, Vários e Trend
    return criarForm30().replace('</div>', chipV("data-cmodo", "video", false, "📹 Meu vídeo") + '</div>');
  }
  return '<div class="chips modo">' + chipV("data-cmodo", "produto", false, "🛍️ Produto") + chipV("data-cmodo", "varios", false, "🧺 Vários") + chipV("data-cmodo", "trend", false, "🔥 Trend") + chipV("data-cmodo", "video", true, "📹 Meu vídeo") + '</div>' +
    '<p class="how">Mande o vídeo (ou a foto) que você já editou. Eu olho e te dou ideias: narração, texto na tela, título, legenda e o que melhorar. <b>Não edito por você.</b></p>' +
    '<div class="field"><span class="lab">Onde vai postar? <small class="why">pode marcar mais de um</small></span><div class="chips">' + C_REDES.map(v => chipV("data-crede", v, c.redes.indexOf(v) >= 0)).join("") + '</div></div>' +
    '<div class="field"><span class="lab">O vídeo já tem narração?</span><div class="chips">' + chipV("data-cnarr", "sim", c.narr === "sim", "🎙️ Tem") + chipV("data-cnarr", "nao", c.narr === "nao", "🤫 Não tem") + '</div></div>' +
    '<div class="cr-fotos">' + criarFotos.slice(0, 1).map(() => '<div class="cr-foto"><img data-cfprev="0" alt=""><button type="button" class="btn mini" data-cftira="all" aria-label="Tirar">✕</button></div>').join("") +
      '<label class="photo cr-add" for="cVid"><span>' + (vidInfo && vidInfo.tipo === "video" ? "🔄 Trocar o vídeo" : "📹 Vídeo da galeria") + '<small>' + (vidInfo && vidInfo.tipo === "video" ? Math.round(vidInfo.dur) + " segundos · " + esc(vidInfo.nome || "") : "abre os seus vídeos") + '</small></span><input type="file" id="cVid" accept="video/*"></label>' +
      '<label class="photo cr-add" for="cVidFoto"><span>' + (vidInfo && vidInfo.tipo === "foto" ? "🔄 Trocar a foto" : "🖼️ Foto da galeria") + '<small>' + (vidInfo && vidInfo.tipo === "foto" ? esc(vidInfo.nome || "") : "se for foto") + '</small></span><input type="file" id="cVidFoto" accept="image/*"></label></div>' +
    '<div class="field"><label for="cTxt">Quer contar algo? (opcional)</label><textarea class="input" id="cTxt" rows="2" placeholder="Ex.: é o ep. 6 da Operação Natal; o produto é o kit de chenille">' + esc(c.texto || "") + '</textarea></div>' +
    '<div class="actions"><button class="btn wine full" data-cgerar="1">✨ Me dar ideias para este vídeo</button></div>';
};
// tira 6 quadros do vídeo (no próprio celular) para mandar como fotos
function quadrosDoVideo(file){
  return new Promise((res, rej) => {
    const v = document.createElement("video"), url = URL.createObjectURL(file), fotos = [];
    v.muted = true; v.playsInline = true; v.preload = "auto"; v.src = url;
    const cv = document.createElement("canvas"), ctx = cv.getContext("2d");
    let tempos = [], k = 0;
    const pega = () => { if (k >= tempos.length) { URL.revokeObjectURL(url); res({fotos, dur: v.duration}); return; } v.currentTime = tempos[k]; };
    v.onloadedmetadata = () => {
      const d = v.duration || 1, escala = Math.min(1, 640 / Math.max(v.videoWidth, v.videoHeight));
      cv.width = Math.round(v.videoWidth * escala); cv.height = Math.round(v.videoHeight * escala);
      tempos = [0.05, 0.2, 0.38, 0.56, 0.74, 0.92].map(p => Math.min(d - 0.1, Math.max(0.1, d * p)));
      pega();
    };
    v.onseeked = () => { ctx.drawImage(v, 0, 0, cv.width, cv.height); cv.toBlob(b => { if (b) fotos.push(b); k++; pega(); }, "image/jpeg", 0.75); };
    v.onerror = () => { URL.revokeObjectURL(url); rej(new Error("não consegui abrir o vídeo")); };
    setTimeout(() => rej(new Error("o vídeo demorou demais para abrir")), 40000);
  });
}
// pega o arquivo antes do app tratar como foto
document.addEventListener("change", async e => {
  if ((e.target.id !== "cVid" && e.target.id !== "cVidFoto") || !e.target.files.length) return;
  e.stopImmediatePropagation();
  const f = e.target.files[0], c = CR(); c.texto = $("cTxt") ? $("cTxt").value : c.texto;
  if (/^image\//.test(f.type)) { criarFotos = [await shrink(f, 1024)]; vidInfo = {tipo: "foto", nome: f.name, dur: 0}; renderCriar(); return; }
  criarStatus("📹 Abrindo o vídeo…");
  try { const r = await quadrosDoVideo(f); criarFotos = r.fotos; vidInfo = {tipo: "video", dur: r.dur, nome: f.name}; criarStatus(""); renderCriar(); }
  catch(err) { criarStatus("Não consegui abrir esse vídeo aqui. Tente outro formato, ou mande um print do vídeo como foto."); }
}, true);
document.addEventListener("click", e => {
  if (!e.target.closest("#criarBox")) return;
  const n = e.target.closest("[data-cnarr]"); if (n) { const c = CR(); c.narr = n.dataset.cnarr; c.texto = $("cTxt").value; save(); renderCriar(); return; }
  const t = e.target.closest('[data-cftira="all"]'); if (t) { e.stopImmediatePropagation(); criarFotos = []; vidInfo = null; renderCriar(); }
}, true);

// manda os quadros + duração + se tem narração
const gerarCriar30 = gerarCriar;
gerarCriar = async function(){
  const c = CR();
  if (c.modo !== "video") return gerarCriar30();
  if (criarBusy) return;
  c.texto = $("cTxt").value.trim(); save();
  if (!criarFotos.length) { toast("Escolha o vídeo ou a foto."); return; }
  criarBusy = true; criarStatus("✨ Olhando o seu vídeo… pode levar até 2 minutos. Pode deixar o app aberto.");
  const btn = document.querySelector("[data-cgerar]"); if (btn) btn.disabled = true;
  let j = null;
  try {
    const fotos = []; for (const f of criarFotos.slice(0, 6)) fotos.push(await blobB64(f));
    const corpo = {acao: "criar", modo: "video", redes: c.redes, formato: "Reels / vídeo", objetivo: "viralizar", texto: c.texto, fotos, foto: fotos[0], duracao: vidInfo ? vidInfo.dur : 0, tipoArquivo: vidInfo ? vidInfo.tipo : "video", narr: c.narr || ""};
    const ctl = new AbortController(), lim = setTimeout(() => ctl.abort(), 180000);
    try { j = await (await fetch(ROBO, {method: "POST", headers: {"Content-Type": "text/plain;charset=utf-8"}, body: JSON.stringify(corpo), signal: ctl.signal})).json(); } finally { clearTimeout(lim); }
  } catch(_) { j = null; }
  criarBusy = false;
  if (j && j.r) {
    c.hist.unshift({modo: "video", redes: c.redes.slice(), texto: c.texto || (vidInfo && vidInfo.nome) || "Meu vídeo", data: todayKey, dur: vidInfo ? vidInfo.dur : 0, r: j.r}); c.hist = c.hist.slice(0, 30); c.atual = 0;
    criarFotos = []; vidInfo = null; c.texto = ""; save(); renderCriar(); window.scrollTo(0, $("criarBox").querySelector(".cr-res")?.offsetTop - 70 || 0); return;
  }
  if (btn) btn.disabled = false;
  const pedido = "Sou a Daia (Dale Daia), afiliada de casa e decoração, tom de amiga, estética minimalista, nunca cito preço. Vou te mandar " + (vidInfo && vidInfo.tipo === "foto" ? "uma foto" : "um vídeo que eu editei" + (vidInfo && vidInfo.dur ? " (" + Math.round(vidInfo.dur) + " s)" : "")) + (c.narr === "sim" ? ", com narração" : c.narr === "nao" ? ", sem narração" : "") + ". " + (c.texto ? c.texto + ". " : "") +
    "Vou postar em: " + c.redes.join(", ") + ". Não edite por mim: me dê SUGESTÕES — narrar ou não (e o texto da narração), texto para escrever na tela, título, gancho dos 3 primeiros segundos, capa, áudio, 3 a 5 ajustes de edição, legenda com até 5 hashtags para cada rede, se serve para a Shopee Vídeo e 2 ideias de próximos vídeos.";
  CC.push(pedido);
  criarStatus('A IA grátis não respondeu agora (pode ser o limite do dia). Leve para o Claude: <b>anexe o vídeo</b> e cole o pedido (já copiei).' +
    '<div class="actions" style="margin-top:8px"><button class="btn wine" data-cclaude="' + (CC.length - 1) + '">Fazer no Claude</button><button class="btn" data-cgerar="1">Tentar de novo</button></div>', true);
};

// mostra as sugestões do vídeo
const resultadoCriar30 = resultadoCriar;
resultadoCriar = function(h){
  if (!h || h.modo !== "video") return resultadoCriar30(h);
  const r = h.r || {}, nar = r.narracao || {};
  const cp = t => { CC.push(t); return CC.length - 1; };
  const bloco = (tit, txt) => txt ? '<div class="cr-leg"><div class="cr-tit"><small class="lab">' + tit + '</small><button class="btn mini" data-ccopy="' + cp(txt) + '">Copiar</button></div><p class="how">' + esc(txt).replace(/\n/g, "<br>") + '</p></div>' : '';
  return '<article class="card cr-res"><p class="how"><b>📹 ' + esc(h.texto || "Meu vídeo") + '</b>' + (h.dur ? ' · ' + Math.round(h.dur) + ' s' : '') + '<br><small class="why">' + esc((h.redes || []).join(" · ")) + '</small></p>' +
    (r.resumo ? '<p class="how">' + esc(r.resumo) + '</p>' : '') + (r.nota ? '<p class="meta-falta">⭐ ' + esc(r.nota) + '</p>' : '') +
    '<div class="cr-bloco"><div class="cr-tit"><b>🎬 Título e gancho</b></div>' + bloco("Título", r.titulo) + bloco("Gancho (3 primeiros segundos)", r.gancho) + bloco("Capa", r.capa) + (r.audio ? '<p class="how">🎵 ' + esc(r.audio) + '</p>' : '') + '</div>' +
    '<div class="cr-bloco"><div class="cr-tit"><b>🎙️ Narração: ' + (nar.usar === false ? 'deixar sem' : 'vale narrar') + '</b></div>' + (nar.porque ? '<p class="how">' + esc(nar.porque) + '</p>' : '') + bloco("Texto para narrar", nar.texto) + '</div>' +
    (r.texto_tela && r.texto_tela.length ? crLista("✍️ Texto na tela", r.texto_tela, "aberto") : '') +
    (r.melhorias && r.melhorias.length ? crLista("🔧 O que melhorar na edição", r.melhorias, "aberto") : '') +
    crLegendas(r, h.redes) +
    (r.shopee ? '<div class="cr-bloco"><div class="cr-tit"><b>🛍️ Shopee Vídeo</b></div><p class="how">' + esc(r.shopee) + '</p></div>' : '') +
    crLinks(r.links) +
    (r.ideias && r.ideias.length ? crLista("💡 Próximos vídeos em cima deste", r.ideias) : '') +
    '<div class="actions"><button class="btn" data-cnota="1">📝 Guardar no Bloco</button></div><p class="why">Toque numa frase para copiar.</p></article>';
};
try { if (!$("tab-criar").hidden) renderCriar(); } catch(_) {}
