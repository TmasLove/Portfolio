/* Light Cycles — an Armagetron-style arena, written for this desktop. Own code, no libraries.
   Movement model (numbers sampled from a live light-cycle arena, 2026-09-07): speed closes on cruise at ~45%/s of
   the gap and bleeds ~10%/s above it, every turn costs 5% speed and has a 30 ms delay, a brake with a recharging meter, boost that grows the
   closer you run parallel to a wall, a shield that is also your size — it drains while you touch a wall,
   shrinking you so you can dig through gaps, and refills when clear — trails of finite length so the grid
   keeps opening up. Solo vs three bots, 2 players on one keyboard, or Survival: a ladder of short levels
   with fixed walls, a goal ring and a clock (dig, turn, grind for boost, tunnel, double-bind flip, mazes). */
window.initCycles=function(root){
  root.innerHTML='<div class="cyc"><canvas class="cyc-canvas" width="900" height="640" aria-label="Light Cycles arena"></canvas>'+
    '<div class="cyc-hud"><span class="cyc-score"></span><span class="cyc-round"></span></div>'+
    '<div class="cyc-meters"><span class="cyc-meter"><i class="cyc-shield"></i></span><span class="cyc-meter"><i class="cyc-brake"></i></span></div>'+
    '<div class="cyc-count" hidden></div>'+
    '<div class="cyc-ui"><div class="cyc-menu"><h2>LIGHT CYCLES</h2><p>Steer with the arrow keys (or WASD). Space brakes. Run close and parallel to a wall to boost. Touching a wall drains your shield and shrinks you — get off it before it empties.</p><p class="cyc-small">M mutes · Trails fade behind you, so the grid keeps opening up · Inspired by Armagetron Advanced</p><div class="cyc-opts"><button class="cyc-btn" data-start="1">Solo vs 3 bots</button><button class="cyc-btn" data-start="2">2 players</button><button class="cyc-btn" data-levels="1">Survival</button><button class="cyc-btn" data-keys="1">Controls</button></div><p class="cyc-small">2 players: WASD + Q/E + Space vs arrows + , . + Shift. Bind two keys to one turn and press both for a double bind (180°).</p></div></div></div>';
  var canvas=root.querySelector('.cyc-canvas'),ctx=canvas.getContext('2d');
  var ui=root.querySelector('.cyc-ui'),menu=root.querySelector('.cyc-menu'),hudS=root.querySelector('.cyc-score'),hudR=root.querySelector('.cyc-round'),countEl=root.querySelector('.cyc-count'),shieldEl=root.querySelector('.cyc-shield'),brakeEl=root.querySelector('.cyc-brake');
  var W=canvas.width,H=canvas.height,AW=1000,AH=1000;
  var CFG={base:230,min:130,max:520,recover:.45,turnFactor:.95,turnDelay:.03,brake:80,brakeMax:1,brakeDrain:1,brakeRegen:.5,wallLen:1750,shieldMax:2.5,shieldDrain:1.2,shieldRegen:5,boostAccel:160,boostOffset:5,boostNear:24,rimMul:.5,enemyMul:1.1,staticMul:1.2,radMin:1.2,radMax:6};
  var COLORS=['#00E0C6','#FF5F57','#FEBC2E','#8B7DFF'],NAMES=['You','Bot 1','Bot 2','Bot 3'];
  var DIRS=[[1,0],[0,1],[-1,0],[0,-1]];
  /* Survival levels. Own layouts; units are arena units, origin top-left. wall: [x0,y0,x1,y1,color].
     goal: a ring to reach. limit: seconds allowed (0 = none). msg: notes painted on the floor. */
  var LEVELS=[
    {id:'dig',name:'Digging',tier:'training',w:1000,h:600,spawn:[120,300,0],goal:[880,300,40],limit:0,
      walls:[[560,60,560,296,'#06b6d4'],[560,304,560,540,'#06b6d4']],
      msg:[[300,200,'Crash into the wall: your shield shrinks you'],[300,400,'Small enough, and you squeeze through the gap']]},
    {id:'turn',name:'Turning',tier:'training',w:1000,h:600,spawn:[100,300,0],goal:[900,300,45],limit:12,
      walls:[[500,100,500,500,'#f97316']],
      msg:[[250,180,'Arrows steer by direction: up goes up'],[250,440,'Go around, then back to the ring']]},
    {id:'seq',name:'Turn sequences',tier:'training',w:1000,h:600,spawn:[80,520,0],goal:[940,520,40],limit:12,
      walls:[[300,0,300,420,'#06b6d4'],[550,180,550,600,'#06b6d4'],[800,0,800,420,'#06b6d4']],
      msg:[[120,60,'Slalom: under, over, under']]},
    {id:'boost',name:'Grinding for boost',tier:'training',w:1400,h:300,spawn:[80,150,0],goal:[1330,150,40],limit:5.2,
      walls:[[60,120,1200,120,'#ef4444']],
      msg:[[120,200,'Drive close to the red wall to boost'],[600,200,'The closer you are, the faster you go']]},
    {id:'tunnel',name:'Tunnel boosting',tier:'training',w:1400,h:300,spawn:[80,150,0],goal:[1330,150,40],limit:4.5,
      walls:[[60,130,1200,130,'#22c55e'],[60,170,1200,170,'#22c55e']],
      msg:[[120,60,'Grind inside the tunnel, not the rim'],[120,240,'Both walls push you at once']]},
    {id:'bind',name:'Double bind',tier:'training',w:1000,h:600,spawn:[500,130,1],goal:[500,40,30],limit:6,
      walls:[[200,100,200,400,'#d946ef'],[200,400,800,400,'#d946ef'],[800,100,800,400,'#d946ef']],
      msg:[[300,250,'You cannot reverse — but two turns can'],[300,300,'Press LEFT + UP (or RIGHT + UP) together to flip 180°']]},
    {id:'novice1',name:'Novice 1',tier:'novice',w:1000,h:700,spawn:[60,60,0],goal:[940,640,40],limit:20,
      walls:[[300,0,300,500,'#06b6d4'],[600,200,600,700,'#06b6d4'],[850,0,850,450,'#06b6d4']],msg:[]},
    {id:'novice2',name:'Corridors',tier:'novice',w:1200,h:700,spawn:[60,75,0],goal:[1140,650,35],limit:16,
      walls:[[0,150,1000,150,'#f97316'],[200,300,1200,300,'#f97316'],[0,450,1000,450,'#f97316'],[200,600,1200,600,'#f97316']],msg:[]},
    {id:'easy1',name:'Pinch',tier:'easy',w:1000,h:600,spawn:[80,300,0],goal:[920,300,36],limit:9,
      walls:[[350,0,350,296,'#22c55e'],[350,304,350,600,'#22c55e'],[650,0,650,296,'#ef4444'],[650,304,650,600,'#ef4444']],
      msg:[[420,120,'Two digs in a row — keep some shield for the second']]},
    {id:'easy2',name:'Spiral',tier:'easy',w:1000,h:800,spawn:[500,400,0],goal:[60,60,34],limit:18,
      walls:[[400,300,650,300,'#8B7DFF'],[650,300,650,550,'#8B7DFF'],[650,550,300,550,'#8B7DFF'],[300,550,300,200,'#8B7DFF'],[300,200,800,200,'#8B7DFF'],[800,200,800,700,'#8B7DFF'],[800,700,150,700,'#8B7DFF'],[150,700,150,120,'#8B7DFF']],
      msg:[[420,430,'Unwind it']]}
  ];
  var cycles=[],running=false,raf=null,last=0,round=0,score=[0,0,0,0],over=false,mode=1,muted=false,booms=[],countdown=0,now=0;
  var level=null,levelIx=0,statics=[],clock=0,BEST={};
  try{BEST=JSON.parse(localStorage.getItem('tr-cycles-best')||'{}')||{}}catch(e){}
  var audio=null,hum=null,humGain=null;
  function sound(){if(muted)return;try{if(!audio)audio=new (window.AudioContext||window.webkitAudioContext)();if(!hum){hum=audio.createOscillator();hum.type='sawtooth';humGain=audio.createGain();humGain.gain.value=0;var f=audio.createBiquadFilter();f.type='lowpass';f.frequency.value=600;hum.connect(f);f.connect(humGain);humGain.connect(audio.destination);hum.start()}if(audio.state==='suspended')audio.resume()}catch(e){}}
  function humSet(on,speed){if(!humGain)return;try{humGain.gain.linearRampToValueAtTime(on&&!muted?.05:0,audio.currentTime+.08);hum.frequency.linearRampToValueAtTime(60+speed*.4,audio.currentTime+.08)}catch(e){}}
  function blip(freq,dur){if(!audio||muted)return;try{var o=audio.createOscillator(),g=audio.createGain();o.type='square';o.frequency.value=freq;g.gain.value=.05;o.connect(g);g.connect(audio.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+dur);o.stop(audio.currentTime+dur)}catch(e){}}

  function mk(i,x,y,d,human){return{i:i,x:x,y:y,d:d,alive:true,human:human,color:COLORS[i],name:NAMES[i],speed:CFG.base,shield:CFG.shieldMax,brakeCharge:CFG.brakeMax,braking:false,lastTurn:-1,trail:[[x,y]],len:0,grinding:false,touching:false}}
  function radius(c){return CFG.radMin+(CFG.radMax-CFG.radMin)*c.shield/CFG.shieldMax}
  function reset(){
    over=false;booms=[];clock=0;
    if(mode===3){
      level=LEVELS[levelIx];AW=level.w;AH=level.h;
      statics=level.walls.map(function(w){return [w[0],w[1],w[2],w[3],'static',false,w[4]]});
      cycles=[mk(0,level.spawn[0],level.spawn[1],level.spawn[2],true)];
      return;
    }
    level=null;AW=AH=1000;statics=[];
    var m=AW*.18;
    cycles=[mk(0,m,AH/2,0,true),mk(1,AW-m,AH/2,2,mode===2),mk(2,AW/2,m,1,false),mk(3,AW/2,AH-m,3,false)];
    cycles[1].name=mode===2?'P2':'Bot 1';
  }
  /* walls: the level's fixed walls, every trail segment (axis-aligned) plus the head segment of each cycle */
  function segments(){var out=statics.slice();cycles.forEach(function(c){var t=c.trail;for(var i=1;i<t.length;i++)out.push([t[i-1][0],t[i-1][1],t[i][0],t[i][1],c,false]);out.push([t[t.length-1][0],t[t.length-1][1],c.x,c.y,c,true])});return out}
  /* distance along direction d from (x,y) to the first wall; returns {d, seg} — the rim counts as a wall.
     tol is how wide the cycle is: a bigger shield clips wall ends it would otherwise slip past (that is digging) */
  function ray(x,y,d,self,maxD,segs,tol){
    tol=tol||1.2;
    var dx=DIRS[d][0],dy=DIRS[d][1],best=maxD,hitSeg='rim';
    var rim=dx>0?AW-x:dx<0?x:dy>0?AH-y:y;if(rim<best){best=rim;hitSeg='rim'}
    for(var i=0;i<segs.length;i++){var s=segs[i];
      if(s[5]&&s[4]===self)continue;
      var sx0=Math.min(s[0],s[2]),sx1=Math.max(s[0],s[2]),sy0=Math.min(s[1],s[3]),sy1=Math.max(s[1],s[3]),t=-1;
      if(dx){ if(y<sy0-tol||y>sy1+tol)continue; if(sx0===sx1)t=(sx0-x)*dx; else if(Math.abs(y-sy0)<=tol)t=dx>0?sx0-x:x-sx1; }
      else{ if(x<sx0-tol||x>sx1+tol)continue; if(sy0===sy1)t=(sy0-y)*dy; else if(Math.abs(x-sx0)<=tol)t=dy>0?sy0-y:y-sy1; }
      if(t>0.01&&t<best){best=t;hitSeg=s}
    }
    return {d:best,seg:hitSeg};
  }
  function think(c,segs,dt){
    var f=ray(c.x,c.y,c.d,c,700,segs).d,l=(c.d+3)%4,r=(c.d+1)%4,fl=ray(c.x,c.y,l,c,700,segs).d,fr=ray(c.x,c.y,r,c,700,segs).d;
    var need=c.speed*.5;
    if(f<need){ if(fl<12&&fr<12){c.braking=true;return} turn(c,fl>fr?'left':(fr>fl?'right':(Math.random()<.5?'left':'right'))); return }
    c.braking=false;
    var me=cycles[0];
    if(Math.random()<dt*.9&&me.alive&&me!==c){var want=Math.abs(me.x-c.x)>Math.abs(me.y-c.y)?(me.x>c.x?0:2):(me.y>c.y?1:3);if(want===l&&fl>need*1.6)turn(c,'left');else if(want===r&&fr>need*1.6)turn(c,'right')}
    else if(Math.random()<dt*.3){if(fl>need*2&&fl>=fr)turn(c,'left');else if(fr>need*2)turn(c,'right')}
  }
  function turn(c,side){ /* side: 'left' / 'right', or an absolute direction 0-3 (arrow keys) */
    if(!c.alive)return;
    var nd=side==='left'?(c.d+3)%4:side==='right'?(c.d+1)%4:side;
    if(nd===c.d||nd===(c.d+2)%4)return;
    if(now-c.lastTurn<CFG.turnDelay){c.pending=side;return}
    c.pending=null;
    c.trail.push([c.x,c.y]);c.d=nd;c.speed*=CFG.turnFactor;c.lastTurn=now;
    if(c.human)blip(c.speed*1.6+220,.05);
  }
  function trimTrail(c){ /* walls have a finite length: the tail retracts */
    var t=c.trail,len=0;for(var i=1;i<t.length;i++)len+=Math.abs(t[i][0]-t[i-1][0])+Math.abs(t[i][1]-t[i-1][1]);len+=Math.abs(c.x-t[t.length-1][0])+Math.abs(c.y-t[t.length-1][1]);
    var extra=len-CFG.wallLen;
    while(extra>0&&t.length>1){var a=t[0],b=t[1],seg=Math.abs(b[0]-a[0])+Math.abs(b[1]-a[1]);if(seg<=extra){t.shift();extra-=seg}else{var k=extra/seg;t[0]=[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k];extra=0}}
    if(extra>0&&t.length===1){var hd=[c.x,c.y],a2=t[0],seg2=Math.abs(hd[0]-a2[0])+Math.abs(hd[1]-a2[1]);if(seg2>0){var k2=Math.min(1,extra/seg2);t[0]=[a2[0]+(hd[0]-a2[0])*k2,a2[1]+(hd[1]-a2[1])*k2]}}
  }
  function step(dt){
    now+=dt;if(!over)clock+=dt;var segs=segments();
    cycles.forEach(function(c){
      if(!c.alive)return;
      if(!c.human)think(c,segs,dt);
      if(c.pending&&now-c.lastTurn>=CFG.turnDelay){var pd=c.pending;c.pending=null;turn(c,pd)}
      /* brake */
      var braking=c.braking&&c.brakeCharge>0;
      if(braking){c.speed-=CFG.brake*dt;c.brakeCharge=Math.max(0,c.brakeCharge-CFG.brakeDrain*dt)}else if(!c.braking)c.brakeCharge=Math.min(CFG.brakeMax,c.brakeCharge+CFG.brakeRegen*dt);
      /* boost from a parallel wall on either side: stronger the closer, weaker on the rim, strongest on a level wall */
      var boost=0;[(c.d+1)%4,(c.d+3)%4].forEach(function(sd){var rr=ray(c.x,c.y,sd,c,CFG.boostNear,segs);if(rr.d<CFG.boostNear){var mul=rr.seg==='rim'?CFG.rimMul:rr.seg[4]==='static'?CFG.staticMul:(rr.seg[4]===c?1:CFG.enemyMul);boost+=CFG.boostAccel*mul*(1/(rr.d+CFG.boostOffset)-1/(CFG.boostOffset+CFG.boostNear))*CFG.boostOffset*4}});
      c.grinding=boost>0;
      c.speed+=boost*dt;
      var l=c.speed-CFG.base;
      if(l>0)c.speed-=.1*l*dt;else if(l<0&&!braking)c.speed+=-l*CFG.recover*dt; /* measured on a live arena: speed closes ~45%/s of the gap to cruise, and bleeds ~10%/s above it */
      c.speed=Math.max(CFG.min,Math.min(CFG.max,c.speed));
      /* move; a wall ahead drains the shield (and shrinks you) instead of killing outright */
      var rad=radius(c),dist=c.speed*dt,rr2=ray(c.x,c.y,c.d,c,dist+rad+1.5,segs,rad);
      if(rr2.d<=dist+rad){
        c.x+=DIRS[c.d][0]*Math.max(0,rr2.d-rad);c.y+=DIRS[c.d][1]*Math.max(0,rr2.d-rad);
        c.touching=true;c.shield-=CFG.shieldDrain*dt;
        if(c.shield<=0){c.alive=false;boom(c);if(c.human)blip(90,.4)}
      }else{c.x+=DIRS[c.d][0]*dist;c.y+=DIRS[c.d][1]*dist;c.touching=false;c.shield=Math.min(CFG.shieldMax,c.shield+CFG.shieldMax/CFG.shieldRegen*dt)}
      trimTrail(c);
    });
    if(mode===3){
      if(over)return;var me=cycles[0],g=level.goal;
      if(me.alive&&Math.hypot(me.x-g[0],me.y-g[1])<=g[2]){over=true;var t=Math.round(clock*100)/100;if(!BEST[level.id]||t<BEST[level.id])BEST[level.id]=t;try{localStorage.setItem('tr-cycles-best',JSON.stringify(BEST))}catch(e){}humSet(false,0);blip(880,.25);setTimeout(function(){endLevel(true,t)},500)}
      else if(!me.alive){over=true;humSet(false,0);setTimeout(function(){endLevel(false,'crashed')},900)}
      else if(level.limit&&clock>=level.limit){over=true;me.alive=false;humSet(false,0);setTimeout(function(){endLevel(false,'out of time')},400)}
      return;
    }
    var alive=cycles.filter(function(c){return c.alive});
    if(!over&&alive.length<=1){over=true;var w=alive[0];if(w)score[w.i]++;round++;humSet(false,0);setTimeout(function(){endRound(w)},900)}
    else if(!over&&mode===1&&!cycles[0].alive){over=true;round++;humSet(false,0);setTimeout(function(){endRound(null,true)},900)}
  }
  function boom(c){for(var i=0;i<40;i++)booms.push({x:c.x,y:c.y,vx:(Math.random()-.5)*160,vy:(Math.random()-.5)*160,t:1,c:c.color})}

  function draw(){
    ctx.fillStyle='#07090c';ctx.fillRect(0,0,W,H);
    var s=Math.min(W/AW,H/AH)*.96,ox=(W-AW*s)/2,oy=(H-AH*s)/2;
    ctx.strokeStyle='rgba(0,224,198,.1)';ctx.lineWidth=1;ctx.beginPath();for(var g=0;g<=AW;g+=50){ctx.moveTo(ox+g*s,oy);ctx.lineTo(ox+g*s,oy+AH*s)}for(g=0;g<=AH;g+=50){ctx.moveTo(ox,oy+g*s);ctx.lineTo(ox+AW*s,oy+g*s)}ctx.stroke();
    ctx.strokeStyle='rgba(0,224,198,.45)';ctx.lineWidth=2;ctx.strokeRect(ox,oy,AW*s,AH*s);
    if(level){
      ctx.font='600 '+Math.max(10,Math.round(11*s*1.6))+'px ui-monospace,Menlo,monospace';ctx.fillStyle='rgba(159,245,233,.42)';ctx.textBaseline='middle';
      level.msg.forEach(function(m){ctx.fillText(m[2],ox+m[0]*s,oy+m[1]*s)});
      var gl=level.goal,pulse=1+Math.sin(now*4)*.06;ctx.shadowColor='#FEBC2E';ctx.shadowBlur=18;ctx.strokeStyle='#FEBC2E';ctx.lineWidth=3;ctx.beginPath();ctx.arc(ox+gl[0]*s,oy+gl[1]*s,gl[2]*s*pulse,0,Math.PI*2);ctx.stroke();ctx.fillStyle='rgba(254,188,46,.12)';ctx.fill();ctx.shadowBlur=0;
      statics.forEach(function(w){ctx.shadowColor=w[6];ctx.shadowBlur=10;ctx.strokeStyle=w[6];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(ox+w[0]*s,oy+w[1]*s);ctx.lineTo(ox+w[2]*s,oy+w[3]*s);ctx.stroke()});ctx.shadowBlur=0;
    }
    cycles.forEach(function(c){var t=c.trail;ctx.shadowColor=c.color;ctx.shadowBlur=c.alive?(c.grinding?16:9):0;ctx.strokeStyle=c.color;ctx.globalAlpha=c.alive?1:.3;ctx.lineWidth=3;ctx.lineJoin='miter';ctx.beginPath();ctx.moveTo(ox+t[0][0]*s,oy+t[0][1]*s);for(var i=1;i<t.length;i++)ctx.lineTo(ox+t[i][0]*s,oy+t[i][1]*s);ctx.lineTo(ox+c.x*s,oy+c.y*s);ctx.stroke();ctx.shadowBlur=0;ctx.globalAlpha=1;
      if(c.alive){var r=radius(c)*s;ctx.fillStyle=c.touching?c.color:'#fff';ctx.fillRect(ox+c.x*s-3,oy+c.y*s-3,6,6);ctx.strokeStyle=c.touching?'rgba(255,255,255,.75)':'rgba(255,255,255,.28)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(ox+c.x*s,oy+c.y*s,Math.max(4,r+(c.touching?Math.random()*3:0)),0,Math.PI*2);ctx.stroke()}});
    booms=booms.filter(function(b){return b.t>0});booms.forEach(function(b){b.x+=b.vx*.016;b.y+=b.vy*.016;b.t-=.025;ctx.globalAlpha=Math.max(0,b.t);ctx.fillStyle=b.c;ctx.fillRect(ox+b.x*s,oy+b.y*s,3,3)});ctx.globalAlpha=1;
    var me=cycles[0];
    var st=(me.alive?Math.round(me.speed)+' km/h'+(me.grinding?'  BOOST':'')+(me.braking&&me.brakeCharge>0?'  BRAKE':'')+(me.touching?'  SHIELD':''):'crashed');
    if(level){hudS.textContent=level.name+(BEST[level.id]?'   best '+BEST[level.id].toFixed(2)+'s':'');hudR.textContent=st+'   ·   '+(level.limit?Math.max(0,level.limit-clock).toFixed(1)+'s left':clock.toFixed(1)+'s')}
    else{hudS.textContent=cycles.map(function(c){return c.name+' '+score[c.i]}).join('   ');hudR.textContent=st+'   ·   round '+(round+1)}
    shieldEl.style.width=(me.shield/CFG.shieldMax*100)+'%';shieldEl.style.background=me.shield<CFG.shieldMax*.35?'#FF5F57':'#00E0C6';brakeEl.style.width=(me.brakeCharge/CFG.brakeMax*100)+'%';
  }
  function frame(ts){
    if(!running)return;
    if(!last)last=ts;var dt=Math.min(.05,(ts-last)/1000);last=ts;
    if(countdown>0){countdown-=dt;countEl.hidden=false;countEl.textContent=countdown>0?Math.ceil(countdown):'GO';if(countdown<=0){setTimeout(function(){countEl.hidden=true},400);humSet(true,CFG.base)}draw();raf=requestAnimationFrame(frame);return}
    step(dt);draw();var me=cycles[0];humSet(me.alive,me.speed);
    raf=requestAnimationFrame(frame);
  }
  function wire(){menu.querySelectorAll('[data-start]').forEach(function(b){b.addEventListener('click',function(){start(+b.dataset.start)})});menu.querySelectorAll('[data-level]').forEach(function(b){b.addEventListener('click',function(){levelIx=+b.dataset.level;start(3)})});menu.querySelectorAll('[data-levels]').forEach(function(b){b.addEventListener('click',levelMenu)});menu.querySelectorAll('[data-keys]').forEach(function(b){b.addEventListener('click',keysMenu)})}
  function endRound(winner,youDied){
    running=false;ui.hidden=false;humSet(false,0);menu.classList.remove('cyc-wide');
    menu.innerHTML='<h2>'+(winner?(winner.human?winner.name+(winner.i===0?' win':' wins')+' the round':winner.name+' takes it'):(youDied?'You crashed':'Everyone crashed'))+'</h2><p>'+cycles.map(function(c){return c.name+': '+score[c.i]}).join(' · ')+'</p><div class="cyc-opts"><button class="cyc-btn" data-start="'+mode+'">Next round</button><button class="cyc-btn" data-start="'+(mode===1?2:1)+'">'+(mode===1?'2 players':'Solo vs bots')+'</button><button class="cyc-btn" data-levels="1">Survival</button><button class="cyc-btn" data-keys="1">Controls</button></div>';
    wire();
  }
  function endLevel(won,how){
    running=false;ui.hidden=false;humSet(false,0);menu.classList.remove('cyc-wide');
    var next=levelIx+1<LEVELS.length;
    menu.innerHTML='<h2>'+(won?'Cleared in '+how.toFixed(2)+'s':'Level failed')+'</h2><p>'+level.name+(won?(BEST[level.id]===how?' — new best':' · best '+BEST[level.id].toFixed(2)+'s'):' — '+how)+'</p><div class="cyc-opts">'+(won&&next?'<button class="cyc-btn" data-level="'+(levelIx+1)+'">Next level</button>':'')+'<button class="cyc-btn" data-level="'+levelIx+'">'+(won?'Again':'Retry')+'</button><button class="cyc-btn" data-levels="1">All levels</button><button class="cyc-btn" data-start="1">Arena</button></div>';
    wire();
  }
  function levelMenu(){
    running=false;ui.hidden=false;humSet(false,0);menu.classList.remove('cyc-wide');
    var tiers=[];LEVELS.forEach(function(l){if(tiers.indexOf(l.tier)<0)tiers.push(l.tier)});
    menu.innerHTML='<h2>SURVIVAL</h2><p>Fixed walls, a ring to reach, a clock. Same physics as the arena.</p>'+tiers.map(function(t){return '<p class="cyc-small" style="margin:8px 0 4px;text-transform:uppercase;letter-spacing:.12em">'+t+'</p><div class="cyc-opts">'+LEVELS.map(function(l,i){return l.tier===t?'<button class="cyc-btn cyc-lvl" data-level="'+i+'">'+l.name+(BEST[l.id]?'<small>'+BEST[l.id].toFixed(2)+'s</small>':'')+'</button>':''}).join('')+'</div>'}).join('')+'<div class="cyc-opts"><button class="cyc-btn" data-keys="1">Controls</button><button class="cyc-btn" data-start="1">Back to the arena</button></div>';
    wire();
  }
  function start(m){if(m!==mode){score=[0,0,0,0];round=0}mode=m;reset();ui.hidden=true;running=true;last=0;countdown=m===3?1:2;now=0;sound();blip(440,.1);canvas.focus();cancelAnimationFrame(raf);raf=requestAnimationFrame(frame)}
  function human(i,act,on){var c=cycles[i];if(!c||!c.alive||!running||countdown>0)return;if(act==='brake'){c.braking=on;return}if(on)turn(c,act)}
  /* Controls. Every action can have any number of keys — that is how a double bind works: bind two keys to
     "turn left", press both at once, and the two 90° turns land back to back for a 180° flip. Solo mode
     listens to both players' keys; 2-player mode splits them. Saved in this browser. */
  var ACTIONS=[['up','Go up'],['down','Go down'],['left','Go left'],['right','Go right'],['turnL','Turn left'],['turnR','Turn right'],['brake','Brake']];
  var DEF=[{up:['w'],down:['s'],left:['a'],right:['d'],turnL:['q'],turnR:['e'],brake:[' ']},{up:['ArrowUp'],down:['ArrowDown'],left:['ArrowLeft'],right:['ArrowRight'],turnL:[','],turnR:['.'],brake:['Shift','Enter']}];
  var ACT={up:3,down:1,left:2,right:0,turnL:'left',turnR:'right',brake:'brake'};
  var KEYS=null;
  function loadKeys(){try{var k=JSON.parse(localStorage.getItem('tr-cycles-keys')||'null');if(k&&k.length===2&&k[0].up)return k}catch(e){}return JSON.parse(JSON.stringify(DEF))}
  function saveKeys(){try{localStorage.setItem('tr-cycles-keys',JSON.stringify(KEYS))}catch(e){}}
  KEYS=loadKeys();
  function keyName(k){return k===' '?'Space':k.replace('Arrow','')==='Up'?'↑':k.replace('Arrow','')==='Down'?'↓':k.replace('Arrow','')==='Left'?'←':k.replace('Arrow','')==='Right'?'→':k.length===1?k.toUpperCase():k}
  function norm(k){return k.length===1?k.toLowerCase():k}
  var listening=null;
  function key(e,on){
    var k=norm(e.key);
    if(listening){if(!on)return;e.preventDefault();if(k!=='Escape'){var arr=KEYS[listening.p][listening.a];if(arr.indexOf(k)<0)arr.push(k);saveKeys()}listening=null;keysMenu();return}
    if(on&&e.repeat)return;
    if(on&&k==='m'){muted=!muted;humSet(running&&!muted,cycles[0]?cycles[0].speed:CFG.base);return}
    var hit=false;
    KEYS.forEach(function(map,p){var who=mode===2?p:0;ACTIONS.forEach(function(a){if(map[a[0]].indexOf(k)>=0){human(who,ACT[a[0]],on);hit=true}})});
    if(hit)e.preventDefault();
  }
  function keysMenu(){
    running=false;ui.hidden=false;humSet(false,0);menu.classList.add('cyc-wide');
    menu.innerHTML='<h2>CONTROLS</h2><p class="cyc-small">Click + then press a key to add it. Click a key to remove it. Bind two keys to one turn and press both for a double bind.</p><div class="cyc-keys">'+KEYS.map(function(map,p){return '<div class="cyc-keycol"><strong>'+(p?'Player 2 (2P mode)':'Player 1')+'</strong>'+ACTIONS.map(function(a){return '<div class="cyc-keyrow"><span>'+a[1]+'</span><span class="cyc-chips">'+map[a[0]].map(function(k,i){return '<button class="cyc-chip" data-del="'+p+':'+a[0]+':'+i+'" title="remove">'+keyName(k)+'</button>'}).join('')+'<button class="cyc-chip cyc-add" data-add="'+p+':'+a[0]+'">'+(listening&&listening.p===p&&listening.a===a[0]?'press a key…':'+')+'</button></span></div>'}).join('')+'</div>'}).join('')+'</div><div class="cyc-opts"><button class="cyc-btn" data-keysreset="1">Reset</button><button class="cyc-btn" data-back="1">Done</button></div>';
    menu.querySelectorAll('[data-del]').forEach(function(b){b.addEventListener('click',function(){var q=b.dataset.del.split(':');KEYS[+q[0]][q[1]].splice(+q[2],1);saveKeys();keysMenu()})});
    menu.querySelectorAll('[data-add]').forEach(function(b){b.addEventListener('click',function(){var q=b.dataset.add.split(':');listening={p:+q[0],a:q[1]};keysMenu();canvas.focus()})});
    menu.querySelector('[data-keysreset]').addEventListener('click',function(){KEYS=JSON.parse(JSON.stringify(DEF));saveKeys();keysMenu()});
    menu.querySelector('[data-back]').addEventListener('click',function(){listening=null;mode===3?levelMenu():endRoundMenu()});
  }
  function endRoundMenu(){menu.classList.remove('cyc-wide');menu.innerHTML='<h2>LIGHT CYCLES</h2><div class="cyc-opts"><button class="cyc-btn" data-start="1">Solo vs 3 bots</button><button class="cyc-btn" data-start="2">2 players</button><button class="cyc-btn" data-levels="1">Survival</button><button class="cyc-btn" data-keys="1">Controls</button></div>';wire()}
  function kd(e){key(e,true)}function ku(e){key(e,false)}
  canvas.tabIndex=0;canvas.addEventListener('keydown',kd);canvas.addEventListener('keyup',ku);document.addEventListener('keydown',function(e){if(e.target!==canvas)kd(e)});document.addEventListener('keyup',function(e){if(e.target!==canvas)ku(e)});canvas.addEventListener('mousedown',function(){canvas.focus()});
  var tx=0;canvas.addEventListener('touchstart',function(e){tx=e.touches[0].clientX},{passive:true});
  canvas.addEventListener('touchend',function(e){var dx=e.changedTouches[0].clientX-tx;if(Math.abs(dx)<10)return;human(0,dx>0?'right':'left',true)});
  wire();
  reset();draw();
  root.__cyc={keys:function(){return KEYS},step:step,turn:turn,draw:draw,cycles:function(){return cycles},cfg:CFG,levels:LEVELS,level:function(i){levelIx=i;start(3);countdown=0;countEl.hidden=true},state:function(){return{over:over,clock:clock,best:BEST,mode:mode}},go:function(m){start(m||1);countdown=0;countEl.hidden=true}};
  return {stop:function(){running=false;cancelAnimationFrame(raf);document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);humSet(false,0);try{if(audio)audio.close()}catch(e){}}};
};
