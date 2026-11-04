// Capa com o texto ATRÁS da pessoa (efeito revista).
// Uso: node capas/capa-atras.js foto.png mascara.png saida.png "TAG" "linha fina" "LINHA GROSSA" [topo=250] ["frase com *destaque*"]
// ALINHAR=left ESQ=50 DIR=380: tira o texto do meio quando a cabeça tampa (só o braço/cabelo passa na frente).
// VEU=1: sombra suave só atrás do texto (texto em cima ou no meio, sobre fundo claro).
// BRILHO=1: a camada da frente (ex.: luzinhas) fica sem a sombra, brilhando por cima do texto.
// Mesmo padrão da identidade (fazer-capa.js): tag dourada, fina 116px, grossa 70px espaçada, frase com palavra dourada.
// mascara.png = recorte da pessoa (branco = pessoa), feito com:
//   python3 -c "from rembg import remove,new_session;from PIL import Image;remove(Image.open('foto.png').convert('RGB'),session=new_session('u2net_human_seg'),only_mask=True).convert('L').save('m.png')" e depois virar transparência: m=Image.open('m.png'); r=Image.new('RGBA',m.size); r.putalpha(m); r.save('mascara.png')
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const [foto, mascara, saida, tag = '', fina = '', grossa = '', topo = '250', frase = ''] = process.argv.slice(2), cor = '#FFFFFF';
const d = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const html = `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Nunito+Sans:opsz,wght@6..12,700;6..12,800;6..12,900&display=swap">
<style>body{margin:0}.c{width:1080px;height:1920px;position:relative;overflow:hidden}
.l{position:absolute;inset:0;background-position:center;background-size:cover}
.p{-webkit-mask-image:url(${d(mascara)});mask-image:url(${d(mascara)});-webkit-mask-size:cover;mask-size:cover;-webkit-mask-position:center;mask-position:center}
.g{background:${process.env.ALINHAR ? "linear-gradient(180deg,rgba(15,8,10,.38) 0%,rgba(15,8,10,.12) 45%,rgba(15,8,10,.12) 70%,rgba(15,8,10,.55) 100%)" : "linear-gradient(180deg,rgba(15,8,10,.15) 0%,rgba(15,8,10,.12) 40%,rgba(15,8,10,.55) 62%,rgba(15,8,10,.82) 100%)"}}
.t{position:absolute;left:${process.env.ESQ || 30}px;right:${process.env.DIR || 30}px;top:${topo}px;text-align:${process.env.ALINHAR || 'center'};color:${cor};text-shadow:0 3px 24px rgba(0,0,0,.35)}
.tag{font:900 ${process.env.TAGT || (process.env.ESQ ? 27 : 34)}px 'Nunito Sans';letter-spacing:.2em;color:#F1D29A;text-transform:uppercase;white-space:nowrap}
.tag:before,.tag:after{content:"";display:inline-block;width:70px;height:2px;background:#F1D29A;vertical-align:middle;margin:0 16px 6px}
${process.env.ALINHAR && process.env.ALINHAR !== "center" ? ".tag:before,.tag:after{display:none}.tag{letter-spacing:.16em}" : ""}
.s{font:italic ${process.env.FINA || 116}px/1.02 'DM Serif Display';margin-top:18px;white-space:nowrap}
.b{font:800 ${process.env.GROSSA || 70}px/1.15 'Nunito Sans';text-transform:uppercase;letter-spacing:.08em;margin-top:6px;white-space:nowrap}
.f{font:700 40px 'Nunito Sans';margin-top:26px}.f b{color:#F1D29A}
.h{position:absolute;bottom:70px;left:0;right:0;text-align:center;font:700 32px 'Nunito Sans';color:rgba(255,255,255,.9)}
</style><div class="c" id="c">
<div class="l" style="background-image:url(${d(foto)})"></div><div class="l g"></div>
${process.env.VEU ? `<div style="position:absolute;left:-200px;right:-200px;top:${topo-140}px;height:640px;background:radial-gradient(ellipse at center,rgba(15,8,10,.62) 0%,rgba(15,8,10,.35) 45%,transparent 72%)"></div>` : ''}<div class="t">${tag ? `<div class="tag">${esc(tag)}</div>` : ''}<div class="s">${esc(fina)}</div><div class="b">${esc(grossa)}</div>${frase ? `<div class="f">${esc(frase).replace(/\*(.+?)\*/g, '<b>$1</b>')}</div>` : ''}</div>
<div class="l p"><div class="l" style="background-image:url(${d(foto)})"></div>${process.env.BRILHO ? "" : `<div class="l g"></div>`}</div>
<div class="h">@daledaia</div></div>`;
(async () => { const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.setContent(html, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
  await p.evaluate(() => document.querySelectorAll('.tag,.s,.b').forEach(e => { let f = parseFloat(getComputedStyle(e).fontSize); while (e.scrollWidth > e.clientWidth && f > 50) e.style.fontSize = (f -= 2) + 'px'; }));
  await (await p.$('#c')).screenshot({ path: path.resolve(saida) }); await b.close(); console.log('ok', saida); })();
