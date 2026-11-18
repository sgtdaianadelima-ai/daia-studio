// v59 — Aparência do app inteiro (novo.html e as telas de antes, index.html).
// Ela escolhe em Ajustes › Aparência: modelo pronto, qualquer cor, fontes, tamanho da letra, cantos,
// cartões, menu de baixo, emojis ou não, e fundo (desenho ou foto). Fica em daia-visual-v1
// (a foto em daia-visual-foto). Sem nada salvo, o app fica como sempre foi.
(function () {
  const VK = "daia-visual-v1", FK = "daia-visual-foto";
  const MODELOS = [
    ["padrao", "Padrão", "#FAF7F4", "#FFFFFF", "#2A2220", "#7A2E3A", "Inter", "Inter", 18, "linha", "liso"],
    ["rosa", "Rosa delicado", "#FCEFF2", "#FFFFFF", "#4A2C35", "#D46F88", "Quicksand", "Quicksand", 24, "sombra", "liso"],
    ["salvia", "Verde sálvia", "#E8ECE3", "#FAF8F2", "#2E3A2D", "#5D7A59", "Fraunces", "Nunito", 22, "linha", "liso"],
    ["caderno", "Caderno", "#FFFDF7", "#FFFFFF", "#2D2A26", "#C2655A", "Caveat", "DM Sans", 6, "linha", "pontos"],
    ["lavanda", "Lavanda", "#F3F0FA", "#FFFFFF", "#2F2945", "#7B61B8", "Poppins", "Poppins", 18, "sombra", "liso"],
    ["ceu", "Céu", "#EEF5FB", "#FFFFFF", "#1F3347", "#2F6299", "Montserrat", "Inter", 16, "linha", "liso"],
    ["menta", "Menta", "#ECF7F2", "#FFFFFF", "#1E3B30", "#2E9C74", "Comfortaa", "Nunito", 22, "sombra", "liso"],
    ["coral", "Coral", "#FFF3EE", "#FFFFFF", "#3D2622", "#E9573F", "Poppins", "Nunito", 22, "sombra", "liso"],
    ["boho", "Boho", "#F5EDE3", "#FFFAF4", "#3B2A20", "#B5653A", "Playfair Display", "Lora", 10, "linha", "listras"],
    ["cafe", "Café", "#EFE6DC", "#FBF6F0", "#3A2A20", "#7A4B2A", "DM Serif Display", "DM Sans", 12, "linha", "liso"],
    ["terracota", "Terracota", "#F6EAE2", "#FFF8F3", "#3D241B", "#C0603C", "Fraunces", "DM Sans", 14, "linha", "liso"],
    ["oceano", "Oceano", "#E9F4F6", "#FFFFFF", "#12343B", "#0F7C8A", "Raleway", "Inter", 12, "linha", "degrade"],
    ["natal", "Natal", "#FBF5EE", "#FFFFFF", "#2B1D17", "#B3262E", "Dancing Script", "Lora", 14, "linha", "estrelas"],
    ["pastel", "Pastel", "#FFF8FB", "#FFFFFF", "#3E3346", "#E58FB6", "Pacifico", "Quicksand", 24, "sombra", "coracoes"],
    ["chiclete", "Chiclete", "#FFF0F7", "#FFFFFF", "#3A1F33", "#FF4FA3", "Satisfy", "Poppins", 18, "forte", "liso"],
    ["pb", "Preto e branco", "#FFFFFF", "#FFFFFF", "#111111", "#111111", "Josefin Sans", "Inter", 0, "forte", "liso"],
    ["noite", "Noite", "#141318", "#1F1D24", "#F2EEF7", "#C9A7F0", "Inter", "Inter", 16, "linha", "liso"],
    ["dourado", "Preto e dourado", "#151311", "#211E1A", "#F3EBDD", "#C9A24B", "Playfair Display", "Raleway", 8, "linha", "liso"]
  ];
  const FONTES = ["Inter", "Poppins", "Montserrat", "Nunito", "Quicksand", "Raleway", "Comfortaa", "Josefin Sans", "DM Sans", "Fraunces", "Playfair Display", "Lora", "DM Serif Display", "Caveat", "Dancing Script", "Pacifico", "Satisfy", "Amatic SC"];
  const SERIF = ["Fraunces", "Playfair Display", "Lora", "DM Serif Display"], MAO = ["Caveat", "Dancing Script", "Pacifico", "Satisfy", "Amatic SC"];
  const UM_PESO = ["Pacifico", "DM Serif Display", "Satisfy"];
  const pilha = f => "'" + f + "'," + (SERIF.includes(f) ? "Georgia,serif" : MAO.includes(f) ? "cursive" : "system-ui,-apple-system,'Segoe UI',sans-serif");
  const doModelo = m => ({ mod: m[0], bg: m[2], card: m[3], ink: m[4], acc: m[5], ft: m[6], fx: m[7], r: m[8], cart: m[9], fundo: m[10] });
  const PADRAO = Object.assign(doModelo(MODELOS[0]), { modo: "auto", z: 100, peso: "b", menu: "nomes", ico: "simb", vela: 55 });

  const isDark = h => { const n = parseInt(String(h).slice(1), 16); if (isNaN(n)) return false; return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 < 110; };
  const mix = (a, b, p) => "color-mix(in srgb," + a + " " + p + "%," + b + ")";

  // desenhos de fundo: ladrilho SVG que se repete, na cor do texto bem clarinha (confete usa o destaque)
  function desenho(k, ink, acc, forte) {
    const o = forte ? 2.6 : 1;
    const F = 'fill="' + ink + '" fill-opacity="' + (.15 * o) + '"', S = 'stroke="' + ink + '" stroke-opacity="' + (.18 * o) + '" fill="none" stroke-width="1.4"', A = 'fill="' + acc + '" fill-opacity="' + Math.min(.4 * o, .9) + '"';
    const estrela = (x, y, s) => '<polygon transform="translate(' + x + ' ' + y + ') scale(' + s + ')" points="5,0 6.2,3.6 10,3.8 7,6.1 8.1,9.8 5,7.6 1.9,9.8 3,6.1 0,3.8 3.8,3.6" ' + F + '/>';
    const coracao = (x, y, s) => '<path transform="translate(' + x + ' ' + y + ') scale(' + s + ')" d="M5 9C-3 3 2-2 5 2C8-2 13 3 5 9Z" ' + F + '/>';
    const brilho = (x, y, s) => '<path transform="translate(' + x + ' ' + y + ') scale(' + s + ')" d="M5 0Q6 4 10 5Q6 6 5 10Q4 6 0 5Q4 4 5 0Z" ' + F + '/>';
    const flor = (x, y) => '<g transform="translate(' + x + ' ' + y + ')" ' + F + '><circle cx="0" cy="-4" r="3"/><circle cx="4" cy="-1" r="3"/><circle cx="2.5" cy="3.5" r="3"/><circle cx="-2.5" cy="3.5" r="3"/><circle cx="-4" cy="-1" r="3"/></g>';
    const folha = (x, y, r) => '<path transform="translate(' + x + ' ' + y + ') rotate(' + r + ')" d="M0 8Q4 0 12 0Q9 8 0 8Z" ' + F + '/>';
    const nuvem = (x, y) => '<g transform="translate(' + x + ' ' + y + ')" ' + F + '><circle cx="6" cy="6" r="5"/><circle cx="13" cy="4" r="6"/><circle cx="20" cy="7" r="4.5"/><rect x="5" y="6" width="16" height="5.5" rx="2.7"/></g>';
    const neve = (x, y) => '<g transform="translate(' + x + ' ' + y + ')" ' + S + '><path d="M0-6V6M-5.2-3 5.2 3M-5.2 3 5.2-3"/></g>';
    const T = {
      bolas: [44, '<circle cx="11" cy="11" r="5" ' + F + '/><circle cx="33" cy="33" r="5" ' + F + '/>'],
      estrelas: [48, estrela(6, 6, 1) + estrela(28, 26, 1.4) + estrela(36, 4, .7) + estrela(10, 34, .8)],
      brilhos: [48, brilho(6, 6, 1.1) + brilho(30, 28, 1.5) + brilho(36, 6, .6)],
      coracoes: [48, coracao(6, 8, 1.1) + coracao(30, 30, 1.4)],
      flores: [52, flor(12, 12) + flor(38, 38)],
      folhas: [52, folha(6, 10, -20) + folha(30, 34, 25)],
      nuvens: [64, nuvem(4, 8) + nuvem(34, 40)],
      neve: [48, neve(12, 12) + neve(36, 34)],
      confete: [44, '<rect x="6" y="8" width="6" height="3" rx="1" transform="rotate(30 9 9)" ' + A + '/><rect x="28" y="30" width="6" height="3" rx="1" transform="rotate(-25 31 31)" ' + F + '/><circle cx="34" cy="10" r="2" ' + A + '/><circle cx="12" cy="34" r="1.8" ' + F + '/>'],
      ondas: [40, '<path d="M0 10Q10 2 20 10T40 10M0 30Q10 22 20 30T40 30" ' + S + '/>'],
      losangos: [32, '<path d="M16 2 30 16 16 30 2 16Z" ' + S + '/>']
    }[k];
    if (!T) return null;
    return { img: "url('data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="' + T[0] + '" height="' + T[0] + '">' + T[1] + '</svg>') + "')", tam: T[0] * .6 };
  }
  // fundo em CSS (para o app e para os quadradinhos de escolha)
  function fundoCSS(f, bg, ink, acc, foto, vela, mini) {
    const d = desenho(f, ink, acc, mini);
    const L = c => mix(ink, "transparent", c);
    if (d) return "background-image:" + d.img + ";background-size:" + d.tam + "px " + d.tam + "px;";
    if (f === "degrade") return "background-image:linear-gradient(180deg," + mix(acc, bg, mini ? 30 : 20) + "," + bg + " " + (mini ? 100 : 60) + "%);";
    if (f === "pontos") return "background-image:radial-gradient(" + L(mini ? 18 : 12) + " 1px,transparent 1.3px);background-size:" + (mini ? 8 : 14) + "px " + (mini ? 8 : 14) + "px;";
    if (f === "listras") return "background-image:repeating-linear-gradient(135deg," + L(mini ? 12 : 6) + " 0 6px,transparent 6px 14px);";
    if (f === "xadrez") return "background-image:linear-gradient(" + L(mini ? 14 : 8) + " 1px,transparent 1px),linear-gradient(90deg," + L(mini ? 14 : 8) + " 1px,transparent 1px);background-size:" + (mini ? 11 : 18) + "px " + (mini ? 11 : 18) + "px;";
    if (f === "foto" && foto) { const a = Math.round(vela); return "background-image:linear-gradient(" + mix(bg, "transparent", a) + "," + mix(bg, "transparent", a) + "),url(" + foto + ");background-size:cover;background-position:center;"; }
    return "background-image:none;";
  }

  // cores finais (escuro automático quando o celular está no escuro)
  function paleta(V) {
    const escuroSO = window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
    let bg = V.bg, card = V.card, ink = V.ink, acc = V.acc;
    const querEscuro = V.modo === "escuro" || (V.modo === "auto" && escuroSO);
    if (querEscuro && !isDark(bg)) { bg = "#171413"; card = "#211D1B"; ink = "#F1EBE7"; acc = mix(acc, "#FFFFFF", 70); }
    return { bg, card, ink, acc, escuro: isDark(bg) };
  }

  const ler = () => { try { const v = JSON.parse(localStorage.getItem(VK) || "null"); return v ? Object.assign({}, PADRAO, v) : null; } catch (_) { return null; } };
  const foto = () => { try { return localStorage.getItem(FK) || ""; } catch (_) { return ""; } };

  function carregaFontes(lista) {
    const fam = Array.from(new Set(lista)).filter(f => FONTES.includes(f));
    if (!fam.length) return;
    const href = "https://fonts.googleapis.com/css2?" + fam.map(f => "family=" + f.replace(/ /g, "+") + (UM_PESO.includes(f) ? "" : ":wght@400;700")).join("&") + "&display=swap";
    let l = document.getElementById("vis-fontes");
    if (!l) { l = document.createElement("link"); l.id = "vis-fontes"; l.rel = "stylesheet"; document.head.appendChild(l); }
    if (l.href !== href) l.href = href;
  }

  const H = "html[data-vis][data-vis][data-vis]";
  const CARTOES = ".tile,.streak,.lprod,.box,.col,.qp,.qc,.regra,.syncbox,.usarbox,.vazio,.card,.card1,.qlist,.gr3 button,.ax-blk,.ax-gr,.jeitos button,.temas button";
  function css(V) {
    const p = paleta(V), mute = mix(p.ink, p.bg, 58), line = mix(p.ink, p.bg, 12), soft = mix(p.acc, p.card, 14);
    const ft = pilha(V.ft), fx = pilha(V.fx), r = V.r + "px";
    let s = H + "{--bg:" + p.bg + "!important;--card:" + p.card + "!important;--surface:" + p.card + "!important;--ink:" + p.ink + "!important;" +
      "--mute:" + mute + "!important;--muted:" + mute + "!important;--line:" + line + "!important;--acc:" + p.acc + "!important;--acc-soft:" + soft + "!important;" +
      "--wine:" + p.acc + "!important;--wine-soft:" + soft + "!important;--f:" + fx + "!important;--body:" + fx + "!important;--fn:" + ft + "!important;--fh:" + ft + "!important;" +
      "--display:" + ft + "!important;--num:" + ft + "!important;--raio:" + r + "!important;--vr:" + r + ";color-scheme:" + (p.escuro ? "dark" : "light") + "}" +
      H + " body{background-color:" + p.bg + "!important;" + fundoCSS(V.fundo, p.bg, p.ink, p.acc, foto(), V.vela, false) + "background-attachment:fixed!important}" +
      H + " h1," + H + " h2," + H + " .title{font-family:" + ft + "!important;font-weight:" + (V.peso === "b" ? 700 : 400) + "!important}" +
      H + " :is(" + CARTOES + "){border-radius:" + r + "!important}";
    { const big = (V.mod === "padrao" || V.mod === "pb") ? p.ink : p.acc, on = (() => { const n = parseInt(String(big).slice(1), 16); return isNaN(n) || ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 < 170 ? "#FFFFFF" : "#1A1716"; })();
      s += H + " .tile.big{background:" + big + "!important;border-color:" + big + "!important;color:" + on + "!important}" + H + " .tile.big small{color:" + on + "!important;opacity:.78}" + H + " .tile.big .ic{background:" + mix(on, "transparent", 16) + "!important;color:" + on + "!important}"; }
    if (V.cart === "sombra") s += H + " :is(" + CARTOES + "){border-color:transparent!important;box-shadow:0 4px 14px " + mix(p.ink, "transparent", 10) + "!important}";
    if (V.cart === "sem") s += H + " :is(" + CARTOES + "){border-color:transparent!important;box-shadow:none!important}";
    if (V.cart === "forte") s += H + " :is(" + CARTOES + "){border:1.5px solid " + p.ink + "!important}";
    if (V.menu === "icones") s += H + " :is(.bnav,.bnav-novo) span{display:none!important}";
    if (V.menu === "texto" || V.ico === "nada") s += H + " :is(.bnav button,.bnav-novo a){font-size:0!important;gap:0!important}" + H + " :is(.bnav,.bnav-novo) span{font-size:11px!important;display:block!important}";
    if (V.ico === "nada") s += H + " .tile .ic{display:none!important}";
    if (V.z && V.z !== 100) s += H + "{zoom:" + (V.z / 100) + "}";
    return s;
  }

  // ícones: símbolos (como sempre), emojis ou nenhum
  const EMO = { "⌂": "🏠", "☰": "📋", "▣": "🎬", "❖": "📚", "⚙": "⚙️", "＋": "➕", "✎": "📝", "◎": "🎯", "✦": "✨", "▤": "🖼️", "↗": "🔗", "✓": "✅", "♡": "💗", "★": "⭐", "☆": "⭐", "◷": "⏰", "▶": "▶️", "✿": "🌸", "⚑": "🚩" };
  const SIMB = {}; Object.keys(EMO).forEach(k => { SIMB[EMO[k]] = k; });
  function icones(V) {
    const mapa = V && V.ico === "emoji" ? EMO : SIMB;
    document.querySelectorAll(".bnav button,.bnav-novo a,.tile .ic").forEach(el => {
      el.childNodes.forEach(n => {
        if (n.nodeType !== 3) return;
        const t = n.nodeValue.trim(); if (!t) return;
        if (mapa[t]) n.nodeValue = n.nodeValue.replace(t, mapa[t]);
      });
    });
  }

  function aplicar(V) {
    V = V || ler();
    const r = document.documentElement;
    let st = document.getElementById("vis-css");
    if (!V) { if (st) st.remove(); r.removeAttribute("data-vis"); icones(null); return; }
    if (!st) { st = document.createElement("style"); st.id = "vis-css"; (document.head || r).appendChild(st); }
    st.textContent = css(V);
    r.setAttribute("data-vis", "");
    const p = paleta(V);
    r.setAttribute("data-theme", p.escuro ? "dark" : "light");
    // as estéticas antigas (Rosa, Sálvia, Caderno) só ficam com o detalhe delas quando é o modelo delas
    if (["rosa", "salvia", "caderno"].includes(V.mod)) r.setAttribute("data-est", V.mod); else r.removeAttribute("data-est");
    carregaFontes([V.ft, V.fx]);
    const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = p.bg;
    if (document.body) icones(V);
  }

  // regra dela: abriu um menu, os outros do mesmo grupo recolhem sozinhos (no app inteiro)
  // (só quando ela toca: o que o app abre sozinho ao desenhar a tela fica como está)
  let toque = 0;
  document.addEventListener("click", e => { if (e.target.closest && e.target.closest("summary")) toque = Date.now(); }, true);
  document.addEventListener("toggle", e => {
    const d = e.target;
    if (!d || d.tagName !== "DETAILS" || !d.open || !d.parentElement || Date.now() - toque > 1500) return;
    Array.from(d.parentElement.children).forEach(o => { if (o !== d && o.tagName === "DETAILS" && o.className === d.className && o.open) o.open = false; });
  }, true);

  window.daiaVisual = { VK, FK, MODELOS, FONTES, PADRAO, doModelo, desenho, fundoCSS, paleta, pilha, isDark, mix, ler, foto, aplicar, carregaFontes };
  aplicar();
  document.addEventListener("DOMContentLoaded", () => {
    const V = ler(); if (V) { aplicar(V); }
    // menus de antes que aparecem depois (index.html) também ganham os ícones escolhidos
    let t; new MutationObserver(() => { clearTimeout(t); t = setTimeout(() => { const v = ler(); if (v && v.ico === "emoji") icones(v); }, 60); }).observe(document.body, { childList: true, subtree: true });
  });
  if (window.matchMedia) matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => aplicar());
  // mudou em outro aparelho (aparelhos ligados) ou em outra aba
  window.addEventListener("storage", e => { if (e.key === VK || e.key === FK) aplicar(); });
})();
