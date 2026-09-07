/* Trace — a game inside Paint. An image sits under a sheet of white tracing paper; you trace it with the tools the
   level allows; the closer your lines are to the image, the higher the score (100/100 = a perfect trace).
   Images are our own line drawings, drawn by code. Higher levels: fainter paper, harder pictures, fewer tools. */
window.TRTrace = (function(){
  var W=640,H=440;
  function P(ctx){ctx.lineWidth=6;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#161616';ctx.fillStyle='#161616'}
  function circle(ctx,x,y,r){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke()}
  function poly(ctx,pts,close){ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(var i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);if(close)ctx.closePath();ctx.stroke()}
  function star(ctx,cx,cy,R,r,n){var pts=[];for(var i=0;i<n*2;i++){var a=-Math.PI/2+i*Math.PI/n,rr=i%2?r:R;pts.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr])}poly(ctx,pts,true)}
  var LEVELS=[
    {name:'Circle & line',paper:.55,tools:['size','undo','erase'],draw:function(c){P(c);circle(c,320,220,120);poly(c,[[120,380],[520,380]])}},
    {name:'House',paper:.58,tools:['size','undo','erase'],draw:function(c){P(c);poly(c,[[180,400],[180,220],[320,110],[460,220],[460,400]],true);poly(c,[[290,400],[290,300],[350,300],[350,400]]);poly(c,[[380,250],[430,250],[430,300],[380,300]],true)}},
    {name:'Star',paper:.6,tools:['size','undo','erase'],draw:function(c){P(c);star(c,320,225,160,68,5)}},
    {name:'Sailboat',paper:.64,tools:['size','erase'],draw:function(c){P(c);poly(c,[[160,330],[480,330],[430,390],[210,390]],true);poly(c,[[320,330],[320,80]]);poly(c,[[320,90],[470,300],[320,300]],true);poly(c,[[310,120],[190,300],[310,300]],true)}},
    {name:'Fish',paper:.68,tools:['size','erase'],draw:function(c){P(c);c.beginPath();c.ellipse(300,225,170,95,0,0,Math.PI*2);c.stroke();poly(c,[[460,225],[540,150],[540,300]],true);circle(c,220,200,12);poly(c,[[300,135],[340,175],[380,150]]);poly(c,[[300,315],[340,275],[380,300]])}},
    {name:'Rocket',paper:.7,tools:['size'],draw:function(c){P(c);poly(c,[[320,40],[390,150],[390,330],[250,330],[250,150]],true);poly(c,[[250,250],[190,340],[250,330]]);poly(c,[[390,250],[450,340],[390,330]]);circle(c,320,180,32);poly(c,[[280,330],[320,410],[360,330]])}},
    {name:'Cat',paper:.74,tools:['size'],draw:function(c){P(c);circle(c,320,240,140);poly(c,[[215,150],[200,50],[290,110]],true);poly(c,[[425,150],[440,50],[350,110]],true);circle(c,270,220,16);circle(c,370,220,16);poly(c,[[300,270],[320,290],[340,270]],true);poly(c,[[120,250],[240,270]]);poly(c,[[120,300],[240,290]]);poly(c,[[520,250],[400,270]]);poly(c,[[520,300],[400,290]])}},
    {name:'Bicycle',paper:.78,tools:[],draw:function(c){P(c);circle(c,170,310,95);circle(c,470,310,95);poly(c,[[170,310],[280,140],[420,140],[470,310]]);poly(c,[[280,140],[330,310],[170,310]]);poly(c,[[330,310],[420,140]]);poly(c,[[250,120],[310,120]]);poly(c,[[400,140],[440,100]])}},
    {name:'Tree',paper:.82,tools:[],draw:function(c){P(c);poly(c,[[320,60],[200,200],[260,200],[170,300],[250,300],[140,400],[500,400],[390,300],[470,300],[380,200],[440,200]],true);poly(c,[[300,400],[300,430],[340,430],[340,400]])}},
    {name:'Skyline',paper:.86,tools:[],draw:function(c){P(c);poly(c,[[60,400],[60,260],[130,260],[130,180],[200,180],[200,320],[250,320],[250,90],[300,60],[350,90],[350,220],[420,220],[420,140],[480,140],[480,300],[540,300],[540,200],[600,200],[600,400]],true);for(var x=270;x<=330;x+=30)for(var y=130;y<=300;y+=50)poly(c,[[x,y],[x,y+20]])}}
  ];
  function refMask(level){var cv=document.createElement('canvas');cv.width=W;cv.height=H;var c=cv.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,W,H);level.draw(c);return c.getImageData(0,0,W,H).data}
  /* score: cells of 4px; coverage = image cells with a stroke nearby, precision = stroke cells with image nearby */
  function score(level,userData){
    var ref=refMask(level),cs=4,cw=W/cs,ch=H/cs,R=new Uint8Array(cw*ch),U=new Uint8Array(cw*ch),i,x,y;
    for(y=0;y<H;y++)for(x=0;x<W;x++){i=(y*W+x)*4;var cx=(x/cs)|0,cy=(y/cs)|0;if(ref[i]<120)R[cy*cw+cx]=1;if(userData[i+3]>40&&(userData[i]<200||userData[i+1]<200||userData[i+2]<200))U[cy*cw+cx]=1}
    function near(A,B,tol){var hit=0,tot=0;for(var yy=0;yy<ch;yy++)for(var xx=0;xx<cw;xx++){if(!A[yy*cw+xx])continue;tot++;var ok=false;for(var dy=-tol;dy<=tol&&!ok;dy++)for(var dx=-tol;dx<=tol;dx++){var X=xx+dx,Y=yy+dy;if(X>=0&&Y>=0&&X<cw&&Y<ch&&B[Y*cw+X]){ok=true;break}}if(ok)hit++}return tot?hit/tot:0}
    var tol=LEVELS.indexOf(level)>=4?1:2; /* higher levels judge within 4px instead of 8px */
    var cov=near(R,U,tol),prec=near(U,R,tol);
    if(!cov&&!prec)return {score:0,coverage:0,precision:0};
    var f=cov+prec?2*cov*prec/(cov+prec):0;
    return {score:Math.round(f*100),coverage:Math.round(cov*100),precision:Math.round(prec*100)};
  }
  return {LEVELS:LEVELS,score:score,W:W,H:H};
})();
