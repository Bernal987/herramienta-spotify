(function (Drupal) {
  'use strict';

  /**
   * Comportamiento principal del tema herramienta_spotify.
   */
  Drupal.behaviors.herramientaSpotify = {
    attach: function (context, settings) {

      // --- Menú de cuenta de usuario (dropdown) ---
      const accountMenus = context.querySelectorAll('.account-menu');
      accountMenus.forEach(function (menu) {
        if (menu.dataset.accountInit) return;
        menu.dataset.accountInit = '1';

        const trigger  = menu.querySelector('.account-menu__trigger');
        const dropdown = menu.querySelector('.account-menu__dropdown');
        if (!trigger || !dropdown) return;

        function positionDropdown() {
          var rect = trigger.getBoundingClientRect();
          dropdown.style.top   = (rect.bottom + 8) + 'px';
          dropdown.style.right = (window.innerWidth - rect.right) + 'px';
          dropdown.style.left  = 'auto';
        }

        function openMenu() {
          positionDropdown();
          menu.setAttribute('data-open', '');
          trigger.setAttribute('aria-expanded', 'true');
          dropdown.removeAttribute('aria-hidden');
          var firstLink = dropdown.querySelector('.account-menu__link');
          if (firstLink) firstLink.focus();
        }

        function closeMenu() {
          menu.removeAttribute('data-open');
          trigger.setAttribute('aria-expanded', 'false');
          dropdown.setAttribute('aria-hidden', 'true');
        }

        trigger.addEventListener('click', function (e) {
          e.stopPropagation();
          menu.hasAttribute('data-open') ? closeMenu() : openMenu();
        });

        // Reposicionar si la ventana cambia de tamaño con el menú abierto
        window.addEventListener('resize', function () {
          if (menu.hasAttribute('data-open')) positionDropdown();
        });

        // Cerrar al hacer click fuera
        document.addEventListener('click', function (e) {
          if (!menu.contains(e.target) && !dropdown.contains(e.target)) closeMenu();
        });

        // Navegación por teclado dentro del dropdown
        dropdown.addEventListener('keydown', function (e) {
          var links = Array.from(dropdown.querySelectorAll('.account-menu__link'));
          var idx   = links.indexOf(document.activeElement);
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            links[(idx + 1) % links.length].focus();
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            links[(idx - 1 + links.length) % links.length].focus();
          } else if (e.key === 'Escape') {
            closeMenu();
            trigger.focus();
          }
        });
      });

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

      // --- Botón favorito ---
      const favBtns = context.querySelectorAll('.btn-fav');
      favBtns.forEach(function (btn) {
        if (btn.dataset.favInit) return;
        btn.dataset.favInit = '1';

        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();

          const nodeId = btn.dataset.nodeId;
          if (!nodeId) return;

          fetch('/session/token')
            .then(function (r) { return r.text(); })
            .then(function (csrfToken) {
              return fetch('/api/favoritos/toggle/' + nodeId, {
                method: 'POST',
                headers: {
                  'X-CSRF-Token': csrfToken,
                  'Content-Type': 'application/json',
                },
              });
            })
            .then(function (r) { return r.json(); })
            .then(function (data) {
              const icon  = btn.querySelector('.fav-icon');
              const label = btn.querySelector('.fav-label');
              if (data.activo) {
                btn.classList.add('is-favorito');
                btn.setAttribute('aria-label', Drupal.t('Quitar de favoritos'));
                if (icon)  icon.textContent  = '❤️';
                if (label) label.textContent = Drupal.t('Marcado como favorito');
              } else {
                btn.classList.remove('is-favorito');
                btn.setAttribute('aria-label', Drupal.t('Marcar como favorito'));
                if (icon)  icon.textContent  = '🤍';
                if (label) label.textContent = Drupal.t('Marcar como favorito');
              }
            })
            .catch(function (err) {
              console.error('Error al actualizar favorito:', err);
            });
        });

        btn.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            btn.click();
          }
        });
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
