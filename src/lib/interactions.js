/* ===== Curso José Ruiz — interactions v2 ===== */
(function () {
  var HOTMART = "https://calendar.app.google/HZovoNUeNE99NCHq6";

  /* --- wire all CTAs (botones amarillos) a la agenda --- */
  document.querySelectorAll('[data-cta]').forEach(function (el) {
    el.setAttribute('href', HOTMART);
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });

  /* --- botones de WhatsApp: abrir SIEMPRE en una pestaña real de nivel superior ---
     Dentro de un iframe/preview, wa.me redirige a api.whatsapp.com, que rechaza
     cargarse enmarcado (ERR_BLOCKED_BY_RESPONSE). window.open desde el gesto del
     usuario crea una pestaña fuera del iframe y evita ese bloqueo. */
  document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp.com"]').forEach(function (el) {
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
    el.addEventListener('click', function (e) {
      var url = el.getAttribute('href');
      if (!url) return;
      e.preventDefault();
      var w = window.open(url, '_blank', 'noopener');
      if (!w) { try { window.top.location.href = url; } catch (_) { location.href = url; } }
    });
  });

  /* --- evergreen countdown: 48h window, persisted --- */
  var KEY = 'cjr_deadline';
  var deadline = parseInt(localStorage.getItem(KEY) || '0', 10);
  var now = Date.now();
  if (!deadline || deadline < now) { deadline = now + 48 * 3600 * 1000; localStorage.setItem(KEY, String(deadline)); }
  var elH = document.querySelector('#countdown [data-h]');
  var elM = document.querySelector('#countdown [data-m]');
  var elS = document.querySelector('#countdown [data-s]');
  function pad(n){ return (n<10?'0':'')+n; }
  function tick(){
    var diff = Math.max(0, deadline - Date.now());
    if (elH) elH.textContent = pad(Math.floor(diff/3600000));
    if (elM) elM.textContent = pad(Math.floor((diff%3600000)/60000));
    if (elS) elS.textContent = pad(Math.floor((diff%60000)/1000));
  }
  tick(); setInterval(tick, 1000);

  /* --- header shadow on scroll --- */
  var head = document.getElementById('siteHead');
  function onHeadScroll(){ if (head) head.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onHeadScroll, { passive: true }); onHeadScroll();

  /* --- count-up for stats --- */
  function animateCount(el){
    var target = parseFloat(el.getAttribute('data-count'));
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;
    var dur = 1400, start = null;
    function frame(ts){
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * eased);
      var disp = val >= 1000 ? val.toLocaleString('es-MX') : String(val);
      el.innerHTML = prefix + disp + '<span class="u">' + suffix + '</span>';
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* --- reveal on scroll (rAF + getBoundingClientRect; robust everywhere) --- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealEls = [].slice.call(document.querySelectorAll('.reveal, .reveal-stagger, .fade-scale'));
  function showInView(){
    var vh = window.innerHeight || document.documentElement.clientHeight;
    for (var i = revealEls.length - 1; i >= 0; i--){
      var el = revealEls[i];
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.90 && r.bottom > 0){
        el.classList.add('in');
        el.querySelectorAll('[data-count]').forEach(animateCount);
        revealEls.splice(i, 1);
      }
    }
  }
  var ticking = false;
  function onScroll(){ if (ticking) return; ticking = true; requestAnimationFrame(function(){ showInView(); ticking = false; }); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  showInView();
  // safety net: never leave content hidden
  setTimeout(function(){
    document.querySelectorAll('.reveal, .reveal-stagger, .fade-scale').forEach(function(el){
      el.classList.add('in'); el.querySelectorAll('[data-count]').forEach(animateCount);
    });
  }, 2200);

  /* --- duplicate logos for seamless marquee --- */
  var mq = document.getElementById('logoMarquee');
  if (mq){ mq.innerHTML += mq.innerHTML; }

  /* --- testimonials carousel --- */
  (function(){
    var car = document.getElementById('tstCarousel'); if(!car) return;
    var track = document.getElementById('tstTrack');
    var vp = car.querySelector('.tst-viewport');
    var dotsWrap = document.getElementById('tstDots');
    var originals = [].slice.call(track.children);
    var N = originals.length;
    if (N === 0) return;
    var timer = null;

    /* clone a full set before and after so a centered card always has
       neighbours on both sides → no empty space at the edges, infinite loop */
    var base = 0, all = originals.slice();
    if (N > 1){
      var pre = document.createDocumentFragment();
      var post = document.createDocumentFragment();
      originals.forEach(function(s){ pre.appendChild(s.cloneNode(true)); post.appendChild(s.cloneNode(true)); });
      track.insertBefore(pre, track.firstChild);
      track.appendChild(post);
      all = [].slice.call(track.children); // 3N
      base = N;
    }
    var pos = base;

    /* dots: one per original */
    originals.forEach(function(s, n){
      var b = document.createElement('button');
      b.className = 'tst-dot'; b.type = 'button';
      b.setAttribute('aria-label', 'Testimonio ' + (n+1));
      b.addEventListener('click', function(){ goTo(base + n); restart(); });
      dotsWrap.appendChild(b);
    });
    var dots = [].slice.call(dotsWrap.children);

    function setActive(){
      var real = ((pos - base) % N + N) % N;
      all.forEach(function(s,i){ s.classList.toggle('is-active', i===pos); });
      dots.forEach(function(d,i){ d.classList.toggle('is-on', i===real); });
    }
    function place(withTrans){
      track.style.transition = withTrans ? '' : 'none';
      var a = all[pos];
      if (!a){ return; }
      var tx = vp.clientWidth/2 - (a.offsetLeft + a.offsetWidth/2);
      track.style.transform = 'translateX(' + tx + 'px)';
      setActive();
      if (!withTrans){ void track.offsetHeight; track.style.transition = ''; }
    }
    function goTo(p){ pos = p; place(true); }
    function step(dir){ goTo(pos + dir); }

    /* when we land on a cloned set, snap (no animation) back to the real one */
    track.addEventListener('transitionend', function(e){
      if (e.target !== track || e.propertyName !== 'transform') return;
      if (pos < base){ pos += N; place(false); }
      else if (pos >= base + N){ pos -= N; place(false); }
    });

    function restart(){ if (timer) clearInterval(timer); if (N > 1) timer = setInterval(function(){ step(1); }, 5200); }
    car.querySelectorAll('.tst-arrow').forEach(function(arr){
      arr.addEventListener('click', function(){ step(parseInt(arr.getAttribute('data-dir'),10)); restart(); });
    });
    car.addEventListener('mouseenter', function(){ if (timer) clearInterval(timer); });
    car.addEventListener('mouseleave', restart);
    var rt; window.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(function(){ place(false); }, 120); });
    place(false); restart();
    setTimeout(function(){ place(false); }, 400); // re-center after image-slots size
  })();

  /* --- FAQ accordion: single-open --- */
  document.querySelectorAll('.faq-list').forEach(function(list){
    var items = list.querySelectorAll('details.faq');
    items.forEach(function(d){
      d.addEventListener('toggle', function(){
        if (d.open) items.forEach(function(o){ if (o !== d) o.open = false; });
      });
    });
  });

  /* --- Vimeo: remaining time, tap-to-pause, progress bar --- */
  var remT = document.getElementById('vidRemainingT');
  var ifr = document.getElementById('vid-horizontal');
  if (ifr && window.Vimeo){
    var vp = new Vimeo.Player(ifr);
    var card = ifr.closest('.video-card');
    var bar = document.getElementById('vidProgress');
    var clickLayer = document.getElementById('videoClick');
    function fmt(s){ s = Math.max(0, Math.round(s)); var m = Math.floor(s/60); var sec = s%60; return m + ':' + (sec<10?'0':'') + sec; }
    var dur = 0, soundOn = false;
    if (card) card.classList.add('is-muted'); // arranca en silencio → muestra recuadro rojo
    vp.getDuration().then(function(d){ dur = d; if (remT) remT.textContent = fmt(d); }).catch(function(){});
    vp.on('timeupdate', function(data){
      if (data && typeof data.duration === 'number') dur = data.duration;
      var cur = data ? data.seconds : 0;
      if (remT) remT.textContent = fmt(dur - cur);
      if (bar && dur > 0){
        /* fast-then-slow curve to retain attention */
        var p = Math.min(1, cur / dur);
        bar.style.width = (Math.sqrt(p) * 100).toFixed(1) + '%';
      }
      /* cerca del reinicio por loop, re-asegurar que el sonido siga activo */
      if (soundOn && dur > 0 && (dur - cur) < 0.4){ vp.setMuted(false); vp.setVolume(1); }
    });
    vp.on('play',  function(){ if (card) card.classList.remove('is-paused'); if (soundOn){ vp.setMuted(false); vp.setVolume(1); } });
    vp.on('pause', function(){ if (card) card.classList.add('is-paused'); });
    /* el loop reinicia el video y puede re-silenciarlo → re-asegurar el sonido */
    vp.on('seeked', function(){ if (soundOn){ vp.setMuted(false); vp.setVolume(1); } });
    vp.on('bufferend', function(){ if (soundOn){ vp.setMuted(false); vp.setVolume(1); } });

    /* tap the screen: first tap enables sound (sin pausar), luego alterna play/pausa */
    function enableSound(){
      soundOn = true;
      if (card){ card.classList.remove('is-muted'); card.classList.remove('is-paused'); }
      /* Llamar play() y unmute DENTRO del mismo gesto del usuario, sin encadenar
         promesas: si play() se difiere tras setMuted(), el navegador pierde la
         activación del usuario y bloquea la reproducción con sonido (se pausa). */
      vp.play().catch(function(){});
      vp.setMuted(false).catch(function(){});
      vp.setVolume(1).catch(function(){});
    }
    if (clickLayer){
      clickLayer.addEventListener('click', function(){
        if (!soundOn){ enableSound(); return; } // no togglear play/pausa en el primer toque
        vp.getPaused().then(function(paused){ if (paused) vp.play(); else vp.pause(); });
      });
    }
    /* botón de volumen (abajo a la derecha): siempre activa el sonido a máximo */
    var volBtn = document.getElementById('videoVol');
    if (volBtn){
      volBtn.addEventListener('click', function(e){
        e.stopPropagation();
        if (!soundOn || (card && card.classList.contains('is-muted'))){
          enableSound();
        } else {
          soundOn = false;
          vp.setMuted(true);
          if (card) card.classList.add('is-muted');
        }
      });
    }
  }

  /* --- prueba social: notificaciones de compra (abajo-izquierda) --- */
  (function(){
    var host = document.getElementById('proofToast'); if(!host) return;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var people = [
      ['Erick','Culiacán'],['Mariana','Monterrey'],['José','Guadalajara'],['Daniela','CDMX'],
      ['Carlos','Tijuana'],['Fernanda','Hermosillo'],['Luis','Puebla'],['Andrea','Mérida'],
      ['Roberto','León'],['Paola','Querétaro'],['Miguel','Cancún'],['Sofía','Toluca'],
      ['Jorge','Chihuahua'],['Valeria','Aguascalientes'],['Diego','Morelia'],['Gabriela','Saltillo'],
      ['Ricardo','Veracruz'],['Karla','Mexicali'],['Alejandro','Torreón'],['Brenda','Durango']
    ];
    var colors = ['#2F6CD8','#1FA463','#E08A1F','#7C4DE0','#D6498A','#0EA5A5','#2456B8','#E0556B'];
    var agos = ['hace 8 minutos','hace 14 minutos','hace 32 minutos','hace 1 hora','hace 2 horas',
                'hace 4 horas','hace 7 horas','hace 1 día','hace 2 días','hace 3 días'];
    var check = '<span class="vchk"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.2 14.2-3.8-3.8 1.4-1.4 2.4 2.4 5-5 1.4 1.4z"/></svg></span>';

    // orden barajado para que no se repitan seguidos
    var order = people.map(function(_,i){return i;});
    for (var i = order.length - 1; i > 0; i--){ var j = Math.floor(Math.random()*(i+1)); var t = order[i]; order[i]=order[j]; order[j]=t; }
    var k = 0;

    function show(){
      var p = people[order[k % order.length]];
      var ago = agos[Math.floor(Math.random()*agos.length)];
      var color = colors[order[k % order.length] % colors.length];
      k++;
      var card = document.createElement('div');
      card.className = 'proof-card';
      card.innerHTML =
        '<div class="proof-av" style="background:' + color + '">' + p[0].charAt(0) + '</div>' +
        '<div class="proof-body">' +
          '<div class="proof-top"><span class="proof-name">' + p[0] + '</span><span class="proof-city">' + p[1] + '</span></div>' +
          '<div class="proof-msg">Se inscribió al curso</div>' +
          '<div class="proof-meta">' + ago + ' ' + check + '<b>Compra verificada</b></div>' +
        '</div>';
      host.innerHTML = '';
      host.appendChild(card);
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ card.classList.add('in'); }); });
      // se queda visible ~5s y luego sale
      setTimeout(function(){ card.classList.remove('in'); }, 5200);
      setTimeout(function(){ if (card.parentNode) card.parentNode.removeChild(card); }, 5800);
      // siguiente entre 9 y 15s
      setTimeout(show, 9000 + Math.random()*6000);
    }
    setTimeout(show, reduce ? 2500 : 4500);
  })();

  /* --- carrusel del ejemplo (9:16, una imagen a la vez) --- */
  (function(){
    var car = document.getElementById('ejCarousel'); if(!car) return;
    var track = document.getElementById('ejTrack');
    var dotsWrap = document.getElementById('ejDots');
    var slides = [].slice.call(track.children);
    var N = slides.length; if(!N) return;
    var idx = 0;
    /* numerar cada lámina como N/total en la esquina superior izquierda */
    slides.forEach(function(s,i){
      var num = s.querySelector('.ej-num');
      if (num) num.textContent = (i+1) + '/' + N;
    });
    function place(){
      track.style.transform = 'translateX(' + (-idx * 100) + '%)';
      [].slice.call(dotsWrap.children).forEach(function(d,i){ d.classList.toggle('is-on', i===idx); });
    }
    slides.forEach(function(_,i){
      var b = document.createElement('button'); b.type='button'; b.className='ej-dot';
      b.setAttribute('aria-label','Imagen '+(i+1));
      b.addEventListener('click', function(){ idx=i; place(); });
      dotsWrap.appendChild(b);
    });
    function step(dir){ idx = (idx + dir + N) % N; place(); }
    car.querySelectorAll('.ej-arrow').forEach(function(a){
      a.addEventListener('click', function(){ step(parseInt(a.getAttribute('data-dir'),10)); });
    });
    /* mini botón → ampliar la lámina en un lightbox con flechas (robusto en embeds) */
    var lb = document.getElementById('ejLightbox');
    if (!lb){
      lb = document.createElement('div');
      lb.id = 'ejLightbox';
      lb.className = 'ej-lightbox';
      lb.innerHTML = '<button class="ejl-close" type="button" aria-label="Cerrar">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
        '<button class="ejl-arrow ejl-prev" type="button" aria-label="Anterior"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>' +
        '<div class="ejl-stage"></div>' +
        '<button class="ejl-arrow ejl-next" type="button" aria-label="Siguiente"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button>';
      document.body.appendChild(lb);
    }
    var lbStage = lb.querySelector('.ejl-stage');
    var lbIndex = 0;
    function closeLB(){ lb.classList.remove('is-open'); lbStage.innerHTML=''; }
    function openLBAt(i){
      lbIndex = (i + N) % N;
      var slide = slides[lbIndex];
      var src = slide.querySelector('image-slot');
      if (!src) return;
      lb.classList.toggle('is-vertical', slide.classList.contains('ej-vertical'));
      var big = document.createElement('image-slot');
      ['id','shape','fit','position','placeholder','src'].forEach(function(a){
        if (src.hasAttribute(a)) big.setAttribute(a, src.getAttribute(a));
      });
      lbStage.innerHTML = '';
      lbStage.appendChild(big);
      idx = lbIndex; place(); // mantener sincronizado el carrusel detrás
      lb.classList.add('is-open');
    }
    function lbStep(dir){ openLBAt(lbIndex + dir); }
    lb.addEventListener('click', function(e){
      if (e.target.closest('.ejl-prev')){ lbStep(-1); return; }
      if (e.target.closest('.ejl-next')){ lbStep(1); return; }
      if (e.target === lb || e.target.closest('.ejl-close')) closeLB();
    });
    document.addEventListener('keydown', function(e){
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLB();
      else if (e.key === 'ArrowLeft') lbStep(-1);
      else if (e.key === 'ArrowRight') lbStep(1);
    });

    slides.forEach(function(slide, i){
      var btn = slide.querySelector('.ej-fs');
      if (btn) btn.addEventListener('click', function(e){ e.stopPropagation(); openLBAt(i); });
    });
    place();
  })();

  /* --- carrusel de casos (uno a la vez, flechas a los lados) --- */
  (function(){
    var car = document.getElementById('casosCarousel'); if(!car) return;
    var track = document.getElementById('casosTrack');
    var dotsWrap = document.getElementById('casosDots');
    var slides = [].slice.call(track.children);
    var N = slides.length; if(!N) return;
    var idx = 0;
    function place(){
      track.style.transform = 'translateX(' + (-idx * 100) + '%)';
      [].slice.call(dotsWrap.children).forEach(function(d,i){ d.classList.toggle('is-on', i===idx); });
    }
    slides.forEach(function(_,i){
      var b = document.createElement('button'); b.type='button'; b.className='casos-dot';
      b.setAttribute('aria-label','Caso '+(i+1));
      b.addEventListener('click', function(){ idx=i; place(); });
      dotsWrap.appendChild(b);
    });
    function step(dir){ idx = (idx + dir + N) % N; place(); }
    car.querySelectorAll('.casos-arrow').forEach(function(a){
      a.addEventListener('click', function(){ step(parseInt(a.getAttribute('data-dir'),10)); });
    });
    place();
  })();

  /* --- modal de casos: carrusel por marca --- */
  /* --- formatos de video: tabs + stage inline (estilo Reels/TikTok) --- */
  (function(){
    var stage = document.getElementById('fmtStage'); if(!stage) return;
    var dotsWrap = document.getElementById('fmtDots');
    var tabs = [].slice.call(document.querySelectorAll('.fmt-tab'));
    var groups = [].slice.call(stage.querySelectorAll('.caso-group'));
    var active = null, idx = 0;

    function slides(g){ return [].slice.call(g.children); }

    /* --- reproducción exclusiva: nunca dos videos a la vez --- */
    function allVideos(){ return [].slice.call(stage.querySelectorAll('video')); }
    function currentVideo(){
      if (!active) return null;
      var slide = slides(active)[idx];
      return slide ? slide.querySelector('video') : null;
    }
    function pauseAllVideos(){ allVideos().forEach(function(v){ v.pause(); }); }
    function playCurrentFromStart(){
      var v = currentVideo(); if (!v) return;
      pauseAllVideos();
      v.currentTime = 0;
      var p = v.play();
      if (p && p.catch) p.catch(function(){});
    }
    /* tap/click sobre el video: pausa/reanuda (sin controles nativos) */
    stage.addEventListener('click', function(e){
      var v = e.target.closest ? e.target.closest('video') : null;
      if (!v) return;
      if (v.paused) v.play(); else v.pause();
    });

    function place(){
      if(!active) return;
      active.style.transform = 'translateX(' + (-idx * 100) + '%)';
      [].slice.call(dotsWrap.children).forEach(function(d,i){ d.classList.toggle('is-on', i===idx); });
    }
    function buildDots(){
      dotsWrap.innerHTML = '';
      slides(active).forEach(function(_,i){
        var b = document.createElement('button'); b.type='button'; b.className='caso-dot';
        b.setAttribute('aria-label','Video '+(i+1));
        b.addEventListener('click', function(){ idx=i; place(); playCurrentFromStart(); });
        dotsWrap.appendChild(b);
      });
    }
    function show(id){
      pauseAllVideos();
      active = stage.querySelector('.caso-group[data-caso="'+id+'"]'); if(!active) return;
      groups.forEach(function(g){ g.style.display = (g===active) ? 'flex' : 'none'; });
      idx = 0; active.style.transition = 'none'; place();
      void active.offsetHeight; active.style.transition = '';
      buildDots();
      tabs.forEach(function(t){ t.classList.toggle('is-on', t.getAttribute('data-caso')===id); });
    }
    function step(dir){
      var n = slides(active).length; idx = (idx + dir + n) % n; place();
      playCurrentFromStart();
    }

    tabs.forEach(function(t){ t.addEventListener('click', function(){ show(t.getAttribute('data-caso')); }); });
    document.querySelectorAll('.fmt-prev,.fmt-next').forEach(function(a){
      a.addEventListener('click', function(){ step(parseInt(a.getAttribute('data-cdir'),10)); });
    });

    /* --- pantalla completa personalizada: 9:16 real, sin deformar, fondo negro --- */
    var phone = document.querySelector('.fmt-phone');
    var expandBtn = document.querySelector('.fmt-expand');
    if (expandBtn && phone) {
      var overlay = document.createElement('div');
      overlay.className = 'fmt-fullscreen-overlay';
      var closeBtn = document.createElement('button');
      closeBtn.type = 'button'; closeBtn.className = 'fmt-fs-close'; closeBtn.setAttribute('aria-label', 'Cerrar pantalla completa');
      closeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
      overlay.appendChild(closeBtn);
      document.body.appendChild(overlay);
      var phoneHome = phone.parentNode, phoneNext = phone.nextSibling;

      function openFS(){
        overlay.insertBefore(phone, closeBtn);
        phone.classList.add('is-fullscreen');
        overlay.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      }
      function closeFS(){
        if (phoneNext) phoneHome.insertBefore(phone, phoneNext); else phoneHome.appendChild(phone);
        phone.classList.remove('is-fullscreen');
        overlay.classList.remove('is-open');
        document.body.style.overflow = '';
      }
      expandBtn.addEventListener('click', openFS);
      closeBtn.addEventListener('click', closeFS);
      overlay.addEventListener('click', function(e){ if (e.target === overlay) closeFS(); });
      document.addEventListener('keydown', function(e){
        if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeFS();
      });
    }

    window.addEventListener('resize', place);
    show('6'); /* Generales por default */
  })();

  /* --- reseñas: carrusel manual (flechas + arrastrar) --- */
  (function(){
    var vp = document.getElementById('revViewport');
    if (!vp) return;
    var track = vp.querySelector('.rev-track');

    function cardStep(){
      var card = track && track.querySelector('.rev-card');
      if (!card) return 348;
      var gap = parseFloat(getComputedStyle(track).gap) || 18;
      return card.getBoundingClientRect().width + gap;
    }
    document.querySelectorAll('.rev-arrow').forEach(function(btn){
      btn.addEventListener('click', function(){
        var dir = parseInt(btn.getAttribute('data-rdir'), 10);
        vp.scrollBy({ left: dir * cardStep(), behavior: 'smooth' });
      });
    });

    /* arrastrar con el mouse */
    var down = false, startX = 0, startLeft = 0, moved = false;
    vp.addEventListener('pointerdown', function(e){
      down = true; moved = false; startX = e.clientX; startLeft = vp.scrollLeft;
      vp.classList.add('is-dragging');
    });
    vp.addEventListener('pointermove', function(e){
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      vp.scrollLeft = startLeft - dx;
    });
    function endDrag(){ down = false; vp.classList.remove('is-dragging'); }
    vp.addEventListener('pointerup', endDrag);
    vp.addEventListener('pointercancel', endDrag);
    vp.addEventListener('pointerleave', endDrag);
    /* evitar que un arrastre dispare clicks accidentales en las tarjetas */
    vp.addEventListener('click', function(e){ if (moved){ e.preventDefault(); e.stopPropagation(); } }, true);
  })();

  /* --- mobile menu --- */
  var mt = document.querySelector('.menu-toggle');
  if (mt) mt.addEventListener('click', function(){
    var t = document.getElementById('oferta'); if (t) t.scrollIntoView({ behavior: 'smooth' });
  });
})();
