# Light cycle model

Our own bike for the Light Cycles game, built and exported headless:

    blender -b -P build_cycle.py -- ../../site/assets/models/cycle.glb
    blender -b -P render_cycle.py -- ../../site/assets/models/cycle.glb preview.png

Materials named glow_* are tinted per player by cycles3d.js.
