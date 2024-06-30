const mongoose = require('mongoose');


const sermonSchema = new mongoose.Schema({
    vid: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    title: { type: String, required: true }
    
});
  
  const Sermon = mongoose.model('sermons', sermonSchema)

  module.exports = Sermon;