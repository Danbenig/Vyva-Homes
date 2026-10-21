/**
 * VYVA HOMES - MASTER SCRIPTS (VERSÃO 1)
 * jQuery 3.7.1 + GSAP 3.12.5 Core + ScrollTrigger
 * Dominante: #000000, Detalhes: #E8590C, Tipografia: Syne + Raleway
 */

$(document).ready(function () {
  'use strict';

  // 1. INICIALIZAÇÃO DO LENIS SMOOTH SCROLL & SINCRONIZAÇÃO COM GSAP SCROLLTRIGGER
  let lenis;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 1.5,
      infinite: false,
    });

    window.__lenis = lenis;

    // Sincroniza o Lenis com o ScrollTrigger do GSAP
    lenis.on('scroll', () => {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.update();
      }
    });

    // Atualiza o Lenis no loop do GSAP Ticker para 60fps/120fps fluidos
    if (typeof gsap !== 'undefined') {
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    // Suporte a âncoras suaves com Lenis (ex: #hero, #destinos, #ecossistema, #reservas, etc.)
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (!targetId || targetId === '#') return;

        // Se for atalho direto para uma das abas do ecossistema (#vyva-decor, #by-vyva, #vyva-connect, #vyva-resort)
        const tabKey = targetId.replace('#', '');
        const matchingTab = document.querySelector(`.ecosystem-tab[data-tab="${tabKey}"]`);
        if (matchingTab) {
          e.preventDefault();
          const targetSection = document.getElementById('ecossistema') || document.getElementById('implantacao');
          if (targetSection) {
            lenis.scrollTo(targetSection, { offset: -20, duration: 1.2 });
          }
          matchingTab.click();
          return;
        }

        if (document.querySelector(targetId)) {
          e.preventDefault();
          lenis.scrollTo(targetId, { offset: 0, duration: 1.2 });
        }
      });
    });

    console.log('Lenis Smooth Scroll inicializado e integrado ao GSAP.');
  }

  // REGISTRO DO GSAP, SCROLLTRIGGER E DRAGGABLE
  if (typeof gsap !== 'undefined') {
    const plugins = [];
    if (typeof ScrollTrigger !== 'undefined') plugins.push(ScrollTrigger);
    if (typeof Observer !== 'undefined') plugins.push(Observer);
    if (typeof Draggable !== 'undefined') plugins.push(Draggable);
    if (plugins.length) gsap.registerPlugin(...plugins);
    console.log('GSAP plugins inicializados:', plugins.map(p => p.name || 'plugin').join(', '));
  }

  // 2. PRELOADER
  const $preloader = $('#preloader');
  if ($preloader.length) {
    setTimeout(function () {
      $preloader.addClass('is-hidden');
    }, 700);
  }

  // 3. NAVBAR STICKY, HIDE-ON-SCROLL-DOWN & REVEAL-ON-SCROLL-UP
  const $navbar = $('#mainNavbar');
  const $navToggle = $('#navToggle');
  const $navMenu = $('#navMenu');
  const $hero = $('#hero');

  let lastScrollTop = 0;
  const delta = 8;

  // Verifica se a seção #experiencia (ou seu pin-spacer) está ativa na tela
  function isNavbarBlockedBySection() {
    const expEl = document.getElementById('experiencia');
    if (!expEl) return false;

    const rect = expEl.getBoundingClientRect();
    if (rect.top <= 90 && rect.bottom > 80) {
      return true;
    }

    if (expEl.parentElement && expEl.parentElement.classList.contains('pin-spacer')) {
      const parentRect = expEl.parentElement.getBoundingClientRect();
      if (parentRect.top <= 90 && parentRect.bottom > 80) {
        return true;
      }
    }

    return false;
  }

  $(window).on('scroll', function () {
    const currentScroll = $(this).scrollTop();
    const heroThreshold = $hero.length ? ($hero.outerHeight() - 100) : 400;

    // Transparência total sob a hero (0% de opacidade de fundo);
    // Em outras seções do site: fundo preto sólido
    if (currentScroll > heroThreshold) {
      $navbar.addClass('is-scrolled');
    } else {
      $navbar.removeClass('is-scrolled');
    }

    // Na seção #experiencia, a navbar nunca deve aparecer (nem ao subir o scroll)
    if (isNavbarBlockedBySection()) {
      $navbar.addClass('is-hidden');
      $navMenu.removeClass('is-open');
      $navToggle.removeClass('is-active');
      lastScrollTop = currentScroll;
      return;
    }

    // Ignora micro-oscilações de scroll
    if (Math.abs(lastScrollTop - currentScroll) <= delta) {
      return;
    }

    // Ao descer: sobe e se esconde (.is-hidden)
    // Ao subir: desce e reaparece
    if (currentScroll > lastScrollTop && currentScroll > 120) {
      $navbar.addClass('is-hidden');
    } else {
      $navbar.removeClass('is-hidden');
    }

    lastScrollTop = currentScroll;
  });

  // Mobile Menu Toggle
  $navToggle.on('click', function (e) {
    e.stopPropagation();
    $navMenu.toggleClass('is-open');
    $(this).toggleClass('is-active');
  });

  $(document).on('click', function (e) {
    if (!$(e.target).closest('#mainNavbar').length) {
      $navMenu.removeClass('is-open');
      $navToggle.removeClass('is-active');
    }
  });

  // Fecha o menu mobile automaticamente ao clicar em qualquer link de navegação
  $navMenu.find('a').on('click', function () {
    $navMenu.removeClass('is-open');
    $navToggle.removeClass('is-active');
  });

  // 4. TYPEWRITER EFFECT NA HERO (Baseado no modelo de referência)
  const phrases = [
    "Muito além da hospedagem.",
    "Conectamos hospitalidade e tecnologia.",
    "Transformamos estadias em experiências."
  ];

  let phraseIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  const $typewriterTarget = $('#typewriter-text');

  function runTypewriter() {
    if (!$typewriterTarget.length) return;

    const currentPhrase = phrases[phraseIdx];
    let speed = isDeleting ? 40 : 80;

    if (!isDeleting) {
      $typewriterTarget.text(currentPhrase.substring(0, charIdx + 1));
      charIdx++;
      if (charIdx === currentPhrase.length) {
        speed = 2200; // pausa ao terminar a frase
        isDeleting = true;
      }
    } else {
      $typewriterTarget.text(currentPhrase.substring(0, charIdx - 1));
      charIdx--;
      if (charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        speed = 400; // pausa antes de iniciar a próxima
      }
    }

    setTimeout(runTypewriter, speed);
  }
  runTypewriter();

  // 5. VIDEO AUTOPLAY SAFEGUARDS
  const heroVideo = document.getElementById('heroVideo');
  if (heroVideo) {
    heroVideo.muted = true;
    heroVideo.setAttribute('muted', '');
    heroVideo.setAttribute('playsinline', '');
    const playPromise = heroVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(function () {
        $(document).one('click scroll touchstart', function () {
          heroVideo.play();
        });
      });
    }
  }

  // 6. MOTOR DE RESERVAS (HANDOFF PARA PORTAL STAYS)
  $('#bookingForm').on('submit', function (e) {
    e.preventDefault();
    const destination = $('#bookingDest').val() || 'sao-paulo';
    const checkin = $('#bookingCheckin').val() || '';
    const checkout = $('#bookingCheckout').val() || '';
    const guests = $('#bookingGuests').val() || '1';

    // Rota direta de handoff
    const targetUrl = `https://stays.net/vyvahomes?dest=${encodeURIComponent(destination)}&checkin=${encodeURIComponent(checkin)}&checkout=${encodeURIComponent(checkout)}&guests=${encodeURIComponent(guests)}`;
    window.open(targetUrl, '_blank');
  });

  // 7. ANIMAÇÕES GSAP SCROLLTRIGGER (REVEALS SUAVES)
  if (typeof gsap !== 'undefined') {
    // Reveal de títulos de seções
    gsap.utils.toArray('.section-header, .about-intro').forEach(function (header) {
      gsap.from(header, {
        scrollTrigger: {
          trigger: header,
          start: 'top 85%',
        },
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
      });
    });

    // Reveal dos 4 cards principais
    gsap.utils.toArray('.card-pillar').forEach(function (card, index) {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
        },
        y: 45,
        opacity: 0,
        duration: 0.8,
        delay: index * 0.12,
        ease: 'power3.out',
      });
    });

    // Reveal dos cards de experiência
    gsap.utils.toArray('.experience-card').forEach(function (card, index) {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 90%',
        },
        y: 35,
        opacity: 0,
        duration: 0.7,
        delay: (index % 4) * 0.08,
        ease: 'power2.out',
      });
    });

    // =========================================================================
    // 12. SEÇÃO DESTINOS - GSAP 3D SEAMLESS INFINITE CARD SLIDER
    // Fiel à mecânica de carrossel infinito 3D (os cards somem nas laterais)
    // Sem scroll interaction, apenas drag suave com mouse/touch e botões de ação
    // =========================================================================
    function initDestinosInfiniteSlider() {
      const section = document.querySelector('#destinos');
      const cardsList = document.querySelector('.destinos-cards-list, .reels-cards-list');
      if (!section || !cardsList) return;

      const cards = gsap.utils.toArray('.destinos-cards-list li, .reels-cards-list li');
      if (!cards.length) return;

      // Estado inicial dos cards fora da visão
      gsap.set(cards, { xPercent: 400, opacity: 0, scale: 0 });

      const spacing = 0.1;
      const snapTime = gsap.utils.snap(spacing);

      // Animação 3D contínua de cada card (escala, profundidade e deslocamento horizontal)
      const animateFunc = element => {
        const tl = gsap.timeline();
        tl.fromTo(element, 
          { scale: 0, opacity: 0 }, 
          { scale: 1, opacity: 1, zIndex: 100, duration: 0.5, yoyo: true, repeat: 1, ease: 'power1.in', immediateRender: false }
        ).fromTo(element, 
          { xPercent: 400 }, 
          { xPercent: -400, duration: 1, ease: 'none', immediateRender: false }, 
          0
        );
        return tl;
      };

      const seamlessLoop = buildSeamlessLoop(cards, spacing, animateFunc);
      const playhead = { offset: 0 };
      const wrapTime = gsap.utils.wrap(0, seamlessLoop.duration());

      // Marca o card que está exatamente no centro
      function updateActiveCenterCard() {
        let closestCard = null;
        let minDistance = Infinity;

        cards.forEach(card => {
          const xPct = Math.abs(parseFloat(gsap.getProperty(card, 'xPercent')) || 0);
          if (xPct < minDistance) {
            minDistance = xPct;
            closestCard = card;
          }
        });

        cards.forEach(card => {
          if (card === closestCard && minDistance < 50) {
            card.classList.add('is-center', 'lighting-border', 'lighting-move-border');
          } else {
            card.classList.remove('is-center', 'lighting-border', 'lighting-move-border');
          }
        });
      }

      const scrub = gsap.to(playhead, {
        offset: 0,
        onUpdate() {
          seamlessLoop.time(wrapTime(playhead.offset));
          updateActiveCenterCard();
        },
        duration: 0.6,
        ease: 'power3.out',
        paused: true
      });

      // Inicializa posicionado no 1º card
      playhead.offset = 0;
      seamlessLoop.time(wrapTime(0));
      updateActiveCenterCard();

      // Botões Próximo e Anterior
      const nextBtns = document.querySelectorAll('.destinos-btn-next, .reels-btn-next, .destinos-nav-btn--next, .next');
      const prevBtns = document.querySelectorAll('.destinos-btn-prev, .reels-btn-prev, .destinos-nav-btn--prev, .prev');

      nextBtns.forEach(btn => {
        btn.addEventListener('click', e => {
          e.preventDefault();
          scrub.vars.offset = snapTime(scrub.vars.offset + spacing);
          scrub.invalidate().restart();
        });
      });

      prevBtns.forEach(btn => {
        btn.addEventListener('click', e => {
          e.preventDefault();
          scrub.vars.offset = snapTime(scrub.vars.offset - spacing);
          scrub.invalidate().restart();
        });
      });

      // Controle de clique e arrasto (drag)
      let wasDragging = false;
      let dragStartX = 0;

      cards.forEach((card, index) => {
        card.addEventListener('click', () => {
          if (wasDragging) return;

          // Desliza suavemente até centralizá-lo
          const currentWrapped = wrapTime(playhead.offset);
          const cardTargetTime = (index * spacing) % seamlessLoop.duration();
          let diff = cardTargetTime - currentWrapped;
          if (diff > seamlessLoop.duration() / 2) diff -= seamlessLoop.duration();
          if (diff < -seamlessLoop.duration() / 2) diff += seamlessLoop.duration();
          scrub.vars.offset = snapTime(scrub.vars.offset + diff);
          scrub.invalidate().restart();
        });
      });

      // GSAP Draggable (desktop e touch no mobile)
      if (typeof Draggable !== 'undefined') {
        Draggable.create('.drag-proxy, .destinos-drag-proxy', {
          type: 'x',
          trigger: '.destinos-gallery-container, .reels-gallery-container, .destinos-cards-list',
          onPress() {
            wasDragging = false;
            dragStartX = this.x;
            this.startOffset = scrub.vars.offset;
          },
          onDrag() {
            if (Math.abs(this.x - dragStartX) > 6) {
              wasDragging = true;
            }
            scrub.vars.offset = this.startOffset + (this.startX - this.x) * 0.0012;
            scrub.invalidate().restart();
          },
          onDragEnd() {
            scrub.vars.offset = snapTime(scrub.vars.offset);
            scrub.invalidate().restart();
            setTimeout(() => { wasDragging = false; }, 80);
          }
        });
      }

      // Construtor do Seamless Loop GreenSock
      function buildSeamlessLoop(items, spacing, animateFunc) {
        const overlap = Math.ceil(1 / spacing);
        const startTime = items.length * spacing + 0.5;
        const loopTime = (items.length + overlap) * spacing + 1;
        const rawSequence = gsap.timeline({ paused: true });
        const seamless = gsap.timeline({
          paused: true,
          repeat: -1,
          onRepeat() {
            this._time === this._dur && (this._tTime += this._dur - 0.01);
          }
        });
        const l = items.length + overlap * 2;

        for (let i = 0; i < l; i++) {
          const index = i % items.length;
          const time = i * spacing;
          rawSequence.add(animateFunc(items[index]), time);
        }

        rawSequence.time(startTime);
        seamless.to(rawSequence, {
          time: loopTime,
          duration: loopTime - startTime,
          ease: 'none'
        }).fromTo(rawSequence, { time: overlap * spacing + 1 }, {
          time: startTime,
          duration: startTime - (overlap * spacing + 1),
          immediateRender: false,
          ease: 'none'
        });

        return seamless;
      }
    }

    // Inicialização do slider de destinos
    initDestinosInfiniteSlider();

    // =========================================================================
    // 13. SEÇÃO EXPERIÊNCIA - GSAP SWIPE SLIDER (8 PILARES)
    // Fiel à demo https://demos.gsap.com/demo/swipe-slider/ (Brian Cross)
    // Mecânica de Sliding Panels / Counter-Sliding (.outer + .inner)
    // =========================================================================
    function initSwipeSlider() {
      const section = document.querySelector('.section-swipe-slider');
      if (!section) return;

      const slides = gsap.utils.toArray('.section-swipe-slider .swipe-slide');
      const outerWrappers = gsap.utils.toArray('.section-swipe-slider .swipe-slide__outer');
      const innerWrappers = gsap.utils.toArray('.section-swipe-slider .swipe-slide__inner');
      const bgs = gsap.utils.toArray('.section-swipe-slider .swipe-slide__bg');
      const titles = gsap.utils.toArray('.section-swipe-slider .swipe-slide__title');
      const subtitles = gsap.utils.toArray('.section-swipe-slider .swipe-slide__subtitle');
      const dots = gsap.utils.toArray('.section-swipe-slider .swipe-dot');
      const currentCounters = document.querySelectorAll('.swipe-counter__current');
      const nextBtn = document.querySelector('.swipe-btn--next');
      const prevBtn = document.querySelector('.swipe-btn--prev');

      if (!slides.length) return;

      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP ou ScrollTrigger não carregados para o swipe slider.');
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      let currentActiveIndex = 0;

      // MOBILE: sem scroll effect (sem pin/scrub). Navegação somente por botões e arrasto lateral.
      const isMobile = window.matchMedia('(max-width: 768px)').matches;

      // Estado inicial dos slides (empilhados com zIndex crescente)
      slides.forEach((slide, i) => {
        gsap.set(slide, { zIndex: i + 1, autoAlpha: 1 });
        if (i === 0) {
          gsap.set(outerWrappers[i], { yPercent: 0 });
          gsap.set(innerWrappers[i], { yPercent: 0 });
          gsap.set(bgs[i], { yPercent: 0, scale: 1 });
          gsap.set(titles[i], { y: 0, opacity: 1 });
          gsap.set(subtitles[i], { y: 0, opacity: 1 });
        } else {
          gsap.set(outerWrappers[i], { yPercent: 100 });
          gsap.set(innerWrappers[i], { yPercent: -100 });
          gsap.set(bgs[i], { yPercent: 15, scale: 1.14 });
          gsap.set(titles[i], { y: 40, opacity: 0 });
          gsap.set(subtitles[i], { y: 25, opacity: 0 });
        }
      });

      // Master Timeline vinculada ao Scroll (usando fromTo imutável para blindar contra refresh)
      const masterTL = gsap.timeline({
        defaults: { ease: 'none' },
        paused: isMobile
      });

      const slideRestTimes = [0];
      const transMidTimes = [0];

      // Pausa inicial sutil com o Slide 0 (STAY) colado no topo da tela
      masterTL.to({}, { duration: 0.3 });

      for (let i = 1; i < slides.length; i++) {
        const startTime = masterTL.duration();
        transMidTimes[i] = startTime + 0.5;

        masterTL
          // Slide entrando: painéis persiana counter-sliding (.outer + .inner)
          .fromTo(
            outerWrappers[i],
            { yPercent: 100 },
            { yPercent: 0, duration: 1, ease: 'power2.inOut', immediateRender: false },
            startTime
          )
          .fromTo(
            innerWrappers[i],
            { yPercent: -100 },
            { yPercent: 0, duration: 1, ease: 'power2.inOut', immediateRender: false },
            startTime
          )
          .fromTo(
            bgs[i],
            { yPercent: 15, scale: 1.14 },
            { yPercent: 0, scale: 1, duration: 1, ease: 'power2.out', immediateRender: false },
            startTime
          )
          // Slide saindo: profundidade parallax e fade da tipografia
          .fromTo(
            bgs[i - 1],
            { yPercent: 0, scale: 1 },
            { yPercent: -15, scale: 1.06, duration: 1, ease: 'power2.inOut', immediateRender: false },
            startTime
          )
          .fromTo(
            titles[i - 1],
            { y: 0, opacity: 1 },
            { y: -35, opacity: 0, duration: 0.45, ease: 'power2.in', immediateRender: false },
            startTime
          )
          .fromTo(
            subtitles[i - 1],
            { y: 0, opacity: 1 },
            { y: -20, opacity: 0, duration: 0.4, ease: 'power2.in', immediateRender: false },
            startTime + 0.05
          )
          // Revelação de tipografia do slide que entra
          .fromTo(
            titles[i],
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.55, ease: 'power2.out', immediateRender: false },
            startTime + 0.42
          )
          .fromTo(
            subtitles[i],
            { y: 25, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', immediateRender: false },
            startTime + 0.48
          );

        // Platô de leitura para cada slide após sua entrada completa
        const holdDuration = i === slides.length - 1 ? 0.45 : 0.35;
        masterTL.to({}, { duration: holdDuration }, startTime + 1);
        slideRestTimes[i] = startTime + 1 + holdDuration * 0.5;
      }

      // Atualiza pill/contador ativos conforme o tempo atual da timeline
      function applyActiveFromTime(currentTime) {
        let activeIdx = 0;
        for (let i = 1; i < slides.length; i++) {
          if (currentTime >= transMidTimes[i]) {
            activeIdx = i;
          } else {
            break;
          }
        }
        if (activeIdx !== currentActiveIndex) {
          currentActiveIndex = activeIdx;
          dots.forEach((dot, idx) => {
            dot.classList.toggle('is-active', idx === activeIdx);
          });
          if (currentCounters && currentCounters.length) {
            const formattedCounter = String(activeIdx + 1).padStart(2, '0');
            currentCounters.forEach(counter => {
              counter.textContent = formattedCounter;
            });
          }
        }
      }

      // Distância de rolagem do travamento (pin) na tela
      const getTotalScroll = () => (slides.length - 1) * Math.max(600, Math.round(window.innerHeight * 0.72));

      // DESKTOP: ScrollTrigger oficial com PIN e SCRUB (refreshPriority: 10 para calcular na ordem do DOM antes de #galeria-turismo)
      let swipeST = null;
      if (!isMobile) {
        swipeST = ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: () => '+=' + getTotalScroll(),
          pin: true,
          pinSpacing: true,
          anticipatePin: 0,
          refreshPriority: 10,
          animation: masterTL,
          scrub: 0.65,
          invalidateOnRefresh: false,
          onToggle: (self) => {
            if (self.isActive) {
              $('#mainNavbar').addClass('is-hidden');
            }
          },
          onUpdate: (self) => {
            if (self.isActive) {
              $('#mainNavbar').addClass('is-hidden');
            }
            applyActiveFromTime(self.progress * masterTL.duration());
          }
        });
      }

      // MOBILE: transição programática (sem scroll) até o platô do slide alvo
      let mobileTargetIndex = 0;
      let mobileNavTween = null;
      function goToSlideMobile(targetIdx) {
        targetIdx = Math.max(0, Math.min(slides.length - 1, targetIdx));
        if (targetIdx === mobileTargetIndex) return;
        mobileTargetIndex = targetIdx;
        if (mobileNavTween) mobileNavTween.kill();
        mobileNavTween = gsap.to(masterTL, {
          time: slideRestTimes[targetIdx],
          duration: 0.85,
          ease: 'power2.inOut',
          overwrite: true,
          onUpdate: () => applyActiveFromTime(masterTL.time()),
          onComplete: () => {
            applyActiveFromTime(masterTL.time());
            mobileNavTween = null;
          }
        });
      }

      // Navegação programática suave até o platô de um slide
      function scrollToSlide(targetIdx) {
        if (isMobile) {
          goToSlideMobile(targetIdx);
          return;
        }
        targetIdx = Math.max(0, Math.min(slides.length - 1, targetIdx));
        const totalDur = masterTL.duration();
        const targetProgress = totalDur > 0 ? slideRestTimes[targetIdx] / totalDur : 0;
        const targetY = swipeST.start + targetProgress * (swipeST.end - swipeST.start);

        if (window.__lenis) {
          window.__lenis.scrollTo(targetY, {
            duration: 0.9,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
          });
        } else {
          window.scrollTo({ top: targetY, behavior: 'smooth' });
        }
      }

      // Índice de referência para próximo/anterior (mobile usa o alvo da animação em curso)
      const getBaseIndex = () => (isMobile ? mobileTargetIndex : currentActiveIndex);

      // Controles por Botões Anterior e Próximo
      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          scrollToSlide(getBaseIndex() + 1);
        });
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
          e.preventDefault();
          scrollToSlide(getBaseIndex() - 1);
        });
      }

      // Controles pelas Pills de Navegação Superior
      dots.forEach((dot, i) => {
        dot.addEventListener('click', (e) => {
          e.preventDefault();
          scrollToSlide(i);
        });
      });

      // Suporte a arrasto horizontal (mouse/touch) sem interferir no scroll vertical
      if (typeof Observer !== 'undefined' || (typeof ScrollTrigger !== 'undefined' && ScrollTrigger.observe)) {
        const obs = typeof Observer !== 'undefined' ? Observer : ScrollTrigger;
        let lastSwipeAt = 0;
        const swipeGuard = (fn) => () => {
          const now = Date.now();
          if (now - lastSwipeAt < 450) return;
          lastSwipeAt = now;
          fn();
        };
        obs.create({
          target: section,
          ignore: '.swipe-slider-nav-wrap, .swipe-bottom-controls',
          type: isMobile ? 'touch,pointer' : 'pointer',
          tolerance: isMobile ? 40 : 45,
          preventDefault: false,
          onLeft: swipeGuard(() => scrollToSlide(getBaseIndex() + 1)),
          onRight: swipeGuard(() => scrollToSlide(getBaseIndex() - 1))
        });
      }

      // Navegação por teclado ao estar na seção
      window.addEventListener('keydown', (e) => {
        const rect = section.getBoundingClientRect();
        const isInViewport = rect.top <= 10 && rect.bottom >= window.innerHeight - 10;
        if (!isInViewport) return;

        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          scrollToSlide(getBaseIndex() + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          scrollToSlide(getBaseIndex() - 1);
        }
      });

      // Recálculo ordenado do ScrollTrigger após carregamento de imagens (apenas desktop: mobile não usa pin)
      function refreshSwipeSlider() {
        if (isMobile) return;
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      }

      const imagesToWatch = section.querySelectorAll('.swipe-slide__bg');
      imagesToWatch.forEach((bg) => {
        const bgUrl = bg.style.backgroundImage.slice(4, -1).replace(/"/g, '');
        if (bgUrl) {
          const img = new Image();
          img.src = bgUrl;
          if (!img.complete) {
            img.addEventListener('load', refreshSwipeSlider, { once: true });
          }
        }
      });

      window.addEventListener('load', refreshSwipeSlider);
      window.addEventListener('resize', refreshSwipeSlider);
      setTimeout(refreshSwipeSlider, 450);
      setTimeout(refreshSwipeSlider, 1400);
    }

    // Expõe o inicializador para ser executado na ordem exata do DOM (após #galeria-turismo)
    window.__initSwipeSlider = initSwipeSlider;

    // Contador dinâmico dos Proof Points
    $('.metric-item__num').each(function () {
      const $this = $(this);
      const rawText = $this.text().trim();
      const numMatch = rawText.match(/\d+/);

      if (numMatch) {
        const targetVal = parseInt(numMatch[0], 10);
        const prefix = rawText.split(numMatch[0])[0];
        const suffix = rawText.split(numMatch[0])[1];

        ScrollTrigger.create({
          trigger: this,
          start: 'top 90%',
          once: true,
          onEnter: function () {
            let countObj = { val: 0 };
            gsap.to(countObj, {
              val: targetVal,
              duration: 2,
              ease: 'power2.out',
              onUpdate: function () {
                $this.text(prefix + Math.floor(countObj.val).toLocaleString('pt-BR') + suffix);
              }
            });
          }
        });
      }
    });

    // 7.1 SEÇÃO STATISTICS - ODOMETER EFFECT NOS NÚMEROS (ROLETAS DE DÍGITOS)
    (function initOdometer() {
      const statsSection = document.querySelector('#estatisticas');
      if (!statsSection) return;

      const odometers = statsSection.querySelectorAll('.odometer');
      if (!odometers.length) return;

      // Constrói as roletas de dígitos para cada odômetro
      odometers.forEach((el) => {
        const targetStr = el.getAttribute('data-value') || el.textContent.trim();
        const chars = targetStr.split('');
        el.innerHTML = ''; // Limpa o fallback estático

        chars.forEach((char) => {
          if (/\d/.test(char)) {
            const targetDigit = parseInt(char, 10);
            const digitSlot = document.createElement('span');
            digitSlot.className = 'odometer-digit';

            const ribbon = document.createElement('span');
            ribbon.className = 'odometer-ribbon';

            // Constrói 2 voltas completas de 0 a 9 mais o trajeto até o dígito final
            const sequence = [];
            for (let cycle = 0; cycle < 2; cycle++) {
              for (let d = 0; d <= 9; d++) sequence.push(d);
            }
            for (let d = 0; d <= targetDigit; d++) {
              sequence.push(d);
            }

            sequence.forEach((d) => {
              const numSpan = document.createElement('span');
              numSpan.textContent = d;
              ribbon.appendChild(numSpan);
            });

            const targetIndex = sequence.length - 1;
            ribbon.dataset.targetIndex = targetIndex;
            ribbon.dataset.total = sequence.length;

            digitSlot.appendChild(ribbon);
            el.appendChild(digitSlot);
          } else {
            const charSpan = document.createElement('span');
            charSpan.textContent = char;
            el.appendChild(charSpan);
          }
        });
      });

      // Disparo sincronizado com GSAP ScrollTrigger ao entrar na tela
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.create({
          trigger: statsSection,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            // Entrada suave dos cards de estatísticas
            gsap.from(statsSection.querySelectorAll('.stat-card'), {
              y: 28,
              opacity: 0,
              duration: 0.85,
              stagger: 0.14,
              ease: 'power3.out'
            });

            const ribbons = statsSection.querySelectorAll('.odometer-ribbon');
            ribbons.forEach((ribbon, idx) => {
              const targetIndex = parseInt(ribbon.dataset.targetIndex, 10);
              const total = parseInt(ribbon.dataset.total, 10);
              if (!total) return;

              const targetPercent = -(targetIndex / total) * 100;

              gsap.to(ribbon, {
                yPercent: targetPercent,
                duration: 2.2 + idx * 0.12,
                ease: 'power3.out',
                delay: 0.1 + idx * 0.06
              });
            });
          }
        });
      }
    })();
  }

  // 8. ROLLING BUTTONS HOVER REFINEMENT (Apenas em dispositivos com mouse/hover fino)
  if (window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $('.btn-roll').on('mouseenter', function () {
      // Efeito garantido pelo CSS var(--ease-roll)
    });
  }

  // 9. DOT MATRIX WARP BACKGROUND (CANVAS INTERATIVO NO DESKTOP / ESTÁTICO E LEVE NO MOBILE)
  (function initDotMatrix() {
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height;
    let dots = [];
    let animId = null;

    // --- CONFIGURAÇÕES DA MATRIZ ---
    const SPACING = 24;          // Espaçamento entre cada ponto (em px)
    const DOT_RADIUS = 1.1;      // Tamanho reduzido em ~50% (pontos finos e nítidos)
    const MAX_DIST = 140;        // Raio de influência da distorção

    const mouse = {
      x: -1000,
      y: -1000
    };

    const isMobileMode = () => window.matchMedia('(max-width: 768px)').matches;

    function initDots() {
      dots = [];
      for (let x = SPACING / 2; x < width; x += SPACING) {
        for (let y = SPACING / 2; y < height; y += SPACING) {
          dots.push({ x, y });
        }
      }
    }

    // Desenha o pontilhado estático uma única vez no mobile (0% CPU/GPU contínua)
    function drawStaticDots() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        ctx.moveTo(dot.x + DOT_RADIUS, dot.y);
        ctx.arc(dot.x, dot.y, DOT_RADIUS, 0, Math.PI * 2);
      }
      ctx.fill();
    }

    function resize() {
      const mobile = isMobileMode();
      const dpr = mobile ? 1 : (window.devicePixelRatio || 1);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      initDots();

      if (mobile) {
        if (animId) {
          cancelAnimationFrame(animId);
          animId = null;
        }
        drawStaticDots();
      } else {
        if (!animId) {
          animId = requestAnimationFrame(animate);
        }
      }
    }

    // Rastreamento do mouse (desabilitado no mobile para economizar processamento)
    window.addEventListener('mousemove', (e) => {
      if (isMobileMode()) return;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    // Loop de renderização contínuo (ativo exclusivamente no desktop)
    function animate() {
      if (isMobileMode()) {
        drawStaticDots();
        animId = null;
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        let px = dot.x;
        let py = dot.y;

        const dx = dot.x - mouse.x;
        const dy = dot.y - mouse.y;
        const dist = Math.hypot(dx, dy);

        let color = 'rgba(255, 255, 255, 0.1)'; // Base: #FFFFFF com 10% de opacidade

        if (dist < MAX_DIST) {
          const factor = 1 - dist / MAX_DIST;
          const force = factor * 22;

          if (dist > 0) {
            px += (dx / dist) * force;
            py += (dy / dist) * force;
          }

          // Transição gradual para laranja (rgba(255, 140, 0, 0.5))
          const r = 255;
          const g = Math.round(255 - 115 * factor); // 255 -> 140
          const b = Math.round(255 - 255 * factor); // 255 -> 0
          const alpha = (0.1 + 0.4 * factor).toFixed(2); // 0.10 -> 0.50

          color = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }

        // Desenha o ponto
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(px, py, DOT_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', () => setTimeout(resize, 100));

    resize();
  })();

  // 10. CIRCUITO INTELIGENTE - EMISSÃO DE FÓTONS DE LUZ DO CHIP PARA OS CARDS
  (function initCircuitSystem() {
    const board = document.getElementById('circuitBoard');
    const canvas = document.getElementById('circuitCanvas');
    const chip = document.getElementById('circuitChip');
    if (!board || !canvas || !chip) return;

    const ctx = canvas.getContext('2d');

    // 6 Cards
    const cards = [
      document.getElementById('circuit-card-1'),
      document.getElementById('circuit-card-2'),
      document.getElementById('circuit-card-3'),
      document.getElementById('circuit-card-4'),
      document.getElementById('circuit-card-5'),
      document.getElementById('circuit-card-6'),
    ];

    // 6 SVG Path lines
    const lines = [
      document.getElementById('circuit-line-1'),
      document.getElementById('circuit-line-2'),
      document.getElementById('circuit-line-3'),
      document.getElementById('circuit-line-4'),
      document.getElementById('circuit-line-5'),
      document.getElementById('circuit-line-6'),
    ];

    // 6 SVG Pins
    const pins = [
      document.getElementById('circuit-pin-1'),
      document.getElementById('circuit-pin-2'),
      document.getElementById('circuit-pin-3'),
      document.getElementById('circuit-pin-4'),
      document.getElementById('circuit-pin-5'),
      document.getElementById('circuit-pin-6'),
    ];

    let pathLengths = [0, 0, 0, 0, 0, 0];
    let pathPoints = [[], [], [], [], [], []];
    const POINT_STEP = 2; // px entre amostras pré-calculadas (evita getPointAtLength por frame)
    let dpr = 1;
    let width = 0;
    let height = 0;

    // MOBILE: versão leve (sem halos radiais/blend aditivo, 1 fóton por trilha, 30fps, DPR 1)
    const isLiteMode = window.matchMedia('(max-width: 768px)').matches;

    // Fótons: 2 fótons por caminho no desktop (desfasados em 0.5); 1 por caminho no mobile
    const photons = [];
    for (let pathIdx = 0; pathIdx < 6; pathIdx++) {
      photons.push({
        pathIdx: pathIdx,
        progress: isLiteMode ? pathIdx * 0.13 : 0.0,
        speed: 0.007,
        size: 3.2,
      });
      if (!isLiteMode) {
        photons.push({
          pathIdx: pathIdx,
          progress: 0.5,
          speed: 0.007,
          size: 3.2,
        });
      }
    }

    function updateGeometry() {
      const bRect = board.getBoundingClientRect();
      dpr = isLiteMode ? 1 : (window.devicePixelRatio || 1);
      width = bRect.width;
      height = bRect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cRect = chip.getBoundingClientRect();
      const cL = cRect.left - bRect.left;
      const cR = cRect.right - bRect.left;
      const cT = cRect.top - bRect.top;
      const cB = cRect.bottom - bRect.top;
      const cX = (cL + cR) / 2;
      const cY = (cT + cB) / 2;

      // Pontos laterais do chip (superior e inferior em cada lado)
      const yLeftUpper = cT + cRect.height * 0.32;
      const yLeftLower = cT + cRect.height * 0.68;
      const yRightUpper = cT + cRect.height * 0.32;
      const yRightLower = cT + cRect.height * 0.68;

      // Targets dos 6 cards
      // Card 1: Top Left -> conecta na base do card
      const r1 = cards[0].getBoundingClientRect();
      const x1 = r1.left - bRect.left + r1.width / 2;
      const y1 = r1.bottom - bRect.top;

      // Card 2: Top Center -> conecta na base do card
      const r2 = cards[1].getBoundingClientRect();
      const x2 = r2.left - bRect.left + r2.width / 2;
      const y2 = r2.bottom - bRect.top;

      // Card 3: Top Right -> conecta na base do card
      const r3 = cards[2].getBoundingClientRect();
      const x3 = r3.left - bRect.left + r3.width / 2;
      const y3 = r3.bottom - bRect.top;

      // Card 4: Bottom Left -> conecta no topo do card
      const r4 = cards[3].getBoundingClientRect();
      const x4 = r4.left - bRect.left + r4.width / 2;
      const y4 = r4.top - bRect.top;

      // Card 5: Bottom Center -> conecta no topo do card
      const r5 = cards[4].getBoundingClientRect();
      const x5 = r5.left - bRect.left + r5.width / 2;
      const y5 = r5.top - bRect.top;

      // Card 6: Bottom Right -> conecta no topo do card
      const r6 = cards[5].getBoundingClientRect();
      const x6 = r6.left - bRect.left + r6.width / 2;
      const y6 = r6.top - bRect.top;

      // Geometria das 6 trilhas (L-shapes com esquinas em 90 graus e retas perfeitas)
      // Path 1 (Top Left): Chip lateral esquerdo alto -> horizontal até x1 -> vertical sobe até y1
      const d1 = `M ${cL} ${yLeftUpper} L ${x1} ${yLeftUpper} L ${x1} ${y1}`;
      // Path 2 (Top Center): Chip topo centro -> vertical sobe até y2
      const d2 = `M ${cX} ${cT} L ${x2} ${y2}`;
      // Path 3 (Top Right): Chip lateral direito alto -> horizontal até x3 -> vertical sobe até y3
      const d3 = `M ${cR} ${yRightUpper} L ${x3} ${yRightUpper} L ${x3} ${y3}`;
      // Path 4 (Bottom Left): Chip lateral esquerdo baixo -> horizontal até x4 -> vertical desce até y4
      const d4 = `M ${cL} ${yLeftLower} L ${x4} ${yLeftLower} L ${x4} ${y4}`;
      // Path 5 (Bottom Center): Chip base centro -> vertical desce até y5
      const d5 = `M ${cX} ${cB} L ${x5} ${y5}`;
      // Path 6 (Bottom Right): Chip lateral direito baixo -> horizontal até x6 -> vertical desce até y6
      const d6 = `M ${cR} ${yRightLower} L ${x6} ${yRightLower} L ${x6} ${y6}`;

      const pathData = [d1, d2, d3, d4, d5, d6];
      for (let i = 0; i < 6; i++) {
        lines[i].setAttribute('d', pathData[i]);
        pathLengths[i] = lines[i].getTotalLength() || 1;

        // Pré-amostra a trilha uma única vez (a cada atualização de geometria)
        const pts = [];
        for (let dist = 0; dist <= pathLengths[i] + POINT_STEP; dist += POINT_STEP) {
          const pt = lines[i].getPointAtLength(Math.min(dist, pathLengths[i]));
          pts.push({ x: pt.x, y: pt.y });
        }
        pathPoints[i] = pts;
      }

      // Pinos de conexão (Triângulos direcionais nas saídas do chip)
      const pinP1 = `${cL},${yLeftUpper - 4} ${cL},${yLeftUpper + 4} ${cL - 7},${yLeftUpper}`;
      const pinP2 = `${cX - 4},${cT} ${cX + 4},${cT} ${cX},${cT - 7}`;
      const pinP3 = `${cR},${yRightUpper - 4} ${cR},${yRightUpper + 4} ${cR + 7},${yRightUpper}`;
      const pinP4 = `${cL},${yLeftLower - 4} ${cL},${yLeftLower + 4} ${cL - 7},${yLeftLower}`;
      const pinP5 = `${cX - 4},${cB} ${cX + 4},${cB} ${cX},${cB + 7}`;
      const pinP6 = `${cR},${yRightLower - 4} ${cR},${yRightLower + 4} ${cR + 7},${yRightLower}`;

      const pinData = [pinP1, pinP2, pinP3, pinP4, pinP5, pinP6];
      for (let i = 0; i < 6; i++) {
        pins[i].setAttribute('points', pinData[i]);
      }
    }

    // Retorna o ponto pré-amostrado da trilha na distância informada (sem getPointAtLength por frame)
    function pointAt(pathIdx, dist) {
      const pts = pathPoints[pathIdx];
      if (!pts.length) return null;
      const idx = Math.max(0, Math.min(pts.length - 1, Math.floor(dist / POINT_STEP)));
      return pts[idx];
    }

    // Efeito de impacto luminoso no card de destino (desabilitado no modo leve/mobile)
    function pulseCard(pathIdx) {
      if (isLiteMode) return;
      const targetCard = cards[pathIdx];
      targetCard.classList.add('is-receiving');
      setTimeout(() => targetCard.classList.remove('is-receiving'), 280);
    }

    let rafId = null;
    let running = false;
    let lastTs = 0;

    // Loop de Animação de Fótons no Canvas
    function animate(ts) {
      if (!running) return;
      rafId = requestAnimationFrame(animate);

      // Mobile: limita a ~30fps e usa passo temporal proporcional
      let step = 1;
      if (isLiteMode) {
        const elapsed = ts - lastTs;
        if (elapsed < 32) return;
        step = Math.min(3, elapsed / 16.667);
        lastTs = ts;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < photons.length; i++) {
        const p = photons[i];
        p.progress += p.speed * step;
        if (p.progress >= 1) {
          p.progress = 0;
          pulseCard(p.pathIdx);
        }

        const totalLen = pathLengths[p.pathIdx];
        if (!totalLen) continue;

        const currentDist = p.progress * totalLen;
        const head = pointAt(p.pathIdx, currentDist);
        if (!head) continue;

        if (isLiteMode) {
          // Versão leve: apenas o ponto de luz (sem rastro/cauda), halo plano + núcleo
          ctx.fillStyle = 'rgba(232, 89, 12, 0.35)';
          ctx.beginPath();
          ctx.arc(head.x, head.y, 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.beginPath();
          ctx.arc(head.x, head.y, 2.2, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }

        // Cauda do fóton suavizada (5 pontos interpolados na trilha)
        const t1 = pointAt(p.pathIdx, Math.max(0, currentDist - 12));
        const t2 = pointAt(p.pathIdx, Math.max(0, currentDist - 25));
        const t3 = pointAt(p.pathIdx, Math.max(0, currentDist - 40));
        const t4 = pointAt(p.pathIdx, Math.max(0, currentDist - 58));

        // Blending aditivo (luz óptica difusa suave)
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        // 1. Desenho da cauda luminosa com gradiente suave em tons de laranja e branco
        const grad = ctx.createLinearGradient(t4.x, t4.y, head.x, head.y);
        grad.addColorStop(0, 'rgba(232, 89, 12, 0)');
        grad.addColorStop(0.35, 'rgba(232, 89, 12, 0.20)');
        grad.addColorStop(0.68, 'rgba(255, 140, 50, 0.50)');
        grad.addColorStop(0.90, 'rgba(255, 200, 120, 0.80)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(t4.x, t4.y);
        ctx.lineTo(t3.x, t3.y);
        ctx.lineTo(t2.x, t2.y);
        ctx.lineTo(t1.x, t1.y);
        ctx.lineTo(head.x, head.y);
        ctx.stroke();

        // 2. Halo difuso suave ao redor do fóton (luz ambiente)
        const radial = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 20);
        radial.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
        radial.addColorStop(0.18, 'rgba(255, 190, 80, 0.45)');
        radial.addColorStop(0.48, 'rgba(232, 89, 12, 0.18)');
        radial.addColorStop(0.78, 'rgba(232, 89, 12, 0.05)');
        radial.addColorStop(1, 'rgba(232, 89, 12, 0)');

        ctx.fillStyle = radial;
        ctx.beginPath();
        ctx.arc(head.x, head.y, 20, 0, Math.PI * 2);
        ctx.fill();

        // 3. Núcleo incandescente suave em branco puro
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.arc(head.x, head.y, 1.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    function startLoop() {
      if (running) return;
      running = true;
      lastTs = performance.now();
      rafId = requestAnimationFrame(animate);
    }

    function stopLoop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }

    // Inicialização e Reatividade
    updateGeometry();

    // Mobile: o resize dispara a cada recolhimento da barra de endereço; só recalcula se a LARGURA mudar
    let lastWinW = window.innerWidth;
    window.addEventListener('resize', () => {
      if (isLiteMode && window.innerWidth === lastWinW) return;
      lastWinW = window.innerWidth;
      updateGeometry();
    });
    window.addEventListener('orientationchange', () => setTimeout(updateGeometry, 150));
    window.addEventListener('load', updateGeometry);

    // Só anima enquanto o circuito está visível na tela e a aba está ativa (economiza CPU/GPU/bateria)
    let boardVisible = true;
    if ('IntersectionObserver' in window) {
      boardVisible = false;
      const io = new IntersectionObserver((entries) => {
        boardVisible = entries[0].isIntersecting;
        if (boardVisible && !document.hidden) startLoop(); else stopLoop();
      }, { rootMargin: '80px 0px' });
      io.observe(board);
    } else {
      startLoop();
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopLoop();
      else if (boardVisible) startLoop();
    });

    // Exporta função para atualização dinâmica de geometria dos circuitos
    window.__updateCircuitGeometry = updateGeometry;

    // Atualização de segurança após carregamento de fontes e estilos
    setTimeout(updateGeometry, 200);
    setTimeout(updateGeometry, 800);
    setTimeout(updateGeometry, 1500);
  })();

  // 11. ECOSSISTEMA - INTERAÇÃO DA SEQUÊNCIA DE ABAS & TROCA DINÂMICA DE TEXTOS DOS CARDS
  (function initEcosystemTabs() {
    const tabs = document.querySelectorAll('.ecosystem-tab');
    if (!tabs.length) return;

    // Função para extrair os 6 itens da respectiva categoria
    function getPillarItems(targetId) {
      const defaultMap = {
        'vyva-decor': [
          'Operação & Performance',
          'Mobiliário & Marcenaria',
          'Eletros & Tecnologia',
          'Enxoval & Amenities',
          'Implantação & Montagem',
          'Padronização & Realizes'
        ],
        'by-vyva': [
          'Mercado & Demanda',
          'Conceito & Posicionamento',
          'Produto & Amenidades',
          'Operação & Condomínio',
          'Serviços & Experiências',
          'Tecnologia & Jornada'
        ],
        'vyva-connect': [
          'App & Jornada Digital',
          'Concierge 24/7',
          'Serviços sob Demanda',
          'Mobilidade & Transfers',
          'Experiências & Agenda Local',
          'Gastronomia & Conveniência'
        ],
        'vyva-resort': [
          'Wellness & Lifestyle',
          'Hospitalidade & Short Stay',
          'Gastronomia & Conveniência',
          'Mobilidade & Experiências',
          'Tecnologia & integração',
          'Operação & Performance'
        ]
      };

      return defaultMap[targetId] || [];
    }

    const cardTitleSelectors = [
      '#circuit-card-1 .circuit-card__title',
      '#circuit-card-2 .circuit-card__title',
      '#circuit-card-3 .circuit-card__title',
      '#circuit-card-4 .circuit-card__title',
      '#circuit-card-5 .circuit-card__title',
      '#circuit-card-6 .circuit-card__title'
    ];

    const circuitCards = [
      document.getElementById('circuit-card-1'),
      document.getElementById('circuit-card-2'),
      document.getElementById('circuit-card-3'),
      document.getElementById('circuit-card-4'),
      document.getElementById('circuit-card-5'),
      document.getElementById('circuit-card-6')
    ];

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        if (tab.classList.contains('is-active')) return;

        // 1. Atualizar estado visual das abas
        tabs.forEach(t => {
          t.classList.remove('is-active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('is-active');
        tab.setAttribute('aria-selected', 'true');

        // 2. Extrair dados dos 6 itens da respectiva categoria na seção solucoes
        const tabTarget = tab.getAttribute('data-tab');
        const newItems = getPillarItems(tabTarget);
        if (!newItems || newItems.length < 6) return;

        // 3. Atualizar textos dos 6 cards com transição suave e pulso luminoso
        cardTitleSelectors.forEach((selector, idx) => {
          const titleEl = document.querySelector(selector);
          if (!titleEl) return;

          titleEl.style.opacity = '0';
          titleEl.style.transform = 'translateY(-6px)';

          setTimeout(() => {
            titleEl.textContent = newItems[idx];
            titleEl.style.opacity = '1';
            titleEl.style.transform = 'translateY(0)';

            // Realce luminoso de recebimento de energia
            if (circuitCards[idx]) {
              circuitCards[idx].classList.add('is-receiving');
              setTimeout(() => {
                circuitCards[idx].classList.remove('is-receiving');
              }, 320);
            }

            // Recalcula geometria de conexão SVG
            if (idx === cardTitleSelectors.length - 1 && window.__updateCircuitGeometry) {
              window.__updateCircuitGeometry();
              setTimeout(window.__updateCircuitGeometry, 100);
            }
          }, 160 + idx * 25);
        });
      });
    });
  })();

  /* ==========================================================================
     12. FOTOS LOCAIS - MOSAICO COM PARALLAX NA IMAGEM INTERNA (20%: -10% A +10%)
     - Card externo fixo no grid do mosaico
     - Imagem interna (.card-img-wrapper) move de -10% a +10% no sentido contrário ao scroll
     ========================================================================== */
  (function initEditorialParallax() {
    const $boxes = $('.card-inner-box');
    if (!$boxes.length) return;

    const $window = $(window);
    let windowHeight = $window.height();

    $window.on('resize', function() {
      windowHeight = $window.height();
    });

    function updateCardScrollParallax() {
      $boxes.each(function() {
        const $box = $(this);
        const $imgWrapper = $box.find('.card-img-wrapper');

        const rect = this.getBoundingClientRect();
        const boxHeight = rect.height;
        const boxTop = rect.top;

        // Executa apenas quando o card está no campo de visão
        if (boxTop + boxHeight > 0 && boxTop < windowHeight) {
          // Progresso de 0.0 (entrou por baixo) até 1.0 (saiu por cima)
          const progress = (windowHeight - boxTop) / (windowHeight + boxHeight);

          // Fator centralizado de -1.0 a +1.0 (0.0 = centro da viewport)
          const factor = (progress - 0.5) * 2;

          // Move a imagem de dentro de -10% (cima) até +10% (baixo) — 20% de amplitude
          // no sentido contrário ao deslocamento do card durante o scroll
          const innerY = (factor * 10).toFixed(2);
          $imgWrapper.css('transform', `translate3d(0, ${innerY}%, 0)`);
        }
      });
    }

    // Loop ultra-suave com requestAnimationFrame
    let isScrolling = false;
    $window.on('scroll', function() {
      if (!isScrolling) {
        window.requestAnimationFrame(function() {
          updateCardScrollParallax();
          isScrolling = false;
        });
        isScrolling = true;
      }
    });

    // Inicialização imediata
    updateCardScrollParallax();
  })();

  /* =========================================================================
     10. MENU FIXO DE CONTATO RADIAL (FAB GSAP)
     ========================================================================= */
  function initRadialMenu() {
    const radialWrap = document.querySelector("#radialWrap");
    const fabBtn = document.querySelector("#fabBtn");
    if (!radialWrap || !fabBtn) return;

    const items = gsap.utils.toArray(".fab-item");
    const pulseRing = document.querySelector("#pulseRing");
    const iconChat = document.querySelector(".icon-chat");
    const iconClose = document.querySelector(".icon-close");

    const radius = 125;         // Distância da ejeção (em pixels)
    const startAngle = 180;     // Começa na esquerda (180°)
    const endAngle = 270;       // Termina no topo (270° - quadrante superior esquerdo)
    const angleStep = items.length > 1 ? (endAngle - startAngle) / (items.length - 1) : 0;

    let tl;
    let isOpen = false;

    function buildTimeline() {
      // Estado inicial oculto no centro
      gsap.set(items, { x: 0, y: 0, scale: 0, opacity: 0, rotation: -35 });

      tl = gsap.timeline({ paused: true });

      // 1. Pausa o anel pulsante quando aberto
      if (pulseRing) {
        tl.to(pulseRing, { opacity: 0, scale: 0.8, duration: 0.2 }, 0);
      }

      // 2. Transição do ícone de Chat -> X
      if (iconChat) {
        tl.to(iconChat, {
          scale: 0.2,
          rotation: -90,
          opacity: 0,
          duration: 0.3,
          ease: "power2.inOut"
        }, 0);
      }

      if (iconClose) {
        tl.to(iconClose, {
          scale: 1,
          rotation: 0,
          opacity: 1,
          duration: 0.45,
          ease: "back.out(2)"
        }, 0.1);
      }

      // 3. Ejeção dos botões em arco com mola elástica (elastic.out)
      items.forEach((item, i) => {
        const rad = (startAngle + angleStep * i) * (Math.PI / 180);
        const tx = Math.cos(rad) * radius;
        const ty = Math.sin(rad) * radius;

        tl.to(item, {
          x: tx,
          y: ty,
          scale: 1,
          opacity: 1,
          rotation: 0,
          pointerEvents: "auto",
          duration: 0.65,
          ease: "elastic.out(1, 0.5)",
          easeReverse: "power3.in"
        }, i * 0.055);
      });
    }

    buildTimeline();

    // Abrir / Fechar
    function toggleMenu() {
      if (isOpen) {
        tl.timeScale(1.75).reverse(); // Fecha rápido
        fabBtn.setAttribute("aria-expanded", "false");
      } else {
        tl.timeScale(1).play();       // Abre no tempo elástico natural
        fabBtn.setAttribute("aria-expanded", "true");
      }
      isOpen = !isOpen;
    }

    fabBtn.addEventListener("click", toggleMenu);

    // Micro-interação de hover nos itens
    items.forEach((item) => {
      item.addEventListener("mouseenter", () => {
        if (!isOpen) return;
        gsap.to(item, { scale: 1.18, duration: 0.3, ease: "back.out(2)" });
      });
      item.addEventListener("mouseleave", () => {
        if (!isOpen) return;
        gsap.to(item, { scale: 1, duration: 0.25, ease: "power2.out" });
      });
    });

    // Fechar com a tecla ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen) toggleMenu();
    });

    // Fechar ao clicar fora
    document.addEventListener("click", (e) => {
      if (isOpen && !radialWrap.contains(e.target)) {
        toggleMenu();
      }
    });
  }

  // Inicializa o Menu Radial
  initRadialMenu();

  /* =========================================================================
     11. CARROSSEL GSAP HORIZONTAL SCROLLING GALLERY (#galeria-turismo)
     Fiel à demo oficial GSAP (Horizontal scrolling gallery com ScrollTrigger).
     Ao atingir a seção, ela fixa (pin) e o scroll vertical da página faz os
     cards rolarem suavemente na horizontal de 1 a 5 (scrub: 1).
     Ao terminar o último card, o scroll continua descendo naturalmente.
     100% blindado com ScrollTrigger.refresh() e dimensões seguras.
     ========================================================================= */
  function initHorizontalGallery() {
    const gallerySection = document.querySelector("#galeria-turismo");
    if (!gallerySection) return;

    const strip = gallerySection.querySelector(".horiz-gallery-strip");
    const progressBar = gallerySection.querySelector(".horiz-gallery__progress-bar");
    const prevBtn = gallerySection.querySelector(".horiz-nav-btn--prev");
    const nextBtn = gallerySection.querySelector(".horiz-nav-btn--next");
    if (!strip) return;

    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      console.warn("GSAP ou ScrollTrigger não carregados para o carrossel horizontal.");
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Evita arrasto nativo fantasma de imagens
    strip.querySelectorAll("img").forEach((img) => img.setAttribute("draggable", "false"));

    // MOBILE: sem scroll effect (sem pin/scrub). A fita rola apenas arrastando para os lados
    // (scroll horizontal nativo com snap) ou pelas setas.
    if (window.matchMedia("(max-width: 768px)").matches) {
      const scroller = gallerySection.querySelector(".horiz-gallery-wrapper");
      if (!scroller) return;

      const getMaxScroll = () => Math.max(1, scroller.scrollWidth - scroller.clientWidth);
      const getStep = () => {
        const firstCard = strip.querySelector(".horiz-card");
        return firstCard ? firstCard.offsetWidth + 19 : 280;
      };

      let ticking = false;
      scroller.addEventListener("scroll", () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          if (progressBar) {
            const ratio = Math.max(0.18, Math.min(1, scroller.scrollLeft / getMaxScroll()));
            progressBar.style.transform = "scaleX(" + ratio + ")";
          }
          ticking = false;
        });
      }, { passive: true });

      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          scroller.scrollBy({ left: -getStep(), behavior: "smooth" });
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          scroller.scrollBy({ left: getStep(), behavior: "smooth" });
        });
      }
      return;
    }

    // Distância exata da rolagem horizontal da fita
    const getScrollDistance = () => {
      return Math.max(0, strip.scrollWidth - window.innerWidth + 80);
    };

    // Tween horizontal GSAP
    const horizTween = gsap.to(strip, {
      x: () => -getScrollDistance(),
      ease: "none"
    });

    // ScrollTrigger com Pin + Scrub oficial GSAP (refreshPriority: 9 para calcular após #experiencia)
    const galleryST = ScrollTrigger.create({
      trigger: gallerySection,
      start: "top top",
      end: () => "+=" + (getScrollDistance() + 250),
      pin: true,
      pinSpacing: true,
      anticipatePin: 0,
      refreshPriority: 9,
      animation: horizTween,
      scrub: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (progressBar) {
          const ratio = Math.max(0.18, Math.min(1, self.progress));
          gsap.to(progressBar, {
            scaleX: ratio,
            duration: 0.1,
            ease: "none",
            overwrite: "auto"
          });
        }
      }
    });

    // Navegação pelas setas: sincroniza com o progresso do ScrollTrigger
    const getCardWidth = () => {
      const firstCard = strip.querySelector(".horiz-card");
      return firstCard ? firstCard.offsetWidth + 32 : 380;
    };

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        const totalDist = getScrollDistance();
        if (totalDist <= 0) return;
        const step = (getCardWidth() / totalDist);
        const targetProgress = Math.max(0, galleryST.progress - step);
        const targetY = galleryST.start + targetProgress * (galleryST.end - galleryST.start);
        if (window.__lenis) {
          window.__lenis.scrollTo(targetY, { duration: 0.8 });
        } else {
          window.scrollTo({ top: targetY, behavior: "smooth" });
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        const totalDist = getScrollDistance();
        if (totalDist <= 0) return;
        const step = (getCardWidth() / totalDist);
        const targetProgress = Math.min(1, galleryST.progress + step);
        const targetY = galleryST.start + targetProgress * (galleryST.end - galleryST.start);
        if (window.__lenis) {
          window.__lenis.scrollTo(targetY, { duration: 0.8 });
        } else {
          window.scrollTo({ top: targetY, behavior: "smooth" });
        }
      });
    }

    // Recalcula o ScrollTrigger após o carregamento completo de imagens e fontes
    function refreshGallery() {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    }

    const imagesToWatch = document.querySelectorAll("#Fotos-locais img, #galeria-turismo img");
    imagesToWatch.forEach((img) => {
      if (!img.complete) {
        img.addEventListener("load", refreshGallery, { once: true });
      }
    });

    window.addEventListener("load", refreshGallery);
    window.addEventListener("resize", refreshGallery);
    setTimeout(refreshGallery, 300);
    setTimeout(refreshGallery, 1200);
  }

  // Inicializa as seções fixas (pinned) na exata ordem de aparição no DOM:
  // 1º: #experiencia (refreshPriority: 10)
  // 2º: #galeria-turismo (refreshPriority: 9)
  if (typeof window.__initSwipeSlider === "function") {
    window.__initSwipeSlider();
  }
  initHorizontalGallery();
  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  }

  /* =========================================================================
     12. MODAL DE VÍDEO INSTITUCIONAL COM OVERLAY DE BACKGROUND BLUR
     Suporta múltiplos vídeos (#sobre Reels 9:16 e #video-institucional 16:9).
     Ao clicar no card ou botão de play, abre centralizado na tela com
     videoModalBackdrop (background blur) e reproduz nativamente.
     ========================================================================= */
  (function initVideoShowcaseModal() {
    const triggers = document.querySelectorAll(".video-modal-trigger, #videoShowcaseTrigger");
    const overlay = document.getElementById("videoModalOverlay");
    const dialog = overlay ? overlay.querySelector(".video-modal-dialog") : null;
    const backdrop = document.getElementById("videoModalBackdrop");
    const closeBtn = document.getElementById("videoModalClose");
    const frameWrap = document.getElementById("videoModalFrameWrap");

    if (!triggers.length || !overlay || !frameWrap) return;

    function openVideoModal(triggerEl, e) {
      if (e) e.preventDefault();
      const videoSrc = triggerEl.getAttribute("data-video-src") || "images/video-vyva.mp4";
      const videoPoster = triggerEl.getAttribute("data-video-poster") || "";
      const videoAspect = triggerEl.getAttribute("data-video-aspect") || "horizontal";

      if (dialog) {
        dialog.classList.toggle("is-vertical", videoAspect === "vertical");
      }

      frameWrap.innerHTML = `<video
        src="${videoSrc}"
        ${videoPoster ? `poster="${videoPoster}"` : ""}
        controls
        autoplay
        playsinline
      ></video>`;

      const videoEl = frameWrap.querySelector("video");
      if (videoEl) {
        videoEl.play().catch(() => {});
      }

      overlay.classList.add("is-active");
      overlay.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      if (window.__lenis && typeof window.__lenis.stop === "function") {
        window.__lenis.stop();
      }
    }

    function closeVideoModal() {
      if (!overlay.classList.contains("is-active")) return;
      const videoEl = frameWrap.querySelector("video");
      if (videoEl) {
        videoEl.pause();
      }
      overlay.classList.remove("is-active");
      overlay.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (window.__lenis && typeof window.__lenis.start === "function") {
        window.__lenis.start();
      }
      setTimeout(() => {
        if (!overlay.classList.contains("is-active")) {
          frameWrap.innerHTML = "";
        }
      }, 350);
    }

    triggers.forEach((triggerEl) => {
      triggerEl.addEventListener("click", (e) => openVideoModal(triggerEl, e));
      triggerEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          openVideoModal(triggerEl, e);
        }
      });
    });

    if (closeBtn) closeBtn.addEventListener("click", closeVideoModal);
    if (backdrop) backdrop.addEventListener("click", closeVideoModal);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.classList.contains("is-active")) {
        closeVideoModal();
      }
    });
  })();

  // =========================================================================
  // 15. SEÇÃO B2B (SOLUÇÕES CORPORATE) - ATIVAÇÃO DE LIGHTING BORDER AO POUSAR NA TELA (APENAS MOBILE)
  // No mobile, ativa as animações de hover nos cards .b2b-col.lighting-move-border-hover
  // quando a seção específica dele pousa no viewport.
  // No desktop, a iluminação e rotação de borda permanecem ativadas estritamente com :hover do mouse.
  // =========================================================================
  (function initB2BInView() {
    const b2bSection = document.querySelector("#corporate") || document.querySelector(".section-b2b");
    if (!b2bSection) return;

    const b2bCards = b2bSection.querySelectorAll(".b2b-col");
    const isMobile = () => window.matchMedia("(max-width: 768px)").matches;

    function setB2BActive(active) {
      // No desktop nunca ativa classes inview/active (permanece estritamente no hover com mouse)
      if (!isMobile()) {
        b2bSection.classList.remove("is-inview");
        b2bCards.forEach((c) => c.classList.remove("is-inview", "is-active"));
        return;
      }
      if (active) {
        b2bSection.classList.add("is-inview");
        b2bCards.forEach((c) => c.classList.add("is-inview", "is-active"));
      } else {
        b2bSection.classList.remove("is-inview");
        b2bCards.forEach((c) => c.classList.remove("is-inview", "is-active"));
      }
    }

    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.create({
        trigger: b2bSection,
        start: "top 85%",
        end: "bottom 15%",
        onEnter: () => {
          if (isMobile()) setB2BActive(true);
        },
        onLeave: () => setB2BActive(false),
        onEnterBack: () => {
          if (isMobile()) setB2BActive(true);
        },
        onLeaveBack: () => setB2BActive(false),
      });

      // Também registra cada card individualmente para telas mobile menores
      b2bCards.forEach((card) => {
        ScrollTrigger.create({
          trigger: card,
          start: "top 92%",
          end: "bottom 8%",
          onEnter: () => {
            if (isMobile()) card.classList.add("is-inview", "is-active");
          },
          onLeave: () => {
            if (!b2bSection.classList.contains("is-inview") || !isMobile()) {
              card.classList.remove("is-inview", "is-active");
            }
          },
          onEnterBack: () => {
            if (isMobile()) card.classList.add("is-inview", "is-active");
          },
          onLeaveBack: () => {
            if (!b2bSection.classList.contains("is-inview") || !isMobile()) {
              card.classList.remove("is-inview", "is-active");
            }
          },
        });
      });
    } else if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!isMobile()) {
              setB2BActive(false);
              return;
            }
            if (entry.target === b2bSection) {
              setB2BActive(entry.isIntersecting);
            } else if (entry.isIntersecting) {
              entry.target.classList.add("is-inview", "is-active");
            } else if (!b2bSection.classList.contains("is-inview")) {
              entry.target.classList.remove("is-inview", "is-active");
            }
          });
        },
        { rootMargin: "-5% 0px -5% 0px", threshold: 0.1 }
      );

      observer.observe(b2bSection);
      b2bCards.forEach((c) => observer.observe(c));
    }
  })();

  // Ao cruzar o breakpoint mobile/desktop (ex.: rotação ou redimensionar janela),
  // recarrega para reinicializar as seções com o modo correto (scroll effect x arrastar).
  (function watchMobileBreakpoint() {
    const mq = window.matchMedia("(max-width: 768px)");
    let wasMobile = mq.matches;
    let timer = null;
    const onChange = () => {
      if (mq.matches === wasMobile) return;
      clearTimeout(timer);
      timer = setTimeout(() => window.location.reload(), 250);
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  })();
});




