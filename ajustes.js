// v59 — Ajustes por abas: Aparência (tudo personalizável, com prévia e Aplicar), Telas, Aparelhos e Mais.
// Nada muda no app até ela tocar em Aplicar. Usa o motor visual.js (window.daiaVisual).
(function () {
  const DV = window.daiaVisual; if (!DV) return;
  const raiz = document.getElementById("ax"); if (!raiz) return;
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const lsG = (k, d) => { try { return localStorage.getItem(k) ?? d; } catch (_) { return d; } };
  const lsS = (k, v) => { try { localStorage.setItem(k, v); return true; } catch (_) { return false; } };

  const PALETA = ["#FFFFFF", "#FAF7F4", "#F5EDE3", "#FCEFF2", "#F3F0FA", "#EEF5FB", "#ECF7F2", "#FFF8E1", "#E8ECE3", "#141318",
    "#111111", "#2A2220", "#3A2A20", "#4A2C35", "#2F2945", "#1F3347", "#1E3B30", "#3D241B", "#6B6B6B", "#BDBDBD",
    "#7A2E3A", "#B3262E", "#E9573F", "#FF4FA3", "#D46F88", "#E58FB6", "#7B61B8", "#6E52A3", "#2F6299", "#0F7C8A",
    "#2E9C74", "#5D7A59", "#9A7B2E", "#C9A24B", "#B5653A", "#C0603C", "#F2C14E", "#F7A072", "#A7C7E7", "#C3B1E1"];
  const QUEM = [["acc", "Destaque"], ["bg", "Fundo"], ["card", "Cartões"], ["ink", "Texto"]];
  const ICO = [["emoji", "Com emojis"], ["simb", "Símbolos simples"], ["nada", "Sem ícones"]];
  const FUNDO = [["liso", "Liso"], ["degrade", "Degradê"], ["pontos", "Pontinhos"], ["bolas", "Bolinhas"], ["estrelas", "Estrelinhas"], ["brilhos", "Brilhos"], ["coracoes", "Corações"], ["flores", "Flores"], ["folhas", "Folhas"], ["nuvens", "Nuvens"], ["neve", "Neve"], ["confete", "Confete"], ["ondas", "Ondas"], ["listras", "Listras"], ["xadrez", "Xadrez"], ["losangos", "Losangos"], ["foto", "Foto"]];
  const CART = [["linha", "Linha fina"], ["sombra", "Sombra"], ["sem", "Sem borda"], ["forte", "Contorno forte"]];
  const MENU = [["nomes", "Ícone e nome"], ["icones", "Só ícone"], ["texto", "Só nome"]];
  const PESO = [["n", "Normais"], ["b", "Negrito"]];
  const MODO = [["auto", "Automático"], ["claro", "Claro"], ["escuro", "Escuro"]];
  const JINI = [["", "Quadradinhos"], ["ini-lista", "Lista"], ["ini-grande", "Botões grandes"]];
  const JQUA = [["abas", "Abas"], ["cols", "Colunas"], ["pilhas", "Pilhas"]];
  const ABRIR = [["novo", "Início"], ["hoje", "Lista de hoje"], ["gravar", "Dia de gravar"], ["antigo", "Metas (telas de antes)"]];
  const sv = (d) => '<svg viewBox="0 0 84 56" aria-hidden="true">' + d + '</svg>';
  const R = (x, y, w, h, rx, f) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + rx + '" fill="' + (f ? "currentColor" : "none") + '" stroke="currentColor" stroke-width="2"/>';
  const DES_INI = { "": sv(R(4, 4, 36, 22, 5) + R(44, 4, 36, 22, 5) + R(4, 30, 36, 22, 5) + R(44, 30, 36, 22, 5)), "ini-lista": sv('<g stroke="currentColor" stroke-width="2"><line x1="4" y1="12" x2="80" y2="12"/><line x1="4" y1="26" x2="80" y2="26"/><line x1="4" y1="40" x2="80" y2="40"/><line x1="4" y1="54" x2="60" y2="54"/></g>'), "ini-grande": sv(R(4, 4, 76, 22, 6) + R(4, 30, 76, 22, 6)) };
  const DES_QUA = { abas: sv(R(4, 4, 24, 10, 3, 1) + R(30, 4, 24, 10, 3) + R(56, 4, 24, 10, 3) + '<g stroke="currentColor" stroke-width="2"><line x1="4" y1="26" x2="80" y2="26"/><line x1="4" y1="38" x2="80" y2="38"/><line x1="4" y1="50" x2="80" y2="50"/></g>'), cols: sv(R(4, 4, 23, 48, 4) + R(31, 4, 23, 48, 4) + R(58, 4, 23, 48, 4)), pilhas: sv(R(4, 4, 76, 14, 4) + R(4, 21, 76, 14, 4) + R(4, 38, 76, 14, 4)) };

  // estado salvo → estado da tela
  function estadoSalvo() {
    let V = DV.ler();
    if (!V) { // sem aparência nova ainda: começa do jeito que ela usa hoje (estética de antes)
      let est = ""; try { est = (JSON.parse(localStorage.getItem("daia-novo-pers") || "{}").est) || ""; } catch (_) {}
      const m = DV.MODELOS.find(x => x[0] === est) || DV.MODELOS[0];
      V = Object.assign({}, DV.PADRAO, DV.doModelo(m));
    }
    let ini = ""; try { ini = (JSON.parse(localStorage.getItem("daia-novo-pers") || "{}").ini) || ""; } catch (_) {}
    return Object.assign({}, V, { foto: DV.foto(), ini, qua: lsG("daia-qj", "abas"), abrir: lsG("daia-abrir", "novo") });
  }
  let atual = estadoSalvo(), prev = Object.assign({}, atual), quem = "acc", foco = "ini", aba = lsG("daia-aj-aba", "apar");
  let meus = []; try { meus = JSON.parse(localStorage.getItem("daia-visual-meus") || "[]") || []; } catch (_) {}

  raiz.innerHTML =
    '<div class="ax-abas"><div class="ax-seg" role="tablist">' + [["apar", "Aparência"], ["telas", "Telas"], ["aparelhos", "Aparelhos"], ["mais", "Mais"]].map(a => '<button role="tab" data-axaba="' + a[0] + '">' + a[1] + '</button>').join("") + '</div></div>' +
    '<div class="ax-previa" id="axPrevia"><span class="ax-tit" id="axPrevTit">Prévia do Início</span><div class="ax-fone"><div class="ax-pv" id="axPv"></div></div></div>' +
    '<section data-axpag="apar">' +
      gr("mod", "Modelos prontos", DV.MODELOS.length + " modelos", true, '<p class="ax-dica">Toque para ver na prévia. Depois mude o detalhe que quiser.</p><div class="ax-modelos" id="axModelos"></div>') +
      gr("cor", "Cores", "qualquer cor", false, '<div class="ax-campo"><p class="ax-lbl">Mudar a cor de</p><div class="ax-chips" id="axQuem"></div></div>' +
        '<div class="ax-corl"><span class="ax-lbl" id="axQuemNome"></span><span class="ax-hex" id="axQuemHex"></span><input type="color" id="axCor" aria-label="Escolher qualquer cor"></div>' +
        '<p class="ax-dica">Toque no quadrinho colorido para abrir todas as cores, ou escolha uma rápida:</p><div class="ax-paleta" id="axPaleta"></div>' +
        '<div class="ax-campo"><p class="ax-lbl">Claro ou escuro</p><div class="ax-chips" id="axModo"></div></div>') +
      gr("let", "Letras", "fonte e tamanho", false, '<div class="ax-campo"><p class="ax-lbl">Fonte dos títulos</p><div class="ax-fontes" id="axFT"></div></div><div class="ax-campo"><p class="ax-lbl">Fonte do texto</p><div class="ax-fontes" id="axFX"></div></div>' +
        '<div class="ax-rg"><p class="ax-lbl">Tamanho da letra</p><span id="axZV"></span><input type="range" id="axZ" min="85" max="135" step="5" aria-label="Tamanho da letra"></div><div class="ax-campo"><p class="ax-lbl">Títulos</p><div class="ax-chips" id="axPeso"></div></div>') +
      gr("for", "Formato", "cantos e cartões", false, '<div class="ax-rg"><p class="ax-lbl">Cantos</p><span id="axRV"></span><input type="range" id="axR" min="0" max="28" step="2" aria-label="Arredondado dos cantos"></div>' +
        '<div class="ax-campo"><p class="ax-lbl">Cartões</p><div class="ax-chips" id="axCart"></div></div><div class="ax-campo"><p class="ax-lbl">Menu de baixo</p><div class="ax-chips" id="axMenu"></div></div>') +
      gr("ico", "Ícones e emojis", "", false, '<div class="ax-chips" id="axIco"></div><p class="ax-dica">Vale para os atalhos e o menu de baixo.</p>', "axIcoRes") +
      gr("fun", "Fundo", "desenho ou foto", false, '<div class="ax-fundos" id="axFundo"></div><div class="ax-foto"><label for="axFotoIn">Escolher foto do celular</label><input type="file" id="axFotoIn" accept="image/*"><span class="ax-dica" id="axFotoNome"></span></div>' +
        '<div class="ax-rg"><p class="ax-lbl">Clareza da foto</p><span id="axVV"></span><input type="range" id="axV" min="0" max="90" step="5" aria-label="Clareza da foto"></div>') +
      gr("meu", "Meus modelos", "", false, '<p class="ax-dica">Gostou do jeito que ficou? Dê um nome e guarde para usar de novo.</p><div class="ax-salva"><input id="axNome" placeholder="Ex.: Natal da Daia"><button class="ax-bt ax-main" id="axGuarda">Guardar</button></div><div class="ax-modelos" id="axMeus"></div><button class="ax-bt" id="axOrig">Voltar ao original do app</button>', "axNMeus") +
    '</section>' +
    '<section data-axpag="telas"><div class="ax-blk ax-corpo2"><p class="ax-lbl">Jeito do Início</p><div class="ax-op3" id="axJIni"></div><p class="ax-lbl">Jeito da Lista de hoje</p><div class="ax-op3" id="axJQua"></div><p class="ax-lbl">Ao abrir o app, começar em</p><div class="ax-chips" id="axJAbrir"></div></div></section>' +
    '<section data-axpag="aparelhos"><div class="syncbox" id="syncBox"></div><p class="ax-dica" style="margin-top:10px">Aparelho novo: abra o link de ligar que você guardou, ou cole o código no campo acima quando ele aparecer.</p></section>' +
    '<section data-axpag="mais">' + mais() + '</section>' +
    '<div class="ax-barra" id="axBarra" hidden><div class="ax-in"><p><b>Só a prévia.</b> Nada mudou ainda.</p><button class="ax-bt" id="axVer">Ver</button><button class="ax-bt" id="axDesfaz">Voltar</button><button class="ax-bt ax-main" id="axAplica">Aplicar</button></div></div>';

  function gr(id, tit, res, aberto, corpo, resId) {
    return '<details class="ax-gr" data-axgr="' + id + '"' + (aberto ? " open" : "") + '><summary><b>' + tit + '</b><small' + (resId ? ' id="' + resId + '"' : '') + '>' + res + '</small></summary><div class="ax-corpo">' + corpo + '</div></details>';
  }
  function mais() {
    const it = (href, t, s) => '<a href="' + href + '"><span><b>' + t + '</b><small>' + s + '</small></span><i>›</i></a>';
    const ant = (q) => "index.html?antigo=1&" + q;
    return '<h2 class="ax-h">Guias</h2><div class="ax-grupo">' +
      it("manual.html", "Manual", "como usar cada parte do app") + it("cronograma.html", "Cronograma", "o que postar em cada dia da semana") +
      it(ant("tab=ajustes&pag=regras"), "Regras e níveis", "Shopee Vídeo, diretrizes, @daledaia") + it("como-esta.html", "Como está tudo", "os robôs e o que mudou") + '</div>' +
      '<h2 class="ax-h">Lojas e vendas</h2><div class="ax-grupo">' +
      it(ant("tab=ajustes&pag=tiktokshop"), "TikTok Shop", "10 vídeos por dia, mineração, 60x60") + it(ant("tab=ajustes&pag=plataformas"), "Plataformas e minhas tags", "Shein, Amazon e as outras") +
      it(ant("tab=ajustes&pag=ofertas"), "Ofertas do grupo", "ofertas com o seu link para o VIP") + '</div>' +
      '<h2 class="ax-h">Minhas coisas</h2><div class="ax-grupo">' +
      it(ant("tab=ideias"), "Minhas ideias", "ideias que você anotou") + it(ant("tab=produtos"), "Meus produtos", "produtos que chegaram para gravar") + it(ant("tab=ia"), "IAs", "atalhos e pedidos prontos") + '</div>' +
      '<h2 class="ax-h">Robô</h2><div class="ax-grupo">' +
      '<a href="https://claude.ai/artifact/5Pgs6xkAreQUUq4XfRujjr" target="_blank" rel="noopener"><span><b>Relatório completo</b><small>o Claude escreve todo dia</small></span><i>↗</i></a>' +
      '<a href="https://docs.google.com/spreadsheets/d/1aVQHfnnTc8kui8VHRQxt7vyP75S87wBq-RuoiOyyJyU/edit" target="_blank" rel="noopener"><span><b>Planilha do robô</b><small>onde fica tudo o que o app mostra</small></span><i>↗</i></a>' +
      it("redesign.html", "Repaginada do app", "as ideias de visual de antes") + '</div>';
  }

  const chips = (id, lista, k) => { $(id).innerHTML = lista.map(x => '<button class="ax-chip' + (String(prev[k]) === x[0] ? " ax-sel" : "") + '" data-axk="' + k + '" data-axv="' + x[0] + '">' + x[1] + '</button>').join(""); };
  const mini = (m, attr, sel) => '<button class="ax-md' + (sel ? " ax-sel" : "") + '" ' + attr + '><span class="ax-mini" style="background:' + m.bg + '"><span class="ax-t" style="color:' + m.ink + ';font-family:' + DV.pilha(m.ft) + '">Aa</span><span class="ax-c" style="background:' + m.card + ';border:1px solid ' + DV.mix(m.ink, m.bg, 12) + ';border-radius:' + Math.min(m.r, 8) + 'px"></span><span class="ax-a" style="background:' + m.acc + '"></span></span><b>' + esc(m.nome) + '</b></button>';

  function pinta() {
    document.querySelectorAll("[data-axaba]").forEach(b => b.setAttribute("aria-selected", String(b.dataset.axaba === aba)));
    document.querySelectorAll("[data-axpag]").forEach(s => { s.hidden = s.dataset.axpag !== aba; });
    $("axPrevia").hidden = !(aba === "apar" || aba === "telas");
    $("axModelos").innerHTML = DV.MODELOS.map(m => mini(Object.assign(DV.doModelo(m), { nome: m[1] }), 'data-axmod="' + m[0] + '"', prev.mod === m[0])).join("");
    $("axQuem").innerHTML = QUEM.map(x => '<button class="ax-chip' + (quem === x[0] ? " ax-sel" : "") + '" data-axquem="' + x[0] + '">' + x[1] + '</button>').join("");
    $("axQuemNome").textContent = QUEM.find(x => x[0] === quem)[1]; $("axQuemHex").textContent = String(prev[quem]).toUpperCase(); $("axCor").value = prev[quem];
    $("axPaleta").innerHTML = PALETA.map(c => '<button class="ax-pt" data-axcor="' + c + '" style="background:' + c + '" aria-label="Cor ' + c + '"></button>').join("");
    chips("axModo", MODO, "modo");
    DV.carregaFontes(DV.FONTES);
    $("axFT").innerHTML = DV.FONTES.map(f => '<button class="ax-fo' + (prev.ft === f ? " ax-sel" : "") + '" data-axk="ft" data-axv="' + f + '" style="font-family:' + DV.pilha(f) + '">Boa noite<small>' + f + '</small></button>').join("");
    $("axFX").innerHTML = DV.FONTES.map(f => '<button class="ax-fo' + (prev.fx === f ? " ax-sel" : "") + '" data-axk="fx" data-axv="' + f + '" style="font-family:' + DV.pilha(f) + ';font-size:14px">Gravei hoje<small>' + f + '</small></button>').join("");
    $("axZ").value = prev.z; $("axZV").textContent = prev.z + "%";
    chips("axPeso", PESO, "peso");
    $("axR").value = prev.r; $("axRV").textContent = prev.r === 0 ? "retos" : prev.r + " px";
    chips("axCart", CART, "cart"); chips("axMenu", MENU, "menu"); chips("axIco", ICO, "ico");
    $("axIcoRes").textContent = ICO.find(x => x[0] === prev.ico)[1].toLowerCase();
    $("axFundo").innerHTML = FUNDO.map(f => '<button class="ax-fd' + (prev.fundo === f[0] ? " ax-sel" : "") + '" data-axk="fundo" data-axv="' + f[0] + '"><span class="ax-am" style="background-color:' + prev.bg + ';' + DV.fundoCSS(f[0], prev.bg, prev.ink, prev.acc, prev.foto, prev.vela, true) + '">' + (f[0] === "foto" && !prev.foto ? "＋" : "") + '</span>' + f[1] + '</button>').join("");
    $("axV").value = prev.vela; $("axVV").textContent = prev.vela + "%"; $("axFotoNome").textContent = prev.foto ? "foto escolhida" : "nenhuma foto";
    $("axNMeus").textContent = meus.length ? meus.length + " guardado" + (meus.length > 1 ? "s" : "") : "nenhum ainda";
    $("axMeus").innerHTML = meus.map((m, i) => '<div class="ax-meu">' + mini(m, 'data-axmeu="' + i + '"', false) + '<button class="ax-x" data-axmeux="' + i + '" aria-label="Apagar ' + esc(m.nome) + '">✕</button></div>').join("");
    $("axJIni").innerHTML = JINI.map(j => '<button class="ax-op' + (prev.ini === j[0] ? " ax-sel" : "") + '" data-axk="ini" data-axv="' + j[0] + '">' + DES_INI[j[0]] + j[1] + '</button>').join("");
    $("axJQua").innerHTML = JQUA.map(j => '<button class="ax-op' + (prev.qua === j[0] ? " ax-sel" : "") + '" data-axk="qua" data-axv="' + j[0] + '">' + DES_QUA[j[0]] + j[1] + '</button>').join("");
    chips("axJAbrir", ABRIR, "abrir");
    tela();
    $("axBarra").hidden = JSON.stringify(atual) === JSON.stringify(prev);
    if (window.daiaSync && daiaSync.pinta) daiaSync.pinta();
  }

  function tela() {
    const t = $("axPv"), p = prev, pl = DV.paleta(p);
    t.className = "ax-pv c-" + p.cart + (p.peso === "b" ? " tb" : "");
    [["--pbg", pl.bg], ["--pcard", pl.card], ["--pink", pl.ink], ["--pacc", pl.acc], ["--pft", DV.pilha(p.ft)], ["--pfx", DV.pilha(p.fx)], ["--pr", Math.min(p.r, 20) + "px"], ["--pz", p.z / 100]].forEach(x => t.style.setProperty(x[0], x[1]));
    t.setAttribute("style", t.getAttribute("style").replace(/background[^;]*;/g, "") + "background-color:" + pl.bg + ";" + DV.fundoCSS(p.fundo, pl.bg, pl.ink, pl.acc, p.foto, p.vela, false).replace(/(\d+)px (\d+)px/, (a, x, y) => Math.round(x * .7) + "px " + Math.round(y * .7) + "px"));
    const I = { emoji: ["🏠", "📋", "🎬", "📚", "⚙️", "🎬", "📋", "📚", "🔗"], simb: ["⌂", "☰", "▣", "❖", "⚙", "▣", "☰", "❖", "↗"], nada: ["", "", "", "", "", "", "", "", ""] }[p.ico];
    const ic = s => s ? '<span class="ax-ic">' + s + '</span>' : "";
    const nomes = ["Início", "Hoje", "Gravar", "Biblioteca", "Ajustes"];
    const nav = '<div class="ax-nav">' + nomes.map((n, i) => { const on = (foco === "qua" ? i === 1 : i === 0) ? ' class="on"' : ''; return '<span' + on + '>' + (p.menu !== "texto" && p.ico !== "nada" ? '<i>' + I[i] + '</i>' : '') + (p.menu !== "icones" ? n : '') + '</span>'; }).join("") + '</div>';
    if (foco === "qua") {
      $("axPrevTit").textContent = "Prévia da Lista de hoje";
      let c = "";
      if (p.qua === "abas") c = '<div class="tabs"><span class="on">Ideia 4</span><span>Gravado 3</span><span>Postado 2</span></div><div class="item">POV · Vila natalina</div><div class="item">Mãos mostrando · Palmeira</div><div class="item">Storytelling · Vila natalina</div>';
      if (p.qua === "cols") c = '<div class="cols"><div class="col"><b>Ideia</b><span class="it"></span><span class="it"></span><span class="it"></span></div><div class="col"><b>Gravado</b><span class="it"></span><span class="it"></span></div><div class="col"><b>Postado</b><span class="it"></span></div></div>';
      if (p.qua === "pilhas") c = '<div class="item"><b>Ideia</b><span>4 ›</span></div><div class="item"><b>Gravado</b><span>3 ›</span></div><div class="item"><b>Postado</b><span>2 ›</span></div>';
      t.innerHTML = '<div class="ola">Lista de hoje</div><div class="dt">segunda, 16 de novembro</div><div class="qd">' + c + '</div>' + nav; return;
    }
    $("axPrevTit").textContent = "Prévia do Início";
    const h = new Date().getHours(), ola = (h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite") + ", Daia";
    const at = [[I[5], "Gravar", "dia de gravar"], [I[6], "Hoje", "lista do dia"], [I[7], "Biblioteca", "ganchos e CTAs"], [I[8], "Links", "atalhos"]];
    const cls = p.ini === "ini-lista" ? "l" : p.ini === "ini-grande" ? "b" : "q";
    t.innerHTML = '<div class="ola">' + ola + '</div><div class="dt">' + new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }) + '</div><div class="prox"><span>Próximo vídeo</span><b>POV · Vila natalina</b></div><div class="g ' + cls + '">' + (cls === "b" ? at.slice(0, 3) : at).map(a => '<div class="at"><b>' + ic(a[0]) + a[1] + '</b><small>' + a[2] + '</small></div>').join("") + '</div>' + nav;
  }

  function mostraPrevia() { const p = $("axPrevia"); if (p.hidden) return; const r = p.getBoundingClientRect(); if (r.bottom < 90 || r.top > innerHeight - 140) p.scrollIntoView({ behavior: "smooth", block: "center" }); }
  function aviso(m) { try { toast(m); } catch (_) {} }

  raiz.addEventListener("click", e => {
    const ab = e.target.closest("[data-axaba]"); if (ab) { aba = ab.dataset.axaba; lsS("daia-aj-aba", aba); if (aba === "apar") foco = "ini"; pinta(); return; }
    const md = e.target.closest("[data-axmod]"); if (md) { Object.assign(prev, DV.doModelo(DV.MODELOS.find(x => x[0] === md.dataset.axmod))); pinta(); mostraPrevia(); return; }
    const mu = e.target.closest("[data-axmeu]"); if (mu) { const m = Object.assign({}, meus[+mu.dataset.axmeu]); delete m.nome; Object.assign(prev, m); pinta(); mostraPrevia(); return; }
    const mx = e.target.closest("[data-axmeux]"); if (mx) { const i = +mx.dataset.axmeux; const n = meus[i] && meus[i].nome; meus.splice(i, 1); lsS("daia-visual-meus", JSON.stringify(meus)); pinta(); aviso("Apaguei " + (n || "o modelo")); return; }
    const q = e.target.closest("[data-axquem]"); if (q) { quem = q.dataset.axquem; pinta(); return; }
    const c = e.target.closest("[data-axcor]"); if (c) { prev[quem] = c.dataset.axcor; prev.mod = ""; pinta(); mostraPrevia(); return; }
    const o = e.target.closest("[data-axk]");
    if (o) {
      const k = o.dataset.axk, v = o.dataset.axv;
      prev[k] = v;
      if (["ft", "fx", "cart"].includes(k)) prev.mod = "";
      if (k === "fundo" && v === "foto" && !prev.foto) $("axFotoIn").click();
      if (k === "qua") foco = "qua"; else if (k === "ini") foco = "ini";
      pinta(); mostraPrevia(); return;
    }
  });
  $("axCor").addEventListener("input", e => { prev[quem] = e.target.value; prev.mod = ""; pinta(); });
  [["axZ", "z"], ["axR", "r"], ["axV", "vela"]].forEach(([id, k]) => $(id).addEventListener("input", e => { prev[k] = +e.target.value; if (k === "r") prev.mod = ""; pinta(); }));
  // foto: diminui para caber no celular e passar para os outros aparelhos
  $("axFotoIn").addEventListener("change", e => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    const img = new Image(), url = URL.createObjectURL(f);
    img.onload = () => {
      const max = 900, k = Math.min(1, max / Math.max(img.width, img.height));
      const cv = document.createElement("canvas"); cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height); URL.revokeObjectURL(url);
      prev.foto = cv.toDataURL("image/jpeg", .72); prev.fundo = "foto"; pinta(); mostraPrevia();
    };
    img.onerror = () => { URL.revokeObjectURL(url); aviso("Não consegui abrir essa foto"); };
    img.src = url; e.target.value = "";
  });
  $("axGuarda").onclick = () => { const n = ($("axNome").value || "").trim() || "Meu modelo " + (meus.length + 1); const m = Object.assign({}, prev, { nome: n }); delete m.foto; delete m.ini; delete m.qua; delete m.abrir; meus.push(m); lsS("daia-visual-meus", JSON.stringify(meus)); $("axNome").value = ""; pinta(); aviso("Guardado: " + n); };
  $("axOrig").onclick = () => { Object.assign(prev, DV.PADRAO, { foto: "" }); pinta(); mostraPrevia(); aviso("O original está na prévia. Toque em Aplicar."); };
  $("axVer").onclick = () => $("axPrevia").scrollIntoView({ behavior: "smooth", block: "center" });
  $("axDesfaz").onclick = () => { prev = Object.assign({}, atual); pinta(); aviso("Voltou como estava"); };
  $("axAplica").onclick = () => {
    const V = {}; Object.keys(DV.PADRAO).forEach(k => { V[k] = prev[k]; });
    lsS(DV.VK, JSON.stringify(V));
    if (prev.foto !== atual.foto) { if (prev.foto) { if (!lsS(DV.FK, prev.foto)) aviso("A foto é grande demais. Tente outra."); } else { try { localStorage.removeItem(DV.FK); } catch (_) {} } }
    // telas
    if (typeof P === "object") { P.ini = prev.ini; if (typeof aplicaP === "function") aplicaP(); }
    if (prev.qua !== atual.qua) { lsS("daia-qj", prev.qua); try { qj = prev.qua; if (typeof quadro === "function") quadro(); } catch (_) {} }
    lsS("daia-abrir", prev.abrir);
    DV.aplicar();
    atual = Object.assign({}, prev); pinta(); aviso("Aplicado");
  };
  // abriu um menu: os outros recolhem sozinhos
  raiz.addEventListener("toggle", e => { const d = e.target; if (!d.matches || !d.matches("details.ax-gr") || !d.open) return; raiz.querySelectorAll("details.ax-gr").forEach(o => { if (o !== d) o.open = false; }); }, true);

  // a barra de Aplicar só aparece na tela de Ajustes
  const tPers = document.getElementById("t-pers");
  if (tPers) new MutationObserver(() => { if (tPers.hidden) $("axBarra").hidden = true; else pinta(); }).observe(tPers, { attributes: true, attributeFilter: ["hidden"] });
  window.addEventListener("storage", e => { if ([DV.VK, DV.FK, "daia-qj", "daia-abrir", "daia-novo-pers"].includes(e.key) && JSON.stringify(atual) === JSON.stringify(prev)) { atual = estadoSalvo(); prev = Object.assign({}, atual); pinta(); } });

  const st = document.createElement("style");
  st.textContent = `
.ax-abas{position:sticky;top:env(safe-area-inset-top,0px);z-index:4;background:var(--bg);padding:6px 0 10px}
.ax-seg{display:grid;grid-template-columns:repeat(4,1fr);background:var(--line);border-radius:12px;padding:3px;gap:3px}
.ax-seg button{padding:8px 4px;border-radius:9px;font-size:13px;font-weight:600;color:var(--mute)}
.ax-seg button[aria-selected="true"]{background:var(--card);color:var(--ink)}
.ax-lbl{font-size:13.5px;font-weight:600;margin:0}.ax-dica{font-size:12px;color:var(--mute);margin:0}
.ax-chips{display:flex;gap:6px;flex-wrap:wrap}
.ax-chip{padding:8px 14px;border-radius:99px;border:1px solid var(--line);background:var(--card);font-size:13.5px;font-weight:500}
.ax-chip.ax-sel{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.ax-sel:not(.ax-chip){border-color:var(--acc)!important;box-shadow:0 0 0 1px var(--acc) inset}
details.ax-gr{background:var(--card);border:1px solid var(--line);border-radius:18px;margin-top:10px;overflow:hidden}
details.ax-gr>summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:10px;padding:13px 14px}
details.ax-gr>summary::-webkit-details-marker{display:none}
details.ax-gr>summary b{flex:1;font-size:15px}details.ax-gr>summary small{color:var(--mute);font-size:12px}
details.ax-gr>summary::after{content:"›";color:var(--mute);font-size:18px;transition:transform .15s}
details.ax-gr[open]>summary::after{transform:rotate(90deg)}
.ax-corpo{padding:0 14px 14px;display:grid;gap:12px}.ax-campo{display:grid;gap:6px}
.ax-blk{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:14px}.ax-corpo2{display:grid;gap:8px}
.ax-modelos{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.ax-md{display:grid;gap:4px;padding:6px;border:1px solid var(--line);border-radius:14px;background:var(--card);text-align:left;width:100%}
.ax-mini{height:54px;border-radius:9px;padding:6px;display:grid;gap:4px;align-content:start;overflow:hidden}
.ax-mini .ax-t{font-size:12px;line-height:1}.ax-mini .ax-c{height:10px;border-radius:4px}.ax-mini .ax-a{height:12px;width:60%;border-radius:4px}
.ax-md b{font-size:11.5px;line-height:1.2;font-weight:600}
.ax-meu{position:relative}.ax-x{position:absolute;top:2px;right:2px;width:24px;height:24px;border-radius:50%;background:var(--card);border:1px solid var(--line);font-size:11px;color:var(--mute)}
.ax-corl{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center}
.ax-hex{font-size:12px;color:var(--mute);font-variant-numeric:tabular-nums}
.ax-corl input[type=color]{width:44px;height:32px;border:1px solid var(--line);border-radius:10px;padding:2px;background:var(--card)}
.ax-paleta{display:grid;grid-template-columns:repeat(10,1fr);gap:5px}.ax-pt{aspect-ratio:1;border-radius:50%;border:1px solid rgba(0,0,0,.1)}
.ax-fontes{display:grid;grid-template-columns:repeat(2,1fr);gap:6px}
.ax-fo{padding:9px 10px;border:1px solid var(--line);border-radius:12px;background:var(--card);text-align:left;font-size:17px;line-height:1.15;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.ax-fo small{display:block;font-family:Inter,system-ui,sans-serif;font-size:10.5px;color:var(--mute)}
.ax-rg{display:grid;grid-template-columns:1fr auto;gap:4px 10px;align-items:center}.ax-rg span{font-size:12px;color:var(--mute)}
.ax-rg input{grid-column:1/-1;width:100%;accent-color:var(--acc)}
.ax-fundos{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.ax-fd{display:grid;gap:4px;justify-items:center;padding:5px;border:1px solid var(--line);border-radius:12px;background:var(--card);font-size:11.5px;font-weight:600}
.ax-am{width:100%;aspect-ratio:1;border-radius:8px;border:1px solid var(--line);display:grid;place-items:center;font-size:18px;color:var(--mute)}
.ax-foto{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.ax-foto label{border:1px dashed var(--line);border-radius:12px;padding:9px 12px;font-size:13.5px;font-weight:600;cursor:pointer}
.ax-foto input{position:absolute;opacity:0;width:1px;height:1px}
.ax-salva{display:flex;gap:8px}.ax-salva input{flex:1;min-width:0;font:inherit;padding:9px 12px;border:1px solid var(--line);border-radius:12px;background:var(--bg);color:var(--ink)}
.ax-op3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.ax-op{display:grid;gap:6px;justify-items:center;padding:8px 6px;border:1px solid var(--line);border-radius:14px;background:var(--card);font-size:12.5px;font-weight:600}
.ax-op svg{width:100%;max-width:84px;height:auto}
.ax-bt{border:1px solid var(--line);border-radius:10px;padding:9px 14px;font-size:13.5px;font-weight:600;background:var(--card)}
.ax-main{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.ax-h{font-size:13px!important;font-weight:600!important;color:var(--mute);letter-spacing:.04em;text-transform:uppercase;margin:18px 0 8px;font-family:inherit!important}
.ax-grupo{background:var(--card);border:1px solid var(--line);border-radius:18px;overflow:hidden}
.ax-grupo a{display:flex;align-items:center;gap:10px;padding:12px 14px;border-top:1px solid var(--line);color:inherit;text-decoration:none}
.ax-grupo a:first-child{border-top:0}.ax-grupo span{flex:1;min-width:0}.ax-grupo b{font-weight:600;font-size:14.5px;display:block}.ax-grupo small{color:var(--mute);font-size:12px}.ax-grupo i{font-style:normal;color:var(--mute)}
.ax-previa{display:grid;justify-items:center;gap:6px;margin:2px 0 6px}.ax-tit{font-size:12px;color:var(--mute)}
.ax-fone{width:200px;max-width:100%;border:7px solid #1d1a19;border-radius:28px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.12)}
.ax-pv{--pbg:#FAF7F4;--pcard:#fff;--pink:#2A2220;--pacc:#7A2E3A;--pr:14px;--pz:1;--pmute:color-mix(in srgb,var(--pink) 55%,var(--pbg));--pline:color-mix(in srgb,var(--pink) 12%,var(--pbg));--pacc2:color-mix(in srgb,var(--pacc) 14%,var(--pcard));
  color:var(--pink);font-family:var(--pfx);padding:13px 11px 0;height:330px;display:flex;flex-direction:column;gap:8px;font-size:calc(9.5px*var(--pz));text-align:left}
.ax-pv .ola{font-family:var(--pft);font-size:1.75em;line-height:1.1}.ax-pv.tb .ola{font-weight:700}.ax-pv .dt{color:var(--pmute);font-size:.95em}
.ax-pv .prox{background:var(--pacc);color:#fff;border-radius:var(--pr);padding:8px 10px;display:grid;gap:1px}.ax-pv .prox b{font-size:1.2em}.ax-pv .prox span{opacity:.8}
.ax-pv .g{display:grid;gap:6px}.ax-pv .g.q{grid-template-columns:1fr 1fr}
.ax-pv .at{background:var(--pcard);border-radius:var(--pr);padding:8px;display:grid;gap:1px}
.ax-pv.c-linha .at{border:1px solid var(--pline)}.ax-pv.c-sombra .at{box-shadow:0 4px 12px color-mix(in srgb,var(--pink) 12%,transparent)}.ax-pv.c-forte .at{border:1.5px solid var(--pink)}
.ax-pv .g.l .at{border-radius:0;border:0;border-bottom:1px solid var(--pline);background:transparent;box-shadow:none;padding:7px 2px}
.ax-pv .g.b .at{padding:12px 10px;font-size:1.15em}.ax-pv .at small{color:var(--pmute);font-size:.85em}.ax-pv .ax-ic{margin-right:4px}
.ax-pv .ax-nav{margin-top:auto;display:flex;justify-content:space-around;border-top:1px solid var(--pline);background:var(--pcard);padding:6px 0 8px;margin-inline:-11px;color:var(--pmute);font-size:.85em}
.ax-pv .ax-nav span{display:grid;justify-items:center}.ax-pv .ax-nav i{font-style:normal}.ax-pv .ax-nav .on{color:var(--pacc);font-weight:700}
.ax-pv .qd{display:grid;gap:6px}.ax-pv .tabs{display:flex;gap:4px}.ax-pv .tabs span{flex:1;text-align:center;padding:4px;border-radius:7px;background:var(--pline);color:var(--pmute)}
.ax-pv .tabs span.on{background:var(--pcard);color:var(--pink);font-weight:700}
.ax-pv .cols{display:grid;grid-template-columns:repeat(3,1fr);gap:4px}.ax-pv .col{background:var(--pcard);border:1px solid var(--pline);border-radius:8px;padding:5px;display:grid;gap:3px;align-content:start}
.ax-pv .it{background:var(--pacc2);border-radius:5px;height:14px}.ax-pv .item{background:var(--pcard);border:1px solid var(--pline);border-radius:9px;padding:7px 8px;display:flex;justify-content:space-between}
.ax-barra{position:fixed;left:0;right:0;bottom:0;z-index:40;background:var(--card);border-top:1px solid var(--line);padding:12px max(16px,env(safe-area-inset-right,0px)) calc(12px + env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px));box-shadow:0 -8px 24px rgba(0,0,0,.08)}
.ax-in{max-width:1100px;margin:0 auto;display:flex;gap:8px;align-items:center}.ax-in p{flex:1;margin:0;font-size:12px;color:var(--mute);line-height:1.3}.ax-in p b{color:var(--ink)}
@media (min-width:700px){.ax-modelos{grid-template-columns:repeat(6,1fr)}.ax-fontes{grid-template-columns:repeat(3,1fr)}.ax-fundos{grid-template-columns:repeat(6,1fr)}}
@media (prefers-reduced-motion:reduce){details.ax-gr>summary::after{transition:none}}`;
  document.head.appendChild(st);
  pinta();
})();
