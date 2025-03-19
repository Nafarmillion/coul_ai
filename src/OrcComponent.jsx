import React, {useState} from 'react';
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
            const {data} = await Tesseract.recognize(
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
        <div className="main-wrapper">


            <div className="main-content">
                <h1 className="page-title">Розпізнавання рукописного тексту</h1>

                <div className="content-container">
                    <div className="left-panel">
                        <h2 className="text-box-title">Виберіть зображення</h2>
                        <form className='upload-form' onSubmit={handleSubmit}>
                            <div className="upload-area">
                                {previewUrl ? (
                                    <div className="preview-container">
                                        <img src={previewUrl} alt="Preview" className="image-preview"/>
                                    </div>
                                ) : (
                                    <div className="upload-placeholder">
                                        <label htmlFor="imageFile" className="file-label">
                                            Натисніть, щоб вибрати файл
                                            <input
                                                type="file"
                                                id="imageFile"
                                                className="file-input"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                    </div>
                                )}
                            </div>
                            <button className='button'
                                    type="submit"
                                    disabled={isLoading || !file}>
                                {isLoading ? 'Обробка...' : 'Завантажити'}
                            </button>
                        </form>

                        {error && <div className="error-message">{error}</div>}
                    </div>

                    <div className="right-panel">
                        <h2 className="text-box-title">Результат аналізу</h2>
                        <div className="text-box">
                            {isLoading ? (
                                <div className="loading-indicator">Обробка зображення...</div>
                            ) : recognizedText ? (
                                <div className="recognized-text-content">{recognizedText}</div>
                            ) : (
                                <div className="placeholder-text">
                                    Тут з'явиться розпізнаний текст після завантаження та обробки зображення
                                </div>
                            )}
                        </div>

                        {recognizedText && (
                            <button className="button-copy-button" onClick={copyToClipboard}>
                                Копіювати текст
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OcrComponent;