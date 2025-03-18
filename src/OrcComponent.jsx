import React, { useState } from 'react';
import axios from 'axios';


const OcrComponent = () => {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [recognizedText, setRecognizedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);

            // Створення превью зображення
            const fileReader = new FileReader();
            fileReader.onload = () => {
                setPreviewUrl(fileReader.result);
            };
            fileReader.readAsDataURL(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Будь ласка, виберіть файл');
            return;
        }

        setIsLoading(true);
        setError('');
        setRecognizedText('');

        try {
            const formData = new FormData();
            formData.append('imageFile', file);

            const response = await axios.post('http://localhost:8080/api/ocr/recognize', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setRecognizedText(response.data.text);
        } catch (err) {
            setError(`Помилка: ${err.response?.data || err.message}`);
            console.error('Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(recognizedText)
            .then(() => {
                alert('Текст скопійовано до буфера обміну!');
            })
            .catch(err => {
                console.error('Не вдалося скопіювати: ', err);
            });
    };

    return (
        <div>
            <h2>Розпізнавання тексту з зображення</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="imageFile">
                        {previewUrl ? 'Змінити зображення' : 'Виберіть зображення'}
                        <input
                            type="file"
                            id="imageFile"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </label>
                </div>

                {previewUrl && (
                    <div>
                        <img src={previewUrl} alt="Preview" />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading || !file}>
                    {isLoading ? 'Обробка...' : 'Розпізнати текст'}
                </button>
            </form>

            {error && <div>{error}</div>}

            {recognizedText && (
                <div>
                    <div>
                        <h3>Розпізнаний текст:</h3>
                        <button onClick={copyToClipboard}>
                            Копіювати
                        </button>
                    </div>
                    <div>{recognizedText}</div>
                </div>
            )}
        </div>
    );
};

export default OcrComponent;