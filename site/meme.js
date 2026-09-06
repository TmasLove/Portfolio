/* Meme Maker — Tommy's 2018 "Follow MeMe" generator (TmasLove/second-proj), without the signup.
   Same Impact top/bottom text and word-wrapping as the original memeScript.js; the feed is the public wall. */
window.initMeme=function(root){
  root.innerHTML='<div class="meme-wrap"><div class="meme-left"><h2 class="meme-title">Create New Meme</h2><canvas class="meme-canvas" width="750" height="500" aria-label="Meme canvas"></canvas>'+
    '<div class="meme-tools"><label class="btn btn-secondary sm file-btn">Choose a file<input type="file" accept="image/*" hidden></label>'+
    '<input class="meme-text" data-t="1" placeholder="Top Text" maxlength="80"><input class="meme-size" data-s="1" type="number" value="60" min="30" max="90" aria-label="Top text size">'+
    '<input class="meme-text" data-t="2" placeholder="Bottom Text" maxlength="80"><input class="meme-size" data-s="2" type="number" value="60" min="30" max="90" aria-label="Bottom text size"></div>'+
    '<div class="paint-save"><input class="meme-name" maxlength="24" placeholder="Your name (optional)" aria-label="Your name"><button class="btn btn-primary" data-post disabled>Post to the wall</button><a class="btn btn-secondary" data-down download="meme.png">Download</a><span class="t3" data-msg></span></div></div>'+
    '<div class="meme-right"><h3>The wall</h3><p class="t3">No sign-up. Make a meme, post it, everyone sees it.</p><div class="wall-host" data-feed><p class="t3">Loading the wall…</p></div></div></div>';
  var canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d'),image=null,lines=0;
  var t1=root.querySelector('[data-t="1"]'),t2=root.querySelector('[data-t="2"]'),s1=root.querySelector('[data-s="1"]'),s2=root.querySelector('[data-s="2"]'),post=root.querySelector('[data-post]'),msg=root.querySelector('[data-msg]');
  function blank(){ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#223333';ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.font='70px Impact, "Arial Black", sans-serif';ctx.textAlign='center';wrap(ctx,'Upload an image for the next greatest MeMe!',canvas.width/2,canvas.height/3,canvas.width-60,70,false)}
  function wrap(c,text,x,y,maxWidth,lineHeight,stroke){
    var words=text.split(' '),line=' ',count=0;
    for(var i=0;i<words.length;i++){
      var test=words[i],m=c.measureText(test);
      while(m.width>maxWidth&&test.length>1){test=test.substring(0,test.length-1);m=c.measureText(test)}
      if(words[i]!==test){words.splice(i+1,0,words[i].substr(test.length));words[i]=test}
      test=line+words[i]+' ';m=c.measureText(test);
      if(m.width>maxWidth&&i>0){c.textAlign='center';c.fillText(line,x,y);if(stroke)c.strokeText(line,x,y);line=words[i]+' ';y+=lineHeight;count++}
      else line=test;
    }
    c.textAlign='center';c.fillText(line,x,y);if(stroke)c.strokeText(line,x,y);return count;
  }
  function draw(){
    if(!image)return blank();
    ctx.clearRect(0,0,canvas.width,canvas.height);
    /* fit the picture like the original: stretched to the canvas */
    ctx.drawImage(image,0,0,canvas.width,canvas.height);
    ctx.fillStyle='#fff';ctx.strokeStyle='#111';ctx.lineWidth=3;ctx.lineJoin='round';
    var a=+s1.value||60,b=+s2.value||60;
    ctx.font=a+'px Impact, "Arial Black", sans-serif';wrap(ctx,t1.value.toUpperCase(),canvas.width/2,a+8,canvas.width-60,a-6,true);
    ctx.font=b+'px Impact, "Arial Black", sans-serif';
    /* measure how many lines the bottom text needs, then draw it up from the bottom */
    var probe=document.createElement('canvas').getContext('2d');probe.font=ctx.font;lines=wrap(probe,t2.value.toUpperCase(),0,0,canvas.width-60,b-6,false);
    wrap(ctx,t2.value.toUpperCase(),canvas.width/2,canvas.height-lines*(b-6)-16,canvas.width-60,b-6,true);
    post.disabled=false;
  }
  [t1,t2,s1,s2].forEach(function(el){el.addEventListener('input',draw)});
  root.querySelector('input[type=file]').addEventListener('change',function(){
    var f=this.files&&this.files[0];if(!f)return;var r=new FileReader();r.onload=function(e){image=new Image();image.onload=draw;image.src=e.target.result;t1.value='';t2.value=''};r.readAsDataURL(f);
  });
  root.querySelector('[data-down]').addEventListener('click',function(){this.href=canvas.toDataURL('image/png')});
  var feed=root.querySelector('[data-feed]');
  function renderFeed(){TRWall.list('meme').then(function(res){feed.innerHTML=TRWall.galleryHTML(res,'meme')})}
  post.addEventListener('click',function(){
    post.disabled=true;msg.textContent='Posting…';
    var data=canvas.toDataURL('image/jpeg',.88),who=root.querySelector('.meme-name').value;
    TRWall.post('meme',data,who).then(function(r){msg.textContent=r.online?'On the wall.':'Wall offline — saved on this device.';post.disabled=false;var mine={id:'just-now',src:data,ts:Date.now(),name:who||''};TRWall.list('meme').then(function(res){res.items.unshift(mine);feed.innerHTML=TRWall.galleryHTML(res,'meme')});setTimeout(renderFeed,65000)}).catch(function(err){msg.textContent=err.message||'Could not post.';post.disabled=false});
  });
  blank();renderFeed();
};
