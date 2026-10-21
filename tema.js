// Personalizar: cor do app, claro/escuro, tamanho da letra e modo clean. Fica salvo só neste celular.
(function(){
  const LST = "daia-tema-v1";
  const CORES = [
    {id: "vinho", nome: "Vinho Dale Daia", claro: "#7A1F2B", escuro: "#D9667A"},
    {id: "rosa", nome: "Rosa", claro: "#B83A6E", escuro: "#F08DB5"},
    {id: "lavanda", nome: "Lavanda", claro: "#6E52A3", escuro: "#B9A2E3"},
    {id: "salvia", nome: "Sálvia", claro: "#46704F", escuro: "#8FC19E"},
    {id: "azul", nome: "Azul", claro: "#2F6299", escuro: "#8DB6E6"},
    {id: "caramelo", nome: "Caramelo", claro: "#9A5A22", escuro: "#E3A66B"}
  ];
  let t = {cor: "vinho", livre: "#7A1F2B", fundo: "auto", letra: "normal", clean: true};
  try { Object.assign(t, JSON.parse(localStorage.getItem(LST) || "{}")); } catch(_) {}
  const salvar = () => { try { localStorage.setItem(LST, JSON.stringify(t)); } catch(_) {} };
  const escuroAgora = () => t.fundo === "escuro" || (t.fundo === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);

  function aplicar(){
    const r = document.documentElement;
    r.classList.toggle("tema-claro", t.fundo === "claro");
    r.classList.toggle("tema-escuro", t.fundo === "escuro");
    const c = CORES.find(x => x.id === t.cor);
    const cor = c ? (escuroAgora() ? c.escuro : c.claro) : t.livre;
    r.style.setProperty("--wine", cor);
    r.style.setProperty("--wine-soft", "color-mix(in srgb, " + cor + " 13%, var(--surface))");
    document.body.classList.toggle("letra-grande", t.letra === "grande");
    document.body.classList.toggle("clean", !!t.clean);
    const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.content = cor;
  }
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", aplicar);
  aplicar();

  // ---------- painel ----------
  const p = document.createElement("section");
  p.className = "voz-box tema-box"; p.hidden = true; p.setAttribute("aria-label", "Personalizar o app");
  document.body.appendChild(p);
  function desenhar(){
    p.innerHTML =
      '<div class="voz-top"><b>Personalizar <span>· do seu jeito</span></b><button class="voz-x" aria-label="Fechar">×</button></div>' +
      '<div class="tema-sec"><small>Cor do app</small><div class="tema-cores">' +
        CORES.map(c => '<button type="button" class="tema-cor" data-cor="' + c.id + '" aria-pressed="' + (t.cor === c.id) + '" aria-label="' + c.nome + '" style="--c:' + c.claro + '"></button>').join("") +
        '<label class="tema-cor livre" aria-pressed="' + (t.cor === "livre") + '" title="Escolher outra cor" style="--c:' + t.livre + '">+<input type="color" value="' + t.livre + '" aria-label="Escolher outra cor"></label>' +
      '</div></div>' +
      '<div class="tema-sec"><small>Fundo</small><div class="chips">' + [["auto", "Automático"], ["claro", "Claro"], ["escuro", "Escuro"]].map(([v, n]) => '<button type="button" class="chip" data-fundo="' + v + '" aria-pressed="' + (t.fundo === v) + '">' + n + '</button>').join("") + '</div></div>' +
      '<div class="tema-sec"><small>Tamanho da letra</small><div class="chips">' + [["normal", "Normal"], ["grande", "Grande"]].map(([v, n]) => '<button type="button" class="chip" data-letra="' + v + '" aria-pressed="' + (t.letra === v) + '">' + n + '</button>').join("") + '</div></div>' +
      '<div class="tema-sec"><label class="tema-clean"><input type="checkbox" id="temaClean"' + (t.clean ? " checked" : "") + '> <span><b>Modo clean</b><br><small>Mostra só o essencial. Toque no título de um cartão para ver os detalhes.</small></span></label></div>';
  }
  const fab = () => document.querySelector(".voz-fab");
  function abrir(){ desenhar(); p.hidden = false; if (fab()) fab().style.display = "none"; }
  function fechar(){ p.hidden = true; if (fab()) fab().style.display = ""; }
  document.addEventListener("click", e => { if (e.target.closest("[data-personalizar]")) { e.preventDefault(); p.hidden ? abrir() : fechar(); } });
  p.addEventListener("click", e => {
    if (e.target.closest(".voz-x")) return fechar();
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.cor) t.cor = b.dataset.cor;
    if (b.dataset.fundo) t.fundo = b.dataset.fundo;
    if (b.dataset.letra) t.letra = b.dataset.letra;
    salvar(); aplicar(); desenhar();
  });
  p.addEventListener("input", e => { if (e.target.type === "color") { t.cor = "livre"; t.livre = e.target.value; salvar(); aplicar(); e.target.parentElement.style.setProperty("--c", t.livre); p.querySelectorAll(".tema-cor").forEach(x => x.setAttribute("aria-pressed", x.classList.contains("livre"))); } });
  p.addEventListener("change", e => { if (e.target.id === "temaClean") { t.clean = e.target.checked; salvar(); aplicar(); } });
  // modo clean: tocar no título abre/fecha os detalhes do cartão
  document.addEventListener("click", e => { const h = e.target.closest(".card .title"); if (h && document.body.classList.contains("clean")) h.closest(".card").classList.toggle("aberto"); });
  window.Tema = {abrir, aplicar};
})();
