// Daia Studio v46 — 🎠 TikTok de carrosséis para encher o grupo VIP (pedido da Daia em 18/11/2026).
// Baseado no curso (Estratégias virais › TikTok e a aula "Carrosséis com IA" da Gi Torres):
// conta nova só de carrossel, fotos autorais e realistas com a mesma estética, gancho na capa,
// CTA discreta no fim, resposta "te mandei na DM" e o link do grupo no direct.
// Os kits usam os carrosséis da planilha (App - Prontos / App - Itens).

const TTG_GANCHOS = [
  "Produtos que ninguém te conta, mas saem da Shopee",
  "Achadinhos que deixaram minha casa com cara de rica",
  "Coisas que eu compraria de novo sem pensar",
  "Parece caro, mas é achadinho",
  "Todo mundo pergunta onde eu comprei isso",
  "Se você ama casa arrumada, salva isso",
  "Minha casa era sem graça até eu achar isso",
  "O que tem na casa de quem ama decoração"
];
const TTG_ESTETICA = "casa brasileira clara e aconchegante, tons creme e bege, madeira clara, detalhes dourados, plantas, luz natural de fim de tarde";
const TTG_TAGS = "#achadinhos #casadecorada #decoracao #casaorganizada #achadinhosdecasa #grupovip #promocao #descontos";
const ttgPrompt = n => "Vou anexar a foto de um produto. Crie uma FOTO REALISTA, vertical 9:16, desse mesmo produto (" + n + ") dentro de uma casa de verdade: " + TTG_ESTETICA +
  ". Parece foto de celular tirada na minha casa. Mantenha o produto IGUAL ao da foto (cor, formato e tamanho real, sem aumentar). Sem pessoas, sem texto, sem logo, sem marca d'água. Não pode parecer imagem de IA.";
const ttgComent = ["Te mandei na DM, amiga! 💌", "Mandei no seu direct! Confere lá 🥰", "Prontinho, linda! Tá na sua DM 💖", "Te enviei no privado! ✨"];
const ttgDM = () => [
  "Oii! 🥰 Os links e os cupons desses achadinhos eu mando no meu grupo VIP de promoções 🛍️\n\nCopia essa mensagem e cola numa conversa do WhatsApp (pode ser com você mesma) que o link fica clicável:\n" + LINK_VIP + "\n\nLá todo dia tem oferta com desconto 💕",
  "Oi, amiga! 💖 Tudo que eu mostro eu solto no meu grupo VIP no WhatsApp, com cupom 🎟️\n\nCola essa mensagem no seu WhatsApp pra conseguir tocar no link:\n" + LINK_VIP + "\n\nTe espero lá! ✨",
  "Oii, linda! 😍 Os achadinhos com desconto ficam no meu grupo VIP 🛍️\n\nPara entrar: copia e cola essa mensagem no WhatsApp que o link fica azul:\n" + LINK_VIP + "\n\nQualquer coisa me chama! 🥰"
];
const TTG_FECHADO = "Amiga, não consegui te mandar na DM 🥺 Me manda um oi lá que eu te envio! 💌";

function ttgKits(){ return PR.filter(p => p.tipo === "achados" && p.itens && p.itens.length); }
function ttgKit(p, i){
  const feito = (state.ttg || {})[p.id];
  const gancho = (p.c1 + " " + p.c2).replace(/\s+/g, " ").trim();
  const alt = [TTG_GANCHOS[i % TTG_GANCHOS.length], TTG_GANCHOS[(i + 3) % TTG_GANCHOS.length]];
  const slides = p.itens.map((it, k) => (k + 1) + ". " + it[0]);
  return '<article class="card ttg-kit' + (feito ? ' done' : '') + '" data-ttg="' + esc(p.id) + '">' +
    '<div class="pr-head"><img class="pr-cover" src="' + esc(p.capa || "c-" + p.id + ".jpg") + '" loading="lazy" alt=""><div class="info">' +
      '<h3 class="title" style="font-size:18px">' + esc(gancho) + '</h3><p class="note">' + (p.itens.length + 2) + ' imagens' + (feito ? ' · <b>postado ✓</b>' : '') + '</p></div></div>' +
    '<details class="cr-bloco"><summary class="cr-tit"><b>Ver o carrossel</b></summary>' +
      '<ol class="script"><li><b>Capa</b> (foto bonita, escurecida): “' + esc(gancho) + '”<br><small>Outros ganchos: “' + esc(alt[0]) + '” · “' + esc(alt[1]) + '”</small></li>' +
      p.itens.map((it, k) => '<li>Foto do <b>' + esc(it[0]) + '</b> com o texto “' + esc(slides[k]) + '”</li>').join("") +
      '<li><b>Último card</b>: “Tudo isso eu encontrei no meu grupo VIP 🤍”</li></ol>' +
      '<div class="actions"><button class="btn wine" data-ttga="fotos">🖼️ Baixar as fotos</button><button class="btn" data-ttga="slides">📋 Textos das fotos</button><button class="btn" data-ttga="leg">📋 Legenda</button><button class="btn" data-ttga="ia">✨ Pedidos para a IA</button>' +
      '<button class="btn" data-ttga="feito">' + (feito ? 'Postado ✓' : 'Marcar como postado') + '</button></div>' +
      '<p class="why">As fotos são do pack que você comprou. Fica ainda melhor com foto sua ou criada pela IA a partir do produto (“✨ Pedidos para a IA”): o TikTok entrega mais foto autoral.</p>' +
    '</details></article>';
}
function paginaTTG(){
  const kits = ttgKits(), copia = (t, rot) => { COPY.push(t); return '<button class="btn" data-copy="' + (COPY.length - 1) + '">' + rot + '</button>'; };
  return '<details class="secao" open><summary><span class="sec-emoji">🧭</span><span class="sec-txt"><b>Como funciona</b><small>o que o curso ensina, resumido</small></span><span class="sec-seta"></span></summary><div class="sec-corpo"><article class="card"><ol class="script">' +
      '<li><b>Conta nova, só de carrossel.</b> A @daledaia continua com os vídeos do TikTok Shop. Misturar vídeo e carrossel na mesma conta entrega menos.</li>' +
      '<li><b>Não siga perfis de afiliadas</b> nem divulgue essa conta para elas: o TikTok passa a mostrar seus posts só para afiliadas, e não para quem compra.</li>' +
      '<li><b>Fotos bonitas e reais</b>, todas com a mesma cara, como se fossem da mesma casa. Melhor ainda: fotos suas ou feitas pela IA a partir da foto do produto. <b>Nada do Pinterest.</b></li>' +
      '<li><b>6 a 9 fotos.</b> Capa escurecida com um gancho escrito com a fonte do próprio TikTok (com sombra). Em cada foto, o nome do produto.</li>' +
      '<li><b>Preço:</b> coloque o preço de hoje na Shopee, ou não coloque nada (gera mais comentário: a pessoa pergunta). Não invente preço mais baixo.</li>' +
      '<li><b>Último card e legenda:</b> chamada discreta, “tudo encontrei no grupo VIP”. Não pareça propaganda.</li>' +
      '<li><b>Som em alta</b> (a primeira aba de sons do TikTok) e 5 a 8 hashtags.</li>' +
      '<li><b>Comentou?</b> Responda “te mandei na DM” e mande o link do grupo no direct. Nunca deixe o link nos comentários: assim a próxima pessoa também comenta e o post cresce.</li>' +
      '<li><b>1 a 3 carrosséis por dia.</b> Teste 12h e 16h. Pode repetir fotos que deram certo.</li>' +
      '<li><b>Paciência:</b> uma aluna postou 2 por dia por 3 meses, até um viralizar com 1 milhão de views e lotar 10 grupos.</li></ol></article></div></details>' +
    '<details class="secao"><summary><span class="sec-emoji">📱</span><span class="sec-txt"><b>Criar a conta</b><small>uma vez só</small></span><span class="sec-seta"></span></summary><div class="sec-corpo"><article class="card"><ol class="script">' +
      '<li>No TikTok: seu perfil › nome em cima › <b>Adicionar conta</b> › Criar conta. Use um e-mail só para ela.</li>' +
      '<li>Nome e @: escolha um dos nomes que o Claude te sugeriu (você só pode trocar a cada 30 dias).</li>' +
      '<li>Bio (o link só entra com 1.000 seguidores): <b class="sel">Os achadinhos mais lindos pra sua casa 🏡 Link do grupo VIP nos comentários 💌</b></li>' +
      '<li>Foto: uma logo simples (pode ser a mesma da Dale Daia).</li>' +
      '<li>Se aparecer “sincronizar contatos” ou “encontrar amigos”: <b>Não permitir</b>.</li></ol></article></div></details>' +
    '<details class="secao"><summary><span class="sec-emoji">💬</span><span class="sec-txt"><b>Respostas</b><small>comentário e direct</small></span><span class="sec-seta"></span></summary><div class="sec-corpo"><article class="card">' +
      '<p class="how"><b>No comentário</b> (vá trocando, o TikTok bloqueia mensagem sempre igual):</p><div class="actions">' + ttgComent.map((t, i) => copia(t, "Opção " + (i + 1))).join("") + '</div>' +
      '<p class="how"><b>No direct</b> (com o link do grupo):</p><div class="actions">' + ttgDM().map((t, i) => copia(t, "Direct " + (i + 1))).join("") + '</div>' +
      '<p class="how"><b>Perfil fechado</b> (não dá para mandar DM):</p><div class="actions">' + copia(TTG_FECHADO, "Pedir um oi") + '</div>' +
      '<p class="why">Mandou muitas iguais seguidas? Troque um emoji ou uma palavra e espere um pouco entre uma e outra.</p></article></div></details>' +
    '<h2>🎠 Carrosséis prontos · ' + kits.length + '</h2><p class="note">Cada um já tem gancho, ordem das fotos, textos, legenda e chamada. Em cada foto, escreva o texto pelo próprio TikTok (Texto › fonte com sombra).</p>' +
    '<div class="list">' + kits.map(ttgKit).join("") + '</div>';
}
async function ttgFotos(p){
  const urls = [p.capa || "c-" + p.id + ".jpg"].concat(p.itens.map((it, i) => it[3] || "p-" + p.id + "-" + (i + 1) + ".jpg"));
  toast("Preparando as fotos…");
  try {
    const files = await Promise.all(urls.map(async (u, i) => { const b = await (await fetch(u)).blob(); return new File([b], p.id + "-" + (i === 0 ? "capa" : i) + ".jpg", {type: b.type || "image/jpeg"}); }));
    if (navigator.canShare && navigator.canShare({files})) { await navigator.share({files}); return; }
    files.forEach(f => { const a = document.createElement("a"); a.href = URL.createObjectURL(f); a.download = f.name; a.click(); });
    toast("Fotos salvas. A capa é a primeira.");
  } catch(e) { if (!e || e.name !== "AbortError") toast("Não consegui baixar. Tente de novo com internet."); }
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-ttga]"), card = e.target.closest("[data-ttg]"); if (!b || !card) return;
  const p = PR.find(x => x.id === card.dataset.ttg); if (!p) return;
  const a = b.dataset.ttga;
  if (a === "fotos") ttgFotos(p);
  if (a === "slides") copyText([(p.c1 + " " + p.c2).trim()].concat(p.itens.map((it, k) => (k + 1) + ". " + it[0])).concat(["Tudo isso eu encontrei no meu grupo VIP 🤍"]).join("\n"));
  if (a === "leg") copyText("Tudo encontrei no grupo VIP 🤍 Quer os links? Comenta QUERO que eu te mando 💌\n\n" + TTG_TAGS);
  if (a === "ia") copyText(p.itens.map((it, k) => "FOTO " + (k + 1) + " (" + it[0] + "):\n" + ttgPrompt(it[0])).join("\n\n"));
  if (a === "feito") { state.ttg = state.ttg || {}; if (state.ttg[p.id]) delete state.ttg[p.id]; else state.ttg[p.id] = todayKey; save(); renderPagina(); }
});

// página dentro do app (botão no topo de Criar › Prontos e em ⚙️ Ajustes)
const renderPaginaTTG = renderPagina;
renderPagina = function(){
  if (paginaAtual !== "ttgrupo") return renderPaginaTTG();
  COPY = [];
  $("pagTit").innerHTML = 'TikTok <em>do grupo</em>'; $("pagSub").textContent = "Carrosséis para levar gente do TikTok para o seu grupo VIP.";
  $("pagBox").innerHTML = paginaTTG();
};
const renderProntosTTG = renderProntos;
renderProntos = async function(){
  await renderProntosTTG();
  const box = $("prontoList"); if (!box || box.querySelector(".ttg-ir")) return;
  box.insertAdjacentHTML("afterbegin", '<button type="button" class="aj-bt ttg-ir" data-pagina="ttgrupo" style="margin-bottom:12px"><span>🎠</span><div><b>TikTok do grupo VIP</b><small>carrosséis prontos para levar gente para o seu grupo</small></div></button>');
};
const renderAjustesTTG = renderAjustes;
renderAjustes = function(){
  renderAjustesTTG();
  $("ajBox").insertAdjacentHTML("afterbegin", '<button type="button" class="aj-bt" data-pagina="ttgrupo"><span>🎠</span><div><b>TikTok do grupo VIP</b><small>carrosséis prontos para levar gente para o seu grupo</small></div></button>');
};
try { if (!$("tab-pagina").hidden && paginaAtual === "ttgrupo") renderPagina(); } catch(_) {}
