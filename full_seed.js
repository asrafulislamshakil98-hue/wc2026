const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// মঙ্গোডিবি স্কিমা (আপনার প্রোজেক্টের সব ফিচারের সাথে মিল রেখে)
const MatchSchema = new mongoose.Schema({
    teamA: String,
    teamB: String,
    teamAFlag: String,
    teamBFlag: String,
    matchDate: Date,
    venue: String,
    officialStreamUrl: { type: String, default: "https://www.plus.fifa.com" },
    isLive: { type: Boolean, default: false },
    scoreA: { type: Number, default: 0 },
    scoreB: { type: Number, default: 0 },
    lineupA: { type: String, default: "" },
    lineupB: { type: String, default: "" },
    events: { type: Array, default: [] }
});

const Match = mongoose.model('Match', MatchSchema);
// ২. আপনার দেওয়া স্কোয়াড ডাটাবেস (অটোমেটিক বসানোর জন্য)
const squadsData = {
    "mexico": "Guillermo Ochoa, Luis Malagón, Edson Álvarez, Johan Vásquez, César Montes, Jesús Gallardo, Jorge Sánchez, Luis Chávez, Orbelín Pineda, Erick Sánchez, Alexis Vega, Raúl Jiménez, Santiago Giménez, Julián Quiñones, Hirving Lozano",
    "south africa": "Ronwen Williams, Ricardo Goss, Teboho Mokoena, Mothobi Mvala, Siyanda Xulu, Grant Kekana, Khuliso Mudau, Percy Tau, Evidence Makgopa, Themba Zwane, Oswin Appollis, Zakhele Lepasa, Sphephelo Sithole, Nkosinathi Sibisi, Thapelo Morena",
    "korea republic": "Son Heung-min, Kim Min-jae, Lee Kang-in, Hwang Hee-chan, Cho Gue-sung, Lee Jae-sung, Jo Hyeon-woo, Kim Seung-gyu, Seol Young-woo, Kim Jin-su, Jung Woo-young, Hwang In-beom, Hong Hyun-seok, Oh Hyeon-gyu, Yang Hyun-jun",
    "czechia": "Patrik Schick, Tomáš Souček, Adam Hložek, Vladimír Coufal, Jan Kuchta, Tomáš Chorý, Ladislav Krejčí, David Jurásek, Alex Král, Lukáš Provod, Antonín Barák, Mojmír Chytil, Matěj Kovář, Jiří Pavlenka, David Zima",
    "canada": "Alphonso Davies, Jonathan David, Cyle Larin, Stephen Eustáquio, Tajon Buchanan, Ismaël Koné, Richie Laryea, Alistair Johnston, Moïse Bombito, Derek Cornelius, Dayne St. Clair, Maxime Crépeau, Ali Ahmed, Jonathan Osorio, Jacen Russell-Rowe",
    "bosnia and herzegovina": "Edin Džeko, Ermedin Demirović, Amar Dedić, Sead Kolašinac, Rade Krunić, Benjamin Tahirović, Anel Ahmedhodžić, Dennis Hadžikadunić, Haris Hajradinović, Amir Hadžiahmetović, Ibrahim Šehić, Nikola Vasilj, Luka Menalo, Smail Prevljak, Gojko Cimirot",
    "usa": "Christian Pulisic, Weston McKennie, Tyler Adams, Gio Reyna, Folarin Balogun, Tim Weah, Yunus Musah, Antonee Robinson, Sergiño Dest, Chris Richards, Matt Turner, Joe Scally, Malik Tillman, Ricardo Pepi, Brenden Aaronson",
    "paraguay": "Miguel Almirón, Julio Enciso, Gustavo Gómez, Ramón Sosa, Mathías Villasanti, Andrés Cubas, Omar Alderete, Fabián Balbuena, Juan Espínola, Carlos Coronel, Gabriel Ávalos, Ángel Romero, Kaku Romero, Robert Rojas, Matías Galarza",
    
    
};



// ৩. অটোমেটিক লাইনআপ পাওয়ার হেল্পার ফাংশন
const getSquad = (teamName) => {
    const name = teamName.toLowerCase().trim();
    return squadsData[name] || "স্কোয়াড এখনো ঘোষণা করা হয়নি।";
};


// পতাকা ম্যাপিং ফাংশন (ইমেজে থাকা সব দেশ এখানে আছে)
const getFlag = (team) => {
    const codes = {
        "mexico": "mx", "south africa": "za", "korea republic": "kr", "czechia": "cz",
        "canada": "ca", "bosnia & herzegovina": "ba", "usa": "us", "paraguay": "py",
        "qatar": "qa", "switzerland": "ch", "brazil": "br", "morocco": "ma",
        "haiti": "ht", "scotland": "gb-sct", "australia": "au", "türkiye": "tr",
        "germany": "de", "curaçao": "cw", "netherlands": "nl", "japan": "jp",
        "ivory coast": "ci", "ecuador": "ec", "sweden": "se", "tunisia": "tn",
        "spain": "es", "cabo verde": "cv", "belgium": "be", "egypt": "eg",
        "saudi arabia": "sa", "uruguay": "uy", "iran": "ir", "new zealand": "nz",
        "france": "fr", "senegal": "sn", "iraq": "iq", "norway": "no",
        "argentina": "ar", "algeria": "dz", "austria": "at", "jordan": "jo",
        "portugal": "pt", "congo": "cg", "england": "gb-eng", "croatia": "hr",
        "ghana": "gh", "panama": "pa", "colombia": "co", "uzbekistan": "uz",
        "belgium": "be", "italy": "it", "panama": "pa", "ghana": "gh"
    };
    const code = codes[team.toLowerCase().trim()] || "un";
    return `https://flagcdn.com/w160/${code}.png`;
};

// ইমেজের সময়সূচী অনুযায়ী ডাটা (বাংলাদেশ সময় BST - UTC+6)
const fixturesData = [
    // --- জুন ১২ ---
    { a: "Mexico", b: "South Africa", d: "2026-06-12T01:00:00+06:00", v: "Azteca Stadium" },
    { a: "Korea Republic", b: "Czechia", d: "2026-06-12T08:00:00+06:00", v: "MetLife Stadium" },
    // --- জুন ১৩ ---
    { a: "Canada", b: "Bosnia & Herzegovina", d: "2026-06-13T01:00:00+06:00", v: "BMO Field" },
    { a: "USA", b: "Paraguay", d: "2026-06-13T07:00:00+06:00", v: "SoFi Stadium" },
    // --- জুন ১৪ ---
    { a: "Qatar", b: "Switzerland", d: "2026-06-14T01:00:00+06:00", v: "USA Venue" },
    { a: "Brazil", b: "Morocco", d: "2026-06-14T04:00:00+06:00", v: "Miami Stadium" },
    { a: "Haiti", b: "Scotland", d: "2026-06-14T07:00:00+06:00", v: "Houston" },
    { a: "Australia", b: "Türkiye", d: "2026-06-14T07:00:00+06:00", v: "Dallas" },
    { a: "Germany", b: "Curaçao", d: "2026-06-14T23:00:00+06:00", v: "Kansas City" },
    // --- জুন ১৫ ---
    { a: "Netherlands", b: "Japan", d: "2026-06-15T02:00:00+06:00", v: "Seattle" },
    { a: "Ivory Coast", b: "Ecuador", d: "2026-06-15T05:00:00+06:00", v: "Atlanta" },
    { a: "Sweden", b: "Tunisia", d: "2026-06-15T08:00:00+06:00", v: "Philadelphia" },
    { a: "Spain", b: "Cabo Verde", d: "2026-06-15T22:00:00+06:00", v: "Boston" },
    // --- জুন ১৬ ---
    { a: "Belgium", b: "Egypt", d: "2026-06-16T01:00:00+06:00", v: "New York" },
    { a: "Saudi Arabia", b: "Uruguay", d: "2026-06-16T04:00:00+06:00", v: "Miami" },
    { a: "Iran", b: "New Zealand", d: "2026-06-16T07:00:00+06:00", v: "Los Angeles" },
    // --- জুন ১৭ ---
    { a: "France", b: "Senegal", d: "2026-06-17T01:00:00+06:00", v: "USA" },
    { a: "Iraq", b: "Norway", d: "2026-06-17T04:00:00+06:00", v: "USA" },
    { a: "Argentina", b: "Algeria", d: "2026-06-17T07:00:00+06:00", v: "USA" },
    { a: "Austria", b: "Jordan", d: "2026-06-17T10:00:00+06:00", v: "USA" },
    { a: "Portugal", b: "Congo", d: "2026-06-17T23:00:00+06:00", v: "USA" },
    // --- জুন ১৮ ---
    { a: "England", b: "Croatia", d: "2026-06-18T02:00:00+06:00", v: "USA" },
    { a: "Ghana", b: "Panama", d: "2026-06-18T05:00:00+06:00", v: "USA" },
    { a: "Uzbekistan", b: "Colombia", d: "2026-06-18T08:00:00+06:00", v: "USA" },
    { a: "Czechia", b: "Saudi Arabia", d: "2026-06-18T22:00:00+06:00", v: "USA" },
    // --- জুন ১৯ (নতুন যোগ করা হয়েছে) ---
    { a: "Switzerland", b: "Bosnia & Herzegovina", d: "2026-06-19T01:00:00+06:00", v: "USA Venue" },
    { a: "Canada", b: "Qatar", d: "2026-06-19T04:00:00+06:00", v: "Toronto" },
    { a: "Mexico", b: "Korea Republic", d: "2026-06-19T07:00:00+06:00", v: "Mexico City" },

    // --- জুন ২০ (নতুন যোগ করা হয়েছে) ---
    { a: "USA", b: "Australia", d: "2026-06-20T01:00:00+06:00", v: "USA Venue" },
    { a: "Scotland", b: "Morocco", d: "2026-06-20T04:00:00+06:00", v: "USA Venue" },
    { a: "Brazil", b: "Haiti", d: "2026-06-20T06:30:00+06:00", v: "USA Venue" },
    { a: "Türkiye", b: "Paraguay", d: "2026-06-20T09:00:00+06:00", v: "USA Venue" },
    { a: "Netherlands", b: "Sweden", d: "2026-06-20T23:00:00+06:00", v: "USA Venue" },

    // --- জুন ২১ (নতুন যোগ করা হয়েছে) ---
    { a: "Germany", b: "Ivory Coast", d: "2026-06-21T02:00:00+06:00", v: "USA Venue" },
    { a: "Ecuador", b: "Curaçao", d: "2026-06-21T06:00:00+06:00", v: "USA Venue" },
    { a: "Tunisia", b: "Japan", d: "2026-06-21T10:00:00+06:00", v: "USA Venue" },
    { a: "Spain", b: "Saudi Arabia", d: "2026-06-21T22:00:00+06:00", v: "USA Venue" },
    // --- জুন ২২ ---
    { a: "Belgium", b: "Iran", d: "2026-06-22T01:00:00+06:00", v: "USA" },
    { a: "Uruguay", b: "Cabo Verde", d: "2026-06-22T04:00:00+06:00", v: "USA" },
    { a: "New Zealand", b: "Egypt", d: "2026-06-22T07:00:00+06:00", v: "USA Venue" },
    { a: "Argentina", b: "Austria", d: "2026-06-22T23:00:00+06:00", v: "New York" },

    // --- জুন ২৩ ---
    { a: "France", b: "Iraq", d: "2026-06-23T03:00:00+06:00", v: "USA Venue" },
    { a: "Norway", b: "Senegal", d: "2026-06-23T06:00:00+06:00", v: "USA Venue" },
    { a: "Jordan", b: "Algeria", d: "2026-06-23T09:00:00+06:00", v: "USA Venue" },
    { a: "Portugal", b: "Uzbekistan", d: "2026-06-23T23:00:00+06:00", v: "USA Venue" },
    // --- জুন ২৪ ---
    { a: "England", b: "Ghana", d: "2026-06-24T02:00:00+06:00", v: "USA Venue" },
    { a: "Panama", b: "Croatia", d: "2026-06-24T05:00:00+06:00", v: "USA Venue" },
    { a: "Colombia", b: "Congo", d: "2026-06-24T08:00:00+06:00", v: "USA Venue" },

    // --- জুন ২৫ ---
    { a: "Switzerland", b: "Canada", d: "2026-06-25T01:00:00+06:00", v: "Toronto" },
    { a: "Bosnia & Herzegovina", b: "Qatar", d: "2026-06-25T01:00:00+06:00", v: "USA Venue" },
    { a: "Scotland", b: "Brazil", d: "2026-06-25T04:00:00+06:00", v: "USA Venue" },
    { a: "Morocco", b: "Haiti", d: "2026-06-25T04:00:00+06:00", v: "USA Venue" },
    { a: "Czechia", b: "Mexico", d: "2026-06-25T07:00:00+06:00", v: "Mexico City" },
    { a: "South Africa", b: "Korea Republic", d: "2026-06-25T07:00:00+06:00", v: "USA Venue" },

    // --- জুন ২৬ ---
    { a: "Curaçao", b: "Ivory Coast", d: "2026-06-26T02:00:00+06:00", v: "USA Venue" },
    { a: "Ecuador", b: "Germany", d: "2026-06-26T02:00:00+06:00", v: "USA Venue" },
    { a: "Japan", b: "Sweden", d: "2026-06-26T05:00:00+06:00", v: "USA Venue" },
    { a: "Tunisia", b: "Netherlands", d: "2026-06-26T05:00:00+06:00", v: "USA Venue" },
    { a: "Türkiye", b: "USA", d: "2026-06-26T08:00:00+06:00", v: "USA Venue" },
    { a: "Paraguay", b: "Australia", d: "2026-06-26T08:00:00+06:00", v: "USA Venue" },

    // --- জুন ২৭ ---
    { a: "Norway", b: "France", d: "2026-06-27T01:00:00+06:00", v: "USA Venue" },
    { a: "Senegal", b: "Iraq", d: "2026-06-27T01:00:00+06:00", v: "USA Venue" },
    { a: "Cabo Verde", b: "Saudi Arabia", d: "2026-06-27T06:00:00+06:00", v: "USA Venue" },
    { a: "Uruguay", b: "Spain", d: "2026-06-27T06:00:00+06:00", v: "USA Venue" },
    { a: "Egypt", b: "Iran", d: "2026-06-27T09:00:00+06:00", v: "USA Venue" },
    { a: "New Zealand", b: "Belgium", d: "2026-06-27T09:00:00+06:00", v: "USA Venue" },
    
    // --- জুন ২৮ ---
    { a: "Panama", b: "England", d: "2026-06-28T03:00:00+06:00", v: "USA" },
    { a: "Croatia", b: "Ghana", d: "2026-06-28T03:30:00+06:00", v: "USA" },
    { a: "Colombia", b: "Portugal", d: "2026-06-28T05:30:00+06:00", v: "USA" },
    { a: "Algeria", b: "Austria", d: "2026-06-28T08:00:00+06:00", v: "New York" },
    { a: "Jordan", b: "Argentina", d: "2026-06-28T08:00:00+06:00", v: "USA" },
];

// ১০৪টি ম্যাচ পূর্ণ করার লজিক
async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected for full seeding...");

        await Match.deleteMany({}); // পুরনো সব মুছে ফেলবে
        console.log("Old matches cleared.");

        const finalMatches = [];

        // ১. ইমেজে থাকা রিয়েল ম্যাচগুলো যোগ করা (প্রায় ৪০টির মতো)
        fixturesData.forEach(m => {
            finalMatches.push({
                teamA: m.a,
                teamB: m.b,
                teamAFlag: getFlag(m.a),
                teamBFlag: getFlag(m.b),
                matchDate: new Date(m.d),
                venue: m.v,
                lineupA: getSquad(m.a), // এখানে স্কোয়াড যোগ হচ্ছে
                lineupB: getSquad(m.b), // এখানে স্কোয়াড যোগ হচ্ছে
                isLive: false
            });
        });

        // ২. গ্রুপ পর্বের বাকি ম্যাচগুলো জেনারেট করা (মোট ৭২টি গ্রুপ ম্যাচ পূর্ণ করতে)
        const currentCount = finalMatches.length;
        for (let i = currentCount + 1; i <= 72; i++) {
            finalMatches.push({
                teamA: `Group Team ${i}`,
                teamB: `Opponent ${i}`,
                teamAFlag: getFlag("un"),
                teamBFlag: getFlag("un"),
                matchDate: new Date(2026, 5, 20, 18, 0), // জুন ২০, সন্ধ্যা ৬টা
                venue: "USA/Canada/Mexico Stadium",
                lineupA: "স্কোয়াড এখনো ঘোষণা করা হয়নি।",
                lineupB: "স্কোয়াড এখনো ঘোষণা করা হয়নি।",
                isLive: false
            });
        }

        // ৩. নকআউট পর্ব (রাউন্ড ৩২, ১৬, কোয়ার্টার, সেমি ও ফাইনাল - মোট ৩২টি ম্যাচ)
        for (let i = 73; i <= 103; i++) {
            finalMatches.push({
                teamA: `Winner Match ${i-72}`,
                teamB: `Runner-up Match ${i-70}`,
                teamAFlag: getFlag("un"),
                teamBFlag: getFlag("un"),
                matchDate: new Date(2026, 6, (i % 15) + 1, 20, 0), // জুলাই মাসের বিভিন্ন তারিখ
                venue: "Knockout Stage Venue",
                lineupA: "স্কোয়াড এখনো ঘোষণা করা হয়নি।",
                lineupB: "স্কোয়াড এখনো ঘোষণা করা হয়নি।",
                isLive: false
            });
        }

        // ৪. গ্র্যান্ড ফাইনাল (১০৪ নম্বর ম্যাচ)
        finalMatches.push({
            teamA: "Finalist 1",
            teamB: "Finalist 2",
            teamAFlag: getFlag("un"),
            teamBFlag: getFlag("un"),
            matchDate: new Date("2026-07-19T15:00:00+06:00"), // ১৯ জুলাই, ৩টা
            venue: "MetLife Stadium, New Jersey",
            officialStreamUrl: "https://www.plus.fifa.com",
            lineupA: "স্কোয়াড এখনো ঘোষণা করা হয়নি।",
            lineupB: "স্কোয়াড এখনো ঘোষণা করা হয়নি।",
            isLive: false
        });

        await Match.insertMany(finalMatches);
        console.log(`সফলভাবে ইমেজের সময়সূচীসহ ১০৪টি ম্যাচ ডাটাবেসে আপলোড হয়েছে!`);
        
        process.exit();
    } catch (error) {
        console.error("Seed error:", error);
        process.exit(1);
    }
}

seedDatabase();