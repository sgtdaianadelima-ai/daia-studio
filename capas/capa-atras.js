// Capa com o texto ATRÁS da pessoa (efeito revista).
// Uso: node capas/capa-atras.js foto.png mascara.png saida.png "TAG" "linha fina" "LINHA GROSSA" [topo=330] [cor=#FFFFFF]
// mascara.png = recorte da pessoa (branco = pessoa), feito com:
//   python3 -c "from rembg import remove,new_session;from PIL import Image;remove(Image.open('foto.png').convert('RGB'),session=new_session('u2net_human_seg'),only_mask=True).convert('L').save('m.png')" e depois virar transparência: m=Image.open('m.png'); r=Image.new('RGBA',m.size); r.putalpha(m); r.save('mascara.png')
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const [foto, mascara, saida, tag = '', fina = '', grossa = '', topo = '330', cor = '#FFFFFF'] = process.argv.slice(2);
const d = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const html = `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Nunito+Sans:opsz,wght@6..12,700;6..12,800;6..12,900&display=swap">
<style>body{margin:0}.c{width:1080px;height:1920px;position:relative;overflow:hidden}
.l{position:absolute;inset:0;background-position:center;background-size:cover}
.p{-webkit-mask-image:url(${d(mascara)});mask-image:url(${d(mascara)});-webkit-mask-size:cover;mask-size:cover;-webkit-mask-position:center;mask-position:center}
.g{background:linear-gradient(180deg,rgba(15,8,10,.38) 0%,rgba(15,8,10,.12) 45%,rgba(15,8,10,.12) 70%,rgba(15,8,10,.55) 100%)}
.t{position:absolute;left:30px;right:30px;top:${topo}px;text-align:center;color:${cor};text-shadow:0 3px 24px rgba(0,0,0,.35)}
.tag{font:900 34px 'Nunito Sans';letter-spacing:.22em;color:#F1D29A;text-transform:uppercase}
.tag:before,.tag:after{content:"";display:inline-block;width:70px;height:2px;background:#F1D29A;vertical-align:middle;margin:0 22px 6px}
.s{font:italic ${process.env.FINA || 150}px/1 'DM Serif Display';margin-top:14px;white-space:nowrap}
.b{font:800 92px/1.1 'Nunito Sans';text-transform:uppercase;letter-spacing:.1em;white-space:nowrap}
.h{position:absolute;bottom:70px;left:0;right:0;text-align:center;font:700 32px 'Nunito Sans';color:rgba(255,255,255,.9)}
</style><div class="c" id="c">
<div class="l" style="background-image:url(${d(foto)})"></div><div class="l g"></div>
<div class="t">${tag ? `<div class="tag">${esc(tag)}</div>` : ''}<div class="s">${esc(fina)}</div><div class="b">${esc(grossa)}</div></div>
<div class="l p" style="background-image:url(${d(foto)})"></div><div class="l g" style="background:linear-gradient(180deg,transparent 60%,rgba(15,8,10,.55) 100%)"></div>
<div class="h">@daledaia</div></div>`;
(async () => { const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.setContent(html, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
  await p.evaluate(() => document.querySelectorAll('.s,.b').forEach(e => { let f = parseFloat(getComputedStyle(e).fontSize); while (e.scrollWidth > e.clientWidth && f > 50) e.style.fontSize = (f -= 2) + 'px'; }));
  await (await p.$('#c')).screenshot({ path: path.resolve(saida) }); await b.close(); console.log('ok', saida); })();
