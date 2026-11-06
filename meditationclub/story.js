/* 1) pencil writes the quote on a scroll  2) horse with rider gallops between paragraphs, calming down  3) golden key opens the lock */
(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var watchers=[];
  function onView(el,cb,th){if(!el)return;if(reduce){cb();return;}watchers.push({el:el,cb:cb,th:th||.35});check();}
  function check(){var vh=window.innerHeight;watchers=watchers.filter(function(w){var r=w.el.getBoundingClientRect();if(r.height===0)return true;var vis=Math.min(r.bottom,vh)-Math.max(r.top,0);if(vis>Math.min(r.height,vh)*w.th){w.cb();return false;}return true;});}
  window.addEventListener('scroll',check,{passive:true});window.addEventListener('resize',check);window.addEventListener('load',check);var _ci=setInterval(function(){check();if(!watchers.length)clearInterval(_ci);},500);

  /* ---------- pencil on the scroll ---------- */
  var sc=document.querySelector('.scroll-paper');
  if(sc){
    var txt=sc.querySelector('.ink'),by=sc.querySelector('.by'),pen=sc.querySelector('.pencil');
    var full=txt.getAttribute('data-text')||'';
    txt.textContent='';
    function finish(){txt.textContent=full;sc.classList.add('written');}
    onView(sc,function(){
      if(reduce){finish();return;}
      sc.classList.add('writing');var i=0;
      (function step(){
        var n=Math.min(full.length,i+2);txt.textContent=full.slice(0,n);i=n;
        if(i<full.length){var ch=full[i-1];setTimeout(step,/[.,;!?»]/.test(ch)?140:26);}
        else{sc.classList.remove('writing');sc.classList.add('written');}
      })();
    },.4);
  }

  /* ---------- horse between plaques ---------- */
  var ride=document.querySelector('.ride');
  if(ride){
    var plaques=[].slice.call(ride.querySelectorAll('.plaque')),runner=ride.querySelector('.runner');
    var pts=[],cum=[],total=0,gapIdx=[],facing=1;
    function layout(){
      var W=ride.clientWidth,rb=ride.getBoundingClientRect(),corr=Math.max(70,W*.2);
      var L=corr/2,R=W-corr/2;pts=[];gapIdx=[];
      plaques.forEach(function(pq,i){
        var r=pq.getBoundingClientRect(),top=r.top-rb.top,bot=r.bottom-rb.top;
        var side=i%2?L:R; /* corridor opposite to plaque alignment: even plaques sit left -> corridor right */
        var other=i%2?R:L;
        var gy=top-14;
        if(i===0)pts.push([other,gy]);
        pts.push([side,gy]);gapIdx.push(pts.length-1);
        pts.push([side,bot+14]);
        if(i<plaques.length-1){var nxt=plaques[i+1].getBoundingClientRect().top-rb.top;pts[pts.length-1][1]=(bot+nxt)/2+8;}
      });
      cum=[0];for(var k=1;k<pts.length;k++)cum.push(cum[k-1]+Math.hypot(pts[k][0]-pts[k-1][0],pts[k][1]-pts[k-1][1]));
      total=cum[cum.length-1];upd();
    }
    function at(d){for(var k=1;k<cum.length;k++)if(d<=cum[k]){var f=(d-cum[k-1])/((cum[k]-cum[k-1])||1);return [pts[k-1][0]+(pts[k][0]-pts[k-1][0])*f,pts[k-1][1]+(pts[k][1]-pts[k-1][1])*f,pts[k][0]-pts[k-1][0],k];}var l=pts[pts.length-1];return [l[0],l[1],0,cum.length-1];}
    function upd(){
      if(!pts.length)return;
      var r=ride.getBoundingClientRect(),vh=window.innerHeight;
      var p=(vh*.6-r.top)/(r.height+vh*.1);p=Math.max(0,Math.min(1,p));if(reduce)p=1;
      var a=at(p*total);if(Math.abs(a[2])>1)facing=a[2]>0?1:-1;
      runner.style.transform='translate('+a[0]+'px,'+a[1]+'px)';
      runner.classList.toggle('flip',facing<0);
      var mode=p<.38?'wild':p<.68?'trot':p<.95?'walk':'stand';
      ['wild','trot','walk','stand'].forEach(function(m){runner.classList.toggle(m,m===mode);});
      plaques.forEach(function(pq,i){if(a[3]>=gapIdx[i]||p>=1)pq.classList.add('in');});
    }
    var tk=false;window.addEventListener('scroll',function(){if(!tk){tk=true;requestAnimationFrame(function(){tk=false;upd();});}},{passive:true});
    var rt;function rel(){clearTimeout(rt);rt=setTimeout(layout,150);}
    if('ResizeObserver' in window)new ResizeObserver(rel).observe(ride);else window.addEventListener('resize',rel);
    layout();
  }

  /* ---------- golden key ---------- */
  var kb=document.querySelector('.keyblock');
  onView(kb,function(){kb.classList.add('open');},.45);
})();
