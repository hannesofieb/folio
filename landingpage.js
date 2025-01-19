document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.getElementById('cursor');
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
});
