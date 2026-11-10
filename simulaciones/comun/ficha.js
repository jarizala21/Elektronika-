/* Fichas didácticas bilingües · idioma, pestañas y partes resaltables.
   Idioma: el mismo que se eligió en la portada de la app (localStorage "elektronika:idioma").
   Texto bilingüe:
     · bloques:   <p class="es">…</p><p class="eu">…</p>
     · etiquetas: <text data-es="Bobina" data-eu="Bobina"></text>
     · en JS:     T("castellano", "euskara")
   Pestañas: <nav class="pestanas"></nav> + <section class="panel" data-tab="id" data-es="…" data-eu="…">
   Partes: <ul class="partes" data-svg="idSvg"><li><button data-parte="x">…</button></li></ul>
           y en el SVG elementos con class="resaltable" data-parte="x". */
(function(){
  var CLAVE = "elektronika:idioma";
  var idioma = "es";
  try { idioma = localStorage.getItem(CLAVE) === "eu" ? "eu" : "es"; } catch (e) {}
  var avisos = [];
  window.T = function(es, eu){ return idioma === "eu" ? eu : es; };
  window.idioma = function(){ return idioma; };
  window.alCambiarIdioma = function(fn){ avisos.push(fn); };

  function aplicar(){
    document.documentElement.lang = idioma;
    [].forEach.call(document.querySelectorAll("[data-es]"), function(el){
      if (el.classList.contains("panel")) return;
      el.textContent = el.getAttribute("data-" + idioma) || el.getAttribute("data-es");
    });
    [].forEach.call(document.querySelectorAll("[data-tit-es]"), function(el){
      el.setAttribute("aria-label", el.getAttribute("data-tit-" + idioma));
    });
    var t = document.querySelector("h1");
    if (t) document.title = t.textContent;
    var b = document.querySelector(".idioma");
    if (b) b.innerHTML = idioma === "eu" ? "EU · <b>ES</b>" : "<b>EU</b> · ES";
    if (b) b.setAttribute("aria-label", idioma === "eu" ? "Cambiar a castellano" : "Euskarara aldatu");
    pestanas();
    avisos.forEach(function(fn){ try { fn(idioma); } catch (e) { console.error(e); } });
  }

  /* pestañas */
  var nav, paneles, actual = null;
  function pestanas(){
    if (!nav) return;
    nav.innerHTML = "";
    paneles.forEach(function(p, i){
      var b = document.createElement("button");
      b.type = "button"; b.setAttribute("role", "tab");
      b.innerHTML = '<span class="n">' + (i + 1) + '</span>' + (p.getAttribute("data-" + idioma) || p.getAttribute("data-es"));
      b.setAttribute("aria-selected", p.getAttribute("data-tab") === actual ? "true" : "false");
      b.addEventListener("click", function(){ abrir(p.getAttribute("data-tab"), true); });
      nav.appendChild(b);
    });
  }
  function abrir(id, mover){
    actual = id;
    paneles.forEach(function(p){ p.hidden = p.getAttribute("data-tab") !== id; });
    [].forEach.call(nav.children, function(b, i){
      b.setAttribute("aria-selected", paneles[i].getAttribute("data-tab") === id ? "true" : "false");
      if (paneles[i].getAttribute("data-tab") === id && b.scrollIntoView) b.scrollIntoView({ block: "nearest", inline: "center" });
    });
    try { history.replaceState(null, "", "#" + id); } catch (e) {}
    if (mover) window.scrollTo({ top: 0 });
    var ev; try { ev = new CustomEvent("pestana", { detail: id }); document.dispatchEvent(ev); } catch (e) {}
  }
  window.abrirPestana = function(id){ abrir(id, true); };

  /* partes resaltables */
  function partes(){
    [].forEach.call(document.querySelectorAll(".partes"), function(lista){
      var svg = document.getElementById(lista.getAttribute("data-svg"));
      function marcar(id){
        [].forEach.call(lista.querySelectorAll("button"), function(b){ b.setAttribute("aria-pressed", b.getAttribute("data-parte") === id ? "true" : "false"); });
        if (!svg) return;
        svg.classList.toggle("enfoque", !!id);
        [].forEach.call(svg.querySelectorAll(".resaltable"), function(el){
          el.classList.toggle("activo", (" " + el.getAttribute("data-parte") + " ").indexOf(" " + id + " ") >= 0);
        });
      }
      lista.addEventListener("click", function(ev){
        var b = ev.target.closest("button"); if (!b) return;
        marcar(b.getAttribute("aria-pressed") === "true" ? null : b.getAttribute("data-parte"));
      });
      if (svg) svg.addEventListener("click", function(ev){
        var el = ev.target.closest(".resaltable"); if (!el) return;
        var id = el.getAttribute("data-parte").split(" ")[0];
        var b = lista.querySelector('[data-parte="' + id + '"]');
        marcar(b && b.getAttribute("aria-pressed") === "true" ? null : id);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function(){
    nav = document.querySelector(".pestanas");
    paneles = [].slice.call(document.querySelectorAll(".panel"));
    if (nav && paneles.length) {
      var h = location.hash.slice(1);
      var ok = paneles.some(function(p){ return p.getAttribute("data-tab") === h; });
      actual = ok ? h : paneles[0].getAttribute("data-tab");
      nav.setAttribute("role", "tablist");
    }
    var b = document.querySelector(".idioma");
    if (b) b.addEventListener("click", function(){
      idioma = idioma === "eu" ? "es" : "eu";
      try { localStorage.setItem(CLAVE, idioma); } catch (e) {}
      aplicar();
    });
    aplicar();
    if (nav && paneles.length) abrir(actual, false);
    window.addEventListener("hashchange", function(){
      var h = location.hash.slice(1);
      if (paneles.some(function(p){ return p.getAttribute("data-tab") === h; }) && h !== actual) abrir(h, true);
    });
    partes();
  });
})();
