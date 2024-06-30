
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    reference: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    authorization_url: String,
    paid_at: Date,
    customer: Object,
    authorization: Object,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('payment', paymentSchema);
