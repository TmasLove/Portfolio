"""Render a still of the exported cycle.glb for a quick look.  blender -b -P render_cycle.py -- cycle.glb out.png"""
import bpy, sys, math
a = sys.argv[sys.argv.index("--") + 1:]
src, out = a[0], a[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
sc = bpy.context.scene
sc.render.engine = "BLENDER_EEVEE" if hasattr(bpy.types, "SceneEEVEE") and "BLENDER_EEVEE" in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items] else "BLENDER_EEVEE_NEXT"
sc.render.resolution_x, sc.render.resolution_y = 1200, 700
w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True
w.node_tree.nodes["Background"].inputs[0].default_value = (0.01, 0.012, 0.02, 1)
bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, 0)); floor = bpy.context.object
fm = bpy.data.materials.new("floor"); fm.use_nodes = True; b = fm.node_tree.nodes["Principled BSDF"]
b.inputs["Base Color"].default_value = (0.02, 0.025, 0.035, 1); b.inputs["Metallic"].default_value = 0.6; b.inputs["Roughness"].default_value = 0.25
floor.data.materials.append(fm)
cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc.collection.objects.link(cam); sc.camera = cam
cam.location = (9.5, -4.6, 2.6); cam.rotation_euler = (math.radians(76), 0, math.radians(64))
cam.data.lens = 40
light = bpy.data.objects.new("key", bpy.data.lights.new("key", "AREA")); sc.collection.objects.link(light)
light.location = (3, -2, 5); light.rotation_euler = (math.radians(35), math.radians(20), 0); light.data.energy = 900; light.data.size = 4
rim = bpy.data.objects.new("rim", bpy.data.lights.new("rim", "AREA")); sc.collection.objects.link(rim)
rim.location = (-3, 3, 3); rim.rotation_euler = (math.radians(-40), math.radians(-30), 0); rim.data.energy = 500; rim.data.size = 4; rim.data.color = (0.5, 0.9, 1)
try:
    sc.eevee.use_bloom = True
except Exception: pass
sc.render.filepath = out
bpy.ops.render.render(write_still=True)
print("rendered", out)
