const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

const resolveFilePath = (imagePath) => {
  // If it's already an absolute path that exists, use it
  if (fs.existsSync(imagePath)) return imagePath;
  
  // If it's a URL path like /uploads/receipts/file.png, resolve to filesystem
  if (imagePath.startsWith('/uploads/')) {
    const relativePath = imagePath.replace('/uploads/', '');
    const fullPath = path.join(UPLOAD_DIR, relativePath);
    return fullPath;
  }
  
  // If it's just a filename, look in receipts directory
  const receiptPath = path.join(UPLOAD_DIR, 'receipts', path.basename(imagePath));
  if (fs.existsSync(receiptPath)) return receiptPath;
  
  return imagePath;
};

const preprocessImage = async (imageBuffer) => {
  try {
    const processed = await sharp(imageBuffer)
      .grayscale()
      .normalize()
      .sharpen()
      .toBuffer();
    return processed;
  } catch (error) {
    logger.error('Image preprocessing error:', error);
    return imageBuffer;
  }
};

const extractTextFromImage = async (imagePath) => {
  try {
    const resolvedPath = resolveFilePath(imagePath);
    logger.debug(`OCR resolving path: ${imagePath} -> ${resolvedPath}`);
    
    if (!fs.existsSync(resolvedPath)) {
      logger.warn(`OCR file not found: ${resolvedPath}, using fallback extraction`);
      return { text: '', confidence: 0, words: [] };
    }
    
    const result = await Tesseract.recognize(resolvedPath, 'eng', {
      logger: (info) => {
        if (info.status === 'recognizing text') {
          logger.debug(`OCR Progress: ${Math.round(info.progress * 100)}%`);
        }
      },
    });

    return {
      text: result.data.text,
      confidence: result.data.confidence,
      words: result.data.words.map((w) => ({
        text: w.text,
        confidence: w.confidence,
        bbox: w.bbox,
      })),
    };
  } catch (error) {
    logger.error('OCR extraction error:', error);
    throw Object.assign(new Error('Failed to extract text from image'), { statusCode: 500 });
  }
};

const extractTextFromBuffer = async (imageBuffer) => {
  try {
    const preprocessed = await preprocessImage(imageBuffer);
    const result = await Tesseract.recognize(preprocessed, 'eng');
    return {
      text: result.data.text,
      confidence: result.data.confidence,
    };
  } catch (error) {
    logger.error('OCR buffer extraction error:', error);
    throw Object.assign(new Error('Failed to extract text from image buffer'), { statusCode: 500 });
  }
};

module.exports = {
  extractTextFromImage,
  extractTextFromBuffer,
  preprocessImage,
};