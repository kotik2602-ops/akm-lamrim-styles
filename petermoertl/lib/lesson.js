/* Course / teaching page: description first, then every lesson with English labels.
   <body data-page="aci5"> or <body data-page="t:lion-dance">, data-root="../" (path to /petermoertl/) */
(function(){
var P=window.PM,L=window.PML,B=document.body,ROOT=B.dataset.root,KEY=B.dataset.page;
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var $=function(s){return document.querySelector(s)};
var item,recs,kind,list,idx;
var GROUPS={meditation:'Meditation courses',practices:'Practices for daily life',other:'Other teachings'};
if(KEY.indexOf('aci')===0){
  var n=+KEY.slice(3);item=P.courses[n-1];kind='aci';recs=item.rec;
}else{
  var slug=KEY.slice(2);
  ['meditation','practices','other'].forEach(function(k){P[k].forEach(function(p){if(p.slug===slug){item=p;kind=k}})});
  recs=[[item.id,'']];
}

/* ---------- top ---------- */
var h='';
if(kind==='aci'){
  h+='<div class="crumbs"><a href="'+ROOT+'#aci">← 18 ACI courses</a></div>';
  h+='<div class="c-top"><div class="c-pic"><img src="'+ROOT+'img/'+item.img+'" alt=""></div><div><div class="eyebrow">ACI '+item.n+' · with Peter Moertl</div><h1>'+esc(item.title)+'</h1><p class="c-hook">'+esc(item.hook)+'</p></div></div>';
}else{
  h+='<div class="crumbs"><a href="'+ROOT+'#'+kind+'">← '+GROUPS[kind]+'</a></div>';
  h+='<div class="c-top"><div class="c-pic icon"><img src="'+ROOT+'img/prints/dorje.webp" alt=""></div><div><div class="eyebrow">'+GROUPS[kind]+' · with Peter Moertl</div><h1>'+esc(item.title)+'</h1>'+(item.sub?'<p class="c-hook">'+esc(item.sub)+'</p>':'')+'</div></div>';
}
$('#top').innerHTML=h;
document.title=(kind==='aci'?'ACI '+item.n+': ':'')+item.title+' — Peter Moertl';

/* ---------- description (courses) ---------- */
if(kind==='aci'){
  var d='<div class="prose">'+item.p.map(function(x){return '<p>'+esc(x)+'</p>'}).join('');
  if(item.learn&&item.learn.length)d+='<h4>What you will learn</h4><ul>'+item.learn.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul>';
  d+='</div><aside class="side">';
  d+='<div class="box"><b>Recordings</b>'+recs.map(function(r){return esc(r[1])+' — '+L[r[0]].length+' videos'}).join('<br>')+'</div>';
  if(item.fact)d+='<div class="box fact"><b>Did you know?</b>'+esc(item.fact)+'</div>';
  if(item.base)d+='<div class="box"><b>Based on</b>'+esc(item.base)+'</div>';
  d+='</aside>';
  $('#desc').innerHTML=d;
}else $('#desc').remove();

/* ---------- lessons ---------- */
var SEEN='pm-seen-v1',seen={};
try{seen=JSON.parse(localStorage.getItem(SEEN)||'{}')||{}}catch(e){}
function markSeen(v){seen[v]=1;try{localStorage.setItem(SEEN,JSON.stringify(seen))}catch(e){}}
var ri=0,m=location.hash.match(/^#r(\d)$/);if(m&&recs[m[1]-1])ri=m[1]-1;

$('#ltitle').innerHTML=kind==='aci'?'Classes':'Sessions';
var tabs=$('#tabs');
if(recs.length>1){
  tabs.innerHTML=recs.map(function(r,i){return '<button class="tab" role="tab" data-r="'+i+'">'+esc(r[1])+' <small>· '+L[r[0]].length+' videos</small></button>'}).join('');
  tabs.addEventListener('click',function(e){var t=e.target.closest('[data-r]');if(t)selectRec(+t.dataset.r,true)});
}else if(kind==='aci'&&recs[0][1]){tabs.innerHTML='<span class="tab" aria-selected="true">'+esc(recs[0][1])+'</span>'}

var player=null,apiReady=false,pending=null;
function selectRec(i,push){
  ri=i;list=L[recs[i][0]];idx=-1;
  [].forEach.call(tabs.querySelectorAll('[data-r]'),function(b){b.setAttribute('aria-selected',+b.dataset.r===i)});
  if(push&&recs.length>1)history.replaceState(null,'','#r'+(i+1));
  $('#grid').innerHTML=list.map(function(l,j){
    var parts=l[1].split(' · '),main=parts.shift();
    return '<button class="ls'+(seen[l[0]]?' seen':'')+'" data-i="'+j+'"><b>'+esc(main)+'</b>'+(parts.length?'<span>'+esc(parts.join(' · '))+'</span>':'')+'</button>';
  }).join('');
  if(player&&player.stopVideo)player.stopVideo();
  showPoster(0);
}
function lbl(j){return list[j][1]}
function showPoster(j){
  idx=j;paintNow();
  var parts=lbl(j).split(' · ');
  $('#screen').innerHTML='<button class="poster" aria-label="Play '+esc(lbl(j))+'"><span class="big">'+esc(parts[0])+'</span>'+(parts.length>1?'<span class="sub">'+esc(parts.slice(1).join(' · '))+'</span>':'')+'<span class="pbtn"></span></button>';
  player=null;
  $('#screen .poster').onclick=function(){play(j)};
}
function paintNow(){
  $('#now').innerHTML=idx>=0?'Now: <span>'+esc(lbl(idx))+'</span> <small style="color:var(--text-lm);font-weight:600">· '+(idx+1)+' / '+list.length+'</small>':'';
  [].forEach.call(document.querySelectorAll('.ls'),function(b){b.classList.toggle('on',+b.dataset.i===idx)});
  $('#prev').disabled=idx<=0;$('#next').disabled=idx>=list.length-1;
}
function loadApi(){
  if(window.YT&&YT.Player){apiReady=true;return}
  if(document.getElementById('ytapi'))return;
  var s=document.createElement('script');s.id='ytapi';s.src='https://www.youtube.com/iframe_api';document.head.appendChild(s);
}
window.onYouTubeIframeAPIReady=function(){apiReady=true;if(pending!==null){var j=pending;pending=null;play(j)}};
function play(j){
  idx=j;paintNow();markSeen(list[j][0]);
  var b=document.querySelector('.ls[data-i="'+j+'"]');if(b)b.classList.add('seen');
  if(!apiReady){pending=j;loadApi();
    /* fallback if API is blocked: plain iframe */
    setTimeout(function(){if(pending===j&&!apiReady){pending=null;$('#screen').innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+list[j][0]+'?autoplay=1&rel=0&modestbranding=1" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="'+esc(lbl(j))+'"></iframe>'}},4000);
    return}
  if(player&&player.loadVideoById){player.loadVideoById(list[j][0]);return}
  $('#screen').innerHTML='<div id="yt"></div>';
  player=new YT.Player('yt',{host:'https://www.youtube-nocookie.com',videoId:list[j][0],playerVars:{autoplay:1,rel:0,modestbranding:1,playsinline:1},
    events:{onStateChange:function(e){if(e.data===0&&idx<list.length-1)play(idx+1)}}});
}
document.addEventListener('click',function(e){
  var t=e.target.closest('.ls');if(t){play(+t.dataset.i);$('#stage').scrollIntoView({behavior:'smooth',block:'start'});return}
});
$('#prev').onclick=function(){if(idx>0)play(idx-1)};
$('#next').onclick=function(){if(idx<list.length-1)play(idx+1)};
selectRec(ri,false);

/* ---------- prev / next ---------- */
var pn='';
if(kind==='aci'){
  var pc=P.courses[item.n-2],nc=P.courses[item.n];
  pn+=pc?'<a href="'+ROOT+'aci'+pc.n+'/"><small>← ACI '+pc.n+'</small><b>'+esc(pc.title)+'</b></a>':'<a href="'+ROOT+'"><small>←</small><b>Teachings library</b></a>';
  pn+=nc?'<a class="nx" href="'+ROOT+'aci'+nc.n+'/"><small>ACI '+nc.n+' →</small><b>'+esc(nc.title)+'</b></a>':'<a class="nx" href="'+ROOT+'#meditation"><small>Next →</small><b>Meditation courses</b></a>';
}else{
  var arr=P[kind],k=arr.indexOf(item),a=arr[k-1],z=arr[k+1];
  pn+=a?'<a href="'+ROOT+'t/'+a.slug+'/"><small>← Previous</small><b>'+esc(a.title)+'</b></a>':'<a href="'+ROOT+'#'+kind+'"><small>←</small><b>'+GROUPS[kind]+'</b></a>';
  pn+=z?'<a class="nx" href="'+ROOT+'t/'+z.slug+'/"><small>Next →</small><b>'+esc(z.title)+'</b></a>':'<a class="nx" href="'+ROOT+'"><small>→</small><b>Teachings library</b></a>';
}
$('#pn').innerHTML=pn;
})();
