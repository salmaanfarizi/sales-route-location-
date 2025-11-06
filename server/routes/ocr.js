const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `shop_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  },
});

// Upload and process image
router.post('/process', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    const imagePath = req.file.path;

    // Return the image URL for now
    // OCR will be handled on the client side using Tesseract.js
    res.json({
      success: true,
      imageUrl,
      message: 'Image uploaded successfully. Perform OCR on client side.',
    });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: error.message });
  }
});

// Alternative: Google Vision API OCR (if configured)
router.post('/vision-ocr', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    // Check if Google Vision is configured
    if (!process.env.GOOGLE_VISION_API_KEY) {
      return res.status(501).json({
        error: 'Google Vision API not configured. Using client-side OCR.'
      });
    }

    const vision = require('@google-cloud/vision');
    const client = new vision.ImageAnnotatorClient({
      keyFilename: path.join(__dirname, '../config/credentials.json'),
    });

    const [result] = await client.textDetection(req.file.path);
    const detections = result.textAnnotations;

    let extractedText = '';
    if (detections && detections.length > 0) {
      extractedText = detections[0].description;
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      imageUrl,
      extractedText,
      confidence: detections.length > 0 ? 'high' : 'low',
    });
  } catch (error) {
    console.error('Error with Vision API:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
