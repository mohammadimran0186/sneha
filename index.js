const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4000;

// Set up storage for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads'); // Uploads folder to store files
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Unique filename
    }
});

const upload = multer({ storage });

// Middleware to serve static files from 'uploads' folder
app.use('/uploads', express.static('uploads'));
app.use(express.static('public')); // Serve static files from the 'public' directory

// Serve the homepage (GET /)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Upload a drawing (POST /upload)
app.post('/upload', upload.single('drawing'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.send({
        message: 'File uploaded successfully',
        fileName: req.file.filename,
        path: `/uploads/${req.file.filename}`
    });
});

// List all uploaded files (GET /files)
app.get('/files', (req, res) => {
    fs.readdir('./uploads', (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan files.');
        }
        const fileList = files.map(file => {
            const filePath = path.join(__dirname, 'uploads', file);
            const stats = fs.statSync(filePath);
            return {
                fileName: file,
                size: stats.size,
                path: `/uploads/${file}`
            };
        });
        res.send(fileList);
    });
});

// Download a specific file (GET /download/:fileName)
app.get('/download/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, 'uploads', fileName);

    res.download(filePath, fileName, (err) => {
        if (err) {
            res.status(404).send('File not found.');
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
