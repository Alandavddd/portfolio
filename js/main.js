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

  /* ------------------------------------------------------------
     Pausa o vídeo de fundo quando ele sai da viewport, pra
     economizar recursos em páginas longas / mobile.
  ------------------------------------------------------------ */
  var heroVideo = document.querySelector('.hero__video');
  var isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
  var connection = navigator.connection || navigator.webkitConnection || navigator.mozConnection;
  var saveData = connection && connection.saveData;
  var slowConnection = connection && /^(slow-2g|2g|3g)$/.test(connection.effectiveType || '');

  // No celular / conexão fraca, nem baixa o vídeo: fica só o poster (leve).
  var shouldLoadVideo = heroVideo && !isSmallScreen && !prefersReducedMotion && !saveData && !slowConnection;

  if (shouldLoadVideo) {
    var source = document.createElement('source');
    source.src = heroVideo.dataset.src;
    source.type = 'video/mp4';
    heroVideo.appendChild(source);
    heroVideo.load();

    if ('IntersectionObserver' in window) {
      var videoObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            heroVideo.play().catch(function () {});
          } else {
            heroVideo.pause();
          }
        });
      }, { threshold: 0.1 });

      videoObserver.observe(heroVideo);
    } else {
      heroVideo.play().catch(function () {});
    }
  }
})();
