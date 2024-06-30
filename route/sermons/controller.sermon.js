
const axios = require('axios');
const dotenv = require('dotenv');
const Sermon = require('../../model/model.sermons');
const ytdl = require('ytdl-core');

dotenv.config();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
const MAX_RETRIES = 3;

async function fetchPlaylists(channelId) {
    const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=${channelId}&maxResults=50&key=${YOUTUBE_API_KEY}`;
    const response = await axios.get(url);
    return response.data.items;
}

async function fetchVideosFromPlaylist(playlistId) {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${YOUTUBE_API_KEY}`;
    const response = await axios.get(url);
    return response.data.items;
}

async function getAllSermons(req, res) {
    try {
        const playlists = await fetchPlaylists(YOUTUBE_CHANNEL_ID);

        for (const playlist of playlists) {
            const playlistId = playlist.id;
            const videos = await fetchVideosFromPlaylist(playlistId);

            for (const video of videos) {
                const videoId = video.snippet.resourceId.videoId;
                const title = video.snippet.title;
                const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

                const existingSermon = await Sermon.findOne({ vid: videoId });
                if (!existingSermon) {
                    const sermon = new Sermon({
                        vid: videoId,
                        url: videoUrl,
                        title: title
                    });
                    await sermon.save();
                    console.log(`Saved video: ${title}`);
                } else {
                    console.log(`Skipping video (already exists): ${videoId}`);
                }
            }
        }

        res.status(200).send('All videos fetched and saved successfully');
    } catch (error) {
        console.error('Error fetching or saving videos:', error);
        res.status(500).json({ message: 'Error fetching or saving videos', error });
    }
}

async function retrieveSermonsFromDB(req, res) {
    try {
        const sermons = await Sermon.find({}, 'vid url title');
        res.status(200).json(sermons);
    } catch (error) {
        console.error('Error retrieving videos:', error);
        res.status(500).json({ message: 'Error retrieving videos', error });
    }
}

async function getDownloadLink(req, res) {
    const { videoId } = req.params;

    try {
        const sermon = await Sermon.findOne({ vid: videoId });
        if (!sermon) {
            console.error('Video not found in the database');
            return res.status(404).json({ message: 'Video not found' });
        }

        let downloadLink = null;
        let retries = 0;

        while (retries < MAX_RETRIES && !downloadLink) {
            downloadLink = await getDownloadableLink(sermon.url);
            if (!downloadLink) {
                retries++;
                console.log(`Retry ${retries}/${MAX_RETRIES}`);
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait before retrying
            }
        }

        if (!downloadLink) {
            console.error('Failed to generate download link after retries:', sermon.url);
            return res.status(500).json({ message: 'Could not generate download link' });
        }

        res.status(200).json({ url: downloadLink });
    } catch (error) {
        console.error('Error retrieving the download link:', error.message, error.stack);
        res.status(500).json({ message: 'Error retrieving the download link', error: error.message });
    }
}

async function getDownloadableLink(youtubeUrl) {
    try {
        const info = await ytdl.getInfo(youtubeUrl);
        const format = ytdl.chooseFormat(info.formats, { quality: 'highest' });
        console.log('Generated download link:', format.url);
        return format.url;
    } catch (error) {
        console.error('Error generating download link:', error.message, error.stack);
        return null;
    }
}

module.exports = {
    getAllSermons,
    retrieveSermonsFromDB,
    getDownloadLink
};
