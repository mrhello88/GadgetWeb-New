import multer from 'multer';
import { Request } from 'express';

// Error handling for multer
export const handleMulterError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'File size too large. Please select a smaller image.',
        error: 'FILE_TOO_LARGE',
        maxSize: '5MB for products, 2MB for profiles'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded. Maximum 5 files allowed.',
        error: 'TOO_MANY_FILES'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.',
        error: 'UNEXPECTED_FILE'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'File upload error: ' + error.message,
      error: error.code
    });
  }
  
  if (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during file upload',
      error: error.message
    });
  }
  
  next();
};

// File filter function with better validation
const createFileFilter = (allowedTypes: string[], maxSizeBytes: number) => {
  return (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Check file type
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`));
    }
    
    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    if (!allowedExtensions.includes(fileExtension)) {
      return cb(new Error(`Invalid file extension. Allowed extensions: ${allowedExtensions.join(', ')}`));
    }
    
    cb(null, true);
  };
};

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/images'); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    // Sanitize filename to prevent path traversal attacks
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${sanitizedName}`);
  },
});

const categoryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/categoryImage');
  },
  filename: (req, file, cb) => {
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${sanitizedName}`);
  },
});

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/profileImages');
  },
  filename: (req, file, cb) => {
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${sanitizedName}`);
  },
});

// Product image upload (5MB limit, up to 5 files)
export const upload = multer({
  storage,
  fileFilter: createFileFilter(['image/jpeg', 'image/png', 'image/gif', 'image/webp'], 5 * 1024 * 1024),
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 5 // Maximum 5 files
  },
});

// Category image upload (5MB limit, single file)
export const CategoryUpload = multer({
  storage: categoryStorage,
  fileFilter: createFileFilter(['image/jpeg', 'image/png', 'image/gif', 'image/webp'], 5 * 1024 * 1024),
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 1 // Single file only
  },
});

// Profile image upload (2MB limit, single file)
export const ProfileUpload = multer({
  storage: profileStorage,
  fileFilter: createFileFilter(['image/jpeg', 'image/png', 'image/gif', 'image/webp'], 2 * 1024 * 1024),
  limits: { 
    fileSize: 2 * 1024 * 1024, // 2MB limit for profile images
    files: 1 // Single file only
  },
});
