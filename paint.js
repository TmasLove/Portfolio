/* Paint: draw, then put it on the public wall for everyone to see. */
window.initPaint = function(root){
  root.innerHTML =
    '<div class="paint-wrap"><div class="paint-left"><div class="paint-tools" role="toolbar" aria-label="Paint tools">'+
    '<label class="t3">Size <input type="range" id="pSize" min="1" max="40" value="6"></label>'+
    ['#161616','#4A54DC','#00A88F','#F2B07A','#FF5F57','#FEBC2E','#FFFFFF'].map(function(c,i){return '<button class="pcolor'+(i===0?' active':'')+'" data-c="'+c+'" style="background:'+c+'" aria-label="Colour '+c+'"></button>'}).join('')+
    '<button id="pErase" aria-label="Eraser" title="Eraser"><svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 16l8-8 6 6-4 4H6z" fill="none" stroke="#161616" stroke-width="2" stroke-linejoin="round"/></svg></button>'+
    '<button id="pUndo" class="btn btn-secondary sm" title="Undo">Undo</button>'+
    '<button id="pClear" class="btn btn-secondary sm">Clear</button>'+
    '</div><canvas class="paint-canvas" id="pCanvas" width="640" height="440" tabindex="0" aria-label="Drawing canvas"></canvas>'+
    '<div class="paint-save"><input id="pName" maxlength="24" placeholder="Your name (optional)" aria-label="Your name"><button id="pSave" class="btn btn-primary">Put it on the wall</button><a id="pDown" class="btn btn-secondary" download="paint.png">Download</a><span id="pMsg" class="t3"></span></div></div>'+
    '<div class="paint-right"><h3>The wall</h3><p class="t3">Everyone who visits can paint. Everything saved shows up here, for everyone.</p><div id="pGallery" class="wall-host"><p class="t3">Loading the wall…</p></div></div></div>';

  var canvas=root.querySelector('#pCanvas'),ctx=canvas.getContext('2d');
  ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
  var color='#161616',size=6,drawing=false,last=null,undo=[];
  function snap(){undo.push(ctx.getImageData(0,0,canvas.width,canvas.height));if(undo.length>20)undo.shift()}
  root.querySelectorAll('.pcolor').forEach(function(b){b.addEventListener('click',function(){color=b.dataset.c;root.querySelectorAll('.pcolor,#pErase').forEach(function(x){x.classList.remove('active')});b.classList.add('active')})});
  root.querySelector('#pErase').addEventListener('click',function(e){color='#FFFFFF';root.querySelectorAll('.pcolor,#pErase').forEach(function(x){x.classList.remove('active')});e.currentTarget.classList.add('active')});
  root.querySelector('#pSize').addEventListener('input',function(e){size=+e.target.value});
  root.querySelector('#pUndo').addEventListener('click',function(){var u=undo.pop();if(u)ctx.putImageData(u,0,0)});
  function pos(e){var r=canvas.getBoundingClientRect();var t=e.touches?e.touches[0]:e;return{x:(t.clientX-r.left)*(canvas.width/r.width),y:(t.clientY-r.top)*(canvas.height/r.height)}}
  function start(e){snap();drawing=true;last=pos(e);dot(last);e.preventDefault()}
  function dot(p){ctx.fillStyle=color;ctx.beginPath();ctx.arc(p.x,p.y,size/2,0,Math.PI*2);ctx.fill()}
  function move(e){if(!drawing)return;var p=pos(e);ctx.strokeStyle=color;ctx.lineWidth=size;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();last=p;e.preventDefault()}
  function end(){drawing=false}
  canvas.addEventListener('mousedown',start);canvas.addEventListener('mousemove',move);window.addEventListener('mouseup',end);
  canvas.addEventListener('touchstart',start,{passive:false});canvas.addEventListener('touchmove',move,{passive:false});canvas.addEventListener('touchend',end);
  root.querySelector('#pClear').addEventListener('click',function(){snap();ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height)});
  root.querySelector('#pDown').addEventListener('click',function(){this.href=canvas.toDataURL('image/png')});

  var g=root.querySelector('#pGallery'),msg=root.querySelector('#pMsg');
  function renderGallery(){TRWall.list('paint').then(function(res){g.innerHTML=TRWall.galleryHTML(res,'paint')})}
  root.querySelector('#pSave').addEventListener('click',function(){
    var btn=this;btn.disabled=true;msg.textContent='Saving…';
    var data=canvas.toDataURL('image/png'),who=root.querySelector('#pName').value;
    TRWall.post('paint',data,who).then(function(r){
      msg.textContent=r.online?'On the wall.':'Wall offline — saved on this device.';btn.disabled=false;
      /* show it at once: the wall's listing lags a minute behind a save */
      var mine={id:'just-now',src:data,ts:Date.now(),name:who||''};
      TRWall.list('paint').then(function(res){if(!res.items.some(function(i){return i.ts>mine.ts-3000&&i.name===mine.name&&i.id!=='just-now'}))res.items.unshift(mine);g.innerHTML=TRWall.galleryHTML(res,'paint')});
      setTimeout(renderGallery,65000);
    }).catch(function(err){msg.textContent=err.message||'Could not save.';btn.disabled=false});
  });
  renderGallery();
};
