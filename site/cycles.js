/* Lightwall — an Armagetron-style arena, written for this desktop. Own code, no libraries.
   Movement model: Armagetron's rules (re-implemented in our own code from how Armagetron / Armawebtron behave):
   the cycle is a point and walls have no width; RUBBER is a distance budget that only burns while you press into a
   wall (turn away and it refills); speed snaps back up to cruise fast but bleeds off slowly above it; walls beside
   you accelerate you by how close you run; every turn costs 5% speed, has a 20 ms delay and queues up to three, a brake with a recharging meter, boost that grows the
   closer you run parallel to a wall, a shield that is also your size — it drains while you touch a wall,
   shrinking you so you can dig through gaps, and refills when clear — trails of finite length so the grid
   keeps opening up. Solo vs three bots, 2 players on one keyboard, or Survival: a ladder of short levels
   with fixed walls, a goal ring and a clock (dig, turn, grind for boost, tunnel, double-bind flip, mazes). */
window.initCycles=function(root){
  root.innerHTML='<div class="cyc"><canvas class="cyc-canvas" width="900" height="640" aria-label="Lightwall arena"></canvas>'+
    '<div class="cyc-hud"><span class="cyc-score"></span><span class="cyc-round"></span></div>'+
    '<div class="cyc-meters"><span class="cyc-meter"><i class="cyc-shield"></i></span><span class="cyc-meter"><i class="cyc-brake"></i></span></div>'+
    '<div class="cyc-count" hidden></div>'+
    '<div class="cyc-ui"><div class="cyc-menu"></div></div></div>';
  var canvas=root.querySelector('.cyc-canvas'),ctx=canvas.getContext('2d');
  var ui=root.querySelector('.cyc-ui'),menu=root.querySelector('.cyc-menu'),hudS=root.querySelector('.cyc-score'),hudR=root.querySelector('.cyc-round'),countEl=root.querySelector('.cyc-count'),shieldEl=root.querySelector('.cyc-shield'),brakeEl=root.querySelector('.cyc-brake');
  var W=canvas.width,H=canvas.height,AW=1000,AH=1000;
  var CFG={base:260,minF:.25,maxF:3,decayBelow:5,decayAbove:.1,turnFactor:.95,turnDelay:.02,turnMemory:3,brakeF:1.2,brakeMax:1,brakeDrain:1,brakeRegen:.15,wallLen:4000,shieldMax:2.5,rubber:170,rubberTime:10,minDist:.6,boostAccel:160,boostOffset:5,boostNear:24,rimMul:.5,enemyMul:1.1,staticMul:1.2,radMin:1,radMax:3.2};
  /* shieldMax is the RUBBER meter (full = 2.5). rubber: how many units of blocked travel the meter holds; rubberTime: seconds to refill from empty; minDist: how close you stop to a wall. */
  var RIDER='You';try{RIDER=(localStorage.getItem('tr-cycles-name')||'You').slice(0,14)||'You'}catch(e){}
  var COLORS=['#00E0C6','#FF5F57','#FEBC2E','#8B7DFF','#FF8A3D','#4FC3FF','#F25CFF','#9CFF57'],NAMES=[RIDER,'Vex','Halo','Kilo','Nyx','Onyx','Zephyr','Quill'];
  var DM={size:2400,riders:8,time:180,respawn:3,protect:2,wallLen:7000};
  var ZONE={time:180,shrink:150,r0:.47,r1:.13,drain:.75,reach:520};
  var zoneScore=[0,0,0,0,0,0,0,0],shares=[0,0,0,0,0,0,0,0],shareTick=0;
  function zoneR(){return AW*(ZONE.r0+(ZONE.r1-ZONE.r0)*Math.min(1,clock/ZONE.shrink))}
  function inZone(x,y,margin){return Math.hypot(x-AW/2,y-AH/2)<=zoneR()-(margin||0)}
  var DIRS=[[1,0],[0,1],[-1,0],[0,-1]];
  /* Survival levels. Own layouts; units are arena units, origin top-left. wall: [x0,y0,x1,y1,color].
     goal: a ring to reach. limit: seconds allowed (0 = none). msg: notes painted on the floor. */
  var LEVELS=[
    {id:'dig',name:'Rubber',tier:'training',w:1000,h:600,spawn:[120,300,0],goal:[880,300,40],limit:0,
      walls:[[560,60,560,270,'#06b6d4'],[560,330,560,540,'#06b6d4']],
      msg:[[300,200,'Ride into the wall: it holds you and burns RUBBER'],[300,400,'Turn away before it runs out, find the gap']]},
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
      msg:[[300,250,'You cannot reverse — but two turns can'],[300,300,'Press two left keys at once (A + Q, or ← + ,) to flip 180°']]},
    {id:'novice1',name:'Novice 1',tier:'novice',w:1000,h:700,spawn:[60,60,0],goal:[940,640,40],limit:20,
      walls:[[300,0,300,500,'#06b6d4'],[600,200,600,700,'#06b6d4'],[850,0,850,450,'#06b6d4']],msg:[]},
    {id:'novice2',name:'Corridors',tier:'novice',w:1200,h:700,spawn:[60,75,0],goal:[1140,650,35],limit:16,
      walls:[[0,150,1000,150,'#f97316'],[200,300,1200,300,'#f97316'],[0,450,1000,450,'#f97316'],[200,600,1200,600,'#f97316']],msg:[]},
    {id:'easy1',name:'Pinch',tier:'easy',w:1000,h:600,spawn:[80,280,0],goal:[920,300,36],limit:9,
      walls:[[350,0,350,292,'#22c55e'],[350,308,350,600,'#22c55e'],[650,0,650,292,'#ef4444'],[650,308,650,600,'#ef4444']],
      msg:[[420,120,'Two tight gaps — line up, the cycle is a point']]},
    {id:'easy2',name:'Spiral',tier:'easy',w:1000,h:800,spawn:[500,400,0],goal:[60,60,34],limit:18,
      walls:[[400,300,650,300,'#8B7DFF'],[650,300,650,550,'#8B7DFF'],[650,550,300,550,'#8B7DFF'],[300,550,300,200,'#8B7DFF'],[300,200,800,200,'#8B7DFF'],[800,200,800,700,'#8B7DFF'],[800,700,150,700,'#8B7DFF'],[150,700,150,120,'#8B7DFF']],
      msg:[[420,430,'Unwind it']]}
  ];
  var cycles=[],running=false,raf=null,last=0,round=0,score=[0,0,0,0,0,0,0,0],over=false,mode=1,muted=false,booms=[],countdown=0,now=0;
  var level=null,levelIx=0,statics=[],clock=0,BEST={};
  try{BEST=JSON.parse(localStorage.getItem('tr-cycles-best')||'{}')||{}}catch(e){}
  var audio=null,hum=null,humGain=null;
  var g3=window.initCycles3D?window.initCycles3D(root,{cycles:function(){return cycles},statics:function(){return statics},level:function(){return level},size:function(){return [AW,AH]},booms:function(){return booms},now:function(){return now},mode:function(){return mode},radius:function(c){return radius(c)},zone:function(){return mode===5?{x:AW/2,y:AH/2,r:zoneR()}:null},speedRatio:function(){return cycles[0]?cycles[0].speed/(CFG.base*smul()):1}}):null;
  function sound(){if(muted)return;try{if(!audio)audio=new (window.AudioContext||window.webkitAudioContext)();if(!hum){hum=audio.createOscillator();hum.type='sawtooth';humGain=audio.createGain();humGain.gain.value=0;var f=audio.createBiquadFilter();f.type='lowpass';f.frequency.value=600;hum.connect(f);f.connect(humGain);humGain.connect(audio.destination);hum.start()}if(audio.state==='suspended')audio.resume()}catch(e){}}
  function humSet(on,speed){if(!humGain)return;try{humGain.gain.linearRampToValueAtTime(on&&!muted?.05:0,audio.currentTime+.08);hum.frequency.linearRampToValueAtTime(60+speed*.4,audio.currentTime+.08)}catch(e){}}
  function blip(freq,dur){if(!audio||muted)return;try{var o=audio.createOscillator(),g=audio.createGain();o.type='square';o.frequency.value=freq;g.gain.value=.05;o.connect(g);g.connect(audio.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+dur);o.stop(audio.currentTime+dur)}catch(e){}}

  function mk(i,x,y,d,human){return{i:i,x:x,y:y,d:d,alive:true,human:human,color:COLORS[i],name:NAMES[i],speed:CFG.base*smul(),shield:CFG.shieldMax,brakeCharge:CFG.brakeMax,braking:false,lastTurn:-1,trail:[[x,y]],len:0,grinding:false,touching:false,protect:0,respawn:0,deaths:0,lastHit:null,target:null,retarget:0}}
  function wallLen(){return mode>=4?DM.wallLen:CFG.wallLen}
  function smul(){return mode>=4?1.5:1} /* the big grids run faster */
  var KMH=2.6,fps=60; /* display factor: our units → a cyclearena-like km/h readout */
  function radius(c){return CFG.radMin+(CFG.radMax-CFG.radMin)*c.shield/CFG.shieldMax}
  function reset(){
    over=false;booms=[];clock=0;
    if(mode===3){
      level=LEVELS[levelIx];AW=level.w;AH=level.h;
      statics=level.walls.map(function(w){return [w[0],w[1],w[2],w[3],'static',false,w[4]]});
      cycles=[mk(0,level.spawn[0],level.spawn[1],level.spawn[2],true)];
      return;
    }
    level=null;statics=[];
    if(mode===4||mode===5){
      AW=AH=DM.size;cycles=[];zoneScore=[0,0,0,0,0,0,0,0];shares=[0,0,0,0,0,0,0,0];shareTick=0;
      for(var i=0;i<DM.riders;i++){var a=i/DM.riders*Math.PI*2,r=AW*.36,x=AW/2+Math.cos(a)*r,y=AH/2+Math.sin(a)*r;
        var d=Math.abs(Math.cos(a))>Math.abs(Math.sin(a))?(Math.cos(a)>0?2:0):(Math.sin(a)>0?3:1); /* face the middle */
        var c=mk(i,x,y,d,i===0);c.protect=DM.protect;cycles.push(c)}
      return;
    }
    AW=AH=1000;
    var m=AW*.18;
    cycles=[mk(0,m,AH/2,0,true),mk(1,AW-m,AH/2,2,mode===2),mk(2,AW/2,m,1,false),mk(3,AW/2,AH-m,3,false)];
    cycles[1].name=mode===2?'P2':'Bot 1';
  }
  /* walls: the level's fixed walls, every trail segment (axis-aligned) plus the head segment of each cycle */
  function segments(){var out=statics.slice();cycles.forEach(function(c){var t=c.trail;for(var i=1;i<t.length;i++)out.push([t[i-1][0],t[i-1][1],t[i][0],t[i][1],c,false]);out.push([t[t.length-1][0],t[t.length-1][1],c.x,c.y,c,true])});return out}
  /* distance along direction d from (x,y) to the first wall; returns {d, seg} — the rim counts as a wall.
     tol is how wide the cycle is: a bigger shield clips wall ends it would otherwise slip past (that is digging) */
  function ray(x,y,d,self,maxD,segs,tol,tolPar){ /* tol: lateral reach for walls across the path; tolPar: for walls running alongside (their far end) */
    tol=tol||1.2;tolPar=tolPar||1.2;
    var dx=DIRS[d][0],dy=DIRS[d][1],best=maxD,hitSeg='rim';
    var rim=dx>0?AW-x:dx<0?x:dy>0?AH-y:y;if(rim<best){best=rim;hitSeg='rim'}
    for(var i=0;i<segs.length;i++){var s=segs[i];
      if(s[5]&&s[4]===self)continue;
      var sx0=Math.min(s[0],s[2]),sx1=Math.max(s[0],s[2]),sy0=Math.min(s[1],s[3]),sy1=Math.max(s[1],s[3]),t=-1;
      if(dx){ if(sx0===sx1){if(y<sy0-tol||y>sy1+tol)continue;t=(sx0-x)*dx} else if(Math.abs(y-sy0)<=tolPar)t=dx>0?sx0-x:x-sx1; }
      else{ if(sy0===sy1){if(x<sx0-tol||x>sx1+tol)continue;t=(sy0-y)*dy} else if(Math.abs(x-sx0)<=tolPar)t=dy>0?sy0-y:y-sy1; }
      if(t>0.01&&t<best){best=t;hitSeg=s}
    }
    return {d:best,seg:hitSeg};
  }
  function think(c,segs,dt){
    var f=ray(c.x,c.y,c.d,c,700,segs).d,l=(c.d+3)%4,r=(c.d+1)%4,fl=ray(c.x,c.y,l,c,700,segs).d,fr=ray(c.x,c.y,r,c,700,segs).d;
    var need=c.speed*.5;
    if(f<need){ if(fl<12&&fr<12){c.braking=true;return} turn(c,fl>fr?'left':(fr>fl?'right':(Math.random()<.5?'left':'right'))); return }
    c.braking=false;
    if(mode===5){ /* the zone: head for the middle when outside or near the edge */
      var dcx=AW/2-c.x,dcy=AH/2-c.y,far=Math.hypot(dcx,dcy)>zoneR()-90;
      if(far){var wantZ=Math.abs(dcx)>Math.abs(dcy)?(dcx>0?0:2):(dcy>0?1:3);if(wantZ!==c.d){if(wantZ===l&&fl>need)turn(c,'left');else if(wantZ===r&&fr>need)turn(c,'right');else if(wantZ===(c.d+2)%4){if(fl>=fr&&fl>need)turn(c,'left');else if(fr>need)turn(c,'right')}}return}
    }
    c.retarget-=dt;if(!c.target||!c.target.alive||c.retarget<=0){var others=cycles.filter(function(o){return o!==c&&o.alive});c.target=others.length?others[Math.floor(Math.random()*others.length)]:null;c.retarget=3+Math.random()*4}
    var me=c.target||cycles[0];
    if(Math.random()<dt*.9&&me.alive&&me!==c){var want=Math.abs(me.x-c.x)>Math.abs(me.y-c.y)?(me.x>c.x?0:2):(me.y>c.y?1:3);if(want===l&&fl>need*1.6)turn(c,'left');else if(want===r&&fr>need*1.6)turn(c,'right')}
    else if(Math.random()<dt*.3){if(fl>need*2&&fl>=fr)turn(c,'left');else if(fr>need*2)turn(c,'right')}
  }
  function turn(c,side){ /* side: 'left' / 'right', or an absolute direction 0-3 (arrow keys) */
    if(!c.alive)return;
    var nd=side==='left'?(c.d+3)%4:side==='right'?(c.d+1)%4:side;
    if(nd===c.d||nd===(c.d+2)%4)return;
    if(now-c.lastTurn<CFG.turnDelay){c.queue=c.queue||[];if(c.queue.length<CFG.turnMemory)c.queue.push(side);return}
    c.trail.push([c.x,c.y]);c.d=nd;c.speed*=CFG.turnFactor;c.lastTurn=now;
    if(c.human)blip(c.speed*1.6+220,.05);
  }
  function trimTrail(c){ /* walls have a finite length: the tail retracts */
    var t=c.trail,len=0;for(var i=1;i<t.length;i++)len+=Math.abs(t[i][0]-t[i-1][0])+Math.abs(t[i][1]-t[i-1][1]);len+=Math.abs(c.x-t[t.length-1][0])+Math.abs(c.y-t[t.length-1][1]);
    var extra=len-wallLen();
    while(extra>0&&t.length>1){var a=t[0],b=t[1],seg=Math.abs(b[0]-a[0])+Math.abs(b[1]-a[1]);if(seg<=extra){t.shift();extra-=seg}else{var k=extra/seg;t[0]=[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k];extra=0}}
    if(extra>0&&t.length===1){var hd=[c.x,c.y],a2=t[0],seg2=Math.abs(hd[0]-a2[0])+Math.abs(hd[1]-a2[1]);if(seg2>0){var k2=Math.min(1,extra/seg2);t[0]=[a2[0]+(hd[0]-a2[0])*k2,a2[1]+(hd[1]-a2[1])*k2]}}
  }
  function step(dt){
    now+=dt;if(!over)clock+=dt;var segs=segments();
    cycles.forEach(function(c){
      if(!c.alive){if(mode>=4&&c.respawn>0){c.respawn-=dt;if(c.respawn<=0)respawnAt(c)}return}
      if(c.protect>0)c.protect-=dt;
      if(!c.human)think(c,segs,dt);
      if(c.queue&&c.queue.length&&now-c.lastTurn>=CFG.turnDelay){turn(c,c.queue.shift())}
      /* brake */
      var base=CFG.base*smul(),braking=c.braking&&c.brakeCharge>0;
      if(braking){c.speed-=CFG.brakeF*base*dt;c.brakeCharge=Math.max(0,c.brakeCharge-CFG.brakeDrain*dt)}else if(!c.braking)c.brakeCharge=Math.min(CFG.brakeMax,c.brakeCharge+CFG.brakeRegen*dt);
      /* boost from a parallel wall on either side: stronger the closer, weaker on the rim, strongest on a level wall */
      var boost=0;[(c.d+1)%4,(c.d+3)%4].forEach(function(sd){var rr=ray(c.x,c.y,sd,c,CFG.boostNear,segs);if(rr.d<CFG.boostNear){var mul=rr.seg==='rim'?CFG.rimMul:rr.seg[4]==='static'?CFG.staticMul:(rr.seg[4]===c?1:CFG.enemyMul);boost+=CFG.boostAccel*mul*(1/(rr.d+CFG.boostOffset)-1/(CFG.boostOffset+CFG.boostNear))*CFG.boostOffset*4}});
      c.grinding=boost>0;
      c.speed+=boost*dt;
      var l=c.speed-base;
      if(l>0)c.speed-=CFG.decayAbove*l*dt;else if(l<0&&!braking)c.speed+=-l*CFG.decayBelow*dt; /* Armagetron: quick back up to cruise, slow bleed above it */
      c.speed=Math.max(base*CFG.minF,Math.min(base*CFG.maxF,c.speed));
      /* move, Armagetron style: the cycle is a point. A wall across the path stops you a hair short of it, and the
         travel you could not make burns RUBBER. Rubber gone = crash (blamed on the wall's owner). Turn away and
         rubber refills. Running alongside a wall, however close, costs nothing — that is grinding. */
      var rad=radius(c),dist=c.speed*dt,front=ray(c.x,c.y,c.d,c,dist+CFG.minDist+2,segs,.02,.02),room=front.d-CFG.minDist;
      if(dist>room){
        var moved=Math.max(0,room),blocked=dist-moved;c.x+=DIRS[c.d][0]*moved;c.y+=DIRS[c.d][1]*moved;
        c.touching=true;c.lastHit=front.seg;
        if(c.protect<=0)c.shield-=blocked/CFG.rubber*CFG.shieldMax;
        if(c.shield<=0){c.alive=false;c.deaths++;boom(c);if(c.human)blip(90,.4);
          if(mode>=4){var seg=c.lastHit,owner=seg&&seg!=='rim'&&seg[4]&&seg[4].i!==undefined?seg[4]:null;if(owner&&owner!==c){score[owner.i]++;if(owner.human||c.human)blip(owner.human?660:180,.15)}c.respawn=DM.respawn;if(c.human){countEl.hidden=false}}}
      }else{
        c.x+=DIRS[c.d][0]*dist;c.y+=DIRS[c.d][1]*dist;c.touching=false;
        c.shield=Math.min(CFG.shieldMax,c.shield+CFG.shieldMax/CFG.rubberTime*dt);
      }
      if(mode===5){c.outside=!inZone(c.x,c.y);if(c.outside&&c.protect<=0){c.shield-=ZONE.drain*dt;if(c.shield<=0){c.alive=false;c.deaths++;boom(c);c.respawn=DM.respawn;if(c.human){blip(90,.4);countEl.hidden=false}}}}
      trimTrail(c);
    });
    if(mode===5){
      if(over)return;var me5=cycles[0];
      shareTick-=dt;if(shareTick<=0){shareTick=.5;shares=control()}
      cycles.forEach(function(c){if(c.alive)zoneScore[c.i]+=shares[c.i]*dt});
      if(me5.alive)countEl.hidden=true;else countEl.textContent='respawn '+Math.ceil(me5.respawn);
      if(clock>=ZONE.time){over=true;humSet(false,0);setTimeout(endMatch,600)}
      return;
    }
    if(mode===4){
      if(over)return;var me4=cycles[0];
      if(me4.alive)countEl.hidden=true;else countEl.textContent='respawn '+Math.ceil(me4.respawn);
      if(clock>=DM.time){over=true;humSet(false,0);setTimeout(endMatch,600)}
      return;
    }
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
  function control(){ /* sample the zone; each point belongs to the rider whose wall or cycle is nearest (within reach) */
    var R=zoneR(),cx=AW/2,cy=AH/2,own=[0,0,0,0,0,0,0,0],total=0;
    var per=cycles.map(function(c){var segs=[];var t=c.trail;for(var i=1;i<t.length;i++)segs.push([t[i-1][0],t[i-1][1],t[i][0],t[i][1]]);segs.push([t[t.length-1][0],t[t.length-1][1],c.x,c.y]);return c.alive?segs:[]});
    function dseg(px,py,s){var x0=s[0],y0=s[1],x1=s[2],y1=s[3],dx=x1-x0,dy=y1-y0,L=dx*dx+dy*dy,t=L?Math.max(0,Math.min(1,((px-x0)*dx+(py-y0)*dy)/L)):0;return Math.hypot(px-(x0+dx*t),py-(y0+dy*t))}
    for(var ri=0;ri<14;ri++){var rr=R*(ri+.5)/14,n=6+ri*3;for(var k=0;k<n;k++){var a=k/n*Math.PI*2,px=cx+Math.cos(a)*rr,py=cy+Math.sin(a)*rr,best=ZONE.reach,who=-1;
      for(var i=0;i<per.length;i++){var sg=per[i];for(var j=0;j<sg.length;j++){var d=dseg(px,py,sg[j]);if(d<best){best=d;who=i}}}
      total++;if(who>=0)own[who]++}}
    return own.map(function(o){return o/total});
  }
  function respawnAt(c){ /* a free spot: room in all four directions (inside the zone in zone mode) */
    var segs=segments(),best=null,bestD=-1;
    for(var t=0;t<60;t++){var x=AW*.1+Math.random()*AW*.8,y=AH*.1+Math.random()*AH*.8,dmin=1e9;
      if(mode===5&&!inZone(x,y,90))continue;
      for(var d=0;d<4;d++)dmin=Math.min(dmin,ray(x,y,d,null,600,segs).d);
      if(dmin>bestD){bestD=dmin;best=[x,y]}if(dmin>=400)break}
    if(!best)best=[AW/2,AH/2];var d0=Math.floor(Math.random()*4);c.x=best[0];c.y=best[1];c.outside=false;c.d=d0;c.trail=[[c.x,c.y]];c.alive=true;c.shield=CFG.shieldMax;c.brakeCharge=CFG.brakeMax;c.speed=CFG.base*smul();c.protect=DM.protect;c.lastTurn=-1;c.queue=[];c.braking=false;c.touching=false;
    if(c.human){countEl.hidden=true;humSet(true,CFG.base)}
  }
  function standings(){if(mode===5)return cycles.slice().sort(function(a,b){return zoneScore[b.i]-zoneScore[a.i]});return cycles.slice().sort(function(a,b){return score[b.i]-score[a.i]||a.deaths-b.deaths})}
  function endMatch(){
    if(mode<4)return;
    running=false;ui.hidden=false;humSet(false,0);menu.classList.remove('cyc-wide');countEl.hidden=true;
    var st=standings(),you=st.indexOf(cycles[0])+1,tot=zoneScore.reduce(function(a,b){return a+b},0)||1;
    var title=you===1?(mode===5?'King of the Zone':'King of the Arena'):'#'+you+' of '+st.length+(mode===5?' — '+st[0].name+' is King of the Zone':' — '+st[0].name+' is King of the Arena');
    menu.innerHTML='<h2>'+title+'</h2><p class="cyc-small">'+st.map(function(c,i){return (i+1)+'. '+c.name+' '+(mode===5?Math.round(zoneScore[c.i]/tot*100)+'% zone · '+score[c.i]+'K':score[c.i]+'K / '+c.deaths+'D')}).join(' · ')+'</p><div class="cyc-opts"><button class="cyc-btn" data-start="'+mode+'">Again</button><button class="cyc-btn" data-start="'+(mode===5?4:5)+'">'+(mode===5?'King of the Arena':'King of the Zone')+'</button><button class="cyc-btn" data-lobby="1">Lobby</button><button class="cyc-btn" data-view="1"></button></div>';
    wire();
  }
  function boom(c){for(var i=0;i<40;i++)booms.push({x:c.x,y:c.y,vx:(Math.random()-.5)*160,vy:(Math.random()-.5)*160,t:1,c:c.color})}

  function draw(){
    ctx.fillStyle='#07090c';ctx.fillRect(0,0,W,H);
    var s=Math.min(W/AW,H/AH)*.96,ox=(W-AW*s)/2,oy=(H-AH*s)/2;
    ctx.strokeStyle='rgba(0,224,198,.1)';ctx.lineWidth=1;ctx.beginPath();var gs=AW>1500?100:50;for(var g=0;g<=AW;g+=gs){ctx.moveTo(ox+g*s,oy);ctx.lineTo(ox+g*s,oy+AH*s)}for(g=0;g<=AH;g+=gs){ctx.moveTo(ox,oy+g*s);ctx.lineTo(ox+AW*s,oy+g*s)}ctx.stroke();
    ctx.strokeStyle='rgba(0,224,198,.45)';ctx.lineWidth=2;ctx.strokeRect(ox,oy,AW*s,AH*s);
    if(mode===5){var R=zoneR();ctx.strokeStyle='rgba(255,120,120,.9)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(ox+AW/2*s,oy+AH/2*s,R*s,0,Math.PI*2);ctx.stroke();ctx.fillStyle='rgba(255,80,80,.07)';ctx.beginPath();ctx.rect(ox,oy,AW*s,AH*s);ctx.arc(ox+AW/2*s,oy+AH/2*s,R*s,0,Math.PI*2,true);ctx.fill()}
    if(level){
      ctx.font='600 '+Math.max(10,Math.round(11*s*1.6))+'px ui-monospace,Menlo,monospace';ctx.fillStyle='rgba(159,245,233,.42)';ctx.textBaseline='middle';
      level.msg.forEach(function(m){ctx.fillText(m[2],ox+m[0]*s,oy+m[1]*s)});
      var gl=level.goal,pulse=1+Math.sin(now*4)*.06;ctx.shadowColor='#FEBC2E';ctx.shadowBlur=18;ctx.strokeStyle='#FEBC2E';ctx.lineWidth=3;ctx.beginPath();ctx.arc(ox+gl[0]*s,oy+gl[1]*s,gl[2]*s*pulse,0,Math.PI*2);ctx.stroke();ctx.fillStyle='rgba(254,188,46,.12)';ctx.fill();ctx.shadowBlur=0;
      statics.forEach(function(w){ctx.shadowColor=w[6];ctx.shadowBlur=10;ctx.strokeStyle=w[6];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(ox+w[0]*s,oy+w[1]*s);ctx.lineTo(ox+w[2]*s,oy+w[3]*s);ctx.stroke()});ctx.shadowBlur=0;
    }
    cycles.forEach(function(c){var t=c.trail;ctx.shadowColor=c.color;ctx.shadowBlur=c.alive?(c.grinding?16:9):0;ctx.strokeStyle=c.color;ctx.globalAlpha=c.alive?1:.3;ctx.lineWidth=3;ctx.lineJoin='miter';ctx.beginPath();ctx.moveTo(ox+t[0][0]*s,oy+t[0][1]*s);for(var i=1;i<t.length;i++)ctx.lineTo(ox+t[i][0]*s,oy+t[i][1]*s);ctx.lineTo(ox+c.x*s,oy+c.y*s);ctx.stroke();ctx.shadowBlur=0;ctx.globalAlpha=1;
      if(c.alive){var r=radius(c)*s;ctx.globalAlpha=c.protect>0?.5+.5*Math.sin(now*12):1;ctx.fillStyle=c.touching?c.color:'#fff';ctx.fillRect(ox+c.x*s-3,oy+c.y*s-3,6,6);ctx.strokeStyle=c.touching?'rgba(255,255,255,.75)':'rgba(255,255,255,.28)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(ox+c.x*s,oy+c.y*s,Math.max(4,r+(c.touching?Math.random()*3:0)),0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1}});
    booms=booms.filter(function(b){return b.t>0});booms.forEach(function(b){b.x+=b.vx*.016;b.y+=b.vy*.016;b.t-=.025;ctx.globalAlpha=Math.max(0,b.t);ctx.fillStyle=b.c;ctx.fillRect(ox+b.x*s,oy+b.y*s,3,3)});ctx.globalAlpha=1;
    var me=cycles[0];
    var st=(me.alive?Math.round(me.speed*KMH)+' km/h'+(me.grinding?'  BOOST':'')+(me.braking&&me.brakeCharge>0?'  BRAKE':'')+(me.touching?'  RUBBER':''):'crashed');
    if(level){hudS.textContent=level.name+(BEST[level.id]?'   best '+BEST[level.id].toFixed(2)+'s':'');hudR.textContent=st+'   ·   '+(level.limit?Math.max(0,level.limit-clock).toFixed(1)+'s left':clock.toFixed(1)+'s')}
    else if(mode===5){var st5=standings();hudS.textContent=st5.slice(0,4).map(function(c,i){return (i+1)+' '+c.name+' '+Math.round(shares[c.i]*100)+'%'}).join('   ')+(st5.indexOf(me)>3?'   ·   you #'+(st5.indexOf(me)+1)+' '+Math.round(shares[0]*100)+'%':'');hudR.textContent=(me.alive&&me.outside?'OUTSIDE THE ZONE   ':me.protect>0?'PROTECTED   ':'')+st+'   ·   zone '+Math.round(zoneR()/AW*200)+'%   ·   '+Math.max(0,ZONE.time-clock).toFixed(0)+'s   ·   '+Math.round(fps)+' fps'}
    else if(mode===4){var st4=standings();hudS.textContent=st4.slice(0,4).map(function(c,i){return (i+1)+' '+c.name+' '+score[c.i]}).join('   ')+(st4.indexOf(me)>3?'   ·   you #'+(st4.indexOf(me)+1)+' '+score[0]:'');hudR.textContent=(me.protect>0?'PROTECTED   ':'')+st+'   ·   '+Math.max(0,DM.time-clock).toFixed(0)+'s   ·   '+Math.round(fps)+' fps'}
    else{hudS.textContent=cycles.map(function(c){return c.name+' '+score[c.i]}).join('   ');hudR.textContent=st+'   ·   round '+(round+1)}
    shieldEl.style.width=(me.shield/CFG.shieldMax*100)+'%';shieldEl.style.background=me.shield<CFG.shieldMax*.35?'#FF5F57':'#00E0C6';brakeEl.style.width=(me.brakeCharge/CFG.brakeMax*100)+'%';
  }
  function frame(ts){
    if(!running)return;
    if(!last)last=ts;var dt=Math.min(.05,(ts-last)/1000);last=ts;if(dt>0)fps+=(1/dt-fps)*.05;
    if(countdown>0){countdown-=dt;countEl.hidden=false;countEl.textContent=countdown>0?Math.ceil(countdown):'GO';if(countdown<=0){setTimeout(function(){countEl.hidden=true},400);humSet(true,CFG.base*smul())}draw();if(g3)g3.render(dt);raf=requestAnimationFrame(frame);return}
    step(dt);draw();if(g3)g3.render(dt);var me=cycles[0];humSet(me.alive,me.speed);
    raf=requestAnimationFrame(frame);
  }
  function wire(){menu.querySelectorAll('[data-start]').forEach(function(b){b.addEventListener('click',function(){start(+b.dataset.start)})});menu.querySelectorAll('[data-level]').forEach(function(b){b.addEventListener('click',function(){levelIx=+b.dataset.level;start(3)})});menu.querySelectorAll('[data-levels]').forEach(function(b){b.addEventListener('click',levelMenu)});menu.querySelectorAll('[data-keys]').forEach(function(b){b.addEventListener('click',keysMenu)});menu.querySelectorAll('[data-lobby]').forEach(function(b){b.addEventListener('click',lobby)});viewBtns()}
  function viewLabel(){var v=g3?g3.view():'flat';return 'View: '+({chase:'chase',high:'high chase',overview:'overview',flat:'flat'}[v]||v)}
  function viewBtns(){menu.querySelectorAll('[data-view]').forEach(function(b){b.textContent=viewLabel();b.onclick=function(){if(g3)g3.cycleView();viewBtns();draw()}})}
  function endRound(winner,youDied){
    if(mode!==1&&mode!==2)return;
    running=false;ui.hidden=false;humSet(false,0);menu.classList.remove('cyc-wide');
    menu.innerHTML='<h2>'+(winner?(winner.human?winner.name+(winner.i===0?' win':' wins')+' the round':winner.name+' takes it'):(youDied?'You crashed':'Everyone crashed'))+'</h2><p>'+cycles.map(function(c){return c.name+': '+score[c.i]}).join(' · ')+'</p><div class="cyc-opts"><button class="cyc-btn" data-start="'+mode+'">Next round</button><button class="cyc-btn" data-lobby="1">Lobby</button><button class="cyc-btn" data-view="1"></button></div>';
    wire();
  }
  function endLevel(won,how){
    if(mode!==3||!level)return; /* the mode changed during the end delay */
    running=false;ui.hidden=false;humSet(false,0);menu.classList.remove('cyc-wide');
    var next=levelIx+1<LEVELS.length;
    menu.innerHTML='<h2>'+(won?'Cleared in '+how.toFixed(2)+'s':'Level failed')+'</h2><p>'+level.name+(won?(BEST[level.id]===how?' — new best':' · best '+BEST[level.id].toFixed(2)+'s'):' — '+how)+'</p><div class="cyc-opts">'+(won&&next?'<button class="cyc-btn" data-level="'+(levelIx+1)+'">Next level</button>':'')+'<button class="cyc-btn" data-level="'+levelIx+'">'+(won?'Again':'Retry')+'</button><button class="cyc-btn" data-levels="1">All levels</button><button class="cyc-btn" data-lobby="1">Lobby</button><button class="cyc-btn" data-view="1"></button></div>';
    wire();
  }
  function levelMenu(){
    running=false;ui.hidden=false;humSet(false,0);menu.classList.remove('cyc-wide');
    var tiers=[];LEVELS.forEach(function(l){if(tiers.indexOf(l.tier)<0)tiers.push(l.tier)});
    menu.innerHTML='<h2>SURVIVAL</h2><p>Fixed walls, a ring to reach, a clock. Same physics as the arena.</p>'+tiers.map(function(t){return '<p class="cyc-small" style="margin:8px 0 4px;text-transform:uppercase;letter-spacing:.12em">'+t+'</p><div class="cyc-opts">'+LEVELS.map(function(l,i){return l.tier===t?'<button class="cyc-btn cyc-lvl" data-level="'+i+'">'+l.name+(BEST[l.id]?'<small>'+BEST[l.id].toFixed(2)+'s</small>':'')+'</button>':''}).join('')+'</div>'}).join('')+'<div class="cyc-opts"><button class="cyc-btn" data-keys="1">Controls</button><button class="cyc-btn" data-view="1"></button><button class="cyc-btn" data-lobby="1">Lobby</button></div>';
    wire();
  }
  function start(m){if(m!==mode||m>=4){score=[0,0,0,0,0,0,0,0];round=0}mode=m;reset();if(g3)g3.reset();ui.hidden=true;running=true;last=0;countdown=m===3?1:2;now=0;sound();blip(440,.1);canvas.focus();cancelAnimationFrame(raf);raf=requestAnimationFrame(frame)}
  function human(i,act,on){var c=cycles[i];if(!c||!c.alive||!running||countdown>0)return;var chase=g3&&g3.chase()&&mode!==2;if(act==='brake'||(chase&&act===1)){c.braking=on;return}if(!on)return;if(typeof act==='number'&&chase){if(act===2)act='left';else if(act===0)act='right';else return}turn(c,act)} /* chase view: the left key turns left, the right key turns right, whatever the heading */
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
    if(on&&k==='v'&&g3){var vv=g3.cycleView();hudR.textContent='view: '+vv;if(!running)draw();return}
    var hit=false;
    KEYS.forEach(function(map,p){var who=mode===2?p:0;ACTIONS.forEach(function(a){if(map[a[0]].indexOf(k)>=0){human(who,ACT[a[0]],on);hit=true}})});
    if(hit)e.preventDefault();
  }
  function keysMenu(){
    running=false;ui.hidden=false;humSet(false,0);menu.classList.add('cyc-wide');
    menu.innerHTML='<h2>CONTROLS</h2><p class="cyc-small">Click + then press a key to add it. Click a key to remove it. Bind two keys to one turn and press both for a double bind. In the chase views, Go down = brake.</p><div class="cyc-keys">'+KEYS.map(function(map,p){return '<div class="cyc-keycol"><strong>'+(p?'Player 2 (2P mode)':'Player 1')+'</strong>'+ACTIONS.map(function(a){return '<div class="cyc-keyrow"><span>'+a[1]+'</span><span class="cyc-chips">'+map[a[0]].map(function(k,i){return '<button class="cyc-chip" data-del="'+p+':'+a[0]+':'+i+'" title="remove">'+keyName(k)+'</button>'}).join('')+'<button class="cyc-chip cyc-add" data-add="'+p+':'+a[0]+'">'+(listening&&listening.p===p&&listening.a===a[0]?'press a key…':'+')+'</button></span></div>'}).join('')+'</div>'}).join('')+'</div><div class="cyc-opts"><button class="cyc-btn" data-keysreset="1">Reset</button><button class="cyc-btn" data-view="1"></button><button class="cyc-btn" data-back="1">Done</button></div>';
    viewBtns();
    menu.querySelectorAll('[data-del]').forEach(function(b){b.addEventListener('click',function(){var q=b.dataset.del.split(':');KEYS[+q[0]][q[1]].splice(+q[2],1);saveKeys();keysMenu()})});
    menu.querySelectorAll('[data-add]').forEach(function(b){b.addEventListener('click',function(){var q=b.dataset.add.split(':');listening={p:+q[0],a:q[1]};keysMenu();canvas.focus()})});
    menu.querySelector('[data-keysreset]').addEventListener('click',function(){KEYS=JSON.parse(JSON.stringify(DEF));saveKeys();keysMenu()});
    menu.querySelector('[data-back]').addEventListener('click',function(){listening=null;lobby()});
  }
  var MODES=[[4,'King of the Arena','8 riders · respawns · 3 minutes · most kills'],[5,'King of the Zone','8 riders · the zone shrinks · own the most space'],[1,'Classic','You vs 3 bots · last cycle standing'],[2,'2 players','One keyboard · WASD vs arrows'],['levels','Survival','Solo levels · dig, grind, double bind, beat the clock']];
  var picked=4;try{picked=JSON.parse(localStorage.getItem('tr-cycles-mode')||'4')}catch(e){}
  function lobby(){
    running=false;ui.hidden=false;humSet(false,0);menu.classList.add('cyc-wide');countEl.hidden=true;
    menu.innerHTML='<div class="cyc-lobby"><div class="cyc-lobby-head"><h2>LIGHTWALL</h2><p class="cyc-tag">Tron-style light cycles. Your wall is your weapon.</p></div>'+
      '<div class="cyc-modes">'+MODES.map(function(m){return '<button class="cyc-mode'+(String(m[0])===String(picked)?' sel':'')+'" data-mode="'+m[0]+'"><strong>'+m[1]+'</strong><span>'+m[2]+'</span></button>'}).join('')+'</div>'+
      '<div class="cyc-lobby-side"><label class="cyc-name">Rider name<input id="cycName" maxlength="14" value="'+RIDER.replace(/"/g,'&quot;')+'" autocomplete="off" spellcheck="false"></label><button class="cyc-btn cyc-play" data-play="1">PLAY</button><div class="cyc-opts"><button class="cyc-btn cyc-mini" data-keys="1">Controls</button><button class="cyc-btn cyc-mini" data-view="1"></button><button class="cyc-btn cyc-mini" data-help="1">How to play</button></div></div>'+
      '<div class="cyc-help" hidden><p>Arrow keys or WASD. In the chase views left and right turn you and down brakes; from above the arrows point the way and Space brakes. Run close and parallel to a wall to boost — the closer, the faster. Ride into a wall and it holds you while your RUBBER burns; turn away before it runs out. Grinding alongside a wall is free and fast.</p><p>Two turn keys at once flip you 180° (a double bind). V or the View button switches the camera. M mutes. Trails fade behind you, so the grid keeps opening up.</p><p class="cyc-small">Inspired by Armagetron Advanced · own code and art</p></div></div>';
    menu.querySelectorAll('[data-mode]').forEach(function(b){b.addEventListener('click',function(){picked=isNaN(+b.dataset.mode)?b.dataset.mode:+b.dataset.mode;try{localStorage.setItem('tr-cycles-mode',JSON.stringify(picked))}catch(e){}menu.querySelectorAll('[data-mode]').forEach(function(x){x.classList.toggle('sel',x===b)})});b.addEventListener('dblclick',play)});
    menu.querySelector('[data-play]').addEventListener('click',play);
    var nameEl=menu.querySelector('#cycName');nameEl.addEventListener('input',function(){RIDER=(nameEl.value.trim()||'You').slice(0,14);NAMES[0]=RIDER;if(cycles[0])cycles[0].name=RIDER;try{localStorage.setItem('tr-cycles-name',RIDER)}catch(e){}});
    nameEl.addEventListener('keydown',function(e){e.stopPropagation();if(e.key==='Enter')play()});nameEl.addEventListener('keyup',function(e){e.stopPropagation()});
    menu.querySelector('[data-help]').addEventListener('click',function(){var h=menu.querySelector('.cyc-help');h.hidden=!h.hidden});
    wire();
  }
  function play(){if(picked==='levels')levelMenu();else start(+picked)}
  function endRoundMenu(){lobby()}
  function kd(e){key(e,true)}function ku(e){key(e,false)}
  canvas.tabIndex=0;canvas.addEventListener('keydown',kd);canvas.addEventListener('keyup',ku);document.addEventListener('keydown',function(e){if(e.target!==canvas)kd(e)});document.addEventListener('keyup',function(e){if(e.target!==canvas)ku(e)});canvas.addEventListener('mousedown',function(){canvas.focus()});
  var tx=0;canvas.addEventListener('touchstart',function(e){tx=e.touches[0].clientX},{passive:true});
  canvas.addEventListener('touchend',function(e){var dx=e.changedTouches[0].clientX-tx;if(Math.abs(dx)<10)return;human(0,dx>0?'right':'left',true)});
  reset();draw();lobby();
  root.__cyc={keys:function(){return KEYS},g3:g3,dm:DM,respawn:respawnAt,step:step,turn:turn,draw:draw,cycles:function(){return cycles},cfg:CFG,levels:LEVELS,level:function(i){levelIx=i;start(3);countdown=0;countEl.hidden=true},state:function(){return{over:over,clock:clock,best:BEST,mode:mode}},go:function(m){start(m||1);countdown=0;countEl.hidden=true}};
  return {stop:function(){running=false;cancelAnimationFrame(raf);if(g3)g3.stop();document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);humSet(false,0);try{if(audio)audio.close()}catch(e){}}};
};
