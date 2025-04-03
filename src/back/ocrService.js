export const processImage = async (imageFile) => {
    if (!imageFile) {
        throw new Error('Файл не вказано');
    }

    try {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const response = await fetch('https://957e54ca-4695-4065-8011-b8bbd35a9e3c-00-2hhhgfzdaqjcc.spock.replit.dev/api/v1/ocr', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Помилка при завантаженні файлу на сервер');
        }

        const data = await response.json();
        
        console.log('Розпізнаний текст:', data.text);
        return data.text;  // Повертаємо розпізнаний текст
    } catch (error) {
        console.error('OCR processing error:', error);
        throw new Error('Не вдалося розпізнати текст');
    }
};
