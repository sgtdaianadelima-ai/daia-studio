// Gera a marca d'água "daledaia • daledaia •" em círculo, PNG sem fundo. Uso: node capas/fazer-marca-dagua.js pasta-de-saida
const { chromium } = require('playwright');
const S = process.argv[2];
const ring = (cor, op) => `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000">
<defs><path id="c" d="M500,500 m-330,0 a330,330 0 1,1 660,0 a330,330 0 1,1 -660,0"/></defs>
<g fill="${cor}" opacity="${op}"><text font-family="Nunito Sans" font-weight="500" font-size="215">
<textPath href="#c" textLength="2060" lengthAdjust="spacing">daledaia • daledaia •</textPath></text></g></svg>`;
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
  for (const [nome, cor, op] of [['branca-transparente', '#FFFFFF', .6], ['branca-forte', '#FFFFFF', 1], ['escura-transparente', '#7A1F2B', .55]]) {
    await p.setContent(`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@500&display=swap"><style>html,body{margin:0;background:transparent}</style><div id="m" style="width:1000px;height:1000px">${ring(cor, op)}</div>`, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
    await (await p.$('#m')).screenshot({ path: `${S}/Marca dagua - ${nome}.png`, omitBackground: true });
  }
  await b.close();
})();
