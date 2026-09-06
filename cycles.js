/* Light Cycles — an Armagetron-style arena, written for this desktop. Own code, no libraries.
   Movement model (tuned the way modern light-cycle arenas play): speed drifts back toward a base value,
   every turn costs 5% speed and has a 50 ms delay, a brake with a recharging meter, boost that grows the
   closer you run parallel to a wall, a shield that drains while you touch a wall and refills when clear,
   trails of finite length so the grid keeps opening up. Solo vs three bots, or 2 players on one keyboard. */
window.initCycles=function(root){
  root.innerHTML='<div class="cyc"><canvas class="cyc-canvas" width="900" height="640" aria-label="Light Cycles arena"></canvas>'+
    '<div class="cyc-hud"><span class="cyc-score"></span><span class="cyc-round"></span></div>'+
    '<div class="cyc-meters"><span class="cyc-meter"><i class="cyc-shield"></i></span><span class="cyc-meter"><i class="cyc-brake"></i></span></div>'+
    '<div class="cyc-count" hidden></div>'+
    '<div class="cyc-ui"><div class="cyc-menu"><h2>LIGHT CYCLES</h2><p>Steer with the arrow keys (or WASD). Space brakes. Run close and parallel to a wall to boost. Touching a wall drains your shield — get off it before it empties.</p><p class="cyc-small">M mutes · Trails fade behind you, so the grid keeps opening up · Inspired by Armagetron Advanced</p><div class="cyc-opts"><button class="cyc-btn" data-start="1">Solo vs 3 bots</button><button class="cyc-btn" data-start="2">2 players</button></div><p class="cyc-small">2 players: WASD + Space vs arrows + Shift.</p></div></div></div>';
  var canvas=root.querySelector('.cyc-canvas'),ctx=canvas.getContext('2d');
  var ui=root.querySelector('.cyc-ui'),menu=root.querySelector('.cyc-menu'),hudS=root.querySelector('.cyc-score'),hudR=root.querySelector('.cyc-round'),countEl=root.querySelector('.cyc-count'),shieldEl=root.querySelector('.cyc-shield'),brakeEl=root.querySelector('.cyc-brake');
  var W=canvas.width,H=canvas.height,A=1000;
  var CFG={base:150,min:88,max:375,natural:75,turnFactor:.95,turnDelay:.05,brake:50,brakeMax:1,brakeDrain:1,brakeRegen:.5,wallLen:1750,shieldMax:2.5,shieldDrain:3,shieldRegen:5,boostAccel:110,boostOffset:5,boostNear:22,rimMul:.5,enemyMul:1.1};
  var COLORS=['#00E0C6','#FF5F57','#FEBC2E','#8B7DFF'],NAMES=['You','Bot 1','Bot 2','Bot 3'];
  var DIRS=[[1,0],[0,1],[-1,0],[0,-1]];
  var cycles=[],running=false,raf=null,last=0,round=0,score=[0,0,0,0],over=false,mode=1,muted=false,booms=[],countdown=0,now=0;
  var audio=null,hum=null,humGain=null;
  function sound(){if(muted)return;try{if(!audio)audio=new (window.AudioContext||window.webkitAudioContext)();if(!hum){hum=audio.createOscillator();hum.type='sawtooth';humGain=audio.createGain();humGain.gain.value=0;var f=audio.createBiquadFilter();f.type='lowpass';f.frequency.value=600;hum.connect(f);f.connect(humGain);humGain.connect(audio.destination);hum.start()}if(audio.state==='suspended')audio.resume()}catch(e){}}
  function humSet(on,speed){if(!humGain)return;try{humGain.gain.linearRampToValueAtTime(on&&!muted?.05:0,audio.currentTime+.08);hum.frequency.linearRampToValueAtTime(60+speed*.4,audio.currentTime+.08)}catch(e){}}
  function blip(freq,dur){if(!audio||muted)return;try{var o=audio.createOscillator(),g=audio.createGain();o.type='square';o.frequency.value=freq;g.gain.value=.05;o.connect(g);g.connect(audio.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+dur);o.stop(audio.currentTime+dur)}catch(e){}}

  function mk(i,x,y,d,human){return{i:i,x:x,y:y,d:d,alive:true,human:human,color:COLORS[i],name:NAMES[i],speed:CFG.base,shield:CFG.shieldMax,brakeCharge:CFG.brakeMax,braking:false,lastTurn:-1,trail:[[x,y]],len:0,grinding:false,touching:false}}
  function reset(){
    var m=A*.18;
    cycles=[mk(0,m,A/2,0,true),mk(1,A-m,A/2,2,mode===2),mk(2,A/2,m,1,false),mk(3,A/2,A-m,3,false)];
    cycles[1].name=mode===2?'P2':'Bot 1';over=false;booms=[];
  }
  /* walls: every trail segment (axis-aligned) plus the head segment of each cycle */
  function segments(){var out=[];cycles.forEach(function(c){var t=c.trail;for(var i=1;i<t.length;i++)out.push([t[i-1][0],t[i-1][1],t[i][0],t[i][1],c,false]);out.push([t[t.length-1][0],t[t.length-1][1],c.x,c.y,c,true])});return out}
  /* distance along direction d from (x,y) to the first wall; returns {d, seg} — the rim counts as a wall */
  function ray(x,y,d,self,maxD,segs){
    var dx=DIRS[d][0],dy=DIRS[d][1],best=maxD,hitSeg='rim';
    var rim=dx>0?A-x:dx<0?x:dy>0?A-y:y;if(rim<best){best=rim;hitSeg='rim'}
    for(var i=0;i<segs.length;i++){var s=segs[i];
      if(s[5]&&s[4]===self)continue;
      var sx0=Math.min(s[0],s[2]),sx1=Math.max(s[0],s[2]),sy0=Math.min(s[1],s[3]),sy1=Math.max(s[1],s[3]),t=-1;
      if(dx){ if(y<sy0-1.2||y>sy1+1.2)continue; if(sx0===sx1)t=(sx0-x)*dx; else if(Math.abs(y-sy0)<=1.2)t=dx>0?sx0-x:x-sx1; }
      else{ if(x<sx0-1.2||x>sx1+1.2)continue; if(sy0===sy1)t=(sy0-y)*dy; else if(Math.abs(x-sx0)<=1.2)t=dy>0?sy0-y:y-sy1; }
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
    if(!c.alive||now-c.lastTurn<CFG.turnDelay)return;
    var nd=side==='left'?(c.d+3)%4:side==='right'?(c.d+1)%4:side;
    if(nd===c.d||nd===(c.d+2)%4)return;
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
    now+=dt;var segs=segments();
    cycles.forEach(function(c){
      if(!c.alive)return;
      if(!c.human)think(c,segs,dt);
      /* brake */
      var braking=c.braking&&c.brakeCharge>0;
      if(braking){c.speed-=CFG.brake*dt;c.brakeCharge=Math.max(0,c.brakeCharge-CFG.brakeDrain*dt)}else if(!c.braking)c.brakeCharge=Math.min(CFG.brakeMax,c.brakeCharge+CFG.brakeRegen*dt);
      /* boost from a parallel wall on either side: stronger the closer, weaker on the rim */
      var boost=0;[(c.d+1)%4,(c.d+3)%4].forEach(function(sd){var rr=ray(c.x,c.y,sd,c,CFG.boostNear,segs);if(rr.d<CFG.boostNear){var mul=rr.seg==='rim'?CFG.rimMul:(rr.seg[4]===c?1:CFG.enemyMul);boost+=CFG.boostAccel*mul*(1/(rr.d+CFG.boostOffset)-1/(CFG.boostOffset+CFG.boostNear))*CFG.boostOffset*4}});
      c.grinding=boost>0;
      c.speed+=boost*dt;
      var l=c.speed-CFG.base;
      if(l>0)c.speed-=.1*l*dt;else if(l<0&&!braking)c.speed+=Math.min(-l,CFG.natural)*dt;
      c.speed=Math.max(CFG.min,Math.min(CFG.max,c.speed));
      /* move; a wall ahead drains the shield instead of killing outright */
      var dist=c.speed*dt,rr2=ray(c.x,c.y,c.d,c,dist+2.5,segs);
      if(rr2.d<=dist+1){
        c.x+=DIRS[c.d][0]*Math.max(0,rr2.d-1.2);c.y+=DIRS[c.d][1]*Math.max(0,rr2.d-1.2);
        c.touching=true;c.shield-=CFG.shieldDrain*dt;
        if(c.shield<=0){c.alive=false;boom(c);if(c.human)blip(90,.4)}
      }else{c.x+=DIRS[c.d][0]*dist;c.y+=DIRS[c.d][1]*dist;c.touching=false;c.shield=Math.min(CFG.shieldMax,c.shield+CFG.shieldMax/CFG.shieldRegen*dt)}
      trimTrail(c);
    });
    var alive=cycles.filter(function(c){return c.alive});
    if(!over&&alive.length<=1){over=true;var w=alive[0];if(w)score[w.i]++;round++;humSet(false,0);setTimeout(function(){endRound(w)},900)}
    else if(!over&&mode===1&&!cycles[0].alive){over=true;round++;humSet(false,0);setTimeout(function(){endRound(null,true)},900)}
  }
  function boom(c){for(var i=0;i<40;i++)booms.push({x:c.x,y:c.y,vx:(Math.random()-.5)*160,vy:(Math.random()-.5)*160,t:1,c:c.color})}

  function draw(){
    ctx.fillStyle='#07090c';ctx.fillRect(0,0,W,H);
    var s=Math.min(W,H)/A*.96,ox=(W-A*s)/2,oy=(H-A*s)/2;
    ctx.strokeStyle='rgba(0,224,198,.1)';ctx.lineWidth=1;ctx.beginPath();for(var g=0;g<=A;g+=50){ctx.moveTo(ox+g*s,oy);ctx.lineTo(ox+g*s,oy+A*s);ctx.moveTo(ox,oy+g*s);ctx.lineTo(ox+A*s,oy+g*s)}ctx.stroke();
    ctx.strokeStyle='rgba(0,224,198,.45)';ctx.lineWidth=2;ctx.strokeRect(ox,oy,A*s,A*s);
    cycles.forEach(function(c){var t=c.trail;ctx.shadowColor=c.color;ctx.shadowBlur=c.alive?(c.grinding?16:9):0;ctx.strokeStyle=c.color;ctx.globalAlpha=c.alive?1:.3;ctx.lineWidth=3;ctx.lineJoin='miter';ctx.beginPath();ctx.moveTo(ox+t[0][0]*s,oy+t[0][1]*s);for(var i=1;i<t.length;i++)ctx.lineTo(ox+t[i][0]*s,oy+t[i][1]*s);ctx.lineTo(ox+c.x*s,oy+c.y*s);ctx.stroke();ctx.shadowBlur=0;ctx.globalAlpha=1;
      if(c.alive){ctx.fillStyle=c.touching?c.color:'#fff';ctx.fillRect(ox+c.x*s-3,oy+c.y*s-3,6,6);if(c.touching){ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(ox+c.x*s,oy+c.y*s,7+Math.random()*3,0,Math.PI*2);ctx.stroke()}}});
    booms=booms.filter(function(b){return b.t>0});booms.forEach(function(b){b.x+=b.vx*.016;b.y+=b.vy*.016;b.t-=.025;ctx.globalAlpha=Math.max(0,b.t);ctx.fillStyle=b.c;ctx.fillRect(ox+b.x*s,oy+b.y*s,3,3)});ctx.globalAlpha=1;
    var me=cycles[0];
    hudS.textContent=cycles.map(function(c){return c.name+' '+score[c.i]}).join('   ');
    hudR.textContent=(me.alive?Math.round(me.speed)+' km/h'+(me.grinding?'  BOOST':'')+(me.braking&&me.brakeCharge>0?'  BRAKE':'')+(me.touching?'  SHIELD':''):'crashed')+'   ·   round '+(round+1);
    shieldEl.style.width=(me.shield/CFG.shieldMax*100)+'%';shieldEl.style.background=me.shield<CFG.shieldMax*.35?'#FF5F57':'#00E0C6';brakeEl.style.width=(me.brakeCharge/CFG.brakeMax*100)+'%';
  }
  function frame(ts){
    if(!running)return;
    if(!last)last=ts;var dt=Math.min(.05,(ts-last)/1000);last=ts;
    if(countdown>0){countdown-=dt;countEl.hidden=false;countEl.textContent=countdown>0?Math.ceil(countdown):'GO';if(countdown<=0){setTimeout(function(){countEl.hidden=true},400);humSet(true,CFG.base)}draw();raf=requestAnimationFrame(frame);return}
    step(dt);draw();var me=cycles[0];humSet(me.alive,me.speed);
    raf=requestAnimationFrame(frame);
  }
  function endRound(winner,youDied){
    running=false;ui.hidden=false;humSet(false,0);
    menu.innerHTML='<h2>'+(winner?(winner.human?winner.name+(winner.i===0?' win':' wins')+' the round':winner.name+' takes it'):(youDied?'You crashed':'Everyone crashed'))+'</h2><p>'+cycles.map(function(c){return c.name+': '+score[c.i]}).join(' · ')+'</p><div class="cyc-opts"><button class="cyc-btn" data-start="'+mode+'">Next round</button><button class="cyc-btn" data-start="'+(mode===1?2:1)+'">'+(mode===1?'2 players':'Solo vs bots')+'</button></div>';
    menu.querySelectorAll('[data-start]').forEach(function(b){b.addEventListener('click',function(){start(+b.dataset.start)})});
  }
  function start(m){if(m!==mode){score=[0,0,0,0];round=0}mode=m;reset();ui.hidden=true;running=true;last=0;countdown=3;now=0;sound();blip(440,.1);canvas.focus();cancelAnimationFrame(raf);raf=requestAnimationFrame(frame)}
  function human(i,act,on){var c=cycles[i];if(!c||!c.alive||!running||countdown>0)return;if(act==='brake'){c.braking=on;return}if(on)turn(c,act)}
  /* arrow keys steer by direction: up/down/left/right on the grid. WASD does the same. Space brakes. */
  var ARROWS={ArrowRight:0,ArrowDown:1,ArrowLeft:2,ArrowUp:3},WASD={d:0,s:1,a:2,w:3,D:0,S:1,A:2,W:3};
  var P1=Object.assign({' ':'brake'},ARROWS,WASD),P2=Object.assign({Enter:'brake',Shift:'brake'},ARROWS),P1two=Object.assign({' ':'brake'},WASD);
  function key(e,on){
    var k=e.key;
    if(on&&(k==='m'||k==='M')){muted=!muted;humSet(running&&!muted,cycles[0]?cycles[0].speed:CFG.base);return}
    if(mode===1){if(P1[k]!==undefined){human(0,P1[k],on);e.preventDefault()}return}
    if(P1two[k]!==undefined){human(0,P1two[k],on);e.preventDefault()}if(P2[k]!==undefined){human(1,P2[k],on);e.preventDefault()}
  }
  function kd(e){key(e,true)}function ku(e){key(e,false)}
  document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
  var tx=0;canvas.addEventListener('touchstart',function(e){tx=e.touches[0].clientX},{passive:true});
  canvas.addEventListener('touchend',function(e){var dx=e.changedTouches[0].clientX-tx;if(Math.abs(dx)<10)return;human(0,dx>0?'right':'left',true)});
  root.querySelectorAll('[data-start]').forEach(function(b){b.addEventListener('click',function(){start(+b.dataset.start)})});
  reset();draw();
  root.__cyc={step:step,turn:turn,draw:draw,cycles:function(){return cycles},cfg:CFG,go:function(m){start(m||1);countdown=0;countEl.hidden=true}};
  return {stop:function(){running=false;cancelAnimationFrame(raf);document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);humSet(false,0);try{if(audio)audio.close()}catch(e){}}};
};
