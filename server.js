const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const axios = require('axios');

dotenv.config();
const app = express();

app.use((req, res, next) => {
    const host = req.get('host');
    if (host === 'world-cup-2026-oxof.onrender.com') {
        return res.redirect(301, 'https://footballdoniya.com' + req.url);
    }
    next();
});

app.use(express.static('views'));
app.use(cors());
app.use(express.json());
app.use(express.static('public')); 

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected!"))
  .catch(err => console.log("Connection Error: ", err));
const MatchSchema = new mongoose.Schema({
    teamA: String,
    teamB: String,
    teamAFlag: String, 
    teamBFlag: String, 
    matchDate: Date,
    venue: String,
    officialStreamUrl: String,
    isLive: { type: Boolean, default: false },
    lineupA: { type: String, default: "এখনো ঘোষণা করা হয়নি" },
    lineupB: { type: String, default: "এখনো ঘোষণা করা হয়নি" }
});


const Match = mongoose.model('Match', MatchSchema);
app.put('/api/edit-match/:id', async (req, res) => {
    try {
        const updatedMatch = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedMatch);
    } catch (err) {
        res.status(500).json({ message: "Update failed" });
    }
});

app.get('/api/matches', async (req, res) => {
    try {
        const matches = await Match.find().sort({ matchDate: 1 });
        res.json(matches);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/add-match', async (req, res) => {
    const newMatch = new Match(req.body);
    try {
        const savedMatch = await newMatch.save();
        res.status(201).json(savedMatch);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put('/api/update-live/:id', async (req, res) => {
    try {
        await Match.findByIdAndUpdate(req.params.id, { isLive: req.body.isLive });
        res.json({ message: "Updated successfully" });
    } catch (err) {
        res.status(500).send(err);
    }
});

app.delete('/api/delete-match/:id', async (req, res) => {
    await Match.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

app.get('/api/match/:id', async (req, res) => {
    try {
        const match = await Match.findById(req.params.id);
        if (!match) return res.status(404).json({ message: "Match not found" });
        res.json(match);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

app.delete('/api/delete-match/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const deletedMatch = await Match.findByIdAndDelete(id);
        
        if (!deletedMatch) {
            return res.status(404).json({ message: "ম্যাচটি খুঁজে পাওয়া যায়নি!" });
        }
        
        res.status(200).json({ message: "ম্যাচটি সফলভাবে ডিলিট হয়েছে!" });
    } catch (err) {
        res.status(500).json({ message: "সার্ভারে সমস্যা হয়েছে!", error: err });
    }
});

async function updateLiveScoresFromAPI() {
    console.log("সব লাইভ ম্যাচের স্কোর আপডেট করা হচ্ছে...");

    try {
    
        const liveMatches = await Match.find({ isLive: true });

        for (let match of liveMatches) {
            if (match.apiMatchId) {
                const options = {
                    method: 'GET',
                    url: 'https://api-football-v1.p.rapidapi.com/v3/fixtures',
                    params: { id: match.apiMatchId },
                    headers: {
                        'X-RapidAPI-Key': process.env.FOOTBALL_API_KEY, 
                        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
                    }
                };

                const response = await axios.request(options);
                const apiData = response.data.response[0];

                if (apiData) {
                    await Match.findByIdAndUpdate(match._id, {
                        scoreA: apiData.goals.home,
                        scoreB: apiData.goals.away,
                        events: apiData.events.map(ev => ({
                            minute: ev.time.elapsed,
                            type: ev.type,
                            player: ev.player.name,
                            team: ev.team.name === match.teamA ? 'TeamA' : 'TeamB'
                        }))
                    });
                    console.log(`${match.teamA} বনাম ${match.teamB} এর স্কোর আপডেট হয়েছে।`);
                }
            }
        }
    } catch (error) {
        console.error("API থেকে তথ্য আনতে সমস্যা হয়েছে:", error.message);
    }
}

app.get('/api/points-table', async (req, res) => {
    try {
        const matches = await Match.find(); 
        let teamStats = {};

        matches.forEach(m => {
            if (m.scoreA === undefined || m.scoreB === undefined) return;

            [m.teamA, m.teamB].forEach(t => {
                if (!teamStats[t]) {
                    teamStats[t] = { name: t, mp: 0, w: 0, d: 0, l: 0, pts: 0 };
                }
            });

            if (m.scoreA !== 0 || m.scoreB !== 0) {
                teamStats[m.teamA].mp += 1;
                teamStats[m.teamB].mp += 1;

                if (m.scoreA > m.scoreB) {
                    teamStats[m.teamA].w += 1; teamStats[m.teamA].pts += 3;
                    teamStats[m.teamB].l += 1;
                } else if (m.scoreA < m.scoreB) {
                    teamStats[m.teamB].w += 1; teamStats[m.teamB].pts += 3;
                    teamStats[m.teamA].l += 1;
                } else {
                    teamStats[m.teamA].d += 1; teamStats[m.teamA].pts += 1;
                    teamStats[m.teamB].d += 1; teamStats[m.teamB].pts += 1;
                }
            }
        });
        res.json(teamStats);
    } catch (err) { res.status(500).send(err); }
});

const BlogSchema = new mongoose.Schema({
    title: String,
    content: String,
    imageUrl: String,
    likes: { type: Number, default: 0 },
    comments: [{ 
        name: String, 
        text: String, 
        date: { type: Date, default: Date.now } 
    }], 
    createdAt: { type: Date, default: Date.now }
});

app.post('/api/blogs/comment/:id', async (req, res) => {
    try {
        const { name, text } = req.body;
        const blog = await Blog.findById(req.params.id);
        blog.comments.push({ name, text });
        await blog.save();
        res.status(200).json(blog.comments);
    } catch (err) { res.status(500).send(err); }
});
const Blog = mongoose.model('Blog', BlogSchema);

app.post('/api/add-blog', async (req, res) => {
    try {
        const newBlog = new Blog(req.body);
        await newBlog.save();
        res.status(201).json({ message: "Blog added!" });
    } catch (err) { res.status(500).send(err); }
});

app.put('/api/blogs/like/:id', async (req, res) => {
    try {
        await Blog.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } });
        res.status(200).send("Liked");
    } catch (err) { res.status(500).send(err); }
});

app.get('/api/blogs', async (req, res) => {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
});

app.get('/api/blog/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        res.json(blog);
    } catch (err) {
        res.status(404).json({ message: "Blog not found" });
    }
});
setInterval(updateLiveScoresFromAPI, 120000); 

app.put('/api/edit-blog/:id', async (req, res) => {
    await Blog.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "Updated" });
});

app.delete('/api/delete-blog/:id', async (req, res) => {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

const PointSchema = new mongoose.Schema({
    teamName: String,
    teamFlag: String,
    mp: { type: Number, default: 0 },
    w: { type: Number, default: 0 },
    d: { type: Number, default: 0 },
    l: { type: Number, default: 0 },
    pts: { type: Number, default: 0 }
});
const Point = mongoose.model('Point', PointSchema);

app.get('/api/all-points', async (req, res) => {
    const points = await Point.find().sort({ pts: -1, teamName: 1 });
    res.json(points);
});

app.put('/api/update-single-point/:id', async (req, res) => {
    try {
        await Point.findByIdAndUpdate(req.params.id, req.body);
        res.json({ message: "পয়েন্ট সফলভাবে আপডেট হয়েছে!" });
    } catch (err) { res.status(500).send(err); }
});

const VideoSchema = new mongoose.Schema({
    title: String,
    youtubeUrl: String,
    thumbnail: String,
    createdAt: { type: Date, default: Date.now }
});
const Video = mongoose.model('Video', VideoSchema);

app.post('/api/add-video', async (req, res) => {
    const newVideo = new Video(req.body);
    await newVideo.save();
    res.status(201).json({ message: "Video added!" });
});

app.get('/api/videos', async (req, res) => {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});