import React, { useState, useRef, useEffect } from 'react';
import './OrcComponent.css';
import { processImage } from './back/ocrService';

const OcrComponent = () => {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [recognizedText, setRecognizedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);
    const [lang, setLang] = useState('ukr');
    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    const toggleTheme = () => {
        setDarkMode(!darkMode);
    };

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
            const result = await processImage(file, lang);
            setRecognizedText(result);
        } catch (err) {
            setError(`Помилка: ${err.message}`);
            console.error('Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const resetFileInput = () => {
        setFile(null);
        setPreviewUrl(null);
        setRecognizedText('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
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
        <div className="app-container">
            <header className="app-header">
                <div className="logo-container">
                    <img src="./logo.png" alt="Логотип" className="logo" />
                    <h1>Розпізнавання рукописного тексту</h1>
                    <img src="./logo.png" alt="Логотип" className="logo" />
                </div>
                <div className="theme-switch-container">
                    <span>{darkMode ? 'Темна тема' : 'Світла тема'}</span>
                    <label className="theme-switch">
                        <input
                            type="checkbox"
                            checked={darkMode}
                            onChange={toggleTheme}
                            aria-label="Перемикач теми"
                        />
                        <span className="slider"></span>
                    </label>
                </div>
            </header>

            <div className="content-wrapper">
                <div className="panel-container">
                    <div className="upload-panel">
                        <h2>Виберіть зображення</h2>
                        <form className="upload-form" onSubmit={handleSubmit}>
                            <div className="upload-area">
                                {previewUrl ? (
                                    <div className="preview-container">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="image-preview"
                                        />
                                        <button
                                            type="button"
                                            className="remove-image-btn"
                                            onClick={resetFileInput}
                                            aria-label="Видалити зображення"
                                        >
                                            &#10005;
                                        </button>
                                    </div>
                                ) : (
                                    <div className="upload-placeholder">
                                        <div className="upload-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                <polyline points="17 8 12 3 7 8"></polyline>
                                                <line x1="12" y1="3" x2="12" y2="15"></line>
                                            </svg>
                                        </div>
                                        <p>Перетягніть файл сюди або</p>
                                        <label htmlFor="imageFile" className="file-input-label">
                                            Виберіть файл
                                            <input
                                                type="file"
                                                id="imageFile"
                                                className="file-input"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                ref={fileInputRef}
                                            />
                                        </label>
                                    </div>
                                )}
                            </div>

                            <div className="language-selection">
                                <h3>Мова розпізнавання</h3>
                                <div className="language-options">
                                    <div className="language-option">
                                        <input
                                            type="radio"
                                            id="radio1"
                                            name="radioGroup"
                                            value="ukr"
                                            checked={lang === "ukr"}
                                            onChange={(e) => setLang(e.target.value)}
                                        />
                                        <label htmlFor="radio1">
                                            <span className="radio-icon"></span>
                                            <span className="radio-label">Українська</span>
                                        </label>
                                    </div>


                                    <div className="language-option">
                                        <input
                                            type="radio"
                                            id="radio2"
                                            name="radioGroup"
                                            value="eng"
                                            checked={lang === "eng"}
                                            onChange={(e) => setLang(e.target.value)}
                                        />
                                        <label htmlFor="radio2">
                                            <span className="radio-icon"></span>
                                            <span className="radio-label">Англійська</span>
                                        </label>
                                    </div>

                                    <div className="language-option">
                                        <input
                                            type="radio"
                                            id="radio3"
                                            name="radioGroup"
                                            value="ukr+eng"
                                            checked={lang === "ukr+eng"}
                                            onChange={(e) => setLang(e.target.value)}
                                        />
                                        <label htmlFor="radio3">
                                            <span className="radio-icon"></span>
                                            <span className="radio-label">Українська + Англійська</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="button-group">
                                <button
                                    className="primary-button"
                                    type="submit"
                                    disabled={isLoading || !file}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="loading-spinner"></span>
                                            Обробка...
                                        </>
                                    ) : 'Розпізнати текст'}
                                </button>
                                {file && (
                                    <button
                                        className="secondary-button"
                                        type="button"
                                        onClick={resetFileInput}
                                    >
                                        Очистити
                                    </button>
                                )}
                            </div>
                        </form>

                        {error && (
                            <div className="error-message">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="results-panel">
                        <h2>Результат аналізу</h2>
                        <div className={`results-container ${recognizedText ? 'has-content' : ''}`}>
                            {isLoading ? (
                                <div className="loading-container">
                                    <div className="loading-spinner large"></div>
                                    <p>Обробка зображення...</p>
                                </div>
                            ) : recognizedText ? (
                                <div className="recognized-text-content">{recognizedText}</div>
                            ) : (
                                <div className="placeholder-content">
                                    <div className="placeholder-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                            <polyline points="14 2 14 8 20 8"></polyline>
                                            <line x1="16" y1="13" x2="8" y2="13"></line>
                                            <line x1="16" y1="17" x2="8" y2="17"></line>
                                            <polyline points="10 9 9 9 8 9"></polyline>
                                        </svg>
                                    </div>
                                    <p>Тут з'явиться розпізнаний текст після завантаження та обробки зображення</p>
                                </div>
                            )}
                        </div>

                        {recognizedText && (
                            <button className="copy-button" onClick={copyToClipboard}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
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