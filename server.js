const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const axios = require('axios');

dotenv.config();
const app = express();

app.use((req, res, next) => {
    const host = req.get('host');
    // আপনার পুরনো রেন্ডার লিঙ্কটি এখানে হুবহু দিতে হবে
    if (host === 'world-cup-2026-oxof.onrender.com') {
        // এখানে আপনার নতুন ডোমেইন লিঙ্কটি দিন
        return res.redirect(301, 'https://footballdoniya.com' + req.url);
    }
    next();
});

app.use(express.static('views'));


// Middleware
app.use(cors());
app.use(express.json());

// অ্যাডমিন পেজ পাসওয়ার্ড দিয়ে সুরক্ষিত করা

app.use(express.static('public')); // static ফাইল (html, css, js) এর জন্য


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected!"))
  .catch(err => console.log("Connection Error: ", err));
const MatchSchema = new mongoose.Schema({
    teamA: String,
    teamB: String,
    teamAFlag: String, // নতুন
    teamBFlag: String, // নতুন
    matchDate: Date,
    venue: String,
    officialStreamUrl: String,
    isLive: { type: Boolean, default: false },
    lineupA: { type: String, default: "এখনো ঘোষণা করা হয়নি" },
    lineupB: { type: String, default: "এখনো ঘোষণা করা হয়নি" }
});


const Match = mongoose.model('Match', MatchSchema);
// ম্যাচের যেকোনো তথ্য আপডেট করার API
app.put('/api/edit-match/:id', async (req, res) => {
    try {
        const updatedMatch = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedMatch);
    } catch (err) {
        res.status(500).json({ message: "Update failed" });
    }
});
// API Routes
// ১. সব ম্যাচের লিস্ট পাওয়া
app.get('/api/matches', async (req, res) => {
    try {
        const matches = await Match.find().sort({ matchDate: 1 });
        res.json(matches);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ২. নতুন ম্যাচ অ্যাড করা (এটি আপনি পরে অ্যাডমিন প্যানেল দিয়ে করবেন)
app.post('/api/add-match', async (req, res) => {
    const newMatch = new Match(req.body);
    try {
        const savedMatch = await newMatch.save();
        res.status(201).json(savedMatch);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// লাইভ স্ট্যাটাস আপডেট করার API
app.put('/api/update-live/:id', async (req, res) => {
    try {
        await Match.findByIdAndUpdate(req.params.id, { isLive: req.body.isLive });
        res.json({ message: "Updated successfully" });
    } catch (err) {
        res.status(500).send(err);
    }
});

// ম্যাচ ডিলিট করার API
app.delete('/api/delete-match/:id', async (req, res) => {
    await Match.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});
// একটি নির্দিষ্ট ম্যাচের তথ্য পাওয়ার API
app.get('/api/match/:id', async (req, res) => {
    try {
        const match = await Match.findById(req.params.id);
        if (!match) return res.status(404).json({ message: "Match not found" });
        res.json(match);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// ম্যাচ ডিলিট করার API
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
        // ডাটাবেস থেকে শুধু সেই ম্যাচগুলো খুঁজুন যেগুলো এখন 'Live'
        const liveMatches = await Match.find({ isLive: true });

        for (let match of liveMatches) {
            // যদি ওই ম্যাচের সাথে API-এর কোনো আইডি (apiMatchId) যুক্ত থাকে
            if (match.apiMatchId) {
                const options = {
                    method: 'GET',
                    url: 'https://api-football-v1.p.rapidapi.com/v3/fixtures',
                    params: { id: match.apiMatchId },
                    headers: {
                        'X-RapidAPI-Key': process.env.FOOTBALL_API_KEY, // .env থেকে কি নিচ্ছে
                        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
                    }
                };

                const response = await axios.request(options);
                const apiData = response.data.response[0];

                if (apiData) {
                    // ২. ডাটাবেস আপডেট করা
                    await Match.findByIdAndUpdate(match._id, {
                        scoreA: apiData.goals.home,
                        scoreB: apiData.goals.away,
                        // গোলদাতাদের তথ্য (অটোমেটিক ইভেন্ট আপডেট)
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
            // স্কোর না থাকলে হিসাব করবে না
            if (m.scoreA === undefined || m.scoreB === undefined) return;

            [m.teamA, m.teamB].forEach(t => {
                if (!teamStats[t]) {
                    teamStats[t] = { name: t, mp: 0, w: 0, d: 0, l: 0, pts: 0 };
                }
            });

            // ম্যাচ কাউন্ট এবং পয়েন্ট হিসাব (যদি স্কোর থাকে)
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

// ব্লগ স্কিমা
const BlogSchema = new mongoose.Schema({
    title: String,
    content: String,
    imageUrl: String,
    createdAt: { type: Date, default: Date.now }
});
const Blog = mongoose.model('Blog', BlogSchema);

// ব্লগ সেভ করার API
app.post('/api/add-blog', async (req, res) => {
    try {
        const newBlog = new Blog(req.body);
        await newBlog.save();
        res.status(201).json({ message: "Blog added!" });
    } catch (err) { res.status(500).send(err); }
});

// সব ব্লগ পাওয়ার API
app.get('/api/blogs', async (req, res) => {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
});
// ৩. অটোমেটিক টাইমার সেট করা
// প্রতি ২ মিনিট (১২০০০০ মিলিসেকেন্ড) পর পর এই ফাংশনটি চলবে
setInterval(updateLiveScoresFromAPI, 120000); 

// ব্লগ এডিট
app.put('/api/edit-blog/:id', async (req, res) => {
    await Blog.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "Updated" });
});

// ব্লগ ডিলিট
app.delete('/api/delete-blog/:id', async (req, res) => {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

// ১. পয়েন্ট টেবিল মডেল
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

// ২. সব পয়েন্ট পাওয়ার API (অ্যাডমিন এবং মেইন সাইটের জন্য)
app.get('/api/all-points', async (req, res) => {
    const points = await Point.find().sort({ pts: -1, teamName: 1 });
    res.json(points);
});

// ৩. অ্যাডমিন প্যানেল থেকে ম্যানুয়ালি পয়েন্ট আপডেট করার API
app.put('/api/update-single-point/:id', async (req, res) => {
    try {
        await Point.findByIdAndUpdate(req.params.id, req.body);
        res.json({ message: "পয়েন্ট সফলভাবে আপডেট হয়েছে!" });
    } catch (err) { res.status(500).send(err); }
});


// Server Listen
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});