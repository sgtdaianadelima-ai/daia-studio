// Daia Studio v48 — no computador, a lateral ganha "Daia IA" e "Ajustes". No celular não aparece nada novo.
(function(){
  const nav = document.querySelector("nav.tabs"); if (!nav) return;
  const largo = matchMedia("(min-width: 1000px)");
  const mais = nav.querySelector("[data-mais]");
  const item = (attrs, ico, nome) => { const b = document.createElement("button"); b.type = "button"; b.className = "dk-item"; b.innerHTML = '<span class="dk-ico">' + ico + '</span>' + nome;
    Object.keys(attrs).forEach(k => b.setAttribute(k, attrs[k])); return b; };
  const ia = item({"data-maisir": "daiaia"}, "🤖", "Daia IA");
  const aj = item({"data-dkaj": "1"}, "⚙️", "Ajustes");
  function arruma(){
    const on = largo.matches;
    [ia, aj].forEach(b => { if (on && !b.isConnected) nav.insertBefore(b, mais); if (!on && b.isConnected) b.remove(); });
  }
  aj.addEventListener("click", () => show("ajustes"));
  largo.addEventListener ? largo.addEventListener("change", arruma) : largo.addListener(arruma);
  arruma();
})();
