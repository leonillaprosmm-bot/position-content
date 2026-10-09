const body = document.body;
const glitch = document.getElementById('glitchOverlay');
const downloadBtn = document.getElementById('downloadBtn');
const logo = document.getElementById('draggableLogo');
const poster = document.getElementById('poster');

const TOTAL = 4;
let current = 0;

body.setAttribute('data-style', current);

// ============ ЛОГОТИП: клик = стиль, удержание = перетаскивание ============
let logoX = 0, logoY = 0;
let logoScale = 1;
let dragging = false;
let holding = false;
let holdTimer = null;
let startX = 0, startY = 0;
let moved = false;

function applyLogoTransform() {
    logo.style.left = logoX + 'px';
    logo.style.top  = logoY + 'px';
    logo.style.transform = `scale(${logoScale})`;
    logo.style.transformOrigin = 'top left';
}

window.addEventListener('load', () => {
    const rect = poster.getBoundingClientRect();
    logoX = rect.width * 0.08;
    logoY = rect.height * 0.10;
    applyLogoTransform();
});

function getPoint(e) {
    return e.touches ? e.touches[0] : e;
}

function startPress(e) {
    if (e.touches && e.touches.length === 2) return;
    const p = getPoint(e);
    startX = p.clientX - logoX;
    startY = p.clientY - logoY;
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
    const curX = p.clientX - startX;
    const curY = p.clientY - startY;
    if (Math.abs(curX - logoX) > 3 || Math.abs(curY - logoY) > 3) moved = true;

    if (dragging) {
        const posterRect = poster.getBoundingClientRect();
        logoX = curX - posterRect.left;
        logoY = curY - posterRect.top;

        const maxX = posterRect.width - logo.offsetWidth * logoScale;
        const maxY = posterRect.height - logo.offsetHeight * logoScale;
        logoX = Math.max(0, Math.min(logoX, maxX));
        logoY = Math.max(0, Math.min(logoY, maxY));

        logo.style.left = logoX + 'px';
        logo.style.top  = logoY + 'px';
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

// ============ Скачивание 3:4 — с гарантированным логотипом ============
downloadBtn.addEventListener('click', async () => {
    downloadBtn.style.display = 'none';

    try {
        await new Promise(r => setTimeout(r, 50));

        // Скриним только .poster
        const canvas = await html2canvas(poster, {
            backgroundColor: null,
            scale: 3,
            useCORS: true,
            allowTaint: true,
            logging: false
        });

        // Финальный холст 1080×1440
        const targetW = 1080;
        const targetH = 1440;
        const out = document.createElement('canvas');
        out.width = targetW;
        out.height = targetH;
        const ctx = out.getContext('2d');

        ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, targetW, targetH);

        // === РИСУЕМ ЛОГОТИП ВРУЧНУЮ ПОВЕРХ ===
        try {
            const posterRect = poster.getBoundingClientRect();

            // Пересчёт позиции в координаты финального холста
            const scaleFactorX = targetW / posterRect.width;
            const scaleFactorY = targetH / posterRect.height;

            const logoRect = logo.getBoundingClientRect();

            // Позиция логотипа относительно афиши
            const relX = logoRect.left - posterRect.left;
            const relY = logoRect.top  - posterRect.top;
            const relW = logoRect.width;
            const relH = logoRect.height;

            // В координатах финального холста
            const drawX = relX * scaleFactorX;
            const drawY = relY * scaleFactorY;
            const drawW = relW * scaleFactorX;
            const drawH = relH * scaleFactorY;

            // Грузим логотип как Image (через blob, чтобы обойти CORS в canvas)
            const logoImg = await loadImageAsBlob(logo.src);
            ctx.drawImage(logoImg, drawX, drawY, drawW, drawH);
        } catch (logoErr) {
            console.warn('Не удалось нарисовать логотип:', logoErr);
        }

        // Скачиваем
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

// === Загрузка картинки через blob (обход CORS) ===
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
