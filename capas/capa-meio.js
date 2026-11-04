// Capa com o texto num bloco no meio da foto (bom para montagem com linha de divisão no meio).
// Uso: ESTILO=faixa|cartao|vidro node capas/capa-meio.js foto saida.png "TAG" "fina" "GROSSA" "frase *x*" [centroY=957]
// Cores e letras da identidade: vinho #7A1F2B, creme #FBF7F2, dourado #F1D29A/#C9A46A, DM Serif Display itálico + Nunito Sans.
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const [foto, saida, tag = '', fina = '', grossa = '', frase = '', cy = '957'] = process.argv.slice(2);
const estilo = process.env.ESTILO || 'faixa';
const img = 'data:image/png;base64,' + fs.readFileSync(foto).toString('base64');
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const fr = esc(frase).replace(/\*(.+?)\*/g, '<b>$1</b>');
const E = {
  faixa: { box: 'left:0;right:0;padding:56px 40px 60px;background:rgba(122,31,43,.88);border-top:2px solid #C9A46A;border-bottom:2px solid #C9A46A', cor: '#fff', tag: '#F1D29A', dest: '#F1D29A', sombra: 'none' },
  cartao: { box: 'left:70px;right:70px;padding:58px 40px 62px;background:rgba(251,247,242,.94);border-radius:28px;box-shadow:0 20px 60px rgba(0,0,0,.35);outline:2px solid #C9A46A;outline-offset:-16px', cor: '#7A1F2B', tag: '#B08A4E', dest: '#B08A4E', sombra: 'none' },
  vidro: { box: 'left:60px;right:60px;padding:58px 40px 62px;background:rgba(20,10,12,.42);backdrop-filter:blur(18px) saturate(1.1);-webkit-backdrop-filter:blur(18px);border:1.5px solid rgba(241,210,154,.75);border-radius:30px', cor: '#fff', tag: '#F1D29A', dest: '#F1D29A', sombra: '0 2px 14px rgba(0,0,0,.35)' },
}[estilo];
const html = `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Nunito+Sans:opsz,wght@6..12,700;6..12,800;6..12,900&display=swap">
<style>body{margin:0}.c{width:1080px;height:1920px;position:relative;overflow:hidden;background:#1A1114 url(${img}) center/cover}
.g{position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,8,10,.10),rgba(15,8,10,.05) 40%,rgba(15,8,10,.35) 100%)}
.b{position:absolute;${E.box};text-align:center;color:${E.cor};text-shadow:${E.sombra}}
.tag{font:900 30px 'Nunito Sans';letter-spacing:.24em;color:${E.tag};text-transform:uppercase}
.tag:before,.tag:after{content:"";display:inline-block;width:60px;height:2px;background:${E.tag};vertical-align:middle;margin:0 20px 6px}
.s{font:italic 116px/1.02 'DM Serif Display';margin-top:14px;white-space:nowrap}
.k{font:800 64px/1.15 'Nunito Sans';text-transform:uppercase;letter-spacing:.08em;margin-top:6px;white-space:nowrap}
.f{font:700 40px 'Nunito Sans';margin-top:22px}.f b{color:${E.dest}}
.h{position:absolute;bottom:70px;left:0;right:0;text-align:center;font:700 32px 'Nunito Sans';color:rgba(255,255,255,.9)}
</style><div class="c" id="c"><div class="g"></div>
<div class="b" id="b">${tag ? `<div class="tag">${esc(tag)}</div>` : ''}<div class="s">${esc(fina)}</div><div class="k">${esc(grossa)}</div>${frase ? `<div class="f">${fr}</div>` : ''}</div>
<div class="h">@daledaia</div></div>`;
(async () => { const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.setContent(html, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
  await p.evaluate(cy => { document.querySelectorAll('.s,.k').forEach(e => { let f = parseFloat(getComputedStyle(e).fontSize); while (e.scrollWidth > e.clientWidth && f > 40) e.style.fontSize = (f -= 2) + 'px'; });
    const b = document.getElementById('b'); b.style.top = (cy - b.offsetHeight / 2) + 'px'; }, Number(cy));
  await (await p.$('#c')).screenshot({ path: path.resolve(saida) }); await b.close(); console.log('ok', saida); })();
