/* The rest of the Mac: Control Centre (appearance, wallpaper, motion), Notification Centre, the desktop's
   right-click menu, Mission Control, the Guestbook wall, a first-visit tour, and Stickies.
   Uses the shell's API on window.TR. Settings persist in localStorage; nothing here needs a server. */
(function(){
'use strict';
var T=window.TR; if(!T) return;
var esc=T.esc, store={get:function(k,d){try{var v=localStorage.getItem('tr.'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set:function(k,v){try{localStorage.setItem('tr.'+k,JSON.stringify(v))}catch(e){}}};

/* ---------- settings: appearance + wallpaper + motion ---------- */
var WALLS=[
 ['dusk','Miami dusk','linear-gradient(155deg,#2B2350 0%,#4A54DC 34%,#0E7C93 66%,#F2B07A 100%)'],
 ['sonoma','Sonoma','linear-gradient(160deg,#0f2b4a 0%,#1f6fb2 45%,#8fd3f4 100%)'],
 ['sequoia','Sequoia','linear-gradient(150deg,#1d1b3a 0%,#7b3fa0 40%,#f26b6b 75%,#ffd27a 100%)'],
 ['graphite','Graphite','linear-gradient(160deg,#1a1b1f 0%,#3a3d45 55%,#6b6f7a 100%)'],
 ['mint','Mint','linear-gradient(150deg,#0b3b3a 0%,#00A88F 55%,#c8f4e6 100%)'],
 ['gt3rs','GT3 RS at night (photo)','url(/assets/wall/gt3rs.jpg) center/cover #07090c']
];
function applySettings(){
  var s={theme:store.get('theme','light'),wall:store.get('wall','dusk'),motion:store.get('motion',true)};if(s.wall==='fixie'){s.wall='gt3rs';store.set('wall','gt3rs')}
  document.documentElement.classList.toggle('dark',s.theme==='dark');
  document.documentElement.classList.toggle('still',!s.motion);
  var w=WALLS.filter(function(x){return x[0]===s.wall})[0]||WALLS[0];
  document.documentElement.style.setProperty('--wallpaper',w[2]);
  return s;
}
var S=applySettings();
function ccHTML(){
  var s=applySettings();
  return '<div class="cc"><div class="cc-row"><button class="cc-tile'+(s.theme==='dark'?' on':'')+'" data-cc="theme"><span class="cc-ico">'+(s.theme==='dark'?'☾':'☀')+'</span><span><b>Appearance</b><small>'+(s.theme==='dark'?'Dark':'Light')+'</small></span></button><button class="cc-tile'+(s.motion?' on':'')+'" data-cc="motion"><span class="cc-ico">✦</span><span><b>Motion</b><small>'+(s.motion?'On':'Reduced')+'</small></span></button></div>'+
  '<div class="cc-block"><b>Wallpaper</b><div class="cc-walls">'+WALLS.map(function(w){return '<button class="cc-wall'+(w[0]===s.wall?' on':'')+'" data-wall="'+w[0]+'" title="'+esc(w[1])+'" style="background:'+w[2]+'"></button>'}).join('')+'</div></div>'+
  '<div class="cc-block cc-links"><button data-open="launchpad">Launchpad</button><button data-open="spotlight">Spotlight ⌘K</button><button data-open="mission">Mission Control F3</button><button data-open="tour">Take the tour</button></div></div>';
}
function toast(title,body){var host=document.getElementById('toasts');if(!host)return;var t=document.createElement('div');t.className='toast';t.innerHTML='<b>'+esc(title)+'</b><span>'+esc(body)+'</span>';host.appendChild(t);setTimeout(function(){t.classList.add('out');setTimeout(function(){t.remove()},300)},4200)}
function bindCC(root){
  root.querySelectorAll('[data-cc]').forEach(function(b){b.addEventListener('click',function(){var k=b.dataset.cc;if(k==='theme')store.set('theme',store.get('theme','light')==='dark'?'light':'dark');if(k==='motion')store.set('motion',!store.get('motion',true));root.innerHTML=ccHTML();bindCC(root)})});
  root.querySelectorAll('[data-wall]').forEach(function(b){b.addEventListener('click',function(){store.set('wall',b.dataset.wall);root.innerHTML=ccHTML();bindCC(root)})});
  root.querySelectorAll('[data-open]').forEach(function(b){b.addEventListener('click',function(){closePanels();var k=b.dataset.open;if(k==='launchpad')T.openLP();if(k==='spotlight')T.openSpot();if(k==='mission')openMission();if(k==='tour')startTour(true)})});
}
/* ---------- menu bar panels ---------- */
var panelHost=document.getElementById('panels');
function closePanels(){if(panelHost)panelHost.innerHTML='';document.querySelectorAll('.mb-item.open').forEach(function(b){b.classList.remove('open')})}
function openPanel(kind,anchor){
  closePanels();T.closeMenus();
  var p=document.createElement('div');p.className='panel-drop '+kind;
  p.addEventListener('click',function(e){e.stopPropagation()});
  if(kind==='cc'){p.innerHTML=ccHTML();bindCC(p)}
  else p.innerHTML=ncHTML();
  panelHost.appendChild(p);anchor.classList.add('open');
  if(kind==='nc')p.querySelectorAll('[data-go]').forEach(function(b){b.addEventListener('click',function(){closePanels();T.openApp(b.dataset.go)})});
  setTimeout(function(){document.addEventListener('click',function h(e){if(!p.contains(e.target)&&e.target!==anchor&&!anchor.contains(e.target)){closePanels();document.removeEventListener('click',h)}})},0);
}
/* Notification Centre: the site's own news, in Tommy's words, each one opening the thing it is about */
var NEWS=[
 ['Canary','Free Windows diagnostic tool that finds failing drives and crash causes your vendor software calls healthy.','canary'],
 ['Rehab Pro','iPhone app that builds a daily rehab plan around where it hurts, how it hurts today, and the time you actually have.','rehabpro'],
 ['Brick Breaker','The 2015 game is back from the archive. Left/Right to play.','brick'],
 ['Light Cycles','A small Armagetron-style light cycle arena. Hug a wall to go faster.','cycles'],
 ['Meme Maker','Create, download & post memes to an anonymous public feed.','meme'],
 ['Music','Chill Web — '+'@tmizle on Apple Music.','music'],
 ['Paint','Everyone who visits can paint. Everything saved shows up on the wall.','paint']
];
function ncHTML(){
  var d=new Date();
  return '<div class="nc"><div class="nc-date"><b>'+d.toLocaleDateString('en-US',{weekday:'long'})+'</b><span>'+d.toLocaleDateString('en-US',{month:'long',day:'numeric'})+'</span></div>'+NEWS.map(function(n){return '<button class="nc-item" data-go="'+n[2]+'"><b>'+esc(n[0])+'</b><span>'+esc(n[1])+'</span></button>'}).join('')+'</div>';
}
var mb=document.getElementById('menubar');
if(mb){
  var ccBtn=document.getElementById('mbCC'),clock=document.getElementById('mbClock');
  if(ccBtn)ccBtn.addEventListener('click',function(e){e.stopPropagation();if(ccBtn.classList.contains('open'))closePanels();else openPanel('cc',ccBtn)});
  if(clock)clock.addEventListener('click',function(e){e.stopPropagation();if(clock.classList.contains('open'))closePanels();else openPanel('nc',clock)});
}

/* ---------- desktop right-click ---------- */
var desk=document.getElementById('desktop');
function ctxMenu(x,y){
  closePanels();T.closeMenus();
  var items=[['New Sticky Note',function(){addSticky()}],['Change Wallpaper…',function(){openPanel('cc',ccBtn)}],[store.get('theme','light')==='dark'?'Use Light Appearance':'Use Dark Appearance',function(){store.set('theme',store.get('theme','light')==='dark'?'light':'dark');applySettings()}],null,['Show Desktop',function(){showDesktop()}],['Mission Control',function(){openMission()}],['Launchpad',function(){T.openLP()}],null,['Open in Terminal',function(){T.openApp('terminal')}],['Clean Up',function(){location.reload()}]];
  var ul=document.createElement('ul');ul.className='menu ctx';
  items.forEach(function(it){if(!it){var s=document.createElement('li');s.className='sep';ul.appendChild(s);return}var li=document.createElement('li');li.innerHTML='<span>'+esc(it[0])+'</span>';li.addEventListener('click',function(e){e.stopPropagation();ul.remove();it[1]()});ul.appendChild(li)});
  ul.style.left=Math.min(x,window.innerWidth-240)+'px';ul.style.top=Math.min(y,window.innerHeight-330)+'px';
  document.body.appendChild(ul);
}
if(desk){desk.addEventListener('contextmenu',function(e){if(e.target.closest('.win,.dock,.menubar,.dicon'))return;e.preventDefault();ctxMenu(e.clientX,e.clientY)})}
document.addEventListener('click',function(){var c=document.querySelector('.menu.ctx');if(c)c.remove()});
function showDesktop(){Object.keys(T.openMap).forEach(function(k){T.minimize(T.openMap[k])})}

/* ---------- mission control ---------- */
var mc=document.getElementById('mission');
function openMission(){
  if(!mc)return;
  var wins=Object.keys(T.openMap).map(function(k){return T.openMap[k]});
  mc.innerHTML='<div class="mc-title">'+(wins.length?wins.length+' window'+(wins.length>1?'s':''):'No open windows')+'</div><div class="mc-grid">'+wins.map(function(w){return '<button class="mc-card" data-k="'+esc(w.key)+'"><span class="mc-shot"></span><span class="mc-name">'+esc(w.title)+'</span></button>'}).join('')+'</div>';
  mc.hidden=false;document.body.classList.add('mc-open');
  wins.forEach(function(w){var card=mc.querySelector('.mc-card[data-k="'+w.key+'"] .mc-shot');var clone=w.el.cloneNode(true);clone.classList.remove('min','closing');clone.classList.add('show','mc-clone');clone.style.left='0';clone.style.top='0';clone.style.zIndex='';clone.querySelectorAll('iframe').forEach(function(f){f.remove()});var sw=w.el.offsetWidth||600,sh=w.el.offsetHeight||400;clone.style.width=sw+'px';clone.style.height=sh+'px';var k=Math.min(280/sw,170/sh);clone.style.transform='scale('+k+')';card.style.width=Math.round(sw*k)+'px';card.style.height=Math.round(sh*k)+'px';card.appendChild(clone)});
  mc.querySelectorAll('.mc-card').forEach(function(b){b.addEventListener('click',function(e){e.stopPropagation();closeMission();T.restore(T.openMap[b.dataset.k])})});
}
function closeMission(){if(mc){mc.hidden=true;mc.innerHTML='';document.body.classList.remove('mc-open')}}
if(mc)mc.addEventListener('click',function(e){if(e.target===mc||e.target.classList.contains('mc-grid')||e.target.classList.contains('mc-title'))closeMission()});
document.addEventListener('keydown',function(e){if(e.key==='F3'){e.preventDefault();mc&&mc.hidden?openMission():closeMission()}if(e.key==='Escape'){if(mc&&!mc.hidden)closeMission();closePanels();var c=document.querySelector('.menu.ctx');if(c)c.remove();var tr=document.getElementById('tour');if(tr&&!tr.hidden)endTour()}});

/* ---------- stickies ---------- */
var stickHost=document.getElementById('stickies');
var STICKY_SEED=[{c:'yellow',t:'Tommy Roldan\nWeb Developer & Creative\nMiami, FL\n\ntroldan@terryco.com',x:60,y:60},{c:'blue',t:'Building products that move the work forward.\n\nBuilding since 2015.\nSteady output, sharp lines.\nPowered by café con leche.',x:60,y:250}];
function renderStickies(){
  if(!stickHost)return;stickHost.innerHTML='';
  var list=store.get('stickies',null);if(list===null){list=STICKY_SEED;store.set('stickies',list)}
  list.forEach(function(s,i){
    var el=document.createElement('div');el.className='sticky '+s.c;el.style.left=s.x+'px';el.style.top=s.y+'px';
    el.innerHTML='<div class="sticky-bar"><button class="sticky-x" aria-label="Close note">×</button></div><textarea spellcheck="false" aria-label="Sticky note">'+esc(s.t)+'</textarea>';
    var ta=el.querySelector('textarea');ta.addEventListener('input',function(){var l=store.get('stickies',[]);l[i].t=ta.value;store.set('stickies',l)});
    el.querySelector('.sticky-x').addEventListener('click',function(){var l=store.get('stickies',[]);l.splice(i,1);store.set('stickies',l);renderStickies()});
    var bar=el.querySelector('.sticky-bar');bar.addEventListener('mousedown',function(e){if(e.target.closest('.sticky-x'))return;var sx=e.clientX,sy=e.clientY,ol=el.offsetLeft,ot=el.offsetTop;function mv(ev){el.style.left=Math.max(0,ol+ev.clientX-sx)+'px';el.style.top=Math.max(30,ot+ev.clientY-sy)+'px'}function up(){window.removeEventListener('mousemove',mv);window.removeEventListener('mouseup',up);var l=store.get('stickies',[]);l[i].x=el.offsetLeft;l[i].y=el.offsetTop;store.set('stickies',l)}window.addEventListener('mousemove',mv);window.addEventListener('mouseup',up);e.preventDefault()});
    stickHost.appendChild(el);
  });
}
function addSticky(){var l=store.get('stickies',[]);l.push({c:['yellow','blue','green','pink'][l.length%4],t:'',x:80+l.length*24,y:80+l.length*24});store.set('stickies',l);renderStickies();var last=stickHost.querySelector('.sticky:last-child textarea');if(last)last.focus()}
function resetStickies(){store.set('stickies',STICKY_SEED);renderStickies()}
renderStickies();

/* ---------- guestbook: a wall of sticky notes ---------- */
var GB_COLORS=['yellow','blue','green','pink','peach','lilac'];
function gbColor(seed){var h=0;for(var i=0;i<seed.length;i++)h=(h*31+seed.charCodeAt(i))>>>0;return GB_COLORS[h%GB_COLORS.length]}
function gbInitials(n){n=(n||'').trim();if(!n)return '?';var p=n.split(/\s+/);return (p[0][0]+(p[1]?p[1][0]:'')).toUpperCase()}
function guestbookHTML(){return '<div class="gb"><aside class="gb-form"><h2>Leave a note</h2><p class="t3">Say hi, rate the visit, pin it to the wall. Everyone who comes after you will see it.</p>'+
 '<label class="gb-l">Name<input class="gb-name" maxlength="24" placeholder="Anonymous" aria-label="Your name"></label>'+
 '<label class="gb-l">Note<textarea class="gb-msg" maxlength="420" rows="5" placeholder="What did you think?" aria-label="Your message"></textarea><span class="gb-count">0 / 420</span></label>'+
 '<div class="gb-rate" role="radiogroup" aria-label="Rating">'+[1,2,3,4,5].map(function(n){return '<button class="gb-star" data-n="'+n+'" aria-label="'+n+' stars">★</button>'}).join('')+'<span class="gb-rate-word"></span></div>'+
 '<div class="gb-preview sticky-card yellow"><span class="gb-av">?</span><p class="gb-text">Your note will look like this.</p><span class="gb-meta">now · ★★★★★</span></div>'+
 '<div class="paint-save"><button class="btn btn-primary" data-post disabled>Pin it to the wall</button><span class="t3" data-msg></span></div></aside>'+
 '<section class="gb-wall"><div class="gb-head"><h3>On the wall <span class="gb-n"></span></h3><div class="gb-sort"><button class="on" data-sort="new">Newest</button><button data-sort="top">Top rated</button></div></div><div class="gb-list" data-list><p class="t3">Loading…</p></div></section></div>'}
function noteCard(n,i){var name=n.name||'Anonymous',col=gbColor(name+(n.ts||''));var rot=((i*7)%5-2)*.6;return '<div class="sticky-card '+col+'" style="--rot:'+rot+'deg;--i:'+i+'"><span class="gb-av">'+esc(gbInitials(n.name))+'</span><p class="gb-text">'+esc(n.message)+'</p><span class="gb-meta"><b>'+esc(name)+'</b> · '+new Date(n.ts).toLocaleDateString('en-US',{month:'short',day:'numeric'})+' · <i class="gb-stars">'+'★'.repeat(n.rating||0)+'</i></span></div>'}
function initGuestbook(root){
  root.innerHTML=guestbookHTML();var rating=5,sort='new',items=[],online=true;
  var WORDS={1:'rough',2:'meh',3:'decent',4:'nice',5:'loved it'};
  var name=root.querySelector('.gb-name'),msg=root.querySelector('.gb-msg'),count=root.querySelector('.gb-count'),post=root.querySelector('[data-post]'),status=root.querySelector('[data-msg]'),list=root.querySelector('[data-list]'),nEl=root.querySelector('.gb-n'),prev=root.querySelector('.gb-preview');
  function paint(){root.querySelectorAll('.gb-star').forEach(function(b){b.classList.toggle('on',+b.dataset.n<=rating)});root.querySelector('.gb-rate-word').textContent=WORDS[rating]}
  root.querySelectorAll('.gb-star').forEach(function(b){b.addEventListener('click',function(){rating=+b.dataset.n;paint();preview()});b.addEventListener('mouseenter',function(){root.querySelectorAll('.gb-star').forEach(function(x){x.classList.toggle('hover',+x.dataset.n<=+b.dataset.n)})});b.addEventListener('mouseleave',function(){root.querySelectorAll('.gb-star').forEach(function(x){x.classList.remove('hover')})})});
  function preview(){var nm=name.value.trim()||'Anonymous';prev.className='gb-preview sticky-card '+gbColor(nm);prev.querySelector('.gb-av').textContent=gbInitials(name.value);prev.querySelector('.gb-text').textContent=msg.value.trim()||'Your note will look like this.';prev.querySelector('.gb-meta').textContent=nm+' · now · '+'★'.repeat(rating);count.textContent=msg.value.length+' / 420';post.disabled=!msg.value.trim()}
  name.addEventListener('input',preview);msg.addEventListener('input',preview);paint();preview();
  function render(){var arr=items.slice();if(sort==='top')arr.sort(function(a,b){return (b.rating||0)-(a.rating||0)||b.ts-a.ts});nEl.textContent=items.length?'· '+items.length:'';list.innerHTML=(online?'':'<p class="t3">The wall is offline right now — showing notes saved on this device.</p>')+(arr.length?'<div class="gb-grid">'+arr.map(noteCard).join('')+'</div>':'<div class="gb-empty"><span class="sticky-card yellow" style="--rot:-2deg"><span class="gb-av">✎</span><p class="gb-text">Nothing on the wall yet. Be the first.</p></span></div>')}
  function load(){TRWall.notes().then(function(res){items=res.items;online=res.online;render()})}
  root.querySelectorAll('[data-sort]').forEach(function(b){b.addEventListener('click',function(){sort=b.dataset.sort;root.querySelectorAll('[data-sort]').forEach(function(x){x.classList.toggle('on',x===b)});render()})});
  post.addEventListener('click',function(){var m=msg.value.trim();if(!m)return;post.disabled=true;status.textContent='Pinning…';TRWall.postNote(name.value,m,rating).then(function(r){status.textContent=r.online?'Pinned.':'Wall offline — saved on this device.';items.unshift({name:name.value.trim(),message:m,rating:rating,ts:Date.now()});online=r.online;render();msg.value='';preview();if(T.extras)T.extras.toast('Pinned to the wall','Thanks — it is up for everyone.');setTimeout(load,5000)}).catch(function(e){status.textContent=e.message||'Could not post.';post.disabled=false})});
  load();
}
T.register('guestbook','Guestbook',function(){var w=T.createWindow('guestbook','Guestbook',{w:1000,h:660,dockKey:'guestbook',appName:'Guestbook',minW:520});var d=document.createElement('div');d.className='page gb-page';w.body.appendChild(d);initGuestbook(d)},function(sheetBody){var d=document.createElement('div');d.className='page gb-page';sheetBody.appendChild(d);initGuestbook(d)});

/* ---------- first-visit tour ---------- */
var STEPS=[
 ['Welcome to my desk','This portfolio is a Mac. Every project I shipped is an app on it. Click around like you would on a real one.',null],
 ['The folders','Apps, Websites, Tools and Games. Open one and click an icon: it opens a case file with the live site inside.','#iconGrid'],
 ['The Dock','Finder, Brave, Music, Paint, Little River, Terminal, Trash. Brave has every site I built. Trash has the archive.','#dock'],
 ['Shortcuts','⌘K searches everything. F4 opens Launchpad. F3 shows every open window. Right-click the desktop for wallpapers and dark mode.','#menubar'],
 ['Say hi','Leave a note in the Guestbook, paint something, or make a meme. Everything visitors save goes on the wall.','#dock']
];
var tour=document.getElementById('tour'),ti=0;
function startTour(force){if(!tour||T.isPhone())return;if(!force&&store.get('toured',false))return;ti=0;tour.hidden=false;showStep()}
function showStep(){var s=STEPS[ti];tour.innerHTML='<div class="tour-card"><span class="tour-n">'+(ti+1)+' / '+STEPS.length+'</span><h3>'+esc(s[0])+'</h3><p>'+esc(s[1])+'</p><div class="tour-btns"><button class="btn btn-secondary sm" data-skip>Skip</button><button class="btn btn-primary sm" data-next>'+(ti===STEPS.length-1?'Done':'Next')+'</button></div></div>';document.querySelectorAll('.tour-spot').forEach(function(x){x.classList.remove('tour-spot')});if(s[2]){var el=document.querySelector(s[2]);if(el)el.classList.add('tour-spot')}tour.querySelector('[data-skip]').addEventListener('click',endTour);tour.querySelector('[data-next]').addEventListener('click',function(){ti++;if(ti>=STEPS.length)endTour();else showStep()})}
function endTour(){tour.hidden=true;document.querySelectorAll('.tour-spot').forEach(function(x){x.classList.remove('tour-spot')});store.set('toured',true)}
setTimeout(function(){startTour(false)},1400);

/* expose for the shell's menus */
T.extras={openMission:openMission,startTour:function(){startTour(true)},addSticky:addSticky,resetStickies:resetStickies,openCC:function(){openPanel('cc',ccBtn)},toggleTheme:function(){store.set('theme',store.get('theme','light')==='dark'?'light':'dark');applySettings()},showDesktop:showDesktop,toast:toast};
})();
