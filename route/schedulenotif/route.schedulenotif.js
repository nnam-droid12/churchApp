const express = require('express');


const { getNotifications, scheduleNotification } =  require('./controller.schedulenotif');

const scheduleRouter = express.Router();

scheduleRouter.post('/schedule', scheduleNotification);
scheduleRouter.get('/getnotifications/:userId', getNotifications);


module.exports = scheduleRouter;

// W0uXZmBsgvouVttm