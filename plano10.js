// Daia Studio v49 — "Tenho um produto para hoje": ela escreve o produto, escolhe os formatos virais do curso
// e o app monta os vídeos do dia no TikTok Shop · 10 por dia (gancho, texto na tela, cenas, CTA e legenda com SEO).
// Sem produto escolhido, o cronograma continua exatamente como antes. Não gasta IA: tudo sai de modelos do curso.
(function(){
  // todos os formatos que o curso ensina (Formatos virais, Estrutura que vende, Chave da criatividade, Segredo da viralização, 60x60)
  const FMT = [
    {id: "pov", n: "POV", d: "um take só + frase na tela + som em alta. O mais fácil e um dos que mais viralizam.",
      g: ["POV: você achou {o} {p} que faltava na sua casa", "POV: você finalmente resolveu {dor}", "POV: sua casa depois {de} {p}"],
      tela: "POV: você achou {o} {p} que faltava na sua casa", cenas: ["Um take só {de} {p} sendo usado, bem de perto", "Som em alta, sem falar nada", "7 a 10 segundos"]},
    {id: "historia", n: "Contando uma história", d: "storytelling: conta o que aconteceu com você. É o que mais conecta e vende sem parecer venda.",
      g: ["Eu vivia com {dor} até achar isso aqui", "Ninguém me contou isso antes de eu mudar de casa…", "Deixa eu te contar o que mudou aqui em casa"],
      tela: "o que mudou aqui em casa 🤍", cenas: ["Você contando o problema (a dor), como se fosse pra uma amiga", "Mostra {o} {p} resolvendo, na vida real", "Termina com como ficou e a CTA"]},
    {id: "unboxing", n: "Unboxing / recebidos", d: "abrindo e primeira impressão. Comece já mostrando o produto, não só a caixa.",
      g: ["Chegou {o} {p} e eu não esperava isso", "Abri {o} {p} e olha o detalhe", "Recebidos: {p}, minha opinião sincera"],
      tela: "{p}: primeira impressão sincera", cenas: ["Já abre mostrando {o} {p} (nada de 3 segundos de caixa)", "Mostra 2 detalhes de perto", "Usa uma vez na hora e dá a sua opinião"]},
    {id: "antesdepois", n: "Antes e depois", d: "prova visual: a bagunça antes e o resultado depois. Ótimo para casa.",
      g: ["Antes e depois {de} {p}", "Isso aqui virou ISSO em 10 segundos", "Olha a diferença que {o} {p} fez"],
      tela: "antes ➜ depois com {o} {p}", cenas: ["Antes: o cantinho com o problema ({dor})", "Usando {o} {p} (corte rápido)", "Depois: o resultado bonito, câmera parada 2 segundos"]},
    {id: "maos", n: "Só as mãos mostrando", d: "sem aparecer: só as mãos usando o produto, bem de perto.",
      g: ["Olha como {o} {p} funciona", "Só eu que não sabia disso?", "Como eu vivi tanto tempo sem isso?"],
      tela: "{p} que facilita a rotina", cenas: ["Mãos pegando {o} {p}", "Mãos usando passo a passo", "Mostra o resultado e volta para a 1ª cena (loop)"]},
    {id: "motivos", n: "3 motivos", d: "3 motivos para ter o produto, um por cena. Fácil de prender até o fim.",
      g: ["3 motivos para ter {o} {p} em casa", "Motivo número 3 me convenceu", "Se você tem {dor}, veja isso"],
      tela: "3 motivos para ter {o} {p}", cenas: ["Motivo 1 (o mais visual)", "Motivo 2", "Motivo 3 (o melhor) + CTA"]},
    {id: "erro", n: "Erro comum", d: "\"para de fazer isso\": mostra o erro e o produto como solução.",
      g: ["Para de fazer isso na sua casa", "Você ainda faz assim? Eu fazia também", "O erro que deixa {dor}"],
      tela: "para de fazer isso ✋", cenas: ["Mostra o jeito errado (o problema)", "\"Faz assim\": {o} {p} resolvendo", "Resultado + CTA"]},
    {id: "comentario", n: "Respondendo comentário", d: "pega uma dúvida dos comentários e grava um vídeo respondendo. Gera conexão.",
      g: ["Respondendo: \"{p} é bom mesmo?\"", "Me perguntaram se {o} {p} vale a pena", "Respondendo quem pediu pra ver de perto"],
      tela: "respondendo a sua dúvida 💬", cenas: ["Usa \"Responder com vídeo\" no comentário", "Mostra exatamente o que a pessoa perguntou", "Termina perguntando: \"e você, já tem um?\""]},
    {id: "engaja", n: "Engajamento", d: "vídeo feito para gerar comentário (ex.: \"cabe literalmente tudo\"). Viraliza, mas vêm comentários de todo tipo.",
      g: ["Duvido você adivinhar pra que serve isso", "Cabe literalmente tudo aqui", "Você usaria isso? Me conta"],
      tela: "você usaria? 👀", cenas: ["Mostra {o} {p} sem explicar", "Revela pra que serve ou testa o limite", "Pergunta no final para as pessoas comentarem"]},
    {id: "asmr", n: "ASMR / detalhes", d: "sons e detalhes: abrir, encaixar, fechar. Prende e faz assistir de novo.",
      g: ["Só ouve o som disso 🤍", "O detalhe que ninguém mostra", "Satisfatório demais"],
      tela: "o som 🤍", cenas: ["Close nos detalhes {de} {p}", "Sons de abrir, encaixar, arrumar (sem música alta)", "Final igual ao começo (loop)"]},
    {id: "comparacao", n: "Comparação", d: "compara com algo caro ou com o jeito antigo (da aula Chave da criatividade).",
      g: ["Não tem dinheiro pra loja cara? Olha esse", "O caro x {o} {p}: qual você escolhe?", "Parece de loja de decoração, mas não é"],
      tela: "parece caro, mas não é 🤫", cenas: ["Mostra o \"jeito caro\" ou antigo", "Mostra {o} {p}", "Lado a lado + pergunta: qual você escolhe?"]},
    {id: "publico", n: "Para quem…", d: "o mesmo produto para um público diferente (aula Estrutura que vende: teste os públicos).",
      g: ["Se você mora em casa pequena, precisa disso", "Pra quem ama casa organizada", "Pra você que vive com {dor}"],
      tela: "pra quem tem {dor}", cenas: ["Fala direto com um tipo de pessoa (casa pequena, mãe, quem trabalha fora…)", "Mostra como {o} {p} ajuda essa pessoa", "CTA"]},
    {id: "ambiente", n: "No ambiente", d: "o produto no lugar onde ele é usado de verdade, com luz bonita.",
      g: ["O cantinho que eu mais amo da casa", "Olha como ficou aqui", "Detalhe que muda tudo"],
      tela: "{p} no cantinho certo 🤍", cenas: ["{o} {p} no lugar onde é usado", "Luz natural, câmera devagar", "8 segundos, som em alta"]},
    {id: "narrado", n: "Narrado (com a sua voz)", d: "vende mais (aula SEO): narra falando o nome do produto + legenda na tela.",
      g: ["Esse é {o} {p} que eu mais uso aqui em casa", "Deixa eu te mostrar {o} {p} que resolveu {dor}", "Se eu pudesse indicar uma coisa só, seria isso"],
      tela: "{p} que eu uso de verdade", cenas: ["Narra falando o nome {de} {p} (o TikTok lê o que você fala)", "Mostra enquanto fala, com legenda na tela", "CTA natural no fim"]}
  ];
  const CTAS = ["Clica no carrinho e vê se o valor tá com promoção pra você", "Confere no carrinho se ainda tem", "Salva pra não perder", "Me conta: você também passa por isso?", "Dá uma olhada no carrinho, hoje tá valendo a pena", "Corre no carrinho laranja e vê o valor pra você"];
  const PERG = ["Você também precisava de um?", "Você já tem um?", "Qual cantinho da sua casa precisa disso?", "Me conta: usaria?"];

  // "o"/"a" do produto, para as frases ficarem certas
  const art = p => { const w = String(p).trim().toLowerCase().split(/\s+/)[0] || ""; return /(a|ão|ade|agem|ura)$/.test(w) && !/(ma|pa)$/.test(w) ? "a" : "o"; };
  const tg = s => "#" + String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
  function preenche(t, p, dor){ const o = art(p); return t.replace(/\{o\}/g, o).replace(/\{de\}/g, o === "a" ? "da" : "do").replace(/\{p\}/g, p).replace(/\{dor\}/g, dor); }
  function montar(p, dor, ids){
    const fs = ids.map(id => FMT.find(f => f.id === id)).filter(Boolean); if (!fs.length) return [];
    const P = p.charAt(0).toUpperCase() + p.slice(1);
    const tags = [tg(p.replace(/\s+/g, "")), tg(p.split(/\s+/)[0] + "casa"), "#casaorganizada", "#achadosdecasa", "#tiktokshop"].filter((t, i, a) => t.length > 2 && a.indexOf(t) === i).slice(0, 5);
    return Array.from({length: 9}, (_, i) => {
      const f = fs[i % fs.length], volta = Math.floor(i / fs.length);
      const g = preenche(f.g[volta % f.g.length], p, dor);
      return {f: f.n, g, tela: preenche(f.tela, p, dor), cenas: f.cenas.map(c => preenche(c, p, dor)), cta: CTAS[i % CTAS.length],
        leg: P + " que resolve " + dor + " 🤍 " + PERG[i % PERG.length] + "\n\n" + tags.join(" ")};
    });
  }

  // os horários do dia: com produto escolhido, 9 vídeos dele + o Garotas Apoiam Garotas das 17h
  const ttsSlotsAntes = ttsSlots;
  ttsSlots = function(k){
    const base = ttsSlotsAntes(k), pl = (state.p10 || {})[k];
    if (!base.length || !pl || !pl.v || !pl.v.length) return base;
    let j = 0;
    return base.map((s, i) => {
      if (i === 6) return s;
      const v = pl.v[j++ % pl.v.length];
      return {h: s.h, tipo: "produto", t: pl.p + " · " + v.f, g: v.g, leg: v.leg, det: v};
    });
  };

  function painel(k){
    const pl = (state.p10 || {})[k], rasc = state.p10r || {};
    if (pl && pl.v && pl.v.length) return '<article class="card"><div class="meta"><span class="tag serie">🎯 Produto do dia</span><button class="btn mini" data-p10mudar="1" style="margin-left:auto">Trocar</button></div>' +
      '<h3 class="title">' + esc(pl.p) + '</h3><p class="how">' + pl.v.length + ' vídeos montados nos formatos: <b>' + esc([...new Set(pl.v.map(v => v.f))].join(", ")) + '</b>. Toque em “Ver roteiro” em cada horário.</p>' +
      '<div class="actions"><button class="btn" data-p10claude="1">🤖 Mais detalhado no Claude</button><button class="btn" data-p10limpa="1">Voltar ao normal</button></div></article>';
    const sel = rasc.f || [];
    return '<article class="card"><div class="meta"><span class="tag serie">🎯 Tenho um produto para hoje</span></div>' +
      '<div class="field"><input class="input" id="p10p" placeholder="Qual produto? Ex.: organizador de gaveta" value="' + esc(rasc.p || "") + '"></div>' +
      '<div class="field"><input class="input" id="p10d" placeholder="Que problema ele resolve? Ex.: gaveta bagunçada (opcional)" value="' + esc(rasc.d || "") + '"></div>' +
      (rasc.aberto ? '<p class="how"><b>Escolha os formatos</b> (todos do curso). Marque quantos quiser: o app reveza entre eles.</p>' +
        '<div class="p10-fmts">' + FMT.map(f => '<label class="ck p10-f"><input type="checkbox" data-p10f="' + f.id + '"' + (sel.indexOf(f.id) >= 0 ? " checked" : "") + '><span><b>' + esc(f.n) + '</b><small>' + esc(f.d) + '</small></span></label>').join("") + '</div>' +
        '<div class="actions"><button class="btn mini" data-p10todos="1">Marcar todos</button><button class="btn wine" data-p10montar="1">✨ Montar os vídeos de hoje</button></div>'
        : '<div class="actions"><button class="btn wine" data-p10ver="1">Ver os formatos</button></div>') +
      '<p class="why">O curso manda testar o mesmo produto em vários formatos e repetir o que entregar mais.</p></article>';
  }
  const detHtml = v => '<details class="cr-bloco"><summary class="cr-tit"><b>🎬 Ver roteiro</b></summary>' +
    '<div class="say"><small>Texto na tela</small>' + esc(v.tela) + '</div><ol class="script">' + v.cenas.map(c => '<li>' + esc(c) + '</li>').join("") + '</ol>' +
    '<div class="say"><small>Chamada no final</small>' + esc(v.cta) + '</div></details>';

  // a seção dos 10 por dia, igual a antes + o painel do produto e o roteiro de cada vídeo
  ttsSecao = function(){
    const k = cur, ss = ttsSlots(k); if (!ss.length) return "";
    const feito = (state.ttsFeito || {})[k] || {}, n = Object.keys(feito).length;
    const temPlano = !!((state.p10 || {})[k] || {}).v;
    const semProd = !temPlano && ss.some(s => s.sem);
    const corpo = painel(k) + '<article class="card"><p class="how"><b>@daledaia · 10 vídeos hoje.</b> ' + (temPlano ? '9 do seu produto + o Garotas Apoiam Garotas às 17h.' : '3 reciclados da @daiana.lima95 (com gancho novo), 5 de produto e 2 novos.') + ' Solte no horário, um de cada vez.</p>' +
      (temPlano ? '' : '<p class="meta-falta">🔁 Os 5 de produto alternam entre os seus produtos (não 10 do mesmo). Na semana, cada produto ganha uns 6 a 10 vídeos. O que vender, grave mais 10.</p>') +
      (semProd ? '<p class="meta-falta">🛍️ Coloque os seus produtos em ⚙️ Ajustes › TikTok Shop › Meus produtos, ou use “Tenho um produto para hoje” acima.</p>' : '') +
      '<details class="cr-bloco"><summary class="cr-tit"><b>⚠️ Antes de reciclar (leia 1 vez)</b></summary><ul class="script">' +
        '<li>O TikTok pune vídeo <b>igual</b> em 2 contas. Na @daiana.lima95, se tiver TikTok Shop: Central do criador › Integridade da conta › <b>Ferramenta de autorização de conteúdo</b> › autorize a @daledaia (até 5 contas). Sem isso, <b>edite</b> cada vídeo: gancho novo nos 3 primeiros segundos, outra música, corte diferente.</li>' +
        '<li>Nada de preço no vídeo nem na legenda.</li><li>Produto no carrinho só se for <b>igual</b> ao do vídeo. Sem produto igual? Poste sem link: ajuda a crescer.</li>' +
        '<li>Esqueceu o produto? Central do criador › Vídeos › Vincular produto (não precisa apagar).</li><li>Música em alta: primeiro adicione o produto, depois troque o som.</li>' +
        '<li>Nunca apague vídeo que foi mal. Vídeos do Garotas Apoiam Garotas: pode deixar privado (Configurações › Gerenciar publicações).</li></ul></details></article>' +
      ss.map((s, i) => {
        const ok = !!feito[i], c = TTS_COR[s.tipo];
        COPY.push(s.leg || ""); const ci = COPY.length - 1;
        return '<article class="card tts-slot' + (ok ? ' done' : '') + '"><div class="meta"><span>' + esc(s.h) + '</span><span class="tag ' + c[0] + '">' + c[1] + '</span></div>' +
          '<h3 class="title">' + esc(s.t) + '</h3>' + (s.g ? '<div class="say"><small>Gancho</small>' + esc(s.g) + '</div>' : '') + (s.det ? detHtml(s.det) : '') +
          '<div class="actions"><button class="btn main" data-ttsok="' + i + '">' + (ok ? 'Postado ✓' : 'Marcar como postado') + '</button>' + (s.leg ? '<button class="btn" data-copy="' + ci + '">Copiar legenda</button>' : '') + '</div></article>';
      }).join("");
    return secao("tts", "🛍️", "TikTok Shop · 10 por dia", "@daledaia · " + (k === todayKey ? "hoje" : fmtDay(k, {weekday: "long"})), n + "/10", n >= 10, corpo);
  };

  const guardaRasc = () => { const r = state.p10r = state.p10r || {}; const p = $("p10p"), d = $("p10d"); if (p) r.p = p.value; if (d) r.d = d.value; };
  const redesenha = () => { renderHoje(); setTimeout(() => { const s = document.querySelector('#cards details[data-sec="tts"], #cards details.secao'); const alvo = $("p10p") || document.querySelector(".p10-fmts"); if (alvo) alvo.scrollIntoView({block: "center"}); }, 60); };
  document.addEventListener("click", e => {
    if (!e.target.closest("#cards")) return;
    const q = s => e.target.closest(s);
    if (q("[data-p10ver]")) { guardaRasc(); if (!(state.p10r.p || "").trim()) { toast("Escreva o produto primeiro."); return; } state.p10r.aberto = 1; save(); redesenha(); return; }
    if (q("[data-p10todos]")) { guardaRasc(); state.p10r.f = FMT.map(f => f.id); save(); redesenha(); return; }
    if (q("[data-p10montar]")) {
      guardaRasc(); const r = state.p10r, p = (r.p || "").trim(), f = r.f || [];
      if (!p) { toast("Escreva o produto primeiro."); return; }
      if (!f.length) { toast("Marque pelo menos 1 formato."); return; }
      state.p10 = state.p10 || {}; state.p10[cur] = {p, d: (r.d || "").trim(), f, v: montar(p, (r.d || "").trim() || "a bagunça do dia a dia", f)};
      state.p10r = {}; save(); renderHoje(); toast("Pronto! Os vídeos de hoje são do " + p + "."); return;
    }
    if (q("[data-p10mudar]")) { const pl = state.p10[cur]; state.p10r = {p: pl.p, d: pl.d, f: pl.f, aberto: 1}; delete state.p10[cur]; save(); redesenha(); return; }
    if (q("[data-p10limpa]")) { delete state.p10[cur]; save(); renderHoje(); return; }
    if (q("[data-p10claude]")) {
      const pl = state.p10[cur];
      const txt = "Sou a Daia (@daledaia), afiliada de casa e decoração no TikTok Shop. Estilo minimalista e aconchegante, tom de amiga, NUNCA cite preço. Regras do curso: gancho nos 3 primeiros segundos, dor → produto como solução, CTA sem cara de venda, 7 a 25 s, falar e escrever o nome do produto (SEO), até 5 hashtags do produto, final que emenda no começo.\n\n" +
        "Produto de hoje: " + pl.p + (pl.d ? " (resolve: " + pl.d + ")" : "") + ". Crie 9 roteiros de vídeo, um por formato, revezando estes formatos: " + [...new Set(pl.v.map(v => v.f))].join(", ") + ". Para cada vídeo: gancho falado, texto na tela, cenas com segundos, CTA e legenda com até 5 hashtags.";
      try { navigator.clipboard.writeText(txt); } catch(_) {}
      abrirLink("https://claude.ai/new?q=" + encodeURIComponent(txt)); return;
    }
  });
  document.addEventListener("change", e => {
    const c = e.target.closest("[data-p10f]"); if (!c) return;
    guardaRasc(); const r = state.p10r; r.f = r.f || [];
    if (c.checked) { if (r.f.indexOf(c.dataset.p10f) < 0) r.f.push(c.dataset.p10f); } else r.f = r.f.filter(x => x !== c.dataset.p10f);
    save();
  });
  document.addEventListener("input", e => { if (e.target.id === "p10p" || e.target.id === "p10d") { guardaRasc(); save(); } });

  const css = document.createElement("style");
  css.textContent = ".p10-fmts{display:grid;gap:2px;margin:6px 0}.p10-f span{display:grid;gap:1px}.p10-f small{font-size:13px;color:var(--muted);font-weight:400;line-height:1.3}";
  document.head.appendChild(css);
  try { if (!$("tab-hoje").hidden) renderHoje(); } catch(_) {}
})();
