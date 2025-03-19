import Tesseract from 'tesseract.js';


export const processImage = async (imageFile) => {
    if (!imageFile) {
        throw new Error('Файл не вказано');
    }

    try {
        const { data } = await Tesseract.recognize(
            imageFile,
            'ukr',
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