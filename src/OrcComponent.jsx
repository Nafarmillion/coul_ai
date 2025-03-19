import React, { useState } from 'react';
import './OrcComponent.css';
import Tesseract from 'tesseract.js';


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
            const { data } = await Tesseract.recognize(
                file,
                'ukr',
                {
                    logger: (m) => console.log(m),
                }
            );
            setRecognizedText(data.text);
        } catch (err) {
            setError(`Помилка: ${err.message}`);
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
            {/* ТУТ */}
            <h1>Розпізнавання тексту з зображення</h1>

            {/* ТУТ */}
            <form className='container'onSubmit={handleSubmit}>
                {/* ТУТ */}
                <div>
                    {/* ТУТ */}
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
                    // ТУТ
                    <div>
                        {/* Может и тут... */}
                        <img src={previewUrl} alt="Preview" />
                    </div>
                )}

                {/* Может и нет... */}
                <button className='upload-btn'
                        type="submit"
                        disabled={isLoading || !file}>
                    {isLoading ? 'Обробка...' : 'Розпізнати текст'}
                </button>
            </form>

            {/* :) */}
            {error && <div className="error-message">{error}</div>}

            {recognizedText && (
                // Точно?
                <div>
                    {/* Уверена? */}
                    <div>
                        <h3>Розпізнаний текст:</h3>
                        {/* ^_^ */}
                        <button onClick={copyToClipboard}>
                            Копіювати
                        </button>
                    </div>
                    {/* xixixaxa */}
                    <div>{recognizedText}</div>
                </div>
            )}
        </div>
    );
};

export default OcrComponent;
