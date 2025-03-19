import Tesseract from 'tesseract.js';


export const processImage = async (imageFile, language = 'ukr') => {
    if (!imageFile) {
        throw new Error('Файл не вказано');
    }

    try {
        const { data } = await Tesseract.recognize(
            imageFile,
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