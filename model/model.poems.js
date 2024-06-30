const mongoose = require('mongoose');

const poemSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    }
});

const Poem = mongoose.model('poems', poemSchema);


module.exports = Poem;