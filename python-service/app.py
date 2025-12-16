# from fastapi import FastAPI, UploadFile, File
# from fastapi.responses import JSONResponse
# import cv2
# import numpy as np
# import tempfile
# import torch
# import random
# from datetime import datetime

# app = FastAPI()

# # Dummy PyTorch model (replace with real deepfake model later)
# class DummyDeepfakeDetector(torch.nn.Module):
#     def forward(self, x):
#         # Random fake result (for testing)
#         return torch.tensor([[random.random()]])

# model = DummyDeepfakeDetector()

# @app.post("/analyze")
# async def analyze(video: UploadFile = File(...)):
#     try:
#         # Save video temporarily
#         with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
#             tmp.write(await video.read())
#             tmp_path = tmp.name

#         # Extract 1 frame every second
#         cap = cv2.VideoCapture(tmp_path)
#         frame_rate = int(cap.get(cv2.CAP_PROP_FPS))
#         frames = []
#         count = 0

#         while cap.isOpened():
#             ret, frame = cap.read()
#             if not ret:
#                 break
#             if count % frame_rate == 0:
#                 # Resize frame for model input
#                 resized = cv2.resize(frame, (224, 224))
#                 frames.append(resized)
#             count += 1
#         cap.release()

#         if not frames:
#             return JSONResponse(status_code=400, content={"error": "No frames extracted"})

#         # Convert frames to tensor (dummy prediction now)
#         batch = torch.tensor(np.array(frames)).float()
#         preds = [model(batch[i].unsqueeze(0)).item() for i in range(len(frames))]

#         # Aggregate results
#         avg_conf = float(np.mean(preds))
#         is_deepfake = avg_conf > 0.5

#         return {
#             "isDeepfake": is_deepfake,
#             "confidence": avg_conf,
#             "analyzedAt": datetime.utcnow().isoformat()
#         }

#     except Exception as e:
#         return JSONResponse(status_code=500, content={"error": str(e)})

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn, os, random, time
from datetime import datetime
import tempfile

# Optional heavy imports (only used in real mode)
try:
    import cv2
    import numpy as np
    import torch
except ImportError:
    cv2, np, torch = None, None, None

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Dummy PyTorch model (replace later with real)
class DummyDeepfakeDetector(torch.nn.Module):
    def forward(self, x):
        return torch.tensor([[random.random()]])

model = DummyDeepfakeDetector() if torch else None


@app.post("/analyze")
async def analyze_video(file: UploadFile = File(...), mode: str = "mock"):
    """
    mode = "mock" → lightweight random detection
    mode = "real" → frame-based dummy PyTorch pipeline
    """
    try:
        # Save video
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())

        if mode == "mock" or not cv2 or not torch:
            # Mock mode → random result
            time.sleep(2)
            is_deepfake = random.random() > 0.5
            confidence = round(0.80 + random.random() * 0.15, 2)

            return {
                "mode": "mock",
                "isDeepfake": is_deepfake,
                "confidence": confidence,
                "analyzedAt": datetime.utcnow().isoformat(),
            }

        else:
            # Real mode → process video with frames
            cap = cv2.VideoCapture(file_path)
            frame_rate = int(cap.get(cv2.CAP_PROP_FPS))
            frames = []
            count = 0

            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                if count % frame_rate == 0:
                    resized = cv2.resize(frame, (224, 224))
                    frames.append(resized)
                count += 1
            cap.release()

            if not frames:
                return JSONResponse(status_code=400, content={"error": "No frames extracted"})

            batch = torch.tensor(np.array(frames)).float()
            preds = [model(batch[i].unsqueeze(0)).item() for i in range(len(frames))]
            avg_conf = float(np.mean(preds))
            is_deepfake = avg_conf > 0.5

            return {
                "mode": "real",
                "isDeepfake": is_deepfake,
                "confidence": avg_conf,
                "analyzedAt": datetime.utcnow().isoformat(),
            }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)
