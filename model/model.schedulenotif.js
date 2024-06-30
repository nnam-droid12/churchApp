const mongoose = require('mongoose');

const scheduleNotifSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    scheduleTime: { type: Date, required: true },
    userId: { type: String, required: true }, 
    status: { type: String, default: 'pending' },
    recurring: { type: Boolean, default: false },
    frequency: { type: String, enum: ['weekly', 'monthly'], default: null },
    dayOfWeek: { type: String, default: null }, // e.g., 'Sunday'
    dayOfMonth: { type: Number, default: null }, // e.g., 3 for the 3rd Friday
    specialProgram: { type: Boolean, default: false }
}, { timestamps: true });

const ScheduleNotif = mongoose.model('ScheduleNotif', scheduleNotifSchema);

module.exports = ScheduleNotif;
