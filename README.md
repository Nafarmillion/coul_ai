================================================================================
   ____      _       _      _        _     _____ _____ 
  / ___|___ | | ___ (_) ___| |_ __ _| |__ | ____|_   _|
 | |   / _ \| |/ _ \| |/ __| __/ _` | '_ \|  _|   | |  
 | |__| (_) | | (_) | | (__| || (_| | |_) | |___  | |  
  \____\___/|_|\___//_|\___|\__\__,_|_.__/|_____| |_|  

 Frontend interface for AI-based table recognition from images.
================================================================================

## Overview

**Coul.AI** is a web interface for interacting with a custom neural network model that extracts tabular data from images and returns it in structured JSON and Excel format.  
The system is designed to be minimal, fast, and easily extendable for document analysis workflows.

## Features

- Upload image files containing tables (scans, photos, or printed)
- Automatically sends image to FastAPI backend for recognition
- Receives structured response (JSON with `gt_parse.table`)
- Converts recognized data into downloadable `.xlsx` file
- Deployed on [Vercel](https://coul-ai.vercel.app)

## Technologies Used

- React (Vite)
- JavaScript (ES6+)
- XLSX.js (SheetJS) — for generating Excel files
- FastAPI backend (external, required)
- Fetch API for communication

## Installation

```bash
git clone https://github.com/Nafarmillion/coul_ai.git
cd coul_ai
npm install
npm run dev
```

This will start the local development server at `http://localhost:3000`.

Make sure your backend (FastAPI) is running at `http://127.0.0.1:8000/analyze` or a public endpoint (e.g. via ngrok).

## Deployment

Frontend is deployed on Vercel:  
👉 [https://coul-ai.vercel.app](https://coul-ai.vercel.app)

To deploy your own instance:

```bash
npm run build
# then deploy using your method (e.g. Vercel, Netlify, custom server)
```

## Project Structure

```
coul_ai/
├── public/
├── src/
│   ├── components/       # React components
│   ├── services/         # API calls and logic
│   └── App.jsx           # Main application entry
├── package.json
├── vite.config.js
└── README.md
```

## API Expectations

The backend should respond to a `POST` request at `/analyze` with a JSON in the following format:

```json
{
  "gt_parse": {
    "table": [
      {
        "id": "1",
        "content": ["col1", "col2", "col3", "..."]
      },
      {
        "id": "2",
        "content": ["data1", "data2", "data3", "..."]
      }
    ]
  }
}
```

## License

This project is distributed under the MIT License.  
See [`LICENSE`](./LICENSE) for details.

## Author

Developed and maintained by [@Nafarmillion](https://github.com/Nafarmillion)
