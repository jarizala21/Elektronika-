// Prepara la web para publicarla en GitHub Pages (lo ejecuta la publicación automática).
//  1. Copia los archivos de la app a _site/
//  2. Recorre simulaciones/<carpeta>/*.html y escribe simulaciones/indice.json
//     con el título (<title>) y la descripción (<meta name="description">) de cada una.
//  3. Pone a sw.js la versión del último cambio para que las apps instaladas se actualicen.
//  4. Genera los iconos PNG a partir de los dibujos SVG de iconos/ (necesita @resvg/resvg-js).
// Para probarlo en tu ordenador: npm install --no-save @resvg/resvg-js@2.6.2 && node herramientas/preparar.mjs
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SALIDA = path.join(RAIZ, "_site");
const PUBLICAR = ["index.html", "estilos.css", "app.js", "catalogo.js", "sw.js", "manifest.webmanifest", "iconos", "imagenes", "simulaciones"];
// [dibujo SVG, PNG que se genera, ancho en píxeles]
const ICONOS = [
  ["favicon.svg", "icono-512.png", 512],
  ["favicon.svg", "icono-192.png", 192],
  ["favicon.svg", "favicon-32.png", 32],
  ["icono-maskable.svg", "icono-maskable-512.png", 512],
  ["apple-touch-icon.svg", "apple-touch-icon.png", 180],
  ["atajo-analogica.svg", "atajo-analogica-96.png", 96],
  ["atajo-digital.svg", "atajo-digital-96.png", 96],
  ["atajo-microprogramables.svg", "atajo-microprogramables-96.png", 96],
  ["atajo-plc.svg", "atajo-plc-96.png", 96]
];

function decodificar(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, "&")
    .replace(/\s+/g, " ").trim();
}
function titulo(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? decodificar(m[1]) : "";
}
function descripcion(html) {
  const m = html.match(/<meta\s+[^>]*name=["']description["'][^>]*>/i);
  if (!m) return "";
  const c = m[0].match(/content=["']([^"']*)["']/i);
  return c ? decodificar(c[1]) : "";
}
const porNombre = (a, b) => a.localeCompare(b, "es", { numeric: true });

await fs.rm(SALIDA, { recursive: true, force: true });
await fs.mkdir(SALIDA, { recursive: true });
for (const p of PUBLICAR) await fs.cp(path.join(RAIZ, p), path.join(SALIDA, p), { recursive: true });

const base = path.join(SALIDA, "simulaciones");
const carpetas = [];
const dirs = (await fs.readdir(base, { withFileTypes: true })).filter(d => d.isDirectory()).map(d => d.name).sort(porNombre);
for (const carpeta of dirs) {
  const nombres = (await fs.readdir(path.join(base, carpeta))).filter(f => /\.html?$/i.test(f)).sort(porNombre);
  const archivos = [];
  for (const archivo of nombres) {
    const html = await fs.readFile(path.join(base, carpeta, archivo), "utf8");
    archivos.push({ archivo, titulo: titulo(html), descripcion: descripcion(html) });
  }
  if (archivos.length) carpetas.push({ carpeta, archivos });
}
// Otros archivos que usan las simulaciones (GIF, imágenes…), para guardarlos y usarlos sin conexión.
const recursos = [];
async function recorrer(dir, rel) {
  for (const e of (await fs.readdir(dir, { withFileTypes: true })).sort((a, b) => porNombre(a.name, b.name))) {
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) await recorrer(path.join(dir, e.name), r);
    else if (rel && !/\.html?$/i.test(e.name) && !e.name.startsWith(".")) recursos.push(r);
  }
}
await recorrer(base, "");
await fs.writeFile(path.join(base, "indice.json"), JSON.stringify({ generado: new Date().toISOString(), carpetas, recursos }, null, 2));

const version = (process.env.GITHUB_SHA || Date.now().toString(36)).slice(0, 12);
const swRuta = path.join(SALIDA, "sw.js");
const sw = await fs.readFile(swRuta, "utf8");
if (!sw.includes('var VERSION = "dev";')) throw new Error("No encuentro la línea VERSION en sw.js");
await fs.writeFile(swRuta, sw.replace('var VERSION = "dev";', `var VERSION = "${version}";`));
const appRuta = path.join(SALIDA, "app.js");
const appJs = await fs.readFile(appRuta, "utf8");
if (!appJs.includes('var VERSION_APP = "dev";')) throw new Error("No encuentro la línea VERSION_APP en app.js");
await fs.writeFile(appRuta, appJs.replace('var VERSION_APP = "dev";', `var VERSION_APP = "${version.slice(0, 7)}";`));

let Resvg = null;
try { const m = await import("@resvg/resvg-js"); Resvg = m.Resvg || (m.default && m.default.Resvg); } catch {}
if (!Resvg) {
  if (process.env.CI) throw new Error("Falta @resvg/resvg-js: no se pueden generar los iconos PNG");
  console.warn("Aviso: no está @resvg/resvg-js, así que no se generan los iconos PNG.");
} else {
  const dir = path.join(SALIDA, "iconos");
  for (const [svg, png, ancho] of ICONOS) {
    const datos = new Resvg(await fs.readFile(path.join(dir, svg)), { fitTo: { mode: "width", value: ancho } }).render().asPng();
    await fs.writeFile(path.join(dir, png), datos);
  }
}

const total = carpetas.reduce((n, c) => n + c.archivos.length, 0);
console.log(`Versión ${version}: ${total} simulaciones en ${carpetas.length} carpetas`);
for (const c of carpetas) console.log(`  ${c.carpeta}: ${c.archivos.map(a => a.archivo).join(", ")}`);
