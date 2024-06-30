const fs = require('fs');
const path = require('path');
const Poem = require('../../model/model.poems');

async function loadCSVData(req, res) {
    const dataDir = path.join(__dirname, '../../data');
    const files = fs.readdirSync(dataDir);

    for (const file of files) {
        if (file.endsWith('.csv')) {
            const filePath = path.join(dataDir, file);
            const data = fs.readFileSync(filePath, 'utf8');

            const poemsArray = data.split(/\r?\n\r?\n/).filter(poem => poem.trim() !== '');
            for (const poemContent of poemsArray) {
                try {
                    const poem = new Poem({ content: poemContent });
                    await poem.save();
                    console.log(`Poem saved: ${poemContent.substring(0, 50)}...`);
                } catch (error) {
                    console.log('Error saving poem:', error.message);
                }
            }
        }
    }

    try {
        res.status(200).send('CSV data loaded successfully');
    } catch (error) {
        res.status(500).json({ message: 'Error loading CSV data', error });
    }
}

async function getAllPoems(req, res) {
    try {
        const allPoems = await Poem.find();
        res.status(200).json(allPoems);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching poems', error });
    }
}

module.exports = {
    loadCSVData,
    getAllPoems
};
