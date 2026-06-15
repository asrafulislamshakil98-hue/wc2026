let allMatches = []; 

// ১. ডাটা লোড করার মেইন ফাংশন
async function loadInitialData() {
    const loading = document.getElementById('loading');
    const matchContainer = document.getElementById('match-container');
    const blogContainer = document.getElementById('home-blog-container');
    
    try {
        // ডাটা আসার আগে কন্টেইনার খালি করে নেওয়া (ডুপ্লিকেট ফিক্স)
        if (matchContainer) matchContainer.innerHTML = '';
        if (blogContainer) blogContainer.innerHTML = '';

        const [matchRes, blogRes, videoRes] = await Promise.all([
            fetch('/api/matches'),
            fetch('/api/blogs'),
            fetch('/api/videos')
        ]);

        allMatches = await matchRes.json();
        const blogs = await blogRes.json();
        const videos = await videoRes.json();

        if (loading) loading.style.display = 'none';

        // ম্যাচেদের রেন্ডার করা (শুরুতে ২ টি - তোমার লজিক অনুযায়ী)
        renderMatches(2);
        
        // ব্লগ এবং ভিডিও মিশিয়ে রেন্ডার করা
        renderMixedContent(blogs, videos);

    } catch (error) {
        console.error("Error loading data:", error);
        if (loading) loading.innerHTML = "তথ্য লোড করতে সমস্যা হয়েছে।";
    }
}

// ২. ম্যাচ রেন্ডার করার ফাংশন (তোমার সর্টিং লজিক ঠিক রাখা হয়েছে)
function renderMatches(limit) {
    const container = document.getElementById('match-container');
    const moreBtn = document.getElementById('moreMatchesBtn');
    
    if (!container) return;
    container.innerHTML = '';

    if (allMatches.length === 0) {
        container.innerHTML = "<p style='text-align:center; grid-column: 1/-1;'>কোনো ম্যাচ পাওয়া যায়নি।</p>";
        if (moreBtn) moreBtn.style.display = 'none';
        return;
    }

    const now = new Date();

    // 'Upcoming' এবং 'Finished' আলাদা করা
    const upcomingMatches = allMatches.filter(m => new Date(m.matchDate) >= now || m.isLive === true)
                                      .sort((a, b) => new Date(a.matchDate) - new Date(b.matchDate));
    
    const finishedMatches = allMatches.filter(m => new Date(m.matchDate) < now && m.isLive === false)
                                      .sort((a, b) => new Date(b.matchDate) - new Date(a.matchDate));

    const sortedMatches = [...upcomingMatches, ...finishedMatches];
    const matchesToShow = sortedMatches.slice(0, limit);

    matchesToShow.forEach(match => {
        const matchCard = document.createElement('div');
        matchCard.className = 'match-card';
        
        const matchTimeDate = new Date(match.matchDate);
        const isFinished = matchTimeDate < now && !match.isLive;

        matchCard.onclick = () => window.location.href = `live.html?id=${match._id}`;
        if (isFinished) matchCard.style.opacity = "0.7";

        matchCard.innerHTML = `
            <div class="match-teams">
                <div class="team-info">
                    <img src="${match.teamAFlag || 'https://flagcdn.com/w160/un.png'}" alt="">
                    <span>${match.teamA}</span>
                </div>
                <div class="score-display">
                    ${match.isLive || isFinished ? `<span class="live-score">${match.scoreA} - ${match.scoreB}</span>` : '<span class="vs-text">VS</span>'}
                </div>
                <div class="team-info">
                    <img src="${match.teamBFlag || 'https://flagcdn.com/w160/un.png'}" alt="">
                    <span>${match.teamB}</span>
                </div>
            </div>
            <p class="match-time"><i class="far fa-calendar-alt"></i> ${matchTimeDate.toLocaleString('bn-BD')}</p>
            <p class="match-venue"><i class="fas fa-map-marker-alt"></i> ${match.venue}</p>
            <div class="status-indicator">
                ${match.isLive ? 
                    '<span class="live-btn-small">🔴 সরাসরি দেখুন</span>' : 
                    (isFinished ? '<span class="upcoming-btn-small" style="background:#ddd; color:#888;">ম্যাচ শেষ</span>' : '<span class="upcoming-btn-small">বিস্তারিত দেখুন</span>')
                }
            </div>
        `;
        container.appendChild(matchCard);
    });

    if (moreBtn) {
        moreBtn.style.display = limit >= sortedMatches.length ? 'none' : 'inline-block';
    }
}

function showAllMatches() {
    renderMatches(allMatches.length);
}

// ৩. মিক্সড কন্টেন্ট রেন্ডার (ব্লগ + ভিডিও) - ডুপ্লিকেট রোধ করা হয়েছে
function renderMixedContent(blogs, videos) {
    const container = document.getElementById('home-blog-container');
    if (!container) return;

    container.innerHTML = ''; // কন্টেইনার পরিষ্কার করা

    // শুধু বৈধ ডাটা নেওয়া (যাদের টাইটেল আছে)
    const combinedContent = [
        ...blogs.filter(b => b.title).map(b => ({ ...b, contentType: 'blog' })),
        ...videos.filter(v => v.title).map(v => ({ ...v, contentType: 'video' }))
    ];

    // তারিখ অনুযায়ী সাজানো
    combinedContent.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (combinedContent.length === 0) {
        container.innerHTML = "<p style='text-align:center;'>কোনো নিউজ বা ভিডিও নেই।</p>";
        return;
    }

    combinedContent.forEach(item => {
        if (item.contentType === 'blog') {
            const blogCard = `
                <div class="home-blog-card" onclick="location.href='blog.html?id=${item._id}'">
                    <img src="${item.imageUrl || 'https://via.placeholder.com/250x180'}" alt="">
                    <div class="blog-text">
                        <span style="font-size:10px; color:#011f4b; font-weight:bold; text-transform:uppercase;"><i class="fas fa-newspaper"></i> নিউজ</span>
                        <h3>${item.title}</h3>
                        <p>${item.content}</p>
                        <span style="color: #011f4b; font-weight: bold; font-size: 13px;">বিস্তারিত পড়ুন →</span>
                    </div>
                </div>`;
            container.innerHTML += blogCard;
        } else {
            // ইউটিউব আইডি বের করা
            const ytId = item.youtubeUrl.split('v=')[1]?.split('&')[0] || item.youtubeUrl.split('/').pop();
            const thumb = item.thumbnail || `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;

            const videoCard = `
                <div class="home-blog-card" onclick="location.href='video.html?id=${item._id}'">
                    <div style="position:relative; width:250px; flex-shrink:0;">
                        <img src="${thumb}" alt="" style="width:100%; height:180px; object-fit:cover;">
                        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); color:white; font-size:40px; opacity:0.8;"><i class="fas fa-play-circle"></i></div>
                    </div>
                    <div class="blog-text">
                        <span style="font-size:10px; color:#ff0000; font-weight:bold; text-transform:uppercase;"><i class="fas fa-play-circle"></i> ভিডিও</span>
                        <h3>${item.title}</h3>
                        <p>বিশ্বকাপের এই বিশেষ ভিডিওটি দেখতে এখানে ক্লিক করুন।</p>
                        <span style="color: #ff0000; font-weight: bold; font-size: 13px;">ভিডিওটি দেখুন →</span>
                    </div>
                </div>`;
            container.innerHTML += videoCard;
        }
    });
}

// ৪. সার্চ বক্স লজিক (তোমার কোড ঠিক রাখা হয়েছে)
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
        const searchString = e.target.value.toLowerCase();
        renderMatches(allMatches.length);
       const cards = document.querySelectorAll('.story-card');
        cards.forEach(card => {
            const teamNames = card.querySelector('.match-teams').innerText.toLowerCase();
            const venue = card.querySelector('.match-venue').innerText.toLowerCase();
            if (teamNames.includes(searchString) || venue.includes(searchString)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// ১. কন্টেন্ট লোড করার মেইন ফাংশন
async function initializeHome() {
    try {
        const [matchRes, blogRes, videoRes] = await Promise.all([
            fetch('/api/matches'),
            fetch('/api/blogs'),
            fetch('/api/videos')
        ]);

        const allMatches = await matchRes.json();
        const blogs = await blogRes.json();
        const videos = await videoRes.json();

        // ২. ম্যাচগুলোকে আপনার লজিক অনুযায়ী সাজানো
        renderStorySlider(allMatches);

        // ৩. ব্লগ ও ভিডিও রেন্ডার করা (আপনার আগের লজিক)
        renderMixedContent(blogs, videos);

    } catch (error) {
        console.error("Error:", error);
    }
}

function renderStorySlider(matches) {
    const slider = document.getElementById('story-slider');
    if (!slider) return;
    slider.innerHTML = '';

    const now = new Date();

    // লজিক: শেষ হওয়া ম্যাচ (বামে), লাইভ (মাঝখানে), আগামী ম্যাচ (ডানে)
    const finished = matches.filter(m => new Date(m.matchDate) < now && !m.isLive).sort((a,b) => new Date(b.matchDate) - new Date(a.matchDate));
    const live = matches.filter(m => m.isLive);
    const upcoming = matches.filter(m => new Date(m.matchDate) >= now && !m.isLive).sort((a,b) => new Date(a.matchDate) - new Date(b.matchDate));

    // সবগুলোকে একসাথে জোড়া লাগানো [Finished (Sorted) -> Live -> Upcoming]
    const sortedMatches = [...finished.reverse(), ...live, ...upcoming];

    sortedMatches.forEach(match => {
        const isFinished = new Date(match.matchDate) < now && !match.isLive;
        const card = document.createElement('div');
        card.className = `story-card ${match.isLive ? 'live-match' : ''}`;
        
        // কার্ডে ক্লিক করলে লাইভ পেজে যাবে
        card.onclick = () => location.href = `live.html?id=${match._id}`;

        card.innerHTML = `
            <span class="match-status ${match.isLive ? 'status-live' : (isFinished ? 'status-finished' : 'status-upcoming')}">
                ${match.isLive ? 'LIVE' : (isFinished ? 'FINISHED' : 'UPCOMING')}
            </span>
            
            <div class="team-info">
                <img src="${match.teamAFlag}" alt="">
                <div class="team-name">${match.teamA}</div>
            </div>

            <div class="story-score">
                ${(match.isLive || isFinished) ? `${match.scoreA} - ${match.scoreB}` : 'VS'}
            </div>

            <div class="team-info">
                <img src="${match.teamBFlag}" alt="">
                <div class="team-name">${match.teamB}</div>
            </div>
            
            <div style="font-size:9px; color:#999;">${new Date(match.matchDate).toLocaleDateString('bn-BD')}</div>
        `;
        slider.appendChild(card);
    });

    // ৫. অটো-স্ক্রল: লাইভ ম্যাচ বা প্রথম আসন্ন ম্যাচে স্ক্রল করে নিয়ে যাবে
    setTimeout(() => {
        const activeMatch = document.querySelector('.live-match') || document.querySelector('.status-upcoming')?.parentElement;
        if (activeMatch) {
            activeMatch.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }, 500);
}

const slider = document.getElementById('story-slider');
let isDown = false;
let startX;
let scrollLeft;

if (slider) {
    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener('mouseleave', () => {
        isDown = false;
    });

    slider.addEventListener('mouseup', () => {
        isDown = false;
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2; // স্লাইডের গতি
        slider.scrollLeft = scrollLeft - walk;
    });
}
// পেজ লোড হলে ফাংশনটি রান করুন
document.addEventListener('DOMContentLoaded', initializeHome);

document.addEventListener('DOMContentLoaded', loadInitialData);