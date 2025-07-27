import * as XLSX from 'xlsx';

export const processImage = async (imageFile) => {
    if (!imageFile) {
        throw new Error('Файл не вказано');
    }

    try {
        const formData = new FormData();
        formData.append('file', imageFile);

        const response = await fetch('https://5512f5d8e184.ngrok-free.app/analyze', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Помилка при завантаженні файлу на сервер');
        }

        const data = await response.json();
        console.log('Отримана відповідь від бека:', data);

        // === Виправлено: використовуємо data.table ===
        if (data.table && Array.isArray(data.table)) {
            const tableData = data.table;
            const worksheetData = [];

            for (let row of tableData) {
                if (Array.isArray(row.content)) {
                    worksheetData.push(row.content);
                }
            }

            if (worksheetData.length === 0) {
                throw new Error('Таблиця не містить жодного рядка.');
            }

            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Розпізнані дані');
            XLSX.writeFile(workbook, 'розпізнані_дані.xlsx');

            console.log('✅ Excel-файл створено.');
            return 'Файл Excel успішно створено та завантажено.';
        } else {
            console.warn('❗ Відповідь не містить таблиці.');
            return 'Відповідь не містить таблиці або має помилки які викликають помилку генерації.\nВідповідь сервера:'+data;
        }

    } catch (error) {
        console.error('❌ Помилка обробки:', error);
        throw new Error('Не вдалося створити Excel-файл.');
    }
};
