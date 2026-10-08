// Меняем фон body при скролле в зависимости от секции
const sections = document.querySelectorAll('.section');
const body = document.body;

function updateBackground() {
    const scrollY = window.scrollY + window.innerHeight / 2;

    sections.forEach(section => {
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;

        if (scrollY >= top && scrollY < bottom) {
            const bg = section.dataset.bg;
            body.style.backgroundColor = bg;
        }
    });
}

window.addEventListener('scroll', updateBackground);
window.addEventListener('load', updateBackground);
