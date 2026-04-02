// Modern JavaScript for Regal Heights Marble Website
// No jQuery dependency - Pure vanilla JavaScript

(function() {
    'use strict';
    
    // Module-scoped state (no window pollution)
    let galleryImages = [];
    let currentImageIndex = 0;
    
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', init);
    
    function init() {
        setupSmoothScrolling();
        setupActiveNavigation();
        setupScrollEffects();
        setupGallery();
        setupHamburgerMenu();
        setupBackToTop();
    }
    
    // ===========================
    // Smooth Scrolling
    // ===========================
    function setupSmoothScrolling() {
        const navLinks = document.querySelectorAll('a[href^="#"]');
        
        navLinks.forEach(link => {
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
                    
                    // Update URL hash without jumping
                    history.pushState(null, null, targetId);

                    // Close mobile menu if open
                    closeMobileMenu();
                }
            });
        });
    }
    
    // ===========================
    // Hamburger Menu
    // ===========================
    function setupHamburgerMenu() {
        const hamburger = document.getElementById('hamburger');
        const navContainer = document.querySelector('.nav-container');
        
        if (!hamburger || !navContainer) return;
        
        hamburger.addEventListener('click', function() {
            const isOpen = navContainer.classList.toggle('menu-open');
            hamburger.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', isOpen);
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navContainer.contains(e.target)) {
                closeMobileMenu();
            }
        });
    }

    function closeMobileMenu() {
        const hamburger = document.getElementById('hamburger');
        const navContainer = document.querySelector('.nav-container');
        if (hamburger && navContainer) {
            navContainer.classList.remove('menu-open');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    }
    
    // ===========================
    // Active Navigation State
    // ===========================
    function setupActiveNavigation() {
        const sections = document.querySelectorAll('section[id], header[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        function updateActiveNav() {
            let currentSection = '';
            const scrollPosition = window.scrollY + 150;
            
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
                const linkSection = link.getAttribute('href').substring(1);
                
                if (linkSection === currentSection) {
                    link.classList.add('active');
                }
            });
        }
        
        // Update on scroll
        window.addEventListener('scroll', throttle(updateActiveNav, 100));
        
        // Update on page load
        updateActiveNav();
    }
    
    // ===========================
    // Scroll Effects
    // ===========================
    function setupScrollEffects() {
        const navbar = document.querySelector('.navbar');
        
        window.addEventListener('scroll', throttle(function() {
            const currentScroll = window.scrollY;
            
            // Add shadow to navbar on scroll
            if (currentScroll > 50) {
                navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
            } else {
                navbar.style.boxShadow = 'none';
            }
        }, 100));
        
        // Fade-in animation for content boxes on scroll
        observeElements();
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
    // Intersection Observer for Fade-in Effects
    // ===========================
    function observeElements() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Observe content boxes
        const contentBoxes = document.querySelectorAll('.content-box');
        contentBoxes.forEach(box => {
            box.style.opacity = '0';
            box.style.transform = 'translateY(30px)';
            box.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(box);
        });
    }
    
    // ===========================
    // Utility: Throttle Function
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
        setupGalleryArrows();
    }
    
    function loadGalleryImages() {
        const galleryGrid = document.getElementById('galleryGrid');
        const loadingElement = document.getElementById('galleryLoading');
        const emptyElement = document.getElementById('galleryEmpty');
        
        if (!galleryGrid) return;
        
        const galleryPath = 'gallery/';
        
        // Load from manifest instead of probing
        fetch(galleryPath + 'manifest.json')
            .then(response => {
                if (!response.ok) throw new Error('Manifest not found');
                return response.json();
            })
            .then(manifest => {
                galleryImages = manifest.map(file => galleryPath + file);
                
                if (loadingElement) {
                    loadingElement.style.display = 'none';
                }
                
                if (galleryImages.length === 0) {
                    if (emptyElement) {
                        emptyElement.style.display = 'block';
                    }
                } else {
                    displayGalleryImages(galleryImages);
                }
            })
            .catch(() => {
                // Fallback: probe for images if manifest is missing
                probeGalleryImages(galleryPath, loadingElement, emptyElement);
            });
    }

    // Fallback for when manifest.json isn't available
    function probeGalleryImages(galleryPath, loadingElement, emptyElement) {
        const maxImages = 30;
        const promises = [];
        
        for (let i = 1; i <= maxImages; i++) {
            promises.push(checkImage(galleryPath + i + '.jpg'));
        }
        
        Promise.all(promises).then(results => {
            const validImages = results.filter(img => img !== null);
            galleryImages = validImages;
            
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            
            if (validImages.length === 0) {
                if (emptyElement) {
                    emptyElement.style.display = 'block';
                }
            } else {
                displayGalleryImages(validImages);
            }
        });
    }

    function checkImage(src) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(src);
            img.onerror = () => resolve(null);
            img.src = src;
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
            
            galleryItem.appendChild(img);
            
            // Add click event for lightbox
            galleryItem.addEventListener('click', () => openLightbox(imageSrc, `Gallery Image ${index + 1}`, index));
            
            galleryGrid.appendChild(galleryItem);
        });
        
        // Add fade-in animation to gallery items
        observeGalleryItems();
    }

    // ===========================
    // Gallery Scroll Arrows
    // ===========================
    function setupGalleryArrows() {
        const leftArrow = document.querySelector('.gallery-arrow-left');
        const rightArrow = document.querySelector('.gallery-arrow-right');
        const galleryGrid = document.getElementById('galleryGrid');
        
        if (!leftArrow || !rightArrow || !galleryGrid) return;
        
        const scrollAmount = 370; // slightly more than item width + gap
        
        leftArrow.addEventListener('click', () => {
            galleryGrid.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
        
        rightArrow.addEventListener('click', () => {
            galleryGrid.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    }
    
    // ===========================
    // Lightbox
    // ===========================
    function setupLightbox() {
        // Create lightbox elements
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.id = 'lightbox';
        lightbox.setAttribute('role', 'dialog');
        lightbox.setAttribute('aria-modal', 'true');
        lightbox.setAttribute('aria-label', 'Image lightbox');
        
        const lightboxContent = document.createElement('div');
        lightboxContent.className = 'lightbox-content';
        
        // Previous button
        const prevButton = document.createElement('button');
        prevButton.className = 'lightbox-nav lightbox-prev';
        prevButton.innerHTML = '&#10094;';
        prevButton.setAttribute('aria-label', 'Previous image');
        
        // Next button
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
        
        // Image counter
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
        
        // Navigation events
        prevButton.addEventListener('click', (e) => {
            e.stopPropagation();
            navigateLightbox(-1);
        });
        
        nextButton.addEventListener('click', (e) => {
            e.stopPropagation();
            navigateLightbox(1);
        });
        
        // Close lightbox on background click
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        
        // Close lightbox on close button click
        closeButton.addEventListener('click', closeLightbox);
        
        // Keyboard navigation + focus trap
        document.addEventListener('keydown', (e) => {
            const lb = document.getElementById('lightbox');
            if (!lb || !lb.classList.contains('active')) return;

            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                navigateLightbox(-1);
            } else if (e.key === 'ArrowRight') {
                navigateLightbox(1);
            } else if (e.key === 'Tab') {
                // Focus trap: keep focus within lightbox
                const focusable = lb.querySelectorAll('button');
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                
                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    }
                } else {
                    if (document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
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
            
            // Update counter
            if (counter) {
                counter.textContent = `${currentImageIndex + 1} / ${galleryImages.length}`;
            }
            
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling

            // Move focus into lightbox for accessibility
            const closeBtn = lightbox.querySelector('.lightbox-close');
            if (closeBtn) closeBtn.focus();
        }
    }
    
    function closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        if (lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling

            // Return focus to the gallery item that opened the lightbox
            const galleryItem = document.querySelector(`.gallery-item[data-index="${currentImageIndex}"]`);
            if (galleryItem) galleryItem.focus();
        }
    }
    
    function navigateLightbox(direction) {
        if (!galleryImages || galleryImages.length === 0) return;
        
        // Calculate new index (wrap around)
        let newIndex = currentImageIndex + direction;
        if (newIndex < 0) {
            newIndex = galleryImages.length - 1;
        } else if (newIndex >= galleryImages.length) {
            newIndex = 0;
        }
        
        currentImageIndex = newIndex;
        
        const newImageSrc = galleryImages[newIndex];
        const lightboxImg = document.getElementById('lightboxImg');
        const counter = document.getElementById('lightboxCounter');
        
        if (lightboxImg && newImageSrc) {
            // Preload, then crossfade
            const newImg = new Image();
            
            function updateLightboxImage() {
                lightboxImg.style.opacity = '0';
                
                setTimeout(() => {
                    lightboxImg.src = newImageSrc;
                    lightboxImg.alt = `Gallery Image ${newIndex + 1}`;
                    
                    if (counter) {
                        counter.textContent = `${newIndex + 1} / ${galleryImages.length}`;
                    }
                    
                    lightboxImg.style.opacity = '1';
                }, 200);
            }

            newImg.onload = updateLightboxImage;
            newImg.src = newImageSrc;
            
            // Handle already-cached images
            if (newImg.complete) {
                newImg.onload = null; // Prevent double fire
                updateLightboxImage();
            }
        }
    }
    
    function observeGalleryItems() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // Use data-index for consistent stagger timing
                    const itemIndex = parseInt(entry.target.getAttribute('data-index'), 10) || 0;
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, itemIndex * 100);
                }
            });
        }, observerOptions);
        
        // Observe gallery items
        const galleryItems = document.querySelectorAll('.gallery-item');
        galleryItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
            item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(item);
        });
    }
    
    // ===========================
    // Handle Initial Hash in URL
    // ===========================
    window.addEventListener('load', function() {
        if (window.location.hash) {
            setTimeout(function() {
                const targetSection = document.querySelector(window.location.hash);
                if (targetSection) {
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = targetSection.offsetTop - navbarHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        }
    });
    
})();
