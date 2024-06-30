# ChurchAPP: Sermons, Poems, and Schedule Notifications

## Table of Contents
- [Introduction](#introduction)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
  - [Sermons](#sermons)
  - [Poems](#poems)
  - [Schedule Notifications](#schedule-notifications)
- [Models](#models)
  - [Sermon](#sermon)
  - [Poem](#poem)
  - [Schedule Notification](#schedule-notification)
- [Controllers](#controllers)
  - [Sermons Controller](#sermons-controller)
  - [Poems Controller](#poems-controller)
  - [Schedule Notification Controller](#schedule-notification-controller)
- [Routes](#routes)
- [Additional Features](#additional-features)
- [Error Handling](#error-handling)

## Introduction
This Node.js project serves as a comprehensive platform for managing and retrieving sermon videos from YouTube, storing and displaying poems from CSV files, and scheduling notifications for predefined events using cron jobs. The project is built with Express.js, Mongoose for MongoDB interactions, and integrates with external services like YouTube and local file systems.

<br>

## Project Structure
```bash
.
├── app.js
├── server.js
├── .env
├── package.json
├── /data
│   └── poems.csv
├── /model
│   ├── model.poems.js
│   ├── model.sermons.js
│   └── model.schedulenotif.js
├── /route
│   ├── poems
│   │   └── route.poems.js
│   ├── sermons
│   │   └── route.sermon.js
│   └── schedulenotif
│       └── route.schedulenotif.js
├── /controller
│   ├── controller.poems.js
│   ├── controller.sermon.js
│   └── controller.schedulenotif.js
└── /node_modules
```
</br>


## Installation
- To get started with this project, follow these steps:

- Clone the Repository:

- git clone https://github.com/yourusername/your-repo.git
- cd your-repo
- Install Dependencies:
- Make sure you have Node.js and npm installed. Then, run:

    - npm install
    - Create .env File:
    - Create a .env file in the root directory with the necessary environment variables. See the Environment - -  Variables section for details.

## Environment Variables
- Create a .env file in the root directory and add the following:

   - PORT=5000
   - MONGO_URL=your_mongo_connection_string
   - YOUTUBE_API_KEY=your_youtube_api_key
   - YOUTUBE_CHANNEL_ID=your_youtube_channel_id
   - Replace the placeholder values with your actual credentials and configurations.

## Running the Server
To start the server, run:

- npm start
- The server will listen on the port specified in the .env file (default is 5000).

## API Endpoints
- Sermons
   - GET /api/sermons: Fetch all sermons from YouTube and save to the database.
   - GET /api/sermonsfromdb: Retrieve all sermons from the database.
   - GET /api/downloadsermons/:videoId: Get a downloadable link for a specific sermon.
## Poems
   - POST /api/load-csv: Load poems from CSV files located in the /data directory.
   - GET /api/poems: Retrieve all poems from the database.
## Schedule Notifications
   - GET /api/schedules: Retrieve all scheduled notifications.

## Models
- Sermon
  - model.sermons.js defines the schema for sermon videos:


```javascript
const mongoose = require('mongoose');

const sermonSchema = new mongoose.Schema({
    vid: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    title: { type: String, required: true }
});

const Sermon = mongoose.model('sermons', sermonSchema);

module.exports = Sermon;
```

## Poem
- model.poems.js defines the schema for poems:

```javascript
const mongoose = require('mongoose');

const poemSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    }
});

const Poem = mongoose.model('poems', poemSchema);

module.exports = Poem;
```
## Schedule Notification
- model.schedulenotif.js defines the schema for schedule notifications:

```javascript

const mongoose = require('mongoose');

const scheduleNotifSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    cronPattern: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const ScheduleNotif = mongoose.model('schedules', scheduleNotifSchema);

module.exports = ScheduleNotif;
```
## Controllers
- Sermons Controller
   - controller.sermon.js contains functions for fetching and managing sermons:

   - fetchPlaylists(channelId): Fetches playlists from a YouTube channel.
   - fetchVideosFromPlaylist(playlistId): Fetches videos from a playlist.
   - getAllSermons(req, res): Fetches all sermons from YouTube and saves them to the database.
   - retrieveSermonsFromDB(req, res): Retrieves all sermons from the database.
   - getDownloadLink(req, res): Generates a downloadable link for a specific sermon.

## Poems Controller
- controller.poems.js handles loading poems from CSV files and retrieving them from the database:

   - loadCSVData(req, res): Loads poems from CSV files.
   - getAllPoems(req, res): Retrieves all poems from the database.

## Schedule Notification Controller
- controller.schedulenotif.js manages schedule notifications:

   - sendNotification(name, message): Sends a desktop notification.
   - isThirdFriday(date): Checks if the given date is the third Friday of the month.
   - isLastSunday(date): Checks if the given date is the last Sunday of the month.
   - addPredefinedSchedules(): Adds predefined schedules to the database.
   - scheduleTasks(): Schedules tasks based on predefined schedules.
   - getAllSchedules(req, res): Retrieves all schedules from the database.

## Routes
- The project is structured with separate routes for each module:

  - route.sermon.js for sermons.
  - route.poems.js for poems.
  - route.schedulenotif.js for schedule notifications.
   - Each route is registered in app.js under the /api prefix.

## Additional Features
- Cron Jobs for Notifications: Notifications are scheduled using node-cron. Predefined schedules include weekly and monthly events with specific messages.
- CSV Data Handling: Poems are loaded from CSV files located in the /data directory.

## Error Handling
The project includes basic error handling with appropriate status codes and error messages for various operations like fetching data from external APIs, database operations, and generating download links.