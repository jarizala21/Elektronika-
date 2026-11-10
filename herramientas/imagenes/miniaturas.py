"""Miniaturas redondas de la lista de cada área.
Crea simulaciones/<carpeta>/miniaturas/<archivo>.webp para cada simulación:
  · si hay un GIF con el mismo nombre, recorta un fotograma;
  · si no, abre el HTML en Chromium y captura su dibujo principal (svg/canvas/img más grande).
Los recortes de cada una se ajustan en CAP y GIF (centro x, centro y y lado, en fracciones).
Uso (desde la raíz del repositorio): python3 herramientas/imagenes/miniaturas.py [carpeta/archivo ...]
Necesita Pillow y Playwright (pip install pillow playwright && playwright install chromium)."""
import os, sys, io
from PIL import Image, ImageSequence
RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SIM = os.path.join(RAIZ, "simulaciones")
CAP = {  # centro x, centro y, lado (fracciones del ancho de la captura) y, si hace falta, pestaña
    'analogica/codigo-colores': (0.5, 0.5, 0.62),
    'analogica/tipos-condensadores': (0.5, 0.5, 0.55),
    'analogica/polimetro': (0.5, 0.5, 0.75),
    'analogica/osciloscopio': (0.5, 0.5, 0.75),
    'analogica/zener': (0.55, 0.5, 0.75),
    'analogica/led': (0.75, 0.5, 0.6),
    'analogica/mosfet-motor': (0.65, 0.45, 0.8),
    'analogica/bjt-interruptor': (0.62, 0.55, 0.75),
    'voz-datos/partes-ordenador': (0.5, 0.45, 0.8),
    'voz-datos/hdd-ssd': (0.42, 0.5, 0.8),
    'plc/marcha-paro-plc': (0.45, 0.32, 0.62),
    'plc/grafcet': (0.45, 0.42, 0.95),
    'microprogramables/arduino-switch-case': (0.5, 0.5, 1.0),
    'digital/puertas-logicas': (0.55, 0.5, 0.8),
}
# Estas no tienen un dibujo que quede bien en pequeño: en la lista se ve su icono.
SIN_MINIATURA = {'analogica/fuente-alimentacion', 'microprogramables/sensor-temperatura',
                 'voz-datos/clonado-disco', 'voz-datos/particiones-formateo'}
GIF = {}

def recorte(im, cx, cy, s):
    w, h = im.size
    lado = min(s * w, h)
    x0 = min(max(cx * w - lado / 2, 0), w - lado); y0 = min(max(cy * h - lado / 2, 0), h - lado)
    return im.crop((int(x0), int(y0), int(x0 + lado), int(y0 + lado))).resize((192, 192), Image.LANCZOS)

def captura(pagina, ruta, pestana=None):
    pagina.goto("file://" + ruta + ("#" + pestana if pestana else ""))
    pagina.wait_for_timeout(1800)
    el = pagina.evaluate_handle("""() => {
      let best = null, area = 0;
      for (const el of document.querySelectorAll('svg, canvas, img')) {
        if (el.closest('button') || el.closest('[hidden]')) continue;
        const r = el.getBoundingClientRect(), a = r.width * r.height;
        if (a > area) { area = a; best = el; }
      }
      return best;
    }""").as_element()
    datos = el.screenshot() if el else pagina.screenshot()
    return Image.open(io.BytesIO(datos)).convert("RGB")

def main():
    pedidas = set(a.replace(".html", "") for a in sys.argv[1:])
    tareas = []
    for carpeta in sorted(os.listdir(SIM)):
        d = os.path.join(SIM, carpeta)
        if not os.path.isdir(d): continue
        for f in sorted(os.listdir(d)):
            if not f.endswith(".html"): continue
            clave = carpeta + "/" + f[:-5]
            if clave in SIN_MINIATURA: continue
            if not pedidas or clave in pedidas: tareas.append((carpeta, f[:-5]))
    navegador = None
    for carpeta, nombre in tareas:
        gif = os.path.join(SIM, carpeta, nombre + ".gif")
        if os.path.exists(gif):
            t, cx, cy, s = GIF.get(nombre, (0.3, 0.5, 0.55, 0.5))
            fr = [x.convert("RGB") for x in ImageSequence.Iterator(Image.open(gif))]
            im = recorte(fr[int(t * len(fr))], cx, cy, s)
        else:
            if navegador is None:
                from playwright.sync_api import sync_playwright
                pw = sync_playwright().start()
                navegador = pw.chromium.launch()
                pagina = navegador.new_page(viewport={"width": 900, "height": 900})
            c = CAP.get(carpeta + "/" + nombre, (0.5, 0.5, 0.95))
            im = recorte(captura(pagina, os.path.join(SIM, carpeta, nombre + ".html"), c[3] if len(c) > 3 else None), c[0], c[1], c[2])
        os.makedirs(os.path.join(SIM, carpeta, "miniaturas"), exist_ok=True)
        im.save(os.path.join(SIM, carpeta, "miniaturas", nombre + ".webp"), quality=82, method=6)
        print("miniatura", carpeta + "/" + nombre)
    if navegador: navegador.close()

if __name__ == "__main__":
    main()
