/* tommyroldan.com — the desktop shell (macOS on wide screens, iPhone launcher on phones).
   Every word on screen comes from the site's own content; this file is behaviour and chrome only. */
(function(){
'use strict';
if(window.__trShell) return; window.__trShell = true;

/* ---------- data ---------- */
/* fit: 'cover' = the art is a finished full-bleed icon; 'contain' = art sits on a white plate (transparent logos, badges). */
var APPS=[
 {key:'canary',title:'Canary',category:'tool',icon:'/assets/icons/canary.png',fit:'cover',init:'C',page:'/work/canary/',live:'https://tommyroldan.com/canary/',embed:true,shot:'/assets/live/canary-1440.jpg'},
 {key:'rehabpro',title:'Rehab Pro',category:'apps',icon:'/assets/icons/rehabpro.png',fit:'cover',init:'R',page:'/work/rehabpro/',live:'https://tommyroldan.com/rehabpro/',embed:true,shot:'/assets/live/rehabpro-1440.jpg'},
 {key:'clear-care-dental',title:'Clear Care Dental',category:'apps',icon:'/assets/icons/clear-care-dental.png',fit:'cover',init:'C',page:'/work/clear-care-dental/',live:'https://app.clearcaredentalgroup.com/login',embed:false,shot:'/assets/live/clear-care-dental-1440.jpg'},
 {key:'cleancare-enterprise',title:"Clear Care Dental's Enterprise Website",short:'CCD Enterprise',category:'apps',icon:'/assets/icons/cleancare-enterprise.png',fit:'cover',init:'C',page:'/work/cleancare-enterprise/',live:'https://clearcaredentalenterprise.com/',embed:false,shot:'/assets/live/cleancare-enterprise-1440.jpg'},
 {key:'cleancare-marketing',title:"Clear Care Dental Group's Website",short:'CCD Group',category:'web',icon:'/assets/icons/cleancare-marketing.png',fit:'cover',init:'C',page:'/work/cleancare-marketing/',live:'https://clearcaredentalgroup.com',embed:false,shot:'/assets/live/cleancare-marketing-1440.jpg'},
 {key:'world-resort-rescue',title:'World Resort Rescue',category:'web',icon:'/assets/icons/world-resort-rescue.png',fit:'contain',init:'W',page:'/work/world-resort-rescue/',live:'https://worldresortrescue.com',embed:true,shot:'/assets/live/world-resort-rescue-1440.jpg'},
 {key:'wrapme',title:'WrapMe',category:'web',icon:'/assets/icons/wrapme.png',fit:'cover',init:'W',page:'/work/wrapme/',live:'https://wrapme.app',embed:true,shot:'/assets/live/wrapme-1440.jpg'},
 {key:'versatile-customs',title:'Versatile Customs',category:'apps',icon:'/assets/icons/versatile-customs.jpg',fit:'cover',init:'V',page:'/work/versatile-customs/',live:'https://versatilecustom.com',embed:true,shot:'/assets/live/versatile-customs-1440.jpg'},
 {key:'alexandra-rossi',title:'Alexandra Rossi Portal',short:'Alexandra Rossi',category:'apps',icon:'/assets/icons/alexandra-rossi.png',fit:'cover',init:'A',page:'/work/alexandra-rossi/',live:'https://alexandrarossi.vercel.app/',embed:true,shot:'/assets/live/alexandra-rossi-1440.jpg'},
 {key:'nst-redesign',title:'NST Redesign',category:'web',icon:'/assets/icons/nst-redesign.png',fit:'cover',init:'N',page:'/work/nst-redesign/',live:'https://nstpharma.com',embed:true,shot:'/assets/live/nst-redesign-1440.jpg'},
 {key:'dolce-vita-supplements',title:'Dolce Vita Supplements',short:'Dolce Vita',category:'web',icon:'/assets/icons/dolce-vita-supplements.png',fit:'cover',init:'D',page:'/work/dolce-vita-supplements/',live:'https://www.dolcevitasupplements.com/',embed:false,shot:'/assets/live/dolce-vita-supplements-1440.jpg'},
 {key:'la-dolce-vita-casa',title:'La Dolce Vita Casa',category:'web',icon:'/assets/icons/la-dolce-vita-casa.png',fit:'cover',init:'L',page:'/work/la-dolce-vita-casa/',live:'https://ladolcevitacasa.com',embed:false,shot:'/assets/live/la-dolce-vita-casa-1440.jpg'},
 {key:'powerpoint-speech-tool',title:'PowerPoint Speech Tool',short:'PPT Speech',category:'tool',art:'ppt',init:'P',page:'/work/powerpoint-speech-tool/',live:'https://tommyroldan.com/ppt-speech/',embed:true,shot:'/assets/live/powerpoint-speech-tool-1440.jpg'},
 {key:'build-roldan',title:'Roldan Group',category:'web',art:'roldan',init:'R',page:'/work/build-roldan/',live:'https://buildroldan.com',embed:true,shot:'/assets/live/build-roldan-1440.jpg'},
 {key:'social-audit',title:'SocialAudit',category:'apps',icon:'/assets/icons/social-audit.png',fit:'cover',init:'S',page:'/work/social-audit/',live:null,embed:false,shot:null}
];
/* projects with no case page: [title, url, category label, year, description, badges] — words from /work/ */
var REST=[
 ['World Resort Rescue Portal','https://portal.worldresortrescue.com','Apps',2026,'Secure staff login portal, rebuilt from the database up with an audit trail.',['private','live']],
 ['GEO',null,'AI / Agents',2025,"Generative Engine Optimization agent that audits a site's AI crawlability, then auto-applies the fixes.",['private']],
 ['Voice Agent',null,'AI / Agents',2025,'Real-time AI voice agent for natural phone and chat conversations.',['private']],
 ['Bloodwork Pro',null,'Apps',2025,'Turns raw lab bloodwork into clear, trackable health insights.',['private']],
 ['NullScan',null,'Web',2026,'Automated security scanning for small businesses. Built, launched, and recently retired.',['public']],
 ['Cuatro Group','https://cuatro-group.vercel.app/en','Web',2026,'Multilingual corporate site for Cuatro Group.',['private','live']],
 ['Alexandra Rossi Collection',null,'Web',2025,'Boutique e-commerce store for custom wallpapers and linens.',['private']],
 ['Local Legend Predictor','https://local-legend-predictor.onrender.com','Tools',2026,'Connect your Strava and see how many more efforts you need to claim the Local Legend title.',['live']]
];
var ARCHIVED=[['Gravity Cycles',2015,'Custom Shopify website that made GRVT designs available to the public.'],['V&C Metal Supply Corp',2015,'Full website redesign for V&C Metal Supply Corp — cleaner, faster, modern.'],['Fixed Latinos',2015,'Application for the Fixed Latinos cycling team — community, routes & events.'],['Brick Breaker v1.0',2015,'A JS/Canvas game — break bricks with a ball while random RGBA balls appear for chaos.'],['Follow MeMe',2015,'Create, download & post memes to an anonymous public feed. Built on the MEAN stack.'],['Drinks on Demand',2015,'Alcohol delivery application — search, order, delivered. Full MEAN stack build.'],['Tropical Sun Design',2015,"Inspired by Miami's tropical atmosphere — a retro sun design originally sold online."],['Cycling Rick',2015,'A Rick & Morty-inspired design mashup with cycling culture.'],['GRVT Logo',2015,"Logo and brand identity for GRVT, my early cycling label. The brand didn't last, but the designs still hold up."]];
var LR={agents:37,departments:8,by:{'Marketing':11,'Clear Care Dental':7,'Studio':5,'Sales':5,'Support':4,'Research':2,'Floor & Chat':1,'Runtime':1,'Unassigned':1},asOf:'2026-09-05'};
var ME={name:'Tommy Roldan',role:'Web Developer & Creative',location:'Miami, FL',email:'troldan@terryco.com',hero:'Building products that move the work forward.',since:'Building since 2015.',
 taglines:['Building since 2015.','Steady output, sharp lines.','Powered by café con leche.','Always one more ride.','Made in Miami. 🌴'],
 stats:[['13+','Projects shipped'],['6','Live products'],['2015','Building since']],
 socials:[['LinkedIn','https://www.linkedin.com/in/tommy-roldan/'],['Instagram','https://instagram.com/tomcat.png'],['Strava','https://www.strava.com/athletes/14197229'],['Apple Music','https://music.apple.com/profile/tmizle'],['Steam','https://steamcommunity.com/id/shlumplord/'],['Discord','https://discord.gg/EJThXpcNn6']]};
var MUSIC={title:'Chill Web',page:'https://music.apple.com/us/playlist/chill-web/pl.u-06oxxNATom9ePX',embed:'https://embed.music.apple.com/us/playlist/chill-web/pl.u-06oxxNATom9ePX',profile:'https://music.apple.com/profile/tmizle',handle:'@tmizle'};

/* inline SVG art for the apps that have no icon file */
var ART={
 finder:'<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="fg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4FC3F7"/><stop offset="1" stop-color="#1E88E5"/></linearGradient></defs><rect width="64" height="64" fill="url(#fg)"/><path d="M0 0h32v64H0z" fill="#EAF6FE"/><path d="M14 20v10M50 20v10" stroke="#123C63" stroke-width="4" stroke-linecap="round"/><path d="M20 44c6 5 18 5 24 0" stroke="#123C63" stroke-width="4" fill="none" stroke-linecap="round"/></svg>',
 paint:'<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="#FFFFFF"/><path d="M32 12c-11 0-20 8-20 18s9 14 14 14c3 0 3-3 5-5s7-1 10-4 3-8 1-13-6-10-10-10z" fill="#F2B07A"/><circle cx="24" cy="26" r="3.4" fill="#FF5F57"/><circle cx="34" cy="22" r="3.4" fill="#4A54DC"/><circle cx="42" cy="30" r="3.4" fill="#00A88F"/><circle cx="26" cy="37" r="3.4" fill="#FEBC2E"/><path d="M44 46l10-10 4 4-10 10z" fill="#1C1A22"/></svg>',
 terminal:'<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="#161418"/><rect x="0" y="0" width="64" height="14" fill="#2A2733"/><path d="M14 26l10 8-10 8" stroke="#00E0C6" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M30 44h18" stroke="#00E0C6" stroke-width="4" stroke-linecap="round"/></svg>',
 trash:'<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="#E7E5EA"/><path d="M18 22h28l-3 28a4 4 0 0 1-4 4H25a4 4 0 0 1-4-4z" fill="#B9B6C2"/><path d="M27 28v20M32 28v20M37 28v20" stroke="#F4F3F6" stroke-width="3" stroke-linecap="round"/><rect x="15" y="15" width="34" height="6" rx="3" fill="#8E8B99"/><rect x="27" y="10" width="10" height="5" rx="2.5" fill="#8E8B99"/></svg>',
 ppt:'<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="#4A54DC"/><rect x="10" y="14" width="34" height="26" rx="4" fill="#fff"/><rect x="15" y="20" width="18" height="3" rx="1.5" fill="#4A54DC"/><rect x="15" y="27" width="24" height="3" rx="1.5" fill="#C9CCF5"/><rect x="15" y="33" width="14" height="3" rx="1.5" fill="#C9CCF5"/><path d="M47 24c3 2.5 3 9.5 0 12M52 19c6 5 6 17 0 22" stroke="#00E0C6" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M20 48h24" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>',
 roldan:'<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="#1E1B18"/><path d="M12 36l20-16 20 16" stroke="#D8B25C" stroke-width="3.5" fill="none" stroke-linejoin="round" stroke-linecap="round"/><path d="M18 34v16h28V34" stroke="#F4EFE6" stroke-width="3" fill="none" stroke-linejoin="round"/><rect x="28" y="40" width="8" height="10" fill="#D8B25C"/></svg>',
 brick:'<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="#0F2A2E"/><g fill="#62CB83"><rect x="8" y="10" width="14" height="6" rx="1"/><rect x="25" y="10" width="14" height="6" rx="1"/><rect x="42" y="10" width="14" height="6" rx="1"/><rect x="8" y="19" width="14" height="6" rx="1"/><rect x="25" y="19" width="14" height="6" rx="1"/><rect x="42" y="19" width="14" height="6" rx="1"/></g><circle cx="36" cy="38" r="4" fill="#F3CEF6"/><rect x="22" y="50" width="22" height="5" rx="2" fill="#6ECF9E"/></svg>',
 meme:'<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="#F2B07A"/><rect x="9" y="12" width="46" height="40" rx="4" fill="#fff"/><path d="M13 44l10-12 8 9 6-6 14 12H13z" fill="#4A54DC"/><circle cx="42" cy="22" r="4" fill="#FEBC2E"/><text x="32" y="26" text-anchor="middle" font-family="Impact,Arial Black,sans-serif" font-size="13" fill="#161616" stroke="#fff" stroke-width=".5">MEME</text></svg>',
 music:'<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="#FC3C44"/><path d="M40 14v28a7 7 0 1 1-4-6.3V21l-12 3v22a7 7 0 1 1-4-6.3V19l20-5z" fill="#fff"/></svg>',
 about:'<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="#4A54DC"/><circle cx="32" cy="24" r="10" fill="#fff"/><path d="M14 54c2-11 9-16 18-16s16 5 18 16z" fill="#fff"/></svg>',
 contact:'<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="#00A88F"/><rect x="10" y="18" width="44" height="30" rx="5" fill="#fff"/><path d="M12 22l20 14 20-14" stroke="#00A88F" stroke-width="3" fill="none" stroke-linejoin="round"/></svg>',
 tools:'<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="#2B2350"/><path d="M40 14a10 10 0 0 0-9.6 12.7L14 43l7 7 16.3-16.4A10 10 0 0 0 50 24l-6 6-5-1-1-5 6-6a10 10 0 0 0-4-4z" fill="#F2B07A"/></svg>',
 launchpad:'<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="lpg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4F4F7"/><stop offset="1" stop-color="#C9CAD2"/></linearGradient></defs><rect width="64" height="64" fill="url(#lpg)"/><g><rect x="12" y="12" width="11" height="11" rx="3" fill="#FF5F57"/><rect x="26.5" y="12" width="11" height="11" rx="3" fill="#FEBC2E"/><rect x="41" y="12" width="11" height="11" rx="3" fill="#28C840"/><rect x="12" y="26.5" width="11" height="11" rx="3" fill="#4A54DC"/><rect x="26.5" y="26.5" width="11" height="11" rx="3" fill="#00A88F"/><rect x="41" y="26.5" width="11" height="11" rx="3" fill="#F2B07A"/><rect x="12" y="41" width="11" height="11" rx="3" fill="#8B7DFF"/><rect x="26.5" y="41" width="11" height="11" rx="3" fill="#FC3C44"/><rect x="41" y="41" width="11" height="11" rx="3" fill="#3E9DE8"/></g></svg>',
 cycles:'<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="#07090c"/><path d="M8 8h48v48H8z" fill="none" stroke="rgba(0,224,198,.35)" stroke-width="1.5"/><path d="M12 40h18V20h14v24" fill="none" stroke="#00E0C6" stroke-width="4" stroke-linejoin="miter"/><path d="M52 16v22H38" fill="none" stroke="#FF5F57" stroke-width="4" stroke-linejoin="miter"/><rect x="42" y="42" width="5" height="5" fill="#fff"/></svg>',
 guestbook:'<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="#FEBC2E"/><rect x="12" y="10" width="40" height="44" rx="5" fill="#fff"/><path d="M20 22h24M20 30h24M20 38h16" stroke="#161616" stroke-width="3" stroke-linecap="round"/><path d="M44 44l-4 2 1-4 8-8 3 3z" fill="#4A54DC"/></svg>',
 doc:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M16 6h22l12 12v40H16z" fill="#fff" stroke="#9a9aa6" stroke-width="2"/><path d="M38 6v12h12" fill="#e6e6ec" stroke="#9a9aa6" stroke-width="2"/><path d="M22 30h20M22 38h20M22 46h14" stroke="#b8b8c4" stroke-width="3" stroke-linecap="round"/></svg>',
 folder:'<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="fd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FCBFF"/><stop offset="1" stop-color="#3E9DE8"/></linearGradient></defs><path d="M6 16a4 4 0 0 1 4-4h14l5 5h25a4 4 0 0 1 4 4v3H6z" fill="#2F86D6"/><rect x="6" y="22" width="52" height="30" rx="4" fill="url(#fd)"/><rect x="6" y="22" width="52" height="3" fill="rgba(255,255,255,.35)"/></svg>',
 littleriver:'<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="#EEF2F8"/><path d="M32 8l24 24-24 24L8 32z" fill="#2F5FA8"/><circle cx="32" cy="32" r="9" fill="#EEF2F8"/><circle cx="32" cy="32" r="4" fill="#2F5FA8"/></svg>'
};
var EXTRA=[{key:'brick',title:'Brick Breaker',art:'brick'},{key:'cycles',title:'Light Cycles',art:'cycles'},{key:'meme',title:'Meme Maker',art:'meme'}];
var REG={};
/* the desktop is grouped into folders (Tommy: "I kinda want to group them. And the games should be under a games folder") */
var FOLDERS=[
 {key:'apps',label:'Apps',members:function(){return APPS.filter(function(a){return a.category==='apps'})}},
 {key:'sites',label:'Websites',members:function(){return APPS.filter(function(a){return a.category==='web'})}},
 {key:'tools',label:'Tools',members:function(){return APPS.filter(function(a){return a.category==='tool'})}},
 {key:'games',label:'Games',members:function(){return EXTRA}}
];
var DOCK=[
 {key:'finder',label:'Finder',icon:'/assets/icons/dock-finder.png',fit:'plain',init:'F'},
 {key:'launchpad',label:'Launchpad',art:'launchpad'},
 {key:'brave',label:'Brave Browser',icon:'/assets/icons/dock-brave.png',fit:'contain',init:'B'},
 {key:'music',label:'Music',icon:'/assets/icons/dock-music.png',fit:'plain',init:'M'},
 {key:'paint',label:'Paint',art:'paint'},
 {key:'guestbook',label:'Guestbook',art:'guestbook'},
 {key:'littleriver',label:'Little River',icon:'/assets/icons/dock-littleriver.png',fit:'cover',init:'L'},
 {key:'terminal',label:'Terminal',art:'terminal'},
 {key:'trash',label:'Trash',icon:'/assets/icons/dock-trash.png',fit:'plain',init:'T'}
];
var PAGES={work:{title:'Work',url:'/work/',icon:'/assets/icons/dock-finder.png',fit:'plain'},about:{title:'About',url:'/about/',art:'about'},contact:{title:'Contact',url:'/contact/',art:'contact'},tools:{title:'Tools',url:'/tools/',art:'tools'}};

/* ---------- helpers ---------- */
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function sqHTML(o,cls){
  cls=cls||'';
  if(o.art)return '<span class="sq art '+cls+'">'+ART[o.art]+'</span>';
  if(o.icon)return '<span class="sq '+(o.fit||'contain')+' '+cls+'"><img src="'+o.icon+'" alt="" onerror="var p=this.parentNode;p.classList.add(\'letter\');p.setAttribute(\'data-init\',\''+esc(o.init||'')+'\');this.remove()"></span>';
  return '<span class="sq letter '+cls+'" data-init="'+esc(o.init||'')+'"></span>';
}
function appByKey(k){for(var i=0;i<APPS.length;i++)if(APPS[i].key===k)return APPS[i];return null}
function isPhone(){return matchMedia('(max-width:768px)').matches}
var reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
function label(a){return a.short||a.title}

/* ---------- desktop: four folders ---------- */
var grid=document.getElementById('iconGrid');
if(grid){
  FOLDERS.forEach(function(f,i){
    var b=document.createElement('button');
    b.className='dicon';b.title=f.label;
    b.innerHTML=sqHTML({art:'folder'},'folder')+'<span class="label">'+esc(f.label)+'</span>';
    b.addEventListener('click',function(){document.querySelectorAll('.dicon.sel').forEach(function(x){x.classList.remove('sel')});b.classList.add('sel');openFolder(f)});
    if(!reduced){b.style.opacity='0';b.style.transform='translateY(6px)';setTimeout(function(){b.style.transition='opacity .26s ease-out,transform .26s ease-out';b.style.opacity='';b.style.transform=''},Math.min(400,i*40))}
    grid.appendChild(b);
  });
  document.getElementById('desktop').addEventListener('mousedown',function(e){if(!e.target.closest('.dicon,.win,.dock,.menubar,.menu'))document.querySelectorAll('.dicon.sel').forEach(function(x){x.classList.remove('sel')})});
}
function folderHTML(f){
  var m=f.members();
  return '<div class="fgrid">'+m.map(function(a){return '<button class="ficon" data-key="'+esc(a.key)+'" title="'+esc(a.title)+'">'+sqHTML(a)+'<span class="label">'+esc(a.short||a.title)+'</span></button>'}).join('')+'</div><div class="fstatus">'+m.length+' items</div>';
}
function openFolder(f){
  if(isPhone()){sheet.hidden=false;sheetTitle.textContent=f.label;sheetBody.innerHTML=folderHTML(f);sheetBody.querySelectorAll('.ficon').forEach(function(b){b.addEventListener('click',function(){openApp(b.dataset.key)})});return}
  var w=createWindow('folder-'+f.key,f.label,{w:640,h:420,dockKey:'finder',appName:'Finder'});
  w.body.innerHTML=folderHTML(f);
  w.body.querySelectorAll('.ficon').forEach(function(b){b.addEventListener('click',function(){w.body.querySelectorAll('.ficon.sel').forEach(function(x){x.classList.remove('sel')});b.classList.add('sel');openApp(b.dataset.key)})});
}

/* ---------- dock (macOS magnification: the icon under the pointer grows, neighbours follow, the pill widens) ---------- */
var dockEl=document.getElementById('dock');
var dockIcons=[];
if(dockEl){
  DOCK.forEach(function(d){
    if(d.key==='trash'){var div=document.createElement('div');div.className='dock-div';dockEl.appendChild(div)}
    var b=document.createElement('button');
    b.className='dock-icon';b.dataset.key=d.key;b.setAttribute('aria-label',d.label);
    b.innerHTML=sqHTML(d)+'<span class="tip">'+esc(d.label)+'</span><span class="dot"></span>';
    b.addEventListener('click',function(){bounce(b);openApp(d.key)});
    dockEl.appendChild(b);dockIcons.push(b);
  });
  var BASE=52,GAP=6,MAXS=1.55,RADIUS=120;
  function bounce(b){if(reduced)return;var sq=b.querySelector('.sq');sq.classList.remove('bounce');void sq.offsetWidth;sq.classList.add('bounce');setTimeout(function(){sq.classList.remove('bounce')},460)}
  function dockLayout(mx){
    var widths=dockIcons.map(function(ic){return ic.offsetWidth});
    var rect=dockEl.getBoundingClientRect();
    var rests=[],x=6;
    dockIcons.forEach(function(ic,i){if(ic.dataset.key==='trash')x+=1+6;rests.push(x+BASE/2);x+=BASE+GAP});
    var local=mx==null?null:mx-rect.left;
    if(local!=null){var growthLeft=0,cur=6;dockIcons.forEach(function(ic,i){if(ic.dataset.key==='trash')cur+=7;var c=cur+widths[i]/2;if(c<local)growthLeft+=widths[i]-BASE;cur+=widths[i]+GAP});local-=growthLeft}
    dockIcons.forEach(function(ic,i){
      var s=1;
      if(local!=null){var d=Math.abs(local-rests[i]);if(d<RADIUS){var f=Math.cos(d/RADIUS*Math.PI/2);s=1+(MAXS-1)*f*f}}
      ic.style.width=(BASE*s)+'px';
      var sq=ic.querySelector('.sq');sq.style.transform='translateY('+(-(s-1)*BASE*.42)+'px) scale('+s+')';
    });
  }
  if(!matchMedia('(pointer:coarse)').matches&&!reduced){
    dockEl.addEventListener('mousemove',function(e){dockLayout(e.clientX)});
    dockEl.addEventListener('mouseleave',function(){dockLayout(null)});
  }
}

/* ---------- clock ---------- */
function tick(){
  var d=new Date();
  var txt=d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})+'  '+d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
  var mb=document.getElementById('mbClock');if(mb)mb.textContent=txt;
  var lc=document.getElementById('lClock');if(lc)lc.textContent=d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
}
tick();setInterval(tick,30000);

/* ---------- menu bar ---------- */
var menubar=document.getElementById('menubar');
var MENUS={
 apple:[['About Tommy',function(){openAbout()}],['Work',function(){openWork()}],['Tools',function(){openPage('tools')}],['Contact',function(){openPage('contact')}],null,['Little River',function(){openApp('littleriver')}],['Launchpad','F4',function(){openLP()}],['Spotlight','⌘K',function(){openSpot()}],['Mission Control','F3',function(){TR.extras&&TR.extras.openMission()}],null,['New Sticky Note',function(){TR.extras&&TR.extras.addSticky()}],['Reset Stickies',function(){TR.extras&&TR.extras.resetStickies()}],['Take the tour',function(){TR.extras&&TR.extras.startTour()}],null,['Restart…',function(){location.reload()}]],
 go:[['Work',function(){openWork()}],['About',function(){openPage('about')}],['Tools',function(){openPage('tools')}],['Contact',function(){openPage('contact')}],null,['Brave Browser',function(){openApp('brave')}],['Music',function(){openApp('music')}],['Paint',function(){openApp('paint')}],['Brick Breaker',function(){openApp('brick')}],['Light Cycles',function(){openApp('cycles')}],['Meme Maker',function(){openApp('meme')}],['Guestbook',function(){openApp('guestbook')}],['Terminal',function(){openApp('terminal')}],['Trash',function(){openApp('trash')}],null,['Privacy policy',function(){window.open('/privacy.html','_blank','noopener')}]],
 window:function(){var items=[['Show Desktop',function(){TR.extras&&TR.extras.showDesktop()}],['Minimize',function(){var t=topWin();if(t)minimize(t)}],['Zoom',function(){var t=topWin();if(t)toggleMax(t)}],['Close',function(){var t=topWin();if(t)closeWindow(t.key)}],null];var keys=Object.keys(openMap);if(!keys.length)items.push(['No open windows',null]);keys.forEach(function(k){var w=openMap[k];items.push([(w.el.classList.contains('min')?'◇ ':'')+w.title,function(){restore(w)}])});return items},
 help:[['Keyboard: ⌘K Spotlight · Esc closes · drag a window edge to resize',null],['Every project opens the real site — "Open ↗" inside its case file',null],null,['Email Tommy',function(){openPage('contact')}]]
};
function buildMenu(items){
  var ul=document.createElement('ul');ul.className='menu';
  items.forEach(function(it){
    if(!it){var s=document.createElement('li');s.className='sep';ul.appendChild(s);return}
    var li=document.createElement('li');var fn=it[it.length-1];var hint=it.length===3?it[1]:'';
    li.innerHTML='<span>'+esc(it[0])+'</span>'+(hint?'<kbd>'+esc(hint)+'</kbd>':'');
    if(typeof fn!=='function')li.className='dim';else li.addEventListener('click',function(e){e.stopPropagation();closeMenus();fn()});
    ul.appendChild(li);
  });
  return ul;
}
function closeMenus(){document.querySelectorAll('.menu').forEach(function(m){m.remove()});document.querySelectorAll('.mb-item.open').forEach(function(b){b.classList.remove('open')})}
if(menubar){
  menubar.querySelectorAll('[data-menu]').forEach(function(btn){
    btn.addEventListener('click',function(e){
      e.stopPropagation();
      var was=btn.classList.contains('open');closeMenus();if(was)return;
      var items=MENUS[btn.dataset.menu];if(typeof items==='function')items=items();
      var m=buildMenu(items);btn.classList.add('open');btn.appendChild(m);
    });
  });
  document.addEventListener('click',closeMenus);
}

/* ---------- window manager ---------- */
var winsEl=document.getElementById('windows'),zTop=10,openMap={};
function setAppName(t){var m=document.getElementById('mbAppName');if(m)m.textContent=t}
function setDockOpen(key,on){var b=dockEl&&dockEl.querySelector('.dock-icon[data-key="'+key+'"]');if(b)b.classList.toggle('open',!!on)}
function focusWin(w){document.querySelectorAll('.win').forEach(function(x){x.classList.remove('focused')});w.el.classList.add('focused');w.el.style.zIndex=++zTop;setAppName(w.appName||w.title)}
function topWin(){var top=null,tz=-1;Object.keys(openMap).forEach(function(k){var w=openMap[k];if(w.el.classList.contains('min'))return;var z=+w.el.style.zIndex;if(z>tz){tz=z;top=w}});return top}
function restore(w){w.el.classList.remove('min');focusWin(w)}
function minimize(w){
  var b=dockEl&&dockEl.querySelector('.dock-icon[data-key="'+w.dockKey+'"]');
  if(b&&!reduced){var r=b.getBoundingClientRect(),er=w.el.getBoundingClientRect();w.el.style.setProperty('--mx',(r.left+r.width/2-(er.left+er.width/2))+'px');w.el.style.setProperty('--my',(r.top-(er.top+er.height/2))+'px')}
  w.el.classList.add('min');var t=topWin();if(t)focusWin(t);else setAppName('Finder');
}
function toggleMax(w){
  var el=w.el;el.classList.toggle('max');
  if(el.classList.contains('max')){el.dataset.pl=el.style.left;el.dataset.pt=el.style.top;el.dataset.pw=el.style.width;el.dataset.ph=el.style.height;el.style.left='0';el.style.top='29px';el.style.width='100vw';el.style.height='calc(100vh - 29px)'}
  else if(el.dataset.pl){el.style.left=el.dataset.pl;el.style.top=el.dataset.pt;el.style.width=el.dataset.pw;el.style.height=el.dataset.ph}
}
var RZ=['n','s','e','w','ne','nw','se','sw'];
function createWindow(id,title,opts){
  opts=opts||{};
  if(openMap[id]){var ex=openMap[id];restore(ex);return ex}
  var n=Object.keys(openMap).length;
  var el=document.createElement('div');el.className='win'+(opts.cls?' '+opts.cls:'');
  var W=Math.min(opts.w||720,window.innerWidth-60),H=Math.min(opts.h||520,window.innerHeight-130);
  el.style.width=W+'px';el.style.height=H+'px';
  el.style.left=Math.max(8,Math.min(window.innerWidth-W-8,(opts.x!=null?opts.x:60+n*28)))+'px';
  el.style.top=Math.max(34,Math.min(window.innerHeight-H-100,(opts.y!=null?opts.y:52+n*26)))+'px';
  el.innerHTML='<div class="win-title"><span class="tls"><button class="tl tl-close" aria-label="Close"><span>×</span></button><button class="tl tl-min" aria-label="Minimize"><span>−</span></button><button class="tl tl-max" aria-label="Zoom"><span>+</span></button></span><button class="wback" hidden aria-label="Back">‹</button><span class="tname">'+esc(title)+'</span></div><div class="win-body" tabindex="-1"></div>'+RZ.map(function(d){return '<span class="rz rz-'+d+'" data-d="'+d+'"></span>'}).join('');
  winsEl.appendChild(el);
  var w={el:el,body:el.querySelector('.win-body'),key:id,title:title,dockKey:opts.dockKey||id,appName:opts.appName,nav:[]};
  openMap[id]=w;setDockOpen(w.dockKey,true);
  focusWin(w);
  setTimeout(function(){el.classList.add('show')},20);
  var bar=el.querySelector('.win-title');
  bar.addEventListener('mousedown',function(e){
    if(e.target.closest('.tl,.wback')||el.classList.contains('max'))return;
    var sx=e.clientX,sy=e.clientY,ol=el.offsetLeft,ot=el.offsetTop;
    function mv(ev){el.style.left=Math.max(-W+80,ol+ev.clientX-sx)+'px';el.style.top=Math.max(29,ot+ev.clientY-sy)+'px'}
    function up(){window.removeEventListener('mousemove',mv);window.removeEventListener('mouseup',up);el.classList.remove('moving')}
    el.classList.add('moving');window.addEventListener('mousemove',mv);window.addEventListener('mouseup',up);e.preventDefault();
  });
  bar.addEventListener('dblclick',function(e){if(!e.target.closest('.tl'))toggleMax(w)});
  /* resize from any edge or corner */
  el.querySelectorAll('.rz').forEach(function(h){
    h.addEventListener('mousedown',function(e){
      if(el.classList.contains('max'))return;
      e.preventDefault();e.stopPropagation();focusWin(w);
      var d=h.dataset.d,sx=e.clientX,sy=e.clientY,ol=el.offsetLeft,ot=el.offsetTop,ow=el.offsetWidth,oh=el.offsetHeight,minW=opts.minW||360,minH=opts.minH||220;
      function mv(ev){
        var dx=ev.clientX-sx,dy=ev.clientY-sy,l=ol,t=ot,wd=ow,ht=oh;
        if(d.indexOf('e')>-1)wd=Math.max(minW,ow+dx);
        if(d.indexOf('s')>-1)ht=Math.max(minH,oh+dy);
        if(d.indexOf('w')>-1){wd=Math.max(minW,ow-dx);l=ol+(ow-wd)}
        if(d.indexOf('n')>-1){ht=Math.max(minH,oh-dy);t=Math.max(29,ot+(oh-ht));ht=oh+(ot-t)}
        el.style.left=l+'px';el.style.top=t+'px';el.style.width=wd+'px';el.style.height=ht+'px';
      }
      function up(){window.removeEventListener('mousemove',mv);window.removeEventListener('mouseup',up);document.body.style.cursor='';el.classList.remove('moving')}
      document.body.style.cursor=getComputedStyle(h).cursor;el.classList.add('moving');
      window.addEventListener('mousemove',mv);window.addEventListener('mouseup',up);
    });
  });
  el.addEventListener('mousedown',function(){if(!el.classList.contains('focused'))focusWin(w)});
  el.querySelector('.tl-close').addEventListener('click',function(){closeWindow(id)});
  el.querySelector('.tl-min').addEventListener('click',function(){minimize(w)});
  el.querySelector('.tl-max').addEventListener('click',function(){toggleMax(w)});
  el.querySelector('.wback').addEventListener('click',function(){goBack(w)});
  el.addEventListener('keydown',function(e){if(e.key==='Escape'&&!(e.target.closest&&e.target.closest('input,textarea')))closeWindow(id)});
  return w;
}
function closeWindow(id){
  var w=openMap[id];if(!w)return;
  w.el.classList.add('closing');
  if(w.onclose)try{w.onclose()}catch(e){}
  setTimeout(function(){w.el.remove();delete openMap[id];setDockOpen(w.dockKey,false);var t=topWin();if(t)focusWin(t);else setAppName('Finder')},160);
}
function setTitle(w,t){w.title=t;w.el.querySelector('.tname').textContent=t}
function goBack(w){if(w.nav.length<2)return;w.nav.pop();var prev=w.nav[w.nav.length-1];loadPage(w,prev.url,{replace:true,title:prev.title})}

/* ---------- pages inside windows (real routes, fetched and shown in place) ---------- */
function loadPage(host,url,o){
  o=o||{};
  var body=host.body||host,isWin=!!host.body;
  body.innerHTML='<div class="page"><p class="t3">Loading…</p></div>';
  fetch(url).then(function(r){return r.text()}).then(function(html){
    var doc=new DOMParser().parseFromString(html,'text/html');
    var main=doc.querySelector('main');
    var title=o.title||(doc.querySelector('main h1')?doc.querySelector('main h1').textContent.replace(/\.$/,''):doc.title);
    body.innerHTML=main?'<div class="page-in">'+main.innerHTML+'</div>':'<div class="page"><p>Could not load.</p></div>';
    body.querySelectorAll('a[href^="http"]').forEach(function(a){if(!a.classList.contains('js-embed')){a.target='_blank';if(!/noopener/.test(a.rel))a.rel=(a.rel+' noopener').trim()}});
    body.scrollTop=0;
    if(isWin){
      if(!o.replace)host.nav.push({url:url,title:title});
      host.el.querySelector('.wback').hidden=host.nav.length<2;
      if(host.nav.length>1)setTitle(host,title);
      wire(host);
    }else{var st=document.getElementById('sheetTitle');if(st&&o.setTitle!==false&&!o.keepTitle)st.textContent=title;wire({body:body})}
    if(url.indexOf('/contact/')===0)wireContact(body);
  }).catch(function(){body.innerHTML='<div class="page"><p>Could not load this page.</p></div>'});
}
/* one delegated handler per window: internal links stay inside the window, cards filter, Open ↗ embeds the live site */
function wire(host){
  var body=host.body;if(body.__wired)return;body.__wired=true;
  body.addEventListener('click',function(e){
    var chip=e.target.closest('.filter-chip');
    if(chip){var f=chip.dataset.f;body.querySelectorAll('.filter-chip').forEach(function(x){x.classList.toggle('active',x===chip)});body.querySelectorAll('.work-grid > *').forEach(function(c){c.hidden=!(f==='all'||c.dataset.cat===f)});return}
    var a=e.target.closest('a[href]');if(!a)return;
    var href=a.getAttribute('href');
    if(a.classList.contains('js-embed')){e.preventDefault();embedInto(host,href,a.dataset.shot||'',a.dataset.embed!=='no');return}
    if(/^\//.test(href)&&!a.target){e.preventDefault();if(host.el)loadPage(host,href);else loadPage(body,href);return}
  });
}
function embedInto(host,url,shot,canEmbed){
  var body=host.body;
  var back='<button class="btn btn-secondary sm" data-back>← Back to the case</button>';
  var nt='<a class="btn btn-secondary sm" href="'+esc(url)+'" target="_blank" rel="noopener">Open in a new tab ↗</a>';
  var toolbar='<div class="browser-toolbar">'+back+'<span class="url">'+esc(url.replace(/^https?:\/\//,''))+'</span>'+nt+'</div>';
  var frame=canEmbed?'<div class="browser-frame-wrap"><iframe src="'+esc(url)+'" loading="lazy" referrerpolicy="no-referrer-when-downgrade" sandbox="allow-scripts allow-same-origin allow-popups allow-forms" title="'+esc(url)+'"></iframe></div>'
    :'<div class="browser-frame-wrap"><div class="embed-fallback">'+(shot?'<img src="'+esc(shot)+'" alt="Screenshot of '+esc(url)+'">':'')+'<p>This site doesn\'t allow embedding — it opens in a new tab.</p><a class="btn btn-primary" href="'+esc(url)+'" target="_blank" rel="noopener">Open '+esc(url.replace(/^https?:\/\//,'').replace(/\/$/,''))+' ↗</a></div></div>';
  var saved=body.innerHTML,savedScroll=body.scrollTop;
  body.innerHTML='<div class="browser">'+toolbar+frame+'</div>';
  body.querySelector('[data-back]').addEventListener('click',function(){body.innerHTML=saved;body.scrollTop=savedScroll});
}
/* the contact form posts where the live site posts (FormSubmit, Tommy's address) */
function wireContact(body){
  var f=body.querySelector('form.contact-form');if(!f)return;
  f.addEventListener('submit',function(e){
    e.preventDefault();
    var btn=f.querySelector('button[type=submit]'),d={};
    ['name','email','company','projectType','budget','message'].forEach(function(k){var el=f.querySelector('[name="'+k+'"]');d[k]=el?el.value:''});
    btn.disabled=true;btn.textContent='Sending…';
    fetch('https://formsubmit.co/ajax/'+ME.email,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({Name:d.name,Email:d.email,Company:d.company||'—','Project type':d.projectType||'—',Budget:d.budget||'—',Message:d.message,_subject:'Portfolio inquiry — '+(d.name||'new lead'),_template:'table',_captcha:'false'})})
    .then(function(r){return r.json().catch(function(){return{}}).then(function(j){return j.success==='true'||j.success===true||r.ok})})
    .then(function(ok){if(!ok)throw 0;f.innerHTML='<div class="panel form-ok"><p class="big">Message sent — thank you!</p><p>I\'ll get back to you soon. Talk shortly. 🚀</p></div>'})
    .catch(function(){btn.disabled=false;btn.textContent='Send message →';var err=f.querySelector('.form-err');if(!err){err=document.createElement('p');err.className='form-err';err.innerHTML='Something went wrong. <a href="mailto:'+ME.email+'">Email me directly</a>.';f.appendChild(err)}});
  });
}

/* ---------- app openers ---------- */
function openApp(key){
  if(isPhone())return openSheet(key);
  var app=appByKey(key);
  if(app){var w=createWindow(key,app.title,{w:760,h:580,appName:app.title});loadPage(w,app.page);return w}
  var fn={finder:openWork,launchpad:openLP,cycles:openCycles,brave:openBrave,music:openMusic,paint:openPaint,brick:openBrick,meme:openMeme,littleriver:openLR,terminal:openTerminal,trash:openTrash,about:function(){openPage('about')},contact:function(){openPage('contact')},tools:function(){openPage('tools')},work:openWork}[key];
  if(fn)return fn();
  if(REG[key])return REG[key].open();
}
function openPage(slug){var p=PAGES[slug];if(isPhone())return openSheetPage(slug);var w=createWindow('page-'+slug,p.title,{w:780,h:600,dockKey:slug==='work'?'finder':'page-'+slug,appName:p.title});loadPage(w,p.url);return w}
/* Finder: sidebar of pages, folders and documents (the privacy and policy pages live here) */
var DOCS=[['Privacy policy','/privacy.html'],['Rehab Pro privacy','/rehabpro/privacy.html'],['GRVT','/GRVT.html']];
function openWork(){
  if(isPhone())return openSheetPage('work');
  var w=createWindow('finder','Work',{w:940,h:620,dockKey:'finder',appName:'Finder',minW:640});
  var side='<div class="fside"><h4>Favorites</h4>'+Object.keys(PAGES).map(function(k){return '<button class="fitem'+(k==='work'?' on':'')+'" data-page="'+k+'">'+svgI(k)+PAGES[k].title+'</button>'}).join('')+'<h4>Folders</h4>'+FOLDERS.map(function(f){return '<button class="fitem" data-folder="'+f.key+'"><span class="fi">'+ART.folder+'</span>'+f.label+'</button>'}).join('')+'<h4>Documents</h4>'+DOCS.map(function(d){return '<button class="fitem" data-doc="'+d[1]+'"><span class="fi doc">'+ART.doc+'</span>'+d[0]+'</button>'}).join('')+'</div>';
  w.el.classList.add('finder');
  w.body.innerHTML='<div class="fwrap">'+side+'<div class="fmain win-body"></div></div>';
  var main=w.body.querySelector('.fmain');var host={body:main,el:w.el,nav:[]};
  function sel(b){w.body.querySelectorAll('.fitem').forEach(function(x){x.classList.toggle('on',x===b)})}
  w.body.querySelectorAll('[data-page]').forEach(function(b){b.addEventListener('click',function(){sel(b);host.nav=[];loadPage(host,PAGES[b.dataset.page].url,{replace:true});setTitle(w,PAGES[b.dataset.page].title)})});
  w.body.querySelectorAll('[data-folder]').forEach(function(b){b.addEventListener('click',function(){sel(b);var f=FOLDERS.filter(function(x){return x.key===b.dataset.folder})[0];main.innerHTML=folderHTML(f);main.querySelectorAll('.ficon').forEach(function(x){x.addEventListener('click',function(){openApp(x.dataset.key)})});setTitle(w,f.label)})});
  w.body.querySelectorAll('[data-doc]').forEach(function(b){b.addEventListener('click',function(){sel(b);main.innerHTML='<iframe class="docframe" src="'+b.dataset.doc+'" title="'+esc(b.textContent)+'"></iframe>';setTitle(w,b.textContent.trim())})});
  host.el={querySelector:function(){return {hidden:true}}};
  loadPage(host,'/work/',{replace:true});
  return w;
}
function svgI(k){var d={work:'<path d="M3 7h6l2 2h10v10H3z"/>',about:'<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',contact:'<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M4 8l8 6 8-6"/>',tools:'<path d="M14 6a4 4 0 0 0-5.6 4.6L4 15l3 3 4.4-4.4A4 4 0 0 0 16 8l-2 2-2-2z"/>'}[k];return '<svg viewBox="0 0 24 24" class="fi">'+d+'</svg>'}
function openAbout(){var w=openPage('about');return w}

/* Brave: a start page of the sites Tommy built, each one opened inside the browser when the site allows it */
function braveStart(){
  var tiles=APPS.filter(function(a){return a.live}).map(function(a){return '<button class="dial" data-key="'+a.key+'"><span class="shot"><img src="'+esc(a.shot)+'" alt="" loading="lazy"></span>'+sqHTML(a,'sm')+'<span class="t">'+esc(label(a))+'</span><span class="u">'+esc(a.live.replace(/^https?:\/\//,'').replace(/\/$/,''))+'</span></button>'}).join('');
  return '<div class="dials"><h2>Sites I built</h2><div class="dial-grid">'+tiles+'</div></div>';
}
function openBrave(){
  var w=createWindow('brave','Brave Browser',{w:960,h:640,dockKey:'brave',appName:'Brave Browser'});
  var body=w.body;
  function show(app){
    var tb='<div class="browser-toolbar"><button class="btn btn-secondary sm" data-home>⌂</button><span class="url">'+esc(app?app.live.replace(/^https?:\/\//,''):'start')+'</span>'+(app?'<a class="btn btn-secondary sm" href="'+esc(app.live)+'" target="_blank" rel="noopener">Open in a new tab ↗</a>':'')+'</div>';
    var bar='<div class="bookmarks">'+APPS.filter(function(a){return a.live}).map(function(a){return '<button class="bm" data-key="'+a.key+'" title="'+esc(a.title)+'">'+sqHTML(a,'xs')+'<span>'+esc(label(a))+'</span></button>'}).join('')+'</div>';
    var content=!app?braveStart():(app.embed?'<div class="browser-frame-wrap"><iframe src="'+esc(app.live)+'" loading="lazy" sandbox="allow-scripts allow-same-origin allow-popups allow-forms" title="'+esc(app.title)+'"></iframe></div>':'<div class="browser-frame-wrap"><div class="embed-fallback"><img src="'+esc(app.shot)+'" alt="Screenshot of '+esc(app.title)+'"><p>'+esc(app.live.replace(/^https?:\/\//,''))+' doesn\'t allow embedding — it opens in a new tab.</p><a class="btn btn-primary" href="'+esc(app.live)+'" target="_blank" rel="noopener">Open ↗</a></div></div>');
    body.innerHTML='<div class="browser">'+tb+bar+content+'</div>';
    body.querySelector('[data-home]').addEventListener('click',function(){show(null)});
    body.querySelectorAll('.bm,.dial').forEach(function(b){b.addEventListener('click',function(){show(appByKey(b.dataset.key))})});
  }
  show(null);
}
function musicHTML(){return '<div class="music"><div class="music-head"><span class="sq art sm">'+ART.music+'</span><div><strong>'+esc(MUSIC.title)+'</strong><a href="'+MUSIC.profile+'" target="_blank" rel="noopener">'+esc(MUSIC.handle)+' on Apple Music →</a></div><a class="btn btn-primary sm music-open" href="'+MUSIC.page+'" target="_blank" rel="noopener">Open in Apple Music ↗</a></div><p class="t3 music-note">Apple plays 30-second previews here until you sign in to Apple Music inside the player.</p><iframe allow="autoplay *; encrypted-media *; clipboard-write" frameborder="0" height="450" loading="lazy" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation" src="'+MUSIC.embed+'" title="Apple Music — '+esc(MUSIC.title)+' playlist"></iframe></div>'}
function openMusic(){var w=createWindow('music','Music',{w:720,h:560,dockKey:'music',appName:'Music'});w.body.innerHTML=musicHTML()}
function openPaint(){var w=createWindow('paint','Paint',{w:900,h:620,dockKey:'paint',appName:'Paint'});var d=document.createElement('div');d.className='page';w.body.appendChild(d);window.initPaint(d)}
function openCycles(){var w=createWindow('cycles','Light Cycles',{w:760,h:820,dockKey:'cycles',appName:'Light Cycles',minW:420,minH:420});var d=document.createElement('div');d.className='game-host cyc-host';w.body.appendChild(d);var g=window.initCycles(d);w.onclose=function(){g&&g.stop()}}
function openBrick(){var w=createWindow('brick','Brick Breaker',{w:740,h:620,dockKey:'brick',appName:'Brick Breaker',minW:420,minH:360});var d=document.createElement('div');d.className='game-host';w.body.appendChild(d);var g=window.initBrick(d);w.onclose=function(){g&&g.stop()}}
function openMeme(){var w=createWindow('meme','Meme Maker',{w:940,h:640,dockKey:'meme',appName:'Meme Maker'});var d=document.createElement('div');d.className='page';w.body.appendChild(d);window.initMeme(d)}

/* Terminal: type help */
var TERM_HELP='help · whoami · ls · open <app> · stats · about · contact · music · date · clear';
function termRun(cmd){
  var parts=cmd.trim().split(/\s+/),c=parts[0].toLowerCase(),arg=parts.slice(1).join(' ').toLowerCase();
  if(!c)return '';
  if(c==='help')return TERM_HELP;
  if(c==='whoami')return ME.name+' — '+ME.role+' · '+ME.location;
  if(c==='ls')return FOLDERS.map(function(f){return f.label+'/'}).concat(APPS.map(function(a){return a.key})).concat(['brick','cycles','meme']).join('  ');
  if(c==='stats')return ME.stats.map(function(s){return s[0]+' '+s[1]}).join('\n');
  if(c==='about')return ME.hero+'\n'+ME.since;
  if(c==='contact')return ME.email;
  if(c==='music')return MUSIC.title+' — '+MUSIC.handle+' on Apple Music';
  if(c==='date')return new Date().toString();
  if(c==='pwd')return '/Users/tommy';
  if(c==='open'){var a=APPS.filter(function(x){return x.key===arg||x.title.toLowerCase()===arg})[0];var d=DOCK.concat(EXTRA.map(function(x){return{key:x.key,label:x.title}})).filter(function(x){return x.key===arg||x.label.toLowerCase()===arg})[0];if(a||d){setTimeout(function(){openApp((a||d).key)},50);return 'opening '+(a?a.title:d.label)+'…'}return 'open: no app called "'+arg+'" — try ls'}
  if(c==='sudo')return 'Nice try.';
  return c+': command not found. Type help.';
}
function termHTML(){return '<div class="term" tabindex="0"><pre class="term-out">'+esc(ME.name+' — '+ME.role)+'\n'+esc(ME.location+' · '+ME.since)+'\nType <b>help</b> to see what this machine can do.\n</pre><div class="term-line"><span class="p">tommy@roldan ~ % </span><input class="term-in" autocomplete="off" spellcheck="false" aria-label="Terminal input"></div></div>'}
function wireTerm(root){
  var out=root.querySelector('.term-out'),inp=root.querySelector('.term-in'),hist=[],hi=0;
  root.addEventListener('click',function(){inp.focus()});
  inp.addEventListener('keydown',function(e){
    if(e.key==='Enter'){var v=inp.value;hist.push(v);hi=hist.length;if(v.trim()==='clear'){out.textContent='';inp.value='';return}var r=termRun(v);var ln=document.createElement('div');ln.innerHTML='<span class="p">tommy@roldan ~ % </span>'+esc(v)+(r?'\n'+esc(r):'');out.appendChild(ln);inp.value='';out.parentNode.scrollTop=1e6}
    if(e.key==='ArrowUp'){hi=Math.max(0,hi-1);inp.value=hist[hi]||'';e.preventDefault()}
    if(e.key==='ArrowDown'){hi=Math.min(hist.length,hi+1);inp.value=hist[hi]||'';e.preventDefault()}
  });
  setTimeout(function(){inp.focus()},80);
}
function openTerminal(){var w=createWindow('terminal','Terminal',{w:680,h:440,dockKey:'terminal',appName:'Terminal'});w.body.innerHTML=termHTML();wireTerm(w.body)}
function trashHTML(){return '<div class="page"><h2>Archived projects</h2><p class="t3">Old work, kept for the record.</p>'+ARCHIVED.map(function(a){var play=a[0].indexOf('Brick Breaker')===0?' <button class="btn btn-secondary sm" data-open="brick">Play it again</button>':a[0]==='Follow MeMe'?' <button class="btn btn-secondary sm" data-open="meme">Make a meme</button>':'';return '<div class="trash-row"><span class="sq sm plain"><img src="/assets/icons/dock-trash.png" alt=""></span><span><strong>'+esc(a[0])+'</strong><div class="t3">'+esc(a[2])+'</div>'+play+'</span><span class="t3">'+a[1]+'</span></div>'}).join('')+'</div>'}
function openTrash(){var w=createWindow('trash','Trash',{w:680,h:520,dockKey:'trash',appName:'Trash'});w.body.innerHTML=trashHTML();w.body.querySelectorAll('[data-open]').forEach(function(b){b.addEventListener('click',function(){openApp(b.dataset.open)})})}
function lrBars(){return Object.keys(LR.by).sort(function(a,b){return LR.by[b]-LR.by[a]}).map(function(k){var pct=Math.round(LR.by[k]/LR.agents*100);return '<div class="lr-bar"><span class="k">'+esc(k)+'</span><span class="track"><span class="fill" style="width:'+pct+'%"></span></span><span>'+LR.by[k]+'</span></div>'}).join('')}
function lrPane(name){
  var stat='<div class="lr-stat"><div><b>'+LR.agents+'</b>Agents</div><div><b>'+LR.departments+'</b>Departments</div></div>';
  if(name==='Overview')return '<h2>Little River</h2><p class="t3">The command centre Tommy runs his businesses from. Real counts from the floor on '+LR.asOf+'.</p>'+stat+'<div class="lr-bars">'+lrBars()+'</div>';
  if(name==='Floor')return '<h2>Floor</h2><p class="t3">Agents by department.</p><div class="lr-bars">'+lrBars()+'</div>';
  if(name==='Agents')return '<h2>Agents</h2>'+stat+'<p class="t3">'+LR.agents+' agents across '+LR.departments+' departments.</p>';
  return '<h2>'+esc(name)+'</h2><p class="t3">This part lives in the real app.</p>';
}
function openLR(){var w=createWindow('littleriver','Little River',{w:1060,h:680,dockKey:'littleriver',appName:'Little River',minW:720});window.initLR(w.body)}
function infoHTML(r){return '<div class="page"><div class="panel"><span class="badges">'+r[5].map(function(b){return '<span class="badge '+b+'">'+b+'</span>'}).join('')+'</span><h2>'+esc(r[0])+'</h2><p class="case-meta">'+esc(r[2])+' · '+r[3]+'</p><p>'+esc(r[4])+'</p>'+(r[1]?'<a class="btn btn-primary" href="'+esc(r[1])+'" target="_blank" rel="noopener">Open ↗</a>':'<p class="t3">Private — no public link.</p>')+'</div></div>'}
function openInfo(r){if(isPhone()){sheet.hidden=false;sheetTitle.textContent=r[0];sheetBody.innerHTML=infoHTML(r);return}var w=createWindow('info-'+r[0],r[0],{w:560,h:380,dockKey:'finder',appName:r[0]});w.body.innerHTML=infoHTML(r)}

/* ---------- phone launcher ---------- */
var lGrid=document.getElementById('lGrid'),lDock=document.getElementById('lDock');
if(lGrid){
  APPS.concat(EXTRA).concat(DOCK.filter(function(d){return d.key!=='finder'}).map(function(d){return{key:d.key,title:d.label,icon:d.icon,fit:d.fit,art:d.art,init:d.init}})).forEach(function(a){
    var b=document.createElement('button');b.className='lapp';
    b.innerHTML=sqHTML(a)+'<span class="label">'+esc(a.short||a.title)+'</span>';
    b.addEventListener('click',function(){openApp(a.key)});
    lGrid.appendChild(b);
  });
  Object.keys(PAGES).forEach(function(k){var p=PAGES[k];var b=document.createElement('button');b.className='lapp';b.setAttribute('aria-label',p.title);b.innerHTML=sqHTML(p.art?{art:p.art}:{icon:p.icon,fit:p.fit});b.addEventListener('click',function(){openSheetPage(k)});lDock.appendChild(b)});
}
var sheet=document.getElementById('sheet'),sheetBody=document.getElementById('sheetBody'),sheetTitle=document.getElementById('sheetTitle');
function openSheetPage(slug){sheet.hidden=false;sheetTitle.textContent=PAGES[slug].title;sheetBody.__wired=false;loadPage(sheetBody,PAGES[slug].url,{keepTitle:true});if(slug==='work')setTimeout(function(){var d=document.createElement('div');d.className='page docs-strip';d.innerHTML='<h3>Documents</h3>'+DOCS.map(function(x){return '<a class="btn btn-secondary sm" href="'+x[1]+'" target="_blank" rel="noopener">'+esc(x[0])+'</a> '}).join('');sheetBody.appendChild(d)},600)}
function openSheet(key){
  var app=appByKey(key);
  sheet.hidden=false;sheetBody.__wired=false;
  if(app){sheetTitle.textContent=app.title;loadPage(sheetBody,app.page,{keepTitle:true});return}
  var d=DOCK.filter(function(x){return x.key===key})[0];
  sheetTitle.textContent=d?d.label:key;
  sheetBody.innerHTML='';
  if(key==='finder')return openSheetPage('work');
  if(key==='launchpad'){sheet.hidden=true;return openLP()}
  if(key==='paint'){var p=document.createElement('div');p.className='page';sheetBody.appendChild(p);return window.initPaint(p)}
  if(key==='cycles'){var gc=document.createElement('div');gc.className='game-host cyc-host';sheetBody.appendChild(gc);var cg=window.initCycles(gc);sheetBody.__stop=function(){cg&&cg.stop()};return}
  if(key==='brick'){var g=document.createElement('div');g.className='game-host';sheetBody.appendChild(g);var game=window.initBrick(g);sheetBody.__stop=function(){game&&game.stop()};return}
  if(key==='meme'){var m=document.createElement('div');m.className='page';sheetBody.appendChild(m);return window.initMeme(m)}
  if(key==='music')return void(sheetBody.innerHTML=musicHTML());
  if(key==='terminal'){sheetBody.innerHTML=termHTML();return wireTerm(sheetBody)}
  if(key==='trash'){sheetBody.innerHTML=trashHTML();sheetBody.querySelectorAll('[data-open]').forEach(function(b){b.addEventListener('click',function(){openApp(b.dataset.open)})});return}
  if(key==='littleriver')return void window.initLR(sheetBody);
  if(REG[key]){sheetTitle.textContent=REG[key].title;return REG[key].sheet(sheetBody)}
  if(key==='brave'){sheetBody.innerHTML='<div class="browser">'+braveStart()+'</div>';sheetBody.querySelectorAll('.dial').forEach(function(b){b.addEventListener('click',function(){var a=appByKey(b.dataset.key);window.open(a.live,'_blank','noopener')})});return}
}
function closeSheet(){sheet.hidden=true;if(sheetBody.__stop){sheetBody.__stop();sheetBody.__stop=null}sheetBody.innerHTML=''}
var sc=document.getElementById('sheetClose');if(sc)sc.addEventListener('click',closeSheet);

/* ---------- launchpad ---------- */
var lp=document.getElementById('launchpad'),lpGrid=document.getElementById('lpGrid'),lpInput=document.getElementById('lpInput');
function lpItems(){
  return APPS.map(function(a){return{key:a.key,title:a.short||a.title,icon:a.icon,fit:a.fit,art:a.art,init:a.init}})
   .concat(EXTRA.map(function(x){return{key:x.key,title:x.title,art:x.art}}))
   .concat(DOCK.filter(function(d){return ['brave','music','paint','guestbook','littleriver','terminal','trash'].indexOf(d.key)>-1}).map(function(d){return{key:d.key,title:d.label,icon:d.icon,fit:d.fit,art:d.art,init:d.init}}))
   .concat(Object.keys(PAGES).map(function(k){return{key:'page:'+k,title:PAGES[k].title,icon:PAGES[k].icon,fit:PAGES[k].fit,art:PAGES[k].art}}));
}
function renderLP(q){
  q=(q||'').toLowerCase();
  var items=lpItems().filter(function(x){return x.title.toLowerCase().indexOf(q)>-1});
  lpGrid.innerHTML=items.map(function(x,i){return '<button class="lp-app" data-key="'+esc(x.key)+'" style="--i:'+i+'">'+sqHTML(x)+'<span class="label">'+esc(x.title)+'</span></button>'}).join('')||'<p class="lp-none">No results</p>';
  lpGrid.querySelectorAll('.lp-app').forEach(function(b){b.addEventListener('click',function(){closeLP();var k=b.dataset.key;if(k.indexOf('page:')===0)openPage(k.slice(5));else openApp(k)})});
}
function openLP(){if(!lp)return;closeMenus();lp.hidden=false;lpInput.value='';renderLP('');setTimeout(function(){lpInput.focus()},60)}
function closeLP(){if(lp)lp.hidden=true}
if(lp){lp.addEventListener('click',function(e){if(e.target===lp||e.target===lpGrid)closeLP()});lpInput.addEventListener('input',function(){renderLP(lpInput.value)});lpInput.addEventListener('keydown',function(e){if(e.key==='Enter'){var b=lpGrid.querySelector('.lp-app');if(b)b.click()}})}

/* ---------- spotlight ---------- */
var spot=document.getElementById('spotlight'),spotInput=document.getElementById('spotInput'),spotResults=document.getElementById('spotResults');
var ALL=APPS.map(function(a){return{title:a.title,cat:a.category,go:function(){openApp(a.key)}}})
 .concat(Object.keys(PAGES).map(function(k){return{title:PAGES[k].title,cat:'page',go:function(){openPage(k)}}}))
 .concat(DOCK.filter(function(d){return d.key!=='finder'}).map(function(d){return{title:d.label,cat:'app',go:function(){openApp(d.key)}}}))
 .concat(EXTRA.map(function(d){return{title:d.title,cat:'game',go:function(){openApp(d.key)}}}))
 .concat(FOLDERS.map(function(f){return{title:f.label+' folder',cat:'folder',go:function(){openFolder(f)}}}))
 .concat(REST.map(function(r){return{title:r[0],cat:r[2].toLowerCase(),go:function(){openInfo(r)}}}))
 .concat(ARCHIVED.map(function(a){return{title:a[0],cat:'archived',go:function(){openApp('trash')}}}));
function renderSpot(q){
  q=(q||'').toLowerCase();
  var list=ALL.filter(function(x){return x.title.toLowerCase().indexOf(q)>-1}).slice(0,14);
  spotResults.innerHTML=list.map(function(x){return '<li><a href="#"><span>'+esc(x.title)+'</span><span class="sc">'+esc(x.cat)+'</span></a></li>'}).join('');
  spotResults.querySelectorAll('a').forEach(function(a,i){a.addEventListener('click',function(e){e.preventDefault();closeSpot();list[i].go()})});
}
function openSpot(){if(!spot)return;spot.hidden=false;spotInput.value='';renderSpot('');spotInput.focus()}
function closeSpot(){if(spot)spot.hidden=true}
if(spotInput){spotInput.addEventListener('input',function(){renderSpot(spotInput.value)});spotInput.addEventListener('keydown',function(e){if(e.key==='Enter'){var a=spotResults.querySelector('a');if(a)a.click()}})}
if(spot)spot.addEventListener('click',function(e){if(e.target===spot)closeSpot()});
var ls=document.getElementById('lSearchInput');
if(ls)ls.addEventListener('focus',function(){ls.blur();openSpot()});
document.addEventListener('keydown',function(e){
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();spot.hidden?openSpot():closeSpot()}
  if(e.key==='F4'){e.preventDefault();lp&&lp.hidden?openLP():closeLP()}
  if(e.key==='Escape'){
    if(document.querySelector('.menu'))return closeMenus();
    if(lp&&!lp.hidden)return closeLP();
    if(spot&&!spot.hidden)return closeSpot();
    if(sheet&&!sheet.hidden)return closeSheet();
    if(e.target&&e.target.closest&&e.target.closest('input,textarea'))return;
    var t=topWin();if(t)closeWindow(t.key);
  }
});

/* boot: Work opens last, like the Finder on a fresh login */
if(!isPhone())setTimeout(openWork,reduced?0:260);
window.trOpen=openApp;
window.TR={esc:esc,sqHTML:sqHTML,ART:ART,APPS:APPS,DOCK:DOCK,PAGES:PAGES,ME:ME,openMap:openMap,createWindow:createWindow,closeWindow:closeWindow,minimize:minimize,restore:restore,topWin:topWin,openApp:openApp,openPage:openPage,openLP:openLP,openSpot:openSpot,closeMenus:closeMenus,isPhone:isPhone,register:function(key,title,open,sheet){REG[key]={title:title,open:open,sheet:sheet}}};
})();
