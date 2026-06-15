const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

dotenv.config();
const app = express();

app.use((req, res, next) => {
    const host = req.get('host');
    if (host === 'world-cup-2026-oxof.onrender.com') {
        return res.redirect(301, 'https://footballdoniya.com' + req.url);
    }
    next();
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected!"))
  .catch(err => console.log("Connection Error: ", err));

// --- ৪. ডাটাবেস মডেলসমূহ (Schemas) ---

const MatchSchema = new mongoose.Schema({
    teamA: String, teamB: String,
    teamAFlag: String, teamBFlag: String,
    matchDate: Date, venue: String,
    officialStreamUrl: String,
    isLive: { type: Boolean, default: false },
    lineupA: { type: String, default: "এখনো ঘোষণা করা হয়নি" },
    lineupB: { type: String, default: "এখনো ঘোষণা করা হয়নি" },
    apiMatchId: String, // API এর জন্য জরুরি
    scoreA: { type: Number, default: 0 },
    scoreB: { type: Number, default: 0 },
    events: { type: Array, default: [] }
});
const Match = mongoose.model('Match', MatchSchema);

const BlogSchema = new mongoose.Schema({
    title: String, content: String, imageUrl: String,
    likes: { type: Number, default: 0 },
    comments: [{ name: String, text: String, date: { type: Date, default: Date.now } }],
    createdAt: { type: Date, default: Date.now }
});
const Blog = mongoose.model('Blog', BlogSchema);

const PointSchema = new mongoose.Schema({
    teamName: String, teamFlag: String,
    mp: { type: Number, default: 0 },
    w: { type: Number, default: 0 },
    d: { type: Number, default: 0 },
    l: { type: Number, default: 0 },
    pts: { type: Number, default: 0 }
});
const Point = mongoose.model('Point', PointSchema);

const VideoSchema = new mongoose.Schema({
    title: String, youtubeUrl: String, thumbnail: String,
    createdAt: { type: Date, default: Date.now }
});
const Video = mongoose.model('Video', VideoSchema);


app.get('/api/matches', async (req, res) => {
    const matches = await Match.find().sort({ matchDate: 1 });
    res.json(matches);
});

app.get('/api/match/:id', async (req, res) => {
    const match = await Match.findById(req.params.id);
    res.json(match);
});

app.post('/api/add-match', async (req, res) => {
    const newMatch = new Match(req.body);
    await newMatch.save();
    res.status(201).json(newMatch);
});

app.put('/api/edit-match/:id', async (req, res) => {
    const updated = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
});

app.put('/api/update-live/:id', async (req, res) => {
    await Match.findByIdAndUpdate(req.params.id, { isLive: req.body.isLive });
    res.json({ message: "Live status updated" });
});

app.delete('/api/delete-match/:id', async (req, res) => {
    await Match.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

app.get('/api/blogs', async (req, res) => {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
});

app.post('/api/add-blog', async (req, res) => {
    const newBlog = new Blog(req.body);
    await newBlog.save();
    res.json(newBlog);
});

app.put('/api/edit-blog/:id', async (req, res) => {
    await Blog.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "Updated" });
});

app.delete('/api/delete-blog/:id', async (req, res) => {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

app.put('/api/blogs/like/:id', async (req, res) => {
    await Blog.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } });
    res.send("Liked");
});

app.post('/api/blogs/comment/:id', async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    blog.comments.push(req.body);
    await blog.save();
    res.json(blog.comments);
});

app.get('/api/points-table', async (req, res) => {
    try {
        const matches = await Match.find({ isLive: false }); // শুধু শেষ হওয়া ম্যাচ
        const now = new Date();
        let teamStats = {};

        matches.forEach(m => {
            if (new Date(m.matchDate) <= now) {
                const teams = [m.teamA, m.teamB];
                
                teams.forEach(t => {
                    if (!teamStats[t]) {
                        teamStats[t] = { mp: 0, w: 0, d: 0, l: 0, pts: 0 };
                    }
                });

                teamStats[m.teamA].mp += 1;
                teamStats[m.teamB].mp += 1;

                if (m.scoreA > m.scoreB) {
                    teamStats[m.teamA].w += 1;
                    teamStats[m.teamA].pts += 3;
                    teamStats[m.teamB].l += 1;
                } else if (m.scoreB > m.scoreA) {
                    teamStats[m.teamB].w += 1;
                    teamStats[m.teamB].pts += 3;
                    teamStats[m.teamA].l += 1;
                } else {
                    teamStats[m.teamA].d += 1;
                    teamStats[m.teamA].pts += 1;
                    teamStats[m.teamB].d += 1;
                    teamStats[m.teamB].pts += 1;
                }
            }
        });
        res.json(teamStats);
    } catch (err) {
        res.status(500).json({ message: "Error calculating points" });
    }
});

app.put('/api/update-single-point/:id', async (req, res) => {
    await Point.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "Updated" });
});

app.get('/api/videos', async (req, res) => {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
});

app.post('/api/add-video', async (req, res) => {
    const newVideo = new Video(req.body);
    await newVideo.save();
    res.json(newVideo);
});

app.put('/api/edit-video/:id', async (req, res) => {
    await Video.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "Updated" });
});

app.delete('/api/delete-video/:id', async (req, res) => {
    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

async function updateLiveScoresFromAPI() {
    try {
        const liveMatches = await Match.find({ isLive: true });
        for (let match of liveMatches) {
            if (match.apiMatchId) {
                const response = await axios.get(`https://api-football-v1.p.rapidapi.com/v3/fixtures?id=${match.apiMatchId}`, {
                    headers: { 'X-RapidAPI-Key': process.env.FOOTBALL_API_KEY, 'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com' }
                });

                const statsRes = await axios.get(`https://api-football-v1.p.rapidapi.com/v3/fixtures/statistics?fixture=${match.apiMatchId}`, {
                    headers: { 'X-RapidAPI-Key': process.env.FOOTBALL_API_KEY, 'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com' }
                });

                const apiData = response.data.response[0];
                const statsData = statsRes.data.response;

                if (apiData) {
                    let updatedStats = { possessionA: 50, possessionB: 50, shotsA: 0, shotsB: 0 };

                    if (statsData && statsData.length > 0) {
                        const sA = statsData[0].statistics;
                        const sB = statsData[1].statistics;
                        updatedStats = {
                            possessionA: parseInt(sA.find(s => s.type === "Ball Possession")?.value) || 50,
                            possessionB: parseInt(sB.find(s => s.type === "Ball Possession")?.value) || 50,
                            shotsA: sA.find(s => s.type === "Total Shots")?.value || 0,
                            shotsB: sB.find(s => s.type === "Total Shots")?.value || 0
                        };
                    }

                    await Match.findByIdAndUpdate(match._id, {
                        scoreA: apiData.goals.home,
                        scoreB: apiData.goals.away,
                        stats: updatedStats, 
                        events: apiData.events.map(ev => ({
                            minute: ev.time.elapsed,
                            type: ev.type,
                            player: ev.player.name
                        }))
                    });
                }
            }
        }
    } catch (error) { console.error("API Error:", error.message); }
}
setInterval(updateLiveScoresFromAPI, 120000); 

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});