// Daia Studio v47 — "Daia IA": painel no estilo da R.AI (15 ferramentas), mas sem pagar nada a mais.
// Cada botão monta um pedido completo (quem ela é, nicho, regras, curso) e abre o Claude que ela já paga.
// O app em si não gasta nada: só abre o Claude com o pedido escrito. Não troca a tela "IAs" que já existia.
(function(){
  const CTX = "Você é a Daia IA, minha assistente de conteúdo. Sou a Daia (marca Dale Daia), afiliada da Shopee, TikTok Shop, Mercado Livre, Magalu e Natura. " +
    "Contas: TikTok @daledaia (a principal; TikTok Shop ativo; meta 2 mil e depois 10 mil seguidores; até 10 vídeos por dia), Instagram @daledaia e Shopee Vídeo. " +
    "Nicho: casa, decoração e organização (80% do conteúdo) + universo feminino ligado à casa: autocuidado, cheirinho na casa e no corpo, banheiro e penteadeira organizados, roupa de casa (20%). " +
    "Público: mulheres; pico às 18h. Estilo: minimalista, aconchegante, delicado, pouco texto. " +
    "Regras: NUNCA cite preço; nada de Pinterest; no Instagram a chamada é comentar a palavra do produto (nunca QUERO); português do Brasil simples, frases curtas, tom de amiga. " +
    "Regras do curso que eu sigo: gancho nos 3 primeiros segundos (fala, texto na tela ou movimento); meio com a dor e o produto como solução; CTA sem cara de venda (ex.: clica no carrinho e vê se o valor tá com promoção pra você / salva pra não perder); vídeo de 7 a 25 s; " +
    "SEO: falar e escrever o nome do produto, palavra-chave no começo da legenda, até 5 hashtags do produto, nada de #fyp ou #viral; final emendando no começo (loop); responder comentário com outra pergunta.";

  const FORMATOS = ["POV", "Contando uma história", "Antes e depois", "Só as mãos mostrando", "Unboxing", "Respondendo comentário", "3 motivos", "Erro comum"];
  const REDES = ["TikTok @daledaia", "Instagram @daledaia", "Shopee Vídeo"];
  const T = [
    {id: "dia", em: "☀️", nome: "Estratégia do dia", sub: "o que postar hoje",
      campos: [["c1", "Como está o seu dia?", "Ex.: pouco tempo, chovendo, tenho o organizador e o difusor em casa"]],
      p: v => "Monte a minha estratégia de HOJE para o TikTok @daledaia (até 10 vídeos) e o Instagram. Meu dia: " + v.c1 + ". Diga hora por hora o que postar, com o gancho de cada vídeo, e o que gravar de uma vez só para render o dia todo. Seja bem prático, em lista."},
    {id: "ganchos", em: "🪝", nome: "Ganchos virais", sub: "10 começos que param o dedo",
      campos: [["c1", "Produto ou assunto", "Ex.: organizador de gaveta"]],
      p: v => "Crie 10 ganchos para vídeos de " + v.c1 + ": 4 falados, 3 para escrever na tela (com o nome do produto, por causa do SEO) e 3 de movimento (o que fazer na cena). Cada um com até 10 palavras. Baseie nas dores reais de quem compra esse produto."},
    {id: "roteiro", em: "🎬", nome: "Roteiro que vende", sub: "gancho, meio e CTA",
      campos: [["c1", "Produto", "Ex.: difusor de varetas"], ["c2", "Formato", "", FORMATOS]],
      p: v => "Crie um roteiro de vídeo de 15 a 25 s no formato \"" + v.c2 + "\" para " + v.c1 + ". Divida em cenas com segundos: o que aparece, o que eu falo e o texto na tela. Gancho nos 3 primeiros segundos, meio com a dor e o produto como solução, CTA sem cara de venda e final que emenda no começo. No fim, a legenda com SEO e até 5 hashtags."},
    {id: "narra", em: "🎙️", nome: "Narração com a minha voz", sub: "texto para eu gravar falando",
      campos: [["c1", "Produto ou vídeo", "Ex.: boneco de neve de barbante"], ["c2", "Duração", "", ["10 segundos", "20 segundos", "30 segundos"]]],
      p: v => "Escreva uma narração de " + v.c2 + " para o meu vídeo de " + v.c1 + ", do jeito que eu falo: tom de amiga, simples, sem palavras difíceis. Comece com um gancho forte, fale o nome do produto (SEO) e termine com uma CTA natural. Me dê 3 versões diferentes."},
    {id: "legenda", em: "🔎", nome: "Legenda + SEO", sub: "palavra-chave e 5 hashtags",
      campos: [["c1", "Produto", "Ex.: porta-temperos giratório"], ["c2", "Onde vai postar", "", REDES]],
      p: v => "Escreva 3 legendas curtas para o " + v.c2 + " sobre " + v.c1 + ". A palavra-chave do produto no começo, uma pergunta para gerar comentário e a CTA certa para essa rede. Depois, até 5 hashtags só do produto e do nicho. Diga também 5 palavras que as pessoas pesquisam na lupa do TikTok sobre esse produto."},
    {id: "carrossel", em: "🖼️", nome: "Carrossel", sub: "capa, 5 itens e CTA",
      campos: [["c1", "Tema", "Ex.: banheiro com cara de hotel"]],
      p: v => "Monte um carrossel sobre " + v.c1 + " para o TikTok e o Instagram: capa com gancho em tom pessoal, 5 cards (cada um com o que mostrar na foto e um texto curto, como se eu tivesse comprado e usado), e o card final com CTA para o grupo VIP. Sem preço. Sugira o tipo de música."},
    {id: "video", em: "📹", nome: "Analisar meu vídeo", sub: "mande prints do vídeo junto",
      campos: [["c1", "O que é o vídeo", "Ex.: vídeo do pisca-pisca, teve 300 views"]], anexo: true,
      p: v => "Vou te mandar prints (ou o vídeo) de um vídeo meu: " + v.c1 + ". Analise com as regras do curso: o gancho segura nos 3 primeiros segundos? Tem SEO (nome do produto falado e escrito)? Tem dor e solução? A CTA é boa? O tamanho está bom? Dê uma nota de 0 a 10 e diga as 3 mudanças que mais vão ajudar no próximo."},
    {id: "perfil", em: "👤", nome: "Avaliar meu perfil", sub: "mande o print do perfil",
      campos: [["c1", "Qual perfil", "", REDES]], anexo: true,
      p: v => "Vou te mandar o print do meu perfil " + v.c1 + ". Avalie: a bio diz em 2 segundos o que eu ofereço? A foto, os destaques e os últimos posts mostram um nicho claro? O que falta para crescer até 2 mil e depois 10 mil? Dê 5 melhorias simples, em ordem de importância."},
    {id: "semana", em: "📅", nome: "Planejamento da semana", sub: "estratégia 60x60",
      campos: [["c1", "Produtos que tenho", "Ex.: organizador, difusor, tapete, porta-joias"]],
      p: v => "Monte o meu planejamento da semana (segunda a domingo) com estes produtos: " + v.c1 + ". Use a estratégia 60x60: dias de gravar muitos vídeos curtos de uma vez e dias só de postar, até 10 por dia no TikTok, intercalando os produtos. Inclua 1 vídeo por dia de casa/decoração sem produto, para crescer. Em tabela simples."},
    {id: "achar", em: "⛏️", nome: "Achar produto", sub: "o que divulgar agora",
      campos: [["c1", "Que tipo de produto", "Ex.: cozinha, cheirinho, banheiro"]],
      p: v => "Me ajude a escolher produtos de " + v.c1 + " para divulgar agora no TikTok Shop e na Shopee. Critérios do curso: nota 4,6 ou mais, mais de 90% de avaliações boas, estoque de 500 ou mais, comissão de 10% ou mais, ticket baixo para começar e que combine com o meu estilo minimalista. Me dê 10 ideias de produto e, para cada uma, o que pesquisar na lupa e um gancho."},
    {id: "semproduto", em: "🏠", nome: "Vídeo com o que tenho", sub: "sem comprar nada",
      campos: [["c1", "O que tenho em casa", "Ex.: toalhas, cesto de palha, vela"]],
      p: v => "Tenho em casa: " + v.c1 + ". Me dê 5 ideias de vídeo que eu consigo gravar hoje com isso, cada uma com formato, gancho e qual produto da Shopee ou do TikTok Shop eu posso marcar (algo parecido com o que aparece no vídeo)."},
    {id: "responder", em: "💬", nome: "Responder comentário", sub: "ou direct",
      campos: [["c1", "O que a pessoa escreveu", "Ex.: onde compra? é bom mesmo?"]],
      p: v => "Uma pessoa comentou: \"" + v.c1 + "\". Escreva 3 respostas curtas e simpáticas, terminando com uma pergunta para ela comentar de novo. Se ela pedir o link, convide para o grupo VIP e explique que no direct o link fica clicável copiando e colando no WhatsApp."},
    {id: "parceria", em: "🤝", nome: "Mensagem de parceria", sub: "influenciadora ou vendedor",
      campos: [["c1", "Para quem e o que quer", "Ex.: vendedor do organizador, impulsionar meu vídeo"]],
      p: v => "Escreva uma mensagem curta e educada para: " + v.c1 + ". Tom profissional mas leve, sem parecer robô. Me dê 2 versões: uma bem curta para o direct e uma um pouco mais completa."},
    {id: "imagem", em: "🎨", nome: "Pedido de foto ou vídeo IA", sub: "para usar no Gemini",
      campos: [["c1", "Produto", "Ex.: luminária de lua"], ["c2", "Cena", "Ex.: quarto aconchegante à noite"]],
      p: v => "Escreva um pedido (prompt) detalhado para eu colar no Gemini e gerar uma foto realista e uma versão em vídeo vertical 9:16 de 8 segundos de " + v.c1 + " em " + v.c2 + ". O produto não pode mudar (mesma cor e formato da foto que vou mandar). Luz natural, estilo minimalista e aconchegante, sem texto e sem preço na imagem."},
    {id: "bio", em: "✍️", nome: "Bio do perfil", sub: "curta e clara",
      campos: [["c1", "Qual perfil", "", REDES]],
      p: v => "Crie 5 opções de bio para o meu " + v.c1 + ", com até 80 caracteres cada: deixe claro em 2 segundos que é casa bonita e aconchegante (e um pouco de autocuidado), achados que eu uso de verdade, e chame para o grupo VIP. Sem preço, delicada, no máximo 2 emojis."}
  ];

  let aberta = null;
  const val = id => { const v = (state.daiaIA = state.daiaIA || {})[id] || {}; return v; };
  // lê o que está na tela agora; campo de escrever vazio = pede para preencher
  function pedido(t){
    const v = {};
    for (const c of t.campos) { const el = $("dia_" + c[0]); v[c[0]] = (el ? el.value : "").trim() || (c[3] ? c[3][0] : ""); if (!v[c[0]]) { toast("Escreva: " + c[1]); if (el) el.focus(); return null; } }
    return CTX + "\n\n" + t.p(v);
  }
  function form(t){
    const v = val(t.id);
    return '<article class="card" id="diaForm"><div class="meta"><span class="tag serie">' + t.em + ' ' + esc(t.nome) + '</span><button class="btn mini" data-diafecha="1" style="margin-left:auto">✕</button></div>' +
      t.campos.map(c => '<div class="field"><label for="dia_' + c[0] + '">' + esc(c[1]) + '</label>' + (c[3]
        ? '<select class="input" id="dia_' + c[0] + '" data-diac="' + c[0] + '">' + c[3].map(o => '<option' + (v[c[0]] === o ? ' selected' : '') + '>' + esc(o) + '</option>').join("") + '</select>'
        : '<input class="input" id="dia_' + c[0] + '" data-diac="' + c[0] + '" placeholder="' + esc(c[2]) + '" value="' + esc(v[c[0]] || "") + '">') + '</div>').join("") +
      (t.anexo ? '<p class="how">📎 No Claude, toque no <b>+</b> e mande os prints antes de enviar.</p>' : '') +
      '<div class="actions"><button class="btn wine" data-diavai="claude">🤖 Abrir no Claude</button>' + (t.id === "imagem" ? '' : '') + '<button class="btn" data-diavai="copiar">📋 Copiar pedido</button></div>' +
      '<p class="why">Abre o Claude que você já paga, com tudo sobre você escrito. Não custa nada a mais.</p></article>';
  }
  function pagina(){
    const t = T.find(x => x.id === aberta);
    return '<article class="card"><p class="how">Toque no que você precisa. Eu monto o pedido com tudo sobre você (nicho, estilo, regras e o curso) e abro o Claude. É como a R.AI, mas usando o Claude que você já paga.</p></article>' +
      (t ? form(t) : '') +
      '<div class="dia-grade">' + T.map(x => '<button type="button" class="dia-bt' + (x.id === aberta ? ' on' : '') + '" data-diaia="' + x.id + '"><span>' + x.em + '</span><b>' + esc(x.nome) + '</b><small>' + esc(x.sub) + '</small></button>').join("") + '</div>';
  }

  const renderPaginaAntes = renderPagina;
  renderPagina = function(){
    if (paginaAtual !== "daiaia") return renderPaginaAntes();
    $("pagTit").innerHTML = 'Daia <em>IA</em>'; $("pagSub").textContent = "15 ajudantes prontas para os seus conteúdos.";
    $("pagBox").innerHTML = pagina();
  };

  // botão + : "Daia IA" (antes do menu antigo tratar o clique)
  const menu = $("maisMenu");
  if (menu && !menu.querySelector('[data-maisir="daiaia"]')) menu.insertAdjacentHTML("afterbegin", '<button type="button" data-maisir="daiaia">🤖 <span><b>Daia IA</b><small>ganchos, roteiro, legenda, analisar vídeo…</small></span></button>');
  document.addEventListener("click", e => {
    const ir = e.target.closest('[data-maisir="daiaia"]');
    if (ir) { e.stopImmediatePropagation(); maisAbrir(false); aberta = null; abrirPagina("daiaia"); }
  }, true);

  document.addEventListener("click", e => {
    if (!e.target.closest("#pagBox") || paginaAtual !== "daiaia") return;
    const q = s => e.target.closest(s);
    const b = q("[data-diaia]");
    if (b) { aberta = aberta === b.dataset.diaia ? null : b.dataset.diaia; renderPagina(); const f = $("diaForm"); if (f) f.scrollIntoView({block: "start", behavior: "smooth"}); return; }
    if (q("[data-diafecha]")) { aberta = null; renderPagina(); return; }
    const a = q("[data-diavai]");
    if (a) {
      const t = T.find(x => x.id === aberta); if (!t) return;
      const txt = pedido(t); if (!txt) return;
      if (a.dataset.diavai === "copiar") { copyText(txt); return; }
      try { navigator.clipboard.writeText(txt); } catch(_) {}
      abrirLink("https://claude.ai/new?q=" + encodeURIComponent(txt));
    }
  });
  document.addEventListener("input", e => { const c = e.target.closest("[data-diac]"); if (!c || !aberta) return; const v = (state.daiaIA = state.daiaIA || {}); v[aberta] = v[aberta] || {}; v[aberta][c.dataset.diac] = c.value; save(); });
  document.addEventListener("change", e => { const c = e.target.closest("select[data-diac]"); if (!c || !aberta) return; const v = (state.daiaIA = state.daiaIA || {}); v[aberta] = v[aberta] || {}; v[aberta][c.dataset.diac] = c.value; save(); });

  // estilo da grade (2 por linha no celular)
  const css = document.createElement("style");
  css.textContent = ".dia-grade{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:4px 0 16px}" +
    ".dia-bt{display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;padding:12px;border-radius:16px;border:1px solid var(--line,#e8dcd6);background:var(--surface,#fff);color:inherit;font:inherit;cursor:pointer;min-width:0}" +
    ".dia-bt span{font-size:22px}.dia-bt b{font-size:14px;line-height:1.2}.dia-bt small{font-size:12px;opacity:.7;line-height:1.25}.dia-bt.on{outline:2px solid var(--wine,#8a1c3c)}";
  document.head.appendChild(css);
})();
