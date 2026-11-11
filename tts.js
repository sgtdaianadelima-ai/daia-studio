// Daia Studio v36 — TikTok Shop @daledaia: cronograma de 10 vídeos por dia (pedido da Daia em 09/11/2026, 1.000 seguidores).
// Cada dia: 3 vídeos reciclados da @daiana.lima95 (com gancho novo), 5 vídeos de produto (60x60) e 2 vídeos novos.
// Horários espaçados (o curso manda não soltar tudo de uma vez).

const TTS_HORAS = ["8h", "9h30", "11h", "12h30", "14h", "15h30", "17h", "18h30", "20h", "21h30"];
const TTS_TIPOS = ["recicla", "produto", "produto", "recicla", "produto", "produto", "novo", "recicla", "produto", "novo"];
// os 20 vídeos públicos da @daiana.lima95 (views em 09/11), do mais visto ao menos visto, com gancho novo para a @daledaia
const TTS_RECICLA = [
  ["A menininha que sonhava com uma árvore assim (7/11 · 530 views)", "Eu nunca tive uma árvore assim quando criança…", "A menininha que sonhava com essa árvore hoje tem a sua 🥹🎄 Qual era a sua árvore dos sonhos? 👇 #arvoredenatal #natal2026 #decoracaodenatal"],
  ["Vídeo de 10/10 sem legenda (21 s · 428 views)", "Olha o que eu fiz com quase nada…", "Feito em casa, com quase nada ✨ Salva pra fazer o seu! #natal2026 #diy #decoracaodenatal"],
  ["Meu super poder é transformar isso nisso (4/11 · 384 views)", "Antes x depois: minha árvore xoxa virou isso", "Meu super poder é transformar isso nisso ✨🎄 Salva pra se inspirar! #antesedepois #arvoredenatal #natal2026"],
  ["A árvore xoxa entrou na trend (10/10 · 355 views)", "Minha árvore era xoxa… até hoje", "A árvore xoxa entrou na trend 😂🎄 Espera a transição! #arvoredenatal #transicao #natal2026"],
  ["Operação Natal ep. 5: bolas de veludo (6/11 · 271 views)", "Bola de Natal de veludo com o que sobrou do laço", "Bolas de veludo com o que sobrou 😍 Ficaram chiques demais! #bolasdenatal #veludo #natal2026"],
  ["vamos gastar fofinha? (5/11 · 240 views)", "Vamos gastar, fofinha? 🛍️", "Vamos gastar, fofinha? 🎄🛍️ #comprinhas #natal #achadinhos"],
  ["Operação Natal ep. 4: base com casca de pinus (4/11 · 239 views)", "A base da árvore que todo mundo pergunta", "Base de árvore com casca de pinus, feita por mim 🎄 #basedearvore #arvoredenatal #natal2026"],
  ["1º de novembro e a árvore pronta (1/11 · 228 views)", "Árvore pronta antes de todo mundo 🎄", "1º de novembro e a árvore já tá pronta ✨ Time Natal antecipado? #arvoredenatal #natal2026"],
  ["Trend do biscoito / CapCut (11/10 · 213 views)", "(mantenha a trend como está, só troque a capa)", "#biscoitocut #capcut #natal"],
  ["O festão que usei (26/10 · 201 views)", "O festão que deixou minha árvore cheia", "O segredo da árvore cheia: o festão 🎄 #festao #arvoredenatal #natal2026"],
  ["O melhor momento do dia é quando escurece (3/11 · 197 views)", "O melhor momento do meu dia ✨", "Quando escurece e eu acendo a árvore… ✨🎄 #arvoredenatal #aconchego #natal2026"],
  ["Um pedaço de veludo e… (7/11 · 188 views)", "Um pedaço de veludo e…", "Um pedaço de veludo e… ✨ #arvoredenatal #antesedepois #natal2026"],
  ["Vem acompanhar as decorações (28/10 · 183 views)", "Vem decorar o Natal comigo 🎄", "Vem comigo decorar a casa toda pro Natal 🎄 #natal2026 #decoracaodenatal"],
  ["Minha árvore era falhada até descobrir isso (27/10 · 182 views)", "Minha árvore era falhada até eu descobrir isso 👀", "O truque da árvore cheia 👀🎄 Salva! #arvoredenatal #dica #natal2026"],
  ["Maxi laço · Operação Natal ep. 3 (30/10 · 175 views)", "Maxi laço de loja… feito em casa", "Maxi laço feito por mim 🎀🎄 #maxilaco #laconatal #natal2026"],
  ["O maxi laço dos sonhos (29/10 · 174 views)", "O laço dos sonhos, feito por mim 🎀", "O laço dos sonhos 🎀 Quem aí quer o passo a passo? #maxilaco #natal2026"],
  ["Laço de loja feito em casa (31/10 · 169 views)", "Laço de loja feito em casa 🎀", "Laço de loja feito em casa 🎀🎄 (sem falar valor no TikTok Shop) #laconatal #diy #natal2026"],
  ["Vídeo de 10/10 sem legenda (57 s · 146 views)", "Corte para uns 20 s e comece pelo melhor momento", "✨🎄 #natal2026 #decoracaodenatal"],
  ["Base de árvore: loja ou feita em casa (4/11 · 101 views)", "Base de árvore de loja ou feita em casa?", "Loja ou feita em casa? 👇🎄 (tire o valor do texto: TikTok Shop não aceita preço) #basedearvore #natal2026"],
  ["Caixas de presente com palito de churrasco (8/11 · 22 views)", "Caixa de presente com palito de churrasco 🎁", "Caixas de presente com palito de churrasco 🎁✨ Simples e lindas! #caixadepresente #diy #natal2026"]
];
const TTS_INICIO = "2026-11-09";
function ttsDia(k){ return Math.round((fromKey(k) - fromKey(TTS_INICIO)) / 864e5); }
function ttsSlots(k){
  const d = ttsDia(k); if (d < 0) return [];
  const prods = ((state.tts && state.tts.produtos) || []).filter(p => p.n);
  let r = 0, p = 0;
  return TTS_HORAS.map((h, i) => {
    const tipo = TTS_TIPOS[i];
    if (tipo === "recicla") { const v = TTS_RECICLA[(d * 3 + r++) % TTS_RECICLA.length]; return {h, tipo, t: v[0], g: v[1], leg: v[2]}; }
    if (tipo === "produto") {
      const idx = d * 5 + p++, f = FORMATOS_10[idx % FORMATOS_10.length];
      const prod = prods.length ? prods[Math.floor(idx / 1) % prods.length].n : "";
      return {h, tipo, t: prod ? prod + " · " + f[0] : "Produto · " + f[0], g: f[1].replace(/\{p\}/g, prod || "o produto"), leg: "", sem: !prod};
    }
    return {h, tipo, t: i === 6 ? "Garotas Apoiam Garotas (até os 2 mil)" : "Vídeo novo: Assunto da vez ou trend", g: i === 6 ? "Use a trend com algo da sua casa ao fundo (árvore, cantinho decorado) para atrair quem gosta de casa. Depois dos 2 mil, este horário vira produto." : "Grave 1 dos 3 vídeos do Assunto da vez (tela Hoje), ou uma trend de casa e decoração.", leg: i === 6 ? "Apoio todas! 💝 Bora crescer juntas? #garotasapoiamgarotas #casadecorada #natal2026" : ""};
  });
}
const TTS_COR = {recicla: ["casa", "♻️ Reciclar"], produto: ["serie", "🛍️ Produto"], novo: ["trend", "✨ Novo"]};
function ttsSecao(){
  const k = cur, ss = ttsSlots(k); if (!ss.length) return "";
  const feito = (state.ttsFeito || {})[k] || {}, n = Object.keys(feito).length;
  const semProd = ss.some(s => s.sem);
  const corpo = '<article class="card"><p class="how"><b>@daledaia · 10 vídeos hoje.</b> 3 reciclados da @daiana.lima95 (com gancho novo), 5 de produto e 2 novos. Solte no horário, um de cada vez.</p>' +
    '<p class="meta-falta">🔁 Os 5 de produto alternam entre os seus produtos (não 10 do mesmo). Na semana, cada produto ganha uns 6 a 10 vídeos. O que vender, grave mais 10.</p>' + (semProd ? '<p class="meta-falta">🛍️ Coloque os seus produtos em ⚙️ Ajustes › TikTok Shop › Meus produtos para gravar (os que você tem em casa e que existem no TikTok Shop). Aí o nome aparece aqui.</p>' : '') +
    '<details class="cr-bloco"><summary class="cr-tit"><b>⚠️ Antes de reciclar (leia 1 vez)</b></summary><ul class="script">' +
      '<li>O TikTok pune vídeo <b>igual</b> em 2 contas. Na @daiana.lima95, se tiver TikTok Shop: Central do criador › Integridade da conta › <b>Ferramenta de autorização de conteúdo</b> › autorize a @daledaia (até 5 contas). Sem isso, <b>edite</b> cada vídeo: gancho novo nos 3 primeiros segundos, outra música, corte diferente.</li>' +
      '<li>Nada de preço no vídeo nem na legenda.</li>' +
      '<li>Produto no carrinho só se for <b>igual</b> ao do vídeo. Sem produto igual? Poste sem link: ajuda a crescer.</li>' +
      '<li>Esqueceu o produto? Central do criador › Vídeos › Vincular produto (não precisa apagar).</li>' +
      '<li>Música em alta: primeiro adicione o produto, depois troque o som.</li>' +
      '<li>Nunca apague vídeo que foi mal. Vídeos do Garotas Apoiam Garotas: pode deixar privado (Configurações › Gerenciar publicações).</li></ul></details></article>' +
    ss.map((s, i) => {
      const ok = !!feito[i], c = TTS_COR[s.tipo];
      COPY.push(s.leg || ""); const ci = COPY.length - 1;
      return '<article class="card tts-slot' + (ok ? ' done' : '') + '"><div class="meta"><span>' + esc(s.h) + '</span><span class="tag ' + c[0] + '">' + c[1] + '</span></div>' +
        '<h3 class="title">' + esc(s.t) + '</h3>' + (s.g ? '<div class="say"><small>Gancho</small>' + esc(s.g) + '</div>' : '') +
        '<div class="actions"><button class="btn main" data-ttsok="' + i + '">' + (ok ? 'Postado ✓' : 'Marcar como postado') + '</button>' + (s.leg ? '<button class="btn" data-copy="' + ci + '">Copiar legenda</button>' : '') + '</div></article>';
    }).join("");
  return secao("tts", "🛍️", "TikTok Shop · 10 por dia", "@daledaia · " + (k === todayKey ? "hoje" : fmtDay(k, {weekday: "long"})), n + "/10", n >= 10, corpo);
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-ttsok]"); if (!b || !e.target.closest("#cards")) return;
  state.ttsFeito = state.ttsFeito || {}; const d = state.ttsFeito[cur] = state.ttsFeito[cur] || {};
  const i = b.dataset.ttsok; if (d[i]) delete d[i]; else d[i] = 1; save(); renderHoje();
});
// meta do TikTok sobe para 10 por dia e conta os vídeos marcados aqui
(function(){ const m = METAS.find(x => x.id === "tiktok"); if (m) m.n = 10; })();
const metaDoDia35 = metaDoDia;
metaDoDia = function(posts, feitosPlano, iaFeitos, prDone){
  const m = metaDoDia35(posts, feitosPlano, iaFeitos, prDone), n = Object.keys((state.ttsFeito || {})[todayKey] || {}).length;
  m.linhas.forEach(l => { if (l.id === "tiktok") l.feito = Math.min(l.n, Math.max(l.feito, n)); });
  m.total = m.linhas.reduce((s, l) => s + l.n, 0); m.feitos = m.linhas.reduce((s, l) => s + l.feito, 0);
  return m;
};
// a seção entra logo depois do Assunto da vez
const assuntoSecao35 = assuntoSecao;
assuntoSecao = function(){ return ttsSecao() + assuntoSecao35(); };
try { if (!$("tab-hoje").hidden) renderHoje(); } catch(_) {}

// ---------- Faça agora: primeiro o próximo vídeo do TikTok Shop (o mais atrasado, senão o próximo horário) ----------
const facaAgora36 = facaAgoraCard;
facaAgoraCard = function(posts, meta){
  const ss = ttsSlots(todayKey), feito = (state.ttsFeito || {})[todayKey] || {};
  const agora = new Date().getHours() * 60 + new Date().getMinutes();
  const pend = ss.map((s, i) => ({s, i, m: minDe(s.h)})).filter(x => !feito[x.i]);
  const alvo = pend.filter(x => x.m !== null && x.m <= agora)[0] || pend[0];
  if (alvo) {
    const atras = pend.filter(x => x.m !== null && x.m <= agora).length;
    return '<article class="card faca"><div class="meta"><span class="tag">✨ Faça agora</span><span class="why">TikTok Shop · ' + esc(alvo.s.h) + (atras > 1 ? ' · mais ' + (atras - 1) + ' atrasado' + (atras > 2 ? 's' : '') : '') + '</span></div>' +
      '<h3 class="title">' + esc(alvo.s.t) + '</h3>' + (alvo.s.g ? '<p class="how">“' + esc(alvo.s.g) + '”</p>' : '') +
      '<div class="actions"><button class="btn" data-facasec="tts">Ver os 10 de hoje</button></div></article>';
  }
  return facaAgora36(posts, meta);
};
