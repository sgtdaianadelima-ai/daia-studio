/**
 * Robô "Vídeo IA do dia" — Dale Daia
 * Todo dia escolhe 3 produtos da Shopee com boa comissão e escreve na aba "Vídeos":
 * link de afiliada, foto, pedido para a IA (YouTube Create), legenda e hashtags.
 * A Senha da API fica em Configurações do projeto > Propriedades do script > SHOPEE_SENHA.
 */
const APP_ID = '18302700711';
const API = 'https://open-api.affiliate.shopee.com.br/graphql';
const ABA = 'Vídeos';
const POR_DIA = 3;
const COMISSAO_MIN = 0.10;
const VENDAS_MIN = 20;

// Temas que vão alternando a cada dia
const TEMAS = [
  {busca: 'decoração de natal', cena: 'sala aconchegante decorada para o Natal, árvore iluminada ao fundo', tags: '#decoracaodenatal #natal2026'},
  {busca: 'mesa posta natal', cena: 'mesa de jantar de Natal elegante com velas acesas e pisca-pisca desfocado', tags: '#mesaposta #natal2026'},
  {busca: 'enfeite árvore de natal', cena: 'árvore de Natal iluminada à noite, bolas vermelhas e douradas', tags: '#arvoredenatal #enfeitesdenatal'},
  {busca: 'organizador cozinha', cena: 'cozinha clara e organizada, bancada de madeira, luz natural da manhã', tags: '#cozinhaorganizada #organizacao'},
  {busca: 'decoração sala', cena: 'sala bege e aconchegante, sofá com manta, plantas e luz quente', tags: '#decoracao #casadecorada'},
  {busca: 'banheiro organização', cena: 'banheiro com cara de hotel, toalhas brancas e luz suave', tags: '#banheirodecorado #organizacao'},
  {busca: 'utilidades casa', cena: 'casa clean e aconchegante, mãos femininas usando o produto no dia a dia', tags: '#utilidades #achadinhos'},
  {busca: 'luminária decorativa', cena: 'quarto aconchegante à noite, só com luz quente', tags: '#iluminacao #quartoaconchegante'},
  {busca: 'quarto aconchegante', cena: 'quarto com cama em camadas, cortina de linho e abajur aceso', tags: '#quartoaconchegante #decoracao'},
  {busca: 'lavanderia organização', cena: 'lavanderia pequena e organizada, cestos iguais e luz natural', tags: '#lavanderia #casaorganizada'}
];

// Nota de "oportunidade": comissão boa + vende bem, mas sem ser campeão de vendas
// (produto campeão costuma ter afiliados demais divulgando, e o seu vídeo aparece menos).
function oportunidade_(p) {
  const c = Math.min(Number(p.commissionRate) || 0, 0.25), s = Number(p.sales) || 0, r = Number(p.ratingStar) || 0;
  if (c < COMISSAO_MIN || s < 100 || (r && r < 4.5) || !p.imageUrl) return -1;
  // vendas: o ponto ideal fica entre ~500 e ~3 mil vendidos (já provou que vende, mas ainda não está "estourado")
  const ls = Math.log10(s);                                  // 100 = 2 · 500 = 2,7 · 3 mil = 3,5 · 10 mil = 4
  const vendas = ls < 2.7 ? 2.7 - (2.7 - ls) * 2 : ls <= 3.5 ? ls : 3.5 - (ls - 3.5) * 1.5;
  // comissão ajuda, mas pesa menos que as vendas (comissão alta demais costuma ser produto que não vende)
  return vendas + c * 10 + (r ? (r - 4.5) * 2 : 0) + Math.min(Number(p.priceDiscountRate) || 0, 50) / 50;
}
const resumo_ = p => ({n: nomeCurto_(p.productName), preco: 'R$ ' + Number(p.priceMin).toFixed(2).replace('.', ','), com: (Number(p.commissionRate) * 100).toFixed(1).replace('.', ',') + '%', vendas: String(p.sales), nota: p.ratingStar ? Number(p.ratingStar).toFixed(1) : '', link: p.offerLink, foto: p.imageUrl, id: String(p.itemId)});

function videoIaDoDia() {
  const senha = PropertiesService.getScriptProperties().getProperty('SHOPEE_SENHA');
  if (!senha) throw new Error('Falta a Senha da API: Configurações do projeto > Propriedades do script > SHOPEE_SENHA');
  const aba = SpreadsheetApp.getActive().getSheetByName(ABA);
  garantirCabecalho_(aba);
  const ja = new Set(aba.getRange(2, 2, Math.max(1, aba.getLastRow() - 1), 1).getValues().flat().map(String));
  const ids = new Set(aba.getRange(2, 12, Math.max(1, aba.getLastRow() - 1), 1).getValues().flat().map(String));
  // roda às 22h e já prepara os produtos de AMANHÃ (a tarefa da meia-noite pega as fotos e as cores)
  const alvo = new Date(Date.now() + (Number(Utilities.formatDate(new Date(), TZ, 'H')) >= 18 ? 864e5 : 0));
  const dia = Math.floor(alvo.getTime() / 86400000), data = Utilities.formatDate(alvo, TZ, 'dd/MM/yyyy');
  if (aba.getLastRow() > 1 && aba.getRange(2, 1, aba.getLastRow() - 1, 1).getDisplayValues().flat().filter(d => d === data).length >= POR_DIA) return 0;
  const linhas = [];
  for (let t = 0; t < TEMAS.length && linhas.length < POR_DIA; t++) {
    const tema = TEMAS[(dia * POR_DIA + t) % TEMAS.length];
    const vistos = {}, lista = [];
    [2, 5, 1].forEach(ordem => { try { buscar_(tema.busca, senha, ordem).forEach(p => { if (!vistos[p.itemId]) { vistos[p.itemId] = 1; lista.push(p); } }); } catch (e) {} });
    const bons = lista.filter(p => !ids.has(String(p.itemId)) && !ja.has(nomeCurto_(p.productName)) && oportunidade_(p) > 0)
      .sort((a, b) => oportunidade_(b) - oportunidade_(a));
    const p = bons[0];
    if (!p) continue;
    ids.add(String(p.itemId));
    const nome = nomeCurto_(p.productName);
    const opcoes = bons.slice(1, 4).map(resumo_);
    linhas.push([
      data, nome, 'R$ ' + Number(p.priceMin).toFixed(2).replace('.', ','), (Number(p.commissionRate) * 100).toFixed(1).replace('.', ',') + '%',
      String(p.sales), p.offerLink,
      pedidoVideo_(tema.cena, nome),
      nome + ' com cara de casa de revista 🤍 Achado da Shopee com ótimo preço. Toca no produto aqui embaixo!',
      tema.tags + ' #achadinhosshopee #shopeevideo #casa',
      'Não', p.imageUrl, String(p.itemId), pedidoFoto_(tema.cena, nome), JSON.stringify(opcoes), '', ''
    ]);
  }
  if (linhas.length) aba.getRange(aba.getLastRow() + 1, 1, linhas.length, 16).setValues(linhas).setWrap(false);
  return linhas.length;
}

// Passo 1 (ChatGPT): transformar a foto do anúncio numa foto bonita e realista
function pedidoFoto_(cena, nome) {
  return 'Use a foto do produto que enviei. Crie uma foto ultrarrealista em 4K, formato vertical 9:16 (tamanho de story), sem cara de IA, como se fosse tirada com celular numa casa de verdade: ' + cena +
    '. O produto (' + nome + ') tem que ficar IGUAL ao da foto, mesma cor, formato e detalhes, em destaque no centro. Luz natural e quente, estilo Pinterest. Sem texto, sem logo, sem marca d\'água, sem rosto de pessoas.';
}
// Passo 2 (YouTube Create): transformar a foto num vídeo de 8 segundos
function pedidoVideo_(cena, nome) {
  return 'Vídeo vertical ultrarrealista de 8 segundos a partir desta foto. ' + cena + '. O produto (' + nome + ') continua igual e em destaque, sendo usado ou arrumado por mãos femininas. Movimento lento de câmera se aproximando, luz quente, clima aconchegante, sem texto na tela.';
}

// O app manda o áudio do vídeo (WAV 16 kHz) e recebe a legenda com os tempos (Gemini).
function doPost(e) {
  const json = o => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
  try {
    const q = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (q.acao === 'legenda') return json(legendar_(q));
    return json({erro: 'ação desconhecida'});
  } catch (err) { return json({erro: String(err.message || err)}); }
}
function legendar_(q) {
  const audio = String(q.audio || '');
  if (!audio) return {erro: 'sem áudio'};
  if (audio.length > 15000000) return {erro: 'vídeo longo demais para a legenda'};
  const prompt = 'Transcreva este áudio em português do Brasil, palavra por palavra, exatamente como a pessoa falou (pode corrigir só a pontuação e escrever números por extenso como foram falados). ' +
    'Divida em pedaços curtos de legenda de TikTok, de 2 a 5 palavras cada, na ordem, sem pular nada. ' +
    'Para cada pedaço dê o início "s" e o fim "e" em segundos (com décimos) contados do começo do áudio. ' +
    'Responda SÓ com JSON assim: {"falas":[{"s":0.4,"e":1.6,"t":"Gente, olha esse"}]}. Se ninguém falar, responda {"falas":[]}.';
  const txt = gemini_(prompt, false, [{inline_data: {mime_type: q.mime || 'audio/wav', data: audio}}], {temperature: 0, responseMimeType: 'application/json', thinkingConfig: {thinkingBudget: 0}});
  if (!txt) return {erro: 'o Gemini não respondeu (confira a GEMINI_KEY)'};
  const j = jsonDe_(txt);
  if (!j || !Array.isArray(j.falas)) return {erro: 'não consegui entender o áudio'};
  const falas = j.falas.map(f => ({s: Number(f.s), e: Number(f.e), t: String(f.t || '').trim().slice(0, 80)}))
    .filter(f => f.t && isFinite(f.s) && isFinite(f.e) && f.e > f.s).sort((a, b) => a.s - b.s);
  return {falas: falas};
}

// O app Daia Studio lê daqui os 3 vídeos do dia (Implantar > App da Web).
function doGet(e) {
  const q = (e && e.parameter) || {};
  const json = o => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
  try {
    if (q.acao === 'extra') return json({ok: guardarExtra_(q)});
    if (q.acao === 'notafotos') return json(PACK_CHAVE && q.chave === PACK_CHAVE ? {notas: notasFotos_(String(q.urls || '').split(' ').filter(Boolean).slice(0, 8))} : {erro: 'chave errada'});
    if (q.acao === 'refazerfotos') return json(PACK_CHAVE && q.chave === PACK_CHAVE ? refazerFotosAuto_() : {erro: 'chave errada'});
    if (q.link && q.acao === 'pack') return json(PACK_CHAVE && q.chave === PACK_CHAVE ? {ok: guardarPack_(q)} : {erro: 'chave errada'});
    if (q.link) return json({link: meuLink_(q.link)});
    if (q.pergunta) return json({resposta: perguntaDalinha_(String(q.pergunta).slice(0, 600), String(q.ctx || '').slice(0, 900))});
  } catch (err) { return json({erro: String(err.message || err)}); }
  const aba = SpreadsheetApp.getActive().getSheetByName(ABA);
  const n = aba.getLastRow() - 1;
  const linhas = n > 0 ? aba.getRange(2, 1, n, 16).getDisplayValues() : [];
  const lerJson = s => { try { return s ? JSON.parse(s) : []; } catch (e) { return []; } };
  const hoje = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'dd/MM/yyyy');
  let lista = linhas.filter(l => l[0] === hoje);
  if (!lista.length) lista = linhas.slice(-POR_DIA);
  const videos = lista.map(l => ({
    data: l[0], nome: l[1], preco: l[2], comissao: l[3], vendas: l[4], link: l[5],
    pedidoVideo: l[6], legenda: l[7], hashtags: l[8], foto: l[10], id: l[11],
    pedidoFoto: l[12] || pedidoFoto_('casa clean e aconchegante, ambiente bem decorado', l[1]),
    opcoes: lerJson(l[13]), fotos: String(l[14] || '').split(/\s+/).filter(Boolean), cores: lerJson(l[15])
  }));
  return json({atualizado: hoje, videos: videos, packs: packsDoDia_(), conteudo: conteudo_(hoje)});
}

// Conteúdo do app que a Daia muda pela planilha (abas que começam com "App - ").
function conteudo_(hoje) {
  const ss = SpreadsheetApp.getActive();
  const ler = nome => { const a = ss.getSheetByName(nome); return a && a.getLastRow() > 1 ? a.getRange(2, 1, a.getLastRow() - 1, a.getLastColumn()).getDisplayValues().filter(l => l.some(c => String(c).trim())) : []; };
  const recados = ler('App - Recado').filter(l => l[1] && (!l[0] || l[0] === hoje));
  const itens = ler('App - Itens');
  const prontos = ler('App - Prontos').filter(l => l[0] && !/^n/i.test(l[8] || 'sim')).map(l => ({
    id: l[0].trim(), c1: l[1], c2: l[2], capa: l[3], fim: l[4], leg: l[5], tags: l[6], album: l[7],
    itens: itens.filter(i => i[0].trim() === l[0].trim() && i[6] !== 'sem foto boa').sort((a, b) => Number(a[1]) - Number(b[1])).map(i => ({n: i[2], d: i[3], link: i[4], foto: i[5]}))
  })).filter(p => p.itens.length >= 3);
  // carrosséis novos do robô primeiro (os 20 mais recentes), depois os outros
  const autos = prontos.filter(p => /^auto/.test(p.id)).sort((a, b) => b.id.localeCompare(a.id)).slice(0, 20);
  const outros = prontos.filter(p => !/^auto/.test(p.id));
  return {
    recado: recados.length ? recados[recados.length - 1][1] : '',
    analise: (ler('App - Análise').slice(-1)[0] || [])[1] || '',
    extras: ler('App - Extras').slice(-30).map(l => ({id: l[7], data: l[0], onde: l[2], tipo: l[3], t: l[4], link: l[5], claude: l[6]})),
    respostas: ler('App - Respostas').filter(l => l[0] && l[1]).map(l => ({nome: l[0], texto: l[1]})),
    prontos: autos.concat(outros),
    lembretes: PropertiesService.getScriptProperties().getProperty('NTFY_TOPICO') || '',
    plano: ler('App - Plano').filter(l => l[0] && l[3]).map(l => ({data: l[0], h: l[1], k: (l[2] || 'casa').toLowerCase().trim(), t: l[3], g: l[4], m: l[5], r: l[6] ? l[6].split('/').map(s => s.trim()).filter(Boolean) : null}))
  };
}

// Para testar no editor: escolha "testeLink" e toque em Executar.
function testeLink() { Logger.log(meuLink_('https://s.shopee.com.br/3qJk5AeVFm')); }

function buscar_(palavra, senha, ordem) {
  const query = '{ productOfferV2(keyword: "' + palavra.replace(/"/g, '') + '", sortType: ' + (ordem || 2) + ', page: 1, limit: 40) { nodes { itemId productName commissionRate priceMin sales imageUrl offerLink ratingStar priceDiscountRate } } }';
  const d = chamar_(query, senha);
  return (d.productOfferV2 && d.productOfferV2.nodes) || [];
}

// Troca qualquer link da Shopee (inclusive link de afiliado de outra pessoa) pelo SEU link.
function meuLink_(url) {
  const senha = PropertiesService.getScriptProperties().getProperty('SHOPEE_SENHA');
  let u = String(url || '').trim().match(/https?:\/\/\S+/);
  if (!u) throw new Error('Isso não parece um link.');
  u = u[0];
  for (let i = 0; i < 6 && /s\.shopee\.com\.br|shope\.ee|shp\.ee/.test(u); i++) {
    const r = UrlFetchApp.fetch(u, {followRedirects: false, muteHttpExceptions: true});
    const h = r.getHeaders(); const loc = h.Location || h.location;
    if (!loc) break;
    u = loc;
  }
  const m = decodeURIComponent(u).split('?')[0].match(/-i\.(\d+)\.(\d+)|\/(?:product|[^\/]+)\/(\d+)\/(\d+)\/?$/);
  if (!m) throw new Error('Não achei o produto nesse link.');
  const origem = decodeURIComponent(u).split('?')[0];
  const d = chamar_('mutation { generateShortLink(input: {originUrl: "' + origem + '", subIds: ["daiastudio"]}) { shortLink } }', senha);
  return d.generateShortLink.shortLink;
}

function chamar_(query, senha) {
  const corpo = JSON.stringify({query: query});
  const ts = Math.floor(Date.now() / 1000);
  const assinatura = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, APP_ID + ts + corpo + senha, Utilities.Charset.UTF_8)
    .map(b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');
  const r = UrlFetchApp.fetch(API, {
    method: 'post', contentType: 'application/json', payload: corpo, muteHttpExceptions: true,
    headers: {Authorization: 'SHA256 Credential=' + APP_ID + ', Timestamp=' + ts + ', Signature=' + assinatura}
  });
  const j = JSON.parse(r.getContentText());
  if (j.errors) throw new Error('Shopee respondeu: ' + JSON.stringify(j.errors).slice(0, 300));
  return j.data || {};
}

// Packs do Telegram: a tarefa da meia-noite manda os vídeos novos para a aba "Packs".
// A chave fica guardada em Propriedades do script > PACK_CHAVE (não fica escrita no código).
const PACK_CHAVE = PropertiesService.getScriptProperties().getProperty('PACK_CHAVE') || '';
// "Postei algo extra" do app: guarda na aba "App - Extras" para o Claude analisar no dia seguinte.
// Colunas: Data | Hora | Onde | Tipo | O que postou | Link | Comentário do Claude | id
function guardarExtra_(q) {
  const ss = SpreadsheetApp.getActive();
  let a = ss.getSheetByName('App - Extras');
  if (!a) { a = ss.insertSheet('App - Extras'); a.appendRow(['Data', 'Hora', 'Onde', 'Tipo', 'O que postou', 'Link', 'Comentário do Claude', 'id']); a.setFrozenRows(1); }
  const corta = (s, n) => String(s || '').replace(/[\r\n]+/g, ' ').trim().slice(0, n);
  const id = corta(q.id, 40), t = corta(q.t, 400);
  if (!id || !t) return 'faltou o texto';
  const n = a.getLastRow() - 1;
  if (n > 0) {
    const ids = a.getRange(2, 8, n, 1).getValues().map(r => String(r[0]));
    const i = ids.indexOf(id);
    if (q.apagar) { if (i >= 0) a.deleteRow(i + 2); return 'apagado'; }
    if (i >= 0) return 'já tinha';
  }
  if (q.apagar) return 'apagado';
  const agora = new Date(), tz = 'America/Sao_Paulo', hoje = Utilities.formatDate(agora, tz, 'dd/MM/yyyy');
  if (n > 0 && a.getRange(2, 1, n, 1).getDisplayValues().filter(r => r[0] === hoje).length >= 40) return 'muitos hoje';
  a.appendRow([hoje, Utilities.formatDate(agora, tz, 'HH:mm'), corta(q.onde, 30), corta(q.tipo, 30), t, corta(q.url, 300), '', id]);
  return 'guardado';
}

function guardarPack_(p) {
  const ss = SpreadsheetApp.getActive();
  const aba = ss.getSheetByName('Packs') || ss.insertSheet('Packs');
  if (aba.getLastRow() === 0) aba.appendRow(['Data', 'Pack', 'Nicho', 'Post no Telegram', 'Link original', 'Meu link', 'Legenda', 'Tipo']);
  const ja = aba.getLastRow() > 1 ? aba.getRange(2, 4, aba.getLastRow() - 1, 1).getValues().flat().map(String) : [];
  if (ja.indexOf(String(p.tg)) >= 0) return 'já tinha';
  const link = meuLink_(p.link);
  const hoje = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'dd/MM/yyyy');
  aba.appendRow([hoje, p.pack || '', p.nicho || '', p.tg || '', p.link, link, p.legenda || '', p.tipo || 'vídeo']);
  return link;
}
function packsDoDia_() {
  const aba = SpreadsheetApp.getActive().getSheetByName('Packs');
  if (!aba || aba.getLastRow() < 2) return [];
  const l = aba.getRange(2, 1, aba.getLastRow() - 1, 8).getDisplayValues();
  const hoje = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'dd/MM/yyyy');
  let lista = l.filter(x => x[0] === hoje);
  if (!lista.length) lista = l.slice(-5);
  return lista.slice(-8).map(x => ({data: x[0], pack: x[1], nicho: x[2], tg: x[3], link: x[5], legenda: x[6], tipo: x[7]}));
}

function nomeCurto_(n) {
  n = String(n || '').replace(/\s+/g, ' ').trim();
  return n.length > 70 ? n.slice(0, 70).replace(/\s\S*$/, '') : n;
}

function garantirCabecalho_(aba) {
  const c = aba.getRange(1, 11, 1, 6).getValues()[0];
  if (c[0] !== 'Foto do produto' || c[5] !== 'Cores (variações)') aba.getRange(1, 11, 1, 6).setValues([['Foto do produto', 'ID Shopee', 'Pedido da foto (ChatGPT)', 'Opções parecidas', 'Mais fotos', 'Cores (variações)']]);
}

// Rode UMA vez: autoriza, testa e liga o robô para todo dia às 6h.
function instalar() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'videoIaDoDia').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('videoIaDoDia').timeBased().everyDays(1).atHour(6).inTimezone('America/Sao_Paulo').create();
  const n = videoIaDoDia();
  SpreadsheetApp.getActive().toast('Robô ligado! Hoje entraram ' + n + ' produtos. Ele roda todo dia às 6h.', 'Vídeo IA do dia', 10);
}

// Para testar no editor: escolha "testeConteudo" e toque em Executar.
function testeConteudo() { const c = conteudo_(Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'dd/MM/yyyy')); Logger.log('recado: ' + c.recado + ' | respostas: ' + c.respostas.length + ' | prontos: ' + c.prontos.length + ' (itens do 1º: ' + (c.prontos[0] ? c.prontos[0].itens.length : 0) + ') | plano: ' + c.plano.length); }

// =====================================================================
// v3 (21/10/2026): Gemini, trend do dia, carrossel do dia, lembretes e plano até o Natal
// Chaves em Configurações do projeto > Propriedades do script:
//   GEMINI_KEY (a Daia cola), NTFY_TOPICO (lembretes), PACK_CHAVE (tarefa da meia-noite)
// =====================================================================
const TZ = 'America/Sao_Paulo';
const APP_URL = 'https://sgtdaianadelima-ai.github.io/daia-studio/';
const hojeBR_ = (d) => Utilities.formatDate(d || new Date(), TZ, 'dd/MM/yyyy');

// ---------- Gemini ----------
function gemini_(prompt, comBusca, partes, config) {
  const props = PropertiesService.getScriptProperties();
  const key = props.getProperty('GEMINI_KEY');
  if (!key) return null;
  // tenta o modelo que funcionou da última vez e, se der limite (429) ou não existir (404), passa para o próximo
  const salvo = props.getProperty('GEMINI_MODELO');
  const lista = modelosGemini_(key);
  const ordem = (salvo && lista.indexOf(salvo) >= 0 ? [salvo] : []).concat(lista.filter(m => m !== salvo));
  const cache = CacheService.getScriptCache();
  // no plano grátis o Google às vezes não libera a pesquisa: aí pula a pesquisa por 6 horas
  if (comBusca && cache.get('SEM_BUSCA')) comBusca = false;
  for (const modelo of ordem.slice(0, 6)) {
    for (const busca of (comBusca ? [true, false] : [false])) {
      if (busca && cache.get('SEM_BUSCA')) continue;
      const body = {contents: [{role: 'user', parts: (partes || []).concat([{text: prompt}])}], generationConfig: config || {temperature: 0.8}};
      if (busca) body.tools = [{google_search: {}}];
      const t0 = Date.now();
      const r = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/' + modelo + ':generateContent',
        {method: 'post', contentType: 'application/json', headers: {'x-goog-api-key': key}, payload: JSON.stringify(body), muteHttpExceptions: true});
      const cod = r.getResponseCode();
      if (cod === 200) {
        const j = JSON.parse(r.getContentText());
        const c = ((j.candidates || [])[0] || {}).content;
        const txt = c && c.parts ? c.parts.map(p => p.text || '').join('').trim() : '';
        Logger.log('Gemini ok ' + modelo + ' em ' + (Date.now() - t0) + ' ms');
        if (txt) { if (modelo !== salvo) props.setProperty('GEMINI_MODELO', modelo); return txt; }
      } else {
        Logger.log('Gemini ' + cod + ' (' + modelo + ', busca=' + busca + '): ' + r.getContentText().slice(0, 160));
        if (cod === 401 || cod === 403) return null; // chave errada: não adianta tentar outro modelo
        if (busca && cod === 429) cache.put('SEM_BUSCA', '1', 21600);
      }
    }
  }
  return null;
}
// Lista os modelos "flash" que a chave pode usar: os estáveis primeiro (mais novos antes), depois os "lite".
function modelosGemini_(key) {
  const cache = CacheService.getScriptCache(), guardado = cache.get('GEMINI_LISTA');
  if (guardado) return JSON.parse(guardado);
  let nomes = [];
  try {
    const r = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', {headers: {'x-goog-api-key': key}, muteHttpExceptions: true});
    nomes = (JSON.parse(r.getContentText()).models || []).filter(m => (m.supportedGenerationMethods || []).indexOf('generateContent') >= 0).map(m => m.name.replace('models/', ''));
  } catch (e) {}
  const versao = n => { const m = n.match(/(\d+(\.\d+)?)/); return m ? parseFloat(m[1]) : 0; };
  const flash = nomes.filter(n => /flash/.test(n) && !/image|tts|live|audio|exp|thinking|embed|8b/.test(n));
  const nota = n => (/lite/.test(n) ? 2 : 0) + (/preview/.test(n) ? 1 : 0);
  flash.sort((a, b) => (nota(a) - nota(b)) || (versao(b) - versao(a)));
  const lista = flash.length ? flash : ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'];
  cache.put('GEMINI_LISTA', JSON.stringify(lista), 21600);
  return lista;
}
function modeloGemini_(key) { const p = PropertiesService.getScriptProperties().getProperty('GEMINI_MODELO'); return p || modelosGemini_(key)[0]; }
const jsonDe_ = t => { if (!t) return null; const m = t.replace(/```json|```/g, '').match(/\{[\s\S]*\}/); try { return m ? JSON.parse(m[0]) : null; } catch (e) { return null; } };

// ---------- Dalinha (perguntas do app) ----------
function perguntaDalinha_(pergunta, ctx) {
  const prompt = 'Você é a Dalinha, a assistente fofa e animada da Daia, afiliada da Shopee no nicho casa e decoração (marca Dale Daia, Instagram @daledaia, TikTok @daiana.lima95). ' +
    'Ela posta carrosséis, Shopee Vídeo com vídeos de IA (foto no ChatGPT/Gemini e vídeo no YouTube Create), vídeos dos packs do Telegram e a série de Natal "Minha Primeira Árvore". ' +
    'O app dela (Daia Studio) tem as telas Hoje, Prontos (carrosséis), Produtos, Ideias e Editar, um Manual e um Cronograma. O conteúdo do app se muda pela planilha (abas App -). ' +
    'Responda em português do Brasil, bem simples, carinhosa, no máximo 5 frases curtas, com no máximo 1 emoji. Se for sobre trend, preço, data ou novidade, pesquise na internet antes. ' +
    'Nunca invente números da conta dela. Hoje é ' + hojeBR_() + '. ' + (ctx ? 'O que o app sabe agora: ' + ctx + '. ' : '') + 'Pergunta da Daia: ' + pergunta;
  return gemini_(prompt, true) || '';
}

// ---------- Trend do dia (5h) ----------
function trendDoDia() {
  const hoje = hojeBR_();
  const t = gemini_('Hoje é ' + hoje + '. Pesquise na internet o que está viralizando HOJE no TikTok e no Instagram Reels do Brasil (formatos, memes, áudios em alta), ' +
    'com foco no nicho casa, achadinhos da Shopee, organização, decoração e Natal' + (/^(1[7-9]|2\d|30)\/11/.test(hoje) ? ' e Black Friday' : '') + '. ' +
    'Escolha UMA trend que uma afiliada consiga gravar em casa em até 10 minutos, de forma bonita (aesthetic), sem precisar mostrar o rosto se não quiser. ' +
    'Responda SOMENTE com um JSON assim: {"titulo":"nome curto da trend","comece":"primeira frase do vídeo","mostrar":"o que gravar, em 2 frases","audio":"nome do áudio em alta","recado":"uma frase curta, fofa e animada para a Daia, dizendo o que é mais importante postar hoje"}', true);
  const j = jsonDe_(t);
  if (!j || !j.titulo) return 'sem trend (confira a GEMINI_KEY)';
  const aba = planoAba_();
  const linhas = aba.getLastRow() > 1 ? aba.getRange(2, 1, aba.getLastRow() - 1, 8).getDisplayValues() : [];
  const nova = [hoje, '18h30', 'trend', 'Trend do dia: ' + j.titulo, j.comece || '', (j.mostrar || '') + (j.audio ? ' Áudio: ' + j.audio + '.' : ''), '', 'robô (Gemini) ' + hoje];
  const i = linhas.findIndex(l => l[0] === hoje && /trend/i.test(l[2]));
  if (i >= 0 && /claude/i.test(linhas[i][7])) { /* a tarefa da meia-noite já pesquisou: mantém */ }
  else if (i >= 0) aba.getRange(i + 2, 1, 1, 8).setValues([nova]);
  else aba.appendRow(nova);
  if (j.recado) { const r = SpreadsheetApp.getActive().getSheetByName('App - Recado'); if (r) r.appendRow([hoje, j.recado, 'automático (Gemini)']); }
  return j.titulo;
}

// ---------- Carrossel do dia (7h): 5 produtos da Shopee com o SEU link ----------
const CAPAS = ['c-a12057.jpg', 'c-a12354.jpg', 'c-a12088.jpg', 'c-a12198.jpg', 'c-a11966.jpg', 'c-a11971.jpg', 'c-a12005.jpg', 'c-a12153.jpg', 'c-a12193.jpg', 'c-a12242.jpg', 'c-a12257.jpg', 'c-a12297.jpg', 'c-a12123.jpg', 'c-a12322.jpg', 'c-a12022.jpg'];
const TEMAS_CARROSSEL = [
  {c1: 'Mesa de Natal', c2: 'com cara de revista', fim: 'Qual vai pra sua mesa?', tags: '#mesaposta #natal2026 #ceiadenatal', busca: ['sousplat natal', 'jogo americano natal', 'taça de vidro', 'guardanapo natal', 'caminho de mesa natal']},
  {c1: 'Árvore de Natal', c2: 'cheia gastando pouco', fim: 'Salva pra montar a sua', tags: '#arvoredenatal #natal2026 #decoracaodenatal', busca: ['bola de natal', 'pisca pisca led', 'festão natal', 'ponteira árvore natal', 'saia árvore de natal']},
  {c1: 'Cozinha organizada', c2: 'em 5 achados', fim: 'Qual você levaria?', tags: '#cozinhaorganizada #organizacao', busca: ['pote hermético', 'organizador de gaveta', 'porta tempero', 'escorredor de louça', 'dispenser detergente']},
  {c1: 'Banheiro', c2: 'com cara de hotel', fim: 'Qual você colocaria no seu?', tags: '#banheirodecorado #casadecorada', busca: ['kit banheiro', 'tapete banheiro', 'toalha de banho', 'organizador banheiro', 'difusor de aromas']},
  {c1: 'Quarto aconchegante', c2: 'sem gastar muito', fim: 'Salva pra deixar o seu assim', tags: '#quartoaconchegante #decoracao', busca: ['manta sofa', 'luminaria de mesa', 'almofada decorativa', 'jogo de cama', 'cortina blackout']},
  {c1: 'Presentes até R$ 50', c2: 'que parecem caros', fim: 'Quem você presentearia?', tags: '#presentedenatal #natal2026 #presentesbaratos', busca: ['caneca personalizada', 'vela aromatica', 'kit skin care', 'porta joias', 'garrafa termica']},
  {c1: 'Achadinhos', c2: 'que mudaram minha casa', fim: 'Qual você já tem?', tags: '#achadinhosshopee #casa', busca: ['mop giratorio', 'organizador geladeira', 'cabide veludo', 'lixeira automatica', 'luz led sensor']},
  {c1: 'Casa cheirosa', c2: 'o dia inteiro', fim: 'Qual é o seu cheiro favorito?', tags: '#casacheirosa #limpeza', busca: ['difusor de aromas', 'essência aromatizador', 'vela perfumada', 'sachê perfumado', 'amaciante concentrado']},
  {c1: 'Decoração de Natal', c2: 'para a porta e a sala', fim: 'Por qual você começaria?', tags: '#decoracaodenatal #natal2026', busca: ['guirlanda natal', 'capa de almofada natal', 'papai noel decorativo', 'enfeite porta natal', 'cortina de luz led']},
  {c1: 'Black Friday:', c2: 'achados de casa com desconto', fim: 'Corre que acaba!', tags: '#blackfriday #achadinhosshopee', busca: ['air fryer', 'aspirador portatil', 'jogo de panelas', 'organizador closet', 'luminaria led']}
];
// ---------- Foto limpa (pedido da Daia em 27/10/2026: nada de foto de vendedor com texto, preço ou selo) ----------
const miniatura_ = u => /_tn$/.test(u) ? u : u + '_tn';
// Dá nota de 0 a 10 para cada foto (10 = só o produto, sem nada escrito por cima). null se o Gemini não responder.
function notasFotos_(urls) {
  const partes = [];
  urls.forEach((u, i) => {
    try {
      const r = UrlFetchApp.fetch(miniatura_(u), {muteHttpExceptions: true});
      if (r.getResponseCode() !== 200) throw new Error('foto');
      partes.push({text: 'Foto ' + (i + 1) + ':'});
      partes.push({inline_data: {mime_type: String(r.getHeaders()['Content-Type'] || 'image/jpeg').split(';')[0], data: Utilities.base64Encode(r.getContent())}});
    } catch (e) { partes.push({text: 'Foto ' + (i + 1) + ': (não abriu, nota 0)'}); }
  });
  const prompt = 'Você é uma editora de Instagram muito exigente. Olhe com atenção cada uma destas ' + urls.length + ' fotos de produtos da Shopee, inclusive os cantos. Para cada foto responda: ' +
    '"texto": tem QUALQUER letra, número ou palavra colocada por cima da foto (propaganda, preço, medida, nome do produto, "kit", quantidade, marca d\'água)? Só não conta o que está impresso no próprio produto ou na embalagem. ' +
    '"logo": tem logotipo ou nome de loja em qualquer canto, selo, faixa, seta, ícone, círculo de destaque ou moldura? ' +
    '"colagem": é uma montagem com mais de uma foto, detalhe ampliado em círculo/quadro, várias cores lado a lado ou fundo dividido? ' +
    '"bonita": nota de 0 a 10 de quão bonita, nítida e elegante é a foto para um post (luz boa, produto inteiro e bem enquadrado). ' +
    'Na dúvida, responda true. Responda SÓ com JSON: {"fotos":[{"texto":false,"logo":false,"colagem":false,"bonita":8}, ...]} uma por foto, na ordem.';
  const j = jsonDe_(gemini_(prompt, false, partes, {temperature: 0, responseMimeType: 'application/json', thinkingConfig: {thinkingBudget: 1024}}));
  if (!j || !Array.isArray(j.fotos)) return null;
  // nota final: 0 se tiver texto, logo ou colagem; senão a nota de beleza
  return urls.map((_, i) => { const f = j.fotos[i] || {}; return f.texto === false && f.logo === false && f.colagem === false ? Number(f.bonita) || 0 : 0; });
}
// Entre os melhores produtos da busca, escolhe o que tem a foto mais limpa (nota 7 ou mais).
// Devolve undefined se o Gemini não respondeu (aí não dá para saber).
function escolherLimpo_(lista, usados) {
  const cand = lista.filter(x => Number(x.commissionRate) >= COMISSAO_MIN && Number(x.sales) >= VENDAS_MIN && x.imageUrl && !usados.has(String(x.itemId)) && !usados.has(x.imageUrl))
    .sort((a, b) => Number(b.sales) * Number(b.commissionRate) - Number(a.sales) * Number(a.commissionRate)).slice(0, 8);
  if (!cand.length) return null;
  const notas = notasFotos_(cand.map(x => x.imageUrl));
  if (!notas) return undefined;
  let melhor = null, nota = 6.5;
  cand.forEach((x, i) => { if (notas[i] > nota) { nota = notas[i]; melhor = x; } });
  return melhor;
}

// Refaz as fotos dos carrosséis do robô: confere cada foto e troca o produto se a foto tiver texto, preço ou selo.
// Coluna G da aba "App - Itens": ok / trocada / sem foto boa (essa linha some do app).
function refazerFotosAuto_() {
  const ini = Date.now(), ss = SpreadsheetApp.getActive(), aba = ss.getSheetByName('App - Itens');
  const senha = PropertiesService.getScriptProperties().getProperty('SHOPEE_SENHA');
  if (aba.getRange(1, 7).getValue() !== 'Foto conferida') aba.getRange(1, 7).setValue('Foto conferida');
  const n = aba.getLastRow() - 1, dados = aba.getRange(2, 1, n, 7).getValues();
  const pend = [];
  dados.forEach((l, i) => { if (/^auto/.test(String(l[0])) && /^https?:/.test(String(l[5])) && !l[6]) pend.push(i); });
  let ok = 0, trocadas = 0, ruins = 0;
  for (let k = 0; k < pend.length && Date.now() - ini < 240000; k += 6) {
    const grupo = pend.slice(k, k + 6), notas = notasFotos_(grupo.map(i => String(dados[i][5])));
    if (!notas) break;
    grupo.forEach((i, g) => {
      const l = dados[i], linha = i + 2;
      if (notas[g] >= 7) { aba.getRange(linha, 7).setValue('ok'); ok++; return; }
      if (Date.now() - ini > 270000) return;
      let lista = []; try { lista = buscar_(String(l[2]), senha); } catch (e) {}
      const p = escolherLimpo_(lista, new Set([String(l[5])]));
      if (p === undefined) return; // Gemini não respondeu: tenta na próxima vez
      if (!p) { aba.getRange(linha, 7).setValue('sem foto boa'); ruins++; return; }
      const frase = String(l[3]).split(' · ')[0].replace(/R\$ ?[\d.,]+( na Shopee)?/, '').trim() || 'Achadinho da Shopee que vale a pena';
      aba.getRange(linha, 3, 1, 5).setValues([[nomeCurto_(p.productName).split(' ').slice(0, 6).join(' '), frase, p.offerLink, p.imageUrl, 'trocada']]);
      trocadas++;
    });
  }
  const falta = aba.getRange(2, 1, n, 7).getValues().filter(l => /^auto/.test(String(l[0])) && /^https?:/.test(String(l[5])) && !l[6]).length;
  return {ok: ok, trocadas: trocadas, semFotoBoa: ruins, faltam: falta};
}

function carrosselDoDia() {
  const ss = SpreadsheetApp.getActive();
  const agora = new Date(), id = 'auto' + Utilities.formatDate(agora, TZ, 'yyMMdd'), hoje = hojeBR_(agora);
  const abaP = ss.getSheetByName('App - Prontos'), abaI = ss.getSheetByName('App - Itens');
  if (!abaP || !abaI) return 'faltam as abas App - Prontos / App - Itens';
  if (abaP.getLastRow() > 1 && abaP.getRange(2, 1, abaP.getLastRow() - 1, 1).getValues().flat().indexOf(id) >= 0) return 'já tem o de hoje';
  const senha = PropertiesService.getScriptProperties().getProperty('SHOPEE_SENHA');
  const dia = Math.floor(agora.getTime() / 864e5);
  const bf = /^(1[7-9]|2\d|30)\/11/.test(hoje);
  const tema = bf && dia % 2 === 0 ? TEMAS_CARROSSEL[TEMAS_CARROSSEL.length - 1] : TEMAS_CARROSSEL[dia % (TEMAS_CARROSSEL.length - 1)];
  const usados = new Set(), itens = [];
  for (const palavra of tema.busca) {
    let lista = [];
    try { lista = buscar_(palavra, senha); } catch (e) { continue; }
    const p = escolherLimpo_(lista, usados); // só entra produto com foto limpa
    if (!p) continue;
    usados.add(String(p.itemId));
    itens.push({n: nomeCurto_(p.productName).split(' ').slice(0, 6).join(' '), d: 'Achadinho da Shopee que vale a pena', link: p.offerLink, foto: p.imageUrl});
  }
  if (itens.length < 3) return 'poucos produtos hoje';
  let c1 = tema.c1, c2 = tema.c2, leg = tema.c1 + ' ' + tema.c2 + ' 🤍 Qual desses você levaria? Comenta QUERO que eu te mando os links!';
  const g = jsonDe_(gemini_('Crie a capa de um carrossel do Instagram de uma afiliada da Shopee (nicho casa, tom de amiga, fofo). Produtos: ' + itens.map(i => i.n).join('; ') +
    '. Responda SOMENTE com JSON: {"c1":"linha fina da capa, até 4 palavras","c2":"linha forte da capa, até 6 palavras, que dê vontade de arrastar","leg":"legenda de até 2 frases terminando com: Comenta QUERO que eu te mando os links!","frases":["frase curta de até 7 palavras para cada produto, na mesma ordem"]}', false));
  if (g) { c1 = g.c1 || c1; c2 = g.c2 || c2; leg = g.leg || leg; (g.frases || []).forEach((f, k) => { if (itens[k] && f) itens[k].d = f; }); } // sem preço: o valor muda toda hora (pedido da Daia)
  abaP.appendRow([id, c1, c2, CAPAS[dia % CAPAS.length], tema.fim, leg, tema.tags + ' #achadinhosshopee #shopee', 'Robô: produtos da Shopee de ' + hoje, 'sim']);
  abaI.getRange(abaI.getLastRow() + 1, 1, itens.length, 6).setValues(itens.map((it, k) => [id, k + 1, it.n, it.d, it.link, it.foto]));
  return id + ' com ' + itens.length + ' produtos';
}

// ---------- Lembretes no celular (app gratuito ntfy) ----------
function lembrete_(hora) {
  const topico = PropertiesService.getScriptProperties().getProperty('NTFY_TOPICO');
  if (!topico) return;
  const hoje = hojeBR_(), aba = planoAba_();
  const linhas = aba.getLastRow() > 1 ? aba.getRange(2, 1, aba.getLastRow() - 1, 6).getDisplayValues() : [];
  const posts = linhas.filter(l => l[0] === hoje && (!hora || l[1] === hora));
  const msg = posts.length ? posts.map(l => '• ' + l[3]).join('\n') + '\nAbra o Daia Studio e marque quando postar 🤍' : 'Hora de postar! Abra o Daia Studio para ver o que fazer agora 🤍';
  UrlFetchApp.fetch('https://ntfy.sh/' + encodeURIComponent(topico) + '?title=' + encodeURIComponent('Dalinha: hora do post das ' + (hora || 'hoje')) + '&tags=sparkles&click=' + encodeURIComponent(APP_URL),
    {method: 'post', payload: msg, muteHttpExceptions: true});
}
function lembrete12() { lembrete_('12h'); }
function lembrete18() { lembrete_('18h30'); }
function lembrete21() { lembrete_('21h'); }

// ---------- Plano de postagens de hoje até o Natal ----------
function planoAba_() {
  const ss = SpreadsheetApp.getActive();
  const a = ss.getSheetByName('App - Plano') || ss.insertSheet('App - Plano');
  if (a.getLastRow() === 0) a.appendRow(['Data (dd/mm/aaaa)', 'Horário', 'Tipo (casa, trend ou serie)', 'Título', 'Comece dizendo', 'O que mostrar', 'Roteiro (opcional, partes separadas por /)', 'Origem']);
  if (!a.getRange(1, 8).getValue()) a.getRange(1, 8).setValue('Origem');
  return a;
}
const SERIE = [
  ['O começo', 'Eu nunca tive uma árvore de Natal. Esse ano eu vou montar a minha primeira.', 'Você na frente do cantinho vazio da sala. Termine pedindo: me segue pra ver o resultado.'],
  ['Escolhendo a árvore', 'Qual tamanho de árvore eu compro? Me ajuda!', 'Mostre 2 ou 3 opções da Shopee na tela e peça para votarem nos comentários.'],
  ['A árvore chegou', 'Chegou a minha primeira árvore! Bora abrir comigo?', 'Unboxing da caixa, as peças e a primeira impressão.'],
  ['Montando a base', 'Montar árvore é mais difícil do que parece...', 'Encaixando a base e o tronco, com um erro engraçado no meio.'],
  ['Abrindo os galhos', 'O segredo que ninguém me contou pra árvore ficar cheia.', 'Antes e depois de abrir galho por galho.'],
  ['A cor da minha árvore', 'Vermelho, dourado ou branco? Me ajuda a escolher.', 'Mostre as 3 paletas lado a lado e peça votos.'],
  ['O resultado da votação', 'Vocês escolheram e eu obedeci!', 'Mostre a cor vencedora e os primeiros enfeites dessa cor.'],
  ['O pisca-pisca', 'Coloquei o pisca do jeito certo dessa vez.', 'De dentro pra fora, galho por galho, e o momento de acender.'],
  ['Primeira vez acesa', 'Olha a minha primeira árvore acesa pela primeira vez.', 'Luz da sala apagada, só a árvore. Som calmo.'],
  ['As bolas', 'As bolas grandes vão no fundo, as pequenas na ponta.', 'Pendurando as bolas em 3 tamanhos.'],
  ['O festão', 'O festão que deixou tudo mais cheio.', 'Enrolando o festão perto do tronco.'],
  ['A ponteira', 'Estrela ou laço no topo? Votem!', 'Mostre as duas opções e deixe a votação nos comentários.'],
  ['A saia da árvore', 'A base da árvore estava feia demais...', 'Antes e depois com a saia ou uma manta.'],
  ['Errei feio', 'Hoje deu tudo errado na minha árvore.', 'Os erros (enfeite caindo, pisca apagado) com humor.'],
  ['Antes x agora', 'Olha a diferença em poucos dias.', 'Mesmo ângulo do Ep. 1, lado a lado.'],
  ['Visita chegou', 'A primeira visita viu minha árvore e disse...', 'Reação de alguém da família (ou só a voz).'],
  ['Natal na cozinha', 'A cozinha também ganhou Natal.', 'Pano de prato, pote de biscoito e enfeite na geladeira.'],
  ['Natal no banheiro', 'Até o banheiro entrou no clima.', 'Toalha vermelha e um enfeite pequeno na pia.'],
  ['A porta de entrada', 'A primeira coisa que a visita vê.', 'Guirlanda e laço na porta.'],
  ['O sofá de Natal', 'Troquei só as capas de almofada.', 'Antes e depois do sofá com capas e manta xadrez.'],
  ['A mesa da ceia: teste', 'Fiz um teste da mesa da ceia.', 'Toalha, sousplat, guardanapo com laço e vela.'],
  ['Quanto já gastei', 'Quanto custou minha primeira árvore até agora.', 'Valor de cada coisa na tela e o total.'],
  ['O que falta', 'O que ainda falta pra minha árvore ficar pronta.', 'Lista na tela e a árvore acesa.'],
  ['Embrulhando presentes', 'Presente bonito gastando pouco.', 'Papel kraft, fita e um raminho.'],
  ['Presentes debaixo da árvore', 'Os primeiros presentes chegaram!', 'Arrumando os presentes na saia da árvore.'],
  ['Noite de filme', 'Minha noite favorita do mês.', 'Árvore acesa, manta, pipoca e filme de Natal.'],
  ['Respondendo vocês', 'Respondendo a pergunta que mais apareceu.', 'Responder com vídeo um comentário.'],
  ['Cantinho do café de Natal', 'Montei um cantinho do café natalino.', 'Caneca, biscoito e luz quente.'],
  ['A árvore de dia x de noite', 'Ela é outra pessoa à noite.', 'Transição dia para noite no mesmo ângulo.'],
  ['Tour pela casa de Natal', 'Vem ver minha casa toda no clima de Natal.', 'Tour rápido cômodo por cômodo.']
];
const CASA = [
  ['5 achados que parecem caros', 'Ninguém acredita que isso é da Shopee.', 'Mostre 5 produtos com preço na tela.'],
  ['Cozinha organizada com pouco', 'Organizei minha cozinha gastando pouco.', 'Antes e depois de uma gaveta ou armário.'],
  ['Banheiro de hotel', 'O segredo do banheiro com cara de hotel.', 'Toalhas, kit de pia e cheirinho.'],
  ['Casa cheirosa o dia todo', 'Todo mundo pergunta por que minha casa é cheirosa.', 'Difusor, essência e amaciante.'],
  ['Achado que eu compraria de novo', 'Esse eu compraria de novo sem pensar.', 'Mostre o produto em uso, de perto.'],
  ['Comprei e me arrependi?', 'Comprei esse achado e vou ser sincera.', 'O que gostou e o que não gostou.'],
  ['Quarto aconchegante', 'Meu quarto ficou com cara de hotel.', 'Cama em camadas, luz quente e manta.'],
  ['Organização da geladeira', 'Organizei minha geladeira e olha isso.', 'Potes e gavetas extras, antes e depois.'],
  ['Teste: vale a pena?', 'Testei o achado mais famoso da Shopee.', 'Teste real em 15 segundos e nota de 0 a 10.'],
  ['Cantinho do café', 'Montei meu cantinho do café com achados.', 'Cafeteira, potes e xícaras.'],
  ['Limpeza rápida', 'Minha casa limpa em 10 minutos.', 'Mop, rodo e produtos favoritos.'],
  ['Lavanderia pequena', 'Lavanderia pequena e organizada.', 'Cestos iguais, prateleira e varal.'],
  ['Sala de revista', 'Mudei a sala sem reformar.', 'Almofadas, manta, tapete e luz.'],
  ['Achados até R$ 30', 'Achados de casa até 30 reais.', 'Lista com preço na tela.'],
  ['Mais vendidos da semana', 'Os achados de casa mais vendidos da semana.', 'Do 5 ao 1, com o link na bio.']
];
const TREND = [
  ['Trend com som em alta', 'Use o som mais usado da semana.', 'Adapte para a sua casa ou para a árvore. Até 10 segundos.'],
  ['Expectativa x realidade', 'Expectativa x realidade: decoração de Natal.', 'Foto bonita de referência x a sua versão.'],
  ['POV: comprei na Shopee', 'POV: você descobre que tudo é da Shopee.', 'Reação engraçada mostrando os achados.'],
  ['Bastidores', 'Os bastidores de um vídeo meu.', 'Como você grava, com os erros.'],
  ['Minha rotina da noite', 'Minha rotina da noite em casa.', 'Luz quente, chá, árvore acesa.'],
  ['Respondendo comentário', 'Respondendo o comentário mais engraçado.', 'Use responder com vídeo.'],
  ['Arrume comigo', 'Arrume a casa comigo.', 'Timelapse arrumando um cômodo com som em alta.']
];
const ESPECIAL = {
  '05/11': ['Esquenta 11.11: salva esses achados', 'Dia 11 tem a maior promoção do mês na Shopee.', 'Mostre 3 achados que vão estar mais baratos e peça pra salvar.'],
  '10/11': ['Amanhã é 11.11: minha lista', 'Amanhã é 11.11 e essa é a minha lista.', 'Carrinho cheio na tela e o que vale a pena.'],
  '11/11': ['11.11: os achados com desconto', 'Hoje é 11.11! Corre que acaba.', 'Os 5 melhores achados de casa com o desconto na tela. Poste cedo.'],
  '17/11': ['Esquenta Black Friday: achados de casa', 'A Black Friday chegou mais cedo pra sua casa.', '5 achados com desconto, preço antes x agora.'],
  '20/11': ['Black Friday: não caia em promoção falsa', 'Como saber se a promoção é de verdade.', 'Coloque no carrinho antes e compare o preço no dia.'],
  '24/11': ['Faltam 3 dias para a Black Friday', 'Faltam 3 dias e essa é a minha lista.', 'Lista de desejos de casa com preço.'],
  '26/11': ['Amanhã é Black Friday', 'Amanhã é Black Friday: o que eu vou comprar.', 'Carrinho montado e cupons separados.'],
  '27/11': ['BLACK FRIDAY: os melhores achados de casa', 'Hoje é Black Friday! Os achados que valem a pena.', 'Poste cedo e repita nos stories ao longo do dia.'],
  '28/11': ['Black Friday: o que ainda está barato', 'Ainda dá tempo! Isso continua com desconto.', '3 achados que ainda estão em promoção.'],
  '30/11': ['Cyber Monday: última chance', 'Última chance de pegar com desconto.', 'Os 3 achados mais pedidos no seu grupo VIP.'],
  '01/12': ['Dezembro chegou: casa no clima de Natal', 'Dezembro chegou e minha casa já está assim.', 'Tour rápido da decoração.'],
  '11/12': ['Amanhã é 12.12: minha lista', 'Amanhã tem 12.12 na Shopee.', 'Lista de presentes e decoração com preço.'],
  '12/12': ['12.12: achados com desconto', 'Hoje é 12.12! Os achados que eu separei.', 'Os 5 melhores com desconto. Poste cedo.'],
  '15/12': ['Presentes até R$ 50 que chegam antes do Natal', 'Presente bonito que ainda chega antes do Natal.', '5 presentes com frete rápido.'],
  '18/12': ['Presente de última hora', 'Esqueceu de alguém? Ainda dá tempo.', 'Presentes com entrega rápida e vale-presente.'],
  '22/12': ['Minha mesa de Natal pronta', 'A mesa da ceia ficou assim.', 'Cada item da mesa com o link na bio.'],
  '24/12': ['Véspera: minha casa pronta para o Natal', 'Chegou o dia! Minha casa pronta para o Natal.', 'Tour final com a árvore acesa.'],
  '25/12': ['Feliz Natal!', 'Feliz Natal! Obrigada por acompanhar até aqui.', 'Você e a árvore, agradecendo. Convide para o grupo VIP.']
};
// Rode UMA vez (ou de novo, se quiser refazer): apaga as linhas do plano e escreve de amanhã... de hoje até 25/12.
function montarPlanoAteNatal() {
  const aba = planoAba_();
  const ini = new Date(), fim = new Date(ini.getFullYear(), 11, 25);
  ini.setHours(12, 0, 0, 0);
  const linhas = [];
  let ep = 1, k = 0;
  for (let d = new Date(ini); d <= fim; d.setDate(d.getDate() + 1), k++) {
    const data = hojeBR_(d), ddmm = data.slice(0, 5);
    const faltam = Math.round((fim - d) / 864e5);
    const casa = ESPECIAL[ddmm] || CASA[k % CASA.length];
    linhas.push([data, '12h', 'casa', casa[0], casa[1], casa[2], '', 'plano']);
    const tr = TREND[k % TREND.length];
    linhas.push([data, '18h30', 'trend', tr[0] + ' (o robô troca pela trend do dia às 5h)', tr[1], tr[2], '', 'plano']);
    if (ddmm === '25/12') linhas.push([data, '21h', 'serie', 'Ep. final: a árvore no dia de Natal', 'Minha primeira árvore no dia de Natal.', 'Agradeça quem acompanhou e mostre o antes x depois.', '', 'plano']);
    else if (ddmm === '24/12') linhas.push([data, '21h', 'serie', 'Ep. ' + ep + ' — A árvore pronta', 'Minha primeira árvore está pronta. Valeu cada dia.', 'Antes do Ep. 1 x agora. Peça nota de 0 a 10.', '', 'plano']);
    else { const s = SERIE[(ep - 1) % SERIE.length]; linhas.push([data, '21h', 'serie', 'Ep. ' + ep + ' — ' + s[0] + (ep > SERIE.length ? ' (parte 2)' : ''), s[1], s[2] + ' Faltam ' + faltam + ' dias para o Natal.', '', 'plano']); ep++; }
  }
  if (aba.getLastRow() > 1) aba.getRange(2, 1, aba.getLastRow() - 1, 8).clearContent();
  aba.getRange(2, 1, linhas.length, 8).setValues(linhas);
  return linhas.length + ' posts no plano até o Natal';
}

// Rode UMA vez: liga todos os horários automáticos.
function instalarTudo() {
  const quero = {trendDoDia: 5, videoIaDoDia: 22, carrosselDoDia: 7, lembrete12: 12, lembrete18: 18, lembrete21: 21};
  ScriptApp.getProjectTriggers().filter(t => quero[t.getHandlerFunction()] !== undefined).forEach(t => ScriptApp.deleteTrigger(t));
  Object.keys(quero).forEach(f => { const b = ScriptApp.newTrigger(f).timeBased().everyDays(1).atHour(quero[f]).inTimezone(TZ); if (f === 'lembrete18') b.nearMinute(30); b.create(); });
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('NTFY_TOPICO')) props.setProperty('NTFY_TOPICO', 'daledaia-' + Utilities.getUuid().slice(0, 13));
  Logger.log('Horários ligados. Tópico dos lembretes: ' + props.getProperty('NTFY_TOPICO'));
}
function testeGemini() { Logger.log('modelo: ' + modeloGemini_(PropertiesService.getScriptProperties().getProperty('GEMINI_KEY') || '') + ' | resposta: ' + perguntaDalinha_('Me dá uma dica rápida de post de casa para hoje', '')); }
