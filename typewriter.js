document.addEventListener('DOMContentLoaded', () => {
    const words = [
        { text: 'none', color: 'var(--black)' },
        { text: 'UX design', color: 'var(--red)' },
        { text: 'UI design', color: 'var(--pink)' },
        { text: 'Service Design', color: 'var(--green)' },
        { text: 'Creative Coding', color: 'var(--blue)' },
        { text: 'Conceptual Branding', color: 'var(--yellow)' }
    ];
    let currentWordIndex = 0;
    let isDeleting = false;
    let text = '';
    const speed = 200;
    const pause = 2000;
    const element = document.getElementById('title-change');
    const cursor = document.createElement('span');
    cursor.classList.add('cursor');
    cursor.textContent = '|';
    element.parentNode.appendChild(cursor);

    function type() {
        const currentWord = words[currentWordIndex];
        if (isDeleting) {
            text = currentWord.text.substring(0, text.length - 1);
        } else {
            text = currentWord.text.substring(0, text.length + 1);
        }

        element.textContent = text;
        element.style.color = currentWord.color;
        cursor.style.color = currentWord.color;

        if (!isDeleting && text === currentWord.text) {
            setTimeout(() => {
                isDeleting = true;
                type();
            }, pause);
        } else if (isDeleting && text === '') {
            isDeleting = false;
            currentWordIndex = (currentWordIndex + 1) % words.length;
            type();
        } else {
            setTimeout(type, speed);
        }
    }

    type();
});
