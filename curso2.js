// Daia Studio v46 — aulas que liberaram em 11/11/2026 na Mentoria Afiliada com Propósito.
// Fica no topo de Crescer › 🎓 Curso. Não troca nada da lista de aulas que já existia: só soma em cima.
// As mesmas dicas foram para a aba "App - Curso" da planilha, então o robô usa no Criar, no Meu vídeo e no Assunto.
(function(){
  const C2 = []; // textos com botão de copiar
  const cp = t => { C2.push(t); return '<button type="button" class="btn mini" data-c2copy="' + (C2.length - 1) + '">📋 Copiar</button>'; };
  const linhaCp = t => '<div class="tts-prod"><div><b>' + esc(t) + '</b></div><div class="actions">' + cp(t) + '</div></div>';
  const sec = (emoji, tit, sub, corpo) => '<details class="secao"><summary><span class="sec-emoji">' + emoji + '</span><span class="sec-txt"><b>' + tit + '</b><small>' + sub + '</small></span><span class="sec-seta" aria-hidden="true"></span></summary><div class="sec-corpo">' + corpo + '</div></details>';
  const card = h => '<article class="card">' + h + '</article>';
  const ul = itens => '<ul class="script">' + itens.map(i => '<li>' + i + '</li>').join("") + '</ul>';

  const GANCHOS = ["Como eu vivi tanto tempo sem isso?", "Só eu que não sabia disso?", "Fui enganada esse tempo todo!", "A (marca) enlouqueceu de vez!",
    "Eu tava cansada de… até achar isso aqui", "Eu queria ter descoberto isso antes", "Ninguém acredita quando eu mostro isso", "POV: você achou o (produto) mais (qualidade) da sua vida"];
  const CTAS = ["Clica no carrinho e vê se o valor tá com promoção pra você", "Confere se ainda tem, porque tava acabando", "Dá uma olhada no carrinho, tá quase de graça hoje",
    "Promoção válida só hoje, viu?", "Salva pra não perder", "Me conta: você também passa por isso?"];
  const MSG_VENDEDOR = "Olá, tudo bem? Tenho feito vários vídeos do seu produto no TikTok Shop e vejo que ele tem muito potencial de alcance e vendas. Vocês teriam interesse em impulsionar algum desses vídeos? Quero continuar criando conteúdo do produto para aumentar a exposição e as vendas. Se tiver interesse, te passo o código do vídeo. Fico à disposição! 🤍";

  function checklist(){
    const itens = [["pc1", "Nos <b>3 primeiros segundos</b> já tem gancho (fala, texto na tela ou movimento)"], ["pc2", "Eu <b>falo e escrevo o nome do produto</b> (SEO), não só “isso aqui”"],
      ["pc3", "Mostro a <b>dor</b> e o produto como <b>solução</b> (ou é um POV/trend curtinho)"], ["pc4", "Tem <b>CTA sem cara de venda</b> no fim (carrinho, salvar ou pergunta)"],
      ["pc5", "Tem <b>legenda na tela</b> para quem assiste sem som"], ["pc6", "Dura de <b>7 a 25 segundos</b>"], ["pc7", "O <b>final emenda no começo</b> (loop)"],
      ["pc8", "Legenda do post começa com a <b>palavra-chave</b> e tem <b>até 5 hashtags</b> do produto (sem #fyp)"], ["pc9", "Sem preço e no meu estilo minimalista"]];
    const on = state.c2ck || {};
    return card('<p class="how">Confira antes de postar. Toque para marcar.</p>' + itens.map(i => '<label class="ck"><input type="checkbox" data-c2ck="' + i[0] + '"' + (on[i[0]] ? " checked" : "") + '><span>' + i[1] + '</span></label>').join("") +
      '<div class="actions"><button type="button" class="btn mini" data-c2limpa="1">Desmarcar tudo (próximo vídeo)</button></div>' +
      '<p class="why">Para o app analisar um vídeo seu com essas regras: Criar › 📹 Meu vídeo.</p>');
  }

  function seoTool(){
    const s = state.c2seo || {};
    return card('<p class="how">Monte a legenda do jeito do curso: palavra-chave no começo e até 5 hashtags do produto.</p>' +
      '<div class="field"><input class="input" id="c2prod" placeholder="Produto (ex.: organizador de gaveta)" value="' + esc(s.p || "") + '"></div>' +
      '<div class="field"><input class="input" id="c2car" placeholder="Como ele é (ex.: prático, transparente, empilhável)" value="' + esc(s.c || "") + '"></div>' +
      '<div class="actions"><button type="button" class="btn wine" data-c2seo="1">✨ Montar legenda</button></div><div id="c2seoRes">' + (s.res ? seoRes(s.res) : "") + '</div>' +
      '<p class="why">Antes, digite o produto na lupa do TikTok e veja as palavras que ele sugere. Use as que combinam.</p>');
  }
  const tag = w => "#" + String(w).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
  function montaSeo(p, c){
    const cars = c.split(/[,;]| e /).map(x => x.trim()).filter(Boolean);
    const P = p.charAt(0).toUpperCase() + p.slice(1);
    const leg = P + (cars.length ? " " + cars.slice(0, 2).join(" e ") : "") + " que deixa a casa mais leve 🤍 Me conta: você também precisava de um?";
    const tags = [tag(p.replace(/\s+/g, "")), ...cars.slice(0, 2).map(x => tag(p.split(" ")[0] + x)), "#casaorganizada", "#achadosdecasa"].filter((t, i, a) => t.length > 2 && a.indexOf(t) === i).slice(0, 5);
    return leg + "\n\n" + tags.join(" ");
  }
  const seoRes = t => '<div class="say"><small>Legenda pronta</small>' + esc(t).replace(/\n/g, "<br>") + '</div><div class="actions">' + cp(t) + '</div>';

  function blocoNovo(){
    C2.length = 0;
    return '<article class="card"><div class="meta"><span class="tag serie">🆕 Liberou em 11/11</span><span class="why">Mentoria Afiliada com Propósito</span></div>' +
      '<h3 class="title">Aulas novas, prontas para usar</h3><p class="how">Li as aulas que destravaram e deixei aqui só o que serve para você. O robô também já usa tudo isso no <b>Criar</b>, no <b>📹 Meu vídeo</b> e no <b>Assunto da vez</b>.</p></article>' +
      sec("✅", "Checklist antes de postar", "o resumo de todas as aulas novas", checklist()) +
      sec("🎯", "Estrutura do vídeo que vende", "gancho, desenvolvimento e CTA",
        card(ul(["<b>Começo, o gancho:</b> prende nos 3 primeiros segundos. Pode ser fala, texto na tela ou movimento (algo caindo na mão, tirar o produto de um lugar inesperado).",
          "<b>Meio, o desenvolvimento:</b> mostre a dor e o produto como solução. Fale menos do produto e mais do que ele resolve.",
          "<b>Fim, a CTA:</b> diga o que fazer sem mandar comprar. Evite “compre agora” e “corre”.",
          "Trend e POV curtinho <b>não precisam</b> dessa estrutura. Ela é para o vídeo em que você aparece ou narra (uns 20 a 30 s).",
          "<b>Teste públicos:</b> o mesmo produto rende vários vídeos. Ex.: organizador para quem tem gaveta bagunçada, para quem mora em casa pequena, para quem quer casa de revista.",
          "<b>Storytelling</b> vende sem parecer venda: uma história curta tipo “isso acontece comigo também”."])) +
        card('<div class="meta"><span class="tag casa">Ganchos</span><span class="why">a entonação tem que combinar</span></div>' + GANCHOS.map(linhaCp).join("")) +
        card('<div class="meta"><span class="tag casa">CTAs sem cara de venda</span><span class="why">pode somar urgência</span></div>' + CTAS.map(linhaCp).join(""))) +
      sec("🚀", "Segredo da viralização", "o que o TikTok olha",
        card(ul(["O TikTok mostra o vídeo para um grupinho e vê a reação. Se for bem, mostra para mais gente. <b>Seguidor não importa.</b>",
          "<b>Retenção:</b> os 3 primeiros segundos decidem. Nunca comece parada e calada.",
          "<b>Engajamento:</b> curtir, comentar, compartilhar e salvar. Peça de forma natural: “salva pra não perder”, “me conta o que achou”.",
          "<b>Ver de novo:</b> faça o final emendar no começo (loop). A pessoa assiste 2 vezes sem perceber. Como fazer: 1) termine com a câmera no mesmo lugar e ângulo da 1ª cena; 2) corte no meio de um movimento que continua no começo (pegar/guardar o produto); 3) frase final que se completa com a primeira (\"…e é por isso que esse é o…\"); 4) mesmo som no fim e no início; 5) cortes suaves, sem tela preta no fim.",
          "<b>Comentários:</b> responda sempre com outra pergunta. Ex.: “Que lindo!” → “Você já tem um?”. Dúvida boa vira vídeo novo.",
          "<b>Tamanho:</b> 7 a 25 segundos.",
          "<b>Constância:</b> sumiu uns dias, as views caem. Postar todo dia é o que mais pesa."]))) +
      sec("🔎", "SEO e hashtags", "para o vídeo aparecer na busca",
        card(ul(["O TikTok lê <b>4 coisas</b>: o que você fala, o que escreve na tela, o que mostra e a legenda.",
          "<b>Texto na tela:</b> gancho direto com o nome do produto. Ex.: “o organizador de gaveta mais prático que eu já tive”.",
          "<b>Fala:</b> diga o nome e as características (pequeno, transparente, cheiroso, firme).",
          "<b>Narração + legenda na tela:</b> vende mais, porque muita gente assiste sem som.",
          "<b>Legenda do post:</b> palavra-chave logo no começo. O TikTok dá mais peso às primeiras palavras.",
          "<b>Hashtags:</b> até 5, todas do produto. #fyp, #viral e #foryou não ajudam.",
          "<b>Pesquisa:</b> digite o produto na lupa. Use as palavras sugeridas e veja a legenda do vídeo que mais bombou.",
          "<b>Seus insights:</b> no seu vídeo, toque em “Mais insights” e veja os termos que levaram gente até ele. Repita no próximo."])) + seoTool()) +
      sec("🎬", "Formatos virais", "teste o mesmo produto em vários",
        card(ul(["<b>POV:</b> um take só + frase + som em alta. O mais fácil e um dos que mais viralizam.",
          "<b>Storytelling:</b> conta uma história real. É o que mais conecta.",
          "<b>Unboxing:</b> abrindo e primeira impressão. Cuidado para não gastar os 3 primeiros segundos só na caixa.",
          "<b>Engajamento:</b> vídeo feito para gerar comentário (ex.: “cabe literalmente tudo”). Viraliza, mas chegam comentários chatos.",
          "<b>Antes e depois:</b> prova visual. Ótimo para casa.",
          "<b>Respondendo comentário:</b> grava um vídeo novo a partir de uma dúvida.",
          "<b>Dica de ouro:</b> grave o mesmo produto em vários formatos, veja qual entregou mais e repita esse formato com outros ganchos."]))) +
      sec("🕵️", "Espionar os campeões", "de onde tirar ideia sem copiar",
        card(ul(["<b>Lupa do TikTok:</b> digite o produto › Vídeos. Veja gancho, legenda, hashtags e música de quem bombou.",
          "<b>Na loja do TikTok:</b> abra o produto › “Aprender com criadores” (os vídeos que mais venderam).",
          "<b>Produto parecido também vale:</b> pegue a ideia de outro organizador ou outra luminária e traga para o seu.",
          "<b>Kalodata</b> (kalodata.com): mostra produtos e vídeos que mais vendem no TikTok Shop. Tem uso grátis limitado. Dica da aula: produto <b>em crescimento</b> (ainda não no topo) é ótima aposta.",
          "<b>Modele, não copie:</b> faça a sua versão, com a sua casa e o seu estilo."]))) +
      sec("💸", "Vendedor impulsionar seu vídeo", "TikTok Shop: mais alcance",
        card(ul(["O vendedor pode pagar anúncio em cima do <b>seu</b> vídeo. Você ganha alcance e o perfil todo passa a entregar mais.",
          "Mas a <b>comissão cai</b> nas vendas do anúncio (ex.: de 10% para 3%). Veja em Central do criador › Mercado de produtos › produto › “Exibir várias fontes de receita”.",
          "Mande mensagem só para vendedor de produto que você <b>já tem vários vídeos</b>: produto › “Colabore com este vendedor” › Entrar em contato.",
          "<b>Código do vídeo:</b> no vídeo › ⋯ › Configurações de anúncio › ligue “Autorização de anúncio” (pode pôr 365 dias) › Salvar › Gerenciar › copiar código.",
          "⚠️ Deixe <b>“Alterações no link” DESLIGADO</b>. Senão o vendedor pode trocar o produto do seu vídeo.",
          "Para saber se veio de anúncio: Central do criador › Receita › pedidos com “Anúncio de loja”."])) +
        card('<div class="meta"><span class="tag casa">Mensagem para o vendedor</span></div><div class="say">' + esc(MSG_VENDEDOR) + '</div><div class="actions">' + cp(MSG_VENDEDOR) + '</div>')) +
      sec("🛍️", "Shopee Vídeo: estratégias novas", "o que testar e o que não fazer",
        card(ul(["✅ <b>Fixar e desfixar:</b> fixe até 3 vídeos (⋯ › Fixar). Troque de 20 em 20 minutos quando lembrar, pegando os vídeos com menos views lá de baixo.",
          "✅ <b>Rolar o seu feed:</b> vá até o seu primeiro vídeo e role todos até o último, como no Instagram. Ajuda a Shopee a voltar a entregar os vídeos antigos.",
          "✅ <b>Ranking:</b> no produto › Compartilhar › faixinha amarela › “Aprender com criadores”. São grupos de 6 vídeos. Produto com ranking de 2 a 3 mil views é mais fácil de entrar.",
          "⚠️ <b>Curtir 5x, compartilhar 5x e pôr no carrinho o próprio vídeo:</b> a aula ensina, mas com as penalidades que você já tem eu <b>não faria</b>.",
          "🚫 <b>Deixar o vídeo rodando em outro celular para subir views:</b> a própria professora teve vídeo apagado por isso e avisa que pode banir. <b>Não fazer.</b>",
          "Lembrete da aula: <b>view não é venda</b>. O que vende é produto certo + vídeo bom + constância."]))) +
      sec("📸", "Instagram: o que serve para você", "da aula de engajamento",
        card(ul(["<b>Dicas de casa</b> e carrossel engajam muito e combinam com o seu nicho. O mesmo carrossel do TikTok pode ir para o Instagram.",
          "Carrossel curto: capa + 4 ou 5 fotos + CTA. Um por dia já basta.",
          "Atraia <b>quem compra</b>, não outras afiliadas: legenda e hashtags do assunto (casa, decoração), não de “achadinhos”.",
          "Responder o “eu quero” <b>na hora</b> vende muito mais (compra é emoção). Uma resposta automática ajuda. Ela indica o Insta Ninja, que é pago, então fica só como ideia.",
          "Deixei de fora: página de memes e repostar receita de perfil gringo, porque fogem do seu estilo autoral."]))) +
      '<p class="why" style="margin:6px 4px 14px">Ainda não li em detalhe as 2 aulas ao vivo longas (Collab no Instagram e Lotar grupos com TikTok) nem Shopee Live. Peça quando quiser.</p>';
  }

  const antigo = window.renderCurso;
  window.renderCurso = renderCurso = function(){
    antigo();
    const box = $("cursoBox"); if (!box) return;
    const div = document.createElement("div"); div.id = "c2"; div.innerHTML = blocoNovo();
    box.insertBefore(div, box.firstChild);
  };
  document.addEventListener("click", e => {
    const q = s => e.target.closest(s);
    if (q("[data-c2copy]")) { copyText(C2[Number(q("[data-c2copy]").dataset.c2copy)]); return; }
    if (q("[data-c2limpa]")) { state.c2ck = {}; save(); renderCurso(); return; }
    if (q("[data-c2seo]")) {
      const p = $("c2prod").value.trim(), c = $("c2car").value.trim(); if (!p) { toast("Escreva o produto."); return; }
      state.c2seo = {p, c, res: montaSeo(p, c)}; save();
      $("c2seoRes").innerHTML = seoRes(state.c2seo.res); return;
    }
  });
  document.addEventListener("change", e => { const c = e.target.closest("[data-c2ck]"); if (!c) return; state.c2ck = state.c2ck || {}; state.c2ck[c.dataset.c2ck] = c.checked; save(); });
})();
