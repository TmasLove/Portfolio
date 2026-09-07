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
    {name:'Skyline',paper:.86,tools:[],draw:function(c){P(c);poly(c,[[60,400],[60,260],[130,260],[130,180],[200,180],[200,320],[250,320],[250,90],[300,60],[350,90],[350,220],[420,220],[420,140],[480,140],[480,300],[540,300],[540,200],[600,200],[600,400]],true);for(var x=270;x<=330;x+=30)for(var y=130;y<=300;y+=50)poly(c,[[x,y],[x,y+20]])}},
    /* photo levels: real pictures (Unsplash, see /assets/trace/CREDITS.md); you trace the outlines the picture's strongest edges make */
    {name:'Photo · lighthouse',photo:true,paper:.5,tools:['size','undo','erase'],img:'/assets/trace/lighthouse.jpg',credit:'Joshua Hibbert / Unsplash'},
    {name:'Photo · coupe',photo:true,paper:.55,tools:['size','erase'],img:'/assets/trace/car-coupe.jpg',credit:'Josh Berquist / Unsplash'},
    {name:'Photo · Lake Louise',photo:true,paper:.6,tools:['size'],img:'/assets/trace/lake-louise.jpg',credit:'Daniel Roe / Unsplash'},
    {name:'Photo · Axel Towers',photo:true,paper:.62,tools:['size'],img:'/assets/trace/axel-towers.jpg',credit:'Joakim Nådell / Unsplash'},
    {name:'Photo · Porsche',photo:true,paper:.66,tools:[],img:'/assets/trace/car-porsche.jpg',credit:'Campbell / Unsplash'},
    {name:'Photo · glass tower',photo:true,paper:.7,tools:[],img:'/assets/trace/gray-building.jpg',credit:'Anders Jildén / Unsplash'}
  ];
  var IMG={};
  function prepare(level){ /* photo levels load their picture first; returns a promise either way */
    if(!level.photo)return Promise.resolve();
    if(IMG[level.img])return Promise.resolve(IMG[level.img]);
    return new Promise(function(res,rej){var im=new Image();im.onload=function(){IMG[level.img]=im;res(im)};im.onerror=function(){rej(new Error('picture failed to load'))};im.src=level.img});
  }
  function drawPhoto(c,level){var im=IMG[level.img];if(!im)return;var r=Math.max(W/im.width,H/im.height),w=im.width*r,h=im.height*r;c.drawImage(im,(W-w)/2,(H-h)/2,w,h)}
  LEVELS.forEach(function(L){if(L.photo)L.draw=function(c){drawPhoto(c,L)}});
  var EDGE={};
  function edgeMask(level){ /* Sobel edges on the photo; keep the strongest ~4% as the outline to trace */
    if(EDGE[level.img])return EDGE[level.img];
    var cv=document.createElement('canvas');cv.width=W;cv.height=H;var c=cv.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,W,H);drawPhoto(c,level);
    var d=c.getImageData(0,0,W,H).data,g=new Float32Array(W*H),i,x,y;
    for(i=0;i<W*H;i++)g[i]=d[i*4]*.299+d[i*4+1]*.587+d[i*4+2]*.114;
    var m=new Float32Array(W*H),hist=new Uint32Array(1024),n=0;
    for(y=1;y<H-1;y++)for(x=1;x<W-1;x++){i=y*W+x;var gx=-g[i-W-1]-2*g[i-1]-g[i+W-1]+g[i-W+1]+2*g[i+1]+g[i+W+1],gy=-g[i-W-1]-2*g[i-W]-g[i-W+1]+g[i+W-1]+2*g[i+W]+g[i+W+1];var v=Math.sqrt(gx*gx+gy*gy);m[i]=v;hist[Math.min(1023,v|0)]++;n++}
    var keep=n*.025,acc=0,thr=1023;for(var k=1023;k>=0;k--){acc+=hist[k];if(acc>=keep){thr=k;break}}
    var mask=new Uint8Array(W*H);for(i=0;i<W*H;i++)mask[i]=m[i]>=thr?1:0;
    EDGE[level.img]=mask;return mask;
  }
  function refMask(level){var cv=document.createElement('canvas');cv.width=W;cv.height=H;var c=cv.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,W,H);level.draw(c);return c.getImageData(0,0,W,H).data}
  /* score: cells of 4px; coverage = image cells with a stroke nearby, precision = stroke cells with image nearby */
  function score(level,userData){
    var ref=level.photo?null:refMask(level),edge=level.photo?edgeMask(level):null,cs=4,cw=W/cs,ch=H/cs,R=new Uint8Array(cw*ch),RL=new Uint8Array(cw*ch),U=new Uint8Array(cw*ch),cnt=new Uint8Array(cw*ch),i,x,y;
    for(y=0;y<H;y++)for(x=0;x<W;x++){i=(y*W+x)*4;var cx=(x/cs)|0,cy=(y/cs)|0;if(level.photo){if(edge[y*W+x]){RL[cy*cw+cx]=1;if(++cnt[cy*cw+cx]>=5)R[cy*cw+cx]=1}}else if(ref[i]<120){R[cy*cw+cx]=1;RL[cy*cw+cx]=1}if(userData[i+3]>40&&(userData[i]<200||userData[i+1]<200||userData[i+2]<200))U[cy*cw+cx]=1}
    function near(A,B,tol){var hit=0,tot=0;for(var yy=0;yy<ch;yy++)for(var xx=0;xx<cw;xx++){if(!A[yy*cw+xx])continue;tot++;var ok=false;for(var dy=-tol;dy<=tol&&!ok;dy++)for(var dx=-tol;dx<=tol;dx++){var X=xx+dx,Y=yy+dy;if(X>=0&&Y>=0&&X<cw&&Y<ch&&B[Y*cw+X]){ok=true;break}}if(ok)hit++}return tot?hit/tot:0}
    var tol=level.photo?1:(LEVELS.indexOf(level)>=4?1:2); /* higher line-art levels and photos judge within 4px */
    var cov=near(R,U,tol),prec=near(U,RL,tol); /* cover the solid outline; be on any edge */
    if(!cov&&!prec)return {score:0,coverage:0,precision:0};
    var f=cov+prec?2*cov*prec/(cov+prec):0;if(level.photo)f=Math.pow(f,1.35); /* photos: random ink still lands on edges, so curve the score down */
    return {score:Math.round(f*100),coverage:Math.round(cov*100),precision:Math.round(prec*100)};
  }
  return {LEVELS:LEVELS,score:score,prepare:prepare,edgeMask:edgeMask,W:W,H:H};
})();
