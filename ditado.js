// Daia Studio v32 — microfone de DITADO em todos os campos de escrever (pedido da Daia em 08/11/2026).
// Toca no 🎤, fala, e o texto aparece escrito no campo. Toca de novo para parar. Não grava áudio.
(function(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null, alvo = null, botao = null, base = "";
  const ehCampo = el => el && !el.dataset.mic && !el.readOnly && !el.disabled &&
    (el.tagName === "TEXTAREA" || (el.tagName === "INPUT" && /^(text|search|)$/i.test(el.getAttribute("type") || "") && !/numeric|decimal|tel/.test(el.getAttribute("inputmode") || "")));
  function parar(){ if (rec) { try { rec.stop(); } catch(_) {} } }
  function fim(){ if (botao) { botao.classList.remove("on"); botao.setAttribute("aria-label", "Ditar com a voz"); } rec = null; alvo = null; botao = null; }
  function escreve(texto){
    if (!alvo) return;
    alvo.value = (base ? base.replace(/\s*$/, " ") : "") + texto;
    alvo.dispatchEvent(new Event("input", {bubbles: true}));
  }
  function comecar(el, bt){
    if (!SR) { el.focus(); toast("Seu celular não deixa o app ouvir. Use o 🎤 do teclado: toque no campo e no microfone do teclado.", 6000); return; }
    if (rec) { const mesmo = alvo === el; parar(); if (mesmo) return; }
    rec = new SR(); alvo = el; botao = bt; base = el.value || "";
    rec.lang = "pt-BR"; rec.interimResults = true; rec.continuous = true;
    let final = "";
    rec.onresult = ev => {
      let parcial = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const t = ev.results[i][0].transcript;
        if (ev.results[i].isFinal) final += (final && !/\s$/.test(final) ? " " : "") + t.trim(); else parcial += t;
      }
      escreve((final + (parcial ? " " + parcial.trim() : "")).trim());
    };
    rec.onerror = ev => { if (ev.error === "not-allowed" || ev.error === "service-not-allowed") toast("Libere o microfone para o app: toque no cadeado ao lado do endereço › Microfone › Permitir.", 6000); else if (ev.error === "no-speech") toast("Não ouvi nada. Toque no 🎤 e fale de novo."); };
    rec.onend = () => { if (alvo) { alvo.value = alvo.value.trim(); alvo.dispatchEvent(new Event("input", {bubbles: true})); alvo.dispatchEvent(new Event("change", {bubbles: true})); } fim(); };
    try { rec.start(); bt.classList.add("on"); bt.setAttribute("aria-label", "Parar o ditado"); toast("🎤 Pode falar… toque de novo para parar.", 2500); }
    catch(_) { fim(); }
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
  // o app redesenha as telas o tempo todo: põe o microfone em todo campo novo
  new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) { if (n.matches && n.matches("textarea, input")) poeMic(n); varrer(n); } }))).observe(document.body, {childList: true, subtree: true});
  varrer(document);
  // trocou de tela: para de ouvir
  document.addEventListener("visibilitychange", () => { if (document.hidden) parar(); });
})();
