/* =====================================================================
   CATÁLOGO DE LA APP «ELEKTRONIKA»

   No hace falta tocar este archivo para añadir simulaciones: cualquier
   .html que subas a simulaciones/<carpeta>/ aparece solo en la app, con
   el título que tenga el propio archivo (su etiqueta <title>).

   Este catálogo sirve para dejarlas más bonitas:
     · nombre, nombre en euskera, frase, foto e icono de cada área
     · título, tema, descripción e icono de cada simulación
     · el orden (también el de los botones Anterior / Siguiente)

   Campos de un área (sección)
     carpeta      nombre de la carpeta dentro de simulaciones/ (sin tildes
                  ni espacios). También es su enlace directo: #carpeta
     nombre       lo que se ve en la app
     eu           nombre y frase en euskera: { nombre: "…", descripcion: "…" }
     temas_eu     traducción de los apartados: { "Engranajes": "Engranajeak", … }
     descripcion  una frase corta
     imagen       foto del botón del área, con fondo transparente
                  (por ejemplo imagenes/area-analogica.webp)
     icono        se usa si no hay foto: resistencia · chip · puerta · plc · pc · simulacion

   Campos de una simulación
     archivo      nombre del .html dentro de la carpeta de la sección
     id           enlace directo (#id). Si no se pone, se usa el nombre
                  del archivo
     titulo, tema, descripcion
     eu           título y descripción en euskera: { titulo: "…", descripcion: "…" }
                  (lo que no esté traducido sale en castellano)
     tema         apartado dentro de la sección (las que comparten tema
                  se muestran juntas bajo ese título)
     icono        resistencia · colores · potenciometro · condensador · bobina ·
                  diodo · led · zener · puente · transistor · mosfet · motor · pwm ·
                  polimetro · osciloscopio · onda · fuente · puerta · chip · coche ·
                  termometro · estados · plc · grafcet · pc · placa · disco ·
                  particion · clonar · simulacion
     oculta       true = no sale en la lista (se abre solo por su enlace #id,
                  por ejemplo desde una ficha que la lleva dentro)
     miniatura    (opcional) imagen redonda de la lista. Si no se pone, se usa
                  miniaturas/<nombre-del-archivo>.webp dentro de la carpeta,
                  y si no existe, el icono.
   ===================================================================== */

/* ---------- Avisos y peticiones de los alumnos ----------
   El botón de avisos envía un correo al profesor con Web3Forms (gratis).
   Para activarlo: entra en https://web3forms.com, escribe el correo donde
   quieres recibir los avisos y te llegará una «Access Key». Pégala aquí.
   Mientras esté vacía, el formulario funciona en modo prueba (no envía nada). */
var AVISOS = {
  clave: ""
};

self.CATALOGO = {
  secciones: [
    {
      carpeta: "analogica",
      nombre: "Analógica",
      descripcion: "Componentes, circuitos básicos y medida de señales.",
      imagen: "imagenes/area-analogica.webp",
      icono: "resistencia",
      eu: { nombre: "Analogikoa", descripcion: "Osagaiak, oinarrizko zirkuituak eta seinaleen neurketa." },
      temas_eu: {
        "Resistencias": "Erresistentziak",
        "Condensadores y bobinas": "Kondentsadoreak eta bobinak",
        "Diodos": "Diodoak",
        "Transistores": "Transistoreak",
        "Medida y señales": "Neurketa eta seinaleak"
      },
      simulaciones: [
        { archivo: "codigo-colores.html", id: "codigo-colores", tema: "Resistencias", icono: "colores",
          titulo: "Código de colores",
          descripcion: "Calcula el valor de una resistencia de 4, 5 o 6 bandas.",
          eu: { titulo: "Kolore-kodea", descripcion: "Kalkulatu 4, 5 edo 6 bandako erresistentzia baten balioa." } },
        { archivo: "ley-ohm.html", id: "ley-ohm", tema: "Resistencias", icono: "resistencia",
          titulo: "Ley de Ohm y potencia",
          descripcion: "Tensión, intensidad, resistencia y potencia en un circuito sencillo.",
          eu: { titulo: "Ohm-en legea eta potentzia", descripcion: "Tentsioa, intentsitatea, erresistentzia eta potentzia zirkuitu sinple batean." } },
        { archivo: "serie-paralelo.html", id: "serie-paralelo", tema: "Resistencias", icono: "resistencia",
          titulo: "Serie, paralelo y mixto",
          descripcion: "Resistencia equivalente, corrientes y tensiones de cada resistencia.",
          eu: { titulo: "Seriea, paraleloa eta mistoa", descripcion: "Erresistentzia baliokidea, eta erresistentzia bakoitzeko korronteak eta tentsioak." } },
        { archivo: "divisor-tension.html", id: "divisor-tension", tema: "Resistencias", icono: "potenciometro",
          titulo: "Divisor de tensión y potenciómetro",
          descripcion: "Cómo reparten la tensión dos resistencias y un potenciómetro.",
          eu: { titulo: "Tentsio-zatitzailea eta potentziometroa", descripcion: "Nola banatzen duten tentsioa bi erresistentziak eta potentziometro batek." } },
        { archivo: "resistencias-variables.html", id: "resistencias-variables", tema: "Resistencias", icono: "resistencia",
          titulo: "LDR, NTC y PTC",
          descripcion: "Resistencias que cambian con la luz y la temperatura.",
          eu: { titulo: "LDR, NTC eta PTC", descripcion: "Argiarekin eta tenperaturarekin aldatzen diren erresistentziak." } },
        { archivo: "carga-rc.html", id: "carga-rc", tema: "Condensadores y bobinas", icono: "condensador",
          titulo: "Carga y descarga RC",
          descripcion: "Curva de carga del condensador y constante de tiempo τ = R·C.",
          eu: { titulo: "RC karga eta deskarga", descripcion: "Kondentsadorearen karga-kurba eta τ = R·C denbora-konstantea." } },
        { archivo: "tipos-condensadores.html", id: "tipos-condensadores", tema: "Condensadores y bobinas", icono: "condensador",
          titulo: "Tipos y códigos de condensadores",
          descripcion: "Cerámicos, electrolíticos, poliéster… y cómo leer su valor.",
          eu: { titulo: "Kondentsadore motak eta kodeak", descripcion: "Zeramikoak, elektrolitikoak, poliesterrezkoak… eta haien balioa nola irakurri." } },
        { archivo: "carga-rl.html", id: "carga-rl", tema: "Condensadores y bobinas", icono: "bobina",
          titulo: "Bobina: circuito RL",
          descripcion: "La bobina se opone a los cambios de corriente. Constante τ = L/R.",
          eu: { titulo: "Bobina: RL zirkuitua", descripcion: "Bobinak korronte-aldaketei aurre egiten die. τ = L/R konstantea." } },
        { archivo: "diodo-polarizacion.html", id: "diodo-polarizacion", tema: "Diodos", icono: "diodo",
          titulo: "Polarización del diodo",
          descripcion: "Directa e inversa, tensión umbral y curva I-V.",
          eu: { titulo: "Diodoaren polarizazioa", descripcion: "Zuzena eta alderantzizkoa, atari-tentsioa eta I-V kurba." } },
        { archivo: "led.html", id: "led", tema: "Diodos", icono: "led",
          titulo: "LED y resistencia limitadora",
          descripcion: "Calcula la resistencia que necesita un LED según su color.",
          eu: { titulo: "LEDa eta erresistentzia mugatzailea", descripcion: "Kalkulatu LED batek bere kolorearen arabera behar duen erresistentzia." } },
        { archivo: "rectificador-media-onda.html", id: "rectificador-media-onda", tema: "Diodos", icono: "diodo",
          titulo: "Rectificador de media onda",
          descripcion: "Un diodo deja pasar solo los semiciclos positivos.",
          eu: { titulo: "Uhin erdiko artezgailua", descripcion: "Diodo batek zikloerdi positiboak bakarrik uzten ditu pasatzen." } },
        { archivo: "puente-graetz.html", id: "puente-graetz", tema: "Diodos", icono: "puente",
          titulo: "Puente de Graetz y filtro",
          descripcion: "Rectificador de onda completa y condensador de filtro: el rizado.",
          eu: { titulo: "Graetz zubia eta iragazkia", descripcion: "Uhin osoko artezgailua eta iragazki-kondentsadorea: kizkurdura." } },
        { archivo: "zener.html", id: "zener", tema: "Diodos", icono: "zener",
          titulo: "Diodo Zener como regulador",
          descripcion: "Mantiene la tensión fija aunque cambie la entrada.",
          eu: { titulo: "Zener diodoa erregulatzaile gisa", descripcion: "Tentsioa finko mantentzen du sarrera aldatu arren." } },
        { archivo: "bjt-interruptor.html", id: "bjt-interruptor", tema: "Transistores", icono: "transistor",
          titulo: "Transistor BJT como interruptor",
          descripcion: "Corte y saturación: enciende una carga y calcula Rb.",
          eu: { titulo: "BJT transistorea etengailu gisa", descripcion: "Ebakidura eta asetasuna: piztu karga bat eta kalkulatu Rb." } },
        { archivo: "curvas-bjt.html", id: "curvas-bjt", tema: "Transistores", icono: "transistor",
          titulo: "Curvas del transistor BJT",
          descripcion: "Curvas de salida, recta de carga y zonas de trabajo.",
          eu: { titulo: "BJT transistorearen kurbak", descripcion: "Irteerako kurbak, karga-zuzena eta lan-eremuak." } },
        { archivo: "mosfet-motor.html", id: "mosfet-motor", tema: "Transistores", icono: "mosfet",
          titulo: "MOSFET controlando un motor",
          descripcion: "Puerta, drenador y fuente; y por qué hace falta el diodo volante.",
          eu: { titulo: "MOSFETa motor bat kontrolatzen", descripcion: "Atea, drainatzailea eta iturria; eta zergatik behar den diodo librea." } },
        { archivo: "pwm-motor.html", id: "pwm-motor", tema: "Transistores", icono: "pwm",
          titulo: "PWM: velocidad de un motor",
          descripcion: "El ciclo de trabajo cambia la tensión media y la velocidad.",
          eu: { titulo: "PWM: motor baten abiadura", descripcion: "Lan-zikloak batez besteko tentsioa eta abiadura aldatzen ditu." } },
        { archivo: "polimetro.html", id: "polimetro", tema: "Medida y señales", icono: "polimetro",
          titulo: "Polímetro",
          descripcion: "Cómo medir tensión, intensidad, resistencia y continuidad.",
          eu: { titulo: "Polimetroa", descripcion: "Nola neurtu tentsioa, intentsitatea, erresistentzia eta jarraitutasuna." } },
        { archivo: "osciloscopio.html", id: "osciloscopio", tema: "Medida y señales", icono: "osciloscopio",
          titulo: "Osciloscopio",
          descripcion: "V/div y t/div: lee Vp, Vpp, Vef, periodo y frecuencia.",
          eu: { titulo: "Osziloskopioa", descripcion: "V/div eta t/div: irakurri Vp, Vpp, Vef, periodoa eta maiztasuna." } },
        { archivo: "generador-senales.html", id: "generador-senales", tema: "Medida y señales", icono: "onda",
          titulo: "Generador de señales",
          descripcion: "Senoidal, cuadrada y triangular: amplitud, frecuencia y offset.",
          eu: { titulo: "Seinale-sorgailua", descripcion: "Sinusoidala, karratua eta triangeluarra: anplitudea, maiztasuna eta offseta." } },
        { archivo: "fuente-alimentacion.html", id: "fuente-alimentacion", tema: "Medida y señales", icono: "fuente",
          titulo: "Fuente de alimentación por bloques",
          descripcion: "Transformador, rectificador, filtro y regulador 7805.",
          eu: { titulo: "Elikadura-iturria blokeka", descripcion: "Transformadorea, artezgailua, iragazkia eta 7805 erregulatzailea." } }
      ]
    },
    {
      carpeta: "digital",
      nombre: "Digital y FPGA",
      descripcion: "Puertas lógicas y circuitos combinacionales.",
      imagen: "imagenes/area-digital.webp",
      icono: "puerta",
      eu: { nombre: "Digitala eta FPGA", descripcion: "Ate logikoak eta zirkuitu konbinazionalak." },
      simulaciones: [
        { archivo: "puertas-logicas.html", id: "puertas-logicas", icono: "puerta",
          titulo: "Puertas lógicas",
          descripcion: "AND, OR, NOT, NAND, NOR y XOR con su tabla de verdad.",
          eu: { titulo: "Ate logikoak", descripcion: "AND, OR, NOT, NAND, NOR eta XOR, beren egia-taularekin." } },
        { archivo: "logica-siguelineas.html", id: "logica-siguelineas", icono: "coche",
          titulo: "Lógica de un siguelíneas",
          descripcion: "De los sensores a los motores con un circuito combinacional.",
          eu: { titulo: "Lerro-jarraitzaile baten logika", descripcion: "Sentsoreetatik motorretara, zirkuitu konbinazional batekin." } }
      ]
    },
    {
      carpeta: "microprogramables",
      nombre: "Microprogramables",
      descripcion: "Arduino, sensores y programación.",
      imagen: "imagenes/area-microprogramables.webp",
      icono: "chip",
      eu: { nombre: "Mikroprogramagarriak", descripcion: "Arduinoa, sentsoreak eta programazioa." },
      simulaciones: [
        { archivo: "arduino-switch-case.html", id: "arduino-switch-case", icono: "estados",
          titulo: "Arduino: máquina de estados",
          descripcion: "switch-case paso a paso con un ejemplo de máquina.",
          eu: { titulo: "Arduinoa: egoera-makina", descripcion: "switch-case urratsez urrats, makina baten adibidearekin." } },
        { archivo: "sensor-temperatura.html", id: "sensor-temperatura", icono: "termometro",
          titulo: "Sensor de temperatura y humedad",
          descripcion: "Lectura, umbrales de alarma (10–50 ºC) y envío de datos.",
          eu: { titulo: "Tenperatura- eta hezetasun-sentsorea", descripcion: "Irakurketa, alarma-mugak (10–50 ºC) eta datuen bidalketa." } }
      ]
    },
    {
      carpeta: "plc",
      nombre: "Industrial y PLC",
      descripcion: "Automatismos programables con PLC.",
      imagen: "imagenes/area-plc.webp",
      icono: "plc",
      eu: { nombre: "Industriala eta PLCa", descripcion: "PLC bidezko automatismo programagarriak." },
      simulaciones: [
        { archivo: "marcha-paro-plc.html", id: "marcha-paro-plc", icono: "plc",
          titulo: "Marcha-paro con PLC",
          descripcion: "Diagrama de contactos con autorretención, paso a paso.",
          eu: { titulo: "Martxa-geldialdia PLCarekin", descripcion: "Kontaktu-diagrama autoatxikimenduarekin, urratsez urrats." } },
        { archivo: "grafcet.html", id: "grafcet", icono: "grafcet",
          titulo: "Grafcet",
          descripcion: "Etapas, transiciones y acciones de una secuencia.",
          eu: { titulo: "Grafcet-a", descripcion: "Sekuentzia baten etapak, trantsizioak eta ekintzak." } }
      ]
    },
    {
      carpeta: "voz-datos",
      nombre: "Voz y datos",
      descripcion: "El ordenador por dentro: hardware y discos.",
      imagen: "imagenes/area-voz-datos.webp",
      icono: "pc",
      eu: { nombre: "Ahotsa eta datuak", descripcion: "Ordenagailua barrutik: hardwarea eta diskoak." },
      simulaciones: [
        { archivo: "partes-ordenador.html", id: "partes-ordenador", icono: "placa",
          titulo: "Partes del ordenador",
          descripcion: "Placa base, CPU, RAM, discos, fuente y tarjeta gráfica.",
          eu: { titulo: "Ordenagailuaren zatiak", descripcion: "Plaka nagusia, PUZ, RAM, diskoak, elikadura-iturria eta txartel grafikoa." } },
        { archivo: "hdd-ssd.html", id: "hdd-ssd", icono: "disco",
          titulo: "HDD frente a SSD",
          descripcion: "Cómo funcionan por dentro y en qué se diferencian.",
          eu: { titulo: "HDD vs SSD", descripcion: "Nola funtzionatzen duten barrutik eta zertan desberdintzen diren." } },
        { archivo: "particiones-formateo.html", id: "particiones-formateo", icono: "particion",
          titulo: "Particiones y formateo",
          descripcion: "Tabla MBR/GPT, sistemas de archivos y formateo.",
          eu: { titulo: "Partizioak eta formateoa", descripcion: "MBR/GPT taula, fitxategi-sistemak eta formateoa." } },
        { archivo: "clonado-disco.html", id: "clonado-disco", icono: "clonar",
          titulo: "Clonado y restauración del disco",
          descripcion: "Copia de seguridad del sistema y recuperación, paso a paso.",
          eu: { titulo: "Diskoaren klonazioa eta berreskurapena", descripcion: "Sistemaren segurtasun-kopia eta berreskurapena, urratsez urrats." } }
      ]
    }
  ]
};
