/* The public wall: drawings from Paint and memes from Meme Maker, shared by everyone who visits.
   Talks to the wall server; when it cannot be reached, saves on this device only and says so. */
window.TRWall=(function(){
  var API='https://tommyroldan-wall.troldan92.workers.dev';
  var LOCAL='wall.local.';
  function local(kind){try{return JSON.parse(localStorage.getItem(LOCAL+kind)||'[]')}catch(e){return[]}}
  function setLocal(kind,arr){try{localStorage.setItem(LOCAL+kind,JSON.stringify(arr.slice(0,24)))}catch(e){}}
  function list(kind){
    return fetch(API+'/api/wall/'+kind+'?limit=120',{mode:'cors'}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){
      return {online:true,items:j.items.map(function(i){return{id:i.id,src:API+i.url,ts:i.ts*1000,name:i.name||'',w:i.w,h:i.h}})};
    }).catch(function(){return {online:false,items:local(kind).map(function(d){return{id:'local-'+d.ts,src:d.data,ts:d.ts,name:'you (this device)'}})}});
  }
  function post(kind,dataURL,name){
    return fetch(API+'/api/wall/'+kind,{method:'POST',mode:'cors',headers:{'Content-Type':'application/json'},body:JSON.stringify({data:dataURL,name:name||''})})
      .then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error(j.error||'failed');return {online:true,item:j}})})
      .catch(function(err){
        if(err&&/slow down|too big|not an image|only/.test(err.message||''))throw err;
        var arr=local(kind);arr.unshift({data:dataURL,ts:Date.now()});setLocal(kind,arr);
        return {online:false};
      });
  }
  function galleryHTML(res,kind){
    if(!res.items.length)return '<p class="t3">'+(res.online?'Nothing on the wall yet — be the first.':'The wall is offline right now; anything you save stays on this device until it is back.')+'</p>';
    return (res.online?'':'<p class="t3">The wall is offline right now — showing what you saved on this device.</p>')+'<div class="wall-grid">'+res.items.map(function(i){
      var when=new Date(i.ts).toLocaleDateString('en-US',{month:'short',day:'numeric'});
      return '<figure class="wall-item"><a href="'+i.src+'" target="_blank" rel="noopener"><img src="'+i.src+'" alt="'+(kind==='paint'?'Drawing':'Meme')+(i.name?' by '+i.name.replace(/"/g,'&quot;'):'')+'" loading="lazy"></a><figcaption>'+(i.name?'<b>'+i.name.replace(/</g,'&lt;')+'</b> · ':'')+when+'</figcaption></figure>';
    }).join('')+'</div>';
  }
  function notes(){
    return fetch(API+'/api/wall/notes?limit=120',{mode:'cors'}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){return {online:true,items:j.items.map(function(i){return{name:i.name||'',message:i.message||'',rating:i.rating||0,ts:i.ts*1000}})}})
      .catch(function(){return {online:false,items:local('notes')}});
  }
  function postNote(name,message,rating){
    return fetch(API+'/api/wall/notes',{method:'POST',mode:'cors',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:name||'',message:message,rating:rating})})
      .then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error(j.error||'failed');return {online:true}})})
      .catch(function(err){if(err&&/slow down|too long/.test(err.message||''))throw err;var arr=local('notes');arr.unshift({name:name||'',message:message,rating:rating,ts:Date.now()});setLocal('notes',arr);return {online:false}});
  }
  return {list:list,post:post,notes:notes,postNote:postNote,galleryHTML:galleryHTML,API:API};
})();
