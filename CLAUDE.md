# Daia Studio — app da Dale Daia (afiliada Shopee)

App (PWA) da Daia, afiliada da Shopee no nicho casa e decoração (marca **Dale Daia**, Instagram @daledaia, TikTok @daiana.lima95). Fica no ar em https://sgtdaianadelima-ai.github.io/daia-studio/ (GitHub Pages deste repositório).

## Como falar com a Daia
- Português simples, frases curtas, sem jargão. Ela prefere "hoje faça isso" a textos longos.
- Ela usa quase só o celular. Explique cada passo com o nome exato dos botões.
- Nunca mexer no Instagram pessoal @limadedaiana. Nome e bio de perfil: sempre mostrar a proposta e pedir aprovação antes.
- Fotos: nunca Pinterest (direitos autorais). Pode Unsplash/Pexels (licença livre) e os packs que ela comprou.

## Este repositório é PÚBLICO
Nada de senha, chave, CPF, telefone ou dado pessoal aqui. As chaves ficam só nas Propriedades do script do Google (GEMINI_KEY, SHOPEE_SENHA, PACK_CHAVE, NTFY_TOPICO).

## Arquivos
- `index.html` — telas e estilos (cores da marca: creme #FBF7F2, vinho #7A1F2B, dourado #C9A46A).
- `app.js` — lógica: tela Hoje (recado, pendentes, Shopee Vídeo do dia, packs, post pronto, plano, resumo da semana, conversor, respostas, lembretes), Prontos (carrosséis desenhados no canvas), Produtos, Ideias, Editar (corta pausas de vídeo).
- `voz.js` — **Dalinha**, a assistente: modo Pedir (entende pedidos e, se não souber, pergunta ao Gemini pelo robô) e modo Ditado (só transforma fala em texto). Só fala em voz quando a Daia pede.
- `plan.js`, `prontos.js` — conteúdo antigo de reserva (usado só se a planilha não responder).
- `manual.html`, `cronograma.html` — manual e cronograma dentro do app.
- `sw.js` — guarda o app para abrir offline. **Toda mudança: aumentar `VERSAO`** (ex.: daia-v12 → daia-v13).
- `c-*.jpg` (capas com mulher), `p-*.jpg` (fotos de produtos dos carrosséis), `f-*`, `s-*` (antigas).
- `robo/Codigo.gs` — cópia do robô do Google Apps Script (para consulta). O robô de verdade roda no Google.

## Conteúdo: vem da planilha
Planilha "Vídeo IA do dia - Dale Daia" (Google). O robô (`doGet`) devolve tudo num JSON que o app lê:
- `Vídeos` — 3 produtos por dia para Shopee Vídeo (robô às 6h).
- `Packs` — vídeos do PACK VIP STORYS/VIDEOS do Telegram (tarefa do computador à meia-noite).
- `App - Recado`, `App - Respostas`, `App - Prontos` + `App - Itens`, `App - Plano` — o que a Daia muda pelo celular.
Horários do robô: 5h trend do dia (Gemini com pesquisa), 6h Vídeo IA, 7h carrossel do dia, 12h/18h30/21h lembretes (app ntfy).

## Mudou o robô?
O código do robô fica no Google (Extensões > Apps Script da planilha). Depois de mudar: colar no editor, salvar e **Implantar > Gerenciar implantações > lápis > Versão: Nova versão > Implantar** (só a Daia consegue fazer esse último passo).

## Ao mudar o app
1. Teste no celular (largura ~375px) e sem erros no console.
2. Aumente `VERSAO` no `sw.js`.
3. Se o funcionamento mudou, atualize o `manual.html` (e avise a Daia que o manual online também precisa mudar).

## Capas e imagens sob pedido (desde 27/10/2026)
Quando a Daia mandar uma foto e pedir "faz uma capa" (Reels, TikTok, post, story...), fazer **direto, sem perguntar**, na identidade visual Dale Daia, a mesma dos carrosséis do app (`drawProntoSlide` no `app.js`):
- Foto real dela ocupando tudo + degradê escuro de baixo para cima.
- Linha pequena em cima em **dourado #F1D29A**, maiúsculas espaçadas, com tracinhos dos lados (ex.: "OPERAÇÃO NATAL").
- Título em 2 linhas: **DM Serif Display itálico** (fina) + **Nunito Sans 900 MAIÚSCULO** (grossa), branco com sombra.
- Frase curta embaixo (Nunito Sans 700) com uma palavra em dourado. "@daledaia" no rodapé.
- Reels/TikTok/story: 1080×1920 com o texto no meio (y ≈ 1150–1550), para aparecer inteiro no quadradinho do perfil. Feed: 1080×1350.
- Se o principal da foto ocupar o meio (ex.: guirlanda), descer o texto com `TOPO=1400`. Título comprido diminui sozinho.
- Gerar com `node capas/fazer-capa.js foto saida.png "TAG" "linha fina" "LINHA GROSSA" "frase com *destaque*" [story|feed|tiktok]`.
- Entregar **3 opções de título** com SendUserFile, dizer qual recomenda e como trocar a capa no app.
- Série no TikTok/Instagram: **Operação Natal** (o vídeo da árvore "capenga" é o "antes", sem número; os episódios começam no Ep. 1).
- Não precisa aumentar `VERSAO` do `sw.js` por mudança só em `capas/` (não faz parte do app).
- **Marca d'água** (27/10/2026): círculo "daledaia • daledaia •", Nunito Sans, PNG 1000×1000 sem fundo, em `capas/marca-dagua-*.png` (branca 60% = principal; branca forte; vinho 55% para fundo claro). Refazer com `node capas/fazer-marca-dagua.js pasta`.
