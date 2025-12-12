// =============================================================================
    // NAVIGATION
    // =============================================================================

    /**
     * Create navigation bar from h2 elements
     */
    function populateNavigationBar() {
        const nav = document.getElementById('project-nav');
        if (!nav) {
            console.error("❌ Navigation element not found");
            return;
        }

        const ul = nav.querySelector('ul');
        if (!ul) {
            console.error("❌ No <ul> found in navigation");
            return;
        }

        const paraH2s = document.querySelectorAll('.para h2');
        if (paraH2s.length === 0) {
            console.warn("⚠️ No section headers found for navigation");
            return;
        }

        ul.innerHTML = "";

        paraH2s.forEach((h2, index) => {
            if (!h2.id) {
                h2.id = `section-${index}`;
            }

            const li = document.createElement('li');
            const a = document.createElement('a');

            a.textContent = h2.textContent;
            a.href = `#${h2.id}`;

            a.addEventListener('click', function(e) {
                e.preventDefault();
                document.getElementById(h2.id).scrollIntoView({
                    behavior: 'smooth'
                });
            });

            li.appendChild(a);
            ul.appendChild(li);
        });

        console.log("✅ Navigation bar populated with", paraH2s.length, "items");
        
        // Initialize Notion-like navigation behavior
        initNotionNavigation();
    }

    /**
 * Initialize Notion-like sidebar navigation
 */
function initNotionNavigation() {
    const navSpan = document.querySelector('span:has(#project-nav)');
    const projectContent = document.getElementById('container-project');
    
    if (!navSpan || !projectContent) {
        console.warn("⚠️ Navigation span or project-content not found");
        return;
    }

    // Desktop: Show navigation on hover near right edge
    if (window.innerWidth > 800) {
        let hideTimeout;

        // Track mouse movement on project-content
        projectContent.addEventListener('mousemove', function(e) {
            // Don't show nav if image is zoomed
            if (document.body.classList.contains('image-zoomed')) {
                return;
            }

            const contentRect = projectContent.getBoundingClientRect();
            const distanceFromRight = contentRect.right - e.clientX;
            // Show nav if mouse is within 150px of right edge
            if (distanceFromRight < 150) {
                navSpan.classList.add('visible');
                clearTimeout(hideTimeout);
            } else {
                // Delay hiding to allow moving to nav
                clearTimeout(hideTimeout);
                hideTimeout = setTimeout(() => {
                    if (!navSpan.matches(':hover')) {
                        navSpan.classList.remove('visible');
                    }
                }, 500);
            }
        });

        // Keep visible while hovering over nav itself
        navSpan.addEventListener('mouseenter', function() {
            // Don't show nav if image is zoomed
            if (document.body.classList.contains('image-zoomed')) {
                return;
            }
            clearTimeout(hideTimeout);
            navSpan.classList.add('visible');
        });

        navSpan.addEventListener('mouseleave', function() {
            hideTimeout = setTimeout(() => {
                navSpan.classList.remove('visible');
            }, 300);
        });

        console.log("✅ Desktop navigation hover initialized");
    } 
    // Mobile: Show navigation on swipe from right edge
    else {
        let touchStartX = 0;
        let touchStartY = 0;

        projectContent.addEventListener('touchstart', function(e) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        projectContent.addEventListener('touchmove', function(e) {
            // Don't show nav if image is zoomed
            if (document.body.classList.contains('image-zoomed')) {
                return;
            }

            const touchX = e.touches[0].clientX;
            const touchY = e.touches[0].clientY;
            const deltaX = touchX - touchStartX;
            const deltaY = touchY - touchStartY;
            
            const screenWidth = window.innerWidth;
            
            // If touch starts near right edge (within 50px) and swipes left
            if (touchStartX > screenWidth - 50 && deltaX < -30) {
                navSpan.classList.add('visible');
            }
            
            // Or if scrolling down and touch is on right side
            if (touchX > screenWidth - 100 && deltaY < -50) {
                navSpan.classList.add('visible');
            }
        });

        // Close nav when tapping outside
        document.addEventListener('touchstart', function(e) {
            if (!navSpan.contains(e.target) && navSpan.classList.contains('visible')) {
                navSpan.classList.remove('visible');
            }
        });

        console.log("✅ Mobile navigation swipe initialized");
    }

    // Highlight current section while scrolling
    initScrollSpy();
}

    /**
     * Highlight current section in navigation
     */
    function initScrollSpy() {
        const sections = document.querySelectorAll('.para h2');
        const navLinks = document.querySelectorAll('#project-nav a');
        
        if (sections.length === 0 || navLinks.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Remove active class from all links
                    navLinks.forEach(link => link.classList.remove('active'));
                    
                    // Add active class to corresponding link
                    const id = entry.target.id;
                    const activeLink = document.querySelector(`#project-nav a[href="#${id}"]`);
                    if (activeLink) {
                        activeLink.classList.add('active');
                    }
                }
            });
        }, {
            rootMargin: '-20% 0px -35% 0px',
            threshold: 0
        });

        sections.forEach(section => observer.observe(section));
        console.log("✅ Scroll spy initialized");
    }
