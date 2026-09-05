/* Brick Breaker — Tommy's 2015 canvas game (TmasLove/Brick-), revived inside the desktop.
   Same rules, colours and messages as the original: three lives, green bricks, a random-hue ball,
   and a second "chaos" ball once you have six points. Runs on requestAnimationFrame instead of
   setInterval so it stops cleanly when the window closes. */
window.initBrick=function(root){
  root.innerHTML='<div class="brick"><canvas class="brick-canvas" width="700" height="525" aria-label="Brick Breaker"></canvas>'+
    '<div class="brick-ui"><div class="brick-menu"><p class="how"><strong>How to play:</strong></p><p><strong>Left/Right:</strong> arrow keys · or drag on the board</p></div>'+
    '<div class="brick-start"><button class="brick-btn" data-start><span class="how">Start</span></button></div></div></div>';
  var canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d'),ui=root.querySelector('.brick-ui'),startBtn=root.querySelector('[data-start]');
  var bg=new Image();bg.src='/assets/brick/test-background.jpg';
  var W=canvas.width,H=canvas.height;
  var ballRadius=10,paddleHeight=12,paddleWidth=80,brickRowCount=8,brickColumnCount=3,brickWidth=75,brickHeight=20,brickPadding=10,brickOffsetTop=30,brickOffsetLeft=10;
  var x,y,dx,dy,rX,rY,dxx,dyy,paddleX,rightPressed=false,leftPressed=false,score,lives,bricks,running=false,raf=null,over=false,hue=180;
  function reset(){
    x=W/2;y=H-30;dx=2.6;dy=-2.6;rX=400;rY=200;dxx=2.6;dyy=-2.6;paddleX=(W-paddleWidth)/2;score=0;lives=3;over=false;
    bricks=[];for(var c=0;c<brickColumnCount;c++){bricks[c]=[];for(var r=0;r<brickRowCount;r++)bricks[c][r]={x:0,y:0,status:1}}
  }
  function key(e,on){if(e.key==='ArrowRight'){rightPressed=on;e.preventDefault()}else if(e.key==='ArrowLeft'){leftPressed=on;e.preventDefault()}}
  function kd(e){key(e,true)}function ku(e){key(e,false)}
  function pointer(e){var r=canvas.getBoundingClientRect();var t=e.touches?e.touches[0]:e;paddleX=Math.max(0,Math.min(W-paddleWidth,(t.clientX-r.left)*(W/r.width)-paddleWidth/2));if(e.touches)e.preventDefault()}
  function collide(bx,by,flip){
    for(var c=0;c<brickColumnCount;c++)for(var r=0;r<brickRowCount;r++){var b=bricks[c][r];
      if(b.status===1&&bx>b.x&&bx<b.x+brickWidth&&by>b.y&&by<b.y+brickHeight){flip();b.status=0;score++;if(score===brickRowCount*brickColumnCount)finish('WINNER WINNER, CHICKEN DINNER!')}}
  }
  function drawBricks(){for(var c=0;c<brickColumnCount;c++)for(var r=0;r<brickRowCount;r++)if(bricks[c][r].status===1){var bx=r*(brickWidth+brickPadding)+brickOffsetLeft,by=c*(brickHeight+brickPadding)+brickOffsetTop;bricks[c][r].x=bx;bricks[c][r].y=by;ctx.fillStyle='#62CB83';ctx.fillRect(bx,by,brickWidth,brickHeight)}}
  function text(){ctx.font='16px Arial';ctx.fillStyle='#C6D3EC';ctx.fillText('Score: '+score,8,20);ctx.fillText('Lives: '+lives,W-65,20)}
  function finish(m){running=false;over=true;ui.hidden=false;ui.querySelector('.brick-menu').innerHTML='<p class="how"><strong>'+m+'</strong></p><p>Score: '+score+'</p>';startBtn.querySelector('.how').textContent='Play again'}
  function frame(){
    if(!running)return;
    ctx.clearRect(0,0,W,H);if(bg.complete&&bg.naturalWidth)ctx.drawImage(bg,0,0,W,H);
    drawBricks();
    hue=(hue+2)%360;ctx.beginPath();ctx.arc(x,y,ballRadius,0,Math.PI*2);ctx.fillStyle='hsl('+hue+', 50%, 50%)';ctx.fill();
    if(score>=6){ctx.beginPath();ctx.arc(rX,rY,ballRadius,0,Math.PI*2);ctx.fillStyle='#F3CEF6';ctx.fill()}
    ctx.fillStyle='#6ECF9E';ctx.fillRect(paddleX,H-paddleHeight,paddleWidth,paddleHeight);
    text();
    collide(x,y,function(){dy=-dy});
    if(score>=6)collide(rX,rY,function(){dyy=-dyy});
    if(over)return;
    if(score>=6){
      if(rX+dxx>W-ballRadius||rX+dxx<ballRadius)dxx=-dxx;
      if(rY+dyy<ballRadius)dyy=-dyy;else if(rY+dyy>H-ballRadius-paddleHeight&&rX>paddleX&&rX<paddleX+paddleWidth)dyy=-dyy;else if(rY+dyy>H+40){rY=200;rX=400}
      rX+=dxx;rY+=dyy;
    }
    if(x+dx>W-ballRadius||x+dx<ballRadius)dx=-dx;
    if(y+dy<ballRadius)dy=-dy;
    else if(y+dy>H-ballRadius-paddleHeight){
      if(x>paddleX-4&&x<paddleX+paddleWidth+4){dy=-Math.abs(dy);dx+=((x-(paddleX+paddleWidth/2))/paddleWidth)*1.2}
      else if(y+dy>H-ballRadius){lives--;if(!lives)return finish('GAME OVER');x=W/2;y=H-30;dx=2.6;dy=-2.6;paddleX=(W-paddleWidth)/2}
    }
    if(rightPressed&&paddleX<W-paddleWidth)paddleX+=7;else if(leftPressed&&paddleX>0)paddleX-=7;
    x+=dx;y+=dy;
    raf=requestAnimationFrame(frame);
  }
  function start(){reset();ui.hidden=true;running=true;canvas.focus();cancelAnimationFrame(raf);raf=requestAnimationFrame(frame)}
  startBtn.addEventListener('click',start);
  canvas.tabIndex=0;canvas.addEventListener('keydown',kd);canvas.addEventListener('keyup',ku);
  document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
  canvas.addEventListener('mousemove',function(e){if(running&&e.buttons)pointer(e)});canvas.addEventListener('touchmove',pointer,{passive:false});canvas.addEventListener('touchstart',pointer,{passive:false});
  ctx.fillStyle='#0F2A2E';ctx.fillRect(0,0,W,H);
  return {stop:function(){running=false;cancelAnimationFrame(raf);document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku)}};
};
