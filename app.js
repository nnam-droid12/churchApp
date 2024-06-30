const express = require('express');
const poemsRouter = require('./route/poems/route.poems')
const sermonsRouter = require('./route/sermons/route.sermon')
const scheduleRouter = require('./route/schedulenotif/route.schedulenotif')
const paymentRouter = require('./route/payments/route.payment');
const drivesermonRouter = require('./route/drivesermon/route.drivesermon');

const app = express();

app.use(express.json());
app.use('/api', poemsRouter);
app.use('/api', sermonsRouter);
app.use('/api', scheduleRouter);
app.use('/api', paymentRouter);
app.use('/api', drivesermonRouter);


app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).send('Something went wrong!');
  });

module.exports = app;