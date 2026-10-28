# Uso: python3 capas/embelezar.py foto.jpg saida.jpg
# Deixa a foto no padrão Dale Daia: luz quente, clara, brilho suave, luzinhas desfocadas, vinheta.
import sys, numpy as np, random
from PIL import Image, ImageFilter, ImageEnhance
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB'); W, H = im.size
a = np.asarray(im).astype(np.float32) / 255
# 1) balanço de branco: parede cinza-azulada -> creme quente
a[..., 0] *= 1.06; a[..., 1] *= 0.97; a[..., 2] *= 0.80
# 2) clarear sombras e meios-tons (curva suave)
a = np.clip(a, 0, 1); a = 1 - (1 - a) ** 1.12
# 3) luz de abajur vindo do canto de cima à esquerda + leve do lado direito
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
def luz(cx, cy, r, f): return f * np.exp(-(((xx - cx) ** 2 + (yy - cy) ** 2) / (2 * r * r)))[..., None]
quente = np.array([1.0, 0.72, 0.38], np.float32)
a = a + (luz(0.5*W, 0.42*H, 0.42*W, 0.16) + luz(-0.05*W, 0.2*H, 0.35*W, 0.14)) * quente
# 4) vinheta quente (cantos mais escuros e dourados)
d = np.sqrt(((xx - W/2) / (W*0.75)) ** 2 + ((yy - H*0.45) / (H*0.65)) ** 2)
v = np.clip(1 - 0.75 * d ** 1.8, 0.25, 1)[..., None]
a = a * v + (1 - v) * np.array([0.10, 0.05, 0.03], np.float32)
im = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))
# 5) cor e contraste
im = ImageEnhance.Color(im).enhance(1.25); im = ImageEnhance.Contrast(im).enhance(1.06); im = ImageEnhance.Brightness(im).enhance(1.05)
# 6) brilho suave (bloom) nas partes claras
claro = im.point(lambda v: max(0, v - 205) * 3).filter(ImageFilter.GaussianBlur(W * 0.025))
im = Image.blend(im, Image.fromarray(np.clip(np.asarray(im, np.float32) + np.asarray(claro, np.float32) * 0.25, 0, 255).astype(np.uint8)), 1)
# 7) luzinhas desfocadas (bokeh) nas bordas, longe do centro
random.seed(7); bok = Image.new('RGB', (W, H), 0); from PIL import ImageDraw; dr = ImageDraw.Draw(bok)
for _ in range(26):
    x = random.random() * W; y = random.random() * H
    if 0.08*W < x < 0.92*W and 0.12*H < y < 0.88*H: continue
    r = random.uniform(W*0.010, W*0.030); c = random.choice([(255,190,110),(255,215,150),(255,170,90)]); k = random.uniform(.25,.6)
    dr.ellipse((x-r, y-r, x+r, y+r), fill=tuple(int(v*k) for v in c))
bok = bok.filter(ImageFilter.GaussianBlur(W*0.008))
im = Image.fromarray(np.clip(np.asarray(im, np.float32) + np.asarray(bok, np.float32) * 0.45, 0, 255).astype(np.uint8))
# 8) nitidez leve no enfeite
im = im.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=3))
im.save(out, quality=95)
