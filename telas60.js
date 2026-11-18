// v60 — Voltar em toda tela, Cronograma único (editável e ligado ao app), Manual "Como faço…?",
// Regras e níveis (TikTok Shop, Shopee Vídeo, Instagram) e o robozinho da IA em todas as telas.
// Carregado no novo.html ANTES do script principal (as telas novas já existem quando o app abre).
(function () {
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const lerJ = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? d : v; } catch (_) { return d; } };
  const grava = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} };
  const A = () => window.daiaApp || {};
  const aviso = m => { try { A().toast(m); } catch (_) {} };
  const irPara = t => { try { A().ir(t); } catch (_) {} };

  // ---------- CRONOGRAMA (um só para o app inteiro) ----------
  const CK = "daia-crono-v1";
  const REDES = [["tiktok", "TikTok", "com sacolinha · programa piloto: até 10"], ["shopee", "Shopee Vídeo", "mais de 10 segundos para contar dia ativo"], ["insta", "Instagram Reels", "pode ser o mesmo vídeo do TikTok, sem sacolinha"], ["stories", "Stories", "bom dia, achado, caixinha, oferta"]];
  const DN = ["S", "T", "Q", "Q", "S", "S", "D"], DL = ["segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo"];
  const PADRAO = { base: { tiktok: 10, shopee: 3, insta: 2, stories: 6 }, dias: {}, horas: ["8h", "10h", "12h", "14h", "16h", "18h", "19h", "20h", "21h", "22h"], gravar: { dias: [5, 6], n: 60 }, lembretes: [] };
  const crono = () => { const c = lerJ(CK, null) || {}; return Object.assign({}, PADRAO, c, { base: Object.assign({}, PADRAO.base, c.base || {}), gravar: Object.assign({}, PADRAO.gravar, c.gravar || {}) }); };
  const metaDia = (k, d) => { const c = crono(), o = (c.dias || {})[d]; return o && o[k] != null ? o[k] : c.base[k]; };
  const hojeI = () => (new Date().getDay() + 6) % 7;
  window.daiaCrono = { ler: crono, metaDia, hojeI, metaFim: () => { const c = crono(); return c.gravar.n * c.gravar.dias.length; } };

  // aplica o cronograma no resto do app (Início, Lista de hoje, Dia de gravar)
  function ligaApp() {
    const d = hojeI();
    try { A().MIS.forEach(m => { const v = metaDia(m[0], d); if (v != null) m[2] = v; }); } catch (_) {}
    try { A().conta(); } catch (_) {}
    const c = crono(), sub = document.querySelector("#t-lote .sub");
    if (sub) sub.textContent = c.gravar.dias.map(i => DL[i]).join(" e ").replace(/^./, x => x.toUpperCase()) + ". Meta: " + c.gravar.n + " por dia (" + c.gravar.n * c.gravar.dias.length + " no total). Mude no Cronograma.";
    try { A().lote(); } catch (_) {}
  }
  window.addEventListener("storage", e => { if (e.key === CK) { ligaApp(); if (!$("t-crono").hidden) pintaCrono(); } });

  let dsel = hojeI();
  function pintaCrono() {
    const c = crono(), box = $("crBox"); if (!box) return;
    const val = k => metaDia(k, dsel);
    const tot = REDES.map(r => { let s = 0; for (let i = 0; i < 7; i++) s += metaDia(r[0], i); return '<div><b>' + s + '</b><small>' + r[1].replace("Instagram ", "") + '/sem.</small></div>'; }).join("");
    box.innerHTML =
      '<h2 class="c6-h">Quanto postar por dia</h2><div class="c6-dias">' + DN.map((x, i) => '<button aria-pressed="' + (i === dsel) + '" data-crd="' + i + '"' + (c.gravar.dias.includes(i) ? ' class="grav"' : '') + ' aria-label="' + DL[i] + '">' + x + '</button>').join("") + '</div>' +
      '<p class="mini" style="margin:6px 0 8px">Mostrando ' + DL[dsel] + ((c.dias || {})[dsel] ? ' (diferente dos outros dias) · <button class="c6-lk" data-crigual="' + dsel + '">deixar igual aos outros</button>' : ' (igual todo dia)') + '. O risquinho marca o dia de gravar.</p>' +
      '<div class="c6-gr">' + REDES.map(r => '<div class="c6-meta"><b>' + r[1] + '</b><span class="c6-step"><button data-crm="' + r[0] + '|-1" aria-label="Menos ' + r[1] + '">−</button><output>' + val(r[0]) + '</output><button data-crm="' + r[0] + '|1" aria-label="Mais ' + r[1] + '">+</button></span><small>' + r[2] + '</small></div>').join("") + '</div>' +
      '<div class="c6-tot">' + tot + '</div>' +
      '<p class="mini" style="margin-top:6px">Mudar no dia escolhido vale só para ele. <button class="c6-lk" data-crtodos="1">Usar estes números em todos os dias</button></p>' +
      '<h2 class="c6-h">Horários para programar</h2><div class="c6-gr c6-pad"><p class="mini">TikTok: programe espalhado no dia. Toque num horário para tirar.</p><div class="c6-hr">' + c.horas.map((h, i) => '<button data-crhx="' + i + '">' + esc(h) + ' ✕</button>').join("") + '</div><div class="c6-add"><input id="crHora" placeholder="Ex.: 13h30"><button class="bt" data-crh="1">+ horário</button></div></div>' +
      '<h2 class="c6-h">Dia de gravar</h2><div class="c6-gr c6-pad"><div class="c6-dias">' + DN.map((x, i) => '<button aria-pressed="' + c.gravar.dias.includes(i) + '" data-crg="' + i + '" aria-label="Gravar ' + DL[i] + '">' + x + '</button>').join("") + '</div>' +
        '<div class="c6-meta" style="border:0;padding:8px 0 0"><b>Vídeos por dia de gravação</b><span class="c6-step"><button data-crgn="-5" aria-label="Menos 5">−</button><output>' + c.gravar.n + '</output><button data-crgn="5" aria-label="Mais 5">+</button></span><small>' + c.gravar.n * c.gravar.dias.length + ' no total</small></div></div>' +
      '<h2 class="c6-h">Lembretes e datas</h2><div class="c6-gr c6-pad">' + (c.lembretes.length ? c.lembretes.map((l, i) => '<div class="c6-lem"><span><b>' + esc(l.d) + '</b> ' + esc(l.t) + '</span><button data-crlx="' + i + '" aria-label="Tirar lembrete">✕</button></div>').join("") : '<p class="mini">Nenhum ainda. Ex.: 27/11 Black Friday: dobrar Shopee Vídeo.</p>') +
        '<div class="c6-add"><input id="crLD" placeholder="Data (27/11)" style="max-width:110px"><input id="crLT" placeholder="O que fazer"><button class="bt" data-crl="1">+</button></div></div>' +
      '<h2 class="c6-h">Isso muda sozinho em</h2><div class="c6-gr c6-pad c6-liga"><div>Início: as metas de hoje (TikTok, Shopee Vídeo, Instagram)</div><div>Lista de hoje e semana: quantos vídeos entram em cada dia</div><div>Dia de gravar: a meta do fim de semana</div><div>Metas e Faça agora (telas de antes): a mesma meta</div></div>';
  }
  function mudaCrono(f) { const c = crono(); f(c); grava(CK, c); pintaCrono(); ligaApp(); }
  document.addEventListener("click", e => {
    const t = e.target.closest && e.target.closest("[data-crd],[data-crm],[data-crigual],[data-crtodos],[data-crhx],[data-crh],[data-crg],[data-crgn],[data-crl],[data-crlx]");
    if (!t || !t.closest("#t-crono")) return;
    const d = t.dataset;
    if (d.crd != null) { dsel = +d.crd; pintaCrono(); return; }
    if (d.crm) { const [k, n] = d.crm.split("|"); mudaCrono(c => { c.dias = c.dias || {}; const o = c.dias[dsel] = Object.assign({}, c.dias[dsel]); o[k] = Math.max(0, metaDia(k, dsel) + +n); if (REDES.every(r => (o[r[0]] ?? c.base[r[0]]) === c.base[r[0]])) delete c.dias[dsel]; }); return; }
    if (d.crigual) { mudaCrono(c => { delete c.dias[+d.crigual]; }); return; }
    if (d.crtodos) { mudaCrono(c => { REDES.forEach(r => { c.base[r[0]] = metaDia(r[0], dsel); }); c.dias = {}; }); aviso("Esses números valem para todos os dias"); return; }
    if (d.crhx) { mudaCrono(c => { c.horas.splice(+d.crhx, 1); }); return; }
    if (d.crh) { const v = ($("crHora").value || "").trim(); if (v) mudaCrono(c => { c.horas.push(v); }); return; }
    if (d.crg) { mudaCrono(c => { const i = +d.crg, s = new Set(c.gravar.dias); s.has(i) ? s.delete(i) : s.add(i); c.gravar.dias = [...s].sort(); }); return; }
    if (d.crgn) { mudaCrono(c => { c.gravar.n = Math.max(5, c.gravar.n + +d.crgn); }); return; }
    if (d.crl) { const dd = ($("crLD").value || "").trim(), tt = ($("crLT").value || "").trim(); if (dd || tt) mudaCrono(c => { c.lembretes.push({ d: dd, t: tt }); }); return; }
    if (d.crlx) { mudaCrono(c => { c.lembretes.splice(+d.crlx, 1); }); return; }
  });

  // ---------- MANUAL "Como faço…?" ----------
  const CAT = ["Tudo", "Gravar", "Postar", "Aparência", "Aparelhos", "Vendas"];
  const PERG = [
    ["Gravar", "Como monto o fim de semana de gravação?", ["Toque em Gravar no menu de baixo.", "Escolha Sábado ou Domingo e adicione os produtos (ou escreva o seu).", "Em cada produto, marque as dores e quantos vídeos de cada formato.", "Abra Roteiros: cada vídeo já vem com gancho, roteiro e legenda."], "lote", "Abrir Dia de gravar"],
    ["Gravar", "Como marco que gravei um vídeo?", ["No Dia de gravar, abra o produto e o vídeo.", "Toque em Gravei. Se precisa editar depois, toque em Precisa editar.", "Quando todos do produto estão gravados, o cartão fecha sozinho."], "lote", "Abrir Dia de gravar"],
    ["Gravar", "Como uso um gancho da Biblioteca num produto?", ["Abra a Biblioteca › Ganchos e toque no gancho.", "Toque em Usar este gancho num produto de gravar.", "Escolha o produto. O gancho entra nos primeiros vídeos dele."], "biblio", "Abrir Biblioteca"],
    ["Gravar", "Como coloco o meu próprio formato ou a minha dor?", ["No Dia de gravar, abra o produto.", "Em Dor, toque em Escrever outra dor.", "Em Formatos, escreva o nome do seu formato e toque em Adicionar formato."], "lote", "Abrir Dia de gravar"],
    ["Postar", "Como agendo um vídeo para outro dia?", ["Abra o vídeo no Dia de gravar.", "Toque em Agendei e escolha a data.", "Ele vai sozinho para o dia certo da semana."], "lote", "Abrir Dia de gravar"],
    ["Postar", "Como marco que postei?", ["Na Lista de hoje, toque no vídeo e em Postei.", "A meta do TikTok no Início sobe sozinha.", "Shopee Vídeo e Instagram: toque na meta no Início para marcar."], "noite", "Abrir Lista de hoje"],
    ["Postar", "Quantos vídeos posto por dia?", ["Está no Cronograma.", "Mude ali e o Início, a Lista de hoje e o Dia de gravar seguem."], "crono", "Abrir Cronograma"],
    ["Postar", "Em que horário programo os vídeos?", ["Veja os horários no Cronograma.", "Programe no TikTok espalhado pelo dia. Você pode tirar ou pôr horários."], "crono", "Abrir Cronograma"],
    ["Aparência", "Como mudo cores, letras e fundo?", ["Ajustes › Aparência.", "Toque num modelo ou mude cor, fonte, fundo.", "Veja na prévia e toque em Aplicar."], "pers", "Abrir Ajustes"],
    ["Aparência", "Como mudo o jeito do Início e da Lista?", ["Ajustes › Aparência › Jeito das telas.", "Escolha e veja na prévia. Toque em Aplicar."], "pers", "Abrir Ajustes"],
    ["Aparelhos", "Como ligo o tablet ou o computador?", ["Abra o link de ligar que você guardou, uma vez em cada aparelho.", "Ou vá em Ajustes › Aparelhos e cole o código (a parte depois de ligar=).", "Aparece Ligado. Pronto: tudo igual nos aparelhos."], "pers", "Abrir Ajustes"],
    ["Vendas", "Como mando uma oferta no grupo VIP?", ["Ajustes › Mais › Ofertas do grupo.", "Confira a oferta com o seu link.", "Toque em Mandar no grupo: o WhatsApp abre com o texto pronto."], "@ofertas", "Abrir Ofertas"],
    ["Vendas", "Onde faço a proposta para blogueiras (parcerias)?", ["Ajustes › Mais › Crescer e parcerias.", "Escolha Parcerias: tem quanto oferecer e a mensagem pronta para editar."], "@crescer", "Abrir Parcerias"],
    ["Vendas", "Quais as regras do TikTok Shop?", ["Ajustes › Mais › Regras e níveis.", "Na aba TikTok Shop: o seu nível, o pode e não pode e a saúde da conta."], "regras", "Abrir Regras"],
    ["Vendas", "Como falo com a IA?", ["Toque no robozinho redondo no canto da tela.", "Escolha ChatGPT, Gemini ou Claude, ou um pedido pronto.", "O pedido já vai com o seu nicho e as suas regras."], "", ""]
  ];
  let mcat = "Tudo";
  function pintaManual() {
    const box = $("maBox"); if (!box) return;
    const b = (($("maBusca") || {}).value || "").toLowerCase();
    $("maCats").innerHTML = CAT.map(c => '<button aria-pressed="' + (c === mcat) + '" data-mcat="' + c + '">' + c + '</button>').join("");
    const l = PERG.filter(p => (mcat === "Tudo" || p[0] === mcat) && (!b || (p[1] + " " + p[2].join(" ")).toLowerCase().includes(b)));
    box.innerHTML = l.length ? l.map(p => '<details class="c6-ac"><summary><b>' + p[1] + '</b><small>' + p[0] + '</small></summary><div class="c6-cp"><ol>' + p[2].map(s => '<li>' + s + '</li>').join("") + '</ol>' + (p[3] ? '<div><button class="bt c6-main" data-mir="' + p[3] + '">' + p[4] + ' ›</button></div>' : '') + '</div></details>').join("") : '<p class="mini">Não achei. Tente outra palavra, ou pergunte no robozinho.</p>';
  }
  document.addEventListener("input", e => { if (e.target && e.target.id === "maBusca") pintaManual(); });
  document.addEventListener("click", e => {
    const c = e.target.closest && e.target.closest("[data-mcat]"); if (c) { mcat = c.dataset.mcat; pintaManual(); return; }
    const m = e.target.closest && e.target.closest("[data-mir]"); if (m) { const t = m.dataset.mir; if (t[0] === "@") location.href = t === "@ofertas" ? "index.html?antigo=1&tab=ajustes&pag=ofertas" : "index.html?antigo=1&tab=crescer"; else irPara(t); }
  });

  // ---------- REGRAS E NÍVEIS ----------
  const SK = "daia-seg-tt";
  function pintaRegras(aba) {
    const box = $("rgBox"); if (!box) return;
    aba = aba || lerJ("daia-rg-aba", "tt");
    document.querySelectorAll("[data-rga]").forEach(b => b.setAttribute("aria-selected", String(b.dataset.rga === aba)));
    const seg = lerJ(SK, 0) || 0, nivel = seg >= 2000 ? 2 : seg >= 1000 ? 1 : seg ? 0 : 1;
    const ac = (tit, res, corpo, aberto) => '<details class="c6-ac"' + (aberto ? " open" : "") + '><summary><b>' + tit + '</b><small>' + res + '</small></summary><div class="c6-cp">' + corpo + '</div></details>';
    const pn = (sim, nao) => '<div class="c6-pode">' + sim.map(s => '<div class="s">' + s + '</div>').join("") + nao.map(s => '<div class="n">' + s + '</div>').join("") + '</div>';
    if (aba === "tt") box.innerHTML =
      '<div class="c6-gr c6-pad"><p style="margin:0"><b>Seus seguidores na @daledaia</b></p><div class="c6-add"><input id="rgSeg" inputmode="numeric" placeholder="Ex.: 1250" value="' + (seg || "") + '"><button class="bt" data-rgseg="1">Salvar</button></div>' +
        '<div class="c6-barra"><i style="width:' + Math.min(100, seg / 20) + '%"></i></div><p class="mini">' + (seg ? (seg >= 2000 ? "Acesso completo! Próxima meta: 10 mil." : "Faltam " + (2000 - seg).toLocaleString("pt-BR") + " para os 2 mil.") : "Coloque o número e a barra mostra quanto falta para os 2 mil.") + '</p></div>' +
      ac("Os níveis de acesso", "por seguidores", [["0", "Menos de 1.000", "Acesso limitado. Dá para ganhar com o Linkshare (link de afiliado de alguns produtos)."], ["1", "1.000 a 1.999: programa piloto", "Até <b>10 vídeos com sacolinha por dia</b>. Por isso o seu cronograma tem 10."], ["2", "2.000 ou mais: acesso completo", "Libera mais vídeos por dia e mais recursos. Próxima meta: 10 mil."]].map(n => '<div class="c6-nivel' + (+n[0] === nivel ? " aqui" : "") + '"><span class="n">' + n[0] + '</span><div><b>' + n[1] + '</b><br><span class="mini">' + n[2] + '</span></div></div>').join("") + '<p class="mini">Os números mudaram em 2026 e variam por conta. Confira em: TikTok Studio › TikTok Shop para criadores › Requisitos.</p>', true) +
      ac("Para continuar no programa", "requisitos", '<ul><li>Ter 18 anos ou mais.</li><li>Identidade confirmada (CPF e RG ou CNH).</li><li>Conta sem bloqueio e seguindo as Diretrizes da Comunidade.</li><li>Não ter tido a permissão de vendas tirada antes.</li></ul>') +
      ac("Saúde da conta e punições", "o que trava", '<ul><li>O TikTok dá uma <b>nota de saúde</b> para a criadora. Cada regra quebrada tira pontos.</li><li>A mesma falta <b>6 vezes em 90 dias</b> pode tirar a permissão de vender e congelar a comissão.</li><li><b>5 ou mais vídeos "parados"</b> em 7 dias (só foto ou slide, sem você mostrando) podem dar restrição.</li><li>Onde ver: TikTok Studio › TikTok Shop para criadores › Saúde da conta. Olhe uma vez por semana.</li></ul>') +
      ac("Pode e não pode", "no vídeo com sacolinha", pn(["Produto <b>igual</b> ao da sacolinha (cor, modelo, tamanho).", "Você mostrando, usando, com mão ou voz. Vídeo seu.", "Falar a verdade sobre o produto e a dor que ele resolve.", "Gancho forte nos 3 primeiros segundos, vídeo de 7 a 25 s."], ["Link de fora, citar Shopee, Mercado Livre ou outra loja.", "Preço no vídeo diferente da loja, ou desconto inventado.", "Promessa milagrosa, antes e depois falso, vídeo de outra pessoa.", "Comprar seguidores (reprova na verificação do TikTok Shop).", "Seguir dezenas de contas em poucos minutos.", "Apagar vídeo que foi mal (ele pode viralizar depois)."])) +
      ac("Comissão", "como funciona", '<ul><li>A comissão é <b>de cada produto</b>: não existe uma porcentagem única.</li><li>Se a loja usar o seu vídeo em anúncio, pode render comissão extra.</li></ul>') +
      ac("Sua estratégia", "só a @daledaia", '<ul><li>@daledaia é a conta do TikTok Shop: a única onde você posta agora.</li><li>Até 10 vídeos por dia, espalhados (veja os horários no Cronograma).</li><li>@daiana.lima95 (pessoal) parada desde 10/11. Os vídeos bons de lá voltam na @daledaia com gancho novo.</li><li>Filtre palavras nos comentários: Configurações › Privacidade › Comentários (golpe, falso, PV, link).</li></ul>');
    if (aba === "sh") box.innerHTML =
      ac("Os níveis da Shopee Vídeo", "atualiza toda terça", [["0", "Nível 0", "Todo mundo começa aqui · comissão base 1,5% · 30 produtos na live."], ["1", "Nível 1", "5+ dias ativos · 100+ pedidos · conteúdo aprovado · 70 produtos · comissão base sobe."], ["2", "Nível 2", "12+ dias ativos · 300+ pedidos · 20+ produtos com conteúdo · selo dourado e mais views."]].map(n => '<div class="c6-nivel"><span class="n">' + n[0] + '</span><div><b>' + n[1] + '</b><br><span class="mini">' + n[2] + '</span></div></div>').join("") + '<p class="mini">Dia ativo = postar pelo menos 1 vídeo com mais de 10 segundos (8 s não conta). 6 pontos de penalidade = volta para o nível 0. Com 15, pode ser bloqueada. Onde ver: Shopee › Eu › Live e vídeo › Central do Criador.</p>', true) +
      ac("Vídeos antigos", "não apagar", '<p>Decisão de 08/11: não apagar os vídeos antigos. Apagar chama a atenção do robô da Shopee. Se chegar aviso: veja o motivo em Central do Criador › Saúde do vídeo. Produto igual ao do link? Toque em Apelar (1 a 3 dias).</p>') +
      ac("Pode e não pode", "diretrizes", pn(["Vídeo seu, vertical 9:16, HD, em movimento.", "Produto IGUAL ao do link (marca, cor e modelo). Mostre todas as cores.", "Pack só com edição: corte, inverta, troque a música, marca d’água.", "Marque “Conteúdo gerado por IA” quando for de IA."], ["Citar TikTok, Instagram, Mercado Livre ou outras lojas.", "Marcas famosas e réplicas, ou nome de marca na legenda.", "Criança, animal, faca, arma, bebida, cigarro, política, duplo sentido.", "Promessa milagrosa e o mesmo vídeo repetido.", "Troca de engajamento com outras afiliadas."]));
    if (aba === "ig") box.innerHTML =
      ac("Pode e não pode", "crescer sem bloqueio", pn(["Fotos e vídeos seus ou de licença livre (Unsplash, Pexels). Nunca Pinterest.", "2 h entre posts. Picos 8h, 12h e 18h. Story a cada 12 h.", "Responder comentário mandando o link no direct."], ["Comprar seguidor, seguir e deixar de seguir em massa.", "Apps que automatizam curtidas.", "Música sem licença em conta comercial (use a biblioteca do Instagram).", "Publicidade sem avisar (em parceria, marque a parceria paga)."]), true) +
      ac("O que postar", "agregar, não vender", '<ul><li>No Instagram o foco é ajudar: dica, organização, antes e depois, "a casa te cobra / te poupa".</li><li>O link vai pela página de links e pelo direct, não no vídeo.</li><li>Instagram divulga a Shopee. TikTok divulga o TikTok Shop.</li></ul>');
  }
  document.addEventListener("click", e => {
    const a = e.target.closest && e.target.closest("[data-rga]"); if (a) { grava("daia-rg-aba", a.dataset.rga); pintaRegras(a.dataset.rga); return; }
    const s = e.target.closest && e.target.closest("[data-rgseg]"); if (s) { const n = parseInt(($("rgSeg").value || "").replace(/\D/g, "")) || 0; grava(SK, n); pintaRegras("tt"); aviso("Seguidores salvos"); }
  });

  // ---------- as 3 telas novas ----------
  const pers = $("t-pers"); if (!pers) return;
  const tela = (id, tit, sub, corpo) => '<section class="tela" id="t-' + id + '" hidden><button class="voltar" data-ir="inicio">‹ Voltar</button><h1>' + tit + '</h1><p class="sub">' + sub + '</p>' + corpo + '</section>';
  pers.insertAdjacentHTML("afterend",
    tela("crono", "Cronograma", "Um só cronograma. Mude aqui e o app inteiro segue.", '<div id="crBox"></div>') +
    tela("manual", "Como faço…?", "Procure o que quer fazer. Cada resposta tem poucos passos e um botão que leva até lá.", '<input class="c6-busca" id="maBusca" placeholder="Ex.: agendar, tema, ligar tablet" aria-label="Procurar no manual"><div class="c6-cats" id="maCats"></div><div id="maBox"></div>') +
    tela("regras", "Regras e níveis", "Para crescer sem travar a conta.", '<div class="c6-seg" role="tablist"><button role="tab" data-rga="tt">TikTok Shop</button><button role="tab" data-rga="sh">Shopee Vídeo</button><button role="tab" data-rga="ig">Instagram</button></div><div id="rgBox"></div>'));
  // desenha quando a tela abre
  ["crono", "manual", "regras"].forEach(id => { const s = $("t-" + id); new MutationObserver(() => { if (!s.hidden) { if (id === "crono") pintaCrono(); if (id === "manual") pintaManual(); if (id === "regras") pintaRegras(); } }).observe(s, { attributes: true, attributeFilter: ["hidden"] }); });

  // ---------- VOLTAR: volta para a tela de antes (e o botão voltar do celular também) ----------
  let pulando = false, atualT = null;
  function telaVisivel() { const s = [...document.querySelectorAll(".tela")].find(x => !x.hidden); return s ? s.id.slice(2) : null; }
  function vigia() {
    const t = telaVisivel(); if (!t || t === atualT) return;
    if (!pulando && atualT) { try { history.pushState({ t }, "", "#" + t); } catch (_) {} }
    else { try { history.replaceState({ t }, "", "#" + t); } catch (_) {} }
    atualT = t; pulando = false;
  }
  window.addEventListener("popstate", e => { const t = (e.state && e.state.t) || (location.hash.slice(1) || "inicio"); if (document.getElementById("t-" + t)) { pulando = true; irPara(t); } });
  document.addEventListener("click", e => {
    const v = e.target.closest && e.target.closest(".tela .voltar"); if (!v) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (history.state && history.state.t && history.length > 1 && atualT !== "inicio") history.back(); else irPara("inicio");
  }, true);
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".tela .voltar").forEach(b => { b.textContent = "‹ Voltar"; });
    new MutationObserver(vigia).observe(document.querySelector(".app") || document.body, { attributes: true, attributeFilter: ["hidden"], subtree: true });
    vigia(); ligaApp();
  });

  // ---------- estilo das telas novas ----------
  const st = document.createElement("style");
  st.textContent = `
.tela .voltar{color:var(--acc);font-weight:600}
.c6-h{font-size:12.5px!important;font-weight:600!important;color:var(--mute);letter-spacing:.05em;text-transform:uppercase;margin:18px 0 8px!important;font-family:inherit!important}
.c6-gr{background:var(--card);border:1px solid var(--line);border-radius:18px;overflow:hidden}.c6-pad{padding:12px 14px;display:grid;gap:8px}
.c6-dias{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.c6-dias button{padding:8px 0;border-radius:10px;border:1px solid var(--line);background:var(--card);font-size:12.5px;font-weight:600}
.c6-dias button[aria-pressed="true"]{background:var(--ink);color:var(--bg);border-color:var(--ink)}.c6-dias button.grav{box-shadow:inset 0 -3px 0 var(--acc)}
.c6-meta{display:grid;grid-template-columns:1fr auto;gap:2px 10px;align-items:center;padding:11px 14px;border-top:1px solid var(--line)}.c6-meta:first-child{border-top:0}
.c6-meta b{font-size:14.5px;font-weight:600}.c6-meta small{grid-column:1;color:var(--mute);font-size:12px}
.c6-step{display:flex;align-items:center;gap:6px;grid-row:span 2}.c6-step button{width:34px;height:34px;border-radius:50%;border:1px solid var(--line);background:var(--card);font-size:18px;line-height:1}
.c6-step output{min-width:28px;text-align:center;font-family:var(--fn);font-size:22px;font-weight:600;font-variant-numeric:tabular-nums}
.c6-tot{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;text-align:center;margin-top:10px}
.c6-tot div{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:8px 4px}.c6-tot b{display:block;font-family:var(--fn);font-size:20px}.c6-tot small{font-size:11px;color:var(--mute)}
.c6-lk{color:var(--acc);font-weight:600;font-size:12px;text-decoration:underline;padding:0}
.c6-hr{display:flex;gap:6px;flex-wrap:wrap}.c6-hr button{padding:6px 10px;border-radius:99px;background:var(--acc-soft);color:var(--acc);font-size:12.5px;font-weight:600}
.c6-add{display:flex;gap:6px}.c6-add input{flex:1;min-width:0;font:inherit;padding:9px 12px;border:1px solid var(--line);border-radius:12px;background:var(--bg);color:var(--ink)}
.c6-lem{display:flex;gap:8px;align-items:center;font-size:14px}.c6-lem span{flex:1}.c6-lem button{color:var(--mute)}
.c6-liga{font-size:13px}.c6-liga div::before{content:"↻ ";color:var(--ok);font-weight:700}
.c6-busca{width:100%;font:inherit;padding:11px 14px;border:1px solid var(--line);border-radius:14px;background:var(--card);color:var(--ink);margin-bottom:6px}
.c6-cats{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:4px}.c6-cats button{padding:6px 11px;border-radius:99px;border:1px solid var(--line);background:var(--card);font-size:12.5px}
.c6-cats button[aria-pressed="true"]{background:var(--ink);color:var(--bg);border-color:var(--ink)}
details.c6-ac{background:var(--card);border:1px solid var(--line);border-radius:18px;margin-top:8px;overflow:hidden}
details.c6-ac>summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:10px;padding:13px 14px}details.c6-ac>summary::-webkit-details-marker{display:none}
details.c6-ac>summary b{flex:1;font-size:15px;font-weight:600}details.c6-ac>summary small{color:var(--mute);font-size:12px}
details.c6-ac>summary::after{content:"›";color:var(--mute);font-size:18px;transition:transform .15s}details.c6-ac[open]>summary::after{transform:rotate(90deg)}
.c6-cp{padding:0 14px 14px;display:grid;gap:10px;font-size:14px}.c6-cp p{margin:0}.c6-cp ol,.c6-cp ul{margin:0;padding-left:20px;display:grid;gap:4px}
.c6-main{background:var(--ink)!important;color:var(--bg)!important;border-color:var(--ink)!important}
.c6-seg{display:grid;grid-template-columns:repeat(3,1fr);background:var(--line);border-radius:12px;padding:3px;gap:3px;margin-bottom:10px}
.c6-seg button{padding:8px 4px;border-radius:9px;font-size:13px;font-weight:600;color:var(--mute)}.c6-seg button[aria-selected="true"]{background:var(--card);color:var(--ink)}
.c6-barra{height:8px;border-radius:99px;background:var(--line);overflow:hidden}.c6-barra i{display:block;height:100%;background:var(--acc)}
.c6-nivel{display:grid;grid-template-columns:auto 1fr;gap:10px;padding:8px 0;border-top:1px solid var(--line)}.c6-nivel:first-child{border-top:0}
.c6-nivel .n{width:32px;height:32px;border-radius:10px;background:var(--acc-soft);color:var(--acc);display:grid;place-items:center;font-weight:700;font-size:13px}.c6-nivel.aqui .n{background:var(--acc);color:#fff}
.c6-pode{display:grid;gap:6px}.c6-pode div{display:flex;gap:8px}.c6-pode .s::before{content:"✓";color:var(--ok);font-weight:700}.c6-pode .n::before{content:"✕";color:var(--acc);font-weight:700}
@media (prefers-reduced-motion:reduce){details.c6-ac>summary::after{transition:none}}`;
  document.head.appendChild(st);
})();
