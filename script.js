const body = document.body;
const styleToggle = document.getElementById('style-toggle');
const TOTAL_STYLES = 4;

let currentStyle = 0;

// Ставим начальный стиль
body.setAttribute('data-style', currentStyle);

styleToggle.addEventListener('click', () => {
    currentStyle = (currentStyle + 1) % TOTAL_STYLES;
    body.setAttribute('data-style', currentStyle);

    // Микро-анимация нажатия на контент
    const title = document.querySelector('.poster-title');
    title.style.transform = 'scale(1.05)';
    setTimeout(() => {
        title.style.transform = 'scale(1)';
    }, 200);
});
