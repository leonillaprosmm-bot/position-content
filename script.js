const body = document.body;
const styleBtn = document.getElementById('styleBtn');
const styleNum = document.getElementById('styleNum');
const glitch = document.getElementById('glitchOverlay');
const downloadBtn = document.getElementById('downloadBtn');
const logo = document.getElementById('draggableLogo');

const TOTAL = 4;
let current = 0;

body.setAttribute('data-style', current);
styleNum.textContent = String(current + 1).padStart(2, '0');

// ==== Смена стиля ====
styleBtn.addEventListener('click', () => {
    current = (current + 1) % TOTAL;
    body.setAttribute('data-style', current);
    styleNum.textContent = String(current + 1).padStart(2, '0');

    glitch.classList.add('active');
    setTimeout(() => glitch.classList.remove('active'), 180);

    const title = document.querySelector('.title');
    title.style.transform = 'translateY(-6px) scale(1.03)';
    setTimeout(() => { title.style.transform = ''; }, 250);
});

// ==== Скачивание 3:4 ====
downloadBtn.addEventListener('click', async () => {
    const poster = document.getElementById('poster');
    const controls = document.querySelector('.controls');
    const logoWasVisible = logo.style.display !== 'none';

    // Прячем кнопки на время скриншота (логотип оставляем!)
    controls.style.display = 'none';

    try {
        const canvas = await html2canvas(poster, {
            backgroundColor: '#050508',
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false
        });

        // Обрезаем в 3:4 (1080×1440)
        const targetW = 1080;
        const targetH = 1440;
        const out = document.createElement('canvas');
        out.width = targetW;
        out.height = targetH;
        const ctx = out.getContext('2d');

        // Центрируем по вертикали
        const srcAspect = canvas.width / canvas.height;
        const dstAspect = targetW / targetH;
        let sx = 0, sy = 0, sw = canvas.width, sh = canvas.height;
        if (srcAspect > dstAspect) {
            sw = canvas.height * dstAspect;
            sx = (canvas.width - sw) / 2;
        } else {
            sh = canvas.width / dstAspect;
            sy = (canvas.height - sh) / 2;
        }

        ctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, targetW, targetH);

        const link = document.createElement('a');
        link.download = 'afisha-3x4.png';
        link.href = out.toDataURL('image/png');
        link.click();
    } catch (e) {
        console.error('Ошибка:', e);
        alert('Не получилось скачать. Попробуй ещё раз.');
    } finally {
        controls.style.display = '';
    }
});

// ==== Перетаскивание + зум логотипа ====
let dragging = false;
let startX = 0, startY = 0;
let logoX = 100, logoY = 100;
let logoScale = 1;

// Инициализация позиции
logo.style.left = logoX + 'px';
logo.style.top  = logoY + 'px';
logo.style.transform = `scale(${logoScale})`;
logo.style.transformOrigin = 'top left';

function getPoint(e) {
    return e.touches ? e.touches[0] : e;
}

function onStart(e) {
    if (e.touches && e.touches.length === 2) return; // пинч обрабатывается отдельно
    dragging = true;
    const p = getPoint(e);
    startX = p.clientX - logoX;
    startY = p.clientY - logoY;
    logo.style.cursor = 'grabbing';
    e.preventDefault();
}

function onMove(e) {
    if (!dragging) return;
    const p = getPoint(e);
    logoX = p.clientX - startX;
    logoY = p.clientY - startY;

    // Ограничение по экрану
    const maxX = window.innerWidth - logo.offsetWidth * logoScale;
    const maxY = window.innerHeight - logo.offsetHeight * logoScale;
    logoX = Math.max(0, Math.min(logoX, maxX));
    logoY = Math.max(0, Math.min(logoY, maxY));

    logo.style.left = logoX + 'px';
    logo.style.top  = logoY + 'px';
    e.preventDefault();
}

function onEnd() {
    dragging = false;
    logo.style.cursor = 'grab';
}

logo.addEventListener('mousedown', onStart);
document.addEventListener('mousemove', onMove);
document.addEventListener('mouseup', onEnd);

logo.addEventListener('touchstart', onStart, { passive: false });
document.addEventListener('touchmove', onMove, { passive: false });
document.addEventListener('touchend', onEnd);

// ==== Зум колесом мыши ====
logo.addEventListener('wheel', (e) => {
    e.preventDefault();
    logoScale += e.deltaY > 0 ? -0.08 : 0.08;
    logoScale = Math.max(0.3, Math.min(3, logoScale));
    logo.style.transform = `scale(${logoScale})`;
}, { passive: false });

// ==== Пинч-зум на мобилке ====
let pinchStartDist = 0;
let pinchStartScale = 1;

logo.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
        dragging = false;
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
