/* Winding road through the "results" cards: a traveller walks on scroll, sits to meditate at each card, and lights it up */
(function(){
  var box=document.querySelector('#results .ress'); if(!box) return;
  var cards=[].slice.call(box.querySelectorAll('.res')); if(cards.length<2) return;
  var NS='http://www.w3.org/2000/svg', reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  box.classList.add('road');
  var svg=document.createElementNS(NS,'svg'); svg.setAttribute('class','road-svg'); svg.setAttribute('aria-hidden','true'); box.insertBefore(svg,box.firstChild);
  var trav=document.createElement('div'); trav.className='trav'; trav.setAttribute('aria-hidden','true');
  trav.innerHTML='<span class="halo"></span><svg viewBox="-20 -44 40 46">'+
    '<g class="walker"><circle cx="0" cy="-35" r="5"/><path d="M0-29L0-13" class="b"/><path d="M0-25L-6-17" class="arm a1"/><path d="M0-25L6-17" class="arm a2"/><path d="M0-13L-5 0" class="leg l1"/><path d="M0-13L5 0" class="leg l2"/></g>'+
    '<g class="sitter"><circle cx="0" cy="-27" r="5"/><path d="M0-21.5c-4.2 0-6.3 2.6-7 6l-1.2 5.8-5.2 3.1c-1.8 1.1-1.1 3.6 1 3.6h24.8c2.1 0 2.8-2.5 1-3.6l-5.2-3.1-1.2-5.8c-.7-3.4-2.8-6-7-6z"/><circle cx="0" cy="-13" r="1.8" class="heart"/></g>'+
    '</svg>';
  box.appendChild(trav);
  var base,lit,anchors=[],cum=[],total=0,segs=[];
  function mk(n,a){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);svg.appendChild(e);return e;}
  function layout(){
    while(svg.firstChild)svg.removeChild(svg.firstChild);
    var W=box.clientWidth,H=box.clientHeight,mob=W<700;
    svg.setAttribute('viewBox','0 0 '+W+' '+H);svg.setAttribute('width',W);svg.setAttribute('height',H);
    var bR=box.getBoundingClientRect(),pts=[];
    anchors=cards.map(function(c,i){var r=c.getBoundingClientRect(),x,y=r.top-bR.top+r.height/2;
      if(mob)x=24;else{var left=(r.left-bR.left)<W/2-10;x=left?r.right-bR.left+34:r.left-bR.left-34;}
      return [x,y];});
    var start=mob?[24,-20]:[W/2,-24], end=mob?[24,H+10]:[W/2,H+16];
    pts=[start].concat(anchors).concat([end]);
    var d='M'+pts[0][0]+' '+pts[0][1];segs=[];
    for(var i=1;i<pts.length;i++){var a=pts[i-1],b=pts[i],dy=b[1]-a[1];
      var c1x=a[0],c2x=b[0];
      if(mob){var wob=(i%2?1:-1)*20;c1x=a[0]+wob;c2x=b[0]-wob;}
      var seg='C'+c1x+' '+(a[1]+dy*.55)+' '+c2x+' '+(b[1]-dy*.55)+' '+b[0]+' '+b[1];
      d+=seg;segs.push('M'+a[0]+' '+a[1]+seg);}
    mk('path',{d:d,class:'road-bed'});
    mk('path',{d:d,class:'road-line'});
    lit=mk('path',{d:d,class:'road-lit'});
    base=lit;
    // cumulative lengths at anchors
    var tmp=document.createElementNS(NS,'path');svg.appendChild(tmp);cum=[0];
    for(i=0;i<segs.length;i++){tmp.setAttribute('d',segs[i]);cum.push(cum[i]+tmp.getTotalLength());}
    svg.removeChild(tmp);total=cum[cum.length-1];
    lit.style.strokeDasharray=total;lit.style.strokeDashoffset=total;
    // waypoints markers
    anchors.forEach(function(a){mk('circle',{cx:a[0],cy:a[1],r:6,class:'stop'});});
    update(true);
  }
  var lastD=-1,idle;
  function update(force){
    if(!base)return;
    var r=box.getBoundingClientRect(),vh=window.innerHeight;
    var p=(vh*.62-r.top)/(r.height); p=Math.max(0,Math.min(1,p));
    if(reduce)p=1;
    var n=anchors.length,slice=1/n,k=Math.min(n-1,Math.floor(p/slice)),f=(p-k*slice)/slice;
    var from=cum[k],to=cum[k+1],dist,sitting=false;
    if(p>=1){dist=cum[n];sitting=true;k=n-1;}
    else if(f<.62){var e=f/.62;e=e<.5?2*e*e:1-Math.pow(-2*e+2,2)/2;dist=from+(to-from)*e;}
    else{dist=to;sitting=true;}
    var pt=base.getPointAtLength(dist),ahead=base.getPointAtLength(Math.min(total,dist+4));
    var dir=ahead.x<pt.x-.2?-1:1;
    trav.style.transform='translate('+pt.x+'px,'+pt.y+'px)';
    trav.classList.toggle('flip',dir<0);
    trav.classList.toggle('sit',sitting);
    base.style.strokeDashoffset=total-dist;
    cards.forEach(function(c,i){var reached=i<k||(i===k&&sitting);c.classList.toggle('lit',reached);c.classList.toggle('now',i===k&&sitting&&p<1);});
    if(!force&&Math.abs(dist-lastD)>.5&&!sitting){trav.classList.add('moving');clearTimeout(idle);idle=setTimeout(function(){trav.classList.remove('moving');},180);}
    lastD=dist;
  }
  var ticking=false;
  window.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(function(){ticking=false;update();});}},{passive:true});
  var rt;function rel(){clearTimeout(rt);rt=setTimeout(layout,150);}
  if('ResizeObserver' in window)new ResizeObserver(rel).observe(box);else window.addEventListener('resize',rel);
  layout();
})();
