const express = require('express');


const { loadCSVData,getAllPoems } =  require('./controller.poems');

const poemsRouter = express.Router();

poemsRouter.post('/load-csv', loadCSVData);


poemsRouter.get('/poems', getAllPoems);


module.exports = poemsRouter;

// W0uXZmBsgvouVttm