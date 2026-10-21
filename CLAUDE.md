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
