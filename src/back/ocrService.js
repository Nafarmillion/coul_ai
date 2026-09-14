import * as XLSX from 'xlsx';

export const processImage = async (imageFile) => {
    if (!imageFile) {
        throw new Error('Файл не вказано');
    }

    try {
        const formData = new FormData();

        // Наш API очікує саме поле image
        formData.append('image', imageFile);

        // Якщо потрібен український OCR
        formData.append('language', 'uk');

        // Якщо код працює на тому самому домені:
        const apiUrl = 'https://957e54ca-4695-4065-8011-b8bbd35a9e3c-00-2hhhgfzdaqjcc.spock.replit.dev/api/v1/ocr';

        // Якщо код працює в окремому застосунку,
        // замініть apiUrl на повну адресу нашого сервера:
        // const apiUrl = 'https://адреса-нашого-сервера/api/v1/ocr';

        const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || 'Помилка при розпізнаванні файлу'
            );
        }

        if (typeof data.text !== 'string' || !data.text.trim()) {
            throw new Error('Сервер не повернув розпізнаний текст');
        }

        // Кожен рядок OCR-тексту буде окремим рядком Excel
        const worksheetData = data.text
            .split(/\r?\n/)
            .filter(line => line.trim() !== '')
            .map(line => [line]);

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            'Розпізнані дані'
        );

        XLSX.writeFile(workbook, 'розпізнані_дані.xlsx');

        return 'Файл Excel успішно створено та завантажено.';
    } catch (error) {
        console.error('Помилка обробки:', error);
        throw new Error(
            error.message || 'Не вдалося створити Excel-файл.'
        );
    }
};
