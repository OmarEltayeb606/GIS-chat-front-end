// server.js - Modified version

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors({
  origin: '*',
}));

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Simplified file upload endpoint
app.post('/upload', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new Error('No files uploaded');
    }

    const uploadedFiles = req.files.map(file => ({
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/${file.filename}`
    }));

    res.json({ 
      success: true, 
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Upload failed'
    });
  }
});

// Simple API to retrieve available files
app.get('/files', (req, res) => {
  const uploadsDir = path.join(__dirname, 'uploads');
  
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error reading files directory' });
    }
    
    const filesList = files.map(file => ({
      name: file,
      url: `/uploads/${file}`
    }));
    
    res.json({ success: true, files: filesList });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
