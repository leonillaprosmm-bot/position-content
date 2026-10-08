const body = document.body;
const glitch = document.getElementById('glitchOverlay');
const downloadBtn = document.getElementById('downloadBtn');
const logo = document.getElementById('draggableLogo');

const TOTAL = 4;
let current = 0;

body.setAttribute('data-style', current);

// ============ ЛОГОТИП: клик = стиль, удержание = перетаскивание ============
let logoX = 100, logoY = 100;
let logoScale = 1;
let dragging = false;
let holding = false;
let holdTimer = null;
let startX = 0, startY = 0;
let moved = false;

logo.style.left = logoX + 'px';
logo.style.top  = logoY + 'px';
logo.style.transform = `scale(${logoScale})`;
logo.style.transformOrigin = 'top left';

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

    // Через 250мс удержания — включаем режим перетаскивания
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
    const dx = p.clientX - startX - logoX;
    const dy = p.clientY - startY - logoY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;

    if (dragging) {
        logoX = p.clientX - startX;
        logoY = p.clientY - startY;

        const maxX = window.innerWidth - logo.offsetWidth * logoScale;
        const maxY = window.innerHeight - logo.offsetHeight * logoScale;
        logoX = Math.max(0, Math.min(logoX, maxX));
        logoY = Math.max(0, Math.min(logoY, maxY));

        logo.style.left = logoX + 'px';
        logo.style.top  = logoY + 'px';
        e.preventDefault();
    }
}

function endPress(e) {
    clearTimeout(holdTimer);
    holding = false;

    if (dragging) {
        dragging = false;
        logo.classList.remove('dragging');
    } else if (!moved) {
        // Это был клик — меняем стиль
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
    const poster = document.getElementById('poster');

    // Прячем только кнопку скачивания
    downloadBtn.style.display = 'none';

    // Запоминаем состояние логотипа
    const logoOriginalPos = logo.style.position;

    try {
        // Даём браузеру отрисовать
        await new Promise(r => setTimeout(r, 50));

        const canvas = await html2canvas(poster, {
            backgroundColor: '#050508',
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            // Включаем и fixed-элементы (логотип)
            onclone: (clonedDoc) => {
                const clonedLogo = clonedDoc.getElementById('draggableLogo');
                if (clonedLogo) {
                    // Переносим позицию и трансформацию в клон
                    clonedLogo.style.left = logoX + 'px';
                    clonedLogo.style.top  = logoY + 'px';
                    clonedLogo.style.transform = `scale(${logoScale})`;
                    clonedLogo.style.position = 'absolute';
                    clonedLogo.style.zIndex = '99999';
                }
            }
        });

        // Обрезаем/масштабируем ровно в 3:4 (1080×1440)
        const targetW = 1080;
        const targetH = 1440;
        const out = document.createElement('canvas');
        out.width = targetW;
        out.height = targetH;
        const ctx = out.getContext('2d');

        // Вписываем по принципу "cover" (заполняем, обрезая лишнее)
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
        downloadBtn.style.display = '';
    }
});
