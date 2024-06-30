const express = require('express');


const { initializePayment,verifyPayment } =  require('./controller.payment');

const paymentRouter = express.Router();

paymentRouter.post('/initializepayment', initializePayment);


paymentRouter.get('/verifypayment/:reference', verifyPayment);


module.exports = paymentRouter;

// W0uXZmBsgvouVttm