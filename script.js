const body = document.body;
const glitch = document.getElementById('glitchOverlay');
const downloadBtn = document.getElementById('downloadBtn');
const logo = document.getElementById('draggableLogo');
const poster = document.getElementById('poster');

const TOTAL = 4;
let current = 0;

body.setAttribute('data-style', current);

// ============ ЛОГОТИП — по всему экрану ============
let logoX = 0, logoY = 0;
let logoScale = 1;
let dragging = false;
let holding = false;
let holdTimer = null;
let startMouseX = 0, startMouseY = 0;
let startLogoX = 0, startLogoY = 0;
let moved = false;

function applyLogoTransform() {
    logo.style.left = logoX + 'px';
    logo.style.top  = logoY + 'px';
    logo.style.transform = `scale(${logoScale})`;
    logo.style.transformOrigin = 'top left';
}

window.addEventListener('load', () => {
    logoX = window.innerWidth * 0.08;
    logoY = window.innerHeight * 0.10;
    applyLogoTransform();
});

function getPoint(e) {
    return e.touches ? e.touches[0] : e;
}

function startPress(e) {
    if (e.touches && e.touches.length === 2) return;
    const p = getPoint(e);

    startMouseX = p.clientX;
    startMouseY = p.clientY;
    startLogoX = logoX;
    startLogoY = logoY;

    moved = false;
    holding = true;

    holdTimer = setTimeout(() => {
        if (holding) {
            dragging = true;
            logo.classList.add('dragging');
            if (navigator.vibrate) navigator.vibrate(30);
        }
    }, 250);
}

function movePress(e) {
    const p = getPoint(e);
    const dx = p.clientX - startMouseX;
    const dy = p.clientY - startMouseY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;

    if (dragging) {
        let newX = startLogoX + dx;
        let newY = startLogoY + dy;

        const logoW = logo.offsetWidth * logoScale;
        const logoH = logo.offsetHeight * logoScale;

        const maxX = window.innerWidth - logoW;
        const maxY = window.innerHeight - logoH;

        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        logoX = newX;
        logoY = newY;
        applyLogoTransform();
        e.preventDefault();
    }
}

function endPress() {
    clearTimeout(holdTimer);
    holding = false;

    if (dragging) {
        dragging = false;
        logo.classList.remove('dragging');
    } else if (!moved) {
        changeStyle();
    }
}

logo.addEventListener('mousedown', startPress);
document.addEventListener('mousemove', movePress);
document.addEventListener('mouseup', endPress);

logo.addEventListener('touchstart', startPress, { passive: true });
document.addEventListener('touchmove', movePress, { passive: false });
document.addEventListener('touchend', endPress);

// Зум колесом
logo.addEventListener('wheel', (e) => {
    e.preventDefault();
    logoScale += e.deltaY > 0 ? -0.08 : 0.08;
    logoScale = Math.max(0.3, Math.min(3, logoScale));
    logo.style.transform = `scale(${logoScale})`;
}, { passive: false });

// Пинч-зум
let pinchStartDist = 0;
let pinchStartScale = 1;

logo.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
        dragging = false;
        holding = false;
        clearTimeout(holdTimer);
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchStartDist = Math.hypot(dx, dy);
        pinchStartScale = logoScale;
    }
}, { passive: true });

logo.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        logoScale = pinchStartScale * (dist / pinchStartDist);
        logoScale = Math.max(0.3, Math.min(3, logoScale));
        logo.style.transform = `scale(${logoScale})`;
    }
}, { passive: false });

// ============ Смена стиля ============
function changeStyle() {
    current = (current + 1) % TOTAL;
    body.setAttribute('data-style', current);

    glitch.classList.add('active');
    setTimeout(() => glitch.classList.remove('active'), 180);

    const title = document.querySelector('.title');
    title.style.transform = 'translateY(-6px) scale(1.03)';
    setTimeout(() => { title.style.transform = ''; }, 250);
}

// ============ Скачивание 3:4 ============
downloadBtn.addEventListener('click', async () => {
    downloadBtn.style.display = 'none';

    try {
        await new Promise(r => setTimeout(r, 50));

        const canvas = await html2canvas(poster, {
            backgroundColor: null,
            scale: 3,
            useCORS: true,
            allowTaint: true,
            logging: false
        });

        const targetW = 1080;
        const targetH = 1440;
        const out = document.createElement('canvas');
        out.width = targetW;
        out.height = targetH;
        const ctx = out.getContext('2d');

        ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, targetW, targetH);

        // Рисуем логотип поверх (если он в пределах афиши)
        try {
            const posterRect = poster.getBoundingClientRect();
            const scaleX = targetW / posterRect.width;
            const scaleY = targetH / posterRect.height;

            const logoRect = logo.getBoundingClientRect();
            const relX = logoRect.left - posterRect.left;
            const relY = logoRect.top  - posterRect.top;

            const drawX = relX * scaleX;
            const drawY = relY * scaleY;
            const drawW = logoRect.width  * scaleX;
            const drawH = logoRect.height * scaleY;

            const logoImg = await loadImageAsBlob(logo.src);
            ctx.drawImage(logoImg, drawX, drawY, drawW, drawH);
        } catch (logoErr) {
            console.warn('Логотип не попал:', logoErr);
        }

        const link = document.createElement('a');
        link.download = 'afisha-3x4.png';
        link.href = out.toDataURL('image/png');
        link.click();
    } catch (e) {
        console.error('Ошибка:', e);
        alert('Не получилось скачать. Попробуй ещё раз.');
    } finally {
        downloadBtn.style.display = '';
    }
});

async function loadImageAsBlob(url) {
    const res = await fetch(url, { mode: 'cors' });
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(blobUrl);
            resolve(img);
        };
        img.onerror = reject;
        img.src = blobUrl;
    });
}
