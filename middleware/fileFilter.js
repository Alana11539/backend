import multer from 'multer';
import path from 'path';

// Allowed file extensions (image + docs)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|pdf|doc|docx/;

  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype.toLowerCase());

  if (extname && mimetype) {
    cb(null, true); // File is accepted
  } else {
    cb(
      new Error("Only image and document files (jpeg, jpg, png, webp, pdf, doc, docx) are allowed"),
      false
    );
  }
};

export default fileFilter;
