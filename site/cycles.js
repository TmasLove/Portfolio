/* Light Cycles — a small local Armagetron-style game, written for this desktop.
   Top-down grid arena, glowing trails, hard 90° turns, three bots that read the walls, and the Armagetron
   "grind": ride close to a wall and you go faster. Last cycle standing wins the round. Own code, no libraries. */
window.initCycles=function(root){
  root.innerHTML='<div class="cyc"><canvas class="cyc-canvas" width="720" height="720" aria-label="Light Cycles arena"></canvas>'+
    '<div class="cyc-hud"><span class="cyc-score"></span><span class="cyc-round"></span></div>'+
    '<div class="cyc-ui"><div class="cyc-menu"><h2>LIGHT CYCLES</h2><p>Arrows or WASD to turn. Hug a wall to go faster. Don\'t hit anything.</p><p class="cyc-small">Inspired by Armagetron Advanced.</p><button class="cyc-btn" data-start>Enter the grid</button></div></div></div>';
  var canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d'),ui=root.querySelector('.cyc-ui'),menu=root.querySelector('.cyc-menu'),hudS=root.querySelector('.cyc-score'),hudR=root.querySelector('.cyc-round');
  var W=canvas.width,H=canvas.height,CELL=6,COLS=W/CELL,ROWS=H/CELL;
  var COLORS=['#00E0C6','#FF5F57','#FEBC2E','#8B7DFF'];
  var grid,cycles,running=false,raf=null,acc=0,last=0,round=0,score=[0,0,0,0],over=false,BASE=9;
  var DIRS=[[1,0],[0,1],[-1,0],[0,-1]];
  function reset(){
    grid=new Uint8Array(COLS*ROWS);
    var starts=[[COLS*.2|0,ROWS*.5|0,0],[COLS*.8|0,ROWS*.5|0,2],[COLS*.5|0,ROWS*.2|0,1],[COLS*.5|0,ROWS*.8|0,3]];
    cycles=starts.map(function(s,i){return{x:s[0],y:s[1],d:s[2],alive:true,bot:i>0,color:COLORS[i],speed:BASE,acc:0,turnLock:0,name:i===0?'You':'Bot '+i}});
    cycles.forEach(function(c){grid[c.y*COLS+c.x]=1});
    over=false;acc=0;
  }
  function free(x,y){return x>=0&&y>=0&&x<COLS&&y<ROWS&&!grid[y*COLS+x]}
  function ahead(c,d,n){var dx=DIRS[d][0],dy=DIRS[d][1],k=0;while(k<n&&free(c.x+dx*(k+1),c.y+dy*(k+1)))k++;return k}
  function think(c){
    var f=ahead(c,c.d,40),l=(c.d+3)%4,r=(c.d+1)%4,fl=ahead(c,l,40),fr=ahead(c,r,40);
    var me=cycles[0];
    if(f<6||(f<18&&Math.random()<.08)){ if(fl===fr&&fl===0)return; c.d=fl>fr?l:(fr>fl?r:(Math.random()<.5?l:r)); return }
    /* hunt: turn toward the player when the lane is open, rarely */
    if(Math.random()<.012&&me.alive){var want=Math.abs(me.x-c.x)>Math.abs(me.y-c.y)?(me.x>c.x?0:2):(me.y>c.y?1:3);if(want===l&&fl>14)c.d=l;else if(want===r&&fr>14)c.d=r}
    else if(Math.random()<.006){if(fl>20&&fl>=fr)c.d=l;else if(fr>20)c.d=r}
  }
  function step(){
    cycles.forEach(function(c){
      if(!c.alive)return;
      if(c.bot)think(c);
      /* grind: a wall right beside you speeds you up, like Armagetron */
      var side1=(c.d+1)%4,side2=(c.d+3)%4,near=!free(c.x+DIRS[side1][0],c.y+DIRS[side1][1])||!free(c.x+DIRS[side2][0],c.y+DIRS[side2][1]);
      c.speed=Math.min(BASE*1.9,Math.max(BASE,c.speed+(near?.35:-.25)));
      c.acc+=c.speed/BASE;
      while(c.acc>=1&&c.alive){
        c.acc-=1;var nx=c.x+DIRS[c.d][0],ny=c.y+DIRS[c.d][1];
        if(!free(nx,ny)){c.alive=false;boom(c);break}
        c.x=nx;c.y=ny;grid[ny*COLS+nx]=1;c.trail=(c.trail||[]);c.trail.push(nx,ny);
      }
    });
    var alive=cycles.filter(function(c){return c.alive});
    if(alive.length<=1&&!over){over=true;var w=alive[0];if(w)score[cycles.indexOf(w)]++;round++;setTimeout(function(){endRound(w)},700)}
  }
  var booms=[];
  function boom(c){for(var i=0;i<26;i++)booms.push({x:c.x*CELL,y:c.y*CELL,vx:(Math.random()-.5)*6,vy:(Math.random()-.5)*6,t:1,c:c.color})}
  function draw(){
    ctx.fillStyle='#07090c';ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='rgba(0,224,198,.09)';ctx.lineWidth=1;ctx.beginPath();for(var g=0;g<=W;g+=CELL*6){ctx.moveTo(g+.5,0);ctx.lineTo(g+.5,H);ctx.moveTo(0,g+.5);ctx.lineTo(W,g+.5)}ctx.stroke();
    ctx.strokeStyle='rgba(0,224,198,.35)';ctx.lineWidth=2;ctx.strokeRect(1,1,W-2,H-2);
    cycles.forEach(function(c){
      var t=c.trail||[];if(!t.length)return;
      ctx.shadowColor=c.color;ctx.shadowBlur=c.alive?10:0;ctx.strokeStyle=c.color;ctx.lineWidth=CELL-2;ctx.lineJoin='miter';ctx.beginPath();
      ctx.moveTo(t[0]*CELL+CELL/2,t[1]*CELL+CELL/2);for(var i=2;i<t.length;i+=2)ctx.lineTo(t[i]*CELL+CELL/2,t[i+1]*CELL+CELL/2);ctx.stroke();
      ctx.shadowBlur=0;
      if(c.alive){ctx.fillStyle='#fff';ctx.fillRect(c.x*CELL,c.y*CELL,CELL,CELL)}
    });
    booms=booms.filter(function(b){return b.t>0});booms.forEach(function(b){b.x+=b.vx;b.y+=b.vy;b.t-=.03;ctx.globalAlpha=Math.max(0,b.t);ctx.fillStyle=b.c;ctx.fillRect(b.x,b.y,3,3)});ctx.globalAlpha=1;
    hudS.textContent=cycles.map(function(c,i){return c.name+' '+score[i]}).join('   ');
    hudR.textContent='Round '+(round+1)+(cycles[0].speed>BASE*1.3?'  ·  GRINDING':'');
  }
  function frame(ts){
    if(!running)return;
    if(!last)last=ts;var dt=Math.min(50,ts-last);last=ts;acc+=dt;
    while(acc>=1000/60){step();acc-=1000/60}
    draw();raf=requestAnimationFrame(frame);
  }
  function endRound(winner){
    running=false;ui.hidden=false;
    menu.innerHTML='<h2>'+(winner?(winner.bot?winner.name+' takes it':'You win the round'):'Everyone crashed')+'</h2><p>'+cycles.map(function(c,i){return c.name+': '+score[i]}).join(' · ')+'</p><button class="cyc-btn" data-start>Next round</button>';
    menu.querySelector('[data-start]').addEventListener('click',start);
  }
  function start(){reset();ui.hidden=true;running=true;last=0;canvas.focus();cancelAnimationFrame(raf);raf=requestAnimationFrame(frame)}
  function turn(dir){var me=cycles&&cycles[0];if(!me||!me.alive||!running)return;if(dir==='left')me.d=(me.d+3)%4;if(dir==='right')me.d=(me.d+1)%4;if(dir==='up'&&me.d!==1)me.d=3;if(dir==='down'&&me.d!==3)me.d=1;if(dir==='aleft'&&me.d!==0)me.d=2;if(dir==='aright'&&me.d!==2)me.d=0}
  function kd(e){var k=e.key;var map={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'aleft',ArrowRight:'aright',w:'up',s:'down',a:'aleft',d:'aright',W:'up',S:'down',A:'aleft',D:'aright'};if(map[k]){turn(map[k]);e.preventDefault()}}
  document.addEventListener('keydown',kd);
  var tx=0,ty=0;canvas.addEventListener('touchstart',function(e){tx=e.touches[0].clientX;ty=e.touches[0].clientY},{passive:true});
  canvas.addEventListener('touchend',function(e){var dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;if(Math.abs(dx)<12&&Math.abs(dy)<12)return;turn(Math.abs(dx)>Math.abs(dy)?(dx>0?'aright':'aleft'):(dy>0?'down':'up'))});
  root.querySelector('[data-start]').addEventListener('click',start);
  reset();draw();
  return {stop:function(){running=false;cancelAnimationFrame(raf);document.removeEventListener('keydown',kd)}};
};
