/* Light Cycles — an Armagetron-style arena, written for this desktop. Own code, no libraries.
   Continuous arena seen from above, glowing walls, three bots,
   the grind (hug a wall, go faster), rubber (a split second stuck to a wall before you die, time enough to turn),
   countdown, engine hum, and a 2-player mode on one keyboard (WASD vs arrows, top-down). */
window.initCycles=function(root){
  root.innerHTML='<div class="cyc"><canvas class="cyc-canvas" width="900" height="640" aria-label="Light Cycles arena"></canvas>'+
    '<canvas class="cyc-map" width="140" height="140" aria-hidden="true"></canvas>'+
    '<div class="cyc-hud"><span class="cyc-score"></span><span class="cyc-round"></span></div>'+
    '<div class="cyc-count" hidden></div>'+
    '<div class="cyc-ui"><div class="cyc-menu"><h2>LIGHT CYCLES</h2><p>Arrows or WASD to steer. Hug a wall to go faster. If you hit one you have a split second to turn away.</p><p class="cyc-small">M mutes · Inspired by Armagetron Advanced</p><div class="cyc-opts"><button class="cyc-btn" data-start="1">Solo vs 3 bots</button><button class="cyc-btn" data-start="2">2 players</button></div><p class="cyc-small">2 players: WASD vs arrows, top-down view.</p></div></div></div>';
  var canvas=root.querySelector('.cyc-canvas'),ctx=canvas.getContext('2d'),mapC=root.querySelector('.cyc-map'),mctx=mapC.getContext('2d');
  var ui=root.querySelector('.cyc-ui'),menu=root.querySelector('.cyc-menu'),hudS=root.querySelector('.cyc-score'),hudR=root.querySelector('.cyc-round'),countEl=root.querySelector('.cyc-count');
  var W=canvas.width,H=canvas.height,A=1000;               /* arena is A×A world units */
  var COLORS=['#00E0C6','#FF5F57','#FEBC2E','#8B7DFF'],NAMES=['You','Bot 1','Bot 2','Bot 3'];
  var DIRS=[[1,0],[0,1],[-1,0],[0,-1]];                      /* east, south, west, north */
  var BASE=150,MAXS=330,WALLH=16,RUBBER=.45,TURN_GAP=.09;
  var cycles=[],running=false,raf=null,last=0,round=0,score=[0,0,0,0],over=false,mode=1,view='top',muted=false,booms=[],countdown=0;
  var audio=null,hum=null,humGain=null;
  function sound(){if(muted)return;try{if(!audio)audio=new (window.AudioContext||window.webkitAudioContext)();if(!hum){hum=audio.createOscillator();hum.type='sawtooth';humGain=audio.createGain();humGain.gain.value=0;var f=audio.createBiquadFilter();f.type='lowpass';f.frequency.value=600;hum.connect(f);f.connect(humGain);humGain.connect(audio.destination);hum.start()}if(audio.state==='suspended')audio.resume()}catch(e){}}
  function humSet(on,speed){if(!humGain)return;humGain.gain.linearRampToValueAtTime(on&&!muted?.05:0,audio.currentTime+.08);if(hum)hum.frequency.linearRampToValueAtTime(70+speed*.35,audio.currentTime+.08)}
  function blip(freq,dur){if(!audio||muted)return;try{var o=audio.createOscillator(),g=audio.createGain();o.type='square';o.frequency.value=freq;g.gain.value=.06;o.connect(g);g.connect(audio.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+dur);o.stop(audio.currentTime+dur)}catch(e){}}

  function mk(i,x,y,d,human){return{i:i,x:x,y:y,d:d,alive:true,human:human,color:COLORS[i],name:NAMES[i],speed:BASE,rubber:RUBBER,lastTurn:-1,trail:[[x,y]],deathT:0}}
  function reset(){
    var m=A*.18;
    cycles=[mk(0,m,A/2,0,true),mk(1,A-m,A/2,2,mode===2),mk(2,A/2,m,1,false),mk(3,A/2,A-m,3,false)];
    if(mode===2){cycles[1].name='P2';NAMES[1]='P2'}else NAMES[1]='Bot 1';
    over=false;booms=[];
  }
  /* every wall on the grid: each cycle's trail segments (axis-aligned) plus the arena border */
  function segments(){var out=[];cycles.forEach(function(c){var t=c.trail;for(var i=1;i<t.length;i++)out.push([t[i-1][0],t[i-1][1],t[i][0],t[i][1],c]);out.push([t[t.length-1][0],t[t.length-1][1],c.x,c.y,c])});return out}
  function hit(x0,y0,x1,y1,c,segs){
    if(x1<0||y1<0||x1>A||y1>A)return true;
    for(var i=0;i<segs.length;i++){var s=segs[i];
      if(s[4]===c&&i===segs.length-1)continue;/* placeholder, replaced below */
    }
    return false;
  }
  /* distance along a direction until something is in the way (for bots and for collision) */
  function rayDist(x,y,d,self,maxD,segs){
    var dx=DIRS[d][0],dy=DIRS[d][1],best=maxD;
    if(dx>0)best=Math.min(best,A-x);if(dx<0)best=Math.min(best,x);if(dy>0)best=Math.min(best,A-y);if(dy<0)best=Math.min(best,y);
    for(var i=0;i<segs.length;i++){var s=segs[i];
      if(self&&s[4]===self&&i===self._headSeg)continue;
      var sx0=Math.min(s[0],s[2]),sx1=Math.max(s[0],s[2]),sy0=Math.min(s[1],s[3]),sy1=Math.max(s[1],s[3]);
      if(dx){ if(y<sy0-1||y>sy1+1)continue; if(sx0===sx1){var t=(sx0-x)*dx;if(t>0.001&&t<best)best=t}else if(y>=sy0-1&&y<=sy1+1&&sy0===sy1){var tt=dx>0?sx0-x:x-sx1;if(tt>0.001&&tt<best&&Math.abs(y-sy0)<=1.5)best=tt} }
      else{ if(x<sx0-1||x>sx1+1)continue; if(sy0===sy1){var t2=(sy0-y)*dy;if(t2>0.001&&t2<best)best=t2}else if(x>=sx0-1&&x<=sx1+1&&sx0===sx1){var t3=dy>0?sy0-y:y-sy1;if(t3>0.001&&t3<best&&Math.abs(x-sx0)<=1.5)best=t3} }
    }
    return best;
  }
  function think(c,segs,dt){
    var f=rayDist(c.x,c.y,c.d,c,600,segs),l=(c.d+3)%4,r=(c.d+1)%4,fl=rayDist(c.x,c.y,l,c,600,segs),fr=rayDist(c.x,c.y,r,c,600,segs);
    var need=c.speed*.55;
    if(f<need){ if(fl<12&&fr<12)return; turn(c,fl>fr?l:(fr>fl?r:(Math.random()<.5?l:r))); return }
    var me=cycles[0];
    if(Math.random()<dt*.9&&me.alive&&me!==c){var want=Math.abs(me.x-c.x)>Math.abs(me.y-c.y)?(me.x>c.x?0:2):(me.y>c.y?1:3);if(want===l&&fl>need*1.6)turn(c,l);else if(want===r&&fr>need*1.6)turn(c,r)}
    else if(Math.random()<dt*.35){if(fl>need*2&&fl>=fr)turn(c,l);else if(fr>need*2)turn(c,r)}
  }
  function turn(c,nd){if(!c.alive||nd===c.d||nd===(c.d+2)%4)return;if(performance.now()-c.lastTurn<TURN_GAP*1000)return;c.trail.push([c.x,c.y]);c.d=nd;c.lastTurn=performance.now();if(c.human)blip(c.speed*2+200,.05)}
  function step(dt){
    var segs=segments();
    cycles.forEach(function(c){c._headSeg=-1});
    /* mark each cycle's own head segment so it does not collide with the wall it is drawing */
    var idx=0;cycles.forEach(function(c){idx+=c.trail.length;c._headSeg=idx-1});
    cycles.forEach(function(c){
      if(!c.alive)return;
      if(!c.human)think(c,segs,dt);
      var side1=(c.d+1)%4,side2=(c.d+3)%4;
      var near=Math.min(rayDist(c.x,c.y,side1,c,40,segs),rayDist(c.x,c.y,side2,c,40,segs))<14;
      c.speed=Math.min(MAXS,Math.max(BASE,c.speed+(near?95:-70)*dt));
      var dist=c.speed*dt,room=rayDist(c.x,c.y,c.d,c,dist+2,segs);
      if(room<=dist){ /* wall ahead: rubber first, then death */
        c.x+=DIRS[c.d][0]*Math.max(0,room-1.5);c.y+=DIRS[c.d][1]*Math.max(0,room-1.5);
        c.rubber-=dt;
        if(c.rubber<=0){c.alive=false;c.deathT=1;boom(c);if(c.human)blip(90,.4)}
      }else{c.x+=DIRS[c.d][0]*dist;c.y+=DIRS[c.d][1]*dist;c.rubber=Math.min(RUBBER,c.rubber+dt*.3)}
    });
    var alive=cycles.filter(function(c){return c.alive});
    if(!over&&(alive.length<=1||(mode===1&&!cycles[0].alive&&alive.length<=2&&!alive.some(function(c){return c.human})))){
      if(alive.length<=1){over=true;var w=alive[0];if(w)score[w.i]++;round++;humSet(false,0);setTimeout(function(){endRound(w)},900)}
    }
    if(mode===1&&!cycles[0].alive&&!over){over=true;round++;humSet(false,0);setTimeout(function(){endRound(null,true)},900)}
  }
  function boom(c){for(var i=0;i<40;i++)booms.push({x:c.x,y:c.y,vx:(Math.random()-.5)*160,vy:(Math.random()-.5)*160,t:1,c:c.color})}

  /* ---------- rendering ---------- */
  var cam={x:0,y:0,ang:0};
  function project(px,py,pz){ /* camera at (cam.x,cam.y,camH) looking along cam.ang, tilted down */
    var camH=26,f=520,tilt=.36;
    var dx=px-cam.x,dy=py-cam.y;
    var cs=Math.cos(cam.ang),sn=Math.sin(cam.ang);
    var zf=dx*cs+dy*sn, xr=-dx*sn+dy*cs, yu=pz-camH;
    var z=zf*Math.cos(tilt)-yu*Math.sin(tilt), y=zf*Math.sin(tilt)+yu*Math.cos(tilt);
    return {x:W/2+xr*f/z,y:H*.52-y*f/z,z:z};
  }
  function clipZ(a,b){var n=3;if(a.z>=n&&b.z>=n)return [a,b];if(a.z<n&&b.z<n)return null;var t=(n-a.z)/(b.z-a.z);var m={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:n,wx:a.wx+(b.wx-a.wx)*t,wy:a.wy+(b.wy-a.wy)*t};return a.z<n?[m,b]:[a,m]}
  function P(x,y,z){var o=project(x,y,z);o.wx=x;o.wy=y;return o}
  function wallQuad(x0,y0,x1,y1,color,alpha){
    var a=P(x0,y0,0),b=P(x1,y1,0);var cl=clipZ(a,b);if(!cl)return;
    var a0=P(cl[0].wx,cl[0].wy,0),b0=P(cl[1].wx,cl[1].wy,0),a1=P(cl[0].wx,cl[0].wy,WALLH),b1=P(cl[1].wx,cl[1].wy,WALLH);
    ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(a0.x,a0.y);ctx.lineTo(b0.x,b0.y);ctx.lineTo(b1.x,b1.y);ctx.lineTo(a1.x,a1.y);ctx.closePath();ctx.fill();
    ctx.globalAlpha=Math.min(1,alpha+.3);ctx.strokeStyle='#fff';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(a1.x,a1.y);ctx.lineTo(b1.x,b1.y);ctx.stroke();ctx.globalAlpha=1;
  }
  function drawChase(){
    var me=cycles[0];
    var tx=me.x-DIRS[me.d][0]*70,ty=me.y-DIRS[me.d][1]*70,ta=Math.atan2(DIRS[me.d][1],DIRS[me.d][0]);
    var da=ta-cam.ang;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;
    cam.ang+=da*.18;cam.x+=(tx-cam.x)*.35;cam.y+=(ty-cam.y)*.35;
    var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#05070a');g.addColorStop(.5,'#0a1420');g.addColorStop(.52,'#07090c');g.addColorStop(1,'#04070a');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    /* floor grid near the camera */
    ctx.strokeStyle='rgba(0,224,198,.16)';ctx.lineWidth=1;var G=50,r=900;
    var x0=Math.max(0,Math.floor((cam.x-r)/G)*G),x1=Math.min(A,cam.x+r),y0=Math.max(0,Math.floor((cam.y-r)/G)*G),y1=Math.min(A,cam.y+r);
    ctx.beginPath();
    for(var x=x0;x<=x1;x+=G){var a=P(x,y0,0),b=P(x,y1,0),c2=clipZ(a,b);if(c2){var p=P(c2[0].wx,c2[0].wy,0),q=P(c2[1].wx,c2[1].wy,0);ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y)}}
    for(var y=y0;y<=y1;y+=G){var a2=P(x0,y,0),b2=P(x1,y,0),c3=clipZ(a2,b2);if(c3){var p2=P(c3[0].wx,c3[0].wy,0),q2=P(c3[1].wx,c3[1].wy,0);ctx.moveTo(p2.x,p2.y);ctx.lineTo(q2.x,q2.y)}}
    ctx.stroke();
    /* walls, far to near */
    var quads=[];
    [[0,0,A,0],[A,0,A,A],[A,A,0,A],[0,A,0,0]].forEach(function(s){quads.push({s:s,color:'rgba(0,224,198,.28)',d:distTo(s)})});
    cycles.forEach(function(c){var t=c.trail;for(var i=1;i<t.length;i++)quads.push({s:[t[i-1][0],t[i-1][1],t[i][0],t[i][1]],color:c.color,d:distTo([t[i-1][0],t[i-1][1],t[i][0],t[i][1]]),dead:!c.alive});quads.push({s:[t[t.length-1][0],t[t.length-1][1],c.x,c.y],color:c.color,d:0,dead:!c.alive})});
    quads.sort(function(a,b){return b.d-a.d});
    quads.forEach(function(q){wallQuad(q.s[0],q.s[1],q.s[2],q.s[3],q.color,q.dead?.25:.75)});
    /* cycles as bright sprites */
    cycles.forEach(function(c){if(!c.alive)return;var p=P(c.x,c.y,6);if(p.z<3)return;var sz=Math.max(3,900/p.z);ctx.shadowColor=c.color;ctx.shadowBlur=18;ctx.fillStyle='#fff';ctx.fillRect(p.x-sz/2,p.y-sz/2,sz,sz*.6);ctx.shadowBlur=0});
    drawBooms(function(x,y){return P(x,y,4)});
    /* speed lines when grinding */
    if(me.speed>BASE*1.35){ctx.strokeStyle='rgba(255,255,255,'+Math.min(.5,(me.speed-BASE)/MAXS)+')';ctx.lineWidth=1;for(var k=0;k<8;k++){var yy=H*.2+Math.random()*H*.6;ctx.beginPath();ctx.moveTo(Math.random()<.5?0:W,yy);ctx.lineTo(Math.random()<.5?W*.3:W*.7,H*.52);ctx.stroke()}}
  }
  function distTo(s){var mx=(s[0]+s[2])/2,my=(s[1]+s[3])/2;return Math.hypot(mx-cam.x,my-cam.y)}
  function drawTop(){
    ctx.fillStyle='#07090c';ctx.fillRect(0,0,W,H);
    var s=Math.min(W,H)/A*.96,ox=(W-A*s)/2,oy=(H-A*s)/2;
    ctx.strokeStyle='rgba(0,224,198,.1)';ctx.lineWidth=1;ctx.beginPath();for(var g=0;g<=A;g+=50){ctx.moveTo(ox+g*s,oy);ctx.lineTo(ox+g*s,oy+A*s);ctx.moveTo(ox,oy+g*s);ctx.lineTo(ox+A*s,oy+g*s)}ctx.stroke();
    ctx.strokeStyle='rgba(0,224,198,.45)';ctx.lineWidth=2;ctx.strokeRect(ox,oy,A*s,A*s);
    cycles.forEach(function(c){var t=c.trail;ctx.shadowColor=c.color;ctx.shadowBlur=c.alive?10:0;ctx.strokeStyle=c.color;ctx.globalAlpha=c.alive?1:.35;ctx.lineWidth=3;ctx.lineJoin='miter';ctx.beginPath();ctx.moveTo(ox+t[0][0]*s,oy+t[0][1]*s);for(var i=1;i<t.length;i++)ctx.lineTo(ox+t[i][0]*s,oy+t[i][1]*s);ctx.lineTo(ox+c.x*s,oy+c.y*s);ctx.stroke();ctx.shadowBlur=0;ctx.globalAlpha=1;if(c.alive){ctx.fillStyle='#fff';ctx.fillRect(ox+c.x*s-3,oy+c.y*s-3,6,6)}});
    drawBooms(function(x,y){return{x:ox+x*s,y:oy+y*s,z:10}});
  }
  function drawBooms(map){booms=booms.filter(function(b){return b.t>0});booms.forEach(function(b){b.x+=b.vx*.016;b.y+=b.vy*.016;b.t-=.025;var p=map(b.x,b.y);if(p.z<3)return;ctx.globalAlpha=Math.max(0,b.t);ctx.fillStyle=b.c;ctx.fillRect(p.x,p.y,3,3)});ctx.globalAlpha=1}
  function drawMap(){
    var s=mapC.width/A;mctx.fillStyle='rgba(7,9,12,.85)';mctx.fillRect(0,0,mapC.width,mapC.height);mctx.strokeStyle='rgba(0,224,198,.5)';mctx.lineWidth=1;mctx.strokeRect(.5,.5,mapC.width-1,mapC.height-1);
    cycles.forEach(function(c){var t=c.trail;mctx.strokeStyle=c.color;mctx.globalAlpha=c.alive?1:.3;mctx.lineWidth=1.5;mctx.beginPath();mctx.moveTo(t[0][0]*s,t[0][1]*s);for(var i=1;i<t.length;i++)mctx.lineTo(t[i][0]*s,t[i][1]*s);mctx.lineTo(c.x*s,c.y*s);mctx.stroke();mctx.globalAlpha=1;if(c.alive){mctx.fillStyle='#fff';mctx.fillRect(c.x*s-1.5,c.y*s-1.5,3,3)}});
  }
  function draw(){
    drawTop();
    var me=cycles[0];
    hudS.textContent=cycles.map(function(c){return c.name+' '+score[c.i]}).join('   ');
    hudR.textContent=(me.alive?Math.round(me.speed)+' km/h'+(me.speed>BASE*1.3?'  GRIND':'')+(me.rubber<RUBBER*.8?'  RUBBER':''):'crashed')+'   ·   round '+(round+1);
  }
  function frame(ts){
    if(!running)return;
    if(!last)last=ts;var dt=Math.min(.05,(ts-last)/1000);last=ts;
    if(countdown>0){countdown-=dt;countEl.hidden=false;countEl.textContent=countdown>0?Math.ceil(countdown):'GO';if(countdown<=0){countEl.textContent='GO';setTimeout(function(){countEl.hidden=true},400);humSet(true,BASE)}draw();raf=requestAnimationFrame(frame);return}
    step(dt);draw();var me=cycles[0];humSet(me.alive,me.speed);
    raf=requestAnimationFrame(frame);
  }
  function endRound(winner,youDied){
    running=false;ui.hidden=false;humSet(false,0);
    menu.innerHTML='<h2>'+(winner?(winner.human?winner.name+(winner.i===0?' win':' wins')+' the round':winner.name+' takes it'):(youDied?'You crashed':'Everyone crashed'))+'</h2><p>'+cycles.map(function(c){return c.name+': '+score[c.i]}).join(' · ')+'</p><div class="cyc-opts"><button class="cyc-btn" data-start="'+mode+'">Next round</button><button class="cyc-btn" data-start="'+(mode===1?2:1)+'">'+(mode===1?'2 players':'Solo vs bots')+'</button></div>';
    menu.querySelectorAll('[data-start]').forEach(function(b){b.addEventListener('click',function(){start(+b.dataset.start)})});
  }
  function start(m){if(m!==mode){score=[0,0,0,0];round=0}mode=m;reset();ui.hidden=true;running=true;last=0;countdown=3;sound();blip(440,.1);canvas.focus();cancelAnimationFrame(raf);cam.x=cycles[0].x-80;cam.y=cycles[0].y;cam.ang=0;raf=requestAnimationFrame(frame)}
  function human(i,key){var c=cycles[i];if(!c||!c.alive||!running||countdown>0)return;
    if(key==='left')turn(c,(c.d+3)%4);else if(key==='right')turn(c,(c.d+1)%4);else if(key==='up')turn(c,3);else if(key==='down')turn(c,1);else if(key==='west')turn(c,2);else if(key==='east')turn(c,0)}
  function kd(e){
    var k=e.key;
    if(k==='m'||k==='M'){muted=!muted;humSet(running&&!muted,cycles[0]?cycles[0].speed:BASE);return}
    if(mode===1){var m1={ArrowLeft:'west',ArrowRight:'east',ArrowUp:'up',ArrowDown:'down',a:'west',d:'east',w:'up',s:'down',A:'west',D:'east',W:'up',S:'down'};if(m1[k]){human(0,m1[k]);e.preventDefault()}return}
    var p1={a:'west',d:'east',w:'up',s:'down',A:'west',D:'east',W:'up',S:'down'},p2={ArrowLeft:'west',ArrowRight:'east',ArrowUp:'up',ArrowDown:'down'};
    if(p1[k]){human(0,p1[k]);e.preventDefault()}if(p2[k]){human(1,p2[k]);e.preventDefault()}
  }
  document.addEventListener('keydown',kd);
  var tx=0;canvas.addEventListener('touchstart',function(e){tx=e.touches[0].clientX},{passive:true});
  var ty=0;canvas.addEventListener('touchstart',function(e){ty=e.touches[0].clientY},{passive:true});
  canvas.addEventListener('touchend',function(e){var dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;if(Math.abs(dx)<10&&Math.abs(dy)<10)return;human(0,Math.abs(dx)>Math.abs(dy)?(dx>0?'east':'west'):(dy>0?'down':'up'))});
  root.querySelectorAll('[data-start]').forEach(function(b){b.addEventListener('click',function(){start(+b.dataset.start)})});
  reset();cam.x=cycles[0].x-80;cam.y=cycles[0].y;draw();
  return {stop:function(){running=false;cancelAnimationFrame(raf);document.removeEventListener('keydown',kd);humSet(false,0);try{if(audio)audio.close()}catch(e){}}};
};
