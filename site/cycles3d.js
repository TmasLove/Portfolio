/* Light Cycles — the 3D view. The simulation in cycles.js is untouched; this only draws it: a chase camera
   behind your cycle, wall ribbons that glow (bloom), a mirrored grid floor, the goal ring, floor notes and
   crash sparks. Three.js is fetched on demand from jsDelivr; if it cannot load or WebGL is missing, the
   game keeps its flat view. Press V to switch chase / overview / flat. */
window.initCycles3D=function(root,api){
  var THREE=null,renderer=null,scene=null,camera=null,composer=null,ready=false,stopped=false,view='chase';
  try{view=localStorage.getItem('tr-cycles-view')||'chase'}catch(e){}
  var wrap=root.querySelector('.cyc'),host=document.createElement('div');host.className='cyc-3d';wrap.insertBefore(host,wrap.firstChild);
  var U='https://cdn.jsdelivr.net/npm/three@0.160.0/',E='/+esm';
  var WALL_H=10,CAP=6000; /* quads */
  /* Our own cycle model, if one is dropped at this path (any glTF/GLB you have the rights to; Draco-compressed
     meshes and WebP textures are fine). forward: which model axis points ahead; size: length in arena units.
     Without the file the built-in cycle below is used. */
  var MODEL={url:'/assets/models/cycle.glb',forward:'+z',size:18,lift:0}; /* cycle.glb is our own, built in Blender by scratchpad/build_cycle.py */
  var modelScene=null,modelTried=false;
  var walls,wallLine,mirror,floor,grid,ring,column,points,cycleMeshes=[],notes=[],noteLevel=null,ro=null;
  var pos,col,idx,linePos,lineCol,pPos,pCol;
  var camPos,camLook,camOff,lookOff,tmpV,DIRS=[[1,0],[0,1],[-1,0],[0,-1]];
  Promise.all([import(U+'+esm'),import(U+'examples/jsm/postprocessing/EffectComposer.js'+E),import(U+'examples/jsm/postprocessing/RenderPass.js'+E),import(U+'examples/jsm/postprocessing/UnrealBloomPass.js'+E),import(U+'examples/jsm/postprocessing/OutputPass.js'+E)])
    .then(function(m){if(stopped)return;THREE=m[0];build(m[1].EffectComposer,m[2].RenderPass,m[3].UnrealBloomPass,m[4].OutputPass);loadModel()})
    .catch(function(e){host.remove();ready=false;view='flat';if(window.console)console.warn('3D view unavailable, staying flat:',e&&e.message)});

  function build(EffectComposer,RenderPass,UnrealBloomPass,OutputPass){
    try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'})}catch(e){host.remove();view='flat';return}
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
    host.appendChild(renderer.domElement);
    scene=new THREE.Scene();scene.background=new THREE.Color(0x02040a);scene.fog=new THREE.FogExp2(0x02040a,0.00085);
    camera=new THREE.PerspectiveCamera(62,1,1,6000);
    scene.add(new THREE.HemisphereLight(0x6f9fcf,0x0a0d14,1.1));var sun=new THREE.DirectionalLight(0xdfefff,1.4);sun.position.set(300,500,200);scene.add(sun);
    camPos=new THREE.Vector3(500,600,1400);camLook=new THREE.Vector3(500,0,500);camOff=new THREE.Vector3(-58,24,0);lookOff=new THREE.Vector3(80,3,0);tmpV=new THREE.Vector3();
    /* floor: a dark slab you can faintly see the walls mirrored in, plus the grid */
    floor=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:0x05070c,transparent:true,opacity:.82,depthWrite:false}));floor.rotation.x=-Math.PI/2;floor.position.y=0.05;scene.add(floor);
    grid=null;
    /* wall ribbons: one shared buffer for trails, level walls and the rim; a mirrored twin under the floor */
    pos=new Float32Array(CAP*4*3);col=new Float32Array(CAP*4*3);idx=new Uint32Array(CAP*6);
    for(var q=0;q<CAP;q++){var b=q*4,o=q*6;idx[o]=b;idx[o+1]=b+1;idx[o+2]=b+2;idx[o+3]=b;idx[o+4]=b+2;idx[o+5]=b+3}
    var geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.setIndex(new THREE.BufferAttribute(idx,1));geo.setDrawRange(0,0);
    walls=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide,transparent:true,opacity:.62,depthWrite:false}));scene.add(walls);
    mirror=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide,transparent:true,opacity:.16,depthWrite:false}));mirror.scale.y=-1;scene.add(mirror);
    linePos=new Float32Array(CAP*2*3);lineCol=new Float32Array(CAP*2*3);
    var lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.BufferAttribute(linePos,3));lg.setAttribute('color',new THREE.BufferAttribute(lineCol,3));lg.setDrawRange(0,0);
    wallLine=new THREE.LineSegments(lg,new THREE.LineBasicMaterial({vertexColors:true}));scene.add(wallLine);
    /* goal ring + light column (survival) */
    ring=new THREE.Mesh(new THREE.TorusGeometry(1,.06,10,64),new THREE.MeshBasicMaterial({color:0xffd166}));ring.rotation.x=Math.PI/2;ring.visible=false;scene.add(ring);
    column=new THREE.Mesh(new THREE.CylinderGeometry(1,1,90,32,1,true),new THREE.MeshBasicMaterial({color:0xffd166,transparent:true,opacity:.035,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));column.visible=false;scene.add(column);
    /* crash sparks */
    pPos=new Float32Array(600*3);pCol=new Float32Array(600*3);var pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pPos,3));pg.setAttribute('color',new THREE.BufferAttribute(pCol,3));pg.setDrawRange(0,0);
    points=new THREE.Points(pg,new THREE.PointsMaterial({size:5,vertexColors:true,transparent:true,opacity:.9,sizeAttenuation:true}));scene.add(points);
    /* post: bloom is what makes the ribbons glow */
    composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));
    var bloom=new UnrealBloomPass(new THREE.Vector2(800,600),.85,.45,.18);composer.addPass(bloom);composer.addPass(new OutputPass());
    resize();
    if(window.ResizeObserver){ro=new ResizeObserver(resize);ro.observe(host)}else window.addEventListener('resize',resize);
    ready=true;apply();
  }
  function resize(){if(!renderer)return;var w=host.clientWidth||wrap.clientWidth||900,h=host.clientHeight||wrap.clientHeight||640;renderer.setSize(w,h,false);composer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()}
  function apply(){var on=ready&&view!=='flat';host.hidden=!on;root.classList.toggle('cyc-has3d',on);try{localStorage.setItem('tr-cycles-view',view)}catch(e){}}
  function cycleView(){var order=ready?['chase','overview','flat']:['flat'];view=order[(order.indexOf(view)+1)%order.length];apply();return view}
  function hex(c){return new THREE.Color(c)}
  function loadModel(){
    if(modelTried)return;modelTried=true;
    fetch(MODEL.url,{method:'HEAD'}).then(function(r){if(!r.ok)throw new Error('no model file');
      return Promise.all([import(U+'examples/jsm/loaders/GLTFLoader.js'+E),import(U+'examples/jsm/loaders/DRACOLoader.js'+E)])}).then(function(m){
      var loader=new m[0].GLTFLoader(),draco=new m[1].DRACOLoader();draco.setDecoderPath(U+'examples/jsm/libs/draco/gltf/');loader.setDRACOLoader(draco);
      loader.load(MODEL.url,function(gltf){
        var sc=gltf.scene,box=new THREE.Box3().setFromObject(sc),size=new THREE.Vector3();box.getSize(size);var k=MODEL.size/Math.max(size.x,size.y,size.z);
        var pivot=new THREE.Group();sc.scale.setScalar(k);var c=new THREE.Vector3();box.getCenter(c);sc.position.set(-c.x*k,-box.min.y*k+MODEL.lift,-c.z*k);pivot.add(sc);
        pivot.rotation.y={'-z':-Math.PI/2,'+z':Math.PI/2,'+x':0,'-x':Math.PI}[MODEL.forward]||0;
        modelScene=pivot;
        cycleMeshes.forEach(function(old,i){scene.remove(old)});cycleMeshes=[];
      },undefined,function(e){if(window.console)console.warn('cycle model failed to load, using the built-in cycle:',e&&e.message)});
    }).catch(function(){});
  }
  function mkCycle(color){
    if(modelScene)return mkFromModel(color);
    return mkBuiltIn(color);
  }
  function mkFromModel(color){
    var g=new THREE.Group(),c=hex(color),m=modelScene.clone(true);
    m.traverse(function(o){if(o.isMesh&&o.material){o.material=o.material.clone();var glow=/^glow/i.test(o.material.name||'')||(o.material.emissiveIntensity>0&&o.material.emissive&&(o.material.emissive.r+o.material.emissive.g+o.material.emissive.b)>.5);if(glow){if('emissive' in o.material){o.material.emissive=c.clone();o.material.emissiveIntensity=2.2}o.material.color=c.clone()}}});
    g.add(m);
    var shield=new THREE.Mesh(new THREE.SphereGeometry(1,20,14),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.12,depthWrite:false,blending:THREE.AdditiveBlending}));shield.position.y=3;g.add(shield);g.userData.shield=shield;g.userData.tint=null;
    scene.add(g);return g;
  }
  function mkBuiltIn(color){
    var g=new THREE.Group(),c=hex(color),mat=new THREE.MeshBasicMaterial({color:c}),white=new THREE.MeshBasicMaterial({color:0xf4fffd});
    var dark=new THREE.MeshBasicMaterial({color:0x0b0f16});
    var hull=new THREE.Mesh(new THREE.CapsuleGeometry(1.7,9,6,14),dark);hull.rotation.z=Math.PI/2;hull.position.y=3.4;g.add(hull);
    var strip=new THREE.Mesh(new THREE.BoxGeometry(10.5,.35,.5),mat);strip.position.set(0,4.9,1.1);g.add(strip);var strip2=strip.clone();strip2.position.z=-1.1;g.add(strip2);
    var spine=new THREE.Mesh(new THREE.BoxGeometry(11.5,.3,.5),mat);spine.position.set(0,2.2,0);g.add(spine);
    var canopy=new THREE.Mesh(new THREE.CapsuleGeometry(1,2.6,4,10),white);canopy.rotation.z=Math.PI/2;canopy.position.set(1.2,5.3,0);g.add(canopy);
    var w1=new THREE.Mesh(new THREE.TorusGeometry(2.9,.55,8,28),mat);w1.position.set(5.6,2.9,0);g.add(w1);
    var w2=w1.clone();w2.position.set(-5.6,2.9,0);g.add(w2);
    var disc=new THREE.Mesh(new THREE.CylinderGeometry(2.4,2.4,.8,20),dark);disc.rotation.x=Math.PI/2;disc.position.copy(w1.position);g.add(disc);var disc2=disc.clone();disc2.position.copy(w2.position);g.add(disc2);
    var hub1=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,1.1,12),white);hub1.rotation.x=Math.PI/2;hub1.position.copy(w1.position);g.add(hub1);var hub2=hub1.clone();hub2.position.copy(w2.position);g.add(hub2);
    g.userData.tint=strip;
    var shield=new THREE.Mesh(new THREE.SphereGeometry(1,20,14),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.12,depthWrite:false,blending:THREE.AdditiveBlending}));shield.position.y=3;g.add(shield);g.userData.shield=shield;
    scene.add(g);return g;
  }
  function noteSprite(text,x,y,s){
    var cv=document.createElement('canvas'),px=48;cv.width=Math.max(64,Math.ceil(text.length*px*.62));cv.height=px*1.4;var cx=cv.getContext('2d');
    cx.font='600 '+px+'px ui-monospace,Menlo,monospace';cx.fillStyle='rgba(159,245,233,.95)';cx.textBaseline='middle';cx.fillText(text,0,cv.height/2);
    var tex=new THREE.CanvasTexture(cv);tex.minFilter=THREE.LinearFilter;var w=text.length*7.2*s,h=w*cv.height/cv.width;
    var m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:.3,depthWrite:false}));
    m.rotation.x=-Math.PI/2;m.position.set(x+w/2,.4,y);scene.add(m);return m;
  }
  function setLevel(level,AW,AH){
    notes.forEach(function(n){scene.remove(n);n.material.map.dispose();n.material.dispose();n.geometry.dispose()});notes=[];
    noteLevel=level;
    if(level){level.msg.forEach(function(m){notes.push(noteSprite(m[2],m[0],m[1],1))});ring.visible=column.visible=true;ring.position.set(level.goal[0],1.2,level.goal[1]);ring.scale.setScalar(level.goal[2]);column.position.set(level.goal[0],45,level.goal[1]);column.scale.set(level.goal[2],1,level.goal[2])}
    else{ring.visible=column.visible=false}
    floor.scale.set(AW*4,AH*4,1);floor.position.set(AW/2,0.05,AH/2);
    if(grid){scene.remove(grid);grid.geometry.dispose();grid.material.dispose()}
    var size=Math.max(AW,AH);grid=new THREE.GridHelper(size*3,Math.round(size*3/50),0x0f6b63,0x0b3d39);grid.material.transparent=true;grid.material.opacity=.55;grid.position.set(AW/2,0.1,AH/2);scene.add(grid);
  }
  function quad(n,x0,z0,x1,z1,h,r,g,b){
    var p=n*12;pos[p]=x0;pos[p+1]=0;pos[p+2]=z0;pos[p+3]=x1;pos[p+4]=0;pos[p+5]=z1;pos[p+6]=x1;pos[p+7]=h;pos[p+8]=z1;pos[p+9]=x0;pos[p+10]=h;pos[p+11]=z0;
    for(var k=0;k<4;k++){col[p+k*3]=r;col[p+k*3+1]=g;col[p+k*3+2]=b}
    var l=n*6;linePos[l]=x0;linePos[l+1]=h;linePos[l+2]=z0;linePos[l+3]=x1;linePos[l+4]=h;linePos[l+5]=z1;
    for(k=0;k<2;k++){lineCol[l+k*3]=Math.min(1,r*1.6+.2);lineCol[l+k*3+1]=Math.min(1,g*1.6+.2);lineCol[l+k*3+2]=Math.min(1,b*1.6+.2)}
  }
  var colorCache={};function rgb(c){var v=colorCache[c];if(!v){var t=hex(c);v=colorCache[c]=[t.r,t.g,t.b]}return v}
  function render(dt){
    if(!ready||view==='flat')return;
    var cycles=api.cycles(),statics=api.statics(),level=api.level(),sz=api.size(),AW=sz[0],AH=sz[1],booms=api.booms(),now=api.now();
    if(level!==noteLevel||floor.scale.x!==AW*4||floor.scale.y!==AH*4)setLevel(level,AW,AH);
    /* ribbons */
    var n=0,rim=rgb('#0d5e57');
    quad(n++,0,0,AW,0,WALL_H*1.4,rim[0],rim[1],rim[2]);quad(n++,AW,0,AW,AH,WALL_H*1.4,rim[0],rim[1],rim[2]);quad(n++,AW,AH,0,AH,WALL_H*1.4,rim[0],rim[1],rim[2]);quad(n++,0,AH,0,0,WALL_H*1.4,rim[0],rim[1],rim[2]);
    statics.forEach(function(s){if(n<CAP){var c=rgb(s[6]);quad(n++,s[0],s[1],s[2],s[3],WALL_H,c[0],c[1],c[2])}});
    cycles.forEach(function(c){var t=c.trail,cc=rgb(c.color),f=c.alive?1:.28;for(var i=1;i<t.length&&n<CAP;i++)quad(n++,t[i-1][0],t[i-1][1],t[i][0],t[i][1],WALL_H,cc[0]*f,cc[1]*f,cc[2]*f);if(n<CAP)quad(n++,t[t.length-1][0],t[t.length-1][1],c.x,c.y,WALL_H,cc[0]*f,cc[1]*f,cc[2]*f)});
    walls.geometry.setDrawRange(0,n*6);walls.geometry.attributes.position.needsUpdate=true;walls.geometry.attributes.color.needsUpdate=true;walls.geometry.computeBoundingSphere();
    wallLine.geometry.setDrawRange(0,n*2);wallLine.geometry.attributes.position.needsUpdate=true;wallLine.geometry.attributes.color.needsUpdate=true;wallLine.geometry.computeBoundingSphere();
    /* cycles */
    while(cycleMeshes.length<cycles.length)cycleMeshes.push(mkCycle(cycles[cycleMeshes.length].color));
    cycleMeshes.forEach(function(m,i){var c=cycles[i];if(!c){m.visible=false;return}m.visible=c.alive;m.position.set(c.x,0,c.y);m.rotation.y=Math.atan2(-DIRS[c.d][1],DIRS[c.d][0]);var r=api.radius(c);m.userData.shield.scale.setScalar(Math.max(2.5,r*1.3));m.userData.shield.material.opacity=c.touching?.3:.05;if(m.userData.tint)m.userData.tint.material.color.set(c.touching?'#ffffff':c.color)});
    /* goal pulse */
    if(level){var p=1+Math.sin(now*4)*.06;ring.scale.setScalar(level.goal[2]*p);column.material.opacity=.03+Math.sin(now*3)*.012}
    /* sparks */
    var k=0;booms.forEach(function(b){if(k<600){pPos[k*3]=b.x;pPos[k*3+1]=3+(1-b.t)*20;pPos[k*3+2]=b.y;var c=rgb(b.c);pCol[k*3]=c[0];pCol[k*3+1]=c[1];pCol[k*3+2]=c[2];k++}});
    points.geometry.setDrawRange(0,k);points.geometry.attributes.position.needsUpdate=true;points.geometry.attributes.color.needsUpdate=true;
    /* camera */
    var me=cycles[0],mode=api.mode(),chase=view==='chase'&&mode!==2&&me&&me.alive;
    if(chase){ /* smooth the OFFSET from the bike, not the world position, so the camera never trails at speed; turns still swing round */
      var d=DIRS[me.d];tmpV.set(-d[0]*58,24,-d[1]*58);camOff.lerp(tmpV,1-Math.exp(-dt*6));tmpV.set(d[0]*80,3,d[1]*80);lookOff.lerp(tmpV,1-Math.exp(-dt*8));
      camPos.set(me.x+camOff.x,camOff.y,me.y+camOff.z);camLook.set(me.x+lookOff.x,lookOff.y,me.y+lookOff.z)}
    else{var big=Math.max(AW,AH*1.3);tmpV.set(AW/2,big*.72,AH/2+big*.62);camPos.lerp(tmpV,1-Math.exp(-dt*2.5));tmpV.set(AW/2,0,AH/2);camLook.lerp(tmpV,1-Math.exp(-dt*2.5))}
    camera.position.copy(camPos);camera.lookAt(camLook);
    composer.render();
  }
  function snap(){camPos.set(-1e9,0,0)} /* next render jumps the camera instead of sweeping across the arena */
  return {render:render,model:function(){return !!modelScene},view:function(){return view},cycleView:cycleView,ready:function(){return ready&&view!=='flat'},chase:function(){return ready&&view==='chase'},reset:function(){if(camPos)camPos.set(0,900,0)},
    stop:function(){stopped=true;if(ro)ro.disconnect();window.removeEventListener('resize',resize);if(renderer){renderer.dispose();host.remove()}}};
};
