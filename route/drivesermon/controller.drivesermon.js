const { google } = require('googleapis');
const DriveSermon = require('../../model/model.drivesermon');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

const drive = google.drive({
    version: 'v3',
    auth: process.env.API_KEY
});

const fetchFilesRecursively = async (folderId, drive) => {
    let files = [];

    const response = await drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id, name, mimeType, webContentLink, parents)'
    });

    for (const file of response.data.files) {
        if (file.mimeType === 'application/vnd.google-apps.folder') {
            const subFiles = await fetchFilesRecursively(file.id, drive);
            files = files.concat(subFiles);
        } else {
            files.push(file);
        }
    }

    return files;
};

const generateDownloadUrl = (fileId) => {
    return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${process.env.GOOGLE_API_KEY}`;
};

const saveDriveContent = async (req, res) => {
    const folderId = req.body.folderId;

    try {
        const files = await fetchFilesRecursively(folderId, drive);

        const driveSermon = new DriveSermon({
            folderId,
            files: files.map(file => ({
                fileId: file.id,
                name: file.name,
                mimeType: file.mimeType,
                downloadUrl: file.webContentLink || generateDownloadUrl(file.id)
            }))
        });

        await driveSermon.save();
        res.status(201).json(driveSermon);
    } catch (error) {
        console.error('Error saving drive content:', error);
        res.status(500).json({ message: error.message });
    }
};

const getDriveContent = async (req, res) => {
    const { folderId } = req.params;

    try {
        const driveSermon = await DriveSermon.findOne({ folderId });
        if (!driveSermon) {
            return res.status(404).json({ message: 'Folder not found' });
        }
        res.status(200).json(driveSermon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const downloadFile = async (req, res) => {
    const { fileId } = req.params;

    try {
        const driveSermon = await DriveSermon.findOne({ 'files.fileId': fileId });
        if (!driveSermon) {
            return res.status(404).json({ message: 'File not found' });
        }

        const file = driveSermon.files.find(file => file.fileId === fileId);
        const filePath = path.join(__dirname, '..', 'downloads', file.name);

        const writer = fs.createWriteStream(filePath);

        const response = await axios({
            url: file.downloadUrl,
            method: 'GET',
            responseType: 'stream'
        });

        response.data.pipe(writer);

        writer.on('finish', () => {
            res.download(filePath, file.name, err => {
                if (err) {
                    console.error('Download error:', err);
                    res.status(500).send('Error downloading file');
                }

                fs.unlinkSync(filePath);
            });
        });

        writer.on('error', () => {
            console.error('File write error');
            res.status(500).send('Error writing file');
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    saveDriveContent,
    getDriveContent,
    downloadFile
};
