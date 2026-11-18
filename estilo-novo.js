// v56 — Um app só: as telas de antes (index.html) ganham o MESMO menu de baixo do Início novo,
// o "← Início" no topo e ficam sem emojis nos títulos e botões. Nada muda no que cada tela faz.
(function(){
  const r = document.documentElement;
  if (!r.hasAttribute("data-novo")) return;
  // menu de baixo igual ao do novo.html
  const nav = document.createElement("nav");
  nav.className = "bnav-novo"; nav.setAttribute("aria-label", "Menu");
  nav.innerHTML = [["inicio","⌂","Início"],["noite","☰","Hoje"],["lote","▣","Gravar"],["biblio","❖","Biblioteca"],["pers","⚙","Ajustes"]]
    .map(x => '<a href="novo.html#' + x[0] + '">' + x[1] + '<span>' + x[2] + '</span></a>').join("");
  document.body.appendChild(nav);
  // topo: "← Início" no lugar de "DAIA STUDIO"
  document.querySelectorAll("header.top .brand").forEach(b => {
    const a = document.createElement("a"); a.href = "novo.html"; a.className = "voltar-novo"; a.textContent = "‹ Voltar"; b.prepend(a);
    // v60: volta para a tela de onde ela veio (ex.: Ajustes › Mais), e não sempre para o Início
    a.addEventListener("click", e => { try { if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) { e.preventDefault(); history.back(); } } catch(_) {} });
  });
  // atalho "Postei, anotar, converter link" vindo do Início novo
  try { if (sessionStorage.getItem("daia-mais") === "1") { sessionStorage.removeItem("daia-mais"); setTimeout(() => { const m = document.querySelector("[data-mais]"); if (m) m.click(); }, 700); } } catch(_) {}
  // v60: as metas do dia seguem o Cronograma (Ajustes › Mais › Cronograma)
  try { const C = JSON.parse(localStorage.getItem("daia-crono-v1") || "null"); if (C && typeof METAS !== "undefined") { const d = (new Date().getDay() + 6) % 7, o = (C.dias || {})[d] || {}, b = C.base || {}; METAS.forEach(m => { const v = o[m.id] != null ? o[m.id] : b[m.id]; if (v != null) m.n = v; }); if (typeof renderHoje === "function") try { renderHoje(); } catch(_) {} } } catch(_) {}
  // v59: páginas abertas pelos Ajustes › Mais (Regras, TikTok Shop, Plataformas, Ofertas)
  try { const pg = sessionStorage.getItem("daia-pag"); if (pg) { sessionStorage.removeItem("daia-pag"); setTimeout(() => { if (window.abrirPagina) abrirPagina(pg); }, 500); } } catch(_) {}
  // v59: se ela escolheu "Com emojis" em Ajustes › Aparência, os emojis ficam
  try { const V = JSON.parse(localStorage.getItem("daia-visual-v1") || "null"); if (V && V.ico === "emoji") return; } catch(_) {}
  // sem emojis em títulos, botões e etiquetas (o texto que ela copia não passa por aqui)
  const SEL = "h1,h2,h3,summary,label,button,.tag,.meta,.subtabs,.meta-dia .linha,.voltar-novo";
  const EMO = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}][️‍\p{Extended_Pictographic}]*\s?/gu;
  function limpa(root){
    (root.matches && root.matches(SEL) ? [root] : []).concat(Array.from(root.querySelectorAll ? root.querySelectorAll(SEL) : [])).forEach(el => {
      if (el.closest(".voz-fab,.bnav-novo,textarea,input")) return;
      // botão só com emoji (ex.: microfone) fica como está
      if (el.textContent.replace(EMO, "").trim() === "") { EMO.lastIndex = 0; return; }
      EMO.lastIndex = 0;
      el.childNodes.forEach(n => { if (n.nodeType === 3) { const v = n.nodeValue.replace(EMO, ""); if (v !== n.nodeValue) n.nodeValue = v; } });
      el.querySelectorAll(":scope > span:not([class]), :scope > b, :scope > small, :scope > i").forEach(s => { if (s.children.length === 0) { const v = s.textContent.replace(EMO, ""); if (v !== s.textContent && v.trim() !== "") s.textContent = v; } });
    });
    // ícones-emoji no começo dos rótulos dos cartões ("🎯 Meta de hoje", "🎵 TikTok"): sai só o emoji do começo
    const INI = /^\s*(?:[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}][️‍\p{Extended_Pictographic}]*\s*)+/u;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const mudar = [];
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      const p = n.parentElement;
      if (!p || p.closest("textarea,input,script,style,.voz-fab,.voz-box,.bnav-novo,.say,pre,[contenteditable]")) continue;
      if (!p.closest(".card,header.top")) continue;
      if (INI.test(n.nodeValue)) mudar.push(n);
    }
    mudar.forEach(n => {
      const v = n.nodeValue.replace(INI, "");
      if (v.trim() !== "") { n.nodeValue = v; return; }
      // só emoji num elemento sozinho (ícone): esconde, menos em botão
      const p = n.parentElement;
      if (p.childNodes.length === 1 && !p.closest("button,a") && p !== p.closest(".card")) p.style.display = "none";
    });
  }
  limpa(document.body);
  let t; new MutationObserver(() => { clearTimeout(t); t = setTimeout(() => limpa(document.body), 30); }).observe(document.body, {childList: true, subtree: true});
})();
