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
        cursor.textContent = 'move me';
    });

    // Hide custom cursor when not hovering
    coverImage.addEventListener('mouseleave', () => {
        cursor.classList.remove('show');
    });

    // Show custom cursor on hover over .milestone
    const milestones = document.querySelectorAll('.milestone');
    milestones.forEach(milestone => {
        milestone.addEventListener('mouseenter', () => {
            cursor.classList.add('show');
            cursor.style.color = colors[4];
            cursor.textContent = 'expand \u2197'; // Add the glyph U+2197 at the end of 'expand'
            console.log(`Font used for cursor: ${window.getComputedStyle(cursor).fontFamily}`);
        });

        milestone.addEventListener('mouseleave', () => {
            cursor.classList.remove('show');
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

    // ------------------------------------ Placement of #intro-bio on media query change
    // Calculate the height of #cover .frame and set the top placement for #intro-bio
    function adjustIntroBioPosition() {
        const frameHeight = frame.offsetHeight;
        introBio.style.top = `${frameHeight/3 +70}px`;
    }

    // Adjust the position on load and on window resize
    window.addEventListener('load', adjustIntroBioPosition);
    window.addEventListener('resize', adjustIntroBioPosition);
    
});