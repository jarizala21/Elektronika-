"""Quita el fondo blanco a la foto de un elemento (foto de catálogo o hecha sobre papel blanco)
y la guarda como WebP transparente para usarla en el botón de un área.
Uso: python3 herramientas/imagenes/recortar_foto.py foto.jpg imagenes/area-xxx.webp [tolerancia]
Necesita Pillow, NumPy y OpenCV (pip install pillow numpy opencv-python-headless)."""
import sys
import cv2, numpy as np
from PIL import Image

entrada, salida = sys.argv[1], sys.argv[2]
tol = int(sys.argv[3]) if len(sys.argv) > 3 else 14
img = cv2.imread(entrada)
h, w = img.shape[:2]
# Zonas casi blancas: las que tocan el borde son fondo; también los huecos blancos grandes del interior.
blanco = (img.min(axis=2) > 255 - 2 * tol).astype(np.uint8)
n, lab, st, _ = cv2.connectedComponentsWithStats(blanco, connectivity=4)
fondo = np.zeros((h, w), bool)
for i in range(1, n):
    x, y, ww, hh, a = st[i]
    if x == 0 or y == 0 or x + ww >= w or y + hh >= h or a > 0.0015 * w * h:
        fondo |= lab == i
alfa = np.where(fondo, 0, 255).astype(np.uint8)
alfa = cv2.GaussianBlur(cv2.erode(alfa, np.ones((3, 3), np.uint8)), (0, 0), 0.8)
rgba = cv2.cvtColor(img, cv2.COLOR_BGR2RGBA)
rgba[..., 3] = alfa
im = Image.fromarray(rgba)
im = im.crop(im.getbbox())
im.thumbnail((900, 900), Image.LANCZOS)
im.save(salida, quality=86, method=6)
print(salida, im.size)
