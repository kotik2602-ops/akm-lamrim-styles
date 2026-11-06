/* Seed sprouts at the bottom of the card and two vines grow around its border */
(function(){
  var card=document.querySelector('.seedcard'); if(!card) return;
  var svg=card.querySelector('svg.vine'); if(!svg) return;
  var NS='http://www.w3.org/2000/svg';
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SPROUT=1.4, GROW=4.2; // seconds
  function el(n,a,p){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);(p||svg).appendChild(e);return e;}
  // points along one half of a rounded-rect perimeter: from bottom-center, going `dir` (-1 left, +1 right), ending at top-center
  function half(w,h,ins,r,dir){
    var pts=[],cx=w/2,L=ins,R=w-ins,T=ins,B=h-ins;
    function add(x,y){pts.push([x,y]);}
    var step=4,x,y,a;
    if(dir<0){
      for(x=cx;x>L+r;x-=step)add(x,B);
      for(a=90;a<=180;a+=6)add(L+r+r*Math.cos(a*Math.PI/180),B-r+r*Math.sin(a*Math.PI/180));
      for(y=B-r;y>T+r;y-=step)add(L,y);
      for(a=180;a<=270;a+=6)add(L+r+r*Math.cos(a*Math.PI/180),T+r+r*Math.sin(a*Math.PI/180));
      for(x=L+r;x<=cx;x+=step)add(x,T);
    }else{
      for(x=cx;x<R-r;x+=step)add(x,B);
      for(a=90;a>=0;a-=6)add(R-r+r*Math.cos(a*Math.PI/180),B-r+r*Math.sin(a*Math.PI/180));
      for(y=B-r;y>T+r;y-=step)add(R,y);
      for(a=0;a>=-90;a-=6)add(R-r+r*Math.cos(a*Math.PI/180),T+r+r*Math.sin(a*Math.PI/180));
      for(x=R-r;x>=cx;x-=step)add(x,T);
    }
    // wobble perpendicular to direction
    var out=[],len=0,acc=[0];
    for(var i=1;i<pts.length;i++){len+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);acc.push(len);}
    for(i=0;i<pts.length;i++){
      var p=pts[i],q=pts[Math.min(i+1,pts.length-1)],o=pts[Math.max(i-1,0)];
      var tx=q[0]-o[0],ty=q[1]-o[1],tl=Math.hypot(tx,ty)||1,nx=-ty/tl,ny=tx/tl;
      var amp=4.5*Math.min(1,acc[i]/40),wv=Math.sin(acc[i]/26)*amp;
      out.push([p[0]+nx*wv,p[1]+ny*wv,tx/tl,ty/tl,acc[i]]);
    }
    return {pts:out,len:len};
  }
  function d(pts){var s='M'+pts[0][0].toFixed(1)+' '+pts[0][1].toFixed(1);for(var i=1;i<pts.length;i++)s+='L'+pts[i][0].toFixed(1)+' '+pts[i][1].toFixed(1);return s;}
  function leaf(x,y,ang,size,delay,side){
    var g=el('g',{class:'leaf',transform:'translate('+x.toFixed(1)+' '+y.toFixed(1)+') rotate('+(ang+side*55).toFixed(1)+')'});
    var inner=el('g',{class:'leaf-in',style:'animation-delay:'+delay.toFixed(2)+'s'},g);
    el('path',{d:'M0 0C'+(size*.35)+' '+(-size*.45)+' '+(size*.95)+' '+(-size*.4)+' '+(size*1.25)+' 0C'+(size*.95)+' '+(size*.4)+' '+(size*.35)+' '+(size*.45)+' 0 0Z',fill:'url(#vLeaf)'},inner);
    el('path',{d:'M1 0L'+(size*1.05)+' 0',stroke:'rgba(255,255,255,.55)','stroke-width':'.8',fill:'none'},inner);
  }
  function flower(x,y,delay){
    var g=el('g',{transform:'translate('+x+' '+y+')'});
    var inner=el('g',{class:'bloom',style:'animation-delay:'+delay.toFixed(2)+'s'},g);
    for(var i=0;i<5;i++)el('ellipse',{cx:0,cy:-6,rx:3.6,ry:6,fill:'url(#vPetal)',transform:'rotate('+(i*72)+')'},inner);
    el('circle',{r:3,fill:'#ffd27a'},inner);
  }
  function build(){
    while(svg.firstChild)svg.removeChild(svg.firstChild);
    var w=card.clientWidth,h=card.clientHeight;if(w<60||h<60)return;
    svg.setAttribute('viewBox','0 0 '+w+' '+h);svg.setAttribute('width',w);svg.setAttribute('height',h);
    var defs=el('defs',{});
    var lg=el('linearGradient',{id:'vLeaf',x1:0,y1:0,x2:1,y2:1},defs);el('stop',{offset:0,'stop-color':'#a9c98a'},lg);el('stop',{offset:1,'stop-color':'#5f8f55'},lg);
    var pg=el('radialGradient',{id:'vPetal'},defs);el('stop',{offset:0,'stop-color':'#fff1e6'},pg);el('stop',{offset:1,'stop-color':'#ff9f8a'},pg);
    var sg=el('radialGradient',{id:'vSeed',cx:'35%',cy:'30%'},defs);el('stop',{offset:0,'stop-color':'#f3d38c'},sg);el('stop',{offset:1,'stop-color':'#a26a2c'},sg);
    var ins=11,r=Math.min(26,Math.min(w,h)/6),cx=w/2,B=h-ins;
    // glow under seed
    el('ellipse',{class:'seed-glow',cx:cx,cy:B,rx:34,ry:10,fill:'rgba(255,200,120,.45)'});
    // vines
    var halves=[half(w,h,ins,r,-1),half(w,h,ins,r,1)];
    halves.forEach(function(H,k){
      el('path',{class:'vine-path',d:d(H.pts),pathLength:1,fill:'none',stroke:'#6f9a5a','stroke-width':2.2,'stroke-linecap':'round',style:'animation-delay:'+SPROUT+'s'});
      var side=k?1:-1,n=0;
      for(var dist=46;dist<H.len-30;dist+=38){
        var i=0;while(i<H.pts.length-1&&H.pts[i][4]<dist)i++;
        var p=H.pts[i],ang=Math.atan2(p[3],p[2])*180/Math.PI;
        var sideFlip=(n%2?1:-1)*(k?1:-1);
        leaf(p[0],p[1],ang,9+((n*7)%5),SPROUT+GROW*(dist/H.len)+.15,sideFlip);n++;
      }
    });
    flower(cx,ins,SPROUT+GROW+.1);
    // sprout + seed (drawn last so it sits on top)
    el('path',{class:'sprout',d:'M'+cx+' '+B+'C'+(cx-2)+' '+(B-10)+' '+(cx+3)+' '+(B-18)+' '+cx+' '+(B-26),pathLength:1,fill:'none',stroke:'#6f9a5a','stroke-width':2.4,'stroke-linecap':'round'});
    var cot=el('g',{transform:'translate('+cx+' '+(B-26)+')'});
    var ci=el('g',{class:'leaf-in',style:'animation-delay:1.05s'},cot);
    el('path',{d:'M0 0C-4-6-12-8-16-4C-12 0-5 2 0 0Z',fill:'url(#vLeaf)'},ci);
    el('path',{d:'M0 0C4-6 12-8 16-4C12 0 5 2 0 0Z',fill:'url(#vLeaf)'},ci);
    el('ellipse',{class:'seed',cx:cx,cy:B-1,rx:7,ry:5,fill:'url(#vSeed)'});
  }
  build();
  var lastW=card.clientWidth,lastH=card.clientHeight,rt;
  function onSize(){var w=card.clientWidth,h=card.clientHeight;if(Math.abs(w-lastW)<2&&Math.abs(h-lastH)<2)return;lastW=w;lastH=h;clearTimeout(rt);rt=setTimeout(function(){build();if(card.classList.contains('grow'))card.classList.add('done');},150);}
  if('ResizeObserver' in window)new ResizeObserver(onSize).observe(card);else window.addEventListener('resize',onSize);
  if(reduce||!('IntersectionObserver' in window)){card.classList.add('grow','done');return;}
  var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){card.classList.add('grow');io.disconnect();setTimeout(function(){card.classList.add('done');},(SPROUT+GROW+1.5)*1000);}},{threshold:.45});
  io.observe(card);
})();
