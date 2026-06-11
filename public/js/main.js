let allMatches = []; 

async function loadInitialData() {
    const loading = document.getElementById('loading');
    
    try {
        const [matchRes, blogRes, videoRes] = await Promise.all([
            fetch('/api/matches'),
            fetch('/api/blogs'),
            fetch('/api/videos')
        ]);

        allMatches = await matchRes.json();
        const blogs = await blogRes.json();
        const videos = await videoRes.json();

        if (loading) loading.style.display = 'none';

        renderMatches(2);
        
        renderMixedContent(blogs, videos);

    } catch (error) {
        console.error("Error loading data:", error);
        if (loading) loading.innerHTML = "তথ্য লোড করতে সমস্যা হয়েছে।";
    }
}

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
    const matchesToShow = allMatches.slice(0, limit);

    matchesToShow.forEach(match => {
        const matchCard = document.createElement('div');
        matchCard.className = 'match-card';
        matchCard.onclick = () => window.location.href = `live.html?id=${match._id}`;

        matchCard.innerHTML = `
            <div class="match-teams">
                <div class="team-info">
                    <img src="${match.teamAFlag || 'https://flagcdn.com/w160/un.png'}" alt="">
                    <span>${match.teamA}</span>
                </div>
                <div class="score-display">
                    ${match.isLive ? `<span class="live-score">${match.scoreA} - ${match.scoreB}</span>` : '<span class="vs-text">VS</span>'}
                </div>
                <div class="team-info">
                    <img src="${match.teamBFlag || 'https://flagcdn.com/w160/un.png'}" alt="">
                    <span>${match.teamB}</span>
                </div>
            </div>
            <p class="match-time"><i class="far fa-calendar-alt"></i> ${new Date(match.matchDate).toLocaleString('bn-BD')}</p>
            <p class="match-venue"><i class="fas fa-map-marker-alt"></i> ${match.venue}</p>
            <div class="status-indicator">
                ${match.isLive ? 
                    '<span class="live-btn-small">🔴 সরাসরি দেখুন</span>' : 
                    '<span class="upcoming-btn-small">বিস্তারিত দেখুন</span>'}
            </div>
        `;
        container.appendChild(matchCard);
    });

    if (moreBtn) {
        if (limit >= allMatches.length) {
            moreBtn.style.display = 'none';
        } else {
            moreBtn.style.display = 'inline-block';
        }
    }
}

function showAllMatches() {
    renderMatches(allMatches.length);
}

function renderMixedContent(blogs, videos) {
    const container = document.getElementById('home-blog-container');
    if (!container) return;

    container.innerHTML = '';
    
    const combinedContent = [
        ...blogs.map(b => ({ ...b, contentType: 'blog' })),
        ...videos.map(v => ({ ...v, contentType: 'video' }))
    ];

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

const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
        const searchString = e.target.value.toLowerCase();
        renderMatches(allMatches.length);
        const cards = document.querySelectorAll('.match-card');
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

document.addEventListener('DOMContentLoaded', loadInitialData);