/* Общий код для главной и страниц курсов. Данные — window.ACI (data.js) */
(function(){
  var A = window.ACI, K = window.AK = {};
  var today = new Date(); today.setHours(0,0,0,0);
  var q = location.search.match(/[?&]today=(\d{4}-\d\d-\d\d)/); if (q) today = new Date(q[1]+'T00:00:00');
  K.CUR = {}; A.curators.forEach(function(c){ K.CUR[c.id] = c; });
  K.esc = function(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
  // Набор закрывается сам через 10 дней после старта
  A.groups.forEach(function(g){
    var days = (today - new Date(g.start+'T00:00:00'))/864e5;
    g.state = g.status === 'open' ? (days > 10 ? 'run' : 'open') : 'run';
    g.late = g.state === 'open' && days >= 0;
  });
  K.groupsOf = function(n){ return A.groups.filter(function(g){ return g.course === n; }); };
  K.stateOf = function(n){ var gs = K.groupsOf(n);
    if (gs.some(function(g){ return g.state === 'open'; })) return 'open';
    return gs.length ? 'run' : 'wait'; };
  K.open = A.groups.filter(function(g){ return g.state === 'open'; }).sort(function(a,b){ return a.start < b.start ? -1 : 1; });
  K.withCur = function(g){ return g.curator === 'sibir' ? 'с командой кураторов Сибирь / Дальний Восток' : g.curatorShort.replace(/^с /, 'с куратором '); };
  K.waitLink = function(n){ return (A.wait && A.wait[n]) || ''; };
  K.btn = function(href, cls, text, soon){
    return href ? '<a class="btn '+cls+'" href="'+K.esc(href)+'" target="_blank" rel="noopener">'+text+'</a>'
                : '<button class="btn '+cls+'" data-soon="'+K.esc(soon)+'">'+text+'</button>';
  };
  K.toast = function(t){ var e = document.getElementById('toast'); e.textContent = t; e.classList.add('on'); clearTimeout(e._t); e._t = setTimeout(function(){ e.classList.remove('on'); }, 3200); };
  K.BASE = 'https://staircase.classicwisdomacademy.com/aci-together/';
  document.addEventListener('click', function(e){
    var s = e.target.closest('[data-soon]'); if (s){ e.preventDefault(); K.toast(s.getAttribute('data-soon')); }
    var sh = e.target.closest('[data-share]'); if (sh){
      var url = K.BASE + sh.getAttribute('data-share') + '/';
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(function(){ K.toast('Ссылка скопирована: ' + url); }, function(){ prompt('Ссылка:', url); });
    }
  });
  K.yt = function(el, id, title){
    el.innerHTML = '<img loading="lazy" src="https://i.ytimg.com/vi/'+id+'/hqdefault.jpg" alt="'+K.esc(title)+'">';
    el.addEventListener('click', function(){ if (el.classList.contains('on')) return; el.classList.add('on');
      el.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="'+K.esc(title)+'"></iframe>'; });
  };
  // Общие блоки (отзывы, видео, истории) — заполняются, если есть на странице
  K.shared = function(root){
    root = root || '';
    var iv = document.getElementById('introVideo'); if (iv) K.yt(iv, A.introVideo.id, A.introVideo.t);
    var vs = document.getElementById('vStrip');
    if (vs){ vs.innerHTML = A.videos.map(function(v,i){ return '<div class="vcard"><div class="yt" data-v="'+i+'"></div><p>'+K.esc(v.t)+'</p></div>'; }).join('');
      vs.querySelectorAll('.yt').forEach(function(el){ var v = A.videos[+el.getAttribute('data-v')]; K.yt(el, v.id, v.t); }); }
    var rs = document.getElementById('revStrip');
    if (rs){
      rs.innerHTML = A.reviews.map(function(f){ return '<div class="rev"><img loading="lazy" src="'+root+'img/reviews/'+f+'" alt="Отзыв студента"></div>'; }).join('');
      var pause = false;
      rs.addEventListener('pointerenter', function(){ pause = true; }); rs.addEventListener('pointerleave', function(){ pause = false; });
      rs.addEventListener('touchstart', function(){ pause = true; }, {passive:true});
      setInterval(function(){ if (pause || document.hidden) return; var end = rs.scrollLeft + rs.clientWidth >= rs.scrollWidth - 5; rs.scrollTo({left: end ? 0 : rs.scrollLeft + 316, behavior:'smooth'}); }, 3500);
      var lb = document.getElementById('lb');
      rs.addEventListener('click', function(e){ if (e.target.tagName === 'IMG'){ lb.querySelector('img').src = e.target.src; lb.classList.add('on'); } });
      lb.addEventListener('click', function(){ lb.classList.remove('on'); });
    }
    var st = document.getElementById('stories');
    if (st){ st.innerHTML = A.stories.map(function(s){ return '<div class="story"><div class="who"><img loading="lazy" src="'+root+s.img+'" alt=""><b>'+K.esc(s.name)+'</b></div><p class="txt">'+K.esc(s.text)+'</p><button class="more">Читать полностью</button></div>'; }).join('');
      st.querySelectorAll('.more').forEach(function(b){ b.addEventListener('click', function(){ var f = b.parentNode.classList.toggle('full'); b.textContent = f ? 'Свернуть' : 'Читать полностью'; }); }); }
    document.querySelectorAll('.arr').forEach(function(b){ b.addEventListener('click', function(){ var s = document.getElementById(b.getAttribute('data-s')); s.scrollBy({left: +b.getAttribute('data-d') * s.clientWidth * .85, behavior:'smooth'}); }); });
    var io = ('IntersectionObserver' in window && !/[?&]still/.test(location.search)) ? new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); }, {threshold:.12}) : null;
    document.querySelectorAll('section h2, .ccard, .how li, .topic').forEach(function(el){ if (io){ el.classList.add('reveal'); io.observe(el); } });
  };
})();
