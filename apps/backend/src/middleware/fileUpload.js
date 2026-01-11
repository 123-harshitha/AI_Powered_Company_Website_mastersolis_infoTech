const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types for resumes
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain'
  ];

  const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt'];

  // Check MIME type
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`), false);
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create subdirectories based on file type
    const subdir = file.mimetype.includes('pdf') ? 'pdfs' : 
                   file.mimetype.includes('word') ? 'docs' : 'other';
    const uploadPath = path.join(uploadsDir, subdir);
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = `${timestamp}-${randomSuffix}${extension}`;
    
    cb(null, filename);
  }
});

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Single file upload
  }
});

// Generic file upload middleware creator
const createUploadMiddleware = (fieldName, destinationField = null, maxFiles = 1) => {
  return upload.array(fieldName, maxFiles);
};

// Resume upload middleware (specific)
const resumeUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(uploadsDir, 'resumes');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const candidateId = req.body.candidateId || 'unknown';
      const timestamp = Date.now();
      const extension = path.extname(file.originalname);
      const filename = `resume-${candidateId}-${timestamp}${extension}`;
      cb(null, filename);
    }
  }),
  fileFilter: (req, file, cb) => {
    // Resume-specific file types
    const resumeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];

    if (resumeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX, DOC, and TXT files are allowed for resumes'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for resumes
    files: 1
  }
});

// Document upload middleware (broader file support)
const documentUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(uploadsDir, 'documents');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const userId = req.user?.id || 'unknown';
      const timestamp = Date.now();
      const extension = path.extname(file.originalname);
      const filename = `doc-${userId}-${timestamp}${extension}`;
      cb(null, filename);
    }
  }),
  fileFilter: (req, file, cb) => {
    // Broader document support
    const documentTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];

    if (documentTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid document type. Allowed: PDF, DOCX, DOC, XLSX, XLS, TXT, JPEG, PNG, GIF'), false);
    }
  },
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit for documents
    files: 5
  }
});

// Avatar/profile picture upload
const avatarUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(uploadsDir, 'avatars');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const userId = req.user?.id || 'unknown';
      const extension = path.extname(file.originalname);
      const filename = `avatar-${userId}${extension}`;
      cb(null, filename);
    }
  }),
  fileFilter: (req, file, cb) => {
    // Only image files for avatars
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (imageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for avatar: JPEG, PNG, GIF, WebP'), false);
    }
  },
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for avatars
    files: 1
  }
});

// Error handler for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          message: 'File too large. Maximum allowed size is 5MB.',
          error: 'FILE_SIZE_EXCEEDED'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          message: 'Too many files. Maximum allowed files is 1.',
          error: 'FILE_COUNT_EXCEEDED'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          message: 'Unexpected field name.',
          error: 'UNEXPECTED_FIELD'
        });
      default:
        return res.status(400).json({
          message: 'File upload error.',
          error: error.code
        });
    }
  } else if (error.message) {
    return res.status(400).json({
      message: error.message,
      error: 'INVALID_FILE_TYPE'
    });
  } else {
    next(error);
  }
};

// File cleanup utility
const cleanupFile = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      console.log(`File cleaned up: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error cleaning up file ${filePath}:`, error);
  }
};

// Get file info utility
const getFileInfo = (file) => {
  return {
    originalName: file.originalname,
    filename: file.filename,
    path: file.path,
    size: file.size,
    mimetype: file.mimetype,
    uploadedAt: new Date()
  };
};

// Security scan placeholder (can be integrated with ClamAV)
const scanFile = async (filePath) => {
  // TODO: Integrate with ClamAV for virus scanning
  console.log(`Scanning file: ${filePath}`);
  
  // For now, just check file type and size
  const stats = await fs.promises.stat(filePath);
  
  if (stats.size === 0) {
    throw new Error('Empty file detected');
  }
  
  if (stats.size > 50 * 1024 * 1024) { // 50MB max
    throw new Error('File too large for security scan');
  }
  
  return { clean: true, scannedAt: new Date() };
};

// Route to serve uploaded files (for viewing/downloading)
const serveFile = async (req, res) => {
  try {
    const { folder, filename } = req.params;
    const filePath = path.join(uploadsDir, folder, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Security check - ensure file is within uploads directory
    const resolvedPath = path.resolve(filePath);
    const resolvedUploadsDir = path.resolve(uploadsDir);
    
    if (!resolvedPath.startsWith(resolvedUploadsDir)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get file info
    const stats = await fs.promises.stat(filePath);
    const extension = path.extname(filename).toLowerCase();
    
    // Set appropriate headers based on file type
    let contentType = 'application/octet-stream';
    switch (extension) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case '.doc':
        contentType = 'application/msword';
        break;
      case '.txt':
        contentType = 'text/plain';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    
    // Stream file to client
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error serving file' });
      }
    });
    
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ message: 'Error serving file' });
  }
};

module.exports = {
  createUploadMiddleware,
  resumeUpload,
  documentUpload,
  avatarUpload,
  handleUploadError,
  cleanupFile,
  getFileInfo,
  scanFile,
  serveFile,
  uploadsDir
};