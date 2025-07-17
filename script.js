const imageInput = document.getElementById('imageInput');
const originalCanvas = document.getElementById('originalCanvas');
const encryptedCanvas = document.getElementById('encryptedCanvas');
const encryptBtn = document.getElementById('encryptBtn');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const paramInput = document.getElementById('paramInput');
const paramValue = document.getElementById('paramValue');
const operationRadios = document.getElementsByName('operation');
const decryptBtn = document.getElementById('decryptBtn');
const decryptedCanvas = document.getElementById('decryptedCanvas');
const fileLabelText = document.getElementById('fileLabelText');

let originalImage = null;
let encryptedImageData = null;
let decryptedImageData = null;

function showParamInput() {
    const op = getSelectedOperation();
    paramInput.style.display = (op === 'add' || op === 'multiply') ? 'block' : 'none';
}

function getSelectedOperation() {
    for (let radio of operationRadios) {
        if (radio.checked) return radio.value;
    }
    return 'swap';
}

for (let radio of operationRadios) {
    radio.addEventListener('change', showParamInput);
}

imageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    fileLabelText.textContent = file.name;
    const reader = new FileReader();
    reader.onload = function(evt) {
        const img = new Image();
        img.onload = function() {
            originalCanvas.width = img.width;
            originalCanvas.height = img.height;
            encryptedCanvas.width = img.width;
            encryptedCanvas.height = img.height;
            decryptedCanvas.width = img.width;
            decryptedCanvas.height = img.height;
            const ctx = originalCanvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            originalImage = img;
        };
        img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
});

encryptBtn.addEventListener('click', function() {
    if (!originalImage) {
        alert('Please upload an image first.');
        return;
    }
    const op = getSelectedOperation();
    const ctx = originalCanvas.getContext('2d');
    const width = originalCanvas.width;
    const height = originalCanvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    let data = imageData.data;
    let newData = new Uint8ClampedArray(data);
    if (op === 'swap') {
        // Reverse all pixels
        for (let i = 0, j = data.length - 4; i < j; i += 4, j -= 4) {
            for (let k = 0; k < 4; k++) {
                let temp = newData[i + k];
                newData[i + k] = newData[j + k];
                newData[j + k] = temp;
            }
        }
    } else if (op === 'add') {
        let val = parseInt(paramValue.value) || 0;
        for (let i = 0; i < data.length; i += 4) {
            newData[i] = (data[i] + val) % 256;     // R
            newData[i + 1] = (data[i + 1] + val) % 256; // G
            newData[i + 2] = (data[i + 2] + val) % 256; // B
            // Alpha unchanged
        }
    } else if (op === 'multiply') {
        let val = parseFloat(paramValue.value) || 1;
        for (let i = 0; i < data.length; i += 4) {
            newData[i] = Math.min(255, Math.round(data[i] * val));     // R
            newData[i + 1] = Math.min(255, Math.round(data[i + 1] * val)); // G
            newData[i + 2] = Math.min(255, Math.round(data[i + 2] * val)); // B
            // Alpha unchanged
        }
    }
    const encCtx = encryptedCanvas.getContext('2d');
    const newImageData = new ImageData(newData, width, height);
    encCtx.putImageData(newImageData, 0, 0);
    encryptedImageData = newImageData;
    downloadBtn.disabled = false;
});

decryptBtn.addEventListener('click', function() {
    if (!encryptedImageData) {
        alert('Please encrypt an image first.');
        return;
    }
    const op = getSelectedOperation();
    const width = encryptedCanvas.width;
    const height = encryptedCanvas.height;
    const data = encryptedCanvas.getContext('2d').getImageData(0, 0, width, height).data;
    let newData = new Uint8ClampedArray(data);
    if (op === 'swap') {
        // Reverse again to restore original
        for (let i = 0, j = data.length - 4; i < j; i += 4, j -= 4) {
            for (let k = 0; k < 4; k++) {
                let temp = newData[i + k];
                newData[i + k] = newData[j + k];
                newData[j + k] = temp;
            }
        }
    } else if (op === 'add') {
        let val = parseInt(paramValue.value) || 0;
        for (let i = 0; i < data.length; i += 4) {
            newData[i] = (data[i] - val + 256) % 256;     // R
            newData[i + 1] = (data[i + 1] - val + 256) % 256; // G
            newData[i + 2] = (data[i + 2] - val + 256) % 256; // B
            // Alpha unchanged
        }
    } else if (op === 'multiply') {
        let val = parseFloat(paramValue.value) || 1;
        if (val === 0) {
            alert('Cannot decrypt with multiply value 0.');
            return;
        }
        for (let i = 0; i < data.length; i += 4) {
            newData[i] = Math.min(255, Math.round(data[i] / val));     // R
            newData[i + 1] = Math.min(255, Math.round(data[i + 1] / val)); // G
            newData[i + 2] = Math.min(255, Math.round(data[i + 2] / val)); // B
            // Alpha unchanged
        }
    }
    const decCtx = decryptedCanvas.getContext('2d');
    decryptedCanvas.width = width;
    decryptedCanvas.height = height;
    const newImageData = new ImageData(newData, width, height);
    decCtx.putImageData(newImageData, 0, 0);
    decryptedImageData = newImageData;
});

downloadBtn.addEventListener('click', function() {
    if (!encryptedImageData) return;
    const link = document.createElement('a');
    link.download = 'encrypted-image.png';
    link.href = encryptedCanvas.toDataURL();
    link.click();
});

resetBtn.addEventListener('click', function() {
    originalCanvas.getContext('2d').clearRect(0, 0, originalCanvas.width, originalCanvas.height);
    encryptedCanvas.getContext('2d').clearRect(0, 0, encryptedCanvas.width, encryptedCanvas.height);
    decryptedCanvas.getContext('2d').clearRect(0, 0, decryptedCanvas.width, decryptedCanvas.height);
    imageInput.value = '';
    fileLabelText.textContent = 'Choose an image';
    encryptedImageData = null;
    decryptedImageData = null;
    originalImage = null;
    downloadBtn.disabled = true;
});

// Show param input if needed on load
showParamInput(); 