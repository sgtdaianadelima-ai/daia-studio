// Guarda o app no celular para abrir rápido e até sem internet.
const VERSAO = "daia-v49";
const ARQUIVOS = ["./", "index.html", "manual.html", "cronograma.html", "plan.js", "prontos.js", "app.js", "estudio.js", "plataformas.js", "repaginada.js", "assunto.js", "video.js", "tts.js", "respostas.js", "curso2.js", "daiaia.js", "plano10.js", "desktop.js", "desktop.css", "ditado.js", "voz.js", "tema.js", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
const PASTA_COMP = "daia-compartilhado"; // vídeo/foto que ela compartilhou da Galeria
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO && k !== PASTA_COMP).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // Galeria › Compartilhar › Daia Studio: guarda o arquivo e abre o app na aba Criar › Meu vídeo
  if (e.request.method === "POST" && url.origin === location.origin && url.pathname.endsWith("/compartilhar")) {
    e.respondWith((async () => {
      try {
        const fd = await e.request.formData();
        const f = fd.get("midia");
        const c = await caches.open(PASTA_COMP);
        if (f && f.size) await c.put("arquivo", new Response(f, {headers: {"Content-Type": f.type || "application/octet-stream", "X-Nome": encodeURIComponent(f.name || "")}}));
        const txt = [fd.get("title"), fd.get("text"), fd.get("url")].filter(Boolean).join(" ");
        if (txt) await c.put("texto", new Response(txt));
      } catch (_) {}
      return Response.redirect("./?compartilhado=1", 303);
    })());
    return;
  }
  if (e.request.method !== "GET") return;
  if (url.origin !== location.origin) return;
  // Primeiro tenta a internet (para pegar a versão nova); sem internet, usa a cópia guardada.
  e.respondWith(fetch(e.request, {cache: "no-cache"}).then(r => { const copy = r.clone(); caches.open(VERSAO).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});
