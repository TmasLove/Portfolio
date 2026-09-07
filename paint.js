/* Paint: draw, then put it on the public wall for everyone to see. Also home to Trace, the tracing game (trace.js).
   The canvas is 1280x880 (twice the 640x440 the game scores at) so lines stay crisp on a big screen. */
window.initPaint = function(root){
  var CW=1280,CH=880,K=2; /* K: canvas pixels per game unit */
  var TOOLS=[['brush','Brush','M4 20c4-8 8-12 16-16'],['pen','Pen','M5 19L19 5M15 5h4v4'],['marker','Marker','M4 20l8-3 8-9-5-5-9 8z'],['line','Line','M4 20L20 4'],['rect','Rectangle','M4 6h16v12H4z'],['ellipse','Ellipse','M12 5a8 7 0 1 0 0 14a8 7 0 1 0 0-14'],['fill','Fill','M7 3l10 10-7 7-7-7 4-4zM19 15c1 2 1 4 0 4s-1-2 0-4'],['erase','Eraser','M4 16l8-8 6 6-4 4H6z']];
  root.innerHTML =
    '<div class="paint-wrap"><div class="paint-left">'+
    '<div class="paint-modes" role="tablist"><button class="pmode active" data-mode="free" role="tab">Paint</button><button class="pmode" data-mode="trace" role="tab">Trace <span class="t3">· the game</span></button></div>'+
    '<div class="paint-tools" role="toolbar" aria-label="Paint tools">'+
    '<span class="ptools">'+TOOLS.map(function(t,i){return '<button class="ptool'+(i===0?' active':'')+'" data-tool="'+t[0]+'" title="'+t[1]+'" aria-label="'+t[1]+'"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="'+t[2]+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg></button>'}).join('')+'</span>'+
    '<label class="t3" id="pSizeWrap">Size <input type="range" id="pSize" min="1" max="60" value="6"></label>'+
    '<label class="t3" id="pAlphaWrap">Opacity <input type="range" id="pAlpha" min="10" max="100" value="100"></label>'+
    '<span class="pcolors">'+['#161616','#4A54DC','#00A88F','#F2B07A','#FF5F57','#FEBC2E','#FFFFFF'].map(function(c,i){return '<button class="pcolor'+(i===0?' active':'')+'" data-c="'+c+'" style="background:'+c+'" aria-label="Colour '+c+'"></button>'}).join('')+'<input type="color" id="pPick" value="#161616" title="Any colour" aria-label="Any colour"></span>'+
    '<button id="pUndo" class="btn btn-secondary sm" title="Undo">Undo</button>'+
    '<button id="pClear" class="btn btn-secondary sm">Clear</button>'+
    '</div>'+
    '<div class="trace-bar" id="tBar" hidden><span id="tLevel" class="trace-level"></span><span id="tTools" class="t3"></span><button id="tCheck" class="btn btn-primary sm">Check my trace</button><button id="tPeek" class="btn btn-secondary sm" title="Hold to see the picture">Peek</button><button id="tNext" class="btn btn-secondary sm" hidden>Next level →</button><button id="tPrev" class="btn btn-secondary sm" title="Previous level">←</button><span id="tScore" class="trace-score"></span></div>'+
    '<div class="paint-stage" id="pStage"><canvas class="paint-ref" id="pRef" width="'+CW+'" height="'+CH+'" aria-hidden="true" hidden></canvas><div class="paint-paper" id="pPaper" hidden></div><canvas class="paint-canvas" id="pCanvas" width="'+CW+'" height="'+CH+'" tabindex="0" aria-label="Drawing canvas"></canvas></div>'+
    '<div class="paint-save"><input id="pName" maxlength="24" placeholder="Your name (optional)" aria-label="Your name"><button id="pSave" class="btn btn-primary">Put it on the wall</button><a id="pDown" class="btn btn-secondary" download="paint.png">Download</a><span id="pMsg" class="t3"></span></div></div>'+
    '<div class="paint-right"><h3 id="pRightTitle">The wall</h3><p class="t3" id="pRightText">Everyone who visits can paint. Everything saved shows up here, for everyone.</p><div id="pGallery" class="wall-host"><p class="t3">Loading the wall…</p></div></div></div>';

  var canvas=root.querySelector('#pCanvas'),ctx=canvas.getContext('2d'),refC=root.querySelector('#pRef'),refCtx=refC.getContext('2d'),paper=root.querySelector('#pPaper');
  var color='#161616',size=6,alpha=1,tool='brush',drawing=false,last=null,startP=null,base=null,undo=[],mode='free';
  function blank(){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,CW,CH);if(mode==='free'){ctx.fillStyle='#fff';ctx.fillRect(0,0,CW,CH)}}
  blank();
  function snap(){undo.push(ctx.getImageData(0,0,CW,CH));if(undo.length>25)undo.shift()}
  function pickColor(b){root.querySelectorAll('.pcolor').forEach(function(x){x.classList.remove('active')});if(b)b.classList.add('active')}
  function setTool(t){tool=t;root.querySelectorAll('.ptool').forEach(function(x){x.classList.toggle('active',x.dataset.tool===t)})}
  root.querySelectorAll('.ptool').forEach(function(b){b.addEventListener('click',function(){setTool(b.dataset.tool)})});
  root.querySelectorAll('.pcolor').forEach(function(b){b.addEventListener('click',function(){color=b.dataset.c;root.querySelector('#pPick').value=color.length===7?color:'#161616';pickColor(b);if(tool==='erase')setTool('brush')})});
  root.querySelector('#pPick').addEventListener('input',function(e){color=e.target.value;pickColor(null);if(tool==='erase')setTool('brush')});
  root.querySelector('#pSize').addEventListener('input',function(e){size=+e.target.value});
  root.querySelector('#pAlpha').addEventListener('input',function(e){alpha=(+e.target.value)/100});
  root.querySelector('#pUndo').addEventListener('click',function(){var u=undo.pop();if(u)ctx.putImageData(u,0,0)});
  function pos(e){var r=canvas.getBoundingClientRect();var t=e.touches?e.touches[0]:(e.changedTouches?e.changedTouches[0]:e);return{x:(t.clientX-r.left)*(CW/r.width),y:(t.clientY-r.top)*(CH/r.height)}}
  function pen(){
    ctx.globalCompositeOperation=tool==='erase'?'destination-out':'source-over';
    ctx.globalAlpha=tool==='marker'?Math.min(alpha,.35):alpha;
    ctx.strokeStyle=ctx.fillStyle=tool==='erase'?'#000':color;
    ctx.lineWidth=(tool==='pen'?Math.max(1,size*.35):tool==='marker'?size*1.8:size)*K;ctx.lineCap=tool==='marker'?'butt':'round';ctx.lineJoin='round';
  }
  function reset(){ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1}
  function fill(p){ /* flood fill from the point, matching the colour under it */
    var img=ctx.getImageData(0,0,CW,CH),d=img.data,x0=p.x|0,y0=p.y|0,i0=(y0*CW+x0)*4,tr=d[i0],tg=d[i0+1],tb=d[i0+2],ta=d[i0+3];
    var c=color.replace('#',''),fr=parseInt(c.slice(0,2),16),fg=parseInt(c.slice(2,4),16),fb=parseInt(c.slice(4,6),16),fa=Math.round(alpha*255);
    if(tr===fr&&tg===fg&&tb===fb&&ta===fa)return;
    var stack=[x0,y0],seen=new Uint8Array(CW*CH);
    function match(i){return Math.abs(d[i]-tr)<24&&Math.abs(d[i+1]-tg)<24&&Math.abs(d[i+2]-tb)<24&&Math.abs(d[i+3]-ta)<24}
    while(stack.length){var y=stack.pop(),x=stack.pop(),k=y*CW+x;if(x<0||y<0||x>=CW||y>=CH||seen[k])continue;var i=k*4;if(!match(i))continue;seen[k]=1;d[i]=fr;d[i+1]=fg;d[i+2]=fb;d[i+3]=fa;stack.push(x+1,y,x-1,y,x,y+1,x,y-1)}
    ctx.putImageData(img,0,0);
  }
  function shape(p){ /* preview: restore the snapshot, then draw the shape from startP to p */
    ctx.putImageData(base,0,0);pen();ctx.beginPath();
    if(tool==='line'){ctx.moveTo(startP.x,startP.y);ctx.lineTo(p.x,p.y);ctx.stroke()}
    else if(tool==='rect'){ctx.strokeRect(Math.min(startP.x,p.x),Math.min(startP.y,p.y),Math.abs(p.x-startP.x),Math.abs(p.y-startP.y))}
    else if(tool==='ellipse'){ctx.ellipse((startP.x+p.x)/2,(startP.y+p.y)/2,Math.max(1,Math.abs(p.x-startP.x)/2),Math.max(1,Math.abs(p.y-startP.y)/2),0,0,Math.PI*2);ctx.stroke()}
    reset();
  }
  function start(e){var p=pos(e);snap();e.preventDefault();
    if(tool==='fill'){fill(p);return}
    drawing=true;last=p;startP=p;
    if(tool==='line'||tool==='rect'||tool==='ellipse'){base=ctx.getImageData(0,0,CW,CH);return}
    pen();ctx.beginPath();ctx.arc(p.x,p.y,ctx.lineWidth/2,0,Math.PI*2);ctx.fill();reset();
  }
  function move(e){if(!drawing)return;var p=pos(e);e.preventDefault();
    if(tool==='line'||tool==='rect'||tool==='ellipse'){shape(p);return}
    pen();ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();reset();last=p;
  }
  function end(e){if(!drawing)return;drawing=false;base=null}
  canvas.addEventListener('mousedown',start);canvas.addEventListener('mousemove',move);window.addEventListener('mouseup',end);
  canvas.addEventListener('touchstart',start,{passive:false});canvas.addEventListener('touchmove',move,{passive:false});canvas.addEventListener('touchend',end);
  root.querySelector('#pClear').addEventListener('click',function(){snap();blank()});
  function flattened(){var cv=document.createElement('canvas');cv.width=CW;cv.height=CH;var c=cv.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,CW,CH);c.drawImage(canvas,0,0);return cv.toDataURL('image/png')}
  root.querySelector('#pDown').addEventListener('click',function(){this.href=flattened()});

  var g=root.querySelector('#pGallery'),msg=root.querySelector('#pMsg');
  function renderGallery(){TRWall.list('paint').then(function(res){g.innerHTML=TRWall.galleryHTML(res,'paint')})}
  root.querySelector('#pSave').addEventListener('click',function(){
    var btn=this;btn.disabled=true;msg.textContent='Saving…';
    var data=flattened(),who=root.querySelector('#pName').value;
    if(mode==='trace'&&lastScore!==null)who=(who?who+' · ':'')+'Trace L'+(lvl+1)+' '+lastScore+'/100';
    TRWall.post('paint',data,who).then(function(r){
      msg.textContent=r.online?'On the wall.':'Wall offline — saved on this device.';btn.disabled=false;
      var mine={id:'just-now',src:data,ts:Date.now(),name:who||''};
      TRWall.list('paint').then(function(res){if(!res.items.some(function(i){return i.ts>mine.ts-3000&&i.name===mine.name&&i.id!=='just-now'}))res.items.unshift(mine);g.innerHTML=TRWall.galleryHTML(res,'paint')});
      setTimeout(renderGallery,65000);
    }).catch(function(err){msg.textContent=err.message||'Could not save.';btn.disabled=false});
  });
  renderGallery();

  /* ---------- Trace: the game ---------- */
  var T=window.TRTrace,lvl=0,lastScore=null,BEST={};
  try{BEST=JSON.parse(localStorage.getItem('tr-trace-best')||'{}')||{}}catch(e){}
  var bar=root.querySelector('#tBar'),tLevel=root.querySelector('#tLevel'),tTools=root.querySelector('#tTools'),tScore=root.querySelector('#tScore'),tNext=root.querySelector('#tNext'),tPrev=root.querySelector('#tPrev');
  function unlocked(){var n=0;while(n<T.LEVELS.length-1&&(BEST[n]||0)>=60)n++;return n}
  var GROUPS={shapes:['line','rect','ellipse'],marker:['marker','pen'],fill:['fill'],erase:['erase']};
  function allowTools(allow){ /* null = everything */
    root.querySelectorAll('.ptool').forEach(function(b){var t=b.dataset.tool,ok=true;if(allow){ok=t==='brush';Object.keys(GROUPS).forEach(function(k){if(allow.indexOf(k)>=0&&GROUPS[k].indexOf(t)>=0)ok=true})}b.hidden=!ok});
    root.querySelector('#pSizeWrap').hidden=!!allow&&allow.indexOf('size')<0;if(allow&&allow.indexOf('size')<0){size=6;root.querySelector('#pSize').value=6}
    root.querySelector('#pAlphaWrap').hidden=!!allow&&allow.indexOf('opacity')<0;if(allow&&allow.indexOf('opacity')<0){alpha=1;root.querySelector('#pAlpha').value=100}
    root.querySelector('#pUndo').hidden=!!allow&&allow.indexOf('undo')<0;
    root.querySelector('.pcolors').hidden=!!allow;
    if(allow){color='#161616';setTool('brush')}
  }
  function loadLevel(i){
    lvl=i;var L=T.LEVELS[i];lastScore=null;undo=[];blank();
    refCtx.setTransform(1,0,0,1,0,0);refCtx.clearRect(0,0,CW,CH);refCtx.fillStyle='#fff';refCtx.fillRect(0,0,CW,CH);
    tScore.textContent=L.photo?'Loading the picture…':'';
    T.prepare(L).then(function(){if(lvl===i){refCtx.setTransform(K,0,0,K,0,0);L.draw(refCtx);refCtx.setTransform(1,0,0,1,0,0);if(L.photo)tScore.textContent=''}}).catch(function(e){tScore.textContent=e.message});
    paper.style.background='rgba(255,255,255,'+L.paper+')';
    allowTools(L.tools);
    tLevel.textContent='Level '+(i+1)+' of '+T.LEVELS.length+' · '+L.name+(BEST[i]?' · best '+BEST[i]+'/100':'');
    tTools.textContent='Paper '+Math.round(L.paper*100)+'% · tools: '+(L.tools.length?L.tools.join(', '):'brush only')+(L.credit?' · photo: '+L.credit:'')+(L.photo?' · trace the outlines':'');
    tNext.hidden=true;tPrev.hidden=i===0;
  }
  function setMode(m){
    mode=m;root.querySelectorAll('.pmode').forEach(function(b){b.classList.toggle('active',b.dataset.mode===m)});
    var trace=m==='trace';bar.hidden=!trace;refC.hidden=!trace;paper.hidden=!trace;canvas.classList.toggle('trace-on',trace);
    root.querySelector('#pRightTitle').textContent=trace?'Trace':'The wall';
    root.querySelector('#pRightText').textContent=trace?'A picture sits under white tracing paper. Trace it as closely as you can, then check your score: 100 is a perfect trace. Score 60 or more to unlock the next level. Higher levels use fainter paper, harder pictures and fewer tools.':'Everyone who visits can paint. Everything saved shows up here, for everyone.';
    if(trace){loadLevel(Math.min(lvl,unlocked()))}
    else{allowTools(null);undo=[];blank()}
  }
  root.querySelectorAll('.pmode').forEach(function(b){b.addEventListener('click',function(){setMode(b.dataset.mode)})});
  function userData(){var cv=document.createElement('canvas');cv.width=T.W;cv.height=T.H;var c=cv.getContext('2d');c.drawImage(canvas,0,0,T.W,T.H);return c.getImageData(0,0,T.W,T.H).data}
  root.querySelector('#tCheck').addEventListener('click',function(){
    var r=T.score(T.LEVELS[lvl],userData());lastScore=r.score;
    if(r.score>(BEST[lvl]||0)){BEST[lvl]=r.score;try{localStorage.setItem('tr-trace-best',JSON.stringify(BEST))}catch(e){}}
    tScore.textContent=r.score+'/100'+(r.score>=95?' — perfect!':r.score>=60?' — unlocked the next level':' — 60 unlocks the next level')+' (covered '+r.coverage+'%, on the line '+r.precision+'%)';
    tLevel.textContent='Level '+(lvl+1)+' of '+T.LEVELS.length+' · '+T.LEVELS[lvl].name+' · best '+BEST[lvl]+'/100';
    tNext.hidden=!(r.score>=60&&lvl<T.LEVELS.length-1);
  });
  tNext.addEventListener('click',function(){loadLevel(lvl+1)});tPrev.addEventListener('click',function(){loadLevel(Math.max(0,lvl-1))});
  var peek=root.querySelector('#tPeek');function peekOn(){paper.style.opacity='0'}function peekOff(){paper.style.opacity=''}
  peek.addEventListener('mousedown',peekOn);peek.addEventListener('touchstart',peekOn,{passive:true});window.addEventListener('mouseup',peekOff);peek.addEventListener('touchend',peekOff);
  root.__paint={T:T,K:K,setMode:setMode,loadLevel:loadLevel,setTool:setTool,level:function(){return lvl},canvas:canvas,ctx:ctx,check:function(){root.querySelector('#tCheck').click();return lastScore},best:function(){return BEST}};
};
