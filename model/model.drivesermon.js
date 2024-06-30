const mongoose = require('mongoose');

const DriveSermonSchema = new mongoose.Schema({
    folderId: { type: String, required: true },
    files: [
        {
            fileId: { type: String, required: true },
            name: { type: String, required: true },
            mimeType: { type: String, required: true },
            downloadUrl: { type: String, required: true }
        }
    ]
});

module.exports = mongoose.model('DriveSermon', DriveSermonSchema);
