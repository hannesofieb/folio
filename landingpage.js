document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.getElementById('cursor');
    const workArchive = document.getElementById('work-archive');
    const coverImage = document.querySelector('#cover img');
    const introBio = document.getElementById('intro-bio');
    const colors = ['var(--black)', 'var(--red)', 'var(--pink)', 'var(--green)','var(--white)', 'var(--yellow)', 'var(--blue)', 'var(--yellow-buttermilk)', 'var(----green-olive)', 'var(--blue-light)'];
    let colorIndex = 0;

    // Track mouse movement
    document.addEventListener('mousemove', (event) => {
        cursor.style.left = `${event.pageX}px`;
        cursor.style.top = `${event.pageY}px`;
    });

    // Show custom cursor on hover over #cover img
    coverImage.addEventListener('mouseenter', () => {
        cursor.classList.add('show');
        colorIndex = (colorIndex + 1) % colors.length;
        cursor.style.color = colors[colorIndex];
        cursor.textContent = 'move me around';
    });

    // Hide custom cursor when not hovering
    coverImage.addEventListener('mouseleave', () => {
        cursor.classList.remove('show');
    });


    // Change cursor color when hovering over #work-archive
    workArchive.addEventListener('mouseenter', () => {
        cursor.classList.add('table-show');  // Add class
        cursor.style.color = 'var(--black)'; // Force cursor color to black
    });

    workArchive.addEventListener('mouseleave', () => {
        cursor.classList.remove('table-show'); // Remove class
    });

    // Show custom cursor on hover over .milestone if screen width is larger than 600px
    const milestones = document.querySelectorAll('.milestone');
    milestones.forEach(milestone => {
        milestone.addEventListener('mouseenter', () => {
            if (window.innerWidth > 600) {
                cursor.classList.add('show');
                cursor.style.color = colors[4];
                cursor.textContent = 'expand \u2197'; // Add the glyph U+2197 at the end of 'expand'
                console.log(`Font used for cursor: ${window.getComputedStyle(cursor).fontFamily}`);
            } else {
                milestone.style.cursor = 'pointer';
            }
        });

        milestone.addEventListener('mouseleave', () => {
            if (window.innerWidth > 600) {
                cursor.classList.remove('show');
            }
        });
    });

    // Ensure the default cursor is shown when not hovering over .milestone or #cover img
    document.addEventListener('mouseleave', () => {
        cursor.classList.remove('show');
    });

    // ------------------------------------ Make the #cover img draggable
    const frame = document.querySelector('#cover .frame');
    let isDragging = false;
    let startX, startY, initialX, initialY;

    frame.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialX = frame.offsetLeft;
        initialY = frame.offsetTop;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
        if (isDragging) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            frame.style.left = `${initialX + dx}px`;
            frame.style.top = `${initialY + dy}px`;
        }
    }

    function onMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
    
    // Prevent default drag behavior on the image
    coverImage.addEventListener('dragstart', (e) => {
        e.preventDefault();
    });

    // ------------------------------------ Timeline scroll (mobile)
    const timeline = document.getElementById('timeline');
    const leftArrows = document.querySelectorAll('.left-arrow');
    const rightArrows = document.querySelectorAll('.right-arrow');
    let isDown = false;
    let startXMilestone;
    let scrollLeft;

    timeline.addEventListener('mousedown', (e) => {
        isDown = true;
        timeline.classList.add('active');
        startX = e.pageX - timeline.offsetLeft;
        scrollLeft = timeline.scrollLeft;
    });

    timeline.addEventListener('mouseleave', () => {
        isDown = false;
        timeline.classList.remove('active');
    });

    timeline.addEventListener('mouseup', () => {
        isDown = false;
        timeline.classList.remove('active');
    });

    timeline.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - timeline.offsetLeft;
        const walk = (x - startXMilestone) * 3; // Scroll-fast
        timeline.scrollLeft = scrollLeft - walk;
    });

    rightArrows.forEach(arrow => {
        arrow.addEventListener('click', () => {
            timeline.scrollBy({ left: window.innerWidth, behavior: 'smooth' });
        });
    });

    leftArrows.forEach(arrow => {
        arrow.addEventListener('click', () => {
            timeline.scrollBy({ left: -window.innerWidth, behavior: 'smooth' });
        });
    });

    // Ensure the cursor is normal in the #timeline section on mobile POV
    if (window.innerWidth <= 600) {
        timeline.style.cursor = 'pointer';
    }

    // ------------------------------------ Recommendations interaction
    const cursorLeft = document.getElementById('cursorLeft');
    const cursorRight = document.getElementById('cursorRight');
    const recommendations = document.getElementById('recommendations');
    const quotes = Array.from(recommendations.querySelectorAll('.quote'));
    const onLabel = document.getElementById('on');
    let isLooping = false; // State flag for overriding default cursor logic

    // Update cursor positions globally
    document.addEventListener('mousemove', (event) => {
        const { pageX, pageY } = event;
        cursorLeft.style.left = `${pageX}px`;
        cursorLeft.style.top = `${pageY}px`;
        cursorRight.style.left = `${pageX}px`;
        cursorRight.style.top = `${pageY}px`;
    });

    // Show the correct cursor dynamically
    recommendations.addEventListener('mousemove', (event) => {
        if (isLooping) return; // Skip cursor logic during looping

        const x = event.clientX;
        const halfPoint = window.innerWidth / 2;

        // Determine which quote is being hovered over
        const hoveredQuote = quotes.find(quote => {
            const rect = quote.getBoundingClientRect();
            return rect.left <= x && rect.right >= x;
        });

        if (hoveredQuote) {
            const index = quotes.indexOf(hoveredQuote);

            if (index === 0) {
                // First .quote child: Always show right cursor
                cursorRight.classList.add('show');
                cursorLeft.classList.remove('show');
            } else if (index === quotes.length - 1) {
                // Last .quote child: Always show left cursor
                cursorLeft.classList.add('show');
                cursorRight.classList.remove('show');
            } else {
                // Any other .quote child: Decide based on mouse position
                if (x >= halfPoint) {
                    cursorRight.classList.add('show');
                    cursorLeft.classList.remove('show');
                    console.log('Moving right');
                } else {
                    cursorLeft.classList.add('show');
                    cursorRight.classList.remove('show');
                    console.log('Moving left');
                }
            }
        } else {
            // If no quote is hovered, hide both cursors
            cursorLeft.classList.remove('show');
            cursorRight.classList.remove('show');
        }
    });

    // Hide cursors when leaving recommendations
    recommendations.addEventListener('mouseleave', () => {
        if (isLooping) return; // Skip this logic during looping
        cursorLeft.classList.remove('show');
        cursorRight.classList.remove('show');
    });

    // Update title in div#on based on visible quote
    const updateTitleInView = () => {
        const containerLeft = recommendations.scrollLeft;
        const containerWidth = recommendations.clientWidth;

        let visibleQuote = null;
        quotes.forEach((quote) => {
            const quoteLeft = quote.offsetLeft;
            const quoteRight = quoteLeft + quote.offsetWidth;

            // Check if the quote is fully visible
            if (quoteLeft >= containerLeft && quoteRight <= containerLeft + containerWidth) {
                visibleQuote = quote;
            }
        });

        // Update the title in div#on
        onLabel.textContent = visibleQuote ? visibleQuote.title || 'No Title Available' : '';
    };

    // Ensure title updates on scroll and initial load
    updateTitleInView();
    recommendations.addEventListener('scroll', updateTitleInView);

    // Interactive scrolling with looping
    recommendations.addEventListener('mousedown', (event) => {
        const halfPoint = window.innerWidth / 2;
        const x = event.clientX;
        const currentScrollPosition = recommendations.scrollLeft;
        const maxScrollPosition = recommendations.scrollWidth - recommendations.clientWidth;

        isLooping = true; // Enable override for cursor logic

        if (x >= halfPoint) {
            if (currentScrollPosition >= maxScrollPosition) {
                // Scroll to the beginning and set right cursor
                recommendations.scrollTo({ left: 0, behavior: 'smooth' });
                cursorRight.classList.add('show');
                cursorLeft.classList.remove('show');
            } else {
                recommendations.scrollBy({ left: window.innerWidth, behavior: 'smooth' });
                cursorRight.classList.add('show');
                cursorLeft.classList.remove('show');
            }
        } else {
            if (currentScrollPosition <= 0) {
                // Scroll to the end and set left cursor
                recommendations.scrollTo({ left: maxScrollPosition, behavior: 'smooth' });
                cursorLeft.classList.add('show');
                cursorRight.classList.remove('show');
            } else {
                recommendations.scrollBy({ left: -window.innerWidth, behavior: 'smooth' });
                cursorLeft.classList.add('show');
                cursorRight.classList.remove('show');
            }
        }

        // Re-enable cursor logic after scroll finishes
        setTimeout(() => {
            isLooping = false;
        }, 500);
    });

    // Auto-scrolling for small screens
    if (window.innerWidth <= 700) {
        let currentIndex = 0;

        setInterval(() => {
            currentIndex = (currentIndex + 1) % quotes.length;
            recommendations.scrollTo({
                left: quotes[currentIndex].offsetLeft,
                behavior: 'smooth'
            });
        }, 25000);
    }

    // ------------------------------------ Fade-in animation on scroll
    const fadeInElements = document.querySelectorAll('#work-archive, #cv, footer');

    // Add the 'hidden' class to all sections initially
    fadeInElements.forEach(element => {
        element.classList.add('hidden');
    });

    // Use IntersectionObserver to apply the fadeInUp animation
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fadeInUp-animation');
                entry.target.classList.remove('hidden');
                observer.unobserve(entry.target); // Stop observing once animation is applied
                console.log('Animation applied');
            }
        });
    }, {
        threshold: 0.05 // Trigger when 5% of the section is visible
    });

    // Observe each section
    fadeInElements.forEach(element => {
        observer.observe(element);
    });

});