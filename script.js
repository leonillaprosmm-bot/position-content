const body = document.body;
const styleBtn = document.getElementById('styleBtn');
const styleNum = document.getElementById('styleNum');
const glitch = document.getElementById('glitchOverlay');

const TOTAL = 4;
let current = 0;

body.setAttribute('data-style', current);
styleNum.textContent = String(current + 1).padStart(2, '0');

styleBtn.addEventListener('click', () => {
    current = (current + 1) % TOTAL;
    body.setAttribute('data-style', current);
    styleNum.textContent = String(current + 1).padStart(2, '0');

    // Глитч-вспышка при смене
    glitch.classList.add('active');
    setTimeout(() => glitch.classList.remove('active'), 180);

    // Микро-подпрыгивание заголовка
    const title = document.querySelector('.title');
    title.style.transform = 'translateY(-6px) scale(1.03)';
    setTimeout(() => {
        title.style.transform = 'translateY(0) scale(1)';
    }, 250);
});
