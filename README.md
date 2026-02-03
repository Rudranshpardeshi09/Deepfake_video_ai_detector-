# DeepGuard AI – Deepfake Video Detector

Full-stack app: upload a video and get an AI-powered analysis with a confidence score for deepfake detection.

## Architecture

- **frontend/** – React (Vite + TypeScript): upload UI and results
- **backend/** – Python (FastAPI): single API for upload + video analysis and prediction

## Prerequisites

- **Python** 3.10+
- **Node.js** 18+ (for frontend only)
- **npm** or **yarn**

## Setup

### 1. Create and activate virtual environment (project root)

**Windows (PowerShell):**
```bash
cd C:\Users\rudra\Desktop\deepfake
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**Windows (CMD):**
```bash
cd C:\Users\rudra\Desktop\deepfake
python -m venv venv
venv\Scripts\activate.bat
```

**macOS / Linux:**
```bash
cd /path/to/deepfake
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Python dependencies

```bash
pip install -r requirements.txt
```

This installs from `backend/requirements.txt` (FastAPI, uvicorn, opencv-python-headless, numpy, python-multipart).

Optional (for loading a PyTorch model from `MODEL_WEIGHTS_PATH`):
```bash
pip install torch torchvision
```

### 3. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

## How to run (two processes)

Use two terminals.

### Terminal 1 – Backend (Python, port 8000)

From project root with `venv` activated:

```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Or from project root:

```bash
cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Terminal 2 – Frontend (Vite, port 5173)

```bash
cd frontend
npm run dev
```

Then open **http://localhost:5173** in your browser.

## API

| Endpoint           | Method | Description                    |
|--------------------|--------|--------------------------------|
| `/api/health`      | GET    | Health check                  |
| `/api/analyze`     | POST   | Upload video (form field `video`), returns `isDeepfake`, `confidence`, `analyzedAt` |

## Analysis pipeline (backend)

- **Frame extraction**: Sampled frames (configurable per second, max frames).
- **Detection**: Deterministic **heuristic** pipeline (sharpness consistency, temporal differences, color stats) to produce a reproducible fake probability in `[0, 1]`.
- **Optional**: Set `MODEL_WEIGHTS_PATH` to a `.pth` file (MesoNet-style CNN) for model-based inference; otherwise only the heuristic is used.

## Environment variables (backend)

| Variable                   | Default        | Description                          |
|---------------------------|----------------|--------------------------------------|
| `PORT`                    | `8000`         | Server port                          |
| `HOST`                    | `0.0.0.0`      | Bind address                         |
| `UPLOAD_DIR`              | `backend/uploads` | Temporary video uploads          |
| `MAX_VIDEO_SIZE_MB`       | `100`          | Max upload size (MB)                 |
| `FRAMES_PER_SECOND_SAMPLED` | `1`         | Frames per second to sample         |
| `MAX_FRAMES`              | `64`           | Max frames to analyze                |
| `MODEL_WEIGHTS_PATH`      | (empty)        | Optional path to PyTorch `.pth`      |
| `CORS_ORIGINS`            | `*`            | Comma-separated CORS origins         |

## Frontend API URL

Default: `http://localhost:8000`. Override with:

```bash
# In frontend/.env or frontend/.env.local
VITE_API_BASE_URL=http://your-backend-host:8000
```

Then rebuild: `npm run build`.

## Quick reference

| Part      | Directory  | Command (from project root)                    | URL                  |
|-----------|------------|-------------------------------------------------|----------------------|
| Backend   | `backend/` | `cd backend && python -m uvicorn app.main:app --port 8000` | http://localhost:8000 |
| Frontend  | `frontend/`| `cd frontend && npm run dev`                    | http://localhost:5173 |

## Old folders (optional to remove)

After switching to the Python backend, you can **manually delete** these if they still exist (close any processes using them first):

- **server/** – former Node.js API (replaced by `backend/`)
- **python-service/** – former single-file Python service (replaced by `backend/`)

## License

ISC
