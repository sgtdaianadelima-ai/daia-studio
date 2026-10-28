// Gera capa no estilo Dale Daia (foto real + degradê escuro embaixo + letra fina inclinada + letra grossa + dourado).
// Uso: [TOPO=1400] node capas/fazer-capa.js foto.jpg saida.png "TAG" "linha fina" "LINHA GROSSA" "frase com *destaque*" [story|feed|tiktok]
// story/tiktok = 1080x1920 (texto fica no meio, aparece no quadradinho do perfil); feed = 1080x1350.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const [foto, saida, tag = '', fina = '', grossa = '', frase = '', fmt = 'story'] = process.argv.slice(2);
if (!foto || !saida) { console.log('Uso: node capas/fazer-capa.js foto saida.png TAG fina GROSSA frase [story|feed|tiktok]'); process.exit(1); }
const W = 1080, H = fmt === 'feed' ? 1350 : 1920, topo = Number(process.env.TOPO) || (fmt === 'feed' ? 760 : 1150); // TOPO=1400 desce o texto quando o principal da foto fica no meio
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const fraseHtml = esc(frase).replace(/\*(.+?)\*/g, '<b>$1</b>');
const img = 'data:image/' + (/\.png$/i.test(foto) ? 'png' : 'jpeg') + ';base64,' + fs.readFileSync(foto).toString('base64');
const html = `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Nunito+Sans:opsz,wght@6..12,600;6..12,700;6..12,800;6..12,900&display=swap">
<style>body{margin:0}
.c{width:${W}px;height:${H}px;position:relative;overflow:hidden;background:#1A1114 url(${img}) center/cover}
.g{position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,8,10,.15) 0%,rgba(15,8,10,.12) 40%,rgba(15,8,10,.55) 62%,rgba(15,8,10,.82) 100%)}
.t{position:absolute;left:40px;right:40px;top:${topo}px;text-align:center;color:#fff;text-shadow:0 3px 22px rgba(0,0,0,.5)}
.tag{font:900 34px 'Nunito Sans';letter-spacing:.22em;color:#F1D29A;text-transform:uppercase}
.tag:before,.tag:after{content:"";display:inline-block;width:70px;height:2px;background:#F1D29A;vertical-align:middle;margin:0 22px 6px}
.s{font:italic 116px/1.02 'DM Serif Display';margin-top:18px}
.b{font:900 112px/1.02 'Nunito Sans';text-transform:uppercase}
.p{font:700 40px 'Nunito Sans';margin-top:26px}.p b{color:#F1D29A}
.h{position:absolute;bottom:${fmt === 'feed' ? 45 : 70}px;left:0;right:0;text-align:center;font:700 32px 'Nunito Sans';color:rgba(255,255,255,.9)}
</style><div class="c" id="c"><div class="g"></div><div class="t">
${tag ? `<div class="tag">${esc(tag)}</div>` : ''}<div class="s">${esc(fina)}</div><div class="b">${esc(grossa)}</div>
${frase ? `<div class="p">${fraseHtml}</div>` : ''}</div><div class="h">@daledaia</div></div>`;
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: W, height: H } });
  await p.setContent(html, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
  // palavra comprida (ex.: TRANSFORMAÇÃO): diminui a letra até caber
  await p.evaluate(() => document.querySelectorAll('.s,.b').forEach(e => { e.style.whiteSpace = 'nowrap'; let f = parseFloat(getComputedStyle(e).fontSize); while (e.scrollWidth > e.clientWidth && f > 50) e.style.fontSize = (f -= 2) + 'px'; }));
  await (await p.$('#c')).screenshot({ path: path.resolve(saida) }); await b.close(); console.log('ok', saida);
})();
