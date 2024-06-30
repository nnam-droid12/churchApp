
const express = require('express');


const { saveDriveContent, getDriveContent,downloadFile  } =  require('./controller.drivesermon');

const drivesermonRouter = express.Router();

drivesermonRouter.post('/drivesermon', saveDriveContent);
drivesermonRouter.get('/drivesermon/:folderId', getDriveContent);
drivesermonRouter.get('/drivesermon/download/:fileId', downloadFile);

module.exports = drivesermonRouter;

// W0uXZmBsgvouVttm
