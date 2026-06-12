const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Point = mongoose.model('Point', new mongoose.Schema({
    teamName: String,
    teamFlag: String,
    mp: { type: Number, default: 0 },
    w: { type: Number, default: 0 },
    d: { type: Number, default: 0 },
    l: { type: Number, default: 0 },
    pts: { type: Number, default: 0 }
}));

const teams = [
    { n: "Mexico", f: "mx" }, { n: "South Africa", f: "za" }, { n: "South Korea", f: "kr" }, { n: "Czech Republic", f: "cz" },
    { n: "Canada", f: "ca" }, { n: "Qatar", f: "qa" }, { n: "Switzerland", f: "ch" }, { n: "Brazil", f: "br" },
    { n: "Morocco", f: "ma" }, { n: "Haiti", f: "ht" }, { n: "Scotland", f: "gb-sct" }, { n: "USA", f: "us" },
    { n: "Paraguay", f: "py" }, { n: "Australia", f: "au" }, { n: "Türkiye", f: "tr" }, { n: "Germany", f: "de" },
    { n: "Curaçao", f: "cw" }, { n: "Ivory Coast", f: "ci" }, { n: "Ecuador", f: "ec" }, { n: "Netherlands", f: "nl" },
    { n: "Japan", f: "jp" }, { n: "Tunisia", f: "tn" }, { n: "Sweden", f: "se" }, { n: "Belgium", f: "be" },
    { n: "Egypt", f: "eg" }, { n: "Saudi Arabia", f: "sa" }, { n: "Uruguay", f: "uy" }, { n: "Iran", f: "ir" },
    { n: "New Zealand", f: "nz" }, { n: "France", f: "fr" }, { n: "Senegal", f: "sn" }, { n: "Norway", f: "no" },
    { n: "Iraq", f: "iq" }, { n: "Argentina", f: "ar" }, { n: "Algeria", f: "dz" }, { n: "Austria", f: "at" },
    { n: "Jordan", f: "jo" }, { n: "Portugal", f: "pt" }, { n: "Congo", f: "cg" }, { n: "Uzbekistan", f: "uz" },
    { n: "England", f: "gb-eng" }, { n: "Croatia", f: "hr" }, { n: "Ghana", f: "gh" }, { n: "Panama", f: "pa" },
    { n: "Colombia", f: "co" }, { n: "DR Congo", f: "cd" }, { n: "Italy", f: "it" }, { n: "Cabo Verde", f: "cv" }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected! ডাটা ইনপুট হচ্ছে...");
        
        await Point.deleteMany({}); 

        const data = teams.map(t => ({
            teamName: t.n,
            teamFlag: `https://flagcdn.com/w40/${t.f}.png`,
            mp: 0, w: 0, d: 0, l: 0, pts: 0
        }));

        await Point.insertMany(data);
        console.log("সফলভাবে ৪৮টি দেশ পয়েন্ট টেবিলে যুক্ত হয়েছে!");
        process.exit();
    } catch (err) {
        console.error(err);
    }
}
seed();