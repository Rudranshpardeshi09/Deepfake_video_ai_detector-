import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

app.use(cors());
app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(join(__dirname, '../dist')));

// Simple in-memory cache for analysis results
const analysisCache = new Map();

// Simulated model prediction
async function analyzeVideo() {
  // In a real application, you would:
  // 1. Process the video file
  // 2. Extract frames
  // 3. Run them through a proper ML model
  // 4. Aggregate results
  
  // For now, we'll simulate the analysis with a delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    isDeepfake: Math.random() > 0.5,
    confidence: 0.85 + Math.random() * 0.1
  };
}

// Endpoint for video analysis
app.post('/api/analyze', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    // Check if we have cached results
    if (analysisCache.has(req.file.filename)) {
      return res.json(analysisCache.get(req.file.filename));
    }

    const result = await analyzeVideo();

    const analysis = {
      isDeepfake: result.isDeepfake,
      confidence: result.confidence,
      analyzedAt: new Date().toISOString(),
      filename: req.file.filename
    };

    // Cache the results
    analysisCache.set(req.file.filename, analysis);

    res.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Error analyzing video' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});