(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------
     Parallax sutil do texto do hero: sobe mais devagar que o
     vídeo enquanto a pessoa rola, e some com fade antes de sair
     da tela. Nada acontece se o usuário pedir menos animação.
  ------------------------------------------------------------ */
  var heroContent = document.querySelector('.hero__content');
  var hero = document.querySelector('.hero');

  if (heroContent && hero && !prefersReducedMotion) {
    var ticking = false;

    function updateParallax() {
      var heroHeight = hero.offsetHeight;
      var scrollY = window.scrollY;
      var progress = Math.min(Math.max(scrollY / heroHeight, 0), 1);

      // texto sobe a ~35% da velocidade do scroll e esmaece
      var translateY = progress * -60;
      var opacity = 1 - progress * 1.4;

      heroContent.style.transform = 'translateY(' + translateY + 'px)';
      heroContent.style.opacity = Math.max(opacity, 0);

      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });

    updateParallax();
  }

  var connection = navigator.connection || navigator.webkitConnection || navigator.mozConnection;
  var saveData = connection && connection.saveData;
  var slowConnection = connection && /^(slow-2g|2g|3g)$/.test(connection.effectiveType || '');
  var isSmallScreen = window.matchMedia('(max-width: 768px)').matches;

  // Carrega o <source> de um <video preload="none" data-src="..."> só quando
  // vale a pena (sem economia de dados, sem conexão ruim), e só toca quando
  // o elemento está visível na tela — pausa quando sai, retoma quando volta.
  function lazyLoadVideo(video, options) {
    if (!video || prefersReducedMotion || saveData || slowConnection) return;
    if (options && options.skipOnSmallScreen && isSmallScreen) return;

    function start() {
      if (video.querySelector('source')) return;
      var source = document.createElement('source');
      source.src = video.dataset.src;
      source.type = 'video/mp4';
      video.appendChild(source);
      video.load();
    }

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            start();
            video.play().catch(function () {});
          } else {
            video.pause();
          }
        });
      }, { threshold: 0.15 });

      observer.observe(video);
    } else {
      start();
      video.play().catch(function () {});
    }
  }

  /* ------------------------------------------------------------
     Vídeo de fundo do hero: pesado e decorativo, então não baixa
     em telas pequenas — fica só o poster.
  ------------------------------------------------------------ */
  lazyLoadVideo(document.querySelector('.hero__video'), { skipOnSmallScreen: true });

  /* ------------------------------------------------------------
     Previews dos projetos: arquivos bem menores, então tocam em
     qualquer tela, carregando só quando o card entra na viewport.
  ------------------------------------------------------------ */
  document.querySelectorAll('.project__video').forEach(function (video) {
    lazyLoadVideo(video, { skipOnSmallScreen: false });
  });
})();
