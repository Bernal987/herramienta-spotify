(function (Drupal) {
  'use strict';

  /**
   * Comportamiento principal del tema herramienta_spotify.
   */
  Drupal.behaviors.herramientaSpotify = {
    attach: function (context, settings) {

      // --- Menú hamburger móvil ---
      const header = context.querySelector('.site-header');
      const toggleBtn = context.querySelector('.site-header__toggle');

      if (header && toggleBtn) {
        toggleBtn.addEventListener('click', function () {
          const isOpen = header.classList.toggle('is-open');
          toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
          toggleBtn.setAttribute('aria-label', isOpen ? Drupal.t('Cerrar menú') : Drupal.t('Abrir menú'));
        });

        // Cerrar menú al hacer click fuera
        document.addEventListener('click', function (e) {
          if (!header.contains(e.target) && header.classList.contains('is-open')) {
            header.classList.remove('is-open');
            toggleBtn.setAttribute('aria-expanded', 'false');
            toggleBtn.setAttribute('aria-label', Drupal.t('Abrir menú'));
          }
        });

        // Cerrar menú al redimensionar a escritorio
        window.addEventListener('resize', function () {
          if (window.innerWidth > 768 && header.classList.contains('is-open')) {
            header.classList.remove('is-open');
            toggleBtn.setAttribute('aria-expanded', 'false');
          }
        });
      }

      // --- Marcar enlace activo del menú ---
      const currentPath = window.location.pathname;
      const navLinks = context.querySelectorAll('.site-header__nav a');
      navLinks.forEach(function (link) {
        if (link.getAttribute('href') === currentPath) {
          link.classList.add('is-active');
        }
      });

      // --- Header con fondo al hacer scroll ---
      const siteHeader = context.querySelector('.site-header');
      if (siteHeader) {
        const onScroll = function () {
          if (window.scrollY > 10) {
            siteHeader.style.backgroundColor = 'rgba(18,18,18,0.98)';
          } else {
            siteHeader.style.backgroundColor = '';
          }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
      }

    }
  };

})(Drupal);
