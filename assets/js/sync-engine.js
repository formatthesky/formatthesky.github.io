/**
 * SYNC ENGINE v1.0
 * Part of the "Sync with the Signal" engagement campaign.
 * Handles client-side image processing for "Digital Erasure" effects.
 */

const COLORS = {
    cyan: { r: 0, g: 255, b: 255 },
    magenta: { r: 255, g: 0, b: 255 },
    white: { r: 255, g: 255, b: 255 }
};

async function processSync(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const result = applyEffect(img);
                resolve(result);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function applyEffect(img) {
    const size = Math.min(img.width, img.height, 1024);
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // 1. CENTER CROP
    const offsetX = (img.width - size) / 2;
    const offsetY = (img.height - size) / 2;
    ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);

    // 2. DUOTONE
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const avg = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
        data[i] = (1 - avg) * COLORS.cyan.r + avg * COLORS.magenta.r;
        data[i + 1] = (1 - avg) * COLORS.cyan.g + avg * COLORS.magenta.g;
        data[i + 2] = (1 - avg) * COLORS.cyan.b + avg * COLORS.magenta.b;
    }
    ctx.putImageData(imageData, 0, 0);

    // 3. GLITCH (Offsets)
    for (let j = 0; j < 8; j++) {
        const y = Math.random() * size;
        const h = 2 + Math.random() * 15;
        const shift = (Math.random() - 0.5) * 50;
        ctx.drawImage(canvas, 0, y, size, h, shift, y, size, h);
    }

    // 4. NEON RAIN
    ctx.strokeStyle = "rgba(0, 255, 255, 0.4)";
    ctx.lineWidth = 1;
    for (let k = 0; k < 40; k++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const len = 40 + Math.random() * 120;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + len);
        ctx.stroke();
    }

    // 5. SCANLINES
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    for (let l = 0; l < size; l += 4) {
        ctx.fillRect(0, l, size, 1);
    }

    // 6. BRANDING
    ctx.fillStyle = "white";
    ctx.font = `bold ${Math.floor(size * 0.045)}px sans-serif`;
    ctx.shadowColor = "cyan";
    ctx.shadowBlur = 10;
    ctx.fillText("SYNC COMPLETE", 40, size - 100);
    ctx.font = `bold ${Math.floor(size * 0.035)}px sans-serif`;
    ctx.fillText("FORMAT THE SKY // THE SANCTUARY", 40, size - 60);
    
    return canvas.toDataURL('image/png');
}

window.SyncEngine = { processSync };
