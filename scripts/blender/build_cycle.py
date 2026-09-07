"""Build a Tron: Legacy-style light cycle in Blender and export it as GLB for the Light Cycles game.
Run:  blender -b -P build_cycle.py -- out.glb
Front of the bike points to Blender -Y (glTF +Z).
Look: dark gloss body arched over two HUBLESS wheels, a rider lying flat, glow lines in the player's colour.
Materials: glow_* glow in the player's colour in-game; tint_* take the colour flat; the rest stay as built."""
import bpy, bmesh, sys, math

out = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "cycle.glb"
bpy.ops.wm.read_factory_settings(use_empty=True)

def mat(name, color, metallic=0.0, rough=0.5, emit=None, strength=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Metallic"].default_value = metallic
    b.inputs["Roughness"].default_value = rough
    if emit:
        b.inputs["Emission Color"].default_value = (*emit, 1)
        b.inputs["Emission Strength"].default_value = strength
    return m

BODY = mat("body_gloss", (0.012, 0.014, 0.02), metallic=0.9, rough=0.18)
TIRE = mat("tire", (0.03, 0.03, 0.035), metallic=0.4, rough=0.6)
SUIT = mat("suit", (0.02, 0.022, 0.03), metallic=0.2, rough=0.7)
GLOW = mat("glow_line", (0.5, 1.0, 0.95), rough=0.4, emit=(0.5, 1.0, 0.95), strength=6.0)
GLOW_W = mat("glow_wheel", (0.5, 1.0, 0.95), rough=0.4, emit=(0.5, 1.0, 0.95), strength=7.0)

def add(obj, material, smooth=True):
    obj.data.materials.append(material)
    if smooth:
        for p in obj.data.polygons: p.use_smooth = True
    return obj

def bevel(obj, width, segments):
    b = obj.modifiers.new("bevel", "BEVEL"); b.width = width; b.segments = segments; b.limit_method = "ANGLE"; b.angle_limit = math.radians(40)
    return obj

def subsurf(obj, levels=2):
    s = obj.modifiers.new("subd", "SUBSURF"); s.levels = levels; s.render_levels = levels
    return obj

def extrude_profile(name, profile, half_w, taper=None):
    """Closed side profile [(y, z)...] extruded across x. taper(y, z) -> width factor lets the nose/tail pinch."""
    bm = bmesh.new()
    def w(y, z): return half_w * (taper(y, z) if taper else 1.0)
    top = [bm.verts.new((w(y, z), y, z)) for y, z in profile]
    bot = [bm.verts.new((-w(y, z), y, z)) for y, z in profile]
    bm.faces.new(top); bm.faces.new(list(reversed(bot)))
    n = len(profile)
    for i in range(n):
        a, b = top[i], top[(i + 1) % n]; c, d = bot[(i + 1) % n], bot[i]
        bm.faces.new((a, b, c, d))
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(ob)
    bpy.context.view_layer.objects.active = ob; ob.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT"); bpy.ops.mesh.normals_make_consistent(inside=False); bpy.ops.object.mode_set(mode="OBJECT")
    return ob

WHEEL_R, WHEEL_Z, WY = 0.78, 0.78, 1.45     # hubless wheels, centres at y = ±WY

# ---- body: a bridge with a cowl over each wheel and a deep engine block between them ----
profile = [
    # top, nose to tail
    (-2.2, 1.3), (-2.1, 1.62), (-1.9, 1.84), (-1.55, 1.98), (-1.15, 1.96), (-0.8, 1.82), (-0.45, 1.66), (-0.1, 1.55), (0.25, 1.52),
    (0.6, 1.6), (0.95, 1.8), (1.35, 1.96), (1.75, 1.96), (2.05, 1.78), (2.25, 1.5), (2.3, 1.25),
    # underside, tail to nose: clears the wheels, drops to the engine block in the middle
    (2.2, 1.25), (1.9, 1.5), (1.5, 1.62), (1.05, 1.5), (0.8, 0.9), (0.55, 0.5), (0.0, 0.42), (-0.55, 0.5), (-0.85, 0.95),
    (-1.1, 1.5), (-1.5, 1.62), (-1.9, 1.5), (-2.15, 1.22),
]
def taper(y, z):
    t = max(0.0, (abs(y) - 1.4) / 0.9)            # pinch the last 0.9 units of nose and tail
    return 1.0 - 0.55 * t * t
body = extrude_profile("body", profile, 0.3, taper)
bevel(body, 0.06, 2); subsurf(body, 2); add(body, BODY)

# ---- rider lying flat along the top, helmet forward ----
bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=1, location=(0, -0.55, 2.02))
torso = bpy.context.object; torso.name = "rider"; torso.scale = (0.2, 0.75, 0.13); add(torso, SUIT)
bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=0.17, location=(0, -1.3, 2.08))
helm = bpy.context.object; helm.name = "helmet"; helm.scale = (1, 1.15, 0.9); add(helm, BODY)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -1.44, 2.08))
visor = bpy.context.object; visor.name = "glow_visor"; visor.scale = (0.2, 0.05, 0.06); add(visor, GLOW, smooth=False)
for sx in (-1, 1):
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.05, depth=0.55, location=(sx * 0.16, -1.05, 1.95), rotation=(math.radians(80), 0, 0))
    arm = bpy.context.object; arm.name = "arm"; add(arm, SUIT)

# ---- hubless wheels: a dark tyre ring with a glowing ring on the inner edge, both faces ----
for y, tag in ((-WY, "front"), (WY, "rear")):
    bpy.ops.mesh.primitive_torus_add(major_radius=WHEEL_R - 0.11, minor_radius=0.13, major_segments=64, minor_segments=16, location=(0, y, WHEEL_Z), rotation=(0, math.pi / 2, 0))
    tyre = bpy.context.object; tyre.name = f"tyre_{tag}"; tyre.scale = (1, 1, 1.7); add(tyre, TIRE)   # local Z = wheel axis after the rotation
    # one glowing ring on each face at the hole's edge, and a glowing band lining the inside of the hole
    for sx in (-1, 1):
        bpy.ops.mesh.primitive_torus_add(major_radius=WHEEL_R - 0.27, minor_radius=0.035, major_segments=72, minor_segments=8, location=(sx * 0.2, y, WHEEL_Z), rotation=(0, math.pi / 2, 0))
        ring = bpy.context.object; ring.name = f"glow_ring_{tag}"; add(ring, GLOW_W)
    bpy.ops.mesh.primitive_torus_add(major_radius=WHEEL_R - 0.25, minor_radius=0.04, major_segments=72, minor_segments=8, location=(0, y, WHEEL_Z), rotation=(0, math.pi / 2, 0))
    band = bpy.context.object; band.name = f"glow_band_{tag}"; band.scale = (1, 1, 4.5); add(band, GLOW_W)   # a flat band lining the hole, open in the middle

# ---- glow lines: flank strips on the engine block, edge lines on the cowls, headlamp, tail emitter ----
for sx in (-1, 1):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(sx * 0.305, 0.05, 0.98))
    s = bpy.context.object; s.name = "glow_flank"; s.scale = (0.03, 1.1, 0.05); add(s, GLOW, smooth=False)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(sx * 0.16, 0.6, 1.74), rotation=(math.radians(-32), 0, 0))
    s2 = bpy.context.object; s2.name = "glow_rear_line"; s2.scale = (0.03, 0.9, 0.03); add(s2, GLOW, smooth=False)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(sx * 0.2, -1.75, 1.78), rotation=(math.radians(30), 0, 0))
    s3 = bpy.context.object; s3.name = "glow_front_line"; s3.scale = (0.03, 0.7, 0.03); add(s3, GLOW, smooth=False)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0.05, 0.62))
grille = bpy.context.object; grille.name = "glow_grille"; grille.scale = (0.5, 0.6, 0.06); add(grille, GLOW, smooth=False)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -2.22, 1.4))
lamp = bpy.context.object; lamp.name = "glow_head"; lamp.scale = (0.22, 0.05, 0.12); add(lamp, GLOW, smooth=False)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 2.3, 1.45))
tail = bpy.context.object; tail.name = "glow_tail"; tail.scale = (0.36, 0.06, 0.32); add(tail, GLOW, smooth=False)

for o in bpy.data.objects: o.select_set(True)
bpy.ops.export_scene.gltf(filepath=out, export_format="GLB", export_apply=True, use_selection=True,
                          export_materials="EXPORT", export_yup=True, export_texcoords=False, export_normals=True,
                          export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=6)  # Draco: ~5x smaller download
print("exported", out)
