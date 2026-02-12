// Modern JavaScript for Regal Heights Marble Website
// No jQuery dependency - Pure vanilla JavaScript

(function() {
    'use strict';
    
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', init);
    
    function init() {
        setupSmoothScrolling();
        setupActiveNavigation();
        setupScrollEffects();
        setupGallery();
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
                }
            });
        });
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
        let lastScroll = 0;
        
        window.addEventListener('scroll', throttle(function() {
            const currentScroll = window.pageYOffset;
            
            // Add shadow to navbar on scroll
            if (currentScroll > 50) {
                navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
            } else {
                navbar.style.boxShadow = 'none';
            }
            
            lastScroll = currentScroll;
        }, 100));
        
        // Fade-in animation for content boxes on scroll
        observeElements();
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
        // Store gallery images globally for navigation
        window.galleryImages = [];
    }
    
    function loadGalleryImages() {
        const galleryGrid = document.getElementById('galleryGrid');
        const loadingElement = document.getElementById('galleryLoading');
        const emptyElement = document.getElementById('galleryEmpty');
        
        if (!galleryGrid) return;
        
        // Simple approach: Check for common image names in sequence
        const galleryPath = 'gallery/';
        const imageExtensions = ['jpg', 'png'];
        const loadedImages = [];
        
        // Check for images named 1.jpg, 2.jpg, 3.jpg, etc.
        function checkSequentialImages(maxImages = 20) {
            const promises = [];
            
            for (let i = 1; i <= maxImages; i++) {
                // Check each extension for this number
                imageExtensions.forEach(ext => {
                    const imagePath = `${galleryPath}${i}.${ext}`;
                    promises.push(checkImage(imagePath));
                });
            }
            
            return Promise.all(promises);
        }
        
        function checkImage(src) {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(src);
                img.onerror = () => resolve(null);
                img.src = src;
            });
        }
        
        async function loadImages() {
            const results = await checkSequentialImages();
            const validImages = results.filter(img => img !== null);
            
            // Store images globally for navigation
            window.galleryImages = validImages;
            
            // Hide loading indicator
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            
            if (validImages.length === 0) {
                // Show empty message
                if (emptyElement) {
                    emptyElement.style.display = 'block';
                }
            } else {
                // Display loaded images
                displayGalleryImages(validImages);
            }
        }
        
        loadImages();
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
    
    function setupLightbox() {
        // Create lightbox elements
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.id = 'lightbox';
        
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
        
        // Store current image index
        window.currentImageIndex = 0;
        
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
        
        // Close lightbox on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                navigateLightbox(-1);
            } else if (e.key === 'ArrowRight') {
                navigateLightbox(1);
            }
        });
    }
    
    function openLightbox(imageSrc, title, index) {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightboxImg');
        const counter = document.getElementById('lightboxCounter');
        
        if (lightbox && lightboxImg) {
            window.currentImageIndex = index || 0;
            lightboxImg.src = imageSrc;
            lightboxImg.alt = title || 'Gallery Image';
            
            // Update counter
            if (counter && window.galleryImages) {
                counter.textContent = `${window.currentImageIndex + 1} / ${window.galleryImages.length}`;
            }
            
            // Update navigation button states
            updateNavigationButtons();
            
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
    }
    
    function closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        if (lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        }
    }
    
    function navigateLightbox(direction) {
        if (!window.galleryImages || window.galleryImages.length === 0) return;
        
        // Calculate new index
        let newIndex = window.currentImageIndex + direction;
        
        // Wrap around for circular navigation
        if (newIndex < 0) {
            newIndex = window.galleryImages.length - 1;
        } else if (newIndex >= window.galleryImages.length) {
            newIndex = 0;
        }
        
        // Update current index
        window.currentImageIndex = newIndex;
        
        // Get new image
        const newImageSrc = window.galleryImages[newIndex];
        const lightboxImg = document.getElementById('lightboxImg');
        const counter = document.getElementById('lightboxCounter');
        
        if (lightboxImg && newImageSrc) {
            // Create a new image element for preloading
            const newImg = new Image();
            newImg.src = newImageSrc;
            
            // Crossfade transition
            newImg.onload = () => {
                // Fade out current image
                lightboxImg.style.opacity = '0';
                
                setTimeout(() => {
                    // Update to new image
                    lightboxImg.src = newImageSrc;
                    lightboxImg.alt = `Gallery Image ${newIndex + 1}`;
                    
                    // Update counter
                    if (counter) {
                        counter.textContent = `${newIndex + 1} / ${window.galleryImages.length}`;
                    }
                    
                    // Update navigation button states
                    updateNavigationButtons();
                    
                    // Fade in new image
                    lightboxImg.style.opacity = '1';
                }, 200);
            };
            
            // If image is already cached, onload might not fire, so handle that case
            if (newImg.complete) {
                newImg.onload();
            }
        }
    }
    
    function updateNavigationButtons() {
        const prevButton = document.querySelector('.lightbox-prev');
        const nextButton = document.querySelector('.lightbox-next');
        
        if (prevButton && nextButton && window.galleryImages) {
            // Always enable buttons for circular navigation
            prevButton.style.opacity = '1';
            prevButton.style.pointerEvents = 'auto';
            nextButton.style.opacity = '1';
            nextButton.style.pointerEvents = 'auto';
        }
    }
    
    function observeGalleryItems() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100); // Staggered animation
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
