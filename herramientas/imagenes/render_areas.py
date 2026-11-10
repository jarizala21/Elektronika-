"""Imágenes 3D realistas (Blender Cycles) de las áreas de la app Elektronika, con fondo transparente:
  componentes (resistencia, condensador y LED) · chip (circuito integrado DIP) · placa (placa de
  microcontrolador genérica, sin marcas) · plc (módulos en carril DIN) · disco (disco duro abierto).
Necesita el módulo bpy (pip install bpy, con Python 3.11).
Uso: python3.11 herramientas/imagenes/render_areas.py componentes|chip|placa|plc|disco salida.png [ancho] [muestras]
Después se recorta y se pasa a WebP con: python3 herramientas/imagenes/a_webp.py salida.png imagenes/area-xxx.webp"""
import bpy, bmesh, math, os, sys
from mathutils import Vector

QUE = sys.argv[1]
SALIDA = sys.argv[2]
ANCHO = int(sys.argv[3]) if len(sys.argv) > 3 else 1000
MUESTRAS = int(sys.argv[4]) if len(sys.argv) > 4 else 96

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = "CYCLES"
sc.cycles.device = "CPU"
sc.cycles.samples = MUESTRAS
sc.cycles.use_denoising = True
sc.render.film_transparent = True
sc.render.resolution_x = ANCHO
sc.render.resolution_y = ANCHO
sc.render.image_settings.file_format = "PNG"
sc.render.image_settings.color_mode = "RGBA"
sc.view_settings.view_transform = "AgX"
for look in ("AgX - Punchy", "Punchy", "AgX - Medium High Contrast"):
    try:
        sc.view_settings.look = look
        break
    except Exception:
        pass

# ---------- materiales ----------
def mat(nombre, color, metal=0.0, rough=0.4, **extra):
    m = bpy.data.materials.new(nombre)
    try: m.use_nodes = True
    except Exception: pass
    p = m.node_tree.nodes.get("Principled BSDF")
    p.inputs["Base Color"].default_value = (*color, 1)
    p.inputs["Metallic"].default_value = metal
    p.inputs["Roughness"].default_value = rough
    for k, v in extra.items():
        p.inputs[k].default_value = v
    return m

def mat_imagen(nombre, ruta):
    m = bpy.data.materials.new(nombre)
    try: m.use_nodes = True
    except Exception: pass
    nt = m.node_tree
    p = nt.nodes.get("Principled BSDF")
    p.inputs["Roughness"].default_value = 0.5
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = bpy.data.images.load(ruta)
    nt.links.new(tex.outputs["Color"], p.inputs["Base Color"])
    return m

# ---------- geometría ----------
def objeto(nombre, mesh, material, loc=(0, 0, 0), rot=(0, 0, 0), smooth_ang=None):
    o = bpy.data.objects.new(nombre, mesh)
    bpy.context.collection.objects.link(o)
    o.location = loc
    o.rotation_euler = rot
    if material: o.data.materials.append(material)
    if smooth_ang is not None:
        for f in o.data.polygons: f.use_smooth = True
        try:
            o.data.set_sharp_from_angle(angle=math.radians(smooth_ang))
        except Exception:
            mod = o.modifiers.new("ss", "SMOOTH_BY_ANGLE") if hasattr(bpy.types, "NodesModifier") else None
    return o

def perfil(nombre, contornos, grosor, material, bisel=0.01, loc=(0, 0, 0), rot=(0, 0, 0)):
    """Extruye una o varias curvas cerradas 2D (los contornos interiores hacen de agujeros)."""
    cu = bpy.data.curves.new(nombre, "CURVE")
    cu.dimensions = "2D"
    cu.fill_mode = "BOTH"
    cu.extrude = max(grosor / 2 - bisel, 0.0005)
    cu.bevel_depth = bisel
    cu.bevel_resolution = 2
    for pts in contornos:
        sp = cu.splines.new("POLY")
        sp.points.add(len(pts) - 1)
        for i, (x, y) in enumerate(pts):
            sp.points[i].co = (x, y, 0, 1)
        sp.use_cyclic_u = True
    o = bpy.data.objects.new(nombre, cu)
    bpy.context.collection.objects.link(o)
    o.location = loc
    o.rotation_euler = rot
    o.data.materials.append(material)
    return o

def circulo(r, n=96, c=(0, 0), fase=0.0):
    return [(c[0] + r * math.cos(fase + 2 * math.pi * i / n), c[1] + r * math.sin(fase + 2 * math.pi * i / n)) for i in range(n)]


def estudio(objetivo, dist, alt_grados, azim_grados, focal=85, luz=1.0):
    w = bpy.data.worlds.new("Mundo")
    sc.world = w
    try: w.use_nodes = True
    except Exception: pass
    nt = w.node_tree
    bg = nt.nodes.get("Background") or nt.nodes.new("ShaderNodeBackground")
    out = nt.nodes.get("World Output") or nt.nodes.new("ShaderNodeOutputWorld")
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.42
    ramp.color_ramp.elements[0].color = (0.06, 0.065, 0.075, 1)
    ramp.color_ramp.elements[1].position = 0.75
    ramp.color_ramp.elements[1].color = (1.0, 1.0, 1.0, 1)
    mr = nt.nodes.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value = -1
    mr.inputs["From Max"].default_value = 1
    nt.links.new(tc.outputs["Generated"], sep.inputs[0])
    nt.links.new(sep.outputs["Z"], mr.inputs["Value"])
    nt.links.new(mr.outputs["Result"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = 0.8
    nt.links.new(bg.outputs[0], out.inputs[0])

    def area(nombre, pos, energia, tam, color=(1, 1, 1)):
        l = bpy.data.lights.new(nombre, "AREA")
        l.energy = energia * luz
        l.size = tam
        l.color = color
        o = bpy.data.objects.new(nombre, l)
        bpy.context.collection.objects.link(o)
        o.location = pos
        d = Vector(objetivo) - Vector(pos)
        o.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
        return o
    area("clave", (-4, -5, 5), 1500, 3.5)
    area("relleno", (5, -3, 1.5), 500, 4, (0.92, 0.95, 1.0))
    area("contra", (1, 5, 5), 1200, 3, (1.0, 0.93, 0.85))
    area("bajo", (0, -4, -2.5), 120, 4)
    # softbox grande junto a la cámara: da brillo a las caras que miran al frente
    alt, az = math.radians(alt_grados + 14), math.radians(azim_grados - 22)
    area("frente", (objetivo[0] + 9 * math.cos(alt) * math.sin(az), objetivo[1] - 9 * math.cos(alt) * math.cos(az),
                    objetivo[2] + 9 * math.sin(alt)), 900, 6)

    cam_d = bpy.data.cameras.new("Camara")
    cam_d.lens = focal
    cam = bpy.data.objects.new("Camara", cam_d)
    bpy.context.collection.objects.link(cam)
    alt, az = math.radians(alt_grados), math.radians(azim_grados)
    cam.location = (objetivo[0] + dist * math.cos(alt) * math.sin(az),
                    objetivo[1] - dist * math.cos(alt) * math.cos(az),
                    objetivo[2] + dist * math.sin(alt))
    d = Vector(objetivo) - cam.location
    cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    sc.camera = cam

# ---------- piezas sencillas ----------
def caja(loc, tam, material, bisel=0.02, nombre="caja"):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.active_object
    o.name = nombre
    o.scale = tam
    o.data.materials.append(material)
    if bisel:
        bv = o.modifiers.new("b", "BEVEL"); bv.width = bisel; bv.segments = 3
        bv.use_clamp_overlap = True
    return o

def cilindro(loc, r, h, material, rot=(0, 0, 0), n=48, suave=True, bisel=0.0):
    bpy.ops.mesh.primitive_cylinder_add(vertices=n, radius=r, depth=h, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.data.materials.append(material)
    if suave:
        for f in o.data.polygons: f.use_smooth = True
        try: o.data.set_sharp_from_angle(angle=math.radians(40))
        except Exception: pass
    if bisel:
        bv = o.modifiers.new("b", "BEVEL"); bv.width = bisel; bv.segments = 3
    return o

def esfera(loc, r, material, escala=(1, 1, 1)):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=48, ring_count=24, location=loc)
    o = bpy.context.active_object
    o.scale = escala
    o.data.materials.append(material)
    for f in o.data.polygons: f.use_smooth = True
    return o

def agrupar(rot, tipos=("MESH", "CURVE")):
    bpy.ops.object.empty_add(location=(0, 0, 0))
    raiz = bpy.context.active_object
    for o in bpy.data.objects:
        if o.type in tipos and o.parent is None: o.parent = raiz
    raiz.rotation_euler = rot
    return raiz

def emisivo(nombre, color, fuerza=4.0):
    m = mat(nombre, color, 0.0, 0.3)
    p = m.node_tree.nodes.get("Principled BSDF")
    for k in ("Emission Color", "Emission"):
        if k in p.inputs: p.inputs[k].default_value = (*color, 1); break
    if "Emission Strength" in p.inputs: p.inputs["Emission Strength"].default_value = fuerza
    return m

def chip_dip(x, y, z, patas, material_cuerpo, metal, escala=1.0):
    """Circuito integrado DIP: cuerpo negro, muesca, punto de la patilla 1 y patillas dobladas."""
    paso = 0.254 * escala
    largo = patas / 2 * paso + 0.12 * escala
    ancho = 0.62 * escala
    caja((x, y, z), (largo, ancho, 0.3 * escala), material_cuerpo, 0.03 * escala)
    oscuro = mat("muesca", (0.01, 0.01, 0.012), 0.0, 0.6)
    cilindro((x - largo / 2 + 0.001, y, z + 0.151 * escala), 0.07 * escala, 0.01, oscuro)
    cilindro((x - largo / 2 + 0.16 * escala, y - ancho / 2 + 0.13 * escala, z + 0.151 * escala), 0.04 * escala, 0.008, oscuro)
    for i in range(patas // 2):
        px = x - largo / 2 + 0.12 * escala + paso * (i + 0.5) - 0.06 * escala
        for s in (-1, 1):
            caja((px, y + s * (ancho / 2 + 0.05 * escala), z - 0.04 * escala), (0.1 * escala, 0.12 * escala, 0.025 * escala), metal, 0.005)
            caja((px, y + s * (ancho / 2 + 0.11 * escala), z - 0.22 * escala), (0.05 * escala, 0.025 * escala, 0.38 * escala), metal, 0.004)

# ---------- analógica: resistencia, condensador electrolítico y LED ----------
def componentes():
    beige = mat("beige", (0.86, 0.72, 0.52), 0.0, 0.45)
    estano = mat("estano", (0.78, 0.79, 0.8), 1.0, 0.25)
    azul = mat("electrolitico", (0.02, 0.07, 0.32), 0.0, 0.3, **{"Coat Weight": 0.4})
    gris = mat("franja", (0.75, 0.78, 0.82), 0.0, 0.35)
    alu = mat("aluminio", (0.82, 0.83, 0.85), 1.0, 0.28)
    rojo_led = mat("led", (0.95, 0.08, 0.05), 0.0, 0.05, **{"Transmission Weight": 0.85, "IOR": 1.5})
    bandas = [mat("b1", (0.95, 0.78, 0.0), 0.0, 0.4), mat("b2", (0.45, 0.18, 0.75), 0.0, 0.4), mat("b3", (0.85, 0.1, 0.08), 0.0, 0.4), mat("b4", (0.8, 0.6, 0.18), 1.0, 0.3)]
    # resistencia tumbada delante
    rz = 0.35
    cilindro((0, -1.0, rz), 0.27, 1.3, beige, rot=(0, math.radians(90), 0))
    for sx in (-0.62, 0.62): esfera((sx, -1.0, rz), 0.34, beige, (0.55, 1, 1))
    for k, xb in enumerate((-0.62, -0.32, -0.06, 0.48)):
        if abs(xb) > 0.55: esfera((xb, -1.0, rz), 0.345, bandas[k], (0.18, 1, 1))
        else: cilindro((xb, -1.0, rz), 0.282, 0.12, bandas[k], rot=(0, math.radians(90), 0))
    for s in (-1, 1):
        cilindro((s * 1.35, -1.0, rz), 0.035, 1.1, estano, rot=(0, math.radians(90), 0))
    # condensador electrolítico de pie, detrás a la derecha
    cx, cy = 0.95, 0.65
    cilindro((cx, cy, 1.0), 0.62, 1.9, azul, bisel=0.06)
    cilindro((cx, cy, 1.955), 0.58, 0.02, alu)
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=0.627, depth=1.75, location=(cx, cy, 1.0))
    fr = bpy.context.active_object; fr.data.materials.append(gris)
    bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.object.mode_set(mode="OBJECT")
    # solo una franja: cortamos el cilindro con un booleano
    corte = caja((cx + 0.2, cy - 0.62, 1.0), (0.42, 0.4, 2.2), gris, 0)
    b = fr.modifiers.new("franja", "BOOLEAN"); b.operation = "INTERSECT"; b.object = corte; corte.hide_render = True
    for f in fr.data.polygons: f.use_smooth = True
    for s in (-1, 1): cilindro((cx + s * 0.2, cy, -0.05), 0.035, 0.2, estano)
    # LED rojo de pie, detrás a la izquierda
    lx, ly = -0.85, 0.75
    cilindro((lx, ly, 0.1), 0.3, 0.1, rojo_led)
    cilindro((lx, ly, 0.45), 0.26, 0.6, rojo_led)
    esfera((lx, ly, 0.75), 0.26, rojo_led)
    for s, h in ((-1, 0.28), (1, 0.2)): cilindro((lx + s * 0.09, ly, 0.05 - h / 2), 0.025, h, estano)
    agrupar((0, 0, math.radians(-18)))
    estudio((0, 0, 0.6), 11, 26, -12, focal=85, luz=0.45)

# ---------- digital: circuito integrado ----------
def chip():
    negro = mat("epoxi", (0.025, 0.025, 0.03), 0.0, 0.42)
    estano = mat("estano", (0.8, 0.8, 0.82), 1.0, 0.22)
    chip_dip(0, 0, 0.5, 16, negro, estano, escala=2.2)
    chip_dip(0.6, 2.4, 0.5, 8, negro, estano, escala=2.2)
    agrupar((0, 0, math.radians(-28)))
    estudio((0.3, 1.0, 0.3), 15, 32, -10, focal=85, luz=0.45)

# ---------- microprogramables: placa con microcontrolador (genérica) ----------
def placa():
    pcb = mat("pcb", (0.0, 0.33, 0.45), 0.0, 0.35, **{"Coat Weight": 0.5})
    negro = mat("negro", (0.03, 0.03, 0.035), 0.0, 0.45)
    estano = mat("estano", (0.82, 0.82, 0.84), 1.0, 0.2)
    plata = mat("plata", (0.75, 0.76, 0.78), 1.0, 0.3)
    blanco = mat("serigrafia", (0.92, 0.94, 0.95), 0.0, 0.5)
    amarillo = mat("tantalo", (0.85, 0.65, 0.1), 0.0, 0.4)
    caja((0, 0, 0), (5.4, 4.0, 0.12), pcb, 0.04)
    chip_dip(0.4, -0.75, 0.33, 28, negro, estano, escala=1.0)
    for i in range(14):  # zócalo
        pass
    caja((-2.45, 1.0, 0.45), (1.4, 1.2, 0.8), plata, 0.05)            # conector USB
    caja((-2.35, -1.25, 0.42), (1.3, 0.9, 0.75), negro, 0.06)         # jack de alimentación
    cilindro((-3.0, -1.25, 0.42), 0.26, 0.05, mat("hueco", (0, 0, 0), 0, 0.8), rot=(0, math.radians(90), 0))
    for y, n in ((1.82, 18), (-1.82, 14)):                            # tiras de pines hembra
        x0 = -0.6 if n == 18 else 0.0
        caja((x0 + n * 0.254 / 2 + 0.3, y, 0.3), (n * 0.254, 0.26, 0.42), negro, 0.02)
        for i in range(n):
            caja((x0 + 0.3 + 0.127 + i * 0.254, y, 0.515), (0.1, 0.1, 0.01), mat("agujero", (0, 0, 0), 0, 0.9), 0)
    caja((-0.9, 0.9, 0.2), (0.5, 0.2, 0.18), plata, 0.08)              # cristal de cuarzo
    caja((1.9, 0.9, 0.18), (0.42, 0.42, 0.18), plata, 0.02)            # pulsador de reset
    cilindro((1.9, 0.9, 0.3), 0.12, 0.08, negro)
    for x in (-1.6, -1.2):                                              # condensadores
        cilindro((x, 0.2, 0.45), 0.22, 0.75, mat("cond", (0.1, 0.1, 0.12), 0.0, 0.3), bisel=0.02)
    caja((1.0, 0.95, 0.12), (0.2, 0.12, 0.1), amarillo, 0.01)
    for k, c in enumerate(((0.1, 1.0, 0.25), (1.0, 0.6, 0.05), (1.0, 0.85, 0.1))):  # LED SMD
        caja((2.3, -0.2 + k * 0.28, 0.1), (0.16, 0.1, 0.07), emisivo("smd%d" % k, c, 6 if k == 0 else 0.5), 0.005)
    for i in range(10): caja((-0.5 + i * 0.32, 1.35, 0.065), (0.2, 0.05, 0.005), blanco, 0)
    for x, y in ((-2.5, 1.85), (2.5, 1.85), (2.5, -1.85), (-1.2, -1.85)):
        cilindro((x, y, 0.06), 0.13, 0.02, estano)
    agrupar((0, 0, math.radians(-22)))
    estudio((0.1, 0.1, 0.2), 17.5, 38, -10, focal=85, luz=0.5)

# ---------- industrial: PLC modular en carril DIN ----------
def plc():
    gris = mat("carcasa", (0.72, 0.74, 0.76), 0.0, 0.45)
    oscuro = mat("frontal", (0.18, 0.2, 0.24), 0.0, 0.4)
    negro = mat("bornas", (0.05, 0.05, 0.06), 0.0, 0.5)
    metal = mat("tornillo", (0.75, 0.76, 0.78), 1.0, 0.3)
    carril = mat("carril", (0.62, 0.64, 0.66), 1.0, 0.35)
    caja((0, 0.52, 0), (7.0, 0.16, 1.4), carril, 0.02)                 # carril DIN (detrás)
    anchos = [1.6, 1.3, 1.3, 1.3]
    x = -2.9
    for k, w in enumerate(anchos):
        cx = x + w / 2
        caja((cx, 0, 0), (w - 0.06, 0.9, 4.2), gris, 0.06)
        caja((cx, -0.46, 0.15), (w - 0.3, 0.04, 2.0), oscuro, 0.02)
        for r in range(8 if k else 4):                                  # ventanitas de LED
            col = (0.1, 0.9, 0.2) if (r + k) % 3 else (1.0, 0.55, 0.05)
            caja((cx - (w - 0.5) / 2 + (r % 4) * (w - 0.5) / 3, -0.49, 0.95 - (r // 4) * 0.25), (0.14, 0.02, 0.1), emisivo("led%d%d" % (k, r), col, 5 if (r + k) % 2 else 0.2), 0.005)
        if k == 0:
            caja((cx, -0.48, -0.55), (0.9, 0.02, 0.5), mat("pantalla", (0.04, 0.06, 0.08), 0.0, 0.15), 0.01)
        for zb in (1.75, -1.75):                                       # bornas arriba y abajo
            caja((cx, -0.15, zb), (w - 0.12, 0.7, 0.55), negro, 0.03)
            n = int((w - 0.2) / 0.32)
            for i in range(n):
                px = cx - (w - 0.2) / 2 + 0.16 + i * 0.32
                cilindro((px, -0.51, zb + 0.08), 0.1, 0.06, metal, rot=(math.radians(90), 0, 0))
                caja((px, -0.545, zb + 0.08), (0.14, 0.02, 0.025), negro, 0)
        x += w
    agrupar((0, 0, math.radians(-25)))
    estudio((0, 0, 0), 17, 14, -14, focal=85, luz=0.55)

# ---------- voz y datos: disco duro abierto ----------
def disco():
    alu = mat("aluminio", (0.72, 0.73, 0.75), 1.0, 0.38)
    espejo = mat("plato", (0.9, 0.9, 0.92), 1.0, 0.04)
    metal = mat("metal", (0.55, 0.56, 0.58), 1.0, 0.3)
    negro = mat("negro", (0.06, 0.06, 0.07), 0.0, 0.4)
    cobre = mat("bobina", (0.72, 0.4, 0.15), 1.0, 0.35)
    caja((0, 0, 0), (4.0, 5.8, 0.5), alu, 0.08)
    caja((0, 0, 0.27), (3.7, 5.5, 0.06), metal, 0.03)
    cilindro((0, 0.95, 0.36), 1.75, 0.05, espejo, n=128)
    cilindro((0, 0.95, 0.42), 0.42, 0.14, metal, n=64, bisel=0.02)
    for a in range(6):
        ang = a * math.pi / 3
        cilindro((0.28 * math.cos(ang), 0.95 + 0.28 * math.sin(ang), 0.5), 0.05, 0.03, negro)
    # brazo del cabezal: perfil afilado que gira sobre el eje
    pts = [(0, 0.22), (2.6, 0.08), (2.75, 0.05), (2.75, -0.05), (2.6, -0.08), (0, -0.22), (-0.4, -0.35), (-0.9, -0.3), (-0.9, 0.3), (-0.4, 0.35)]
    brazo = perfil("brazo", [pts], 0.06, metal, 0.01, loc=(1.35, -1.6, 0.46))
    brazo.rotation_euler = (0, 0, math.radians(128))
    cilindro((1.35, -1.6, 0.44), 0.3, 0.2, metal, bisel=0.02)
    caja((1.55, -2.35, 0.4), (1.1, 0.7, 0.14), cobre, 0.03)
    caja((1.55, -2.35, 0.49), (1.3, 0.9, 0.04), metal, 0.02)
    for x, y in ((-1.8, 2.7), (1.8, 2.7), (1.8, -2.7), (-1.8, -2.7), (-1.8, 0), (1.8, 0.4)):
        cilindro((x, y, 0.3), 0.1, 0.04, metal)
        caja((x, y, 0.325), (0.12, 0.025, 0.01), negro, 0)
    caja((-1.2, -2.4, 0.33), (0.9, 0.3, 0.06), negro, 0.02)
    agrupar((0, 0, math.radians(-30)))
    estudio((0, 0, 0.2), 15, 46, -12, focal=85, luz=0.5)

ESCENAS = {"componentes": componentes, "chip": chip, "placa": placa, "plc": plc, "disco": disco}
ESCENAS[QUE]()
sc.render.filepath = SALIDA
bpy.ops.render.render(write_still=True)
print("OK", SALIDA)
