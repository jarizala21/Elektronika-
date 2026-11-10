/* Elektronika · lógica de la app
   Lee el catálogo (catalogo.js) y el índice de archivos que se genera al publicar
   (simulaciones/indice.json), pinta la portada, el menú de áreas y la lista de cada
   área, y abre cada simulación en el visor.
   Rutas: (vacía) o #inicio = portada · #areas = menú de áreas ·
          #carpeta-del-area = lista · #id-de-simulacion = visor ·
          #avisos o #avisos/<área o simulación> = formulario de avisos. */
(function(){
  "use strict";

  /* ---------- símbolos dibujados en una rejilla de 48 × 48 ---------- */
  var GLIFOS = {
    resistencia: '<path d="M4 24h8l3-7 5 14 5-14 5 14 5-14 3 7h6"/>',
    colores: '<path d="M3 24h7M38 24h7"/><rect x="10" y="15" width="28" height="18" rx="9"/><path class="d" d="M17 15v18M23 15v18M29 15v18"/>',
    potenciometro: '<path d="M4 30h8l3-6 5 12 5-12 5 12 5-12 3 6h6"/><path d="M24 6v14M20 15l4 5 4-5"/>',
    condensador: '<path d="M4 24h16M28 24h16M20 12v24M28 12v24"/>',
    bobina: '<path d="M3 30h6c0-10 8-10 8 0 0-10 8-10 8 0 0-10 8-10 8 0 0-10 8-10 8 0h4"/>',
    diodo: '<path d="M4 24h12M32 24h12M32 13v22"/><path class="f" d="M16 13v22l16-11z"/>',
    led: '<path d="M4 28h10M30 28h14M30 17v22"/><path class="t" d="M14 17v22l16-11z"/><path d="M27 12l6-7M33 14l6-7M29 5h4v4M35 7h4v4"/>',
    zener: '<path d="M4 24h12M32 24h12M28 37l4-2V13l4-2"/><path class="t" d="M16 13v22l16-11z"/>',
    puente: '<path d="M24 6l18 18-18 18L6 24z"/><path class="f" d="M12 14l6 0-3 4zM30 14l6 0-3 4zM12 30l6 0-3 4zM30 30l6 0-3 4z"/>',
    transistor: '<circle cx="26" cy="24" r="17"/><path d="M4 24h14M18 14v20M18 19l12-10v-6M18 29l12 10v6"/><path class="f" d="M30 39l-7-1 3-5z"/>',
    mosfet: '<circle cx="26" cy="24" r="17"/><path d="M4 31h10V17M18 14v6M18 21v6M18 28v6M18 17h14v-14M18 31h14v14M18 24h14v7"/><path class="f" d="M18 24l6-3v6z"/>',
    motor: '<circle cx="24" cy="24" r="13"/><path d="M24 3v8M24 37v8"/><path d="M17 30V18l7 8 7-8v12"/>',
    pwm: '<path d="M3 34h6V14h8v20h6V14h4v20h6V14h12v20h0"/>',
    polimetro: '<rect x="11" y="4" width="26" height="40" rx="5"/><rect class="t" x="16" y="9" width="16" height="9" rx="1.5"/><circle cx="24" cy="30" r="6"/><path d="M24 30l3-4"/>',
    osciloscopio: '<rect x="4" y="8" width="40" height="30" rx="4"/><path d="M9 23c4-11 7-11 11 0s7 11 11 0 6-8 8-4"/><path d="M14 44h20"/>',
    onda: '<path d="M3 24c5-16 9-16 14 0s9 16 14 0 9-16 14 0"/><path class="d" d="M3 24h42"/>',
    fuente: '<rect x="5" y="10" width="38" height="28" rx="4"/><path d="M12 24h7M15.5 20.5v7M29 24h7"/><circle class="f" cx="14" cy="33" r="1.6"/><circle class="f" cx="34" cy="33" r="1.6"/>',
    puerta: '<path d="M12 10h12a14 14 0 0 1 0 28H12z"/><path d="M3 17h9M3 31h9M38 24h7"/>',
    chip: '<rect x="12" y="12" width="24" height="24" rx="3"/><path d="M18 5v7M24 5v7M30 5v7M18 36v7M24 36v7M30 36v7M5 18h7M5 24h7M5 30h7M36 18h7M36 24h7M36 30h7"/>',
    coche: '<rect x="10" y="8" width="28" height="30" rx="6"/><rect class="t" x="4" y="12" width="6" height="12" rx="2"/><rect class="t" x="38" y="12" width="6" height="12" rx="2"/><path d="M24 38v6M14 44h20"/><circle class="f" cx="18" cy="16" r="2"/><circle class="f" cx="30" cy="16" r="2"/>',
    termometro: '<path d="M20 30V8a4 4 0 0 1 8 0v22"/><circle cx="24" cy="35" r="7"/><circle class="f" cx="24" cy="35" r="3"/><path d="M32 12h6M32 18h6M32 24h6"/>',
    estados: '<circle cx="11" cy="24" r="7"/><circle cx="37" cy="12" r="7"/><circle cx="37" cy="36" r="7"/><path d="M18 21l12-6M37 19v10M30 34l-12-7"/>',
    plc: '<path d="M6 8v32M42 8v32"/><path d="M6 16h7M17 12v8M23 12v8M27 16h15"/><path d="M6 32h7M17 28v8M23 28v8M17 36l6-8M27 32h6"/><circle cx="37" cy="32" r="4"/>',
    grafcet: '<rect x="15" y="3" width="18" height="12"/><rect x="18" y="6" width="12" height="6"/><path d="M24 15v18M17 22h14"/><rect x="15" y="33" width="18" height="12"/>',
    pc: '<rect x="6" y="4" width="22" height="40" rx="3"/><path d="M11 12h12M11 18h12"/><circle class="f" cx="17" cy="36" r="2"/><rect class="t" x="32" y="14" width="12" height="18" rx="2"/>',
    placa: '<rect x="4" y="6" width="40" height="36" rx="3"/><rect class="t" x="11" y="12" width="12" height="12" rx="1.5"/><path d="M29 12v18M33 12v18M37 12v18M11 32h12M11 36h12"/>',
    disco: '<rect x="8" y="4" width="32" height="40" rx="4"/><circle cx="24" cy="21" r="11"/><circle class="f" cx="24" cy="21" r="2"/><path d="M33 39l-9-16"/>',
    particion: '<rect x="4" y="14" width="40" height="20" rx="3"/><path d="M18 14v20M34 14v20"/><path class="t" d="M5.5 15.5h11v17h-11z"/>',
    clonar: '<rect x="4" y="10" width="16" height="24" rx="3"/><rect x="28" y="14" width="16" height="24" rx="3"/><path d="M20 22h8M25 18l4 4-4 4"/>',
    simulacion: '<path d="M8 24h32"/><circle class="t" cx="28" cy="24" r="5"/>'
  };


  // La publicación automática pone aquí la versión del último cambio.
  var VERSION_APP = "dev";
  var $ = function(id){ return document.getElementById(id); };
  var root = document.documentElement;
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function norm(s){ return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  function slug(s){ return norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "x"; }
  function sinExt(f){ return String(f || "").replace(/\.html?$/i, ""); }
  function bonito(s){ s = String(s || "").replace(/[-_]+/g, " ").trim(); return s.charAt(0).toUpperCase() + s.slice(1); }
  /* ---------- idioma de los menús (las simulaciones siguen en su idioma) ---------- */
  var TEXTOS = {
    es: { app: "Electrónica", elige: "Elige un área", areas: "Áreas", buscar: "Buscar simulación", instalar: "Instalar la app",
          portada: "Volver a la portada", volverAreas: "Volver a las áreas", volverA: "Volver a ", cerrar: "Cerrar aviso",
          anterior: "Simulación anterior", siguiente: "Simulación siguiente", reiniciar: "Reiniciar", completa: "Pantalla completa",
          cargando: "Cargando…", ant: "Anterior", sig: "Siguiente",
          sim: function(n){ return n + (n === 1 ? " simulación" : " simulaciones"); },
          res: function(n){ return n + (n === 1 ? " resultado" : " resultados"); },
          escribe: function(n){ return "Escribe para buscar entre " + n + " simulaciones."; },
          nada: function(t){ return "Ninguna simulación coincide con «" + t + "»."; },
          pos: function(i, n){ return i + " de " + n; },
          avisos: "Avisos y peticiones", avisarFicha: "Avisar de un error en esta ficha", volver: "Volver",
          avTitulo: "¿Algo no funciona o echas algo en falta?",
          avIntro: "Cuéntanoslo: le llega al profesorado del departamento. Es anónimo, así que no pongas tu nombre ni datos personales.",
          avPrueba: "<strong>Modo prueba.</strong> El formulario funciona, pero todavía no envía nada: falta conectarlo al correo del profesor.",
          avTipo: "¿Qué quieres hacer?", avDonde: "¿Dónde?", avMsg: "Explícalo", avMsgPh: "Escribe aquí…",
          avExtra: "Qué más se envía (sin datos personales)", avEnviar: "Enviar", avEnviando: "Enviando…",
          avSeguir: "Volver", avOtro: "Enviar otro", avGeneral: "Toda la app, en general", avArea: "todo el área",
          tipos: { error: "Avisar de un error", idea: "Proponer una mejora", tema: "Pedir un tema nuevo", otro: "Otra cosa" },
          pistas: { error: "Qué hiciste, qué esperabas y qué pasó. Por ejemplo: en la pestaña Símbolo, al tocar la bobina no se ilumina.",
                    idea: "Qué cambiarías y cómo te ayudaría a entenderlo mejor.",
                    tema: "Qué tema o elemento te gustaría ver en la app.",
                    otro: "Escribe lo que quieras contarnos." },
          datos: { idioma: "Idioma", disp: "Dispositivo", pantalla: "Pantalla", app: "Instalada como app", tema: "Aspecto", ver: "Versión" },
          si: "Sí", no: "No", claro: "Claro", oscuro: "Oscuro", euskera: "Euskera", castellano: "Castellano",
          errTipo: "Elige qué quieres hacer.", errCorto: "Escribe un poco más (al menos 10 letras).",
          errEnvio: "No se ha podido enviar. Inténtalo otra vez dentro de un rato.",
          okT: "¡Gracias! Aviso enviado", okP: "El profesorado lo revisará.",
          colaT: "Guardado: se enviará solo", colaP: "Ahora no hay conexión. Se enviará en cuanto vuelva internet y abras la app.",
          pruebaT: "Así llegaría el aviso", pruebaP: "Modo prueba: no se ha enviado nada. Este es el correo que recibiría el profesor:" },
    eu: { app: "Elektronika", elige: "Aukeratu arlo bat", areas: "Arloak", buscar: "Bilatu simulazioa", instalar: "Instalatu aplikazioa",
          portada: "Itzuli azalera", volverAreas: "Itzuli arloetara", volverA: "Itzuli: ", cerrar: "Itxi oharra",
          anterior: "Aurreko simulazioa", siguiente: "Hurrengo simulazioa", reiniciar: "Berrabiarazi", completa: "Pantaila osoa",
          cargando: "Kargatzen…", ant: "Aurrekoa", sig: "Hurrengoa",
          sim: function(n){ return n === 1 ? "simulazio 1" : n + " simulazio"; },
          res: function(n){ return n === 1 ? "emaitza 1" : n + " emaitza"; },
          escribe: function(n){ return "Idatzi bilatzeko (" + n + " simulazio daude)."; },
          nada: function(t){ return "Ez dago «" + t + "» bilaketarekin bat datorren simulaziorik."; },
          pos: function(i, n){ return i + " / " + n; },
          avisos: "Oharrak eta eskaerak", avisarFicha: "Fitxa honetako akats baten berri eman", volver: "Itzuli",
          avTitulo: "Zerbaitek ez du funtzionatzen edo zerbait faltan botatzen duzu?",
          avIntro: "Kontaiguzu: saileko irakasleei iristen zaie. Anonimoa da; beraz, ez jarri zure izena ezta datu pertsonalik ere.",
          avPrueba: "<strong>Proba modua.</strong> Formularioak funtzionatzen du, baina oraindik ez du ezer bidaltzen: irakaslearen postara konektatzea falta da.",
          avTipo: "Zer egin nahi duzu?", avDonde: "Non?", avMsg: "Azaldu", avMsgPh: "Idatzi hemen…",
          avExtra: "Zer gehiago bidaltzen da (datu pertsonalik gabe)", avEnviar: "Bidali", avEnviando: "Bidaltzen…",
          avSeguir: "Itzuli", avOtro: "Beste bat bidali", avGeneral: "Aplikazio osoa, orokorrean", avArea: "arlo osoa",
          tipos: { error: "Akats baten berri eman", idea: "Hobekuntza bat proposatu", tema: "Gai berri bat eskatu", otro: "Beste zerbait" },
          pistas: { error: "Zer egin zenuen, zer espero zenuen eta zer gertatu zen. Adibidez: Sinboloa fitxan, bobina sakatzean ez da pizten.",
                    idea: "Zer aldatuko zenukeen eta nola lagunduko lizukeen hobeto ulertzen.",
                    tema: "Zein gai edo elementu ikusi nahiko zenukeen aplikazioan.",
                    otro: "Idatzi kontatu nahi diguzuna." },
          datos: { idioma: "Hizkuntza", disp: "Gailua", pantalla: "Pantaila", app: "Aplikazio gisa instalatuta", tema: "Itxura", ver: "Bertsioa" },
          si: "Bai", no: "Ez", claro: "Argia", oscuro: "Iluna", euskera: "Euskara", castellano: "Gaztelania",
          errTipo: "Aukeratu zer egin nahi duzun.", errCorto: "Idatzi pixka bat gehiago (gutxienez 10 letra).",
          errEnvio: "Ezin izan da bidali. Saiatu berriro geroago.",
          okT: "Eskerrik asko! Oharra bidali da", okP: "Irakasleek berrikusiko dute.",
          colaT: "Gordeta: bere kabuz bidaliko da", colaP: "Orain ez dago konexiorik. Interneta itzultzen denean eta aplikazioa irekitzean bidaliko da.",
          pruebaT: "Horrela iritsiko litzateke oharra", pruebaP: "Proba modua: ez da ezer bidali. Hau da irakasleak jasoko lukeen mezua:" }
  };
  var CLAVE_IDIOMA = "elektronika:idioma";
  var IDIOMA = "es";
  try { IDIOMA = localStorage.getItem(CLAVE_IDIOMA) === "eu" ? "eu" : "es"; } catch (e) {}
  function L(){ return TEXTOS[IDIOMA]; }
  function plural(n){ return L().sim(n); }
  // Textos del catálogo en el idioma elegido (si falta la traducción, en castellano)
  function nombre(sec){ return (IDIOMA === "eu" && sec.eu.nombre) || sec.nombre; }
  function frase(sec){ return (IDIOMA === "eu" && sec.eu.descripcion) || sec.descripcion; }
  function titulo(sim){ return (IDIOMA === "eu" && sim.eu.titulo) || sim.titulo; }
  function desc(sim){ return (IDIOMA === "eu" && sim.eu.descripcion) || sim.descripcion; }
  function tema(sec, t){ return (IDIOMA === "eu" && sec.temasEu[t]) || t; }
  function traducirPagina(){
    document.documentElement.lang = IDIOMA;
    document.title = L().app;
    [].forEach.call(document.querySelectorAll("[data-t]"), function(el){ el.textContent = L()[el.getAttribute("data-t")]; });
    [].forEach.call(document.querySelectorAll("[data-t-aria]"), function(el){
      var t = L()[el.getAttribute("data-t-aria")];
      el.setAttribute("aria-label", t);
      if (el.hasAttribute("title")) el.title = t;
    });
    [].forEach.call(document.querySelectorAll("[data-t-ph]"), function(el){ el.placeholder = L()[el.getAttribute("data-t-ph")]; });
    [].forEach.call(document.querySelectorAll("[data-t-html]"), function(el){ el.innerHTML = L()[el.getAttribute("data-t-html")]; });
  }
  function ponerIdioma(id){
    IDIOMA = id === "eu" ? "eu" : "es";
    try { localStorage.setItem(CLAVE_IDIOMA, IDIOMA); } catch (e) {}
    traducirPagina(); pintarAreas();
  }
  function glifo(n){
    return '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (GLIFOS[n] || GLIFOS.simulacion) + '</svg>';
  }
  var FLECHA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
  function foto(sec){
    return sec.imagen
      ? '<span class="disco"></span><img src="' + esc(sec.imagen) + '" alt="" decoding="async">'
      : '<span class="disco"></span><span class="glifo-grande">' + glifo(sec.icono) + '</span>';
  }

  /* ---------- catálogo + archivos realmente publicados ---------- */
  function construir(cat, indice){
    var secs = ((cat && cat.secciones) || []).map(function(s){
      var carpeta = s.carpeta || s.id;
      return {
        id: s.id || carpeta, carpeta: carpeta, nombre: s.nombre || bonito(carpeta), eu: s.eu || {}, temasEu: s.temas_eu || {},
        descripcion: s.descripcion || "", imagen: s.imagen || "", icono: s.icono || "simulacion",
        simulaciones: (s.simulaciones || []).map(function(x){
          return { id: x.id, archivo: x.archivo, titulo: x.titulo || bonito(sinExt(x.archivo)), tema: x.tema || "",
                   descripcion: x.descripcion || "", icono: x.icono || "simulacion", miniatura: x.miniatura || "", eu: x.eu || {}, oculta: !!x.oculta };
        })
      };
    });

    if (indice && Array.isArray(indice.carpetas)) {
      var hay = {};
      indice.carpetas.forEach(function(c){ hay[c.carpeta] = c.archivos || []; });
      // Quita del catálogo lo que ya no está publicado.
      secs.forEach(function(s){
        var lista = hay[s.carpeta] || [];
        s.simulaciones = s.simulaciones.filter(function(x){ return lista.some(function(f){ return f.archivo === x.archivo; }); });
      });
      // Añade las carpetas y los archivos nuevos que no están en el catálogo.
      indice.carpetas.forEach(function(c){
        var s = null;
        secs.forEach(function(z){ if (z.carpeta === c.carpeta) s = z; });
        if (!s) {
          s = { id: c.carpeta, carpeta: c.carpeta, nombre: bonito(c.carpeta), eu: {}, temasEu: {}, descripcion: "", imagen: "", icono: "simulacion", simulaciones: [] };
          secs.push(s);
        }
        (c.archivos || []).forEach(function(f){
          if (s.simulaciones.some(function(x){ return x.archivo === f.archivo; })) return;
          s.simulaciones.push({ id: null, archivo: f.archivo, titulo: f.titulo || bonito(sinExt(f.archivo)), tema: "",
                                descripcion: f.descripcion || "", icono: "simulacion", miniatura: "", eu: {} });
        });
      });
      secs = secs.filter(function(s){ return s.simulaciones.length > 0; });
    }

    var usados = { inicio: 1, areas: 1 };
    function unico(s){ var base = s, n = 2; while (usados[s]) s = base + "-" + (n++); usados[s] = 1; return s; }
    secs.forEach(function(s){ s.id = unico(slug(s.id)); });
    secs.forEach(function(s){
      s.simulaciones.forEach(function(x){
        x.id = unico(slug(x.id || sinExt(x.archivo)));
        x.ruta = "simulaciones/" + encodeURIComponent(s.carpeta) + "/" + encodeURIComponent(x.archivo);
        // Miniatura: la del catálogo o, si existe, simulaciones/<carpeta>/miniaturas/<archivo>.webp
        var m = x.miniatura ? s.carpeta + "/" + x.miniatura : s.carpeta + "/miniaturas/" + sinExt(x.archivo) + ".webp";
        x.foto = (!RECURSOS || RECURSOS[m]) ? "simulaciones/" + m.split("/").map(encodeURIComponent).join("/") : "";
      });
      // Las «ocultas» no salen en las listas, pero se pueden abrir por su enlace (#id), p. ej. desde una ficha.
      s.ocultas = s.simulaciones.filter(function(x){ return x.oculta; });
      s.simulaciones = s.simulaciones.filter(function(x){ return !x.oculta; });
    });
    return secs;
  }

  var CATALOGO = self.CATALOGO || { secciones: [] };
  var SECCIONES = [], TODAS = [], RECURSOS = null;
  function aplicar(secs){
    SECCIONES = secs; TODAS = [];
    SECCIONES.forEach(function(sec){
      sec.simulaciones.forEach(function(sim, i){ TODAS.push({ sec: sec, sim: sim, i: i }); });
      (sec.ocultas || []).forEach(function(sim){ TODAS.push({ sec: sec, sim: sim, i: -1 }); });
    });
    pintarAreas();
  }
  function porId(id){ for (var k = 0; k < TODAS.length; k++) if (TODAS[k].sim.id === id) return TODAS[k]; return null; }

  /* ---------- menú de áreas ---------- */
  function pintarAreas(){
    var nav = $("areas");
    nav.style.setProperty("--n", Math.max(SECCIONES.length, 1));
    nav.style.setProperty("--filas", Math.ceil(SECCIONES.length / 2));
    // En pantallas anchas: hasta 4 en una fila; con más, en dos filas.
    var cols = SECCIONES.length <= 4 ? Math.max(SECCIONES.length, 1) : Math.ceil(SECCIONES.length / 2);
    nav.style.setProperty("--cols", cols);
    nav.style.setProperty("--filas-pc", Math.ceil(SECCIONES.length / cols));
    nav.classList.toggle("rejilla", SECCIONES.length >= 4);
    nav.classList.toggle("dos-filas", SECCIONES.length > 4);
    nav.innerHTML = SECCIONES.map(function(sec){
      return '<a class="area" href="#' + esc(sec.id) + '">' +
        '<span class="area-foto" aria-hidden="true">' + foto(sec) + '</span>' +
        '<span class="area-texto">' +
          '<h3>' + esc(nombre(sec)) + '</h3>' +
          (frase(sec) ? '<span class="area-desc">' + esc(frase(sec)) + '</span>' : '') +
          '<span class="area-pie"><span class="pastilla">' + plural(sec.simulaciones.length) + '</span>' +
          '<span class="flecha">' + FLECHA + '</span></span>' +
        '</span></a>';
    }).join("");
  }

  // Temas en orden de aparición
  function temas(sec){
    var out = [];
    sec.simulaciones.forEach(function(x){ if (x.tema && out.indexOf(x.tema) < 0) out.push(x.tema); });
    return out;
  }
  function agrupada(sec){ return sec.simulaciones.length > 6 && temas(sec).length > 1; }

  function tarjeta(e, conSeccion, sinTema){
    var tm = e.sim.tema ? tema(e.sec, e.sim.tema) : "";
    var chip = conSeccion ? nombre(e.sec) + (tm ? " · " + tm : "") : (sinTema ? "" : tm);
    var mini = '<span class="mini">' + glifo(e.sim.icono) +
      (e.sim.foto ? '<img src="' + esc(e.sim.foto) + '" alt="" loading="lazy" decoding="async" onerror="this.remove()">' : '') + '</span>';
    return '<a class="card" href="#' + esc(e.sim.id) + '">' + mini +
      '<span class="card-body">' +
        (chip ? '<span class="chip">' + esc(chip) + '</span>' : '') +
        '<span class="card-title">' + esc(titulo(e.sim)) + '</span>' +
        (desc(e.sim) ? '<span class="card-desc">' + esc(desc(e.sim)) + '</span>' : '') +
      '</span><span class="ir">' + CHEV + '</span></a>';
  }

  var buscar = $("buscar"), abrirBuscar = $("abrir-buscar"), vAreas = $("vista-areas");
  function pintarBusqueda(){
    var abierto = !$("buscador").hidden;
    var texto = buscar.value.trim(), q = norm(texto), res = $("resultados");
    vAreas.classList.toggle("buscando", abierto);
    $("areas").hidden = $("areas-head").hidden = abierto;
    res.hidden = !abierto;
    if (!abierto) return;
    if (!q) {
      var unicas = {}; TODAS.forEach(function(e){ if (e.i >= 0) unicas[e.sim.ruta] = 1; });
      res.innerHTML = '<p class="res-head">' + esc(L().escribe(Object.keys(unicas).length)) + '</p>';
      return;
    }
    var palabras = q.split(/\s+/);
    var hits = TODAS.filter(function(e){
      if (e.i < 0) return false;
      var pajar = norm([e.sim.titulo, e.sim.descripcion, e.sim.tema, e.sec.nombre, e.sim.eu.titulo, e.sim.eu.descripcion,
                        e.sec.eu.nombre, e.sec.temasEu[e.sim.tema]].join(" "));
      return palabras.every(function(p){ return pajar.indexOf(p) >= 0; });
    });
    res.innerHTML = hits.length
      ? '<p class="res-head">' + esc(L().res(hits.length)) + '</p><div class="cards">' +
        hits.map(function(h){ return tarjeta(h, true); }).join("") + '</div>'
      : '<p class="empty">' + esc(L().nada(texto)) + '</p>';
  }
  buscar.addEventListener("input", pintarBusqueda);
  function mostrarBuscador(si){
    $("buscador").hidden = !si;
    abrirBuscar.setAttribute("aria-expanded", si ? "true" : "false");
    if (!si) buscar.value = "";
    pintarBusqueda();
    if (si) try { buscar.focus(); } catch (e) {}
  }
  abrirBuscar.addEventListener("click", function(){ mostrarBuscador($("buscador").hidden); });
  buscar.addEventListener("keydown", function(ev){ if (ev.key === "Escape") mostrarBuscador(false); });

  /* ---------- vistas ---------- */
  var COLOR_BARRA = { "vista-portada": "#fdb02e", "vista-areas": "#f5f3ef", "vista-seccion": "#f5f3ef", "vista-avisos": "#f5f3ef" };
  function mostrarVista(id){
    ["vista-portada", "vista-areas", "vista-seccion", "vista-avisos"].forEach(function(v){ $(v).hidden = v !== id; });
    var m = document.querySelector('meta[name="theme-color"]');
    var oscuro = window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
    if (m) m.setAttribute("content", id === "vista-portada" ? COLOR_BARRA[id] : (oscuro ? "#11142a" : COLOR_BARRA[id]));
  }
  function verPortada(){ mostrarVista("vista-portada"); window.scrollTo(0, 0); }
  function verAreas(mover){
    mostrarVista("vista-areas"); pintarBusqueda();
    if (mover) window.scrollTo(0, 0);
  }
  function verSeccion(sec, mover){
    $("sec-barra").textContent = nombre(sec);
    $("sec-nombre").textContent = nombre(sec);
    $("sec-desc").textContent = frase(sec) || "";
    $("sec-desc").hidden = !frase(sec);
    $("sec-count").textContent = plural(sec.simulaciones.length);
    $("sec-foto").innerHTML = foto(sec);
    $("sec-avisos").href = "#avisos/" + encodeURIComponent(sec.id);
    if (agrupada(sec)) {
      $("sec-cards").className = "lista";
      $("sec-cards").innerHTML = temas(sec).map(function(t){
        var items = [];
        sec.simulaciones.forEach(function(sim, i){ if (sim.tema === t) items.push(tarjeta({ sec: sec, sim: sim, i: i }, false, true)); });
        return '<section class="grupo"><h3>' + esc(tema(sec, t)) + ' <span class="num">' + items.length + '</span></h3><div class="cards">' + items.join("") + '</div></section>';
      }).join("");
    } else {
      $("sec-cards").className = "lista";
      $("sec-cards").innerHTML = '<div class="cards">' + sec.simulaciones.map(function(sim, i){ return tarjeta({ sec: sec, sim: sim, i: i }, false); }).join("") + '</div>';
    }
    mostrarVista("vista-seccion");
    if (mover) { window.scrollTo(0, 0); try { $("sec-nombre").focus({ preventScroll: true }); } catch (e) {} }
  }

  /* ---------- visor ---------- */
  var app = $("app"), visor = $("visor"), stage = $("stage"), frame = $("frame"), loading = $("loading");
  var abierta = null, entrada = null, turno = 0, esperando = -1;

  function cargar(e){
    esperando = ++turno;
    stage.classList.remove("listo"); loading.hidden = false;
    frame.src = e.sim.ruta;
  }
  frame.addEventListener("load", function(){
    if (esperando !== turno || !abierta) return;
    try { if (frame.contentWindow.location.href === "about:blank") return; } catch (err) {}
    stage.classList.add("listo"); loading.hidden = true;
  });

  function navegacion(btn, sim, etiqueta){
    btn.disabled = !sim;
    btn.setAttribute("data-ir", sim ? sim.id : "");
    btn.title = sim ? etiqueta + ": " + titulo(sim) : "";
  }
  function abrirVisor(e){
    var sec = e.sec, sim = e.sim, i = e.i;
    $("v-back").href = "#" + sec.id;
    $("v-back").setAttribute("aria-label", L().volverA + nombre(sec));
    $("v-sec").textContent = nombre(sec) + " · ";
    $("v-pos").textContent = i < 0 ? "" : L().pos(i + 1, sec.simulaciones.length);
    $("v-name").textContent = titulo(sim);
    $("v-avisos").href = "#avisos/" + encodeURIComponent(sim.id);
    frame.title = titulo(sim);
    navegacion($("v-prev"), i < 0 ? null : sec.simulaciones[i - 1], L().ant);
    navegacion($("v-next"), i < 0 ? null : sec.simulaciones[i + 1], L().sig);
    app.hidden = true; visor.hidden = false; root.classList.add("con-visor");
    if (abierta !== sim.id) { abierta = sim.id; entrada = e; cargar(e); }
  }
  function cerrarVisor(){
    if (visor.hidden) return;
    turno++; abierta = null; entrada = null;
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function(){});
    frame.src = "about:blank";
    visor.hidden = true; app.hidden = false; root.classList.remove("con-visor");
  }

  ["v-prev", "v-next"].forEach(function(id){
    $(id).addEventListener("click", function(){ var d = this.getAttribute("data-ir"); if (d) location.hash = d; });
  });
  $("v-reload").addEventListener("click", function(){
    if (!entrada) return;
    esperando = ++turno;
    stage.classList.remove("listo"); loading.hidden = false;
    try { frame.contentWindow.location.reload(); } catch (err) { frame.src = entrada.sim.ruta; }
  });

  var vFull = $("v-full");
  if (document.fullscreenEnabled && visor.requestFullscreen) vFull.hidden = false;
  vFull.addEventListener("click", function(){
    try {
      if (document.fullscreenElement) document.exitFullscreen().catch(function(){});
      else { var p = visor.requestFullscreen(); if (p && p.catch) p.catch(function(){}); }
    } catch (e) {}
  });
  document.addEventListener("fullscreenchange", function(){
    vFull.setAttribute("aria-pressed", document.fullscreenElement ? "true" : "false");
  });
  document.addEventListener("keydown", function(ev){
    if (ev.key === "Escape" && !visor.hidden && !document.fullscreenElement && entrada) location.hash = entrada.sec.id;
  });


  /* ---------- avisos y peticiones ----------
     Envía el aviso por Web3Forms (le llega por correo al profesor).
     Sin clave en catalogo.js (AVISOS.clave) funciona en modo prueba: enseña lo que se enviaría.
     Sin conexión, lo guarda y lo envía en cuanto vuelve internet. */
  var CLAVE_COLA = "elektronika:avisos-pendientes";
  var CONF_AV = (typeof AVISOS !== "undefined" && AVISOS) || {};
  var avVolver = "#areas", avTipo = "", avContexto = "";
  var TIPOS = ["error", "idea", "tema", "otro"];
  var TIPOS_ES = TEXTOS.es.tipos;

  function dispositivo(){
    var u = navigator.userAgent || "", so = "Otro", nav = "";
    if (/iphone/i.test(u)) so = "iPhone";
    else if (/ipad/i.test(u) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) so = "iPad";
    else if (/android/i.test(u)) so = /mobile/i.test(u) ? "Android (móvil)" : "Android (tablet)";
    else if (/CrOS/.test(u)) so = "Chromebook";
    else if (/windows/i.test(u)) so = "Windows";
    else if (/mac os/i.test(u)) so = "Mac";
    else if (/linux/i.test(u)) so = "Linux";
    if (/SamsungBrowser/.test(u)) nav = "Samsung Internet";
    else if (/Edg\//.test(u)) nav = "Edge";
    else if (/Firefox|FxiOS/.test(u)) nav = "Firefox";
    else if (/CriOS|Chrome\//.test(u)) nav = "Chrome";
    else if (/Safari\//.test(u)) nav = "Safari";
    return so + (nav ? " · " + nav : "");
  }
  function datosAuto(){
    var enApp2 = (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
    var osc = window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
    return [
      ["idioma", IDIOMA === "eu" ? "eu" : "es"],
      ["disp", dispositivo()],
      ["pantalla", Math.round(window.innerWidth) + " × " + Math.round(window.innerHeight)],
      ["app", enApp2 ? "si" : "no"],
      ["tema", osc ? "oscuro" : "claro"],
      ["ver", VERSION_APP]
    ];
  }
  function valorDato(k, v, T){
    if (k === "idioma") return v === "eu" ? T.euskera : T.castellano;
    if (k === "app" || k === "tema") return T[v];
    return v;
  }
  function lugar(id){
    if (!id) return { es: TEXTOS.es.avGeneral, txt: L().avGeneral };
    for (var k = 0; k < SECCIONES.length; k++) if (SECCIONES[k].id === id) {
      var s = SECCIONES[k];
      return { es: s.nombre + " (" + TEXTOS.es.avArea + ")", txt: nombre(s) + " (" + L().avArea + ")" };
    }
    var e = porId(id);
    if (e) return { es: e.sec.nombre + " › " + e.sim.titulo, txt: nombre(e.sec) + " › " + titulo(e.sim) };
    return { es: id, txt: id };
  }
  function pintarTipos(){
    $("av-tipos").innerHTML = TIPOS.map(function(t){
      return '<button type="button" class="av-tipo" data-tipo="' + t + '" aria-pressed="' + (t === avTipo) + '">' + esc(L().tipos[t]) + '</button>';
    }).join("");
    $("av-msg").placeholder = avTipo ? L().pistas[avTipo] : L().avMsgPh;
  }
  function pintarDonde(){
    var opc = '<option value="">' + esc(L().avGeneral) + '</option>';
    var esta = !avContexto;
    SECCIONES.forEach(function(s){
      opc += '<optgroup label="' + esc(nombre(s)) + '"><option value="' + esc(s.id) + '">' + esc(nombre(s)) + " (" + esc(L().avArea) + ')</option>';
      if (s.id === avContexto) esta = true;
      s.simulaciones.forEach(function(sim){
        if (sim.oculta) return;
        if (sim.id === avContexto) esta = true;
        opc += '<option value="' + esc(sim.id) + '">' + esc(titulo(sim)) + '</option>';
      });
      opc += '</optgroup>';
    });
    if (!esta) opc += '<option value="' + esc(avContexto) + '">' + esc(lugar(avContexto).txt) + '</option>';
    $("av-donde").innerHTML = opc;
    $("av-donde").value = avContexto;
  }
  function pintarDatos(){
    $("av-datos").innerHTML = datosAuto().map(function(d){
      return '<div><dt>' + esc(L().datos[d[0]]) + '</dt><dd>' + esc(valorDato(d[0], d[1], L())) + '</dd></div>';
    }).join("");
  }
  function contar(){
    var n = $("av-msg").value.length;
    $("av-cuenta").textContent = n + " / 1500";
  }
  function errorAv(t){ var e = $("av-error"); e.textContent = t || ""; e.hidden = !t; }
  function verAvisos(ctx){
    try { ctx = decodeURIComponent(ctx || ""); } catch (e) {}
    if ($("av-form").hidden) $("av-msg").value = "";
    $("av-form").hidden = false; $("av-hecho").hidden = true;
    if (ctx !== avContexto || !$("av-msg").value) avTipo = porId(ctx) ? "error" : "";
    avContexto = ctx;
    $("av-volver").href = avVolver;
    $("av-seguir").href = avVolver;
    $("av-prueba").hidden = !!CONF_AV.clave;
    pintarTipos(); pintarDonde(); pintarDatos(); contar(); errorAv("");
    mostrarVista("vista-avisos");
    window.scrollTo(0, 0);
    try { $("av-h").focus({ preventScroll: true }); } catch (e) {}
  }
  $("av-tipos").addEventListener("click", function(ev){
    var b = ev.target.closest("[data-tipo]"); if (!b) return;
    avTipo = b.getAttribute("data-tipo"); pintarTipos(); errorAv("");
  });
  $("av-msg").addEventListener("input", function(){ contar(); if (this.value.trim().length >= 10) errorAv(""); });

  // Lo que recibe el profesor: siempre en castellano, con el texto del alumno tal cual.
  function construirAviso(){
    var donde = lugar($("av-donde").value), datos = {};
    datosAuto().forEach(function(d){ datos[TEXTOS.es.datos[d[0]]] = valorDato(d[0], d[1], TEXTOS.es); });
    var asunto = "Elektronika · " + TIPOS_ES[avTipo] + " · " + donde.es;
    var aviso = { subject: asunto.length > 120 ? asunto.slice(0, 117) + "…" : asunto, from_name: "App Elektronika",
                  "Tipo": TIPOS_ES[avTipo], "Dónde": donde.es, "Mensaje": $("av-msg").value.trim() };
    Object.keys(datos).forEach(function(k){ aviso[k] = datos[k]; });
    aviso["Fecha"] = new Date().toLocaleString("es-ES");
    return aviso;
  }
  function enviarUno(aviso){
    var cuerpo = { access_key: CONF_AV.clave };
    Object.keys(aviso).forEach(function(k){ cuerpo[k] = aviso[k]; });
    return fetch("https://api.web3forms.com/submit", {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(cuerpo)
    }).then(function(r){
      return r.json().catch(function(){ return {}; }).then(function(j){
        if (!r.ok || j.success === false) { var e = new Error(j.message || "HTTP " + r.status); e.rechazo = true; throw e; }
        return j;
      });
    });
  }
  function leerCola(){ try { return JSON.parse(localStorage.getItem(CLAVE_COLA) || "[]") || []; } catch (e) { return []; } }
  function guardarCola(c){ try { if (c.length) localStorage.setItem(CLAVE_COLA, JSON.stringify(c.slice(-20))); else localStorage.removeItem(CLAVE_COLA); return true; } catch (e) { return false; } }
  var vaciando = false;
  function vaciarCola(){
    if (vaciando || !CONF_AV.clave || navigator.onLine === false) return;
    var cola = leerCola(); if (!cola.length) return;
    vaciando = true;
    (function siguiente(){
      if (!cola.length) { guardarCola(cola); vaciando = false; return; }
      enviarUno(cola[0]).then(function(){ cola.shift(); guardarCola(cola); siguiente(); },
        function(e){ if (e && e.rechazo) { cola.shift(); guardarCola(cola); siguiente(); } else { guardarCola(cola); vaciando = false; } });
    })();
  }
  window.addEventListener("online", vaciarCola);
  setTimeout(vaciarCola, 3000);

  function hecho(titulo2, texto, aviso){
    $("av-form").hidden = true;
    $("av-hecho").hidden = false;
    $("av-hecho-t").textContent = titulo2;
    $("av-hecho-p").textContent = texto;
    var r = $("av-resumen");
    r.hidden = !aviso;
    if (aviso) {
      r.innerHTML = '<p class="av-asunto">' + esc(aviso.subject) + '</p><dl>' + Object.keys(aviso).filter(function(k){ return k !== "subject" && k !== "from_name"; }).map(function(k){
        return '<div' + (k === "Mensaje" ? ' class="av-largo"' : '') + '><dt>' + esc(k) + '</dt><dd>' + esc(aviso[k]) + '</dd></div>';
      }).join("") + '</dl>';
    }
    window.scrollTo(0, 0);
    try { $("av-hecho").focus({ preventScroll: true }); } catch (e) {}
  }
  function reiniciarAv(){
    $("av-msg").value = ""; $("av-hecho").hidden = true; $("av-form").hidden = false;
    avTipo = porId(avContexto) ? "error" : ""; pintarTipos(); contar(); errorAv("");
  }
  $("av-otro").addEventListener("click", function(){ reiniciarAv(); try { $("av-h").focus(); } catch (e) {} });
  $("av-seguir").addEventListener("click", function(){ setTimeout(reiniciarAv, 0); });

  $("av-form").addEventListener("submit", function(ev){
    ev.preventDefault();
    if ($("av-bot").checked) return;
    if (!avTipo) { errorAv(L().errTipo); return; }
    if ($("av-msg").value.trim().length < 10) { errorAv(L().errCorto); $("av-msg").focus(); return; }
    errorAv("");
    var aviso = construirAviso();
    if (!CONF_AV.clave) { hecho(L().pruebaT, L().pruebaP, aviso); return; }
    function aCola(){
      var c = leerCola(); c.push(aviso);
      if (guardarCola(c)) hecho(L().colaT, L().colaP); else errorAv(L().errEnvio);
    }
    if (navigator.onLine === false) { aCola(); return; }
    var btn = $("av-enviar"), et = btn.querySelector("span");
    btn.disabled = true; et.textContent = L().avEnviando;
    enviarUno(aviso).then(function(){ hecho(L().okT, L().okP); },
      function(e){ if (e && e.rechazo) errorAv(L().errEnvio); else aCola(); })
      .then(function(){ btn.disabled = false; et.textContent = L().avEnviar; });
  });

  /* ---------- rutas ---------- */
  function enrutar(mover){
    var id = "";
    try { id = decodeURIComponent(location.hash.slice(1)); } catch (e) {}
    if (!id || id === "inicio") { cerrarVisor(); verPortada(); return; }
    if (id === "areas") { cerrarVisor(); verAreas(mover); return; }
    if (id === "avisos" || id.indexOf("avisos/") === 0) { cerrarVisor(); verAvisos(id.slice(7)); return; }
    var sec = null;
    for (var k = 0; k < SECCIONES.length; k++) if (SECCIONES[k].id === id) sec = SECCIONES[k];
    var e = sec ? null : porId(id);
    if (e) abrirVisor(e);
    else { cerrarVisor(); if (sec) verSeccion(sec, mover); else verAreas(mover); }
  }
  window.addEventListener("hashchange", function(ev){
    // Para que «Volver» del formulario lleve a donde estaba el alumno
    var antes = String(ev.oldURL || "").split("#")[1] || "";
    if (antes && antes.indexOf("avisos") !== 0 && String(location.hash).indexOf("#avisos") === 0) avVolver = "#" + antes;
    enrutar(true);
  });

  [].forEach.call(document.querySelectorAll("[data-idioma]"), function(a){
    a.addEventListener("click", function(){ ponerIdioma(a.getAttribute("data-idioma")); });
  });
  traducirPagina();
  aplicar(construir(CATALOGO, null));
  enrutar(false);

  // El índice lo genera la publicación automática: incluye simulaciones nuevas
  // aunque no estén en el catálogo, y oculta las que se hayan borrado.
  fetch("simulaciones/indice.json", { cache: "no-cache" })
    .then(function(r){ return r.ok ? r.json() : null; })
    .then(function(indice){
      if (!indice) return;
      RECURSOS = {};
      (indice.recursos || []).forEach(function(r){ RECURSOS[r] = 1; });
      aplicar(construir(CATALOGO, indice)); enrutar(false);
      // Pide al modo sin conexión que guarde también las simulaciones nuevas.
      if (navigator.serviceWorker && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then(function(reg){
          var rutas = TODAS.map(function(e){ return e.sim.ruta; });
          (indice.recursos || []).forEach(function(r){
            rutas.push("simulaciones/" + String(r).split("/").map(encodeURIComponent).join("/"));
          });
          if (reg.active) reg.active.postMessage({ tipo: "guardar", rutas: rutas });
        }).catch(function(){});
      }
    })
    .catch(function(){});

  /* ---------- instalación como app ---------- */
  var enApp = (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
  var esIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var instalar = $("instalar"), avisoIOS = $("aviso-ios"), peticion = null;

  if (!enApp && esIOS) instalar.hidden = false;
  window.addEventListener("beforeinstallprompt", function(ev){
    ev.preventDefault(); peticion = ev; instalar.hidden = false;
  });
  window.addEventListener("appinstalled", function(){ peticion = null; instalar.hidden = true; avisoIOS.hidden = true; });
  instalar.addEventListener("click", function(){
    if (peticion) {
      peticion.prompt();
      peticion.userChoice.then(function(r){ if (r && r.outcome === "accepted") instalar.hidden = true; peticion = null; }).catch(function(){});
    } else if (esIOS) {
      avisoIOS.hidden = !avisoIOS.hidden;
    }
  });
  $("cerrar-ios").addEventListener("click", function(){ avisoIOS.hidden = true; });

  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
    window.addEventListener("load", function(){ navigator.serviceWorker.register("sw.js").catch(function(){}); });
  }
})();
