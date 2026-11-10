"""Recorta el espacio transparente sobrante de un render PNG y lo guarda en WebP (máx. 900 px).
Uso: python3 herramientas/imagenes/a_webp.py render.png imagenes/area-xxx.webp"""
import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert("RGBA")
alfa = im.split()[3].point(lambda a: 255 if a > 8 else 0)
im = im.crop(alfa.getbbox())
im.thumbnail((900, 900), Image.LANCZOS)
im.save(sys.argv[2], quality=86, method=6)
print(sys.argv[2], im.size)
