import Tesseract from 'tesseract.js';

const pre_processImage = async (imageFile) => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            for (let i = 0; i < pixels.length; i += 4) {
                const avg = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
                pixels[i] = avg;
                pixels[i + 1] = avg;
                pixels[i + 2] = avg;
            }
            ctx.putImageData(imageData, 0, 0);

            canvas.toBlob((blob) => {         
                resolve(blob);
            }, 'image/png');
        };

        img.onerror = (error) => reject(error);
        img.src = URL.createObjectURL(imageFile);
    });
};

export const processImage = async (imageFile, language = 'ukr') => {
    if (!imageFile) {
        throw new Error('Файл не вказано');
    }

    try {
        const preprocessedImage = await pre_processImage(imageFile);
        const { data } = await Tesseract.recognize(
            preprocessedImage,
            language,
            {
                logger: (m) => console.log(m),
            }
        );

        return data.text;
    } catch (error) {
        console.error('OCR processing error:', error);
        throw new Error('Не вдалося розпізнати текст');
    }
};