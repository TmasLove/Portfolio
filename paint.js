/* Paint: draw, then put it on the public wall for everyone to see. Also home to Trace, the tracing game (trace.js). */
window.initPaint = function(root){
  root.innerHTML =
    '<div class="paint-wrap"><div class="paint-left">'+
    '<div class="paint-modes" role="tablist"><button class="pmode active" data-mode="free" role="tab">Paint</button><button class="pmode" data-mode="trace" role="tab">Trace <span class="t3">· the game</span></button></div>'+
    '<div class="paint-tools" role="toolbar" aria-label="Paint tools">'+
    '<label class="t3" id="pSizeWrap">Size <input type="range" id="pSize" min="1" max="40" value="6"></label>'+
    ['#161616','#4A54DC','#00A88F','#F2B07A','#FF5F57','#FEBC2E','#FFFFFF'].map(function(c,i){return '<button class="pcolor'+(i===0?' active':'')+'" data-c="'+c+'" style="background:'+c+'" aria-label="Colour '+c+'"></button>'}).join('')+
    '<button id="pErase" aria-label="Eraser" title="Eraser"><svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 16l8-8 6 6-4 4H6z" fill="none" stroke="#161616" stroke-width="2" stroke-linejoin="round"/></svg></button>'+
    '<button id="pUndo" class="btn btn-secondary sm" title="Undo">Undo</button>'+
    '<button id="pClear" class="btn btn-secondary sm">Clear</button>'+
    '</div>'+
    '<div class="trace-bar" id="tBar" hidden><span id="tLevel" class="trace-level"></span><span id="tTools" class="t3"></span><button id="tCheck" class="btn btn-primary sm">Check my trace</button><button id="tPeek" class="btn btn-secondary sm" title="Hold to see the picture">Peek</button><button id="tNext" class="btn btn-secondary sm" hidden>Next level →</button><button id="tPrev" class="btn btn-secondary sm" title="Previous level">←</button><span id="tScore" class="trace-score"></span></div>'+
    '<div class="paint-stage" id="pStage"><canvas class="paint-ref" id="pRef" width="640" height="440" aria-hidden="true" hidden></canvas><div class="paint-paper" id="pPaper" hidden></div><canvas class="paint-canvas" id="pCanvas" width="640" height="440" tabindex="0" aria-label="Drawing canvas"></canvas></div>'+
    '<div class="paint-save"><input id="pName" maxlength="24" placeholder="Your name (optional)" aria-label="Your name"><button id="pSave" class="btn btn-primary">Put it on the wall</button><a id="pDown" class="btn btn-secondary" download="paint.png">Download</a><span id="pMsg" class="t3"></span></div></div>'+
    '<div class="paint-right"><h3 id="pRightTitle">The wall</h3><p class="t3" id="pRightText">Everyone who visits can paint. Everything saved shows up here, for everyone.</p><div id="pGallery" class="wall-host"><p class="t3">Loading the wall…</p></div></div></div>';

  var canvas=root.querySelector('#pCanvas'),ctx=canvas.getContext('2d'),refC=root.querySelector('#pRef'),refCtx=refC.getContext('2d'),paper=root.querySelector('#pPaper');
  var color='#161616',size=6,drawing=false,last=null,undo=[],mode='free';
  function blank(){ctx.clearRect(0,0,canvas.width,canvas.height);if(mode==='free'){ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height)}}
  blank();
  function snap(){undo.push(ctx.getImageData(0,0,canvas.width,canvas.height));if(undo.length>20)undo.shift()}
  function pick(b){root.querySelectorAll('.pcolor,#pErase').forEach(function(x){x.classList.remove('active')});b.classList.add('active')}
  root.querySelectorAll('.pcolor').forEach(function(b){b.addEventListener('click',function(){color=b.dataset.c;pick(b)})});
  root.querySelector('#pErase').addEventListener('click',function(e){color=mode==='trace'?'erase':'#FFFFFF';pick(e.currentTarget)});
  root.querySelector('#pSize').addEventListener('input',function(e){size=+e.target.value});
  root.querySelector('#pUndo').addEventListener('click',function(){var u=undo.pop();if(u)ctx.putImageData(u,0,0)});
  function pos(e){var r=canvas.getBoundingClientRect();var t=e.touches?e.touches[0]:e;return{x:(t.clientX-r.left)*(canvas.width/r.width),y:(t.clientY-r.top)*(canvas.height/r.height)}}
  function pen(){if(color==='erase'){ctx.globalCompositeOperation='destination-out';ctx.strokeStyle=ctx.fillStyle='#000'}else{ctx.globalCompositeOperation='source-over';ctx.strokeStyle=ctx.fillStyle=color}}
  function start(e){snap();drawing=true;last=pos(e);dot(last);e.preventDefault()}
  function dot(p){pen();ctx.beginPath();ctx.arc(p.x,p.y,size/2,0,Math.PI*2);ctx.fill();ctx.globalCompositeOperation='source-over'}
  function move(e){if(!drawing)return;var p=pos(e);pen();ctx.lineWidth=size;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();ctx.globalCompositeOperation='source-over';last=p;e.preventDefault()}
  function end(){drawing=false}
  canvas.addEventListener('mousedown',start);canvas.addEventListener('mousemove',move);window.addEventListener('mouseup',end);
  canvas.addEventListener('touchstart',start,{passive:false});canvas.addEventListener('touchmove',move,{passive:false});canvas.addEventListener('touchend',end);
  root.querySelector('#pClear').addEventListener('click',function(){snap();blank()});
  function flattened(){ /* white background + the drawing, for saving and downloading */
    var cv=document.createElement('canvas');cv.width=canvas.width;cv.height=canvas.height;var c=cv.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,cv.width,cv.height);c.drawImage(canvas,0,0);return cv.toDataURL('image/png')}
  root.querySelector('#pDown').addEventListener('click',function(){this.href=flattened()});

  var g=root.querySelector('#pGallery'),msg=root.querySelector('#pMsg');
  function renderGallery(){TRWall.list('paint').then(function(res){g.innerHTML=TRWall.galleryHTML(res,'paint')})}
  root.querySelector('#pSave').addEventListener('click',function(){
    var btn=this;btn.disabled=true;msg.textContent='Saving…';
    var data=flattened(),who=root.querySelector('#pName').value;
    if(mode==='trace'&&lastScore!==null)who=(who?who+' · ':'')+'Trace L'+(lvl+1)+' '+lastScore+'/100';
    TRWall.post('paint',data,who).then(function(r){
      msg.textContent=r.online?'On the wall.':'Wall offline — saved on this device.';btn.disabled=false;
      /* show it at once: the wall's listing lags a minute behind a save */
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
  function loadLevel(i){
    lvl=i;var L=T.LEVELS[i];lastScore=null;undo=[];blank();
    refCtx.clearRect(0,0,refC.width,refC.height);refCtx.fillStyle='#fff';refCtx.fillRect(0,0,refC.width,refC.height);L.draw(refCtx);
    paper.style.background='rgba(255,255,255,'+L.paper+')';
    var allow=L.tools;
    root.querySelector('#pSizeWrap').hidden=allow.indexOf('size')<0;if(allow.indexOf('size')<0){size=6;root.querySelector('#pSize').value=6}
    root.querySelector('#pUndo').hidden=allow.indexOf('undo')<0;
    root.querySelector('#pErase').hidden=allow.indexOf('erase')<0;
    root.querySelectorAll('.pcolor').forEach(function(b,k){b.hidden=k>0});color='#161616';pick(root.querySelector('.pcolor'));
    tLevel.textContent='Level '+(i+1)+' of '+T.LEVELS.length+' · '+L.name+(BEST[i]?' · best '+BEST[i]+'/100':'');
    tTools.textContent='Paper '+Math.round(L.paper*100)+'% · tools: '+(allow.length?allow.join(', '):'brush only');
    tScore.textContent='';tNext.hidden=true;tPrev.hidden=i===0;
  }
  function setMode(m){
    mode=m;root.querySelectorAll('.pmode').forEach(function(b){b.classList.toggle('active',b.dataset.mode===m)});
    var trace=m==='trace';bar.hidden=!trace;refC.hidden=!trace;paper.hidden=!trace;canvas.classList.toggle('trace-on',trace);
    root.querySelector('#pRightTitle').textContent=trace?'Trace':'The wall';
    root.querySelector('#pRightText').textContent=trace?'A picture sits under white tracing paper. Trace it as closely as you can, then check your score: 100 is a perfect trace. Score 60 or more to unlock the next level. Higher levels use fainter paper, harder pictures and fewer tools.':'Everyone who visits can paint. Everything saved shows up here, for everyone.';
    if(trace){loadLevel(Math.min(lvl,unlocked()))}
    else{root.querySelector('#pSizeWrap').hidden=false;root.querySelector('#pUndo').hidden=false;root.querySelector('#pErase').hidden=false;root.querySelectorAll('.pcolor').forEach(function(b){b.hidden=false});undo=[];blank()}
  }
  root.querySelectorAll('.pmode').forEach(function(b){b.addEventListener('click',function(){setMode(b.dataset.mode)})});
  root.querySelector('#tCheck').addEventListener('click',function(){
    var r=T.score(T.LEVELS[lvl],ctx.getImageData(0,0,canvas.width,canvas.height).data);lastScore=r.score;
    if(r.score>(BEST[lvl]||0)){BEST[lvl]=r.score;try{localStorage.setItem('tr-trace-best',JSON.stringify(BEST))}catch(e){}}
    tScore.textContent=r.score+'/100'+(r.score>=95?' — perfect!':r.score>=60?' — unlocked the next level':' — 60 unlocks the next level')+' (covered '+r.coverage+'%, on the line '+r.precision+'%)';
    tLevel.textContent='Level '+(lvl+1)+' of '+T.LEVELS.length+' · '+T.LEVELS[lvl].name+' · best '+BEST[lvl]+'/100';
    tNext.hidden=!(r.score>=60&&lvl<T.LEVELS.length-1);
  });
  tNext.addEventListener('click',function(){loadLevel(lvl+1)});tPrev.addEventListener('click',function(){loadLevel(Math.max(0,lvl-1))});
  var peek=root.querySelector('#tPeek');function peekOn(){paper.style.opacity='0'}function peekOff(){paper.style.opacity=''}
  peek.addEventListener('mousedown',peekOn);peek.addEventListener('touchstart',peekOn,{passive:true});window.addEventListener('mouseup',peekOff);peek.addEventListener('touchend',peekOff);
  root.__paint={setMode:setMode,loadLevel:loadLevel,level:function(){return lvl},canvas:canvas,ctx:ctx,check:function(){root.querySelector('#tCheck').click();return lastScore},best:function(){return BEST}};
};
