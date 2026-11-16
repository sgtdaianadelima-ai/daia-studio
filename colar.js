// v61 — "Colar do Claude" no Dia de gravar: ela cola o bloco "Para colar no app" do Projeto Roteiros Daia
// e todos os produtos e roteiros (10 TikTok + 1 Instagram por produto) entram de uma vez, editáveis.
// Não apaga nada do que ela já marcou: produto que já existe no dia recebe os roteiros novos.
(function () {
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const A = () => window.daiaApp || {};
  const aviso = m => { try { A().toast(m); } catch (_) {} };
  const sem = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  // formato que o Claude escreveu → formato do app
  function formatoDo(f) {
    const s = sem(f);
    if (/pov/.test(s)) return "pov";
    if (/mao/.test(s)) return "maos";
    if (/antes/.test(s)) return "antes";
    if (/motivo/.test(s)) return "motivos";
    if (/unbox|chegou|recebi/.test(s)) return "unbox";
    if (/demonstr|uso|funciona/.test(s)) return "demo";
    if (/story|historia/.test(s)) return "historia";
    if (/narrad|voz|off/.test(s)) return "narrado";
    if (/compar|x /.test(s)) return "compara";
    if (/respond|comentario/.test(s)) return "resp";
    if (/pergunta|engaj/.test(s)) return "engaja";
    return null;
  }
  // acha o JSON no meio do texto colado (ela pode colar a resposta inteira)
  function ler(txt) {
    const t = String(txt || "");
    const tenta = s => { try { const o = JSON.parse(s); return o && Array.isArray(o.produtos) ? o : null; } catch (_) { return null; } };
    let o = tenta(t.trim()); if (o) return o;
    const blocos = t.match(/```(?:json)?\s*([\s\S]*?)```/g) || [];
    for (const b of blocos) { o = tenta(b.replace(/```(?:json)?/g, "").trim()); if (o) return o; }
    const i = t.indexOf('{"produtos"') >= 0 ? t.indexOf('{"produtos"') : t.search(/\{\s*"produtos"/);
    if (i >= 0) { for (let j = t.lastIndexOf("}"); j > i; j = t.lastIndexOf("}", j - 1)) { o = tenta(t.slice(i, j + 1)); if (o) return o; } }
    return null;
  }
  const roteiro = v => { const c = (v.cenas || []).filter(Boolean).map((x, i) => (i + 1) + ". " + x).join("\n"); return c + (v.tela ? (c ? "\n" : "") + "Texto na tela: " + v.tela : ""); };

  function colocar(dados, diaK, marcados) {
    const app = A(), L = app.L, FT = app.FT || {};
    if (!L || !(diaK === "dividir" ? L.sab && L.dom : L[diaK])) return 0;
    let n = 0;
    dados.produtos.forEach((p, ip) => {
      if (!marcados.includes(ip) || !p || !p.n) return;
      const k = diaK === "dividir" ? (n % 2 === 0 ? "sab" : "dom") : diaK;
      const D = L[k];
      let P = D.prods.find(x => sem(x.n) === sem(p.n));
      if (!P) { P = { n: String(p.n).trim(), dores: [], dSel: [], q: {}, v: {} }; D.prods.push(P); }
      P.q = P.q || {}; P.v = P.v || {};
      // dores do Claude
      (p.dores || []).forEach(d => { if (!d) return; if (!P.dores.some(x => sem(x.d) === sem(d))) P.dores.push({ d: String(d), f: String(d) }); const i = P.dores.findIndex(x => sem(x.d) === sem(d)); if (!P.dSel.includes(i)) P.dSel.push(i); });
      if (!P.dSel.length && P.dores.length) P.dSel = [0];
      // 10 TikTok
      (p.tiktok || []).forEach(v => {
        let fk = formatoDo(v.formato);
        const ed = { g: v.gancho || "", r: roteiro(v), leg: v.legenda || "" };
        if (fk && FT[fk]) {
          const j = P.q[fk] || 0; P.q[fk] = j + 1;
          if (FT[fk].cta) ed.cta = v.cta || "";
          P.v[fk + "-" + j] = { gi: j, ci: j, ed, ok: false };
        } else {
          P.ex = P.ex || []; const i = P.ex.length;
          P.ex.push({ n: v.formato || "Formato do Claude", g: v.gancho || "", cta: !!v.cta, r: roteiro(v), q: 1 });
          if (v.cta) ed.cta = v.cta;
          P.v["x" + i + "-0"] = { gi: 0, ci: 0, ed, ok: false };
        }
      });
      // 1 Instagram (vídeo de valor)
      const ig = p.instagram;
      if (ig && (ig.gancho || ig.ideia)) {
        P.ex = P.ex || []; const i = P.ex.length;
        P.ex.push({ n: "Instagram · " + (ig.ideia ? String(ig.ideia).slice(0, 40) : "vídeo de valor"), g: ig.gancho || ig.ideia, cta: true, r: roteiro(ig), q: 1 });
        P.v["x" + i + "-0"] = { gi: 0, ci: 0, ed: { g: ig.gancho || ig.ideia || "", r: roteiro(ig), cta: ig.cta || "", leg: ig.legenda || "" }, ok: false };
      }
      n++;
    });
    app.salvaL(); return n;
  }

  // ---------- a tela (3 passos: Colar › Conferir › Pronto) ----------
  let dados = null, diaEsc = "sab";
  function monta() {
    const ref = document.querySelector('#t-lote details.ckb'); if (!ref || $("cl6")) return;
    ref.insertAdjacentHTML("beforebegin",
      '<div id="cl6"><button class="cl6-bt" data-cl="abrir"><span class="ic">✦</span><span><b>Colar do Claude</b><small>Traga todos os produtos e roteiros de uma vez</small></span></button>' +
      '<div class="cl6-blk" id="cl6p" hidden></div></div>');
  }
  function passo1() {
    $("cl6p").hidden = false;
    $("cl6p").innerHTML = '<div class="cl6-passos"><span class="on">1 Colar</span><span>2 Conferir</span><span>3 Pronto</span></div>' +
      '<p class="mini">No Projeto Roteiros Daia, copie o bloco <b>"Para colar no app"</b> (o botão de copiar fica no canto do bloco) e cole aqui. Se colar a resposta inteira, o app acha o bloco sozinho.</p>' +
      '<textarea id="cl6t" aria-label="Texto copiado do Claude" placeholder="Cole aqui"></textarea>' +
      '<div class="cl6-bts"><button class="bt pri" data-cl="ler">Ler o que colei</button><button class="bt" data-cl="fechar">Fechar</button></div>';
  }
  function passo2() {
    const P = dados.produtos, tt = P.reduce((s, p) => s + (p.tiktok || []).length, 0), ig = P.filter(p => p.instagram).length;
    $("cl6p").innerHTML = '<div class="cl6-passos"><span>1 Colar</span><span class="on">2 Conferir</span><span>3 Pronto</span></div>' +
      '<div class="cl6-res"><div><b>' + P.length + '</b><small>produtos</small></div><div><b>' + tt + '</b><small>TikTok</small></div><div><b>' + ig + '</b><small>Instagram</small></div></div>' +
      P.map((p, i) => '<label class="cl6-prod"><input type="checkbox" checked data-clp="' + i + '"><span><b>' + esc(p.n) + '</b><small>' + (p.tiktok || []).length + ' TikTok · ' + (p.instagram ? 1 : 0) + ' Instagram' + ((p.dores || []).length ? ' · dores: ' + esc(p.dores.join(", ")) : '') + '</small></span></label>').join("") +
      '<p class="mini">Colocar no dia:</p><div class="cl6-chips">' + [["sab", "Sábado"], ["dom", "Domingo"], ["dividir", "Dividir entre os dois"]].map(d => '<button class="cl6-chip" aria-pressed="' + (diaEsc === d[0]) + '" data-cldia="' + d[0] + '">' + d[1] + '</button>').join("") + '</div>' +
      '<p class="mini">Produto que já está no dia: os roteiros novos entram nele, sem apagar o que você já marcou (Gravei, Postei).</p>' +
      '<div class="cl6-bts"><button class="bt pri" data-cl="add">Adicionar ao Dia de gravar</button><button class="bt" data-cl="voltar1">Voltar</button></div>';
  }
  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest("[data-cl],[data-cldia]"); if (!b || !b.closest("#cl6")) return;
    if (b.dataset.cldia) { diaEsc = b.dataset.cldia; passo2(); return; }
    const a = b.dataset.cl;
    if (a === "abrir") { const p = $("cl6p"); if (!p.hidden) { p.hidden = true; return; } passo1(); setTimeout(() => { const t = $("cl6t"); if (t) t.focus(); }, 50); return; }
    if (a === "fechar") { $("cl6p").hidden = true; return; }
    if (a === "ler") { dados = ler($("cl6t").value); if (!dados || !dados.produtos.length) { aviso("Não achei o bloco do Claude. Copie o \"Para colar no app\" inteiro."); return; } diaEsc = A().dia === "dom" ? "dom" : "sab"; passo2(); return; }
    if (a === "voltar1") { passo1(); return; }
    if (a === "add") {
      const marc = [...document.querySelectorAll("[data-clp]")].filter(x => x.checked).map(x => +x.dataset.clp);
      if (!marc.length) { aviso("Marque pelo menos um produto"); return; }
      const n = colocar(dados, diaEsc, marc);
      const vids = marc.reduce((s, i) => s + (dados.produtos[i].tiktok || []).length + (dados.produtos[i].instagram ? 1 : 0), 0);
      const onde = diaEsc === "dividir" ? "no sábado e no domingo" : diaEsc === "dom" ? "no domingo" : "no sábado";
      if (diaEsc !== "dividir" && A().dia !== diaEsc) { const t = document.querySelector('#t-lote [data-dia="' + diaEsc + '"]'); if (t) t.click(); }
      try { A().lote(); } catch (_) {}
      $("cl6p").hidden = false;
      $("cl6p").innerHTML = '<div class="cl6-ok">✓ ' + n + ' produto' + (n > 1 ? 's' : '') + ' e ' + vids + ' roteiros entraram ' + onde + '.</div><p class="mini">Abra cada produto em Roteiros: está tudo editável, com Gravei, Precisa editar, Agendei e Postei.</p><div class="cl6-bts"><button class="bt" data-cl="fechar">Fechar</button></div>';
      aviso("Roteiros do Claude no Dia de gravar");
    }
  });

  const st = document.createElement("style");
  st.textContent = `
#cl6{margin:14px 0 4px;display:grid;gap:8px}
.cl6-bt{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:14px;border-radius:18px;background:var(--acc);color:#fff}
.cl6-bt .ic{width:38px;height:38px;border-radius:12px;background:rgba(255,255,255,.18);display:grid;place-items:center;font-size:20px;flex:none}
.cl6-bt b{display:block;font-size:15.5px}.cl6-bt small{opacity:.85;font-size:12.5px}
.cl6-blk{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:14px;display:grid;gap:10px}
.cl6-blk[hidden]{display:none!important}
.cl6-passos{display:flex;gap:6px;font-size:12px;color:var(--mute)}.cl6-passos span{flex:1;text-align:center;padding:5px;border-radius:99px;background:var(--line)}.cl6-passos span.on{background:var(--ink);color:var(--bg);font-weight:600}
#cl6t{width:100%;min-height:140px;border:1px solid var(--line);border-radius:12px;padding:10px 12px;background:var(--bg);color:var(--ink);font-size:12.5px;font-family:ui-monospace,Consolas,monospace;resize:vertical}
.cl6-bts{display:flex;gap:8px;flex-wrap:wrap}
.cl6-res{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;text-align:center}.cl6-res div{background:var(--bg);border-radius:12px;padding:8px 4px}.cl6-res b{display:block;font-family:var(--fn);font-size:22px}.cl6-res small{font-size:11px;color:var(--mute)}
.cl6-prod{display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-top:1px solid var(--line)}.cl6-prod input{width:20px;height:20px;accent-color:var(--acc);margin-top:2px;flex:none}
.cl6-prod b{display:block;font-size:14.5px}.cl6-prod small{color:var(--mute);font-size:12px}
.cl6-chips{display:flex;gap:6px;flex-wrap:wrap}.cl6-chip{padding:7px 13px;border-radius:99px;border:1px solid var(--line);background:var(--card);font-size:13px}.cl6-chip[aria-pressed="true"]{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.cl6-ok{background:var(--ok-soft);color:var(--ok);border-radius:14px;padding:12px;font-weight:600;font-size:14px}`;
  document.head.appendChild(st);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", monta); else monta();
  window.daiaColar = { ler, colocar, formatoDo };
})();
