import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { ENV } from '../config/env';

// Ensure uploads folder exists
if (!fs.existsSync(ENV.UPLOAD_DIR)) {
  fs.mkdirSync(ENV.UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, ENV.UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueName = `${Date.now()}-${uuidv4().substring(0, 8)}-${safeBase}${ext}`;
    cb(null, uniqueName);
  },
});

const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-zip-compressed',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/webp',
];

const allowedExts = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.zip', '.txt', '.png', '.jpg', '.jpeg', '.webp'];

const dangerousExts = [
  '.html', '.htm', '.xhtml', '.svg', '.xml',
  '.exe', '.bat', '.cmd', '.sh', '.bin', '.msi',
  '.js', '.mjs', '.cjs', '.ts', '.php', '.phtml',
  '.py', '.pl', '.vbs', '.ps1', '.jar', '.com'
];

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // Reject dangerous extensions immediately to prevent Stored XSS and remote code execution
  if (dangerousExts.includes(ext)) {
    return cb(new Error('Executable or script files are strictly prohibited.'));
  }

  // Enforce both extension AND mime-type validation
  if (allowedExts.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Supported formats: ${allowedExts.join(', ')}`));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB
  },
  fileFilter,
});
