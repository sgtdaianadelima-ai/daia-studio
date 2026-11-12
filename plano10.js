// Daia Studio v53 — Ideias de vídeo para um produto (dentro de TikTok Shop · 10 por dia).
// Ela escreve só o produto; o robô (Gemini grátis) sugere as dores; ela marca dores e formatos do curso e o app gera IDEIAS.
// As ideias NÃO mudam o cronograma: ficam guardadas, tudo editável (título, texto na tela, desenvolvimento, CTA, legenda),
// cada parte com 🔄 trocar; o título pode ir para o Bloco (🪝 Títulos guardados). Só vai para um horário se ela escolher.
(function(){
  // {p} produto · {o} o/a · {de} do/da · {dor} dor curta (ex.: gaveta bagunçada) · {fala} a dor do jeito que a cliente fala
  const FMT = [
    {id: "pov", n: "POV", d: "um take só + frase na tela + som em alta. O mais fácil e um dos que mais viralizam.",
      g: ["POV: você cansou de {dor} e achou {o} {p}", "POV: {dor} nunca mais", "POV: você descobriu {o} {p} que acaba com {dor}", "POV: você achou {o} {p} {mais} do TikTok", "POV: chega de {dor} 🤍"],
      tela: "POV: {dor} nunca mais", cenas: ["Um take só {de} {p} resolvendo {dor}, bem de perto", "O resultado com som em alta, sem falar nada", "Volta para o mesmo ângulo do começo (loop)"]},
    {id: "historia", n: "Contando uma história", d: "storytelling: conta o que aconteceu com você. É o que mais conecta e vende sem parecer venda.",
      g: ["Eu vivia com {dor} até achar isso aqui", "\"{fala}\" — eu dizia isso todo dia", "Ninguém me avisou que {dor} tinha solução tão simples", "Deixa eu te contar como eu resolvi {dor}"],
      tela: "como eu resolvi {dor} 🤍", cenas: ["Você contando a dor ({dor}), como se fosse pra uma amiga", "Mostra {o} {p} resolvendo, na vida real", "Termina com como ficou e a CTA"]},
    {id: "unboxing", n: "Unboxing / recebidos", d: "abrindo e primeira impressão. Comece já mostrando o produto, não só a caixa.",
      g: ["Chegou o que vai acabar com {dor}", "Comprei {o} {p} por causa de {dor}: valeu?", "Recebidos: {p}, será que resolve {dor}?", "Abri {o} {p} e olha esse detalhe"],
      tela: "{p}: resolve {dor}?", cenas: ["Já abre mostrando {o} {p} (nada de 3 segundos de caixa)", "Mostra 2 detalhes de perto", "Usa na hora e mostra se resolveu {dor}"]},
    {id: "antesdepois", n: "Antes e depois", d: "prova visual: a dor antes e o resultado depois. Ótimo para casa.",
      g: ["Antes: {dor}. Depois: olha isso", "{dor}? Olha o depois {de} {p}", "Isso aqui virou ISSO em 10 segundos", "A diferença que {o} {p} fez em {dor}"],
      tela: "antes ➜ depois", cenas: ["Antes: o cantinho com {dor}", "Usando {o} {p} (corte rápido)", "Depois: o resultado bonito, câmera parada 2 segundos"]},
    {id: "maos", n: "Só as mãos mostrando", d: "sem aparecer: só as mãos usando o produto, bem de perto.",
      g: ["Como eu vivi tanto tempo com {dor}?", "Só eu que não sabia que {dor} se resolvia assim?", "Olha como {o} {p} acaba com {dor}", "O jeito mais fácil de acabar com {dor}"],
      tela: "{p} contra {dor}", cenas: ["Mãos pegando {o} {p}", "Mãos usando passo a passo", "Mostra o resultado e volta para a 1ª cena (loop)"]},
    {id: "motivos", n: "3 motivos", d: "3 motivos para ter o produto, um por cena. Fácil de prender até o fim.",
      g: ["3 motivos para acabar com {dor} hoje", "Se você sofre com {dor}, veja o motivo 3", "3 motivos para ter {o} {p} em casa", "O motivo 3 resolve {dor} de vez"],
      tela: "3 motivos contra {dor}", cenas: ["Motivo 1 (o mais visual)", "Motivo 2", "Motivo 3 (o que mais resolve {dor}) + CTA"]},
    {id: "erro", n: "Erro comum", d: "\"para de fazer isso\": mostra o erro e o produto como solução.",
      g: ["Para de aceitar {dor}", "O erro que deixa {dor} na sua casa", "Você ainda vive com {dor}? Eu também vivia", "Para de fazer isso: é por isso que {dor} não acaba"],
      tela: "para de aceitar {dor} ✋", cenas: ["Mostra o jeito errado ({dor})", "\"Faz assim\": {o} {p} resolvendo", "Resultado + CTA"]},
    {id: "comentario", n: "Respondendo comentário", d: "pega uma dúvida dos comentários e grava um vídeo respondendo. Gera conexão.",
      g: ["Respondendo: \"{p} resolve {dor} mesmo?\"", "Me perguntaram se {o} {p} acaba com {dor}", "Respondendo quem disse: \"{fala}\""],
      tela: "respondendo a sua dúvida 💬", cenas: ["Usa \"Responder com vídeo\" no comentário", "Mostra exatamente o que a pessoa perguntou", "Termina perguntando: \"e você, já tem um?\""]},
    {id: "engaja", n: "Engajamento", d: "vídeo feito para gerar comentário. Viraliza, mas vêm comentários de todo tipo.",
      g: ["Quem aí também sofre com {dor}? 🙋‍♀️", "Duvido você adivinhar como isso resolve {dor}", "Você usaria isso pra acabar com {dor}?", "Cabe literalmente tudo aqui"],
      tela: "você também sofre com {dor}? 👀", cenas: ["Mostra {o} {p} sem explicar", "Revela como resolve {dor}", "Pergunta no final para as pessoas comentarem"]},
    {id: "asmr", n: "ASMR / detalhes", d: "sons e detalhes: abrir, encaixar, fechar. Prende e faz assistir de novo.",
      g: ["O som de quem venceu {dor} 🤍", "Satisfatório: adeus, {dor}", "O detalhe que acaba com {dor}"],
      tela: "o som 🤍", cenas: ["Close nos detalhes {de} {p}", "Sons de abrir, encaixar, arrumar (sem música alta)", "Final igual ao começo (loop)"]},
    {id: "comparacao", n: "Comparação", d: "compara com algo caro ou com o jeito antigo (aula Chave da criatividade).",
      g: ["Jeito antigo x {p}: qual resolve {dor}?", "Gastei com o caro e {dor} continuou. Aí achei esse", "Parece de loja de decoração, mas não é"],
      tela: "o jeito antigo x {o} {p}", cenas: ["Mostra o jeito antigo (com {dor})", "Mostra {o} {p}", "Lado a lado + pergunta: qual você escolhe?"]},
    {id: "publico", n: "Para quem…", d: "o mesmo produto para um público diferente (aula Estrutura que vende: teste os públicos).",
      g: ["Se você mora em casa pequena e sofre com {dor}, olha isso", "Pra você que vive com {dor}", "Mãe que trabalha fora e não aguenta mais {dor}", "Pra quem ama casa bonita mas sofre com {dor}"],
      tela: "pra quem sofre com {dor}", cenas: ["Fala direto com um tipo de pessoa (casa pequena, mãe, quem trabalha fora…)", "Mostra como {o} {p} resolve {dor} pra ela", "CTA"]},
    {id: "ambiente", n: "No ambiente", d: "o produto no lugar onde ele é usado de verdade, com luz bonita.",
      g: ["O cantinho que era só {dor}", "Olha como ficou depois que acabei com {dor}", "Esse cantinho me salvou de {dor}"],
      tela: "chega de {dor} 🤍", cenas: ["{o} {p} no lugar onde é usado", "Luz natural, câmera devagar", "Termina com o produto no lugar, som em alta"]},
    {id: "narrado", n: "Narrado (com a sua voz)", d: "vende mais (aula SEO): narra falando o nome do produto + legenda na tela.",
      g: ["\"{fala}\"? Então você precisa conhecer {o} {p}", "Esse é {o} {p} que acabou com {dor} aqui em casa", "Se eu pudesse indicar uma coisa contra {dor}, seria isso"],
      tela: "{p} contra {dor}", cenas: ["Narra falando o nome {de} {p} (o TikTok lê o que você fala)", "Mostra enquanto fala, com legenda na tela", "CTA natural no fim"]}
  ];
  // como fazer o final emendar no começo (loop), por formato — aula Segredo da viralização
  const LOOP = {
    pov: "Termine com a câmera no mesmo lugar e ângulo da 1ª cena: quando recomeça, parece continuação.",
    historia: "Comece com a frase do meio (\"…e foi aí que eu achei isso\") e termine com o começo da história, que volta pra ela.",
    unboxing: "Termine fechando a caixa do mesmo jeito que ela aparece no início.",
    antesdepois: "Termine voltando para o \"antes\" num corte rápido: a pessoa revê a transformação sem perceber.",
    maos: "Termine com as mãos colocando o produto no mesmo lugar de onde pegaram na 1ª cena.",
    motivos: "Termine com \"e o motivo 1 é…\" cortado no meio: o vídeo recomeça no motivo 1.",
    erro: "Termine mostrando de novo o erro, com a mesma frase do início.",
    comentario: "Termine lendo a pergunta da pessoa, que é como o vídeo começa.",
    engaja: "Termine antes de revelar tudo e volte para a 1ª cena: a pessoa assiste de novo pra entender.",
    asmr: "Último som igual ao primeiro (abrir/fechar): o loop fica perfeito.",
    comparacao: "Termine com os dois lado a lado, igual à 1ª cena.",
    publico: "Termine com a mesma frase do começo (\"se você…\").",
    ambiente: "Câmera que termina onde começou (vai e volta devagar).",
    narrado: "Última frase da narração se completa com a primeira (\"…e é por isso que esse é o…\")."
  };
  const SEGREDOS = ["Gancho nos 3 primeiros segundos: nunca comece parada e calada", "Escreva o nome do produto no texto da tela e fale o nome (SEO)", "Legenda na tela: muita gente assiste sem som", "De 7 a 25 segundos", "Peça a ação de forma natural (salva / me conta)", "Responda os comentários com outra pergunta", "Poste todo dia: constância pesa mais que viralizar"];
  const CTAS = ["Clica no carrinho e vê se o valor tá com promoção pra você", "Confere no carrinho se ainda tem", "Salva pra não perder", "Me conta: você também passa por isso?", "Dá uma olhada no carrinho, hoje tá valendo a pena", "Corre no carrinho laranja e vê o valor pra você"];
  const PERG = ["Você também sofre com isso?", "Você já tem um?", "Qual cantinho da sua casa precisa disso?", "Me conta: usaria?"];

  // dores de reserva, se o robô não responder (por palavra do produto)
  const RESERVA = [
    [/gaveta|organiz|caixa|cesto|nicho|prateleira|porta.?(joia|tempero|treco)|divisor/, [["bagunça que volta todo dia", "minha casa nunca fica arrumada"], ["falta de espaço", "não cabe mais nada aqui"], ["perder tempo procurando as coisas", "eu nunca acho nada"]]],
    [/cozinha|tempero|pote|panela|talher|escorredor|pia|lou[cç]a/, [["cozinha sempre bagunçada", "minha cozinha vive uma bagunça"], ["pia cheia de louça", "a pia nunca esvazia"], ["falta de espaço no armário", "não cabe mais nada no armário"]]],
    [/banheiro|toalha|box|pia|shampoo|escova/, [["banheiro sem graça", "meu banheiro parece sem vida"], ["bancada entulhada", "a bancada vive cheia de coisa"], ["toalha que não seca", "a toalha fica com cheiro"]]],
    [/cheiro|difusor|vela|aromatiz|essencia|perfum/, [["casa sem cheirinho", "minha casa não tem cheiro de casa limpa"], ["cheiro ruim que volta", "o cheiro ruim sempre volta"], ["visita chegando de surpresa", "e se chegar visita agora?"]]],
    [/natal|árvore|arvore|pisca|enfeite|presépio|guirlanda|vila/, [["casa sem clima de Natal", "minha casa não parece Natal"], ["decoração que parece barata", "minha decoração fica com cara de barata"], ["Natal sempre igual", "todo ano a mesma decoração"]]],
    [/luz|lumin|abajur|led|lâmpada|lampada/, [["cantinho escuro", "esse canto é muito escuro"], ["casa sem aconchego", "minha casa não é aconchegante"], ["luz branca de hospital", "essa luz deixa tudo frio"]]],
    [/tapete|almofada|manta|cortina|quadro|vaso|decor/, [["casa sem personalidade", "minha casa não tem a minha cara"], ["sala sem graça", "minha sala parece vazia"], ["decorar sem gastar muito", "queria uma casa linda gastando pouco"]]],
    [/limp|mop|vassoura|rodo|pano|esponja|sabão|lava/, [["faxina que nunca acaba", "eu limpo e logo suja de novo"], ["sujeira difícil de tirar", "essa sujeira não sai"], ["cansaço de limpar a casa", "faxina me deixa exausta"]]]
  ];
  const GERAL = [["casa sem graça", "minha casa não tem a minha cara"], ["bagunça do dia a dia", "minha casa nunca fica arrumada"], ["falta de tempo", "não tenho tempo pra nada"], ["gastar e não gostar", "compro coisa que não resolve"]];
  function reserva(p){ const t = String(p).toLowerCase(); const ach = RESERVA.find(r => r[0].test(t)); return (ach ? ach[1] : []).concat(GERAL).slice(0, 7).map(x => ({d: x[0], f: x[1]})); }

  const art = p => { const w = String(p).trim().toLowerCase().split(/\s+/)[0] || ""; return /(a|ão|ade|agem|ura)$/.test(w) && !/(ma|pa)$/.test(w) ? "a" : "o"; };
  const tg = s => "#" + String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
  function preenche(t, p, dor){ const o = art(p); return t.replace(/\{o\}/g, o).replace(/\{de\}/g, o === "a" ? "da" : "do").replace(/\{mais\}/g, o === "a" ? "mais linda" : "mais lindo").replace(/\{p\}/g, p).replace(/\{dor\}/g, dor.d).replace(/\{fala\}/g, dor.f); }
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  // todas as opções de gancho de um formato para as dores escolhidas (a da vez primeiro)
  function pool(f, p, dores, k){ const ord = dores.slice(k % dores.length).concat(dores.slice(0, k % dores.length)); const out = []; ord.forEach(d => f.g.forEach(t => { const s = cap(preenche(t, p, d)); if (out.indexOf(s) < 0) out.push(s); })); return out; }

  // ---------- opções de cada parte do vídeo (todas pela dor) ----------
  const TELA = ["chega de {dor} 🤍", "{p} que resolve {dor}", "você também sofre com {dor}?", "o segredo contra {dor}", "{dor}? resolvido ✨"];
  const DEV = [
    null, // 1ª opção = as cenas do formato
    ["Mostra {dor} de perto, sem falar nada", "{o} {p} entrando em cena e resolvendo, passo a passo", "O resultado bonito + 1 detalhe que pouca gente repara"],
    ["Conta rapidinho quando {dor} te incomoda (1 frase)", "Mostra 2 diferenciais {de} {p} (fala o nome: SEO)", "Mostra como ficou e a sua reação"],
    ["Mostra {o} {p} parado, bem bonito no lugar dele", "Você usando no dia a dia, sem pressa", "Volta para a 1ª cena (loop)"]
  ];
  const CTA2 = ["Salva pra lembrar quando {dor} aparecer", "Me conta: {dor} também acontece aí?"];
  const LEG = ["{P}: chega de {dor} 🤍 {perg}", "{P} que resolve {dor} de vez. {perg}", "Se você sofre com {dor}, {o} {p} é pra você 🤍 {perg}", "Eu não aguentava mais {dor}… até achar {o} {p}. {perg}"];
  const TEMPOS = ["3–7 s", "7–14 s", "14–20 s", "20–25 s"];

  const novoId = () => "v" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  function tags(p){ return [tg(p.replace(/\s+/g, "")), tg(p.split(/\s+/)[0] + "casa"), "#casaorganizada", "#achadosdecasa", "#tiktokshop"].filter((t, i, a) => t.length > 2 && a.indexOf(t) === i).slice(0, 5).join(" "); }
  const parte = (op, i) => ({o: op, i: i % op.length, t: op[i % op.length]});
  function ideia(p, f, d, todas, n){
    const fill = s => cap(preenche(s, p, d));
    const devOp = DEV.map(v => (v || f.cenas).map((c, j) => TEMPOS[j] + ": " + preenche(c, p, d)).join("\n"));
    const legOp = LEG.map((l, j) => fill(l.replace(/\{P\}/g, "{p}").replace(/\{perg\}/g, PERG[(n + j) % PERG.length])) + "\n\n" + tags(p));
    return {id: novoId(), p, f: f.n, fid: f.id, dor: d, data: todayKey, loop: LOOP[f.id] || "",
      g: parte(pool(f, p, [d].concat(todas.filter(x => x.d !== d.d)), 0), 0),
      tela: parte([fill(f.tela)].concat(TELA.map(fill)).filter((s, i, a) => a.indexOf(s) === i), 0),
      dev: parte(devOp, 0),
      cta: parte(CTAS.concat(CTA2.map(fill)), n),
      leg: parte(legOp, n)};
  }
  const IDS = () => (state.p10i = state.p10i || []);
  const achar = id => IDS().find(x => x.id === id);
  const atrib = k => ((state.p10s = state.p10s || {})[k] = state.p10s[k] || {});

  // ---------- cronograma: só muda o horário em que ELA escolheu colocar uma ideia ----------
  const ttsSlotsAntes = ttsSlots;
  ttsSlots = function(k){
    const base = ttsSlotsAntes(k), a = (state.p10s || {})[k] || {};
    return base.map((s, i) => { const v = a[i] && achar(a[i]); return v ? {h: s.h, tipo: "produto", t: v.p + " · " + v.f, g: v.g.t, leg: v.leg.t, ideia: v.id} : s; });
  };

  async function robo(corpo, ms){
    const ctl = new AbortController(), lim = setTimeout(() => ctl.abort(), ms || 60000);
    try { const j = await (await fetch(ROBO, {method: "POST", headers: {"Content-Type": "text/plain;charset=utf-8"}, body: JSON.stringify(corpo), signal: ctl.signal})).json(); return j && j.r ? j.r : null; }
    catch(_) { return null; } finally { clearTimeout(lim); }
  }

  // ---------- painel: produto → dores → formatos → gerar ideias ----------
  function painel(){
    const r = state.p10r || {};
    let h = '<article class="card"><div class="meta"><span class="tag serie">🎯 Ideias de vídeo para um produto</span></div>' +
      '<p class="how">Gera opções para você escolher. <b>Não muda o cronograma</b>: só vai para um horário se você mandar.</p>' +
      '<div class="field"><input class="input" id="p10p" placeholder="Qual produto? Ex.: vila natalina, organizador de gaveta" value="' + esc(r.p || "") + '"></div>';
    if (r.busy) h += '<p class="how">⏳ Descobrindo as dores que esse produto resolve… (até 1 minuto)</p>';
    else if (!r.dores) h += '<div class="actions"><button class="btn wine" data-p10ver="1">Ver as dores e os formatos</button></div>';
    else {
      const ds = r.dSel || [], fs = r.f || [];
      h += '<p class="how"><b>1. Que dor esse produto resolve?</b> Marque 1 ou mais.' + (r.reserva ? ' <small>(sugestões de reserva: o robô não respondeu agora)</small>' : '') + '</p>' +
        '<div class="p10-fmts">' + r.dores.map((d, i) => '<label class="ck p10-f"><input type="checkbox" data-p10d="' + i + '"' + (ds.indexOf(i) >= 0 ? " checked" : "") + '><span><b>' + esc(d.d) + '</b><small>“' + esc(d.f) + '”</small></span></label>').join("") + '</div>' +
        '<div class="actions"><button class="btn mini" data-p10maisdores="1">🔄 Outras dores</button></div>' +
        '<p class="how" style="margin-top:12px"><b>2. Quais formatos?</b> Todos do curso.</p>' +
        '<div class="p10-fmts">' + FMT.map(f => '<label class="ck p10-f"><input type="checkbox" data-p10f="' + f.id + '"' + (fs.indexOf(f.id) >= 0 ? " checked" : "") + '><span><b>' + esc(f.n) + '</b><small>' + esc(f.d) + '</small></span></label>').join("") + '</div>' +
        '<div class="actions"><button class="btn mini" data-p10todos="1">Marcar todos os formatos</button><button class="btn wine" data-p10gerar="1">✨ Gerar ideias</button></div>';
    }
    return h + '</article>';
  }

  // ---------- uma ideia: tudo editável, cada parte com 🔄 trocar ----------
  const campo = (v, k, rot, extra, linhas) => '<div class="p10-campo"><div class="p10-rot"><small>' + rot + '</small>' +
      (v[k].o.length > 1 ? '<button type="button" class="btn mini" data-p10outro="' + v.id + ':' + k + '">🔄 Outro</button>' : '') + (extra || '') + '</div>' +
    '<textarea class="input" rows="' + (linhas || 2) + '" data-p10campo="' + v.id + ':' + k + '">' + esc(v[k].t) + '</textarea></div>';
  function ideiaHtml(v){
    const k = cur, a = atrib(k), ss = ttsSlotsAntes(k), slot = Object.keys(a).find(i => a[i] === v.id);
    const aberta = state.p10ab === v.id;
    return '<details class="cr-bloco p10-ideia" data-p10id="' + v.id + '"' + (aberta ? ' open' : '') + '><summary class="cr-tit"><b>' + esc(v.f) + '</b> · ' + esc(v.g.t.slice(0, 60)) + (v.g.t.length > 60 ? '…' : '') + (slot != null ? ' <span class="tag casa">📌 ' + esc((ss[slot] || {}).h || '') + '</span>' : '') + '</summary>' +
      '<p class="why">Dor: ' + esc(v.dor.d) + '. Escreva por cima de qualquer parte: fica salvo.</p>' +
      campo(v, "g", "1. Título / gancho (0–3 s)", '<button type="button" class="btn mini" data-p10ia="' + v.id + '">✨ Mais</button><button type="button" class="btn mini" data-p10guarda="' + v.id + '">📝 Guardar no Bloco</button>') +
      campo(v, "tela", "2. Texto na tela") +
      campo(v, "dev", "3. Desenvolvimento passo a passo", "", 4) +
      campo(v, "cta", "4. Chamada no final (CTA)") +
      '<div class="say"><small>🔁 Loop (final emenda no começo)</small>' + esc(v.loop) + '</div>' +
      campo(v, "leg", "5. Legenda", '<button type="button" class="btn mini" data-p10copia="' + v.id + '">📋 Copiar</button>', 4) +
      '<details class="cr-bloco"><summary class="cr-tit"><b>🚀 Segredos da viralização</b></summary><ul class="script">' + SEGREDOS.map(s => '<li>' + esc(s) + '</li>').join("") + '</ul></details>' +
      '<div class="actions"><select class="input p10-sel" data-p10slot="' + v.id + '"><option value="">📌 Usar num horário de hoje…</option>' +
        ss.map((s, i) => '<option value="' + i + '"' + (String(slot) === String(i) ? ' selected' : '') + '>' + esc(s.h + ' · ' + (a[i] && a[i] !== v.id ? (achar(a[i]) || {}).f || 'outra ideia' : s.t)) + '</option>').join("") + '</select>' +
        (slot != null ? '<button type="button" class="btn mini" data-p10tira="' + v.id + '">Tirar do horário</button>' : '') +
        '<button type="button" class="btn mini" data-p10apaga="' + v.id + '">🗑️ Apagar ideia</button></div></details>';
  }
  function listaIdeias(){
    const ls = IDS(); if (!ls.length) return "";
    const prods = [...new Set(ls.map(v => v.p))];
    return '<article class="card"><div class="meta"><span class="tag trend">💡 Suas ideias de vídeo</span><span class="why">' + ls.length + '</span></div>' +
      '<p class="how">Abra uma ideia, ajuste o que quiser e, se for postar, escolha o horário. As outras ficam guardadas aqui.</p>' +
      prods.map(p => '<p class="p10-prod">' + esc(p) + '</p>' + ls.filter(v => v.p === p).map(ideiaHtml).join("")).join("") + '</article>';
  }

  // ---------- a seção dos 10 por dia (igual a antes + ideias + legenda sempre visível) ----------
  ttsSecao = function(){
    const k = cur, ss = ttsSlots(k); if (!ss.length) return "";
    const feito = (state.ttsFeito || {})[k] || {}, n = Object.keys(feito).length;
    const semProd = ss.some(s => s.sem);
    const corpo = painel() + listaIdeias() +
      '<article class="card"><p class="how"><b>@daledaia · 10 vídeos hoje.</b> 3 reciclados da @daiana.lima95 (com gancho novo), 5 de produto e 2 novos. Solte no horário, um de cada vez. Quer trocar um horário? Abra uma ideia acima e escolha “Usar num horário”.</p>' +
      '<p class="meta-falta">🔁 Os 5 de produto alternam entre os seus produtos (não 10 do mesmo). O que vender, grave mais 10.</p>' +
      (semProd ? '<p class="meta-falta">🛍️ Coloque os seus produtos em ⚙️ Ajustes › TikTok Shop › Meus produtos, ou gere ideias acima.</p>' : '') +
      '<details class="cr-bloco"><summary class="cr-tit"><b>⚠️ Antes de reciclar (leia 1 vez)</b></summary><ul class="script">' +
        '<li>O TikTok pune vídeo <b>igual</b> em 2 contas. Na @daiana.lima95, se tiver TikTok Shop: Central do criador › Integridade da conta › <b>Ferramenta de autorização de conteúdo</b> › autorize a @daledaia (até 5 contas). Sem isso, <b>edite</b> cada vídeo: gancho novo nos 3 primeiros segundos, outra música, corte diferente.</li>' +
        '<li>Nada de preço no vídeo nem na legenda.</li><li>Produto no carrinho só se for <b>igual</b> ao do vídeo. Sem produto igual? Poste sem link: ajuda a crescer.</li>' +
        '<li>Esqueceu o produto? Central do criador › Vídeos › Vincular produto (não precisa apagar).</li><li>Música em alta: primeiro adicione o produto, depois troque o som.</li>' +
        '<li>Nunca apague vídeo que foi mal. Vídeos do Garotas Apoiam Garotas: pode deixar privado (Configurações › Gerenciar publicações).</li></ul></details></article>' +
      ss.map((s, i) => {
        const ok = !!feito[i], c = TTS_COR[s.tipo];
        COPY.push(s.leg || ""); const ci = COPY.length - 1;
        return '<article class="card tts-slot' + (ok ? ' done' : '') + '"><div class="meta"><span>' + esc(s.h) + '</span><span class="tag ' + c[0] + '">' + c[1] + '</span>' + (s.ideia ? '<span class="why">📌 sua ideia</span>' : '') + '</div>' +
          '<h3 class="title">' + esc(s.t) + '</h3>' + (s.g ? '<div class="say"><small>Gancho</small>' + esc(s.g) + '</div>' : '') +
          (s.leg ? '<div class="say"><small>Legenda</small>' + esc(s.leg).replace(/\n/g, "<br>") + '</div>' : '') +
          '<div class="actions"><button class="btn main" data-ttsok="' + i + '">' + (ok ? 'Postado ✓' : 'Marcar como postado') + '</button>' + (s.leg ? '<button class="btn" data-copy="' + ci + '">Copiar legenda</button>' : '') +
          (s.ideia ? '<button class="btn" data-p10abre="' + s.ideia + '">✏️ Ver e editar</button>' : '') + '</div></article>';
      }).join("");
    return secao("tts", "🛍️", "TikTok Shop · 10 por dia", "@daledaia · " + (k === todayKey ? "hoje" : fmtDay(k, {weekday: "long"})), n + "/10", n >= 10, corpo);
  };

  // ---------- ações ----------
  const guarda = () => { const r = state.p10r = state.p10r || {}; const p = $("p10p"); if (p) r.p = p.value; };
  const abreTts = () => { document.querySelectorAll("#cards details.secao").forEach(x => { if (/TikTok Shop · 10/.test(x.querySelector("summary")?.innerText || "")) x.open = true; }); };
  const redesenha = (alvo) => { const y = scrollY; renderHoje(); abreTts(); const el = alvo && document.querySelector(alvo); if (el) el.scrollIntoView({block: "start"}); else window.scrollTo(0, y); };
  async function buscaDores(outras){
    const r = state.p10r, p = (r.p || "").trim();
    r.busy = 1; save(); redesenha("#p10p");
    const res = await robo({acao: "dores", produto: p + (outras && r.dores ? " (dê dores diferentes destas: " + r.dores.map(d => d.d).join(", ") + ")" : "")});
    const ok = res && Array.isArray(res.dores) ? res.dores.filter(d => d && d.d).map(d => ({d: String(d.d).toLowerCase().replace(/\.$/, ""), f: String(d.f || d.d).replace(/^["“]|["”]$/g, "")})) : [];
    r.busy = 0; r.reserva = !ok.length; r.dores = ok.length ? ok.slice(0, 8) : reserva(p); r.dSel = [0];
    save(); redesenha("#p10p");
  }
  document.addEventListener("click", async e => {
    if (!e.target.closest("#cards")) return;
    const q = s => e.target.closest(s), val = s => q(s).getAttribute(s.slice(1, -1));
    if (q("[data-p10ver]")) { guarda(); if (!(state.p10r.p || "").trim()) { toast("Escreva o produto primeiro."); return; } buscaDores(false); return; }
    if (q("[data-p10maisdores]")) { guarda(); buscaDores(true); return; }
    if (q("[data-p10todos]")) { guarda(); state.p10r.f = FMT.map(f => f.id); save(); redesenha(); return; }
    if (q("[data-p10gerar]")) {
      guarda(); const r = state.p10r, p = (r.p || "").trim(), fs = (r.f || []).map(id => FMT.find(f => f.id === id)).filter(Boolean), ds = (r.dSel || []).map(i => r.dores[i]).filter(Boolean);
      if (!p) { toast("Escreva o produto primeiro."); return; }
      if (!ds.length) { toast("Marque pelo menos 1 dor."); return; }
      if (!fs.length) { toast("Marque pelo menos 1 formato."); return; }
      const novas = []; let n = 0;
      fs.forEach((f, fi) => ds.forEach((d, di) => { if (novas.length < 14) novas.push(ideia(p, f, d, ds, n++)); }));
      state.p10i = novas.concat(IDS()).slice(0, 80); state.p10ab = novas[0].id; state.p10r = {};
      save(); redesenha('[data-p10id="' + novas[0].id + '"]'); toast(novas.length + " ideias novas. Nada mudou no cronograma."); return;
    }
    const ab = q("[data-p10abre]"); if (ab) { state.p10ab = ab.dataset.p10abre; save(); redesenha('[data-p10id="' + ab.dataset.p10abre + '"]'); return; }
    const ou = q("[data-p10outro]");
    if (ou) { const [id, k] = ou.dataset.p10outro.split(":"), v = achar(id); if (!v) return; const p = v[k]; p.i = (p.i + 1) % p.o.length; p.t = p.o[p.i]; state.p10ab = id; save(); const ta = document.querySelector('[data-p10campo="' + id + ':' + k + '"]'); if (ta) ta.value = p.t; else redesenha(); return; }
    const gu = q("[data-p10guarda]");
    if (gu) { const v = achar(gu.dataset.p10guarda); if (!v) return; if (window.blocoNovo) { blocoNovo("titulos", v.g.t, "Formato: " + v.f + " · dor: " + v.dor.d + " · veio do produto: " + v.p); toast("Guardado no Bloco › 🪝 Títulos guardados"); } return; }
    const cp = q("[data-p10copia]"); if (cp) { const v = achar(cp.dataset.p10copia); if (v) copyText(v.leg.t); return; }
    const ia = q("[data-p10ia]");
    if (ia) {
      const v = achar(ia.dataset.p10ia); if (!v) return;
      ia.disabled = true; ia.textContent = "⏳ até 30 s";
      const res = await robo({acao: "titulos", produto: v.p, formato: v.f, dor: v.dor.f + " (" + v.dor.d + ")", evitar: v.g.o.slice(-12)}, 45000);
      const novos = res && Array.isArray(res.titulos) ? res.titulos.map(String).filter(t => t && v.g.o.indexOf(t) < 0) : [];
      ia.disabled = false; ia.textContent = "✨ Mais";
      if (!novos.length) { toast("O robô não respondeu agora. Use 🔄 Outro.", 4000); return; }
      v.g.o = v.g.o.concat(novos); v.g.i = v.g.o.length - novos.length; v.g.t = v.g.o[v.g.i]; state.p10ab = v.id; save();
      const ta = document.querySelector('[data-p10campo="' + v.id + ':g"]'); if (ta) ta.value = v.g.t;
      toast(novos.length + " títulos novos. Toque em 🔄 Outro para ver os outros."); return;
    }
    const ti = q("[data-p10tira]"); if (ti) { const a = atrib(cur); Object.keys(a).forEach(i => { if (a[i] === ti.dataset.p10tira) delete a[i]; }); save(); redesenha('[data-p10id="' + ti.dataset.p10tira + '"]'); return; }
    const ap = q("[data-p10apaga]");
    if (ap) {
      const id = ap.dataset.p10apaga;
      if (ap.dataset.certeza !== "1") { ap.dataset.certeza = "1"; ap.textContent = "Toque de novo para apagar"; return; }
      state.p10i = IDS().filter(v => v.id !== id); Object.values(state.p10s || {}).forEach(a => Object.keys(a).forEach(i => { if (a[i] === id) delete a[i]; })); save(); redesenha(); return;
    }
  });
  document.addEventListener("change", e => {
    const sl = e.target.closest("[data-p10slot]");
    if (sl) { const id = sl.dataset.p10slot, a = atrib(cur); Object.keys(a).forEach(i => { if (a[i] === id) delete a[i]; }); if (sl.value !== "") a[sl.value] = id; state.p10ab = id; save(); redesenha('[data-p10id="' + id + '"]'); toast(sl.value !== "" ? "Pronto: essa ideia está no horário escolhido." : "Tirada do horário."); return; }
    const c = e.target.closest("[data-p10f]"), d = e.target.closest("[data-p10d]");
    if (!c && !d) return;
    guarda(); const r = state.p10r;
    if (c) { r.f = r.f || []; if (c.checked) { if (r.f.indexOf(c.dataset.p10f) < 0) r.f.push(c.dataset.p10f); } else r.f = r.f.filter(x => x !== c.dataset.p10f); }
    if (d) { const i = Number(d.dataset.p10d); r.dSel = r.dSel || []; if (d.checked) { if (r.dSel.indexOf(i) < 0) r.dSel.push(i); } else r.dSel = r.dSel.filter(x => x !== i); }
    save();
  });
  document.addEventListener("input", e => {
    if (e.target.id === "p10p") { const r = state.p10r = state.p10r || {}; if (r.dores && r.p !== e.target.value) { delete r.dores; delete r.dSel; } r.p = e.target.value; save(); return; }
    const ta = e.target.closest("[data-p10campo]"); if (!ta) return;
    const [id, k] = ta.dataset.p10campo.split(":"), v = achar(id); if (!v) return;
    v[k].t = ta.value; state.p10ab = id; save();
  });
  // lembra qual ideia está aberta
  document.addEventListener("toggle", e => { const d = e.target; if (d.matches && d.matches(".p10-ideia")) { if (d.open) state.p10ab = d.dataset.p10id; else if (state.p10ab === d.dataset.p10id) state.p10ab = null; save(); } }, true);

  // pasta nova no Bloco para os títulos que ela gostou
  try { if (typeof PASTAS !== "undefined" && !PASTAS.some(x => x[0] === "titulos")) PASTAS.push(["titulos", "🪝", "Títulos guardados"]); } catch(_) {}

  const css = document.createElement("style");
  css.textContent = ".p10-fmts{display:grid;gap:2px;margin:6px 0}.p10-f span{display:grid;gap:1px}.p10-f small{font-size:13px;color:var(--muted);font-weight:400;line-height:1.3}" +
    ".p10-campo{margin:10px 0}.p10-rot{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-bottom:4px}.p10-rot small{font-weight:800;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:var(--muted);margin-right:auto}" +
    ".p10-campo textarea{width:100%;box-sizing:border-box;resize:vertical;font-size:15px}.p10-sel{max-width:100%;flex:1 1 220px}.p10-prod{font-weight:800;margin:14px 0 4px;color:var(--wine)}" +
    "@media (min-width:1000px){#cards > details:has(#p10p){column-span:all}}";
  document.head.appendChild(css);
  // o plano antigo (v49–v52) que trocava o cronograma inteiro não é mais usado
  if (state.p10r && state.p10r.busy) { state.p10r.busy = 0; save(); }
  try { if (!$("tab-hoje").hidden) renderHoje(); } catch(_) {}
})();
