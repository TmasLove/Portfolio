"""Build an Armagetron-style light cycle in Blender and export it as GLB for the Light Cycles game.
Run:  blender -b -P build_cycle.py -- out.glb
Front of the bike points to Blender -Y (glTF +Z).
Materials: tint_* take the player's colour in-game, glow_* glow in the player's colour, the rest stay as built."""
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

SHELL = mat("tint_shell", (0.0, 0.88, 0.78), metallic=0.55, rough=0.35, emit=(0.0, 0.88, 0.78), strength=0.35)
DARK = mat("dark", (0.02, 0.022, 0.03), metallic=0.6, rough=0.55)
GLASS = mat("canopy", (0.01, 0.02, 0.03), metallic=0.4, rough=0.08)
GLOW = mat("glow_line", (0.5, 1.0, 0.95), rough=0.4, emit=(0.5, 1.0, 0.95), strength=6.0)

def add(obj, material, smooth=True):
    obj.data.materials.append(material)
    if smooth:
        for p in obj.data.polygons: p.use_smooth = True
    return obj

def bevel(obj, width, segments):
    b = obj.modifiers.new("bevel", "BEVEL"); b.width = width; b.segments = segments; b.limit_method = "ANGLE"; b.angle_limit = math.radians(40)
    return obj

def apply_all(obj):
    bpy.context.view_layer.objects.active = obj
    for m in list(obj.modifiers): bpy.ops.object.modifier_apply(modifier=m.name)

# ---- shell: side profile (y = length, z = height), extruded across x, rounded ----
# front (-y) to back (+y): low nose, up over the front wheel, canopy hump, long tail over the rear wheel
profile = [(-2.05, 0.62), (-1.95, 1.05), (-1.6, 1.5), (-1.15, 1.62), (-0.7, 1.55), (-0.35, 1.72), (0.05, 1.88), (0.5, 1.86),
           (1.0, 1.72), (1.5, 1.5), (1.95, 1.15), (2.1, 0.7), (2.1, 0.62),
           (1.55, 0.62), (1.05, 0.62), (0.45, 0.62), (-0.35, 0.62), (-1.05, 0.62), (-1.6, 0.62)]
HALF_W = 0.34
bm = bmesh.new()
top = [bm.verts.new((HALF_W, y, z)) for y, z in profile]
bot = [bm.verts.new((-HALF_W, y, z)) for y, z in profile]
bm.faces.new(top); bm.faces.new(list(reversed(bot)))
n = len(profile)
for i in range(n):
    a, b = top[i], top[(i + 1) % n]; c, d = bot[(i + 1) % n], bot[i]
    bm.faces.new((a, b, c, d))
me = bpy.data.meshes.new("shell"); bm.to_mesh(me); bm.free()
shell = bpy.data.objects.new("shell", me); bpy.context.scene.collection.objects.link(shell)
bpy.context.view_layer.objects.active = shell; shell.select_set(True)
bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT"); bpy.ops.mesh.normals_make_consistent(inside=False); bpy.ops.object.mode_set(mode="OBJECT")
# round side windows through the shell: the dark wheel disc shows through them, Tron-style
WHEEL_R, WHEEL_Z, WIN_R = 0.7, 0.7, 0.5
for y in (-1.38, 1.42):
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=WIN_R, depth=1.2, location=(0, y, WHEEL_Z), rotation=(0, math.pi / 2, 0))
    cutter = bpy.context.object
    mod = shell.modifiers.new("arch", "BOOLEAN"); mod.operation = "DIFFERENCE"; mod.object = cutter
    apply_all(shell)
    bpy.data.objects.remove(cutter, do_unlink=True)
bevel(shell, 0.11, 5)
add(shell, SHELL)

# ---- canopy: dark glass hump set into the shell ----
bpy.ops.mesh.primitive_uv_sphere_add(segments=28, ring_count=14, radius=1, location=(0, -0.05, 1.62))
canopy = bpy.context.object; canopy.name = "canopy"; canopy.scale = (0.26, 0.72, 0.36)
add(canopy, GLASS)

# ---- wheels: dark discs with a glowing rim line, a hub, and a thin tyre ----
for y, tag in ((-1.38, "front"), (1.42, "rear")):
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=WHEEL_R, depth=0.6, location=(0, y, WHEEL_Z), rotation=(0, math.pi / 2, 0))
    disc = bpy.context.object; disc.name = f"wheel_{tag}"; add(disc, DARK); bevel(disc, 0.04, 3)
    bpy.ops.mesh.primitive_torus_add(major_radius=WIN_R - 0.02, minor_radius=0.035, major_segments=56, minor_segments=8, location=(0.345, y, WHEEL_Z), rotation=(0, math.pi / 2, 0))
    rim = bpy.context.object; rim.name = f"glow_rim_{tag}"; add(rim, GLOW)
    rim2 = rim.copy(); rim2.data = rim.data.copy(); bpy.context.scene.collection.objects.link(rim2); rim2.location.x = -0.345
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.12, depth=0.72, location=(0, y, WHEEL_Z), rotation=(0, math.pi / 2, 0))
    hub = bpy.context.object; hub.name = f"glow_hub_{tag}"; add(hub, GLOW)

# ---- light lines along the flanks and the tail emitter where the wall comes out ----
for sx in (-1, 1):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(sx * (HALF_W + 0.005), 0.15, 0.78))
    s = bpy.context.object; s.name = "glow_flank"; s.scale = (0.03, 2.9, 0.05); add(s, GLOW, smooth=False)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 2.09, 1.0))
tail = bpy.context.object; tail.name = "glow_tail"; tail.scale = (0.5, 0.08, 0.34); add(tail, GLOW, smooth=False)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -2.06, 0.9))
lamp = bpy.context.object; lamp.name = "glow_head"; lamp.scale = (0.36, 0.06, 0.16); add(lamp, GLOW, smooth=False)

for o in bpy.data.objects: o.select_set(True)
bpy.ops.export_scene.gltf(filepath=out, export_format="GLB", export_apply=True, use_selection=True,
                          export_materials="EXPORT", export_yup=True, export_texcoords=False, export_normals=True)
print("exported", out)
