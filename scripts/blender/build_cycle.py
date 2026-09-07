"""Build a Tron-style light cycle in Blender and export it as GLB for the Light Cycles game.
Run:  blender -b -P build_cycle.py -- out.glb
Front of the bike points to Blender -Y (glTF +Z). Materials named glow_* are tinted per player in-game."""
import bpy, bmesh, sys, math
from mathutils import Vector

out = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "cycle.glb"
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

def mat(name, color, metallic=0.0, rough=0.5, emit=None, strength=0.0, alpha=1.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = rough
    if emit:
        bsdf.inputs["Emission Color"].default_value = (*emit, 1)
        bsdf.inputs["Emission Strength"].default_value = strength
    if alpha < 1:
        bsdf.inputs["Alpha"].default_value = alpha; m.blend_method = "BLEND"
    return m

BODY = mat("body_dark", (0.03, 0.035, 0.05), metallic=0.85, rough=0.3)
TIRE = mat("tire", (0.02, 0.02, 0.025), metallic=0.2, rough=0.8)
GLASS = mat("canopy", (0.02, 0.05, 0.06), metallic=0.3, rough=0.1)
GLOW = mat("glow_strip", (0.4, 1.0, 0.95), rough=0.4, emit=(0.4, 1.0, 0.95), strength=6.0)
GLOW_W = mat("glow_wheel", (0.4, 1.0, 0.95), rough=0.4, emit=(0.4, 1.0, 0.95), strength=5.0)

def add(obj, material, smooth=True):
    obj.data.materials.append(material)
    if smooth:
        for p in obj.data.polygons: p.use_smooth = True
    return obj

def bevel(obj, width=0.04, segments=3):
    b = obj.modifiers.new("bevel", "BEVEL"); b.width = width; b.segments = segments; b.limit_method = "ANGLE"
    return obj

def subsurf(obj, levels=2):
    s = obj.modifiers.new("subd", "SUBSURF"); s.levels = levels; s.render_levels = levels
    return obj

# ---- body: a tapered, low hull along Y ----
bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.42, depth=2.9, location=(0, 0, 0.95))
body = bpy.context.object; body.name = "hull"; body.rotation_euler = (math.pi / 2, 0, 0)
bpy.ops.object.transform_apply(rotation=True)
bm = bmesh.new(); bm.from_mesh(body.data)
for v in bm.verts:
    t = abs(v.co.y) / 1.45                      # 0 at the middle, 1 at the ends
    v.co.x *= (1 - 0.55 * t * t)                # pinch the nose and tail
    v.co.z = 0.95 + (v.co.z - 0.95) * (0.85 - 0.45 * t * t)
    if v.co.y < 0: v.co.z -= 0.22 * t           # nose dips
bm.to_mesh(body.data); bm.free()
add(body, BODY); subsurf(body, 2)

# ---- canopy ----
bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=1, location=(0, -0.15, 1.28))
canopy = bpy.context.object; canopy.name = "canopy"; canopy.scale = (0.3, 0.62, 0.24)
add(canopy, GLASS)

# ---- rear fin ----
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 1.05, 1.32))
fin = bpy.context.object; fin.name = "fin"; fin.scale = (0.06, 0.6, 0.22)
bm = bmesh.new(); bm.from_mesh(fin.data)
for v in bm.verts:
    if v.co.y < 0: v.co.z -= 0.35                # slopes down toward the front
bm.to_mesh(fin.data); bm.free()
add(fin, BODY, smooth=False); bevel(fin, 0.02, 2)

# ---- light strips on both flanks + spine ----
for sx in (-1, 1):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(sx * 0.4, 0.05, 1.02))
    s = bpy.context.object; s.name = f"strip_{'L' if sx < 0 else 'R'}"; s.scale = (0.045, 2.3, 0.07)
    add(s, GLOW, smooth=False)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0.35, 1.36))
spine = bpy.context.object; spine.name = "strip_spine"; spine.scale = (0.05, 1.5, 0.03)
add(spine, GLOW, smooth=False)

# ---- wheels: tire, dark disc, glowing rim ring ----
for y in (-1.32, 1.32):
    tag = "front" if y < 0 else "rear"
    bpy.ops.mesh.primitive_torus_add(major_radius=0.86, minor_radius=0.17, major_segments=40, minor_segments=14, location=(0, y, 0.86), rotation=(0, math.pi / 2, 0))
    tire = bpy.context.object; tire.name = f"tire_{tag}"; add(tire, TIRE)
    bpy.ops.mesh.primitive_cylinder_add(vertices=40, radius=0.72, depth=0.22, location=(0, y, 0.86), rotation=(0, math.pi / 2, 0))
    disc = bpy.context.object; disc.name = f"disc_{tag}"; add(disc, BODY); bevel(disc, 0.03, 2)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.86, minor_radius=0.05, major_segments=48, minor_segments=8, location=(0, y, 0.86), rotation=(0, math.pi / 2, 0))
    ring = bpy.context.object; ring.name = f"glow_ring_{tag}"; ring.scale = (1.0, 1.0, 1.0); ring.location.x = 0
    add(ring, GLOW_W)
    # the glow ring sits just outside the tire on both faces
    ring.scale = (1.35, 1.02, 1.02)
    # hub cover
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.2, depth=0.3, location=(0, y, 0.86), rotation=(0, math.pi / 2, 0))
    hub = bpy.context.object; hub.name = f"hub_{tag}"; add(hub, GLOW_W)

# ---- wheel forks joining wheels to hull ----
for y in (-0.95, 0.95):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, y, 0.95))
    fork = bpy.context.object; fork.name = "fork"; fork.scale = (0.18, 0.5, 0.28)
    add(fork, BODY, smooth=False); bevel(fork, 0.03, 2)

for o in bpy.data.objects: o.select_set(True)
bpy.ops.export_scene.gltf(filepath=out, export_format="GLB", export_apply=True, use_selection=True,
                          export_materials="EXPORT", export_yup=True, export_texcoords=False, export_normals=True)
print("exported", out)
