// Daia Studio v33 — microfone de DITADO em todos os campos de escrever (pedido da Daia em 08/11/2026).
// Toca no 🎤 → escuta TUDO (mesmo nas pausas, enquanto ela pensa) → toca de novo → para. Não grava áudio.
// v33: no Android o modo "contínuo" repetia as palavras. Agora cada frase é ouvida numa rodada curta,
// e o app recomeça sozinho até ela tocar para parar. Só o texto final de cada frase é somado (sem repetir).
(function(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null, alvo = null, botao = null, base = "", acum = "", escutando = false, rodadaFinal = "", rodadaParcial = "";
  const ehCampo = el => el && !el.dataset.mic && !el.readOnly && !el.disabled &&
    (el.tagName === "TEXTAREA" || (el.tagName === "INPUT" && /^(text|search|)$/i.test(el.getAttribute("type") || "") && !/numeric|decimal|tel/.test(el.getAttribute("inputmode") || "")));
  const junta = (a, b) => !a ? b : !b ? a : a.replace(/\s+$/, "") + " " + b.replace(/^\s+/, "");
  function mostra(){
    if (!alvo) return;
    alvo.value = junta(base, junta(acum, rodadaFinal || rodadaParcial));
    alvo.dispatchEvent(new Event("input", {bubbles: true}));
  }
  // soma a frase final sem repetir o que já está escrito
  function somaFinal(t){
    t = String(t || "").trim(); if (!t) return;
    const a = acum.toLowerCase().trim(), n = t.toLowerCase();
    if (a.endsWith(n)) return;                       // a mesma frase de novo
    if (a && n.startsWith(a)) { acum = t; return; }  // o celular mandou tudo de novo, mais comprido
    acum = junta(acum, t);
  }
  function desliga(){
    escutando = false;
    if (botao) { botao.classList.remove("on"); botao.setAttribute("aria-label", "Ditar com a voz"); }
    if (alvo) { alvo.value = alvo.value.trim(); alvo.dispatchEvent(new Event("input", {bubbles: true})); alvo.dispatchEvent(new Event("change", {bubbles: true})); }
    rec = null; alvo = null; botao = null;
  }
  function rodada(){
    if (!escutando || !alvo || !document.body.contains(alvo)) { desliga(); return; }
    rodadaFinal = ""; rodadaParcial = "";
    const r = new SR(); rec = r;
    r.lang = "pt-BR"; r.interimResults = true; r.continuous = false; r.maxAlternatives = 1;
    r.onresult = ev => {
      // pega só o último resultado da rodada (no Android ele já vem com a frase inteira)
      const res = ev.results[ev.results.length - 1], t = res[0].transcript;
      if (res.isFinal) { rodadaFinal = t.trim(); rodadaParcial = ""; } else rodadaParcial = t.trim();
      mostra();
    };
    r.onerror = ev => {
      if (ev.error === "not-allowed" || ev.error === "service-not-allowed") { toast("Libere o microfone para o app: toque no cadeado ao lado do endereço › Microfone › Permitir.", 6000); escutando = false; }
      else if (ev.error === "audio-capture") { toast("O microfone está sendo usado por outro app."); escutando = false; }
      // "no-speech" (ela está pensando) e "aborted": só recomeça
    };
    r.onend = () => {
      somaFinal(rodadaFinal || rodadaParcial); rodadaFinal = ""; rodadaParcial = ""; mostra();
      if (escutando) setTimeout(rodada, 120); else desliga();
    };
    try { r.start(); } catch(_) { setTimeout(() => { if (escutando) rodada(); }, 300); }
  }
  function comecar(el, bt){
    if (!SR) { el.focus(); toast("Seu celular não deixa o app ouvir. Use o 🎤 do teclado: toque no campo e no microfone do teclado.", 6000); return; }
    if (escutando) { const mesmo = alvo === el; escutando = false; try { rec && rec.stop(); } catch(_) {} if (mesmo) return; }
    alvo = el; botao = bt; base = el.value || ""; acum = ""; escutando = true;
    bt.classList.add("on"); bt.setAttribute("aria-label", "Parar o ditado");
    toast("🎤 Escutando… pode pensar com calma. Toque no 🎤 de novo para parar.", 3500);
    rodada();
  }
  function poeMic(el){
    if (!ehCampo(el)) return;
    el.dataset.mic = "1";
    const wrap = document.createElement("span"); wrap.className = "mic-wrap" + (el.tagName === "TEXTAREA" ? " area" : "");
    el.parentNode.insertBefore(wrap, el); wrap.appendChild(el);
    const bt = document.createElement("button"); bt.type = "button"; bt.className = "mic-bt"; bt.setAttribute("aria-label", "Ditar com a voz"); bt.textContent = "🎤";
    bt.addEventListener("mousedown", e => e.preventDefault());
    bt.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); comecar(el, bt); });
    wrap.appendChild(bt);
  }
  function varrer(raiz){ (raiz.querySelectorAll ? raiz.querySelectorAll("textarea, input") : []).forEach(poeMic); }
  new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) { if (n.matches && n.matches("textarea, input")) poeMic(n); varrer(n); } }))).observe(document.body, {childList: true, subtree: true});
  varrer(document);
  document.addEventListener("visibilitychange", () => { if (document.hidden && escutando) { escutando = false; try { rec && rec.stop(); } catch(_) {} } });
})();
