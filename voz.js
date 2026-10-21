// Dalinha — assistente do Daia Studio. Ouve pelo microfone (ou texto), entende pedidos simples
// e só responde falando quando a Daia pede ("responde em voz") ou liga o 🔊.
(function(){
  const LSV = "daia-voz-v1";
  let cfg = {falar: false, voz: ""};
  try { Object.assign(cfg, JSON.parse(localStorage.getItem(LSV) || "{}")); } catch(_) {}
  const salvarCfg = () => { try { localStorage.setItem(LSV, JSON.stringify(cfg)); } catch(_) {} };

  // ---------- falar (só quando pedido) ----------
  const tts = window.speechSynthesis;
  let vozes = [];
  const carregarVozes = () => { if (!tts) return; vozes = tts.getVoices().filter(v => /^pt([-_]BR)?$/i.test(v.lang) || /^pt[-_]BR/i.test(v.lang)); if (!vozes.length) vozes = tts.getVoices().filter(v => /^pt/i.test(v.lang)); preencherVozes(); };
  if (tts) { carregarVozes(); tts.addEventListener && tts.addEventListener("voiceschanged", carregarVozes); }
  // Preferir voz feminina e brasileira (o nome muda de celular para celular).
  const FEM = /francisca|luciana|vit[oó]ria|maria|thalita|leila|fernanda|helo[ií]sa|camila|female|feminina|mulher|pt-br-x-afs|pt-br-x-pte/i;
  function escolherVoz(){
    if (cfg.voz) { const v = vozes.find(x => x.name === cfg.voz); if (v) return v; }
    return vozes.find(v => /BR/i.test(v.lang) && FEM.test(v.name)) || vozes.find(v => /BR/i.test(v.lang) && /google/i.test(v.name)) || vozes.find(v => /BR/i.test(v.lang)) || vozes[0] || null;
  }
  const semEmoji = t => String(t).replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, "").replace(/\s+/g, " ").trim();
  function falar(texto){
    if (!tts) return;
    try { tts.cancel(); const u = new SpeechSynthesisUtterance(semEmoji(texto)); const v = escolherVoz(); if (v) u.voice = v; u.lang = (v && v.lang) || "pt-BR"; u.pitch = 1.25; u.rate = 1.05; tts.speak(u); } catch(_) {}
  }

  // ---------- ouvir ----------
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null, ouvindo = false;

  // ---------- tela ----------
  const ROBOZINHO = '<svg class="robo" viewBox="0 0 64 64" aria-hidden="true"><path d="M32 9.5c-2.2-3-7-1.4-7 2.2 0 3 4 5.4 7 7.6 3-2.2 7-4.6 7-7.6 0-3.6-4.8-5.2-7-2.2z" fill="#F4A9B8"/><rect x="6" y="30" width="6" height="13" rx="3" fill="#F7EDE4"/><rect x="52" y="30" width="6" height="13" rx="3" fill="#F7EDE4"/><rect x="10" y="19" width="44" height="38" rx="17" fill="#FBF7F2"/><rect x="16" y="27" width="32" height="21" rx="10.5" fill="#3B2A22"/><g class="olhos"><circle cx="25.5" cy="36" r="3.4" fill="#fff"/><circle cx="38.5" cy="36" r="3.4" fill="#fff"/></g><path d="M28.5 41.5q3.5 2.6 7 0" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="20" cy="51" r="2.6" fill="#F4A9B8"/><circle cx="44" cy="51" r="2.6" fill="#F4A9B8"/></svg>';
  const fab = document.createElement("button");
  fab.className = "voz-fab"; fab.setAttribute("aria-label", "Falar com a Dalinha"); fab.innerHTML = ROBOZINHO;
  const box = document.createElement("section");
  box.className = "voz-box"; box.hidden = true; box.setAttribute("aria-label", "Assistente de voz");
  box.innerHTML =
    '<div class="voz-top"><b class="voz-nome">' + ROBOZINHO + 'Dalinha <span>· sua ajudante</span></b><button class="voz-x" aria-label="Fechar">×</button></div>' +
    '<div class="voz-modos"><button type="button" class="chip" data-modo="pedir" aria-pressed="true">💬 Pedir</button><button type="button" class="chip" data-modo="ditado" aria-pressed="false">📝 Ditado</button></div>' +
    '<div class="voz-ditado" id="vozDitBox" hidden><textarea class="input" id="vozDit" placeholder="Toque no microfone e fale. O que você falar vira texto aqui, sem a Dalinha fazer nada."></textarea>' +
    '<button type="button" class="voz-mic grande" id="vozDitMic" aria-label="Ditar"><svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg></button>' +
    '<div class="actions"><button type="button" class="btn wine" id="vozDitCopiar">Copiar texto</button><button type="button" class="btn" id="vozDitIdeia">Salvar como ideia</button><button type="button" class="btn" id="vozDitLimpar">Limpar</button></div></div>' +
    '<div class="voz-chat" id="vozChat" aria-live="polite"></div>' +
    '<div class="voz-chips" id="vozChips"></div>' +
    '<form class="voz-form" id="vozForm"><input id="vozIn" class="input" placeholder="Fale ou escreva aqui…" autocomplete="off" enterkeyhint="send"><button type="button" class="voz-mic" id="vozMic" aria-label="Falar"><svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg></button><button class="btn wine" type="submit">Enviar</button></form>' +
    '<div class="voz-cfg"><label><input type="checkbox" id="vozFalar"> 🔊 Responder em voz</label><details><summary>Escolher a voz</summary><select id="vozVoz" aria-label="Escolher a voz"></select> <button type="button" class="btn" id="vozTeste">Testar voz</button></details></div>' +
    '<p class="voz-dica" id="vozDica"></p>';
  document.body.appendChild(fab); document.body.appendChild(box);
  const $v = id => document.getElementById(id);
  $v("vozFalar").checked = !!cfg.falar;
  function preencherVozes(){
    const s = document.getElementById("vozVoz"), b = document.getElementById("vozTeste"); if (!s || !b) return;
    s.innerHTML = '<option value="">Voz automática</option>' + vozes.map(v => '<option' + (v.name === cfg.voz ? ' selected' : '') + '>' + esc(v.name) + '</option>').join("");
    s.hidden = !vozes.length; b.hidden = !tts;
  }
  preencherVozes();
  if (!SR) { $v("vozMic").hidden = true; $v("vozDica").textContent = "Este celular não deixa o app ouvir direto. Toque no 🎤 do seu teclado e fale: eu entendo do mesmo jeito."; }

  const CHIPS = ["O que eu faço hoje?", "Abrir carrosséis", "Converter link", "Anotar ideia: ", "Como posto na Shopee Vídeo?", "Como foi minha semana?", "Qual trend está bombando?", "Copiar link do grupo VIP"];
  $v("vozChips").innerHTML = CHIPS.map(c => '<button type="button" class="chip" data-c="' + esc(c) + '">' + esc(c.replace(/: $/, "…")) + '</button>').join("");

  function bolha(quem, html){
    const d = document.createElement("div"); d.className = "voz-msg " + quem; d.innerHTML = html;
    const chat = $v("vozChat"); chat.appendChild(d); while (chat.children.length > 12) chat.firstChild.remove(); chat.scrollTop = chat.scrollHeight;
    return d;
  }
  // r = {txt, html?, acoes?: [{rotulo, fn}]}
  let ACOES = [];
  function responder(r, pediuVoz){
    ACOES = r.acoes || [];
    const extra = ACOES.length ? '<div class="actions">' + ACOES.map((a, i) => '<button class="btn' + (i ? '' : ' wine') + '" data-a="' + i + '">' + esc(a.rotulo) + '</button>').join("") + '</div>' : "";
    bolha("ela", (r.html || esc(r.txt)) + extra);
    if (pediuVoz || cfg.falar) falar(r.fala || r.txt);
  }

  function abrir(){ box.hidden = false; fab.classList.add("on"); if (!$v("vozChat").children.length) responder({txt: saudacao() + " Toque no microfone e me fala o que você precisa, ou escolha uma opção aqui embaixo. 🤍"}); }
  function fechar(){ box.hidden = true; fab.classList.remove("on"); pararOuvir(); if (typeof pararDitado === "function") pararDitado(); try { tts && tts.cancel(); } catch(_) {} }
  fab.addEventListener("click", () => box.hidden ? abrir() : fechar());
  box.querySelector(".voz-x").addEventListener("click", fechar);
  $v("vozForm").addEventListener("submit", e => { e.preventDefault(); const t = $v("vozIn").value.trim(); if (!t) return; $v("vozIn").value = ""; entender(t); });
  $v("vozChips").addEventListener("click", e => { const c = e.target.closest("[data-c]")?.dataset.c; if (!c) return; if (/: $/.test(c)) { $v("vozIn").value = c; $v("vozIn").focus(); } else entender(c); });
  $v("vozChat").addEventListener("click", e => { const b = e.target.closest("button[data-a]"); if (b && ACOES[b.dataset.a]) ACOES[b.dataset.a].fn(); });
  $v("vozFalar").addEventListener("change", e => { cfg.falar = e.target.checked; salvarCfg(); if (cfg.falar) falar("Oba! Agora eu respondo falando."); });
  $v("vozVoz").addEventListener("change", e => { cfg.voz = e.target.value; salvarCfg(); falar("Oi, Daia! Gostou dessa voz?"); });
  $v("vozTeste").addEventListener("click", () => falar("Oi, Daia! Eu sou a Dalinha. Bora vender muito hoje?"));

  // ---------- modo ditado: só transforma a fala em texto ----------
  let modo = "pedir", ditando = false, recDit = null, baseDit = "";
  function trocarModo(m){
    modo = m; pararOuvir(); pararDitado();
    box.querySelectorAll("[data-modo]").forEach(b => b.setAttribute("aria-pressed", b.dataset.modo === m));
    $v("vozDitBox").hidden = m !== "ditado";
    ["vozChat", "vozChips", "vozForm"].forEach(id => $v(id).hidden = m === "ditado");
    box.querySelector(".voz-cfg").hidden = m === "ditado";
  }
  box.querySelector(".voz-modos").addEventListener("click", e => { const m = e.target.closest("[data-modo]")?.dataset.modo; if (m) trocarModo(m); });
  function pararDitado(){ ditando = false; if (recDit) { try { recDit.stop(); } catch(_) {} } $v("vozDitMic").classList.remove("on"); }
  function ligarDitado(){
    recDit = new SR(); recDit.lang = "pt-BR"; recDit.interimResults = true; recDit.continuous = true;
    baseDit = $v("vozDit").value ? $v("vozDit").value.replace(/\s*$/, " ") : "";
    recDit.onresult = e => {
      let fin = "", meio = "";
      for (let i = e.resultIndex; i < e.results.length; i++) { const r = e.results[i]; if (r.isFinal) fin += r[0].transcript; else meio += r[0].transcript; }
      if (fin) { baseDit += fin.trim() + " "; }
      $v("vozDit").value = baseDit + meio;
    };
    recDit.onerror = e => { if (e.error === "not-allowed" || e.error === "service-not-allowed") { pararDitado(); toast("Libere o Microfone para o app (cadeado › Permissões)."); } };
    recDit.onend = () => { if (ditando) { try { ligarDitado(); } catch(_) { pararDitado(); } } };
    recDit.start();
  }
  $v("vozDitMic").addEventListener("click", () => {
    if (!SR) { $v("vozDit").focus(); toast("Toque no 🎤 do teclado para ditar."); return; }
    if (ditando) { pararDitado(); return; }
    try { tts && tts.cancel(); } catch(_) {}
    ditando = true; $v("vozDitMic").classList.add("on");
    try { ligarDitado(); } catch(_) { pararDitado(); toast("Não consegui ligar o microfone agora."); }
  });
  $v("vozDitCopiar").addEventListener("click", () => { const t = $v("vozDit").value.trim(); if (t) copyText(t); });
  $v("vozDitIdeia").addEventListener("click", () => { const t = $v("vozDit").value.trim(); if (!t) return; state.ideas.unshift({id: "i" + Date.now(), text: t, hasPhoto: false, at: todayKey}); save(); toast("Salvei na aba Ideias! ✨"); });
  $v("vozDitLimpar").addEventListener("click", () => { $v("vozDit").value = ""; baseDit = ""; });

  // ---------- microfone ----------
  function pararOuvir(){ if (rec && ouvindo) { try { rec.stop(); } catch(_) {} } ouvindo = false; $v("vozMic").classList.remove("on"); }
  $v("vozMic").addEventListener("click", () => {
    if (!SR) return;
    if (ouvindo) { pararOuvir(); return; }
    try { tts && tts.cancel(); } catch(_) {}
    rec = new SR(); rec.lang = "pt-BR"; rec.interimResults = true; rec.maxAlternatives = 1; rec.continuous = false;
    let final = "";
    rec.onresult = e => { let t = ""; for (const r of e.results) { t += r[0].transcript; if (r.isFinal) final = t; } $v("vozIn").value = t; };
    rec.onerror = e => {
      const m = {"not-allowed": "Preciso da sua permissão para usar o microfone: toque no cadeado (ou ⋮ › Configurações do site) e libere o Microfone.", "service-not-allowed": "Preciso da sua permissão para usar o microfone.", "no-speech": "Não ouvi nada 🥺 Toca de novo e fala pertinho do celular.", "network": "Para entender sua voz eu preciso de internet.", "audio-capture": "Não achei o microfone do celular."}[e.error];
      if (m) responder({txt: m});
    };
    rec.onend = () => { ouvindo = false; $v("vozMic").classList.remove("on"); const t = (final || $v("vozIn").value).trim(); if (t) { $v("vozIn").value = ""; entender(t); } };
    try { rec.start(); ouvindo = true; $v("vozMic").classList.add("on"); $v("vozIn").value = ""; $v("vozIn").placeholder = "Estou ouvindo… 👂"; setTimeout(() => $v("vozIn").placeholder = "Fale ou escreva aqui…", 6000); } catch(_) { responder({txt: "Não consegui ligar o microfone agora. Tenta de novo?"}); }
  });

  // ---------- entender ----------
  const norm = s => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s:/.?=&%-]/g, " ").replace(/\s+/g, " ").trim();
  function saudacao(){ const h = new Date().getHours(); return (h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite") + ", Daia!"; }
  const ir = (tab, depois) => () => { fechar(); show(tab); if (depois) setTimeout(depois, 120); };
  const abrirUrl = url => () => { window.open(url, "_blank"); };

  function resumoHoje(){
    const ia = (state.ia && state.ia.videos) || [], feitosIA = ia.filter(v => state.iaDone && state.iaDone[v.id]).length;
    const posts = PLAN[todayKey] || [], feitos = posts.filter((p, i) => state.done[todayKey + "-" + i]).length;
    const packs = (state.ia && state.ia.packs) || [], pr = prontoDoDia(todayKey);
    const partes = [];
    if (ia.length) partes.push((ia.length - feitosIA) + " de " + ia.length + " vídeos de IA para fazer na Shopee Vídeo");
    if (posts.length) partes.push((posts.length - feitos) + " de " + posts.length + " posts do plano para fazer (" + posts.map(p => p.h).join(", ") + ")");
    if (packs.length) partes.push(packs.length + " vídeos prontos dos packs, já com o seu link");
    if (pr) partes.push('o carrossel "' + pr.c1 + " " + pr.c2 + '"');
    const falta = (ia.length - feitosIA) + (posts.length - feitos);
    const txt = partes.length ? (falta === 0 && ia.length ? "Uau, você já fez tudo de hoje! 🎉 Se quiser mais, tem " : "Hoje tem: ") + partes.join("; ") + "." : "Ainda não chegou o conteúdo de hoje. Confere a internet e abre o app de novo.";
    return {txt, acoes: [{rotulo: "Abrir a tela Hoje", fn: ir("hoje")}].concat(pr ? [{rotulo: "Abrir o carrossel", fn: () => { openPronto = pr.id; fechar(); show("prontos"); }}] : [])};
  }

  // Manual: procura a seção que mais combina com a pergunta.
  let MANUAL = null;
  async function manual(){
    if (MANUAL) return MANUAL;
    try {
      const doc = new DOMParser().parseFromString(await (await fetch("manual.html")).text(), "text/html");
      MANUAL = [...doc.querySelectorAll("section[id]")].map(s => ({id: s.id, titulo: (s.querySelector("h2")?.childNodes[s.querySelector("h2").childNodes.length - 1]?.textContent || s.id).trim(), passos: [...s.querySelectorAll("li, p")].map(x => x.textContent.replace(/\s+/g, " ").trim()).filter(Boolean), texto: norm(s.textContent)}));
    } catch(_) { MANUAL = []; }
    return MANUAL;
  }
  const PARADAS = new Set("a o as os um uma de da do das dos e em no na nos nas para pra por com como que eu meu minha me se faz faco fazer qual quais onde quando tem ter isso esse essa ai la".split(" "));
  async function perguntaManual(q){
    const ps = norm(q).split(" ").filter(w => w.length > 2 && !PARADAS.has(w));
    if (!ps.length) return null;
    let melhor = null, nota = 0;
    for (const s of await manual()) { let n = 0; for (const w of ps) { const raiz = w.length > 5 ? w.slice(0, -2) : w.slice(0, Math.max(3, w.length - 1)); if (s.texto.includes(raiz)) n += norm(s.titulo).includes(raiz) ? 2 : 1; } if (n > nota) { nota = n; melhor = s; } }
    if (!melhor || nota < 2) return null;
    const passos = melhor.passos.slice(0, 5);
    return {txt: melhor.titulo + ": " + passos.join(" "), fala: melhor.titulo + ". " + passos.slice(0, 3).join(" "),
      html: '<b>' + esc(melhor.titulo) + '</b><ol>' + passos.map(p => '<li>' + esc(p) + '</li>').join("") + '</ol>',
      acoes: [{rotulo: "Abrir no manual", fn: abrirUrl("manual.html#" + melhor.id)}]};
  }

  async function entender(original){
    bolha("eu", esc(original));
    const t = norm(original);
    const pediuVoz = /\b(em voz|falando|fala pra mim|me fala|responde em voz|responda em voz|com voz)\b/.test(t);
    // ligar / desligar a voz
    if (/\b(para|pare|parar|chega|desliga)\s+(de\s+|a\s+)?(falar|fala|voz)\b|\bsem voz\b|\bso texto\b|\bsilencio\b|\bfica quieta\b/.test(t)) { cfg.falar = false; salvarCfg(); $v("vozFalar").checked = false; try { tts && tts.cancel(); } catch(_) {} return responder({txt: "Tá bom, fico quietinha e respondo só por escrito. 🤫"}); }
    if (/\b(fala comigo|responde (sempre )?em voz|liga a voz|ativa a voz|pode falar|quero ouvir|responder falando)\b|\b(dalinha|voce|ela) (falar|fala|responder)\b/.test(t)) { cfg.falar = true; salvarCfg(); $v("vozFalar").checked = true; return responder({txt: "Eba! A partir de agora eu respondo falando. Se cansar, é só dizer: para de falar. 🤍"}, true); }
    // link colado
    const url = original.match(/https?:\/\/\S+/);
    if (url) { responder({txt: "Já vou trocar pelo seu link… ⏳"}); try { const j = await (await fetch(ROBO + "?link=" + encodeURIComponent(url[0]))).json(); if (!j.link) throw new Error(j.erro || ""); copyText(j.link); return responder({txt: "Prontinho! Seu link é " + j.link + " e já está copiado. 🤍", fala: "Prontinho! Seu link já está copiado."}, pediuVoz); } catch(e) { return responder({txt: "Não consegui converter esse link 🥺 Confere se é link da Shopee."}, pediuVoz); } }
    // ideia
    const ideia = original.match(/^\s*(anot\w*|salv\w*|guard\w*)\s+(uma\s+)?ideia\s*:?\s*(.+)$/i);
    if (ideia && ideia[3].trim().length > 2) { state.ideas.unshift({id: "i" + Date.now(), text: ideia[3].trim(), hasPhoto: false, at: todayKey}); save(); return responder({txt: "Anotei sua ideia! ✨ Ela está na aba Ideias.", acoes: [{rotulo: "Ver ideias", fn: ir("ideias")}]}, pediuVoz); }
    if (/\b(anot|salv|guard)\w*\b.*\bideia\b/.test(t)) { $v("vozIn").value = "Anotar ideia: "; $v("vozIn").focus(); return responder({txt: "Me conta a ideia! Pode falar: anotar ideia, e depois a ideia."}, pediuVoz); }
    // cumprimento
    if (/^(oi|ola|oie|bom dia|boa tarde|boa noite|eai|e ai|hey)\b/.test(t) && t.split(" ").length <= 4) { const r = resumoHoje(); r.txt = saudacao() + " 🤍 " + r.txt; return responder(r, pediuVoz); }
    // carrossel do dia / próximo
    if (/\b(carross\w*|post pronto)\b/.test(t) && /\b(proximo|outro|do dia|de hoje|nao postei|qual|sugere|sugestao|novo)\b/.test(t)) {
      const p = PR.find(x => !(state.prontos && state.prontos[x.id])) || PR[0];
      return responder({txt: 'Que tal o carrossel "' + p.c1 + " " + p.c2 + '"? ✨', acoes: [{rotulo: "Abrir esse carrossel", fn: () => { openPronto = p.id; fechar(); show("prontos"); }}]}, pediuVoz);
    }
    // semana
    if (/\b(semana|semanal|como (eu )?fui|meu resultado|quanto eu postei|dias seguidos)\b/.test(t)) { const r = resumoSemana(); return responder({txt: "Nos últimos 7 dias: " + r.plano + " de " + r.planoTotal + " posts do plano, " + r.ia + " Shopee Vídeos e " + r.car + " carrosséis. " + (r.seguidos ? "Você está há " + r.seguidos + (r.seguidos === 1 ? " dia" : " dias") + " seguidos postando! " : "") + r.frase}, pediuVoz); }
    // ditado
    if (/\b(ditado|ditar|so quero ditar|escrever falando)\b/.test(t)) { trocarModo("ditado"); return; }
    // hoje / tarefas
    if (/\b(o que|oque)\b.*\b(faco|fazer|tenho|postar|posto)\b|\b(hoje|tarefa|tarefas|agenda|resumo|quanto falta|quantos faltam|meu dia)\b/.test(t)) return responder(resumoHoje(), pediuVoz);
    // copiar textos prontos
    if (/\b(copi|manda|pega)\w*\b.*\b(grupo|vip|whats)\b/.test(t)) { copyText(LINK_VIP); return responder({txt: "Copiei o link do grupo VIP! É só colar. 🤍"}, pediuVoz); }
    if (/\b(copi|manda|pega)\w*\b.*\b(link da bio|pagina de links|meus links|link geral)\b/.test(t)) { copyText(LINK_PAGINA); return responder({txt: "Copiei o link da sua página de links! 🤍"}, pediuVoz); }
    if (/\b(resposta|responder)\b.*\b(quero|comentario|direct|dm)\b|\brespostas prontas\b/.test(t)) return responder({txt: "As respostas prontas estão no fim da tela Hoje. Toque na que você quer e ela já fica copiada.", acoes: [{rotulo: "Ir para as respostas", fn: ir("hoje", () => document.querySelector(".tag.trend")?.closest(".card")?.scrollIntoView({block: "center"}))}]}, pediuVoz);
    // converter
    if (/\bconvert\w*\b|\btrocar? (o )?link\b|\bmeu link\b/.test(t)) return responder({txt: "Cola o link da Shopee aqui na caixinha e toca em Enviar, que eu troco pelo seu. Ou use o Converter link da tela Hoje.", acoes: [{rotulo: "Abrir o conversor", fn: ir("hoje", () => { const c = document.getElementById("convIn"); if (c) { c.scrollIntoView({block: "center"}); c.focus(); } })}]}, pediuVoz);
    // abrir telas
    const telas = [[/\b(pronto|prontos|carross\w*)\b/, "prontos", "carrosséis prontos"], [/\b(produto|produtos)\b/, "produtos", "produtos"], [/\b(ideia|ideias)\b/, "ideias", "ideias"], [/\b(editar|cortar|corta|pausa|pausas)\b.*\b(video)?\b/, "editar", "editor de vídeo"], [/\b(hoje|inicio|comeco)\b/, "hoje", "tela Hoje"]];
    if (/\b(abr\w*|vai|ir|mostra\w*|ver|entra\w*|quero ver)\b/.test(t)) {
      if (/\bmanual\b/.test(t)) { abrirUrl("manual.html")(); return responder({txt: "Abri o manual pra você. 📖"}, pediuVoz); }
      if (/\bcronograma\b/.test(t)) { abrirUrl("cronograma.html")(); return responder({txt: "Abri o cronograma. 🗓️"}, pediuVoz); }
      if (/\b(planilha|conteudo)\b/.test(t)) { abrirUrl(PLANILHA)(); return responder({txt: "Abri a planilha. Lá você muda o recado, as respostas, os carrosséis e o plano. ✏️"}, pediuVoz); }
      for (const [re, tab, nome] of telas) if (re.test(t)) { ir(tab)(); return responder({txt: "Abri " + nome + "! ✨"}, pediuVoz); }
    }
    // pedir ao Claude
    const claude = original.match(/\b(pede|pergunta|manda)\b.*\bclaude\b\s*:?\s*(.*)$/i);
    if (claude) { const pedido = claude[2] && claude[2].length > 3 ? claude[2] : original; askClaude(CONTEXTO + "\n\n" + pedido); return responder({txt: "Mandei para o Claude! Escolha o app do Claude na lista. 🤍"}, pediuVoz); }
    // dúvidas: procura no manual
    const m = await perguntaManual(original);
    if (m && !/\b(trend|viral\w*|tendencia|audio|som|ideia de|sugest\w*|legenda|roteiro|escrev\w*|cria\w*|o que eu posto)\b/.test(t)) return responder(m, pediuVoz);
    // o resto: pergunta para o Gemini (pelo robô do Google), que também pesquisa na internet
    const pensando = bolha("ela", "Pensando… 💭");
    try {
      const ctx = resumoHoje().txt.slice(0, 600);
      const j = await (await fetch(ROBO + "?pergunta=" + encodeURIComponent(original.slice(0, 500)) + "&ctx=" + encodeURIComponent(ctx))).json();
      pensando.remove();
      if (j && j.resposta) return responder({txt: j.resposta, acoes: [{rotulo: "Copiar", fn: () => copyText(j.resposta)}]}, pediuVoz);
    } catch(_) { pensando.remove(); }
    if (m) return responder(m, pediuVoz);
    return responder({txt: "Hmm, essa eu ainda não sei 🥺 Quer que eu mande sua pergunta para o Claude?", acoes: [{rotulo: "Mandar para o Claude", fn: () => askClaude(CONTEXTO + "\n\n" + original)}, {rotulo: "Abrir o manual", fn: abrirUrl("manual.html")}]}, pediuVoz);
  }
  window.Dalinha = {entender, falar, abrir, fechar, escolherVoz, _vozes: () => vozes};
})();
