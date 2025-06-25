import express from 'express';
import { upload, CategoryUpload, ProfileUpload, handleMulterError } from '../utils/multer';

const router = express.Router();

// Product images upload with error handling
router.post('/upload', (req, res, next) => {
  upload.array('images', 5)(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    
    const files = (req.files as Express.Multer.File[]) || [];
    if (!files.length) {
      return res.status(400).json({ 
        success: false,
        error: 'No files uploaded',
        message: 'Please select at least one image to upload'
      });
    }
    
    const fileNames = files.map((file) => file.filename);
    res.json({ 
      success: true,
      fileNames,
      message: `${files.length} image(s) uploaded successfully`
    });
  });
});

// Category image upload with error handling
router.post('/category', (req, res, next) => {
  CategoryUpload.single('image')(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    
    if (req.file) {
      const { filename } = req.file;
      res.json({ 
        success: true,
        filename,
        message: 'Category image uploaded successfully'
      });
    } else {
      res.status(400).json({ 
        success: false,
        error: 'No file uploaded',
        message: 'Please select an image to upload'
      });
    }
  });
});

// Profile image upload with error handling
router.post('/profile/image', (req, res, next) => {
  ProfileUpload.single('image')(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    
    if (req.file) {
      const { filename } = req.file;
      res.json({ 
        success: true,
        filename,
        message: 'Profile image uploaded successfully'
      });
    } else {
      res.status(400).json({ 
        success: false,
        error: 'No profile image uploaded',
        message: 'Please select a profile image to upload'
      });
    }
  });
});

export default router; 