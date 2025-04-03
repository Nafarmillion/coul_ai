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
    const imageRef = useRef(null);
    const canvasRef = useRef(null);
    const [lang, setLang] = useState('ukr');

    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    const [history, setHistory] = useState(() => {
        const savedHistory = localStorage.getItem('ocrHistory');
        return savedHistory ? JSON.parse(savedHistory) : [];
    });

    const [selectionMode, setSelectionMode] = useState(false);
    const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
    const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectedArea, setSelectedArea] = useState(null);

    const [isDragging, setIsDragging] = useState(false); // Стан для відстеження перетягування файлу

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    useEffect(() => {
        localStorage.setItem('ocrHistory', JSON.stringify(history));
    }, [history]);

    useEffect(() => {
        if (previewUrl && imageRef.current && canvasRef.current) {
            const updateCanvasDimensions = () => {
                const canvas = canvasRef.current;
                const image = imageRef.current;

                canvas.width = image.clientWidth;
                canvas.height = image.clientHeight;

                if (selectedArea || isSelecting) {
                    drawSelectionOverlay();
                }
            };

            if (imageRef.current.complete) {
                updateCanvasDimensions();
            } else {
                imageRef.current.onload = updateCanvasDimensions;
            }
        }
    }, [previewUrl, selectedArea, isSelecting]);

    const drawSelectionOverlay = () => {
        if (!canvasRef.current || !imageRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let area = selectedArea;
        if (isSelecting) {
            area = {
                x: Math.min(selectionStart.x, selectionEnd.x),
                y: Math.min(selectionStart.y, selectionEnd.y),
                width: Math.abs(selectionStart.x - selectionEnd.x),
                height: Math.abs(selectionStart.y - selectionEnd.y)
            };
        }

        if (area) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.clearRect(area.x, area.y, area.width, area.height);

            ctx.strokeStyle = '#00BFFF';
            ctx.lineWidth = 2;
            ctx.strokeRect(area.x, area.y, area.width, area.height);

            const handleSize = 8;
            ctx.fillStyle = '#00BFFF';

            ctx.fillRect(area.x - handleSize/2, area.y - handleSize/2, handleSize, handleSize);
            ctx.fillRect(area.x + area.width - handleSize/2, area.y - handleSize/2, handleSize, handleSize);
            ctx.fillRect(area.x - handleSize/2, area.y + area.height - handleSize/2, handleSize, handleSize);
            ctx.fillRect(area.x + area.width - handleSize/2, area.y + area.height - handleSize/2, handleSize, handleSize);
        }
    };

    useEffect(() => {
        if (selectionMode && previewUrl) {
            drawSelectionOverlay();
        }
    }, [selectionMode, isSelecting, selectionStart, selectionEnd, selectedArea, previewUrl]);

    const toggleTheme = () => {
        setDarkMode(!darkMode);
    };

    // Обробник події drag over для активації зони перетягування
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true); // Встановлюємо стан перетягування в true
    };

    // Обробник події drag enter для активації зони перетягування
    const handleDragEnter = (e) => {
        e.preventDefault();
        setIsDragging(true); // Встановлюємо стан перетягування в true при вході в зону
    };

    // Обробник події drag leave для деактивації зони перетягування
    const handleDragLeave = () => {
        setIsDragging(false); // Вимикаємо стан перетягування, коли курсор покидає зону
    };

    // Обробник події drop для обробки скинутого файлу
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false); // Вимикаємо стан перетягування після скидання файлу

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0]; // Отримуємо перший скинутий файл
            processFile(droppedFile); // Обробляємо скинутий файл
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            processFile(selectedFile);
        }
    };

    const processFile = (selectedFile) => {
        setFile(selectedFile);
        setSelectionMode(false);
        setSelectedArea(null);

        const fileReader = new FileReader();
        fileReader.onload = () => {
            setPreviewUrl(fileReader.result);
        };
        fileReader.readAsDataURL(selectedFile);
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
            let imageToProcess = file;

            if (selectedArea && selectionMode) {
                console.log('Починаємо обрізку зображення...');
                try {
                    imageToProcess = await cropImage(file, selectedArea);
                    console.log('Зображення успішно обрізано:', imageToProcess);
                } catch (cropError) {
                    console.error('Помилка при обрізці:', cropError);
                    imageToProcess = file;
                    setError('Не вдалося обрізати зображення. Використовуємо повне зображення.');
                }
            }

            console.log('Починаємо розпізнавання тексту з файлу:', {
                name: imageToProcess.name,
                size: imageToProcess.size,
                type: imageToProcess.type,
            });
            const result = await processImage(imageToProcess, lang);
            setRecognizedText(result);
            console.log('Текст успішно розпізнано:', result);

            addToHistory({
                id: Date.now(),
                filename: file.name,
                language: lang,
                previewUrl: previewUrl,
                text: result,
                date: new Date().toLocaleString(),
            });
        } catch (err) {
            setError(`Помилка: ${err.message}`);
            console.error('Помилка при розпізнаванні:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const cropImage = (file, area) => {
        return new Promise((resolve, reject) => {
            try {
                const img = new Image();

                img.onload = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');

                        const naturalWidth = img.naturalWidth;
                        const naturalHeight = img.naturalHeight;

                        const displayWidth = imageRef.current.clientWidth;
                        const displayHeight = imageRef.current.clientHeight;

                        const scaleX = naturalWidth / displayWidth;
                        const scaleY = naturalHeight / displayHeight;

                        const scaledX = area.x * scaleX;
                        const scaledY = area.y * scaleY;
                        const scaledWidth = area.width * scaleX;
                        const scaledHeight = area.height * scaleY;

                        canvas.width = scaledWidth;
                        canvas.height = scaledHeight;

                        ctx.drawImage(
                            img,
                            scaledX,
                            scaledY,
                            scaledWidth,
                            scaledHeight,
                            0,
                            0,
                            scaledWidth,
                            scaledHeight
                        );

                        canvas.toBlob((blob) => {
                            if (!blob || blob.size === 0) {
                                reject(new Error('Не вдалося створити blob з виділеної області або файл порожній'));
                                return;
                            }
                            const croppedFile = new File([blob], file.name, {
                                type: 'image/png',
                                lastModified: new Date().getTime(),
                            });
                            console.log('Обрізаний файл:', {
                                name: croppedFile.name,
                                size: croppedFile.size,
                                type: croppedFile.type,
                            });
                            resolve(croppedFile);
                        }, 'image/png');
                    } catch (error) {
                        console.error('Помилка при обрізці:', error);
                        reject(error);
                    }
                };

                img.onerror = () => {
                    reject(new Error('Не вдалося завантажити зображення для обрізки'));
                };

                img.src = URL.createObjectURL(file);
            } catch (error) {
                console.error('Помилка в процесі обрізки:', error);
                reject(error);
            }
        });
    };

    const toggleSelectionMode = () => {
        setSelectionMode(!selectionMode);
        if (!selectionMode) {
            setSelectedArea(null);
        }
    };

    const handleMouseDown = (e) => {
        if (!selectionMode) return;

        e.preventDefault();

        const rect = imageRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

        setSelectionStart({ x, y });
        setSelectionEnd({ x, y });
        setIsSelecting(true);
        setSelectedArea(null);
    };

    const handleMouseMove = (e) => {
        if (!selectionMode || !isSelecting) return;

        e.preventDefault();

        const rect = imageRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

        setSelectionEnd({ x, y });
    };

    const handleMouseUp = (e) => {
        if (!selectionMode || !isSelecting) return;

        if (e) {
            e.preventDefault();
        }

        setIsSelecting(false);

        const area = {
            x: Math.min(selectionStart.x, selectionEnd.x),
            y: Math.min(selectionStart.y, selectionEnd.y),
            width: Math.abs(selectionStart.x - selectionEnd.x),
            height: Math.abs(selectionStart.y - selectionEnd.y)
        };

        if (area.width > 10 && area.height > 10) {
            setSelectedArea(area);
        } else {
            setSelectedArea(null);
        }
    };

    const addToHistory = (entry) => {
        const updatedHistory = [entry, ...history.slice(0, 9)];
        setHistory(updatedHistory);
    };

    const loadFromHistory = (entry) => {
        setRecognizedText(entry.text);
    };

    const removeFromHistory = (id) => {
        const updatedHistory = history.filter(entry => entry.id !== id);
        setHistory(updatedHistory);
    };

    const resetFileInput = () => {
        setFile(null);
        setPreviewUrl(null);
        setRecognizedText('');
        setSelectedArea(null);
        setSelectionMode(false);
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
                            <div
                                className={`upload-area ${isDragging ? 'dragging' : ''}`}
                                onDragOver={handleDragOver} // Додаємо обробник drag over для зони скидання
                                onDragEnter={handleDragEnter} // Додаємо обробник drag enter для зони скидання
                                onDragLeave={handleDragLeave} // Додаємо обробник drag leave для зони скидання
                                onDrop={handleDrop} // Додаємо обробник drop для обробки скинутого файлу
                            >
                                {previewUrl ? (
                                    <div className="preview-container">
                                        <div className="image-selection-container">
                                            <img
                                                ref={imageRef}
                                                src={previewUrl}
                                                alt="Preview"
                                                className="image-preview"
                                                onMouseDown={handleMouseDown}
                                                onMouseMove={handleMouseMove}
                                                onMouseUp={handleMouseUp}
                                                onMouseLeave={() => isSelecting && handleMouseUp()}
                                            />
                                            {selectionMode && (
                                                <canvas
                                                    ref={canvasRef}
                                                    className="selection-canvas"
                                                    width={imageRef.current?.offsetWidth || 0}
                                                    height={imageRef.current?.offsetHeight || 0}
                                                />
                                            )}
                                        </div>
                                        <div className="image-controls">
                                            <button
                                                type="button"
                                                className={`selection-btn ${selectionMode ? 'active' : ''}`}
                                                onClick={toggleSelectionMode}
                                            >
                                                {selectionMode ? 'Скасувати вибір' : 'Вибрати область'}
                                            </button>
                                            <button
                                                type="button"
                                                className="remove-image-btn"
                                                onClick={resetFileInput}
                                                aria-label="Видалити зображення"
                                            >
                                                ✕
                                            </button>
                                        </div>
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

                {/* Секція історії завантажень 
                <div className="history-section">
                    <h2>Історія завантажень</h2>
                    {history.length === 0 ? (
                        <p className="no-history">Історія порожня. Розпізнані зображення з'являтимуться тут.</p>
                    ) : (
                        <div className="history-list">
                            {history.map((entry) => (
                                <div key={entry.id} className="history-item">
                                    <div className="history-thumbnail">
                                        <img src={entry.previewUrl} alt={entry.filename} />
                                    </div>
                                    <div className="history-details">
                                        <h4>{entry.filename}</h4>
                                        <p>Дата: {entry.date}</p>
                                        <div className="history-actions">
                                            <button onClick={() => loadFromHistory(entry)}>
                                                Завантажити
                                            </button>
                                            <button onClick={() => removeFromHistory(entry.id)}>
                                                Видалити
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>*/}
            </div>
        </div>
    );
};

export default OcrComponent;