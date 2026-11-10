# Elektronika

App del departamento de Mantenimiento Electrónico de La Salle Berrozpe con simulaciones para entender la teoría del ciclo superior de Mantenimiento Electrónico: electrónica analógica, digital, microprogramables, PLC y voz y datos. Funciona en el móvil, la tablet y el PC; se puede instalar como app y, una vez abierta, funciona sin internet.

Es hermana de la app Electromecánica y tiene el mismo diseño.

Licencia: Creative Commons BY-NC-SA 4.0.

## Cómo se usa

Portada de bienvenida (euskera y castellano) → **Sartu · Entrar** → menú de áreas (cabe en una pantalla) → lista de simulaciones del área → simulación.

- **Android (Chrome) y PC (Chrome o Edge):** en el menú de áreas, pulsa el botón naranja de descarga para instalarla.
- **iPhone o iPad (Safari):** pulsa *Compartir* y elige *Añadir a pantalla de inicio*.

Enlaces directos para Moodle: añade al final de la dirección `#areas` (menú de áreas), `#analogica`, `#digital`, `#microprogramables`, `#plc`, `#voz-datos` (cada área) o el de una simulación (`#codigo-colores`, `#puente-graetz`, `#grafcet`…).

## Áreas y simulaciones

| Área | Simulaciones |
|---|---|
| Analógica | Código de colores, ley de Ohm, serie y paralelo, divisor de tensión, LDR/NTC/PTC · carga RC, tipos de condensadores, bobina RL · polarización del diodo, LED, media onda, puente de Graetz, Zener · BJT interruptor, curvas del BJT, MOSFET con motor, PWM · polímetro, osciloscopio, generador de señales, fuente de alimentación |
| Digital y FPGA | Puertas lógicas, lógica de un siguelíneas |
| Microprogramables | Máquina de estados con switch-case, sensor de temperatura y humedad (MQTT) |
| Industrial y PLC | Marcha-paro en diagrama de contactos, Grafcet de un taladro |
| Voz y datos | Partes del ordenador, HDD frente a SSD, particiones y formateo, clonado y restauración |

## Añadir una simulación

1. En GitHub, entra en la carpeta de su área dentro de `simulaciones/` (por ejemplo `simulaciones/analogica`).
2. Pulsa **Add file → Upload files**, arrastra el `.html` y pulsa **Commit changes**.
3. En uno o dos minutos aparece en la app, con el título que tenga el archivo.

Las apps ya instaladas se actualizan solas la próxima vez que se abren con internet.

Para darle un título, una descripción o un icono más cuidados, cambiar el orden o agruparla en un apartado (campo `tema`), edita `catalogo.js` (las instrucciones están dentro).

La imagen redonda de la lista sale de `simulaciones/<área>/miniaturas/<archivo>.webp`. Si no existe, se ve el icono. Para crearlas: `python3 herramientas/imagenes/miniaturas.py`.

## Fichas bilingües

Todas las simulaciones usan `simulaciones/comun/ficha.css` y `ficha.js`: pestañas, partes que se resaltan al tocarlas y textos en euskera y castellano (`class="es"` / `class="eu"`, o `data-es` / `data-eu`; en el código, `T("castellano", "euskara")`). Se ven en el idioma elegido en la portada y tienen un botón EU · ES arriba.

La app y las fichas siguen el modo claro u oscuro del móvil o del ordenador. Los dibujos van siempre sobre fondo claro.

## Añadir un área

Crea una carpeta nueva dentro de `simulaciones/` con al menos un `.html`. Usa un nombre corto, en minúsculas, sin tildes ni espacios. Aparece sola como área nueva; para ponerle nombre con tildes, nombre en euskera, frase y foto, añádela en `catalogo.js`.

La foto del botón de un área es una imagen con fondo transparente en `imagenes/` (WebP o PNG). Una foto hecha sobre fondo blanco se puede recortar con `python3 herramientas/imagenes/recortar_foto.py foto.jpg imagenes/area-xxx.webp`.

Las fotos actuales de las áreas son **renders 3D hechos con Blender**, no fotos reales. Para volver a generarlas: `python3.11 herramientas/imagenes/render_areas.py componentes|chip|placa|plc|disco salida.png 1200 64` y después `python3 herramientas/imagenes/a_webp.py salida.png imagenes/area-xxx.webp`. Si hacéis fotos en el taller, se pueden sustituir.

## Qué es cada archivo

| Archivo | Para qué sirve |
|---|---|
| `simulaciones/` | Las simulaciones, una carpeta por área (con sus miniaturas); `comun/` tiene el estilo de las fichas |
| `catalogo.js` | Nombres (también en euskera), frases, fotos, iconos y orden |
| `index.html`, `estilos.css`, `app.js` | La app |
| `imagenes/` | Logo de La Salle, fotos de las áreas y distintivo de la licencia |
| `sw.js` | Funcionamiento sin internet |
| `manifest.webmanifest`, `iconos/` | Nombre e icono al instalarla (los PNG se generan solos a partir de los SVG) |
| `herramientas/preparar.mjs`, `.github/workflows/publicar.yml` | Publicación automática en GitHub Pages |
| `herramientas/imagenes/` | Miniaturas, recorte de fotos y las imágenes 3D de las áreas (Blender) |

## Avisos y peticiones de los alumnos

El botón con el bocadillo (en el menú de áreas, en la lista de cada área y en el visor de cada ficha) abre un formulario anónimo: avisar de un error, proponer una mejora, pedir un tema nuevo u otra cosa.

Los avisos llegan por correo a través de Web3Forms (gratis):

1. Entra en https://web3forms.com, escribe el correo donde quieres recibirlos y te llegará una «Access Key».
2. Pégala en `catalogo.js`, en `AVISOS.clave`, y publica.

Mientras la clave esté vacía, el formulario funciona en **modo prueba**: no envía nada y enseña el correo que se recibiría.
