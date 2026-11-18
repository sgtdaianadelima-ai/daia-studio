// v58 — Aparelhos ligados: celular, tablet e computador guardam os mesmos dados.
// Os dados ficam num arquivo do Google Drive dela (pasta Afiliados), por um programinha dela no Google.
// O endereço desse programa NÃO fica aqui (o site é público): cada aparelho recebe pelo link de ligar
// (novo.html#ligar=CÓDIGO) ou colando o código em Ajustes, e guarda só no próprio aparelho.
(function () {
  const EK = "daia-sync-url", MK = "daia-sync-meta", NK = "daia-sync-novo", HK = "daia-sync-hora";
  const ok = k => (k.indexOf("daia-") === 0 || k === "est-sel") && k.indexOf("daia-sync") !== 0;
  let ls; try { ls = window.localStorage; } catch (_) { return; }
  if (!ls) return;
  const origSet = Storage.prototype.setItem, origRem = Storage.prototype.removeItem;
  const get = k => { try { return ls.getItem(k); } catch (_) { return null; } };
  const put = (k, v) => { try { origSet.call(ls, k, v); } catch (_) {} };
  const del = k => { try { origRem.call(ls, k); } catch (_) {} };
  const codigoOk = c => /^[A-Za-z0-9_-]{20,}$/.test(c || "");

  function ligar(cod) {
    if (!codigoOk(cod)) return false;
    put(EK, cod); put(NK, "1"); return true;
  }
  // link de ligar
  const m = location.hash.match(/^#ligar=([A-Za-z0-9_-]{20,})$/);
  if (m) { ligar(m[1]); try { history.replaceState(null, "", location.pathname + location.search + "#pers"); } catch (_) {} }
  window.addEventListener("hashchange", () => {
    const h = location.hash.match(/^#ligar=([A-Za-z0-9_-]{20,})$/);
    if (h && ligar(h[1])) { try { history.replaceState(null, "", location.pathname + location.search + "#pers"); } catch (_) {} location.reload(); }
  });

  const api = { ligado: false, ligar: c => { if (ligar(String(c).trim().replace(/^.*\/s\/|\/exec.*$/g, ""))) { location.reload(); return true; } return false; } };
  window.daiaSync = api;
  let situ = "…";
  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest("[data-sync]");
    if (!b) return;
    const a = b.dataset.sync;
    if (a === "ligar") { const v = (document.getElementById("syncCod") || {}).value || ""; if (!api.ligar(v)) alertaCod(); }
    if (a === "agora" && api.ligado) { situ = "…"; pinta(); api.trocar(); }
    if (a === "desligar") { del(EK); del(MK); del(HK); location.reload(); }
  });
  function alertaCod() { const i = document.getElementById("syncCod"); if (i) { i.value = ""; i.placeholder = "Código não reconhecido. Cole de novo."; } }
  api.pinta = pinta;
  const id = get(EK);
  if (!id) { document.addEventListener("DOMContentLoaded", pinta); return; }
  api.ligado = true;
  const URL = "https://script.google.com/macros/s/" + id + "/exec";

  let meta = {}; try { meta = JSON.parse(get(MK) || "{}") || {}; } catch (_) {}
  const salvaMeta = () => put(MK, JSON.stringify(meta));
  let pend = {}, tm = null, aplicando = false, esperaRecarregar = false;

  function marca(k) {
    if (aplicando || !ok(k)) return;
    meta[k] = Date.now(); salvaMeta(); pend[k] = 1;
    clearTimeout(tm); tm = setTimeout(envia, 2500);
  }
  // só conta como mudança quando o valor muda de verdade (evita ficar recarregando um aparelho por causa do outro)
  Storage.prototype.setItem = function (k, v) {
    const antes = this === ls ? get(k) : null;
    origSet.call(this, k, v);
    if (this === ls && antes !== String(v)) marca(String(k));
  };
  Storage.prototype.removeItem = function (k) {
    const antes = this === ls ? get(k) : null;
    origRem.call(this, k);
    if (this === ls && antes !== null) marca(String(k));
  };

  const pacote = ks => { const d = {}; ks.forEach(k => { d[k] = { v: get(k), t: meta[k] || 0 }; }); return d; };

  async function envia() {
    const ks = Object.keys(pend); pend = {};
    if (!ks.length) return;
    try {
      const r = await fetch(URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ d: pacote(ks) }) });
      aplica(await r.json(), true); estado("ok");
    } catch (_) { ks.forEach(k => { pend[k] = 1; }); estado("erro"); }
  }

  function aplica(rem, recarrega) {
    let mud = false; aplicando = true;
    try {
      for (const k in rem) {
        if (!ok(k)) continue;
        const x = rem[k];
        if (!x || typeof x.t !== "number") continue;
        if (x.t > (meta[k] || 0)) {
          if (x.v === null || x.v === undefined) { if (get(k) !== null) mud = true; del(k); }
          else { if (get(k) !== x.v) mud = true; put(k, x.v); }
          meta[k] = x.t;
        }
      }
    } finally { aplicando = false; }
    salvaMeta();
    if (mud && recarrega) recarregar();
    return mud;
  }

  // recarrega a tela para mostrar o que veio do outro aparelho (nunca no meio de uma digitação)
  function recarregar() {
    // no máximo uma recarga a cada 30 s (os dados já estão salvos; a tela atualiza na próxima vez)
    try { const u = Number(sessionStorage.getItem("daia-sync-rl") || 0); if (Date.now() - u < 30000) return; sessionStorage.setItem("daia-sync-rl", String(Date.now())); } catch (_) {}
    const a = document.activeElement;
    if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) {
      if (!esperaRecarregar) { esperaRecarregar = true; a.addEventListener("blur", () => setTimeout(() => location.reload(), 300), { once: true }); }
      return;
    }
    location.reload();
  }

  async function puxa() {
    try {
      const r = await fetch(URL + "?t=" + Date.now());
      const rem = await r.json();
      const locais = Object.keys(ls).filter(k => ok(k) && get(k) !== null);
      if (get(NK) === "1") {
        del(NK);
        const vazio = !Object.keys(rem).some(k => ok(k) && rem[k] && rem[k].v !== null && rem[k].v !== undefined);
        if (vazio) { // primeiro aparelho: manda tudo o que tem aqui
          const t = Date.now(); locais.forEach(k => { meta[k] = t; pend[k] = 1; }); salvaMeta();
          await envia(); return;
        }
        // aparelho novo com a nuvem já cheia: em cada parte fica a versão que tem MAIS coisa
        // (assim não importa se ela liga primeiro o celular ou o tablet: nada do que ela fez se perde)
        const t = Date.now();
        locais.forEach(k => {
          if (!(k in rem)) return;
          const lv = get(k) || "", rv = (rem[k] && rem[k].v) || "";
          if (lv.length > rv.length) { meta[k] = t; pend[k] = 1; } else meta[k] = 0;
        });
        salvaMeta();
      }
      const faltam = locais.filter(k => !(k in rem));
      faltam.forEach(k => { if (!meta[k]) meta[k] = 1; pend[k] = 1; });
      salvaMeta();
      aplica(rem, true);
      if (Object.keys(pend).length) await envia(); else estado("ok");
    } catch (_) { estado("erro"); }
  }

  function estado(s) {
    situ = s;
    if (s === "ok") put(HK, String(Date.now()));
    pinta();
  }

  function hora() {
    const h = Number(get(HK) || 0); if (!h) return "";
    const d = new Date(h); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  }

  // quadrinho em Ajustes (novo.html: <div id="syncBox">)
  function pinta() {
    const b = document.getElementById("syncBox");
    if (!b) return;
    if (!api.ligado) {
      b.innerHTML = '<p class="mini">Este aparelho ainda não está ligado. Abra o link de ligar que você recebeu, ou cole o código aqui.</p>' +
        '<div class="syncl"><input id="syncCod" placeholder="Código de ligar"><button class="bt" data-sync="ligar">Ligar</button></div>';
      return;
    }
    const txt = situ === "erro" ? "Sem internet agora. Guardo aqui e mando quando voltar." : (hora() ? "Ligado. Última troca às " + hora() + "." : "Ligado. Conferindo…");
    b.innerHTML = '<p class="mini"><b>' + (situ === "erro" ? "!" : "✓") + "</b> " + txt + " O que você faz aqui aparece no celular, no tablet e no computador.</p>" +
      '<div class="syncl"><button class="bt" data-sync="agora">Trocar agora</button><button class="bt lite" data-sync="desligar">Desligar este aparelho</button></div>';
  }

  api.trocar = () => (Object.keys(pend).length ? envia().then(puxa) : puxa());
  document.addEventListener("DOMContentLoaded", () => { pinta(); puxa(); });
  if (document.readyState !== "loading") { pinta(); puxa(); }
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") puxa(); else if (Object.keys(pend).length && navigator.sendBeacon) { const ks = Object.keys(pend); pend = {}; navigator.sendBeacon(URL, new Blob([JSON.stringify({ d: pacote(ks) })], { type: "text/plain" })); } });
  setInterval(() => { if (document.visibilityState === "visible") puxa(); }, 60000);
})();
