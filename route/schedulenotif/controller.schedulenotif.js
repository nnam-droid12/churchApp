const axios = require('axios');
const cron = require('node-cron');
const dotenv = require('dotenv');
const ScheduleNotif = require('../../model/model.schedulenotif');
const { v4: isValidUUID } = require('uuid');


dotenv.config();

const oneSignalAppId = process.env.ONESIGNAL_APP_ID;
const oneSignalApiKey = process.env.ONESIGNAL_API_KEY;


const getNextOccurrence = (dayOfWeek, weekNumber, currentDate = new Date()) => {
    const daysOfWeek = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
    const targetDay = daysOfWeek[dayOfWeek];
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

    let count = 0;
    while (targetDate.getMonth() === currentDate.getMonth() + 1 || (targetDate.getMonth() === 0 && currentDate.getMonth() === 11)) {
        if (targetDate.getDay() === targetDay) {
            count++;
            if (count === weekNumber) break;
        }
        targetDate.setDate(targetDate.getDate() + 1);
    }
    return targetDate;
};

// Calculate the last Sunday of the month
const getLastSundayOfMonth = (currentDate = new Date()) => {
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0); // Last day of current month
    while (lastDayOfMonth.getDay() !== 0) { 
        lastDayOfMonth.setDate(lastDayOfMonth.getDate() - 1);
    }
    return lastDayOfMonth;
};

// Calculate the next Thursday at 6:00 PM
const getNextThursday = (currentDate = new Date()) => {
    const nextThursday = new Date(currentDate);
    while (nextThursday.getDay() !== 4) { // 4 = Thursday
        nextThursday.setDate(nextThursday.getDate() + 1);
    }
    nextThursday.setHours(18, 0, 0, 0); // 6:00 PM
    return nextThursday;
};

// Calculate the next Sunday at 10:30 AM
const getNextSunday = (currentDate = new Date()) => {
    const nextSunday = new Date(currentDate);
    while (nextSunday.getDay() !== 0) { // 0 = Sunday
        nextSunday.setDate(nextSunday.getDate() + 1);
    }
    nextSunday.setHours(10, 30, 0, 0); // 10:30 AM
    return nextSunday;
};

const scheduleNotification = async (req, res) => {
    try {
        const { title, message, userId, recurring, frequency, dayOfWeek, weekNumber, specialProgram } = req.body;

        if (!isValidUUID(userId)) {
            return res.status(400).json({ error: 'Invalid Player ID format' });
        }

        let nextOccurrence;
        if (specialProgram) {
            if (frequency === 'monthly' && dayOfWeek === 'Friday' && weekNumber === 3) {
                nextOccurrence = getNextOccurrence(dayOfWeek, weekNumber);
            } else if (frequency === 'monthly' && dayOfWeek === 'Sunday') {
                nextOccurrence = getLastSundayOfMonth();
            }
        } else if (frequency === 'weekly' && dayOfWeek === 'Thursday') {
            nextOccurrence = getNextThursday();
        } else if (frequency === 'weekly' && dayOfWeek === 'Sunday') {
            nextOccurrence = getNextSunday();
        }

        const scheduleTime = nextOccurrence.toISOString();

        const notification = new ScheduleNotif({
            title,
            message,
            scheduleTime,
            userId,
            recurring,
            frequency,
            dayOfWeek,
            weekNumber,
            specialProgram
        });

        await notification.save();

        scheduleNotificationJob(notification);

        res.status(201).json({ message: 'Notification scheduled successfully', notification });
    } catch (error) {
        console.error('Error scheduling notification:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getNotifications = async (req, res) => {
    try {
        const { userId } = req.params;

        const notifications = await ScheduleNotif.find({ userId });
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const scheduleNotificationJob = (notification) => {
    const nextOccurrence = new Date(notification.scheduleTime);

    const cronTime = `${nextOccurrence.getUTCMinutes()} ${nextOccurrence.getUTCHours()} ${nextOccurrence.getUTCDate()} ${nextOccurrence.getUTCMonth() + 1} *`;

    cron.schedule(cronTime, async () => {
        try {
            const response = await axios.post('https://onesignal.com/api/v1/notifications', {
                app_id: oneSignalAppId,
                headings: { en: notification.title },
                contents: { en: notification.message },
                include_player_ids: [notification.userId]
            }, {
                headers: {
                    'Authorization': `Basic ${oneSignalApiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('Notification sent successfully:', response.data);
            if (notification.recurring) {
                if (notification.specialProgram && notification.frequency === 'monthly' && notification.dayOfWeek === 'Friday' && notification.weekNumber === 3) {
                    notification.scheduleTime = getNextOccurrence(notification.dayOfWeek, notification.weekNumber).toISOString();
                } else if (notification.specialProgram && notification.frequency === 'monthly' && notification.dayOfWeek === 'Sunday') {
                    notification.scheduleTime = getLastSundayOfMonth().toISOString();
                } else if (notification.frequency === 'weekly' && notification.dayOfWeek === 'Thursday') {
                    notification.scheduleTime = getNextThursday().toISOString();
                } else if (notification.frequency === 'weekly' && notification.dayOfWeek === 'Sunday') {
                    notification.scheduleTime = getNextSunday().toISOString();
                }
                await notification.save();
                scheduleNotificationJob(notification); // Schedule for the next occurrence
            }
        } catch (error) {
            if (error.response) {
                console.error('Error response data:', error.response.data);
            } else {
                console.error('Error sending notification:', error.message);
            }
        }
    }, {
        timezone: 'UTC'
    });
};

module.exports = {
    scheduleNotification,
    getNotifications
};
