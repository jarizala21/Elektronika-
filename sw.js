/* Elektronika · funcionamiento sin conexión
   - Al instalarse guarda la app y todas las simulaciones.
   - Con internet, siempre pide la versión más reciente y la guarda.
   - Sin internet, sirve lo guardado.
   La publicación automática sustituye VERSION por la del último cambio,
   así cada actualización vuelve a guardar la lista completa. */
var VERSION = "dev";
var CACHE = "elektronika-app-" + VERSION;
var CACHE_FUENTES = "elektronika-fuentes";
var ESPERA_RED = 5000;

var BASE = [
  "./", "index.html", "estilos.css", "app.js", "catalogo.js", "manifest.webmanifest",
  "iconos/favicon.svg", "iconos/favicon-32.png", "iconos/apple-touch-icon.png",
  "iconos/icono-192.png", "iconos/icono-512.png", "iconos/icono-maskable-512.png",
  "imagenes/la-salle-berrozpe-portada.webp", "imagenes/cc-by-nc-sa.svg",
  "imagenes/area-analogica.webp", "imagenes/area-digital.webp", "imagenes/area-microprogramables.webp", "imagenes/area-plc.webp", "imagenes/area-voz-datos.webp"
];
var FUENTES = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap";

try { importScripts("catalogo.js"); } catch (e) {}

function ruta(carpeta, archivo){ return "simulaciones/" + encodeURIComponent(carpeta) + "/" + encodeURIComponent(archivo); }
function absoluta(u){ return new URL(u, self.registration.scope).href; }
function clave(u){ var x = new URL(u, self.registration.scope); return x.origin + x.pathname; }

function guardar(cache, u){
  return fetch(absoluta(u), { cache: "reload" }).then(function(r){
    if (r.ok) return cache.put(clave(u), r);
  }).catch(function(){});
}

self.addEventListener("install", function(ev){
  ev.waitUntil(caches.open(CACHE).then(function(cache){
    var lista = BASE.slice();
    try {
      (self.CATALOGO.secciones || []).forEach(function(s){
        if (s.imagen) lista.push(s.imagen);
        (s.simulaciones || []).forEach(function(x){ lista.push(ruta(s.carpeta || s.id, x.archivo)); });
      });
    } catch (e) {}
    return fetch(absoluta("simulaciones/indice.json"), { cache: "reload" }).then(function(r){
      if (!r.ok) return;
      return r.clone().json().then(function(indice){
        (indice.carpetas || []).forEach(function(c){ (c.archivos || []).forEach(function(f){ lista.push(ruta(c.carpeta, f.archivo)); }); });
        // Imágenes y otros archivos que usan las simulaciones (GIF, PNG…)
        (indice.recursos || []).forEach(function(r){ lista.push("simulaciones/" + String(r).split("/").map(encodeURIComponent).join("/")); });
        return cache.put(clave("simulaciones/indice.json"), r);
      });
    }).catch(function(){}).then(function(){
      var unicos = lista.filter(function(u, i){ return lista.indexOf(u) === i; });
      return Promise.all(unicos.map(function(u){ return guardar(cache, u); }));
    });
  }).then(guardarFuentes).then(function(){ return self.skipWaiting(); }));
});

// Guarda la hoja de fuentes y los archivos de letra que enlaza.
function guardarFuentes(){
  return caches.open(CACHE_FUENTES).then(function(c){
    return fetch(FUENTES).then(function(r){
      if (!r.ok) return;
      return r.clone().text().then(function(css){
        var urls = css.match(/https:\/\/fonts\.gstatic\.com\/[^)'"\s]+/g) || [];
        return c.put(FUENTES, r).then(function(){
          return Promise.all(urls.map(function(u){ return fetch(u).then(function(f){ if (f.ok) return c.put(u, f); }).catch(function(){}); }));
        });
      });
    });
  }).catch(function(){});
}

// La app avisa de las simulaciones que hay publicadas; se guardan las que falten.
self.addEventListener("message", function(ev){
  var d = ev.data || {};
  if (d.tipo !== "guardar" || !Array.isArray(d.rutas)) return;
  ev.waitUntil(caches.open(CACHE).then(function(cache){
    return Promise.all(d.rutas.map(function(u){
      return cache.match(clave(u)).then(function(m){ if (!m) return guardar(cache, u); });
    }));
  }));
});

self.addEventListener("activate", function(ev){
  ev.waitUntil(caches.keys().then(function(nombres){
    return Promise.all(nombres.map(function(n){
      if (n.indexOf("elektronika-app-") === 0 && n !== CACHE) return caches.delete(n);
    }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener("fetch", function(ev){
  var req = ev.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin === self.location.origin) { ev.respondWith(redPrimero(req, url)); return; }
  // Fuentes de Google que cargan algunas simulaciones: se guardan la primera vez.
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") ev.respondWith(guardadoPrimero(req));
});

function redPrimero(req, url){
  var navegacion = req.mode === "navigate";
  var k = url.origin + url.pathname;
  var red = (navegacion ? fetch(req) : fetch(url.href, { cache: "no-cache", credentials: "same-origin" })).then(function(r){
    if (r && r.ok && r.type === "basic" && !r.redirected) {
      var copia = r.clone();
      caches.open(CACHE).then(function(c){ return c.put(k, copia); });
    }
    return r;
  });
  function reserva(){
    return caches.open(CACHE).then(function(c){
      return c.match(k).then(function(m){
        if (m) return m;
        if (navegacion && req.destination === "document") return c.match(clave("./")).then(function(i){ return i || c.match(clave("index.html")); });
        return undefined;
      });
    });
  }
  return new Promise(function(resolver){
    var hecho = false;
    function fin(r){ if (!hecho) { hecho = true; resolver(r); } }
    var t = setTimeout(function(){ reserva().then(function(m){ if (m) fin(m); }); }, ESPERA_RED);
    red.then(function(r){ clearTimeout(t); fin(r); }, function(){
      clearTimeout(t);
      reserva().then(function(m){ fin(m || Response.error()); });
    });
  });
}

function guardadoPrimero(req){
  return caches.open(CACHE_FUENTES).then(function(c){
    return c.match(req, { ignoreVary: true }).then(function(m){
      return m || fetch(req).then(function(r){
        if (r.ok || r.type === "opaque") c.put(req, r.clone());
        return r;
      });
    });
  });
}
