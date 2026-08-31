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

  if (heroVideo && 'IntersectionObserver' in window) {
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
  }
})();
