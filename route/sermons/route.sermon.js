const express = require('express');


const { getDownloadLink, retrieveSermonsFromDB, getAllSermons } =  require('./controller.sermon');

const sermonRouter = express.Router();


sermonRouter.get('/sermons', getAllSermons);
sermonRouter.get('/sermonsfromdb', retrieveSermonsFromDB);
sermonRouter.get('/downloadsermons/:videoId', getDownloadLink);


module.exports = sermonRouter;