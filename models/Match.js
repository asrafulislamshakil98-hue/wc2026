const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    teamA: String,
    teamB: String,
    date: Date,
    venue: String,
    group: String,
    scoreA: { type: Number, default: 0 },
    scoreB: { type: Number, default: 0 },
    officialStreamUrl: String,
    isLive: { type: Boolean, default: false },
    streamUrl: String 
});

module.exports = mongoose.model('Match', matchSchema);