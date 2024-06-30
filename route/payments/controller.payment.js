const axios = require('axios');
const dotenv = require('dotenv')
const Payment = require('../../model/model.payment');

dotenv.config();

const paystackAPIKEY = process.env.PAYSTACK_SECRET_KEY


async function initializePayment(req, res){
    const { email, amount } = req.body;
    try {
        const response = await axios.post('https://api.paystack.co/transaction/initialize', {
            email,
            amount
        }, {
            headers: {
                'Authorization': `Bearer ${paystackAPIKEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data.status) {
            const { authorization_url, reference } = response.data.data;
            const payment = new Payment({
                email,
                amount,
                reference,
                status: 'initialized',
                authorization_url
            });
            await payment.save();

            return res.status(200).json({
                status: 'success',
                message: 'Payment initialized',
                data: {
                    authorization_url,
                    reference
                }
            });
        } else {
            return res.status(400).json({
                status: 'error',
                message: 'Payment initialization failed'
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
            error: error.message
        });
    }
};


async function verifyPayment(req, res) {
    const { reference } = req.params;
    try {
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                'Authorization': `Bearer ${paystackAPIKEY}`
            }
        });

        if (response.data.status) {
            const payment = await Payment.findOne({ reference });
            if (!payment) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Payment not found'
                });
            }

            payment.status = response.data.data.status;
            payment.paid_at = response.data.data.paid_at;
            payment.customer = response.data.data.customer;
            payment.authorization = response.data.data.authorization;
            await payment.save();

            return res.status(200).json({
                status: 'success',
                message: 'Payment verified',
                data: response.data.data
            });
        } else {
            return res.status(400).json({
                status: 'error',
                message: 'Payment verification failed'
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
            error: error.message
        });
    }
};

module.exports = {
    initializePayment,
    verifyPayment
};
