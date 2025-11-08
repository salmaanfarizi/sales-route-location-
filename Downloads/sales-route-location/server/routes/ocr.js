const express = require('express');
const router = express.Router();
const multer = require('multer');
const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `shop-${uniqueSuffix}${ext}`);
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// Process image with OCR
router.post('/process', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  try {
    const imagePath = req.file.path;
    const processedImagePath = path.join(
      path.dirname(imagePath),
      `processed-${path.basename(imagePath)}`
    );

    // Preprocess image for better OCR results
    await sharp(imagePath)
      .grayscale()
      .normalize()
      .sharpen()
      .toFile(processedImagePath);

    // Perform OCR with both English and Arabic
    const { data: { text, confidence } } = await Tesseract.recognize(
      processedImagePath,
      'eng+ara', // Support both English and Arabic
      {
        logger: info => {
          // Log progress for debugging
          if (info.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(info.progress * 100)}%`);
          }
        }
      }
    );

    // Clean up the extracted text
    const cleanedText = text
      .replace(/[\r\n]+/g, ' ')  // Replace line breaks with spaces
      .replace(/\s+/g, ' ')       // Replace multiple spaces with single space
      .trim();

    // Extract potential shop name (first line or significant text)
    const lines = text.split('\n').filter(line => line.trim().length > 2);
    const shopName = lines[0] || cleanedText.substring(0, 50);

    // Clean up processed image
    await fs.unlink(processedImagePath).catch(err => {
      console.error('Error deleting processed image:', err);
    });

    // Optional: Clean up original image after successful processing
    // Uncomment if you don't want to keep uploaded images
    /*
    setTimeout(async () => {
      try {
        await fs.unlink(imagePath);
      } catch (error) {
        console.error('Error deleting original image:', error);
      }
    }, 60000); // Delete after 1 minute
    */

    res.json({
      success: true,
      extractedText: cleanedText,
      shopName: shopName,
      confidence: confidence,
      imagePath: `/uploads/${req.file.filename}`,
      lines: lines,
      message: confidence > 70 ? 'Text extracted successfully' : 'Text extracted with low confidence. Please verify.'
    });

  } catch (error) {
    console.error('OCR processing error:', error);
    
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      await fs.unlink(req.file.path).catch(err => {
        console.error('Error deleting file on error:', err);
      });
    }

    res.status(500).json({
      error: 'Failed to process image',
      details: error.message
    });
  }
});

// Process base64 image (alternative endpoint)
router.post('/process-base64', async (req, res) => {
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: 'No image data provided' });
  }

  try {
    // Extract base64 data
    const matches = image.match(/^data:image\/([a-zA-Z]*);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid base64 image format' });
    }

    const imageType = matches[1];
    const imageData = matches[2];
    
    // Create temporary file
    const tempFileName = `temp-${Date.now()}.${imageType}`;
    const tempFilePath = path.join(__dirname, '../../uploads', tempFileName);
    
    // Save base64 to file
    await fs.writeFile(tempFilePath, imageData, 'base64');

    // Process with OCR
    const { data: { text, confidence } } = await Tesseract.recognize(
      tempFilePath,
      'eng+ara',
      {
        logger: info => {
          if (info.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(info.progress * 100)}%`);
          }
        }
      }
    );

    // Clean up temporary file
    await fs.unlink(tempFilePath).catch(err => {
      console.error('Error deleting temp file:', err);
    });

    // Clean up the extracted text
    const cleanedText = text
      .replace(/[\r\n]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const lines = text.split('\n').filter(line => line.trim().length > 2);
    const shopName = lines[0] || cleanedText.substring(0, 50);

    res.json({
      success: true,
      extractedText: cleanedText,
      shopName: shopName,
      confidence: confidence,
      lines: lines,
      message: confidence > 70 ? 'Text extracted successfully' : 'Text extracted with low confidence. Please verify.'
    });

  } catch (error) {
    console.error('Base64 OCR processing error:', error);
    res.status(500).json({
      error: 'Failed to process base64 image',
      details: error.message
    });
  }
});

// Get list of uploaded images (optional)
router.get('/images', async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '../../uploads');
    const files = await fs.readdir(uploadsDir);
    
    const imageFiles = files
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map(file => ({
        filename: file,
        url: `/uploads/${file}`,
        createdAt: fs.stat(path.join(uploadsDir, file)).then(stat => stat.birthtime)
      }));

    const imagesWithStats = await Promise.all(
      imageFiles.map(async (file) => ({
        ...file,
        createdAt: await file.createdAt
      }))
    );

    res.json({
      success: true,
      images: imagesWithStats.sort((a, b) => b.createdAt - a.createdAt),
      total: imagesWithStats.length
    });
  } catch (error) {
    console.error('Error listing images:', error);
    res.status(500).json({
      error: 'Failed to list images',
      details: error.message
    });
  }
});

// Delete an uploaded image (optional)
router.delete('/images/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../uploads', filename);
    
    await fs.unlink(filePath);
    
    res.json({
      success: true,
      message: `Image ${filename} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      error: 'Failed to delete image',
      details: error.message
    });
  }
});

module.exports = router;
