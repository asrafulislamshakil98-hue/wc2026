let allMatches = []; 

async function loadInitialData() {
    const loading = document.getElementById('loading');
    
    try {
        const [matchRes, blogRes] = await Promise.all([
            fetch('/api/matches'),
            fetch('/api/blogs')
        ]);

        allMatches = await matchRes.json();
        const blogs = await blogRes.json();

        if (loading) loading.style.display = 'none';

        renderMatches(2);
        
        renderBlogs(blogs);

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

function renderBlogs(blogs) {
    const container = document.getElementById('home-blog-container');
    if (!container) return;

    container.innerHTML = '';
    
    if (blogs.length === 0) {
        container.innerHTML = "<p style='text-align:center;'>কোনো নিউজ বা ব্লগ নেই।</p>";
        return;
    }

    blogs.forEach(blog => {
        const blogCard = `
            <div class="home-blog-card" onclick="location.href='blog.html'">
                <img src="${blog.imageUrl || 'https://via.placeholder.com/250x180'}" alt="">
                <div class="blog-text">
                    <h3>${blog.title}</h3>
                    <p>${blog.content}</p>
                    <span style="color: #011f4b; font-weight: bold; font-size: 13px;">বিস্তারিত পড়ুন →</span>
                </div>
            </div>`;
        container.innerHTML += blogCard;
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