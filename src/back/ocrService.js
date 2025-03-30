import Tesseract from 'tesseract.js';

export const processImage = async (imageFile, language) => {
    if (!imageFile) {
        throw new Error('Файл не вказано');
    }

    try {
        const worker = await Tesseract.createWorker(language, {
            langPath: 'http://localhost:3000/tessdata',
            cacheMethod: 'none',
          });

        const { data } = await worker.recognize(imageFile);
        await worker.terminate();
        console.log('Розпізнаний текст:', data.text);
        return data.text;
    } catch (error) {
        console.error('OCR processing error:', error);
        throw new Error('Не вдалося розпізнати текст');
    }
};
