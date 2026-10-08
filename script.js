const sections = document.querySelectorAll('.section');
const body = document.body;

function updateBackground() {
    const center = window.scrollY + window.innerHeight / 2;

    sections.forEach(section => {
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;

        if (center >= top && center < bottom) {
            const bg = section.dataset.bg;
            if (body.style.backgroundColor !== bg) {
                body.style.backgroundColor = bg;
            }
        }
    });
}

window.addEventListener('scroll', updateBackground, { passive: true });
window.addEventListener('load', updateBackground);
