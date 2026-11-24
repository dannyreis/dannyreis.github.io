// Regal Heights Marble — Modern JavaScript
// No jQuery dependency — Pure vanilla JS

(function() {
    'use strict';

    let galleryImages = [];
    let currentImageIndex = 0;
    let lightboxTimer = null;
    let lightboxToken = 0;
    let lastLightboxTrigger = null;
    let scrollLockCount = 0;
    let savedScrollY = 0;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const SAFE_FILE = /^[A-Za-z0-9][\w.-]*$/;

    document.addEventListener('DOMContentLoaded', init);

    function prefersReducedMotion() {
        return reducedMotionQuery.matches;
    }

    function init() {
        setupSmoothScrolling();
        setupActiveNavigation();
        setupNavbar();
        setupHamburgerMenu();
        setupParallax();
        setupScrollReveal();
        setupCounterAnimation();
        setupGallery();
        setupBackToTop();
        setupKeyboard();
        scrollToHash(window.location.hash);
    }

    function navbarOffset() {
        const navbar = document.querySelector('.navbar');
        return navbar ? navbar.offsetHeight : 0;
    }

    function sectionFromHash(hash) {
        if (!hash || hash === '#') return null;

        let id;
        try {
            id = decodeURIComponent(hash.slice(1));
        } catch (err) {
            return null;
        }

        if (!/^[A-Za-z][\w:-]*$/.test(id)) return null;
        return document.getElementById(id);
    }

    function scrollToSection(target) {
        window.scrollTo({
            top: Math.max(0, target.offsetTop - navbarOffset()),
            behavior: prefersReducedMotion() ? 'auto' : 'smooth'
        });
    }

    function focusTarget(target) {
        const heading = target.querySelector('h1, h2') || target;
        if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
    }

    function scrollToHash(hash) {
        const target = sectionFromHash(hash);
        if (!target) return;
        scrollToSection(target);
    }

    // ===========================
    // Smooth Scrolling
    // ===========================
    function setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                const targetSection = sectionFromHash(targetId);
                if (!targetSection) return;

                e.preventDefault();

                const menuWasOpen = document.getElementById('navLinks')?.classList.contains('menu-open');
                if (menuWasOpen) closeMobileMenu();

                if (window.location.hash !== targetId) {
                    history.pushState(null, '', targetId);
                }

                scrollToSection(targetSection);
                focusTarget(targetSection);
            });
        });

        window.addEventListener('popstate', function() {
            closeMobileMenu();
            if (document.getElementById('lightbox')?.classList.contains('active')) {
                closeLightbox();
            }

            if (!window.location.hash) {
                window.scrollTo({
                    top: 0,
                    behavior: prefersReducedMotion() ? 'auto' : 'smooth'
                });
                return;
            }

            const target = sectionFromHash(window.location.hash);
            if (!target) return;
            scrollToSection(target);
            focusTarget(target);
        });
    }

    // ===========================
    // Scroll locking
    // ===========================
    function lockScroll() {
        if (scrollLockCount === 0) {
            savedScrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = '-' + savedScrollY + 'px';
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.width = '100%';
            document.body.style.touchAction = 'none';
        }
        scrollLockCount += 1;
    }

    function unlockScroll() {
        scrollLockCount = Math.max(0, scrollLockCount - 1);
        if (scrollLockCount > 0) return;

        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        document.body.style.touchAction = '';
        window.scrollTo(0, savedScrollY);
    }

    function setBackgroundInert(inert, except) {
        document.querySelectorAll('nav, main, footer, .back-to-top').forEach(el => {
            const keepActive = except && (el === except || except.contains(el));
            el.inert = keepActive ? false : inert;
        });
    }

    // ===========================
    // Navbar Scroll Effect
    // ===========================
    function setupNavbar() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        const update = () => navbar.classList.toggle('scrolled', window.scrollY > 80);
        window.addEventListener('scroll', throttle(update, 50), { passive: true });
        update();
    }

    // ===========================
    // Active Navigation State
    // ===========================
    function setupActiveNavigation() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        function updateActiveNav() {
            const scrollPosition = window.scrollY + navbarOffset() + 24;
            let currentSection = '';

            sections.forEach(section => {
                if (scrollPosition >= section.offsetTop) {
                    currentSection = section.id;
                }
            });

            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === '#' + currentSection);
            });
        }

        window.addEventListener('scroll', throttle(updateActiveNav, 100), { passive: true });
        updateActiveNav();
    }

    // ===========================
    // Hamburger Menu
    // ===========================
    function setupHamburgerMenu() {
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.getElementById('navLinks');
        if (!hamburger || !navLinks) return;

        hamburger.addEventListener('click', function() {
            if (navLinks.classList.contains('menu-open')) {
                closeMobileMenu();
                hamburger.focus();
            } else {
                openMobileMenu();
            }
        });

        document.addEventListener('click', function(e) {
            if (!navLinks.classList.contains('menu-open')) return;
            if (hamburger.contains(e.target) || navLinks.contains(e.target)) return;
            if (e.target.closest('.nav-brand')) return;
            closeMobileMenu();
        });

        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && navLinks.classList.contains('menu-open')) {
                closeMobileMenu();
            }
        });
    }

    function openMobileMenu() {
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.getElementById('navLinks');
        const navbar = document.getElementById('navbar');
        if (!hamburger || !navLinks) return;

        navLinks.classList.add('menu-open');
        hamburger.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
        lockScroll();
        setBackgroundInert(true, navbar);

        const firstLink = navLinks.querySelector('a');
        if (firstLink) firstLink.focus();
    }

    function closeMobileMenu() {
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.getElementById('navLinks');
        if (!hamburger || !navLinks || !navLinks.classList.contains('menu-open')) return;

        navLinks.classList.remove('menu-open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        unlockScroll();

        if (!document.getElementById('lightbox')?.classList.contains('active')) {
            setBackgroundInert(false);
        }
    }

    // ===========================
    // Hero Parallax Effect
    // ===========================
    function setupParallax() {
        const heroBg = document.querySelector('.hero-bg');
        const hero = document.querySelector('.hero');
        if (!heroBg || !hero) return;

        let heroHeight = hero.offsetHeight;
        let ticking = false;

        window.addEventListener('resize', function() {
            heroHeight = hero.offsetHeight;
        });

        window.addEventListener('scroll', function() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(function() {
                ticking = false;
                if (prefersReducedMotion()) {
                    heroBg.style.transform = '';
                    return;
                }

                const scrolled = window.scrollY;
                heroBg.style.transform = scrolled < heroHeight
                    ? 'translateY(' + (scrolled * 0.4) + 'px)'
                    : '';
            });
        }, { passive: true });
    }

    // ===========================
    // Scroll Reveal Animations
    // ===========================
    function setupScrollReveal() {
        if (prefersReducedMotion()) return;

        const revealTargets = [
            '.section-header',
            '.about-text',
            '.service-card',
            '.contact-info-card',
            '.footer-content'
        ];

        revealTargets.forEach(selector => {
            document.querySelectorAll(selector).forEach((el, index) => {
                el.classList.add('reveal');
                if (selector === '.service-card') {
                    el.classList.add('reveal-delay-' + ((index % 3) + 1));
                }
            });
        });

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -60px 0px'
        });

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }

    // ===========================
    // Counter Animation
    // ===========================
    function setupCounterAnimation() {
        const counters = document.querySelectorAll('.stat-number');
        const statsBar = document.querySelector('.stats-bar');
        if (!counters.length || !statsBar || prefersReducedMotion()) return;

        let animated = false;
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (!entry.isIntersecting || animated) return;
                animated = true;
                animateCounters(counters);
                observer.disconnect();
            });
        }, { threshold: 0.2 });

        observer.observe(statsBar);
    }

    function animateCounters(counters) {
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'), 10);
            if (!Number.isFinite(target)) return;

            const duration = 2000;
            const startTime = performance.now();

            function updateCounter(currentTime) {
                const progress = Math.min((currentTime - startTime) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                counter.textContent = Math.round(eased * target).toLocaleString('en-CA');
                if (progress < 1) requestAnimationFrame(updateCounter);
            }

            requestAnimationFrame(updateCounter);
        });
    }

    // ===========================
    // Back to Top Button
    // ===========================
    function setupBackToTop() {
        const btn = document.getElementById('backToTop');
        if (!btn) return;

        window.addEventListener('scroll', throttle(function() {
            btn.classList.toggle('visible', window.scrollY > 600);
        }, 100), { passive: true });

        btn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: prefersReducedMotion() ? 'auto' : 'smooth'
            });
        });
    }

    // ===========================
    // Throttle Utility
    // ===========================
    function throttle(func, wait) {
        let timeout = null;
        let lastRan = 0;

        return function executedFunction() {
            const context = this;
            const args = arguments;
            const now = Date.now();
            const remaining = wait - (now - lastRan);

            if (remaining <= 0) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                lastRan = now;
                func.apply(context, args);
            } else if (!timeout) {
                timeout = setTimeout(function() {
                    lastRan = Date.now();
                    timeout = null;
                    func.apply(context, args);
                }, remaining);
            }
        };
    }

    // ===========================
    // Gallery
    // ===========================
    function setupGallery() {
        loadGalleryImages();
        setupLightbox();
    }

    function loadGalleryImages() {
        const galleryGrid = document.getElementById('galleryGrid');
        const loadingElement = document.getElementById('galleryLoading');
        const emptyElement = document.getElementById('galleryEmpty');
        const errorElement = document.getElementById('galleryError');
        if (!galleryGrid) return;

        function showStatus(which) {
            if (loadingElement) loadingElement.hidden = which !== 'loading';
            if (emptyElement) emptyElement.hidden = which !== 'empty';
            if (errorElement) errorElement.hidden = which !== 'error';
        }

        fetch('gallery/manifest.json')
            .then(response => {
                if (!response.ok) throw new Error('Manifest not found');
                return response.json();
            })
            .then(manifest => {
                if (!Array.isArray(manifest)) throw new Error('Invalid manifest');

                galleryImages = manifest.map(normalizeGalleryEntry).filter(Boolean);

                if (galleryImages.length === 0) {
                    showStatus('empty');
                    return;
                }

                showStatus('ready');
                displayGalleryImages(galleryImages);
            })
            .catch(() => {
                galleryImages = [];
                showStatus('error');
            });
    }

    function normalizeGalleryEntry(entry) {
        const item = typeof entry === 'string' ? { file: entry } : entry;
        if (!item || typeof item.file !== 'string') return null;
        if (!SAFE_FILE.test(item.file) || item.file.includes('..')) return null;

        const width = Number(item.width);
        const height = Number(item.height);

        return {
            src: 'gallery/' + item.file,
            thumb: 'gallery/thumbs/' + item.file,
            alt: typeof item.alt === 'string' && item.alt.trim()
                ? item.alt.trim()
                : 'Completed stone and tile installation',
            width: Number.isFinite(width) && width > 0 ? width : null,
            height: Number.isFinite(height) && height > 0 ? height : null
        };
    }

    function displayGalleryImages(images) {
        const galleryGrid = document.getElementById('galleryGrid');
        if (!galleryGrid) return;

        const reduce = prefersReducedMotion();
        const fragment = document.createDocumentFragment();

        images.forEach((image, index) => {
            const galleryItem = document.createElement('button');
            galleryItem.type = 'button';
            galleryItem.className = reduce ? 'gallery-item is-visible' : 'gallery-item is-pending';
            galleryItem.dataset.index = String(index);

            const img = document.createElement('img');
            img.src = image.thumb;
            img.alt = image.alt;
            img.decoding = 'async';
            img.loading = index < 6 ? 'eager' : 'lazy';
            if (image.width) img.width = image.width;
            if (image.height) img.height = image.height;
            img.addEventListener('error', function onError() {
                img.removeEventListener('error', onError);
                img.src = image.src;
            });

            const overlay = document.createElement('span');
            overlay.className = 'gallery-overlay';
            overlay.setAttribute('aria-hidden', 'true');
            const label = document.createElement('span');
            label.textContent = 'View Project';
            overlay.appendChild(label);

            galleryItem.appendChild(img);
            galleryItem.appendChild(overlay);
            galleryItem.addEventListener('click', () => openLightbox(index, galleryItem));
            fragment.appendChild(galleryItem);
        });

        galleryGrid.replaceChildren(fragment);
        if (!reduce) observeGalleryItems();
    }

    function observeGalleryItems() {
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const itemIndex = parseInt(entry.target.dataset.index, 10);
                const delay = (Number.isFinite(itemIndex) ? itemIndex % 6 : 0) * 80;
                window.setTimeout(() => {
                    entry.target.classList.remove('is-pending');
                    entry.target.classList.add('is-visible');
                }, delay);
                observer.unobserve(entry.target);
            });
        }, {
            threshold: 0.05,
            rootMargin: '0px 0px -30px 0px'
        });

        document.querySelectorAll('.gallery-item').forEach(item => observer.observe(item));
    }

    // ===========================
    // Lightbox
    // ===========================
    function setupLightbox() {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.id = 'lightbox';
        lightbox.setAttribute('role', 'dialog');
        lightbox.setAttribute('aria-modal', 'true');
        lightbox.setAttribute('aria-label', 'Project photo');

        const prevButton = document.createElement('button');
        prevButton.type = 'button';
        prevButton.className = 'lightbox-nav lightbox-prev';
        prevButton.textContent = '\u276E';
        prevButton.setAttribute('aria-label', 'Previous image');

        const nextButton = document.createElement('button');
        nextButton.type = 'button';
        nextButton.className = 'lightbox-nav lightbox-next';
        nextButton.textContent = '\u276F';
        nextButton.setAttribute('aria-label', 'Next image');

        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'lightbox-close';
        closeButton.textContent = '\u00D7';
        closeButton.setAttribute('aria-label', 'Close lightbox');

        const imageCounter = document.createElement('div');
        imageCounter.className = 'lightbox-counter';
        imageCounter.id = 'lightboxCounter';
        imageCounter.setAttribute('aria-live', 'polite');

        const count = document.createElement('span');
        count.id = 'lightboxCount';
        const caption = document.createElement('span');
        caption.id = 'lightboxCaption';
        caption.className = 'visually-hidden';
        imageCounter.appendChild(count);
        imageCounter.appendChild(caption);

        const lightboxContent = document.createElement('div');
        lightboxContent.className = 'lightbox-content';

        const lightboxImg = document.createElement('img');
        lightboxImg.id = 'lightboxImg';
        lightboxImg.alt = '';
        lightboxImg.decoding = 'async';
        lightboxContent.appendChild(lightboxImg);

        lightbox.append(prevButton, nextButton, closeButton, imageCounter, lightboxContent);
        document.body.appendChild(lightbox);

        prevButton.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(-1); });
        nextButton.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(1); });
        closeButton.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    function setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            const lightbox = document.getElementById('lightbox');
            const lightboxOpen = lightbox && lightbox.classList.contains('active');
            const navLinks = document.getElementById('navLinks');
            const menuOpen = navLinks && navLinks.classList.contains('menu-open');

            if (e.key === 'Escape') {
                if (lightboxOpen) {
                    e.preventDefault();
                    closeLightbox();
                } else if (menuOpen) {
                    e.preventDefault();
                    closeMobileMenu();
                    document.getElementById('hamburger')?.focus();
                }
                return;
            }

            if (lightboxOpen && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
                e.preventDefault();
                navigateLightbox(e.key === 'ArrowLeft' ? -1 : 1);
                return;
            }

            if (e.key !== 'Tab') return;
            if (lightboxOpen) trapTab(e, lightbox);
            else if (menuOpen) trapTab(e, document.getElementById('navbar'));
        });
    }

    function focusableIn(container) {
        if (!container) return [];
        return Array.from(container.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'))
            .filter(el => !el.hidden && el.getClientRects().length > 0);
    }

    function trapTab(e, container) {
        const focusable = focusableIn(container);
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (!container.contains(document.activeElement)) {
            e.preventDefault();
            (e.shiftKey ? last : first).focus();
            return;
        }

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }

    function openLightbox(index, trigger) {
        const lightbox = document.getElementById('lightbox');
        if (!lightbox || !galleryImages.length) return;

        lastLightboxTrigger = trigger || document.activeElement;
        currentImageIndex = index;
        lightbox.classList.add('active');
        lockScroll();
        setBackgroundInert(true);
        renderLightboxImage(index, false);
        lightbox.querySelector('.lightbox-close')?.focus();
    }

    function closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        if (!lightbox || !lightbox.classList.contains('active')) return;

        lightboxToken += 1;
        if (lightboxTimer) {
            clearTimeout(lightboxTimer);
            lightboxTimer = null;
        }

        lightbox.classList.remove('active');
        const img = document.getElementById('lightboxImg');
        if (img) img.style.opacity = '1';

        unlockScroll();
        if (!document.getElementById('navLinks')?.classList.contains('menu-open')) {
            setBackgroundInert(false);
        }

        if (lastLightboxTrigger && typeof lastLightboxTrigger.focus === 'function') {
            lastLightboxTrigger.focus();
        }
    }

    function navigateLightbox(direction) {
        if (!galleryImages.length) return;

        let newIndex = currentImageIndex + direction;
        if (newIndex < 0) newIndex = galleryImages.length - 1;
        else if (newIndex >= galleryImages.length) newIndex = 0;

        currentImageIndex = newIndex;
        renderLightboxImage(newIndex, true);
    }

    function renderLightboxImage(index, animate) {
        const item = galleryImages[index];
        const lightboxImg = document.getElementById('lightboxImg');
        const count = document.getElementById('lightboxCount');
        const caption = document.getElementById('lightboxCaption');
        if (!item || !lightboxImg) return;

        lightboxToken += 1;
        const token = lightboxToken;
        if (lightboxTimer) {
            clearTimeout(lightboxTimer);
            lightboxTimer = null;
        }

        if (count) count.textContent = (index + 1) + ' / ' + galleryImages.length;
        if (caption) caption.textContent = item.alt;

        const apply = () => {
            if (token !== lightboxToken) return;
            lightboxImg.src = item.src;
            lightboxImg.alt = item.alt;
            lightboxImg.style.opacity = '1';
        };

        if (!animate || prefersReducedMotion()) {
            apply();
            return;
        }

        const preloaded = new Image();
        let started = false;
        const beginFade = () => {
            if (started || token !== lightboxToken) return;
            started = true;
            lightboxImg.style.opacity = '0';
            lightboxTimer = window.setTimeout(apply, 180);
        };

        preloaded.onload = beginFade;
        preloaded.onerror = beginFade;
        preloaded.src = item.src;
        if (preloaded.complete) beginFade();
    }

    window.addEventListener('load', function() {
        if (window.location.hash) scrollToHash(window.location.hash);
    });
})();
