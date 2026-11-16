// v62 — Dia de gravar flexível: ela anota qualquer dia em que grava (não só sábado e domingo),
// vê quantos faltam para postar HOJE (para nunca ficar sem postar), quantos dias de reserva já tem
// e coloca a meta da gravação do jeito dela (sai a obrigação dos 60 por dia).
(function () {
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const A = () => window.daiaApp || {};
  const aviso = m => { try { A().toast(m); } catch (_) {} };
  const SEM = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const iso = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const ddmm = d => String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0");
  const hojeISO = () => iso(new Date());
  let escolhendo = false, escolha = 0;

  function rotulo(k) {
    const L = A().L, D = L && L[k]; if (!D) return k;
    if (D.data) { const [y, m, d] = D.data.split("-").map(Number), dt = new Date(y, m - 1, d); return { n: D.data === hojeISO() ? "Hoje" : SEM[dt.getDay()], d: ddmm(dt) }; }
    return { n: k === "sab" ? "Sábado" : k === "dom" ? "Domingo" : (D.nome || k), d: "fim de semana" };
  }
  const metaHoje = () => (window.daiaCrono ? daiaCrono.metaDia("tiktok", A().hojeIdx()) : 10);

  function pinta() {
    const app = A(), L = app.L, box = $("dgDias"); if (!L || !box || !app.DK) return;
    const ks = app.DK(), dia = app.dia;
    box.innerHTML = ks.map(k => { const r = rotulo(k), n = app.feitos(k); return '<button class="dg-dia" data-dia="' + k + '" aria-pressed="' + (k === dia) + '"><b>' + esc(r.n) + '</b><small>' + esc(r.d) + ' · ' + n + ' gravado' + (n === 1 ? '' : 's') + '</small></button>'; }).join("") +
      '<button class="dg-dia dg-mais" data-dg="mais">+ Gravar em<br>outro dia</button>';
    // escolher o dia novo
    let esc2 = "";
    if (escolhendo) {
      const ops = []; for (let i = 0; i < 7; i++) { const d = new Date(); d.setDate(d.getDate() + i); ops.push([i, i === 0 ? "Hoje" : i === 1 ? "Amanhã" : SEM[d.getDay()], ddmm(d)]); }
      esc2 = '<div class="dg-esc"><p class="mini">Em que dia você vai gravar?</p><div class="dg-chips">' + ops.map(o => '<button class="dg-chip" aria-pressed="' + (o[0] === escolha) + '" data-dgop="' + o[0] + '">' + o[1] + ' <small>' + o[2] + '</small></button>').join("") + '</div>' +
        '<div class="dg-bts"><button class="bt pri" data-dg="anota">Anotar este dia</button><button class="bt" data-dg="cancela">Cancelar</button></div></div>';
    }
    const extra = L[dia] && L[dia].data;
    box.insertAdjacentHTML("afterend", "");
    const h = $("dgHoje"); if (!h) return;
    // faltam para hoje + reserva + semana + meta da sessão
    let lista = []; try { lista = app.listaDo(app.hojeIdx()); } catch (_) {}
    const cap = metaHoje(), prontos = lista.filter(v => v.st === "ok" || v.st === "gr").length, falta = Math.max(0, cap - prontos);
    const ideias = lista.filter(v => v.st === "id");
    let gr = 0, tot = 0; app.DK().forEach(k => L[k].prods.forEach(P => app.vidsDe(P).forEach(v => { if (v.st.ok) { tot++; const id = k + "|" + P.n + "|" + v.key; if (!(L.post || {})[id]) gr++; } })));
    let semana = 0; for (let i = 0; i < 7; i++) semana += window.daiaCrono ? daiaCrono.metaDia("tiktok", i) : 10;
    const reserva = cap ? Math.round(gr / cap * 10) / 10 : 0, faltaSem = Math.max(0, semana - tot);
    const D = L[dia] || {}, meta = D.meta || 20, feitosDia = app.feitos(dia);
    h.innerHTML = esc2 +
      (extra ? '<p class="mini dg-tira">Gravando em ' + esc(rotulo(dia).n.toLowerCase()) + ' ' + esc(rotulo(dia).d) + '. <button class="dg-lk" data-dg="tira">Tirar este dia</button></p>' : '') +
      '<div class="dg-hoje' + (falta ? '' : ' ok') + '"><div class="l1"><span class="num">' + falta + '</span><span class="tx">' + (falta ? 'faltam para postar <b>hoje</b> (' + prontos + ' de ' + cap + ' prontos)' : 'Hoje está garantido! (' + prontos + ' de ' + cap + ' prontos)') + '</span></div>' +
        (falta ? '<p class="rap">Grave estes primeiro, nos formatos rápidos (sem CTA, 15 a 20 s):</p>' + (ideias.length ? '<ol>' + ideias.slice(0, 4).map(v => '<li>' + esc(v.t) + '</li>').join("") + (ideias.length > 4 ? '<li>+ ' + (Math.min(falta, ideias.length) - 4 > 0 ? (Math.min(falta, ideias.length) - 4) + ' do mesmo jeito' : 'os outros da Lista de hoje') + '</li>' : '') + '</ol>' : '<p class="rap">Adicione produtos aqui embaixo (ou use o Colar do Claude) para eu montar a lista.</p>') + '<button class="bt dg-ver" data-dg="lista">Ver na Lista de hoje</button>' : '') + '</div>' +
      '<div class="dg-res"><div class="ok"><b>' + String(reserva).replace(".", ",") + '</b><small>dia' + (reserva === 1 ? '' : 's') + ' garantido' + (reserva === 1 ? '' : 's') + ': ' + gr + ' vídeo' + (gr === 1 ? '' : 's') + ' gravado' + (gr === 1 ? '' : 's') + ' e ainda não postado' + (gr === 1 ? '' : 's') + '</small></div><div class="av"><b>' + faltaSem + '</b><small>faltam gravar para fechar a semana (' + semana + ', do Cronograma)</small></div></div>' +
      '<div class="dg-ses"><div class="lin"><span><b>' + (dia === "sab" || dia === "dom" || !extra ? 'Meta desta gravação' : 'Hoje vou gravar') + '</b><br><small class="mini">do seu jeito: mude quando quiser</small></span><span class="dg-step"><button data-dgm="-5" aria-label="Menos 5">−</button><output>' + meta + '</output><button data-dgm="5" aria-label="Mais 5">+</button></span></div>' +
        '<div class="dg-barra"><i style="width:' + Math.min(100, feitosDia / meta * 100) + '%"></i></div><p class="mini">' + feitosDia + ' de ' + meta + ' gravados neste dia. No seu ritmo (uns 5 por hora), dá umas ' + Math.max(1, Math.round(meta / 5)) + ' horas.</p></div>';
  }

  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest("[data-dg],[data-dgop],[data-dgm]"); if (!b || !b.closest("#t-lote")) return;
    const app = A(), L = app.L; if (!L) return;
    if (b.dataset.dgop != null) { escolha = +b.dataset.dgop; pinta(); return; }
    if (b.dataset.dgm) { const D = L[app.dia]; D.meta = Math.max(5, (D.meta || 20) + +b.dataset.dgm); app.salvaL(); pinta(); return; }
    const a = b.dataset.dg;
    if (a === "mais") { escolhendo = !escolhendo; escolha = 0; pinta(); return; }
    if (a === "cancela") { escolhendo = false; pinta(); return; }
    if (a === "anota") {
      const d = new Date(); d.setDate(d.getDate() + escolha); const data = iso(d), k = "x" + data.replace(/-/g, "");
      if (!L[k]) { const base = app.novoDia(); L[k] = Object.assign(base, { data, nome: SEM[d.getDay()] + " " + ddmm(d), meta: 20 }); }
      escolhendo = false; app.setDia(k); app.salvaL(); app.lote(); aviso("Dia anotado: " + SEM[d.getDay()].toLowerCase() + " " + ddmm(d)); return;
    }
    if (a === "tira") {
      const k = app.dia, D = L[k]; if (!D || !D.data) return;
      const n = D.prods.length;
      if (n && !confirm("Tirar este dia? Os " + n + " produtos dele saem também.")) return;
      delete L[k]; app.setDia("sab"); app.salvaL(); app.lote(); aviso("Dia tirado"); return;
    }
    if (a === "lista") { try { app.ir("noite"); } catch (_) {} return; }
  });

  const st = document.createElement("style");
  st.textContent = `
.dg-dias{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;margin-bottom:6px;scrollbar-width:none}
.dg-dia{flex:none;display:grid;justify-items:center;padding:8px 12px;border-radius:14px;border:1px solid var(--line);background:var(--card);min-width:78px}
.dg-dia b{font-size:13.5px;font-weight:600}.dg-dia small{font-size:11px;color:var(--mute)}
.dg-dia[aria-pressed="true"]{background:var(--ink);color:var(--bg);border-color:var(--ink)}.dg-dia[aria-pressed="true"] small{color:var(--bg);opacity:.75}
.dg-mais{border-style:dashed;color:var(--acc);font-weight:600;font-size:12.5px;align-content:center;line-height:1.2}
.dg-esc{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:12px;margin:6px 0;display:grid;gap:8px}
.dg-chips{display:flex;gap:6px;flex-wrap:wrap}.dg-chip{padding:7px 12px;border-radius:99px;border:1px solid var(--line);background:var(--card);font-size:13px}
.dg-chip small{color:var(--mute);font-size:11px}.dg-chip[aria-pressed="true"]{background:var(--ink);color:var(--bg);border-color:var(--ink)}.dg-chip[aria-pressed="true"] small{color:var(--bg)}
.dg-bts{display:flex;gap:8px;flex-wrap:wrap}
.dg-tira{margin:4px 0 8px}.dg-lk{color:var(--acc);font-weight:600;font-size:12px;text-decoration:underline;padding:0}
.dg-hoje{border-radius:20px;padding:14px;background:var(--acc);color:#fff;display:grid;gap:8px;margin-top:6px}
.dg-hoje.ok{background:var(--ok-soft);color:var(--ok)}
.dg-hoje .l1{display:flex;align-items:flex-end;gap:10px}.dg-hoje .num{font-family:var(--fn);font-size:44px;line-height:.85;font-weight:600}
.dg-hoje .tx{font-size:14px}.dg-hoje .rap{font-size:12.5px;opacity:.88;margin:0}
.dg-hoje ol{margin:0;padding-left:18px;display:grid;gap:2px;font-size:13.5px}
.dg-hoje .dg-ver{background:#fff;color:var(--acc);border:0;justify-self:start}
.dg-res{margin-top:10px;display:grid;grid-template-columns:1fr 1fr;gap:8px}
.dg-res div{border-radius:16px;padding:12px;display:grid;gap:2px}.dg-res b{font-family:var(--fn);font-size:26px;line-height:1}.dg-res small{font-size:12px;color:var(--mute)}
.dg-res .ok{background:var(--ok-soft)}.dg-res .ok b{color:var(--ok)}.dg-res .av{background:var(--warn-soft)}.dg-res .av b{color:var(--warn)}
.dg-ses{margin-top:10px;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:14px;display:grid;gap:8px}
.dg-ses .lin{display:flex;align-items:center;gap:10px}.dg-ses .lin>span:first-child{flex:1;font-size:14px}
.dg-step{display:flex;align-items:center;gap:6px}.dg-step button{width:32px;height:32px;border-radius:50%;border:1px solid var(--line);background:var(--card);font-size:17px;line-height:1}
.dg-step output{min-width:28px;text-align:center;font-family:var(--fn);font-size:21px;font-variant-numeric:tabular-nums}
.dg-barra{height:8px;border-radius:99px;background:var(--line);overflow:hidden}.dg-barra i{display:block;height:100%;background:var(--acc)}`;
  document.head.appendChild(st);
  window.daiaDias = { pinta };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", pinta); else pinta();
})();
