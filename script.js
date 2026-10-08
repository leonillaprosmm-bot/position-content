const sections = document.querySelectorAll('.section');
const body = document.body;

function updateBackground() {
    const scrollY = window.scrollY + window.innerHeight / 2;

    sections.forEach(section => {
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;

        if (scrollY >= top && scrollY < bottom) {
            body.style.backgroundColor = section.dataset.bg;
        }
    });
}

window.addEventListener('scroll', updateBackground);
window.addEventListener('load', updateBackground);
