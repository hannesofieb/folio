document.addEventListener('DOMContentLoaded', () => {
    const words = ['none','UX design', 'UI design', 'Service Design', 'Creative Coding', 'Conceptual Branding'];
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
            text = currentWord.substring(0, text.length - 1);
        } else {
            text = currentWord.substring(0, text.length + 1);
        }

        element.textContent = text;

        if (!isDeleting && text === currentWord) {
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
