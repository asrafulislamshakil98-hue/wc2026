const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Point = mongoose.model('Point', new mongoose.Schema({ teamName: String, teamFlag: String, mp: Number, w: Number, d: Number, l: Number, pts: Number }));

const teams = [
    // গ্রুপ এ থেকে এল পর্যন্ত ৪৮টি দেশের সম্ভাব্য তালিকা
    { n: "Mexico", f: "mx" }, { n: "South Africa", f: "za" }, { n: "Korea Republic", f: "kr" }, { n: "Czechia", f: "cz" },
    { n: "Canada", f: "ca" }, { n: "Bosnia & Herzegovina", f: "ba" }, { n: "USA", f: "us" }, { n: "Paraguay", f: "py" },
    { n: "Qatar", f: "qa" }, { n: "Switzerland", f: "ch" }, { n: "Brazil", f: "br" }, { n: "Morocco", f: "ma" },
    { n: "Germany", f: "de" }, { n: "France", f: "fr" }, { n: "Argentina", f: "ar" }, { n: "Portugal", f: "pt" },
    { n: "Spain", f: "es" }, { n: "England", f: "gb-eng" }, { n: "Italy", f: "it" }, { n: "Belgium", f: "be" },
    { n: "Netherlands", f: "nl" }, { n: "Japan", f: "jp" }, { n: "Iran", f: "ir" }, { n: "Saudi Arabia", f: "sa" },
    { n: "Australia", f: "au" }, { n: "Uruguay", f: "uy" }, { n: "Colombia", f: "co" }, { n: "Senegal", f: "sn" },
    { n: "Egypt", f: "eg" }, { n: "Ivory Coast", f: "ci" }, { n: "Ghana", f: "gh" }, { n: "Tunisia", f: "tn" },
    { n: "Algeria", f: "dz" }, { n: "Ecuador", f: "ec" }, { n: "Haiti", f: "ht" }, { n: "Scotland", f: "gb-sct" },
    { n: "Sweden", f: "se" }, { n: "Curaçao", f: "cw" }, { n: "Norway", f: "no" }, { n: "Uzbekistan", f: "uz" },
    { n: "Iraq", f: "iq" }, { n: "Jordan", f: "jo" }, { n: "Panama", f: "pa" }, { n: "Croatia", f: "hr" },
    { n: "Cabo Verde", f: "cv" }, { n: "New Zealand", f: "nz" }, { n: "Congo", f: "cg" }, { n: "DR Congo", f: "cd" }
];

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    const data = teams.map(t => ({ teamName: t.n, teamFlag: `https://flagcdn.com/w40/${t.f}.png`, mp:0, w:0, d:0, l:0, pts:0 }));
    await Point.insertMany(data);
    console.log("পয়েন্ট টেবিল ডাটাবেসে তৈরি হয়েছে!");
    process.exit();
}
seed();