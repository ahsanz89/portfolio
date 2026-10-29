(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var G = window.gsap, ST = window.ScrollTrigger, anim = !!(G && ST) && !reduce;

  /* smooth scroll */
  var lenis = null;
  if (anim && window.Lenis) {
    lenis = new window.Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true, wheelMultiplier: 0.9 });
    lenis.on('scroll', ST.update);
    G.ticker.add(function (t) { lenis.raf(t * 1000); });
    G.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href').slice(1), t = id ? document.getElementById(id) : null;
        if (!t) return;
        e.preventDefault();
        lenis.scrollTo(t, { offset: id === 'top' ? 0 : -70, duration: 1.4 });
      });
    });
  }
  if (anim) G.registerPlugin(ST);
  var desktop = matchMedia('(min-width: 901px)').matches;
  var body = document.body, baseBg = '#0B0B0D';

  /* ---------- loader ---------- */
  var loader = document.getElementById('loader'), ldn = document.getElementById('ldn'), bar = document.getElementById('ldbar'), msg = document.getElementById('ldmsg');
  var msgs = ['Loading case studies','Pulling frames from Figma','Setting design tokens','Drawing the flow','Ready'];
  function finishLoader(){ loader.classList.add('done'); setTimeout(function(){ loader.style.display='none'; }, 950); intro(); }
  if (reduce || !loader) { if(loader) loader.style.display='none'; intro(); }
  else {
    loader.style.animation='none';
    var t0 = performance.now(), dur = 1700;
    (function tick(now){
      var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3), v = Math.round(e * 100);
      ldn.textContent = v; bar.style.width = v + '%'; msg.textContent = msgs[Math.min(msgs.length - 1, Math.floor(e * msgs.length))];
      if (p < 1) requestAnimationFrame(tick); else setTimeout(finishLoader, 250);
    })(t0);
  }

  /* ---------- hero intro ---------- */
  var introRan = false;
  function intro(){
    if (introRan) return; introRan = true;
    if (!anim) return;
    G.from('.hero .ln > span', {yPercent:110, duration:1.1, ease:'power4.out', stagger:.09, delay:.15});
    G.from('.hero .mono, .hero .foot', {y:20, opacity:0, duration:.9, ease:'power3.out', stagger:.1, delay:.5});
    G.from('.me', {y:80, opacity:0, duration:1.4, ease:'power3.out', delay:.3});
    G.from('.me .tag', {x:60, y:40, opacity:0, duration:1, ease:'power3.out', delay:1.2});
    G.from('.me figcaption', {y:20, opacity:0, duration:.9, ease:'power3.out', delay:1.0});
  }

  /* ---------- scroll animations ---------- */
  function setupScroll(){
    if (!anim) return;

    // generic line reveals for big headings (except hero)
    G.utils.toArray('section:not(.hero) .big, .proc-head .big').forEach(function(h){
      G.from(h.querySelectorAll('.ln > span'), {yPercent:110, duration:1, ease:'power4.out', stagger:.08, scrollTrigger:{trigger:h, start:'top 85%'}});
    });

    // portrait drifts up as the hero scrolls away
    G.to('.me .d, .me .c', {yPercent:-6, ease:'none', scrollTrigger:{trigger:'.hero', start:'top top', end:'bottom top', scrub:true}});

    // manifesto: words light up with scroll
    var p = document.querySelector('.words');
    if (p){
      p.innerHTML = p.textContent.trim().split(/\s+/).map(function(w){ return '<span class="w">'+w+'</span>'; }).join(' ');
      G.fromTo(p.querySelectorAll('.w'), {opacity:.14}, {opacity:1, stagger:.05, ease:'none', scrollTrigger:{trigger:p, start:'top 75%', end:'bottom 45%', scrub:true}});
    }

    // counters
    G.utils.toArray('[data-count]').forEach(function(el){
      var n = +el.getAttribute('data-count'), o = {v:0};
      ST.create({trigger:el, start:'top 88%', once:true, onEnter:function(){
        G.to(o, {v:n, duration:1.6, ease:'power2.out', onUpdate:function(){ el.textContent = Math.round(o.v) + (n===15?'+':''); }});
      }});
    });

    // more product work cards
    G.utils.toArray('.mcard').forEach(function(c, i){
      G.from(c, {y:80, opacity:0, rotate:(i%3-1)*2, duration:1, ease:'power3.out', delay:(i%3)*.08, scrollTrigger:{trigger:c, start:'top 92%'}});
    });
    G.from('.more-head p', {y:24, opacity:0, duration:.8, scrollTrigger:{trigger:'.more-head', start:'top 85%'}});

    // capabilities, facts, narratives, lists
    G.utils.toArray('.cap li, .idx li, .roles li, .ai-cols li, .skills > div').forEach(function(el){
      G.from(el, {y:28, opacity:0, duration:.8, ease:'power3.out', scrollTrigger:{trigger:el, start:'top 92%'}});
    });
    G.utils.toArray('.info').forEach(function(info){
      G.from(info.querySelectorAll('.info-top > *, .facts > div, .narr > div'), {y:36, opacity:0, duration:.9, ease:'power3.out', stagger:.07, scrollTrigger:{trigger:info, start:'top 80%'}});
    });

    // project scenes
    G.utils.toArray('.proj').forEach(function(pr){
      var scene = pr.querySelector('.scene'), ghost = scene.querySelector('.ghost'), main = scene.querySelector('.main'),
          over = scene.querySelector('.over'), phones = scene.querySelectorAll('.phone'), lens = scene.querySelector('.lens');
      // background tint per project
      ST.create({trigger:pr, start:'top 60%', end:'bottom 40%',
        onToggle:function(self){ G.to(body, {backgroundColor: self.isActive ? pr.getAttribute('data-bg') : baseBg, duration:.8, overwrite:'auto'}); }});
      if (desktop){
        var tl = G.timeline({scrollTrigger:{trigger:scene, start:'top top', end:'+=120%', scrub:.6, pin:true, anticipatePin:1}});
        tl.fromTo(ghost, {scale:1.35, opacity:0}, {scale:1, opacity:1, duration:1, ease:'none'}, 0)
          .fromTo(main, {y:'55vh', rotateX:18, scale:.82, transformPerspective:1400}, {y:0, rotateX:0, scale:1, duration:1, ease:'power2.out'}, 0);
        if (over) tl.fromTo(over, {x:'40vw', y:'20vh', opacity:0}, {x:0, y:0, opacity:1, duration:.8, ease:'power2.out'}, .45);
        if (phones.length) tl.fromTo(phones, {y:'70vh'}, {y:0, duration:.8, stagger:.12, ease:'power2.out'}, .4);
        if (lens) tl.fromTo(lens, {x:'-30vw', opacity:0}, {x:0, opacity:1, duration:.7, ease:'power2.out'}, .5);
        var phs = scene.querySelectorAll('.ph');
        if (phs.length) tl.fromTo(phs, {y:'45vh', rotate:function(i){ return (i-1.5)*4; }}, {y:0, rotate:0, duration:.9, stagger:.1, ease:'power3.out'}, .1);
        tl.to(ghost, {yPercent:-30, duration:.6, ease:'none'}, 1);
        if (pr.id === 'p-web'){ tl.fromTo('#webimg', {objectPosition:'50% 0%'}, {objectPosition:'50% 100%', duration:.9, ease:'none'}, .7); }
      } else {
        G.from(main, {y:80, opacity:0, duration:1, ease:'power3.out', scrollTrigger:{trigger:scene, start:'top 80%'}});
      }
    });

    // process horizontal track
    var track = document.getElementById('track');
    if (desktop && track){
      var dist = function(){ return Math.max(0, track.scrollWidth - innerWidth); };
      G.to(track, {x:function(){ return -dist(); }, ease:'none', scrollTrigger:{trigger:'.hwrap', start:'top 12%', end:function(){ return '+=' + dist(); }, pin:'.process', scrub:.6, invalidateOnRefresh:true}});
    }

    // systems
    G.from('.sw i', {scale:0, duration:.6, ease:'back.out(1.8)', stagger:.04, scrollTrigger:{trigger:'.sw', start:'top 85%'}});
    G.from('.ts div', {x:-40, opacity:0, duration:.7, ease:'power3.out', stagger:.08, scrollTrigger:{trigger:'.ts', start:'top 88%'}});
    G.from('#ramp b', {scaleY:0, duration:.7, ease:'power3.out', stagger:.05, scrollTrigger:{trigger:'#ramp', start:'top 88%'}});
    G.from('.sys-shot', {y:60, opacity:0, duration:1, ease:'power3.out', scrollTrigger:{trigger:'.sys-shot', start:'top 92%'}});

    // AI image wipe
    G.fromTo('.ai-shot', {clipPath:'inset(0 0 100% 0 round 14px)'}, {clipPath:'inset(0 0 0% 0 round 14px)', ease:'none', scrollTrigger:{trigger:'.ai-shot', start:'top 85%', end:'top 35%', scrub:true}});

    // earlier work: entrance, endless rows, scroll direction + velocity, skew
    var rows = [['#row1',-1],['#row2',1]].map(function(r){
      var row = document.querySelector(r[0]); if(!row) return null;
      row.innerHTML += row.innerHTML;
      G.fromTo(row.children, {y:90, opacity:0, rotate:r[1]*3}, {y:0, opacity:1, rotate:0, duration:1, ease:'power3.out', stagger:.05, scrollTrigger:{trigger:'.marq', start:'top 92%', toggleActions:'play none none none'}});
      var w = row.scrollWidth/2, dir = r[1];
      var tw = G.fromTo(row, {x: dir<0 ? 0 : -w}, {x: dir<0 ? -w : 0, duration:26, ease:'none', repeat:-1});
      var hover = 1;
      row.addEventListener('mouseenter', function(){ hover = .18; G.to(tw, {timeScale:.18*sign, duration:.6, overwrite:true}); });
      row.addEventListener('mouseleave', function(){ hover = 1; G.to(tw, {timeScale:sign, duration:.6, overwrite:true}); });
      var sign = 1;
      return {row:row, tw:tw, set:function(v, d){ sign = d; G.to(tw, {timeScale:v*d*hover, duration:.35, overwrite:true}); G.to(tw, {timeScale:d*hover, duration:1.4, delay:.35}); }};
    }).filter(Boolean);
    var skewTo = G.quickTo('.row', 'skewX', {duration:.5, ease:'power3'});
    ST.create({trigger:'.archive', start:'top bottom', end:'bottom top', onUpdate:function(self){
      var vel = self.getVelocity(), v = Math.min(5, 1 + Math.abs(vel)/500), d = self.direction;
      rows.forEach(function(r){ r.set(v, d); });
      skewTo(G.utils.clamp(-8, 8, vel/-300));
      clearTimeout(window.__sk); window.__sk = setTimeout(function(){ skewTo(0); }, 140);
    }});
    bindLightbox();
  }

  /* ---------- flow line ---------- */
  var svg = document.getElementById('thread'), base = document.getElementById('tBase'), live = document.getElementById('tLive'),
      nodesG = document.getElementById('tNodes'), tip = document.getElementById('tTip'), samples = [], total = 0, nodes = [];
  function buildThread(){
    if (innerWidth <= 760) return;
    var docH = document.documentElement.scrollHeight, W = document.documentElement.clientWidth;
    svg.setAttribute('height', docH); svg.style.height = docH + 'px'; svg.setAttribute('viewBox', '0 0 ' + W + ' ' + docH);
    var pts = [];
    document.querySelectorAll('[data-node]').forEach(function(el){
      var r = el.getBoundingClientRect(); pts.push([W * parseFloat(el.getAttribute('data-node')), r.top + scrollY + Math.min(r.height * .35, 260)]);
    });
    pts.sort(function(a,b){ return a[1]-b[1]; });
    if (pts.length < 2) return;
    var d = 'M' + pts[0][0] + ' ' + pts[0][1];
    for (var i = 1; i < pts.length; i++){
      var a = pts[i-1], b = pts[i], my = (a[1] + b[1]) / 2;
      d += ' C' + a[0] + ' ' + my + ',' + b[0] + ' ' + my + ',' + b[0] + ' ' + b[1];
    }
    base.setAttribute('d', d); live.setAttribute('d', d);
    total = live.getTotalLength();
    live.style.strokeDasharray = total; live.style.strokeDashoffset = total;
    samples = []; var N = 900;
    for (var k = 0; k <= N; k++){ var L = total * k / N, pt = live.getPointAtLength(L); samples.push([L, pt.y, pt.x]); }
    nodesG.innerHTML = ''; nodes = pts.map(function(p){ var c = document.createElementNS('http://www.w3.org/2000/svg','circle'); c.setAttribute('cx', p[0]); c.setAttribute('cy', p[1]); c.setAttribute('r', 6); nodesG.appendChild(c); return [c, p[1]]; });
    drawThread();
  }
  function drawThread(){
    var y = scrollY + innerHeight * .62;
    var doc = document.documentElement, prog = Math.min(1, scrollY / Math.max(1, doc.scrollHeight - innerHeight));
    document.getElementById('pct').textContent = String(Math.round(prog * 100)).padStart(3,'0') + '%';
    if (!samples.length) return;
    var L = 0, x = samples[0][2], yy = samples[0][1];
    for (var i = 0; i < samples.length; i++){ if (samples[i][1] <= y){ if (samples[i][0] >= L){ L = samples[i][0]; x = samples[i][2]; yy = samples[i][1]; } } else if (samples[i][0] > L + total*.02) break; }
    live.style.strokeDashoffset = total - L;
    tip.setAttribute('cx', x); tip.setAttribute('cy', yy);
    nodes.forEach(function(n){ n[0].classList.toggle('on', n[1] <= y); });
  }
  addEventListener('scroll', drawThread, {passive:true});
  var hd = document.querySelector('.hd'), lastY = 0;
  function onHead(){
    var y = scrollY;
    hd.classList.toggle('stuck', y > 40);
    lastY = y;
  }
  addEventListener('scroll', onHead, {passive:true}); onHead();
  var rt; addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(buildThread, 200); });

  /* ---------- lightbox + copy ---------- */
  var lbBound = false;
  function bindLightbox(){
    if (lbBound) return; lbBound = true;
    var lb = document.getElementById('lb'), img = document.getElementById('lbi');
    document.addEventListener('click', function(e){
      var b = e.target.closest('[data-full]'); if (!b) return;
      img.src = b.getAttribute('data-full'); var i = b.querySelector('img'); img.alt = i ? i.alt : '';
      lb.showModal ? lb.showModal() : lb.setAttribute('open','');
    });
    document.getElementById('lbx').addEventListener('click', function(){ lb.close(); });
    lb.addEventListener('click', function(e){ if (e.target === lb) lb.close(); });
  }
  var toast = document.getElementById('toast'), tt;
  function show(m){ toast.textContent = m; toast.hidden = false; clearTimeout(tt); tt = setTimeout(function(){ toast.hidden = true; }, 1800); }
  document.querySelectorAll('[data-copy]').forEach(function(b){
    b.addEventListener('click', function(){ var v = b.getAttribute('data-copy'); try { navigator.clipboard.writeText(v).then(function(){ show('Copied ' + v); }, function(){ show(v); }); } catch(e){ show(v); } });
  });

  /* ---------- boot ---------- */
  setupScroll();
  if (!anim){ bindLightbox(); var mq = document.querySelector('.marq'); if (mq) mq.classList.add('static'); }
  function rebuild(){ buildThread(); }
  if (anim) ST.addEventListener('refresh', rebuild);
  addEventListener('load', function(){ if (anim) ST.refresh(); else buildThread(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ if (anim) ST.refresh(); else buildThread(); });
  buildThread();
})();

/* selected work: tabs, hover preview, screens loading one by one, stacking cards */
(function () {
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var G = window.gsap, ST = window.ScrollTrigger;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  $$('.selw .tabs').forEach(function (box) {
    var tabs = $$('[role="tab"]', box), ink = box.querySelector('.tab-ink');
    function place(t) { ink.style.left = t.offsetLeft + 'px'; ink.style.width = t.offsetWidth + 'px'; }
    function select(t, focus) {
      tabs.forEach(function (x) {
        var on = x === t;
        x.setAttribute('aria-selected', on ? 'true' : 'false');
        x.tabIndex = on ? 0 : -1;
        document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
      });
      place(t); if (focus) t.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault(); select(tabs[(i + d + tabs.length) % tabs.length], true);
      });
    });
    place(tabs[0]);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { place(box.querySelector('[aria-selected="true"]')); });
    addEventListener('resize', function () { place(box.querySelector('[aria-selected="true"]')); });
  });

  var peek = document.getElementById('peek');
  if (peek && finePointer) {
    var peekImg = peek.querySelector('img');
    var px = G ? G.quickTo(peek, 'x', { duration: 0.5, ease: 'power3' }) : null;
    var py = G ? G.quickTo(peek, 'y', { duration: 0.5, ease: 'power3' }) : null;
    $$('#index a').forEach(function (a) {
      a.addEventListener('pointerenter', function () { peekImg.src = a.getAttribute('data-img'); peek.classList.add('on'); });
      a.addEventListener('pointerleave', function () { peek.classList.remove('on'); });
      a.addEventListener('pointermove', function (e) {
        var x = e.clientX + 28, y = e.clientY - 120;
        if (px) { px(x); py(y); } else { peek.style.transform = 'translate(' + x + 'px,' + y + 'px)'; }
      });
    });
  }

  if (!G || !ST || reduce) return;
  G.from('#index li', { y: 40, opacity: 0, duration: 0.8, stagger: 0.05, ease: 'power3.out', scrollTrigger: { trigger: '#index', start: 'top 85%' } });
  $$('.selw .card').forEach(function (c) {
    G.from($$('.frame, .phone, .lens', c), {
      y: 120, rotate: function (k) { return (k % 2 ? 3 : -3); }, opacity: 0, duration: 1.1, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: c, start: 'top 75%' }
    });
  });
  G.matchMedia().add('(min-width: 901px) and (min-height: 561px)', function () {
    var cards = $$('.selw .card');
    cards.forEach(function (c, i) {
      if (i === cards.length - 1) return;
      G.fromTo(c, { scale: 1, filter: 'brightness(1)' }, {
        scale: 0.94, filter: 'brightness(0.62)', ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top top+=' + (parseInt(getComputedStyle(c).top, 10) || 84), scrub: true }
      });
    });
  });
  addEventListener('load', function () { ST.refresh(); });
})();
