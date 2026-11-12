// Daia Studio v51 — "Tenho um produto para hoje" (TikTok Shop · 10 por dia).
// Ela escreve SÓ o produto. O app descobre as dores que ele resolve (robô do Google com Gemini grátis; se não responder,
// usa uma lista de reserva) e ela escolhe as dores e os formatos virais do curso. O app monta os vídeos do dia com
// gancho SEMPRE pela dor, texto na tela, cenas, CTA, loop, segredos da viralização e legenda. Cada gancho tem
// "🔄 Outro título" (troca na hora) e "✨ Mais títulos" (pede novos ao robô). Sem produto, o cronograma segue como antes.
(function(){
  // {p} produto · {o} o/a · {de} do/da · {dor} dor curta (ex.: gaveta bagunçada) · {fala} a dor do jeito que a cliente fala
  const FMT = [
    {id: "pov", n: "POV", d: "um take só + frase na tela + som em alta. O mais fácil e um dos que mais viralizam.",
      g: ["POV: você cansou de {dor} e achou {o} {p}", "POV: {dor} nunca mais", "POV: você descobriu {o} {p} que acaba com {dor}", "POV: você achou {o} {p} {mais} do TikTok", "POV: chega de {dor} 🤍"],
      tela: "POV: {dor} nunca mais", cenas: ["Um take só de {o} {p} resolvendo {dor}, bem de perto", "Som em alta, sem falar nada", "7 a 10 segundos"]},
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
      tela: "o som 🤍", cenas: ["Close nos detalhes de {o} {p}", "Sons de abrir, encaixar, arrumar (sem música alta)", "Final igual ao começo (loop)"]},
    {id: "comparacao", n: "Comparação", d: "compara com algo caro ou com o jeito antigo (aula Chave da criatividade).",
      g: ["Jeito antigo x {p}: qual resolve {dor}?", "Gastei com o caro e {dor} continuou. Aí achei esse", "Parece de loja de decoração, mas não é"],
      tela: "o jeito antigo x {o} {p}", cenas: ["Mostra o jeito antigo (com {dor})", "Mostra {o} {p}", "Lado a lado + pergunta: qual você escolhe?"]},
    {id: "publico", n: "Para quem…", d: "o mesmo produto para um público diferente (aula Estrutura que vende: teste os públicos).",
      g: ["Se você mora em casa pequena e sofre com {dor}, olha isso", "Pra você que vive com {dor}", "Mãe que trabalha fora e não aguenta mais {dor}", "Pra quem ama casa bonita mas sofre com {dor}"],
      tela: "pra quem sofre com {dor}", cenas: ["Fala direto com um tipo de pessoa (casa pequena, mãe, quem trabalha fora…)", "Mostra como {o} {p} resolve {dor} pra ela", "CTA"]},
    {id: "ambiente", n: "No ambiente", d: "o produto no lugar onde ele é usado de verdade, com luz bonita.",
      g: ["O cantinho que era só {dor}", "Olha como ficou depois que acabei com {dor}", "Esse cantinho me salvou de {dor}"],
      tela: "chega de {dor} 🤍", cenas: ["{o} {p} no lugar onde é usado", "Luz natural, câmera devagar", "8 segundos, som em alta"]},
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
  function montar(p, dores, ids){
    const fs = ids.map(id => FMT.find(f => f.id === id)).filter(Boolean); if (!fs.length || !dores.length) return [];
    const P = cap(p);
    const tags = [tg(p.replace(/\s+/g, "")), tg(p.split(/\s+/)[0] + "casa"), "#casaorganizada", "#achadosdecasa", "#tiktokshop"].filter((t, i, a) => t.length > 2 && a.indexOf(t) === i).slice(0, 5);
    return Array.from({length: 9}, (_, i) => {
      const f = fs[i % fs.length], d = dores[i % dores.length], volta = Math.floor(i / fs.length);
      const pl = pool(f, p, dores, i), gi = (volta * 2) % pl.length;
      return {f: f.n, fid: f.id, dor: d, pool: pl, gi, g: pl[gi], loop: LOOP[f.id] || "", tela: preenche(f.tela, p, d), cenas: f.cenas.map(c => preenche(c, p, d)), cta: CTAS[i % CTAS.length],
        leg: P + ": chega de " + d.d + " 🤍 " + PERG[i % PERG.length] + "\n\n" + tags.join(" ")};
    });
  }

  // os horários do dia: com produto escolhido, 9 vídeos dele + o Garotas Apoiam Garotas das 17h
  const ttsSlotsAntes = ttsSlots;
  ttsSlots = function(k){
    const base = ttsSlotsAntes(k), pl = (state.p10 || {})[k];
    if (!base.length || !pl || !pl.v || !pl.v.length || !pl.v[0].pool) return base;
    let j = 0;
    return base.map((s, i) => {
      if (i === 6) return s;
      const vi = j++ % pl.v.length, v = pl.v[vi];
      return {h: s.h, tipo: "produto", t: pl.p + " · " + v.f, g: v.g, leg: v.leg, det: v, vi};
    });
  };

  async function robo(corpo, ms){
    const ctl = new AbortController(), lim = setTimeout(() => ctl.abort(), ms || 60000);
    try { const j = await (await fetch(ROBO, {method: "POST", headers: {"Content-Type": "text/plain;charset=utf-8"}, body: JSON.stringify(corpo), signal: ctl.signal})).json(); return j && j.r ? j.r : null; }
    catch(_) { return null; } finally { clearTimeout(lim); }
  }

  function painel(k){
    const pl = (state.p10 || {})[k], r = state.p10r || {};
    if (pl && pl.v && pl.v.length && pl.v[0].pool) return '<article class="card"><div class="meta"><span class="tag serie">🎯 Produto do dia</span><button class="btn mini" data-p10mudar="1" style="margin-left:auto">Trocar</button></div>' +
      '<h3 class="title">' + esc(pl.p) + '</h3><p class="how">Dores: <b>' + esc(pl.dores.map(d => d.d).join(", ")) + '</b>.<br>Formatos: <b>' + esc([...new Set(pl.v.map(v => v.f))].join(", ")) + '</b>.</p>' +
      '<p class="meta-falta">Não gostou de um título? Toque em <b>🔄 Outro título</b> no vídeo.</p>' +
      '<div class="actions"><button class="btn" data-p10claude="1">🤖 Mais detalhado no Claude</button><button class="btn" data-p10limpa="1">Voltar ao normal</button></div></article>';
    const etapa = r.dores ? 2 : 1;
    let h = '<article class="card"><div class="meta"><span class="tag serie">🎯 Tenho um produto para hoje</span></div>' +
      '<div class="field"><input class="input" id="p10p" placeholder="Qual produto? Ex.: vila natalina, organizador de gaveta" value="' + esc(r.p || "") + '"></div>';
    if (r.busy) h += '<p class="how">⏳ Descobrindo as dores que esse produto resolve… (até 1 minuto)</p>';
    else if (etapa === 1) h += '<div class="actions"><button class="btn wine" data-p10ver="1">Ver as dores e os formatos</button></div>';
    else {
      const ds = r.dSel || [], fs = r.f || [];
      h += '<p class="how"><b>1. Que dor esse produto resolve?</b> Marque 1 ou mais. Os títulos nascem dessas dores.' + (r.reserva ? ' <small>(sugestões de reserva: o robô não respondeu agora)</small>' : '') + '</p>' +
        '<div class="p10-fmts">' + r.dores.map((d, i) => '<label class="ck p10-f"><input type="checkbox" data-p10d="' + i + '"' + (ds.indexOf(i) >= 0 ? " checked" : "") + '><span><b>' + esc(d.d) + '</b><small>“' + esc(d.f) + '”</small></span></label>').join("") + '</div>' +
        '<div class="actions"><button class="btn mini" data-p10maisdores="1">🔄 Outras dores</button></div>' +
        '<p class="how" style="margin-top:12px"><b>2. Quais formatos?</b> Todos do curso. Marque quantos quiser: o app reveza.</p>' +
        '<div class="p10-fmts">' + FMT.map(f => '<label class="ck p10-f"><input type="checkbox" data-p10f="' + f.id + '"' + (fs.indexOf(f.id) >= 0 ? " checked" : "") + '><span><b>' + esc(f.n) + '</b><small>' + esc(f.d) + '</small></span></label>').join("") + '</div>' +
        '<div class="actions"><button class="btn mini" data-p10todos="1">Marcar todos os formatos</button><button class="btn wine" data-p10montar="1">✨ Montar os vídeos de hoje</button></div>';
    }
    return h + '<p class="why">O curso manda testar o mesmo produto em vários formatos e repetir o que entregar mais.</p></article>';
  }
  const detHtml = (v, vi) => '<div class="actions"><button class="btn mini" data-p10troca="' + vi + '">🔄 Outro título</button><button class="btn mini" data-p10ia="' + vi + '">✨ Mais títulos</button></div>' +
    '<p class="why">Dor: ' + esc(v.dor.d) + ' · opção ' + (v.gi + 1) + ' de ' + v.pool.length + '</p>' +
    '<details class="cr-bloco"><summary class="cr-tit"><b>🎬 Ver roteiro</b></summary>' +
    '<div class="say"><small>Texto na tela</small>' + esc(v.tela) + '</div><ol class="script">' + v.cenas.map(c => '<li>' + esc(c) + '</li>').join("") + '</ol>' +
    '<div class="say"><small>Chamada no final</small>' + esc(v.cta) + '</div>' +
    (v.loop ? '<div class="say"><small>🔁 Loop (final emenda no começo)</small>' + esc(v.loop) + '</div>' : '') +
    '<p class="how"><b>🚀 Segredos da viralização</b></p><ul class="script">' + SEGREDOS.map(s => '<li>' + esc(s) + '</li>').join("") + '</ul></details>';

  // a seção dos 10 por dia, igual a antes + o painel do produto e o roteiro de cada vídeo
  ttsSecao = function(){
    const k = cur, ss = ttsSlots(k); if (!ss.length) return "";
    const feito = (state.ttsFeito || {})[k] || {}, n = Object.keys(feito).length;
    const temPlano = ss.some(s => s.det);
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
          '<h3 class="title">' + esc(s.t) + '</h3>' + (s.g ? '<div class="say"><small>' + (s.det ? 'Título / gancho' : 'Gancho') + '</small>' + esc(s.g) + '</div>' : '') + (s.det ? detHtml(s.det, s.vi) : '') +
          '<div class="actions"><button class="btn main" data-ttsok="' + i + '">' + (ok ? 'Postado ✓' : 'Marcar como postado') + '</button>' + (s.leg ? '<button class="btn" data-copy="' + ci + '">Copiar legenda</button>' : '') + '</div></article>';
      }).join("");
    return secao("tts", "🛍️", "TikTok Shop · 10 por dia", "@daledaia · " + (k === todayKey ? "hoje" : fmtDay(k, {weekday: "long"})), n + "/10", n >= 10, corpo);
  };

  const guarda = () => { const r = state.p10r = state.p10r || {}; const p = $("p10p"); if (p) r.p = p.value; };
  const abreTts = () => { document.querySelectorAll("#cards details.secao").forEach(x => { if (/TikTok Shop · 10/.test(x.querySelector("summary")?.innerText || "")) x.open = true; }); };
  const redesenha = (rolar) => { const y = scrollY; renderHoje(); abreTts(); if (rolar) { const a = $("p10p"); if (a) a.scrollIntoView({block: "center"}); } else window.scrollTo(0, y); };
  async function buscaDores(outras){
    const r = state.p10r, p = (r.p || "").trim();
    r.busy = 1; save(); redesenha(true);
    const res = await robo({acao: "dores", produto: p + (outras && r.dores ? " (dê dores diferentes destas: " + r.dores.map(d => d.d).join(", ") + ")" : "")});
    const ok = res && Array.isArray(res.dores) ? res.dores.filter(d => d && d.d).map(d => ({d: String(d.d).toLowerCase().replace(/\.$/, ""), f: String(d.f || d.d).replace(/^["“]|["”]$/g, "")})) : [];
    r.busy = 0; r.reserva = !ok.length; r.dores = ok.length ? ok.slice(0, 8) : reserva(p); r.dSel = [0];
    save(); redesenha(true);
  }
  document.addEventListener("click", async e => {
    if (!e.target.closest("#cards")) return;
    const q = s => e.target.closest(s);
    if (q("[data-p10ver]")) { guarda(); if (!(state.p10r.p || "").trim()) { toast("Escreva o produto primeiro."); return; } buscaDores(false); return; }
    if (q("[data-p10maisdores]")) { guarda(); buscaDores(true); return; }
    if (q("[data-p10todos]")) { guarda(); state.p10r.f = FMT.map(f => f.id); save(); redesenha(); return; }
    if (q("[data-p10montar]")) {
      guarda(); const r = state.p10r, p = (r.p || "").trim(), f = r.f || [], ds = (r.dSel || []).map(i => r.dores[i]).filter(Boolean);
      if (!p) { toast("Escreva o produto primeiro."); return; }
      if (!ds.length) { toast("Marque pelo menos 1 dor."); return; }
      if (!f.length) { toast("Marque pelo menos 1 formato."); return; }
      state.p10 = state.p10 || {}; state.p10[cur] = {p, dores: ds, todas: r.dores, f, v: montar(p, ds, f)};
      state.p10r = {}; save(); redesenha(); toast("Pronto! Vídeos de hoje montados pela dor."); return;
    }
    const tr = q("[data-p10troca]");
    if (tr) { const v = state.p10[cur].v[Number(tr.dataset.p10troca)]; v.gi = (v.gi + 1) % v.pool.length; v.g = v.pool[v.gi]; save(); redesenha(); return; }
    const ia = q("[data-p10ia]");
    if (ia) {
      const pl = state.p10[cur], v = pl.v[Number(ia.dataset.p10ia)];
      ia.disabled = true; ia.textContent = "⏳ Pensando… (até 30 s)";
      const res = await robo({acao: "titulos", produto: pl.p, formato: v.f, dor: v.dor.f + " (" + v.dor.d + ")", evitar: v.pool.slice(-12)}, 45000);
      const novos = res && Array.isArray(res.titulos) ? res.titulos.map(String).filter(t => t && v.pool.indexOf(t) < 0) : [];
      if (!novos.length) { toast("O robô não respondeu agora. Use 🔄 Outro título.", 4000); ia.disabled = false; ia.textContent = "✨ Mais títulos"; return; }
      v.pool = v.pool.concat(novos); v.gi = v.pool.length - novos.length; v.g = v.pool[v.gi]; save(); redesenha(); toast(novos.length + " títulos novos. Toque em 🔄 para ver os outros."); return;
    }
    if (q("[data-p10mudar]")) { const pl = state.p10[cur]; state.p10r = {p: pl.p, dores: pl.todas || pl.dores, dSel: (pl.todas || pl.dores).map((d, i) => pl.dores.some(x => x.d === d.d) ? i : -1).filter(i => i >= 0), f: pl.f}; delete state.p10[cur]; save(); redesenha(true); return; }
    if (q("[data-p10limpa]")) { delete state.p10[cur]; save(); renderHoje(); return; }
    if (q("[data-p10claude]")) {
      const pl = state.p10[cur];
      const txt = "Sou a Daia (@daledaia), afiliada de casa e decoração no TikTok Shop. Estilo minimalista e aconchegante, tom de amiga, NUNCA cite preço. Regras do curso: gancho nos 3 primeiros segundos SEMPRE nascendo da dor, dor → produto como solução, CTA sem cara de venda, 7 a 25 s, falar e escrever o nome do produto (SEO), até 5 hashtags do produto, final que emenda no começo (loop).\n\n" +
        "Produto de hoje: " + pl.p + ". Dores que ele resolve: " + pl.dores.map(d => d.d).join("; ") + ". Crie 9 roteiros de vídeo revezando estes formatos: " + [...new Set(pl.v.map(v => v.f))].join(", ") + ". Para cada vídeo: 3 opções de título/gancho pela dor, texto na tela, cenas com segundos, CTA, como fazer o loop e legenda com até 5 hashtags.";
      try { navigator.clipboard.writeText(txt); } catch(_) {}
      abrirLink("https://claude.ai/new?q=" + encodeURIComponent(txt)); return;
    }
  });
  document.addEventListener("change", e => {
    const c = e.target.closest("[data-p10f]"), d = e.target.closest("[data-p10d]");
    if (!c && !d) return;
    guarda(); const r = state.p10r;
    if (c) { r.f = r.f || []; if (c.checked) { if (r.f.indexOf(c.dataset.p10f) < 0) r.f.push(c.dataset.p10f); } else r.f = r.f.filter(x => x !== c.dataset.p10f); }
    if (d) { const i = Number(d.dataset.p10d); r.dSel = r.dSel || []; if (d.checked) { if (r.dSel.indexOf(i) < 0) r.dSel.push(i); } else r.dSel = r.dSel.filter(x => x !== i); }
    save();
  });
  document.addEventListener("input", e => { if (e.target.id === "p10p") { const r = state.p10r = state.p10r || {}; if (r.dores && r.p !== e.target.value) { delete r.dores; delete r.dSel; } r.p = e.target.value; save(); } });

  const css = document.createElement("style");
  css.textContent = ".p10-fmts{display:grid;gap:2px;margin:6px 0}.p10-f span{display:grid;gap:1px}.p10-f small{font-size:13px;color:var(--muted);font-weight:400;line-height:1.3}";
  document.head.appendChild(css);
  // plano antigo (v49/v50, sem dores) não é usado: ela monta de novo.
  // Se o app foi fechado enquanto o robô pensava, não fica preso em "Descobrindo as dores…".
  if (state.p10r && state.p10r.busy) { state.p10r.busy = 0; save(); }
  try { if (!$("tab-hoje").hidden) renderHoje(); } catch(_) {}
})();
