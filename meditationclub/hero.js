/* Animated hero scene: violet dusk valley, lake reflection, breathing star portal with a meditator */
(function(){
  var cv=document.getElementById('scene'); if(!cv||!cv.getContext) return;
  var ctx=cv.getContext('2d');
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches||/[?&]still/.test(location.search);
  var off=document.createElement('canvas'), oc=off.getContext('2d');
  var W=0,H=0,DPR=1,hz=0,mobile=false,ridges=[],stars=[],pstars=[],sparks=[],t0=performance.now(),visible=true;

  function rnd(seed){return function(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};}
  function ridge(seed,x0,x1,yTop,yEnd,n,rough){
    var r=rnd(seed),pts=[];
    for(var i=0;i<=n;i++){var k=i/n,x=x0+(x1-x0)*k;var base=yTop+(yEnd-yTop)*Math.pow(k,1.25);pts.push([x,base-(r()-.35)*rough]);}
    return pts;
  }
  function build(){
    var r=cv.getBoundingClientRect();
    DPR=Math.min(window.devicePixelRatio||1,1.6);
    W=Math.max(320,Math.round(r.width));H=Math.max(480,Math.round(r.height));
    cv.width=off.width=Math.round(W*DPR);cv.height=off.height=Math.round(H*DPR);
    mobile=W<760; hz=Math.round(H*(mobile?.36:.6));
    var s=W/1440;
    ridges=[
      {c:['#eeebfb','#b9b4e2'],a:.85,l:ridge(3,-20,W*.62,hz-H*.18,hz,14,46*s),rr:ridge(5,W*1.02,W*.38,hz-H*.2,hz,14,46*s)},
      {c:['#ffffff','#8c86c8'],a:1,sharp:1,l:peaks(17,-20,W*.47,hz-H*(mobile?.22:.34),hz,11,H*.07),rr:peaks(19,W*1.02,W*.55,hz-H*(mobile?.2:.3),hz,11,H*.07)},

    ];
    var r2=rnd(42);stars=[];for(var i=0;i<140;i++)stars.push([r2()*W,r2()*hz*.75,r2()*1.3+.3,r2()*6.28]);
    pstars=[];for(i=0;i<70;i++)pstars.push([r2(),r2(),r2()*1.4+.3,r2()*6.28,r2()*.5+.2]);
    sparks=[];for(i=0;i<(mobile?26:46);i++)sparks.push([r2()*W,r2()*H,r2()*2+.8,r2()*.4+.15,r2()*6.28]);
  }
  function peaks(seed,x0,x1,yTop,yEnd,n,amp){
    var r=rnd(seed),pts=[];
    for(var i=0;i<=n;i++){var k=i/n,x=x0+(x1-x0)*(k+(i&&i<n?(r()-.5)*.5/n:0));var base=yTop+(yEnd-yTop)*Math.pow(k,1.15);pts.push([x,base-(i%2?-.15:1)*r()*amp]);}
    return pts;
  }
  function sharp(c,pts,closeY){c.beginPath();c.moveTo(pts[0][0],closeY);for(var i=0;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.lineTo(pts[pts.length-1][0],closeY);c.closePath();}
  function path(c,pts,closeY){
    c.beginPath();c.moveTo(pts[0][0],closeY);c.lineTo(pts[0][0],pts[0][1]);
    for(var i=1;i<pts.length;i++){var p=pts[i-1],q=pts[i],mx=(p[0]+q[0])/2;c.bezierCurveTo(mx,p[1],mx,q[1],q[0],q[1]);}
    c.lineTo(pts[pts.length-1][0],closeY);c.closePath();
  }
  function breath(t){var ph=(t%10)/10;return ph<.4?.5-.5*Math.cos(Math.PI*ph/.4):.5+.5*Math.cos(Math.PI*(ph-.4)/.6);}
  function meditator(c,x,y,h,glow){
    // y = bottom (sitting surface); silhouette in lotus pose
    c.save();c.translate(x,y-h);c.scale(h,h);
    c.fillStyle='#2c0f1f';
    c.beginPath();c.ellipse(0,.1,.075,.088,0,0,6.283);c.fill();
    c.beginPath();
    c.moveTo(-.03,.18);c.lineTo(.03,.18);c.lineTo(.035,.215);
    c.bezierCurveTo(.1,.22,.15,.24,.16,.3);
    c.bezierCurveTo(.18,.4,.2,.5,.25,.6);
    c.bezierCurveTo(.3,.68,.36,.72,.42,.74);
    c.bezierCurveTo(.52,.77,.6,.84,.56,.9);
    c.bezierCurveTo(.5,.98,.2,1.0,0,1.0);c.bezierCurveTo(-.2,1.0,-.5,.98,-.56,.9);
    c.bezierCurveTo(-.6,.84,-.52,.77,-.42,.74);
    c.bezierCurveTo(-.36,.72,-.3,.68,-.25,.6);
    c.bezierCurveTo(-.2,.5,-.18,.4,-.16,.3);
    c.bezierCurveTo(-.15,.24,-.1,.22,-.035,.215);c.closePath();c.fill();
    c.fillStyle='rgba(255,255,255,.08)';c.beginPath();c.moveTo(-.12,.62);c.bezierCurveTo(-.06,.7,.06,.7,.12,.62);c.lineTo(.1,.6);c.bezierCurveTo(.05,.66,-.05,.66,-.1,.6);c.closePath();c.fill();
    var g=c.createRadialGradient(0,.42,0,0,.42,.18+.1*glow);
    g.addColorStop(0,'rgba(255,246,214,'+(.75+.25*glow)+')');g.addColorStop(.35,'rgba(255,206,120,'+(.45+.3*glow)+')');g.addColorStop(1,'rgba(255,190,110,0)');
    c.fillStyle=g;c.beginPath();c.arc(0,.42,.3,0,6.283);c.fill();
    c.restore();
  }
  function drawUpper(t){
    var c=oc;c.setTransform(DPR,0,0,DPR,0,0);
    var sky=c.createLinearGradient(0,0,0,hz);
    sky.addColorStop(0,'#8784d3');sky.addColorStop(.45,'#a39ee3');sky.addColorStop(.78,'#cbbbea');sky.addColorStop(.95,'#efd9e8');sky.addColorStop(1,'#f8e6ea');
    c.fillStyle=sky;c.fillRect(0,0,W,hz+2);
    var b=breath(t);
    // sun glow behind portal
    var sg=c.createRadialGradient(W/2,hz,0,W/2,hz,W*(.32+.04*b));
    sg.addColorStop(0,'rgba(255,244,240,.9)');sg.addColorStop(.35,'rgba(240,210,232,.35)');sg.addColorStop(1,'rgba(240,210,232,0)');
    c.fillStyle=sg;c.fillRect(0,0,W,hz+2);
    // stars
    for(var i=0;i<stars.length;i++){var s=stars[i],a=.25+.6*(.5+.5*Math.sin(t*1.3+s[3]));c.globalAlpha=a*.6*(1-s[1]/(hz*.6));c.fillStyle='#ffffff';c.beginPath();c.arc(s[0],s[1],s[2],0,6.283);c.fill();}
    c.globalAlpha=1;
    // mist band drifting
    var mx=(t*12)%W;
    for(var k=-1;k<2;k++){var mg=c.createRadialGradient(mx+k*W,hz-H*.05,0,mx+k*W,hz-H*.05,W*.45);mg.addColorStop(0,'rgba(255,255,255,.28)');mg.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=mg;c.fillRect(0,hz-H*.3,W,H*.3);}
    // mountains
    for(var j=0;j<ridges.length;j++){var R=ridges[j];var g=c.createLinearGradient(0,hz-H*(j?.36:.22),0,hz);g.addColorStop(0,R.c[0]);g.addColorStop(1,R.c[1]);c.fillStyle=g;c.globalAlpha=R.a;var f=R.sharp?sharp:path;f(c,R.l,hz+2);c.fill();f(c,R.rr,hz+2);c.fill();if(R.sharp){c.globalAlpha=.35;var sh=c.createLinearGradient(0,0,W,0);sh.addColorStop(0,'rgba(90,80,160,.0)');sh.addColorStop(.5,'rgba(90,80,160,.5)');sh.addColorStop(1,'rgba(90,80,160,0)');c.fillStyle=sh;f(c,R.l,hz+2);c.fill();f(c,R.rr,hz+2);c.fill();}}
    c.globalAlpha=1;
    // portal
    var pw=Math.max(84,Math.min(W*.105,170)),ph=Math.min(pw*2.7,hz*.82),px=W/2-pw/2,py=hz-ph;
    c.save();
    c.shadowColor='rgba(255,240,250,'+(.6+.35*b)+')';c.shadowBlur=30+40*b;
    c.fillStyle='#3a3270';c.fillRect(px,py,pw,ph);c.restore();
    c.save();c.beginPath();c.rect(px,py,pw,ph);c.clip();
    var pg=c.createLinearGradient(0,py,0,hz);pg.addColorStop(0,'#2a2462');pg.addColorStop(.45,'#5d55a8');pg.addColorStop(.82,'#c9b3e6');pg.addColorStop(1,'#fbe9ef');
    c.fillStyle=pg;c.fillRect(px,py,pw,ph);
    var nx=px+pw*(.5+.25*Math.sin(t*.13)),ny=py+ph*(.3+.05*Math.cos(t*.11));
    var ng=c.createRadialGradient(nx,ny,0,nx,ny,pw*1.1);ng.addColorStop(0,'rgba(255,190,220,.55)');ng.addColorStop(.4,'rgba(170,120,230,.3)');ng.addColorStop(1,'rgba(170,120,230,0)');c.fillStyle=ng;c.fillRect(px,py,pw,ph);
    var ng2=c.createRadialGradient(px+pw*.3,py+ph*.6,0,px+pw*.3,py+ph*.6,pw*.9);ng2.addColorStop(0,'rgba(255,220,150,.4)');ng2.addColorStop(1,'rgba(255,220,150,0)');c.fillStyle=ng2;c.fillRect(px,py,pw,ph);
    for(i=0;i<pstars.length;i++){var q=pstars[i];var yy=py+((q[1]-t*.012*q[4])%1+1)%1*ph;c.globalAlpha=.4+.6*(.5+.5*Math.sin(t*2+q[3]));c.fillStyle='#fffaf0';c.beginPath();c.arc(px+q[0]*pw,yy,q[2],0,6.283);c.fill();}
    c.globalAlpha=1;
    c.restore();
    c.strokeStyle='rgba(255,255,255,'+(.55+.35*b)+')';c.lineWidth=1.2;c.strokeRect(px+.5,py+.5,pw-1,ph-1);
    meditator(c,W/2,hz-2,pw*.58,b);
    return {pw:pw,ph:ph,b:b};
  }
  function frame(now){
    var t=(now-t0)/1000;
    var P=drawUpper(t);
    ctx.setTransform(1,0,0,1,0,0);
    ctx.drawImage(off,0,0,W*DPR,hz*DPR,0,0,W*DPR,hz*DPR);
    // water
    ctx.setTransform(DPR,0,0,DPR,0,0);
    ctx.fillStyle='#7c7ac4';ctx.fillRect(0,hz,W,H-hz);
    var step=2;
    for(var y=hz;y<H;y+=step){
      var d=y-hz,src=hz-d*1.0-step;if(src<0)break;
      var amp=(.6+d*.02)*(reduce?0:1);
      var dx=Math.sin(d*.09-t*1.6)*amp+Math.sin(d*.023+t*.7)*amp*.6;
      ctx.globalAlpha=Math.max(0,.72-d/(H-hz)*.55);
      ctx.drawImage(off,0,src*DPR,W*DPR,step*DPR,dx,y,W,step);
    }
    ctx.globalAlpha=1;
    var wg=ctx.createLinearGradient(0,hz,0,H);wg.addColorStop(0,'rgba(120,118,200,.05)');wg.addColorStop(1,'rgba(70,58,130,.6)');ctx.fillStyle=wg;ctx.fillRect(0,hz,W,H-hz);
    // glints on water under portal
    for(var g=0;g<14;g++){var gy=hz+8+g*g*2.2,gw=P.pw*(.4+g*.12)*(.8+.2*Math.sin(t*2+g));ctx.globalAlpha=(.5-g*.03)*(.6+.4*P.b);ctx.fillStyle='#ffffff';ctx.fillRect(W/2-gw/2+Math.sin(t*1.7+g)*3,gy,gw,1.2);}
    ctx.globalAlpha=1;
    // horizon line glow
    var hg=ctx.createLinearGradient(0,0,W,0);hg.addColorStop(0,'rgba(255,220,180,0)');hg.addColorStop(.5,'rgba(255,255,255,.85)');hg.addColorStop(1,'rgba(255,220,180,0)');ctx.fillStyle=hg;ctx.fillRect(0,hz-1,W,1.5);
    // rising golden sparks
    for(var i=0;i<sparks.length;i++){var s=sparks[i];var sy=((s[1]-t*18*s[3])%H+H)%H,sx=s[0]+Math.sin(t*.6+s[4])*14;ctx.globalAlpha=.35+.45*Math.sin(t*1.5+s[4])*.5+.2;ctx.fillStyle='#ffffff';ctx.shadowColor='#f3eaff';ctx.shadowBlur=8;ctx.beginPath();ctx.arc(sx,sy,s[2],0,6.283);ctx.fill();}
    ctx.shadowBlur=0;ctx.globalAlpha=1;
    if(!reduce&&visible)requestAnimationFrame(frame);
  }
  build();
  var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){build();if(reduce)frame(performance.now());},150);});
  if('IntersectionObserver' in window){new IntersectionObserver(function(es){var v=es[0].isIntersecting;if(v&&!visible&&!reduce){visible=true;requestAnimationFrame(frame);}visible=v;}).observe(cv);}
  requestAnimationFrame(frame);
})();
