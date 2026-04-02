// Regal Heights Marble — Modern JavaScript
// No jQuery dependency — Pure vanilla JS

(function() {
    'use strict';

    // Module-scoped state
    let galleryImages = [];
    let currentImageIndex = 0;

    document.addEventListener('DOMContentLoaded', init);

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
    }

    // ===========================
    // Smooth Scrolling
    // ===========================
    function setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = targetSection.offsetTop - navbarHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    history.pushState(null, null, targetId);
                    closeMobileMenu();
                }
            });
        });
    }

    // ===========================
    // Navbar Scroll Effect
    // ===========================
    function setupNavbar() {
        const navbar = document.querySelector('.navbar');

        window.addEventListener('scroll', throttle(function() {
            if (window.scrollY > 80) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }, 50));
    }

    // ===========================
    // Active Navigation State
    // ===========================
    function setupActiveNavigation() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        function updateActiveNav() {
            let currentSection = '';
            const scrollPosition = window.scrollY + 200;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');

                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    currentSection = sectionId;
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + currentSection) {
                    link.classList.add('active');
                }
            });
        }

        window.addEventListener('scroll', throttle(updateActiveNav, 100));
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
            const isOpen = navLinks.classList.toggle('menu-open');
            hamburger.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                closeMobileMenu();
            }
        });
    }

    function closeMobileMenu() {
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.getElementById('navLinks');
        if (hamburger && navLinks) {
            navLinks.classList.remove('menu-open');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    }

    // ===========================
    // Hero Parallax Effect
    // ===========================
    function setupParallax() {
        const heroBg = document.querySelector('.hero-bg');
        if (!heroBg) return;

        window.addEventListener('scroll', function() {
            const scrolled = window.scrollY;
            const heroHeight = document.querySelector('.hero').offsetHeight;

            if (scrolled < heroHeight) {
                const parallaxOffset = scrolled * 0.4;
                heroBg.style.transform = `translateY(${parallaxOffset}px)`;
            }
        });
    }

    // ===========================
    // Scroll Reveal Animations
    // ===========================
    function setupScrollReveal() {
        // Add reveal class to elements
        const revealTargets = [
            '.section-header',
            '.about-text',
            '.service-card',
            '.contact-info-card',
            '.contact-form-card',
            '.footer-content'
        ];

        revealTargets.forEach(selector => {
            document.querySelectorAll(selector).forEach((el, index) => {
                el.classList.add('reveal');
                // Stagger service cards
                if (selector === '.service-card') {
                    el.classList.add(`reveal-delay-${(index % 3) + 1}`);
                }
            });
        });

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
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
        if (counters.length === 0) return;

        let animated = false;

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animated) {
                    animated = true;
                    animateCounters(counters);
                }
            });
        }, { threshold: 0.2 });

        const statsBar = document.querySelector('.stats-bar');
        if (statsBar) observer.observe(statsBar);
    }

    function animateCounters(counters) {
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'), 10);
            const duration = 2000;
            const startTime = performance.now();

            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(eased * target);

                counter.textContent = current.toLocaleString();

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                }
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
            if (window.scrollY > 600) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        }, 100));

        btn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ===========================
    // Throttle Utility
    // ===========================
    function throttle(func, wait) {
        let timeout;
        let lastRan;

        return function executedFunction() {
            const context = this;
            const args = arguments;

            if (!lastRan) {
                func.apply(context, args);
                lastRan = Date.now();
            } else {
                clearTimeout(timeout);
                timeout = setTimeout(function() {
                    if ((Date.now() - lastRan) >= wait) {
                        func.apply(context, args);
                        lastRan = Date.now();
                    }
                }, wait - (Date.now() - lastRan));
            }
        };
    }

    // ===========================
    // Gallery Functionality
    // ===========================
    function setupGallery() {
        loadGalleryImages();
        setupLightbox();
    }

    function loadGalleryImages() {
        const galleryGrid = document.getElementById('galleryGrid');
        const loadingElement = document.getElementById('galleryLoading');
        const emptyElement = document.getElementById('galleryEmpty');

        if (!galleryGrid) return;

        const galleryPath = 'gallery/';

        fetch(galleryPath + 'manifest.json')
            .then(response => {
                if (!response.ok) throw new Error('Manifest not found');
                return response.json();
            })
            .then(manifest => {
                galleryImages = manifest.map(file => galleryPath + file);

                if (loadingElement) loadingElement.style.display = 'none';

                if (galleryImages.length === 0) {
                    if (emptyElement) emptyElement.style.display = 'block';
                } else {
                    displayGalleryImages(galleryImages);
                }
            })
            .catch(() => {
                if (loadingElement) loadingElement.style.display = 'none';
                if (emptyElement) emptyElement.style.display = 'block';
            });
    }

    function displayGalleryImages(images) {
        const galleryGrid = document.getElementById('galleryGrid');
        if (!galleryGrid) return;

        galleryGrid.innerHTML = '';

        images.forEach((imageSrc, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.setAttribute('data-index', index);

            const img = document.createElement('img');
            img.src = imageSrc;
            img.alt = `Gallery Image ${index + 1}`;
            img.loading = 'lazy';

            const overlay = document.createElement('div');
            overlay.className = 'gallery-overlay';
            overlay.innerHTML = '<span>View Project</span>';

            galleryItem.appendChild(img);
            galleryItem.appendChild(overlay);

            galleryItem.addEventListener('click', () => openLightbox(imageSrc, `Gallery Image ${index + 1}`, index));

            galleryGrid.appendChild(galleryItem);
        });

        // Animate gallery items on scroll
        observeGalleryItems();
    }

    function observeGalleryItems() {
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const itemIndex = parseInt(entry.target.getAttribute('data-index'), 10) || 0;
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, (itemIndex % 6) * 80);
                }
            });
        }, {
            threshold: 0.05,
            rootMargin: '0px 0px -30px 0px'
        });

        document.querySelectorAll('.gallery-item').forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
            item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(item);
        });
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
        lightbox.setAttribute('aria-label', 'Image lightbox');

        const lightboxContent = document.createElement('div');
        lightboxContent.className = 'lightbox-content';

        const prevButton = document.createElement('button');
        prevButton.className = 'lightbox-nav lightbox-prev';
        prevButton.innerHTML = '&#10094;';
        prevButton.setAttribute('aria-label', 'Previous image');

        const nextButton = document.createElement('button');
        nextButton.className = 'lightbox-nav lightbox-next';
        nextButton.innerHTML = '&#10095;';
        nextButton.setAttribute('aria-label', 'Next image');

        const lightboxImg = document.createElement('img');
        lightboxImg.id = 'lightboxImg';

        const closeButton = document.createElement('button');
        closeButton.className = 'lightbox-close';
        closeButton.innerHTML = '&times;';
        closeButton.setAttribute('aria-label', 'Close lightbox');

        const imageCounter = document.createElement('div');
        imageCounter.className = 'lightbox-counter';
        imageCounter.id = 'lightboxCounter';

        lightboxContent.appendChild(prevButton);
        lightboxContent.appendChild(lightboxImg);
        lightboxContent.appendChild(nextButton);
        lightboxContent.appendChild(closeButton);
        lightboxContent.appendChild(imageCounter);
        lightbox.appendChild(lightboxContent);

        document.body.appendChild(lightbox);

        prevButton.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(-1); });
        nextButton.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(1); });
        lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
        closeButton.addEventListener('click', closeLightbox);

        // Keyboard navigation + focus trap
        document.addEventListener('keydown', (e) => {
            const lb = document.getElementById('lightbox');
            if (!lb || !lb.classList.contains('active')) return;

            if (e.key === 'Escape') closeLightbox();
            else if (e.key === 'ArrowLeft') navigateLightbox(-1);
            else if (e.key === 'ArrowRight') navigateLightbox(1);
            else if (e.key === 'Tab') {
                const focusable = lb.querySelectorAll('button');
                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
                } else {
                    if (document.activeElement === last) { e.preventDefault(); first.focus(); }
                }
            }
        });
    }

    function openLightbox(imageSrc, title, index) {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightboxImg');
        const counter = document.getElementById('lightboxCounter');

        if (lightbox && lightboxImg) {
            currentImageIndex = index || 0;
            lightboxImg.src = imageSrc;
            lightboxImg.alt = title || 'Gallery Image';

            if (counter) counter.textContent = `${currentImageIndex + 1} / ${galleryImages.length}`;

            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';

            const closeBtn = lightbox.querySelector('.lightbox-close');
            if (closeBtn) closeBtn.focus();
        }
    }

    function closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        if (lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';

            const galleryItem = document.querySelector(`.gallery-item[data-index="${currentImageIndex}"]`);
            if (galleryItem) galleryItem.focus();
        }
    }

    function navigateLightbox(direction) {
        if (!galleryImages || galleryImages.length === 0) return;

        let newIndex = currentImageIndex + direction;
        if (newIndex < 0) newIndex = galleryImages.length - 1;
        else if (newIndex >= galleryImages.length) newIndex = 0;

        currentImageIndex = newIndex;

        const newImageSrc = galleryImages[newIndex];
        const lightboxImg = document.getElementById('lightboxImg');
        const counter = document.getElementById('lightboxCounter');

        if (lightboxImg && newImageSrc) {
            const newImg = new Image();

            function updateLightboxImage() {
                lightboxImg.style.opacity = '0';
                setTimeout(() => {
                    lightboxImg.src = newImageSrc;
                    lightboxImg.alt = `Gallery Image ${newIndex + 1}`;
                    if (counter) counter.textContent = `${newIndex + 1} / ${galleryImages.length}`;
                    lightboxImg.style.opacity = '1';
                }, 200);
            }

            newImg.onload = updateLightboxImage;
            newImg.src = newImageSrc;

            if (newImg.complete) {
                newImg.onload = null;
                updateLightboxImage();
            }
        }
    }

    // ===========================
    // Handle Initial Hash
    // ===========================
    window.addEventListener('load', function() {
        if (window.location.hash) {
            setTimeout(function() {
                const targetSection = document.querySelector(window.location.hash);
                if (targetSection) {
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    window.scrollTo({
                        top: targetSection.offsetTop - navbarHeight,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        }
    });

})();
