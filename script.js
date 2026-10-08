// ==== Скачивание афиши 3:4 ====
const downloadBtn = document.getElementById('downloadBtn');

downloadBtn.addEventListener('click', async () => {
    const poster = document.getElementById('poster');
    const styleBtn = document.getElementById('styleBtn');
    const downloadBtnEl = document.getElementById('downloadBtn');

    // Прячем элементы управления на время скриншота
    styleBtn.style.display = 'none';
    downloadBtnEl.style.display = 'none';

    try {
        const canvas = await html2canvas(poster, {
            backgroundColor: null,
            scale: 2,
            useCORS: true,
            allowTaint: true,
            width: poster.offsetWidth,
            height: poster.offsetHeight
        });

        // Обрезаем/масштабируем в 3:4
        const targetW = 1080;
        const targetH = 1440;
        const out = document.createElement('canvas');
        out.width = targetW;
        out.height = targetH;
        const ctx = out.getContext('2d');
        ctx.drawImage(canvas, 0, 0, targetW, targetH);

        const link = document.createElement('a');
        link.download = 'afisha-3x4.png';
        link.href = out.toDataURL('image/png');
        link.click();
    } catch (e) {
        console.error('Ошибка скачивания:', e);
        alert('Не получилось скачать. Попробуй ещё раз.');
    } finally {
        styleBtn.style.display = '';
        downloadBtnEl.style.display = '';
    }
});

// ==== Перетаскивание логотипа ====
const logo = document.getElementById('draggableLogo');
let isDragging = false;
let offsetX = 0, offsetY = 0;

function startDrag(e) {
    isDragging = true;
    const rect = logo.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    offsetX = point.clientX - rect.left;
    offsetY = point.clientY - rect.top;
    logo.style.cursor = 'grabbing';
}

function moveDrag(e) {
    if (!isDragging) return;
    e.preventDefault();
    const point = e.touches ? e.touches[0] : e;
    logo.style.left = (point.clientX - offsetX) + 'px';
    logo.style.top  = (point.clientY - offsetY) + 'px';
    logo.style.transform = 'none';
}

function endDrag() {
    isDragging = false;
    logo.style.cursor = 'grab';
}

logo.addEventListener('mousedown', startDrag);
document.addEventListener('mousemove', moveDrag);
document.addEventListener('mouseup', endDrag);

logo.addEventListener('touchstart', startDrag, { passive: false });
document.addEventListener('touchmove', moveDrag, { passive: false });
document.addEventListener('touchend', endDrag);
