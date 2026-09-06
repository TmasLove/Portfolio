/* Brick Breaker — Tommy's 2015 canvas game (TmasLove/Brick-), developed further for the desktop.
   Same colours and messages as the original. New: five levels with tougher bricks, drops (multi-ball, wide paddle,
   slow), the chaos ball that comes back from the top when it is lost, a local best, and a public high-score board
   on the wall. Arrows, mouse or touch move the paddle; Space launches. */
window.initBrick=function(root){
  root.innerHTML='<div class="brick"><canvas class="brick-canvas" width="700" height="525" aria-label="Brick Breaker"></canvas>'+
    '<div class="brick-ui"><div class="brick-menu"><p class="how"><strong>How to play:</strong></p><p><strong>Left/Right:</strong> arrow keys, mouse or finger · <strong>Space:</strong> launch</p><p class="brick-best"></p></div>'+
    '<div class="brick-start"><button class="brick-btn" data-start><span class="how">Start</span></button> <button class="brick-btn" data-scores><span class="how">High scores</span></button></div>'+
    '<div class="brick-board" hidden></div></div></div>';
  var canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d'),ui=root.querySelector('.brick-ui'),menu=root.querySelector('.brick-menu'),startBtn=root.querySelector('[data-start]'),board=root.querySelector('.brick-board'),bestEl=root.querySelector('.brick-best');
  var bg=new Image();bg.src='/assets/brick/test-background.jpg';
  var W=canvas.width,H=canvas.height,R=10,PH=12;
  var COL={brick:'#62CB83',brick2:'#F2B07A',brick3:'#FF5F57',paddle:'#6ECF9E',text:'#C6D3EC',chaos:'#F3CEF6'};
  var LEVELS=[
    {name:'Level 1',rows:3,cols:8,hp:function(c,r){return 1},speed:1},
    {name:'Level 2',rows:4,cols:8,hp:function(c,r){return c===0?2:1},speed:1.08},
    {name:'Level 3',rows:5,cols:8,hp:function(c,r){return (c+r)%2?1:2},speed:1.16},
    {name:'Level 4',rows:5,cols:8,hp:function(c,r){return Math.abs(r-3.5)<1.5&&c<3?3:(c<2?2:1)},speed:1.24},
    {name:'Level 5',rows:6,cols:8,hp:function(c,r){return c===0?3:c<3?2:1},speed:1.34}
  ];
  var BW=75,BH=20,BP=10,BOT=30,BOL=10;
  var level,bricks,balls,chaos,drops,paddleX,paddleW,score,lives,running=false,raf=null,over=false,launched,slowT,wideT,left=false,right=false,chaosDue,hue=180,last=0,levelFlash=0;
  var best=+(function(){try{return localStorage.getItem('brick.best')||0}catch(e){return 0}})();
  function showBest(){bestEl.textContent=best?'Your best: '+best:''}
  function buildLevel(n){
    var L=LEVELS[n];bricks=[];
    for(var c=0;c<L.rows;c++)for(var r=0;r<L.cols;r++){var hp=L.hp(c,r);bricks.push({x:r*(BW+BP)+BOL,y:c*(BH+BP)+BOT,hp:hp,max:hp})}
    balls=[newBall()];chaos=[];drops=[];launched=false;chaosDue=6;levelFlash=1.6;
  }
  function newBall(){var s=2.6*LEVELS[level].speed;return{x:W/2,y:H-30,dx:s*(Math.random()<.5?1:-1),dy:-s,main:true}}
  function newChaos(){var s=2.4*LEVELS[level].speed;return{x:60+Math.random()*(W-120),y:60,dx:s*(Math.random()<.5?1:-1),dy:s,main:false,wait:0}}
  function reset(){level=0;score=0;lives=3;over=false;paddleW=80;slowT=0;wideT=0;buildLevel(0);paddleX=(W-paddleW)/2}
  function finish(msg,won){
    running=false;over=true;ui.hidden=false;
    if(score>best){best=score;try{localStorage.setItem('brick.best',best)}catch(e){}}
    menu.innerHTML='<p class="how"><strong>'+msg+'</strong></p><p>Score: '+score+' · '+LEVELS[level].name+(score>=best&&score>0?' · new best':'')+'</p>'+
      (score>0?'<p class="brick-post"><input class="brick-name" maxlength="16" placeholder="Your initials" aria-label="Your name"><button class="brick-btn" data-post><span class="how">Post score</span></button><span class="brick-msg"></span></p>':'');
    startBtn.querySelector('.how').textContent='Play again';
    var pb=menu.querySelector('[data-post]');
    if(pb)pb.addEventListener('click',function(){pb.disabled=true;var nm=menu.querySelector('.brick-name').value;TRWall.postScore(nm,score,level+1).then(function(r){menu.querySelector('.brick-msg').textContent=r.online?' On the board.':' Board offline — kept on this device.';showBoard()}).catch(function(e){menu.querySelector('.brick-msg').textContent=' '+(e.message||'Could not post.');pb.disabled=false})});
  }
  function showBoard(){board.hidden=false;board.innerHTML='<p class="how"><strong>High scores</strong></p><p>Loading…</p>';TRWall.scores().then(function(res){var rows=res.items.slice(0,10);board.innerHTML='<p class="how"><strong>High scores</strong>'+(res.online?'':' (offline — this device)')+'</p>'+(rows.length?'<ol>'+rows.map(function(s){return '<li><b>'+(s.name||'???').replace(/</g,'&lt;')+'</b> '+s.score+' <small>L'+(s.level||1)+'</small></li>'}).join('')+'</ol>':'<p>No scores yet. Yours could be first.</p>')})}
  function hitBrick(b){
    for(var i=0;i<bricks.length;i++){var k=bricks[i];
      if(b.x+R>k.x&&b.x-R<k.x+BW&&b.y+R>k.y&&b.y-R<k.y+BH){
        var ox=Math.min(b.x+R-k.x,k.x+BW-(b.x-R)),oy=Math.min(b.y+R-k.y,k.y+BH-(b.y-R));
        if(ox<oy)b.dx=-b.dx;else b.dy=-b.dy;
        k.hp--;score+=1;
        if(k.hp<=0){bricks.splice(i,1);score+=k.max>1?k.max*2:0;if(Math.random()<.14)drops.push({x:k.x+BW/2,y:k.y,t:['multi','wide','slow'][Math.floor(Math.random()*3)],vy:1.6})}
        if(!bricks.length){if(level<LEVELS.length-1){level++;buildLevel(level);paddleX=(W-paddleW)/2}else finish('WINNER WINNER, CHICKEN DINNER!',true)}
        return;
      }
    }
  }
  function stepBall(b,sp){
    var dx=b.dx*sp,dy=b.dy*sp;
    if(b.x+dx>W-R||b.x+dx<R)b.dx=-b.dx;
    if(b.y+dy<R)b.dy=-b.dy;
    else if(b.y+dy>H-R-PH&&b.x>paddleX-R&&b.x<paddleX+paddleW+R&&b.dy>0){
      /* where the ball meets the bar decides where it goes: centre = straight up, edges = 65° out, like a real Breakout */
      var rel=Math.max(-1,Math.min(1,(b.x-(paddleX+paddleW/2))/(paddleW/2)));
      var ang=rel*(65*Math.PI/180),v=Math.hypot(b.dx,b.dy);
      b.dx=v*Math.sin(ang);b.dy=-v*Math.cos(ang);b.y=H-R-PH-1;
    }
    b.x+=b.dx*sp;b.y+=b.dy*sp;
    hitBrick(b);
    return b.y>H+R; /* lost */
  }
  function frame(ts){
    if(!running)return;
    var dt=last?Math.min(2,(ts-last)/16.67):1;last=ts;
    var sp=(slowT>0?.6:1)*dt;
    ctx.clearRect(0,0,W,H);if(bg.complete&&bg.naturalWidth)ctx.drawImage(bg,0,0,W,H);
    if(right&&paddleX<W-paddleW)paddleX+=7*dt;else if(left&&paddleX>0)paddleX-=7*dt;
    if(!launched){balls[0].x=paddleX+paddleW/2;balls[0].y=H-PH-R-1}
    bricks.forEach(function(k){ctx.fillStyle=k.hp>=3?COL.brick3:k.hp===2?COL.brick2:COL.brick;ctx.fillRect(k.x,k.y,BW,BH);if(k.max>1){ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(k.x,k.y+BH-4,BW*(k.hp/k.max),4)}});
    hue=(hue+2)%360;
    if(launched){
      for(var i=balls.length-1;i>=0;i--)if(stepBall(balls[i],sp))balls.splice(i,1);
      chaos.forEach(function(c){if(c.wait>0){c.wait-=dt/60;return}if(stepBall(c,sp)){var n=newChaos();c.x=n.x;c.y=n.y;c.dx=n.dx;c.dy=n.dy;c.wait=1.2}});
      if(!balls.length){lives--;if(!lives)return finish('GAME OVER');balls=[newBall()];launched=false;paddleX=(W-paddleW)/2;drops=[]}
      if(score>=chaosDue&&chaos.length<1+Math.floor(level/2)){chaos.push(newChaos());chaosDue+=14}
    }
    balls.forEach(function(b){ctx.beginPath();ctx.arc(b.x,b.y,R,0,Math.PI*2);ctx.fillStyle='hsl('+hue+', 50%, 50%)';ctx.fill()});
    chaos.forEach(function(c){if(c.wait>0)return;ctx.beginPath();ctx.arc(c.x,c.y,R,0,Math.PI*2);ctx.fillStyle=COL.chaos;ctx.fill()});
    for(var j=drops.length-1;j>=0;j--){var d=drops[j];d.y+=d.vy*dt;ctx.fillStyle=d.t==='multi'?'#fff':d.t==='wide'?COL.paddle:COL.text;ctx.fillRect(d.x-9,d.y-6,18,12);ctx.fillStyle='#0F2A2E';ctx.font='bold 9px Arial';ctx.textAlign='center';ctx.fillText(d.t==='multi'?'x3':d.t==='wide'?'W':'S',d.x,d.y+3);ctx.textAlign='left';
      if(d.y>H-PH-6&&d.x>paddleX&&d.x<paddleX+paddleW){drops.splice(j,1);if(d.t==='multi'){var src=balls[0]||newBall();for(var k=0;k<2;k++)balls.push({x:src.x,y:src.y,dx:src.dx*(k?-1:1)+(k?0:1.2),dy:-Math.abs(src.dy)-.4,main:true});launched=true}if(d.t==='wide'){wideT=10;paddleW=120}if(d.t==='slow')slowT=6}
      else if(d.y>H+10)drops.splice(j,1)}
    if(wideT>0){wideT-=dt/60;if(wideT<=0)paddleW=80}if(slowT>0)slowT-=dt/60;
    ctx.fillStyle=COL.paddle;ctx.fillRect(paddleX,H-PH,paddleW,PH);
    ctx.font='16px Arial';ctx.fillStyle=COL.text;ctx.fillText('Score: '+score,8,20);ctx.fillText('Lives: '+lives,W-65,20);ctx.textAlign='center';ctx.fillText(LEVELS[level].name+(best?'  ·  best '+best:''),W/2,20);
    if(levelFlash>0){levelFlash-=dt/60;ctx.globalAlpha=Math.min(1,levelFlash);ctx.font='bold 34px Arial';ctx.fillText(LEVELS[level].name,W/2,H/2);ctx.globalAlpha=1}
    if(!launched){ctx.font='14px Arial';ctx.fillText('Space or tap to launch',W/2,H-40)}
    ctx.textAlign='left';
    raf=requestAnimationFrame(frame);
  }
  function start(){reset();ui.hidden=true;board.hidden=true;running=true;last=0;canvas.focus();cancelAnimationFrame(raf);raf=requestAnimationFrame(frame)}
  function launch(){if(running&&!launched)launched=true}
  function kd(e){if(e.key==='ArrowRight'){right=true;e.preventDefault()}else if(e.key==='ArrowLeft'){left=true;e.preventDefault()}else if(e.key===' '&&running){launch();e.preventDefault()}}
  function ku(e){if(e.key==='ArrowRight')right=false;else if(e.key==='ArrowLeft')left=false}
  function pointer(e){var r=canvas.getBoundingClientRect();var t=e.touches?e.touches[0]:e;paddleX=Math.max(0,Math.min(W-paddleW,(t.clientX-r.left)*(W/r.width)-paddleW/2));if(e.touches)e.preventDefault()}
  startBtn.addEventListener('click',start);
  root.querySelector('[data-scores]').addEventListener('click',function(){if(board.hidden)showBoard();else board.hidden=true});
  canvas.tabIndex=0;canvas.addEventListener('keydown',kd);canvas.addEventListener('keyup',ku);
  document.addEventListener('keydown',function(e){if(e.target!==canvas)kd(e)});document.addEventListener('keyup',function(e){if(e.target!==canvas)ku(e)});
  canvas.addEventListener('mousemove',function(e){if(running)pointer(e)});canvas.addEventListener('mousedown',function(){canvas.focus();launch()});
  canvas.addEventListener('touchmove',pointer,{passive:false});canvas.addEventListener('touchstart',function(e){pointer(e);launch()},{passive:false});
  ctx.fillStyle='#0F2A2E';ctx.fillRect(0,0,W,H);showBest();
  root.__brick={start:start,launch:launch,tick:function(n){for(var i=0;i<(n||1);i++){running=true;cancelAnimationFrame(raf);var t=(last||0)+16.67;raf=null;frame(t);cancelAnimationFrame(raf)}},state:function(){return{balls:balls.length,chaos:chaos.length,bricks:bricks.length,score:score,lives:lives,level:level,launched:launched,over:over,paddleW:paddleW}},set:function(f){f({balls:balls,chaos:chaos,bricks:bricks,drops:drops,setScore:function(v){score=v},setLevel:function(n){level=n;buildLevel(n)}})}};
  return {stop:function(){running=false;cancelAnimationFrame(raf)}};
};
