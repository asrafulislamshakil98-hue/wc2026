let matchEditMode = false; let matchEditId = null;
let blogEditMode = false; let blogEditId = null;
const YT_API_KEY = "AIzaSyBLoZyUB5UIEAD4l4zenIowH1tZeYSQ_6Q"; 

function showCard(cardId, btn) {
    document.querySelectorAll('.admin-card').forEach(c => c.classList.remove('active-card'));
    document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(cardId).classList.add('active-card');
    btn.classList.add('active');
    if(cardId === 'points-card') loadPointsEditor();
}

const countryData = {
    "mexico": { code: "mx", squad: "G. Ochoa, Edson Álvarez, H. Lozano, Santiago Giménez, Raúl Jiménez" },
    "south africa": { code: "za", squad: "Ronwen Williams, T. Mokoena, Percy Tau, Mothobi Mvala, Themba Zwane" },
    "korea republic": { code: "kr", squad: "Son Heung-min, Kim Min-jae, Lee Kang-in, Hwang Hee-chan, Jo Hyeon-woo" },
    "czechia": { code: "cz", squad: "Patrik Schick, Tomáš Souček, Adam Hložek, Vladimír Coufal, Jan Kuchta" },
    "canada": { code: "ca", squad: "Alphonso Davies, Jonathan David, Cyle Larin, Stephen Eustáquio, Milan Borjan" },
    "bosnia & herzegovina": { code: "ba", squad: "Edin Džeko, Miralem Pjanić, Sead Kolašinac, Rade Krunić, Amar Dedić" },
    "usa": { code: "us", squad: "Christian Pulisic, Weston McKennie, Gio Reyna, Tyler Adams, Matt Turner" },
    "paraguay": { code: "py", squad: "Miguel Almirón, Julio Enciso, Gustavo Gómez, Robert Rojas, Mathías Galarza" },
    "qatar": { code: "qa", squad: "Akram Afif, Almoez Ali, Hassan Al-Haydos, Pedro Miguel, Boualem Khoukhi" },
    "switzerland": { code: "ch", squad: "Granit Xhaka, Manuel Akanji, Yann Sommer, Xherdan Shaqiri, Breel Embolo" },
    "brazil": { code: "br", squad: "Vinícius Jr, Rodrygo, Neymar Jr, Bruno Guimarães, Marquinhos, Alisson Becker" },
    "morocco": { code: "ma", squad: "Achraf Hakimi, Hakim Ziyech, Sofyan Amrabat, Yassine Bounou, Brahim Díaz" },
    "haiti": { code: "ht", squad: "Duckens Nazon, Frantzdy Pierrot, Ricardo Adé, Johny Placide, Bryan Alceus" },
    "scotland": { code: "gb-sct", squad: "Andy Robertson, Scott McTominay, John McGinn, Billy Gilmour, Che Adams" },
    "australia": { code: "au", squad: "Mathew Ryan, Harry Souttar, Jackson Irvine, Craig Goodwin, Mitchell Duke" },
    "türkiye": { code: "tr", squad: "Hakan Çalhanoğlu, Arda Güler, Kenan Yıldız, Kerem Aktürkoğlu, Ferdi Kadıoğlu" },
    "germany": { code: "de", squad: "Jamal Musiala, Florian Wirtz, Kai Havertz, Joshua Kimmich, Manuel Neuer" },
    "curaçao": { code: "cw", squad: "Eloy Room, Leandro Bacuna, Juninho Bacuna, Cuco Martina, Rangelo Janga" },
    "netherlands": { code: "nl", squad: "Virgil van Dijk, Memphis Depay, Cody Gakpo, Frenkie de Jong, Nathan Aké" },
    "japan": { code: "jp", squad: "Wataru Endo, Takefusa Kubo, Kaoru Mitoma, Takumi Minamino, Takehiro Tomiyasu" },
    "ivory coast": { code: "ci", squad: "Franck Kessié, Sébastien Haller, Seko Fofana, Simon Adingra, Nicolas Pépé" },
    "ecuador": { code: "ec", squad: "Enner Valencia, Moisés Caicedo, Pervis Estupiñán, Piero Hincapié, Kendry Páez" },
    "sweden": { code: "se", squad: "Alexander Isak, Viktor Gyökeres, Dejan Kulusevski, Emil Forsberg, Victor Lindelöf" },
    "tunisia": { code: "tn", squad: "Youssef Msakni, Ellyes Skhiri, Hannibal Mejbri, Aïssa Laïdouni, Montassar Talbi" },
    "spain": { code: "es", squad: "Lamine Yamal, Rodri, Pedri, Gavi, Nico Williams, Álvaro Morata" },
    "cabo verde": { code: "cv", squad: "Ryan Mendes, Bebé, Garry Rodrigues, Jovane Cabral, Logan Costa" },
    "belgium": { code: "be", squad: "Kevin De Bruyne, Romelu Lukaku, Jeremy Doku, Leandro Trossard, Thibaut Courtois" },
    "egypt": { code: "eg", squad: "Mohamed Salah, Mostafa Mohamed, Omar Marmoush, Trezeguet, Ahmed Hegazi" },
    "saudi arabia": { code: "sa", squad: "Salem Al-Dawsari, Firas Al-Buraikan, Saud Abdulhamid, Mohamed Kanno" },
    "uruguay": { code: "uy", squad: "Darwin Núñez, Federico Valverde, Luis Suárez, Ronald Araújo, Rodrigo Bentancur" },
    "iran": { code: "ir", squad: "Mehdi Taremi, Sardar Azmoun, Alireza Jahanbakhsh, Saman Ghoddos" },
    "new zealand": { code: "nz", squad: "Chris Wood, Liberato Cacace, Sarpreet Singh, Marko Stamenić" },
    "france": { code: "fr", squad: "Kylian Mbappé, Antoine Griezmann, Ousmane Dembélé, William Saliba" },
    "senegal": { code: "sn", squad: "Sadio Mané, Nicolas Jackson, Kalidou Koulibaly, Édouard Mendy" },
    "iraq": { code: "iq", squad: "Aymen Hussein, Jalal Hassan, Ibrahim Bayesh, Zidane Iqbal" },
    "norway": { code: "no", squad: "Erling Haaland, Martin Ødegaard, Alexander Sørloth, Oscar Bobb" },
    "argentina": { code: "ar", squad: "Lionel Messi, Julián Álvarez, Alexis Mac Allister, Rodrigo De Paul, E. Martínez" },
    "algeria": { code: "dz", squad: "Riyad Mahrez, Baghdad Bounedjah, Ismaël Bennacer, Rayan Aït-Nouri" },
    "austria": { code: "at", squad: "David Alaba, Marcel Sabitzer, Konrad Laimer, Christoph Baumgartner" },
    "jordan": { code: "jo", squad: "Musa Al-Taamari, Yazan Al-Naimat, Mahmoud Al-Mardi" },
    "portugal": { code: "pt", squad: "Cristiano Ronaldo, Bruno Fernandes, Bernardo Silva, Rafael Leão" },
    "congo": { code: "cg", squad: "Silas Katompa Mvumpa, Yoane Wissa, Chancel Mbemba, Gaël Kakuta" },
    "england": { code: "gb-eng", squad: "Harry Kane, Jude Bellingham, Phil Foden, Bukayo Saka, Declan Rice" },
    "croatia": { code: "hr", squad: "Luka Modrić, Mateo Kovačić, Joško Gvardiol, Ivan Perišić" },
    "ghana": { code: "gh", squad: "Mohammed Kudus, Iñaki Williams, Thomas Partey, Jordan Ayew" },
    "panama": { code: "pa", squad: "Adalberto Carrasquilla, José Fajardo, Michael Murillo" },
    "colombia": { code: "co", squad: "Luis Díaz, James Rodríguez, Jhon Durán, Emiliano Martínez" },
    "uzbekistan": { code: "uz", squad: "Eldor Shomurodov, Abbosbek Fayzullaev, Jaloliddin Masharipov" }
};
function updateMatchUI(inputId, imgId, lineupId) {
    const name = document.getElementById(inputId).value.toLowerCase().trim();
    const flagImg = document.getElementById(imgId);
    const lineupTxt = document.getElementById(lineupId);
    if (countryData[name]) {
        flagImg.src = `https://flagcdn.com/w80/${countryData[name].code}.png`;
        flagImg.style.display = "block";
        lineupTxt.value = countryData[name].squad;
    }
}

async function loadMatches() {
    const res = await fetch('/api/matches');
    const matches = await res.json();
    const container = document.getElementById('admin-match-container');
    container.innerHTML = '';
    matches.forEach(m => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <div class="list-info">
                <strong>${m.teamA} vs ${m.teamB}</strong><br>
                <small>${new Date(m.matchDate).toLocaleString('bn-BD')}</small>
            </div>
            <div>
                <button class="action-btn" style="background:orange" onclick="prepareMatchEdit('${m._id}','${m.teamA}','${m.teamB}','${m.matchDate}','${m.venue}','${m.officialStreamUrl}','${m.lineupA}','${m.lineupB}')">এডিট</button>
                <button class="action-btn" style="background:${m.isLive?'green':'gray'}" onclick="toggleLive('${m._id}',${m.isLive})">${m.isLive?'Live OFF':'Live ON'}</button>
                <button class="action-btn" style="background:red" onclick="deleteMatch('${m._id}')">ডিলিট</button>
            </div>`;
        container.appendChild(div);
    });
}

document.getElementById('add-match-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const matchData = {
        teamA: document.getElementById('teamA').value, teamB: document.getElementById('teamB').value,
        matchDate: document.getElementById('matchDate').value, venue: document.getElementById('venue').value,
        officialStreamUrl: document.getElementById('streamUrl').value,
        lineupA: document.getElementById('lineupA').value, lineupB: document.getElementById('lineupB').value,
        teamAFlag: document.getElementById('flagImgA').src, teamBFlag: document.getElementById('flagImgB').src
    };
    const url = matchEditMode ? `/api/edit-match/${matchEditId}` : '/api/add-match';
    await fetch(url, { method: matchEditMode ? 'PUT' : 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(matchData)});
    location.reload();
});

function prepareMatchEdit(id, a, b, date, v, url, lA, lB) {
    matchEditMode = true; matchEditId = id;
    document.getElementById('teamA').value = a; document.getElementById('teamB').value = b;
    document.getElementById('venue').value = v; document.getElementById('streamUrl').value = url;
    document.getElementById('lineupA').value = lA; document.getElementById('lineupB').value = lB;
    document.getElementById('matchDate').value = new Date(date).toISOString().slice(0,16);
    document.getElementById('match-save-btn').innerText = "আপডেট করুন";
    showCard('match-form-card', document.querySelector('[onclick*="match-form-card"]'));
}

async function toggleLive(id, status) {
    await fetch(`/api/update-live/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({isLive: !status})});
    loadMatches();
}

async function deleteMatch(id) {
    if(confirm("নিশ্চিত?")) { await fetch(`/api/delete-match/${id}`, {method:'DELETE'}); loadMatches(); }
}

async function loadBlogs() {
    const res = await fetch('/api/blogs');
    const blogs = await res.json();
    const container = document.getElementById('admin-blog-container');
    container.innerHTML = '';
    blogs.forEach(b => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <div class="list-info"><strong>${b.title}</strong></div>
            <div>
                <button class="action-btn" style="background:orange" onclick="prepareBlogEdit('${b._id}','${b.title}','${b.imageUrl}', \`${b.content}\`)">এডিট</button>
                <button class="action-btn" style="background:red" onclick="deleteBlog('${b._id}')">ডিলিট</button>
            </div>`;
        container.appendChild(div);
    });
}

document.getElementById('add-blog-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const blogData = { title: document.getElementById('blogTitle').value, imageUrl: document.getElementById('blogImage').value, content: document.getElementById('blogContent').value };
    const url = blogEditMode ? `/api/edit-blog/${blogEditId}` : '/api/add-blog';
    await fetch(url, { method: blogEditMode ? 'PUT' : 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(blogData)});
    location.reload();
});

function prepareBlogEdit(id, t, img, c) {
    blogEditMode = true; blogEditId = id;
    document.getElementById('blogTitle').value = t; document.getElementById('blogImage').value = img;
    document.getElementById('blogContent').value = c;
    document.getElementById('blog-save-btn').innerText = "আপডেট করুন";
    showCard('blog-form-card', document.querySelector('[onclick*="blog-form-card"]'));
}

async function deleteBlog(id) {
    if(confirm("ব্লগটি মুছবেন?")) { await fetch(`/api/delete-blog/${id}`, {method:'DELETE'}); loadBlogs(); }
}

async function searchYouTubeLive() {
    const q = document.getElementById('ytSearchInput').value;
    const resDiv = document.getElementById('ytResults');
    resDiv.innerHTML = "খোঁজা হচ্ছে...";
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&eventType=live&type=video&q=${q}&key=${YT_API_KEY}&maxResults=4`);
    const data = await res.json();
    resDiv.innerHTML = '';
    data.items.forEach(item => {
        resDiv.innerHTML += `
            <div style="border:1px solid #ddd; padding:10px; border-radius:8px; text-align:center">
                <img src="${item.snippet.thumbnails.medium.url}" style="width:100%; cursor:pointer" onclick="previewVideo('${item.id.videoId}')">
                <p style="font-size:12px; font-weight:bold; height:30px; overflow:hidden">${item.snippet.title}</p>
                <button class="action-btn" style="background:green; width:100%" onclick="document.getElementById('streamUrl').value='https://www.youtube.com/watch?v=${item.id.videoId}'; alert('লিঙ্ক কপি হয়েছে')">লিঙ্ক নিন</button>
            </div>`;
    });
}

function previewVideo(id) {
    document.getElementById('modalPlayer').innerHTML = `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${id}?autoplay=1" frameborder="0" allowfullscreen></iframe>`;
    document.getElementById('videoModal').style.display = 'flex';
}
function closePreview() { document.getElementById('videoModal').style.display = 'none'; document.getElementById('modalPlayer').innerHTML = ''; }

async function syncPoints() {
    const statusText = document.getElementById('sync-status');
    statusText.innerText = "সিঙ্কিং হচ্ছে... দয়া করে অপেক্ষা করুন।";
    statusText.style.color = "orange";

    try {
        // আমাদের আগের তৈরি করা পয়েন্ট টেবিল API-টি কল করা হচ্ছে
        const response = await fetch('/api/points-table');
        
        if (response.ok) {
            statusText.innerText = "✅ পয়েন্ট টেবিল সফলভাবে ডাটাবেসের সাথে আপডেট করা হয়েছে!";
            statusText.style.color = "green";
            
            // ৩ সেকেন্ড পর মেসেজটি চলে যাবে
            setTimeout(() => {
                statusText.innerText = "";
            }, 3000);
        } else {
            throw new Error("Failed");
        }
    } catch (error) {
        statusText.innerText = "❌ পয়েন্ট আপডেট করতে সমস্যা হয়েছে। সার্ভার চেক করুন।";
        statusText.style.color = "red";
    }
}

async function loadPointsEditor() {
    const res = await fetch('/api/all-points');
    const points = await res.json();
    const container = document.getElementById('admin-points-list');
    container.innerHTML = '';

    points.forEach(p => {
        container.innerHTML += `
            <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding:10px;"><img src="${p.teamFlag}" width="20"> ${p.teamName}</td>
                <td><input type="number" id="mp-${p._id}" value="${p.mp}" style="width:40px"></td>
                <td><input type="number" id="w-${p._id}" value="${p.w}" style="width:40px"></td>
                <td><input type="number" id="d-${p._id}" value="${p.d}" style="width:40px"></td>
                <td><input type="number" id="l-${p._id}" value="${p.l}" style="width:40px"></td>
                <td><input type="number" id="pts-${p._id}" value="${p.pts}" style="width:45px; font-weight:bold;"></td>
                <td><button onclick="saveManualPoint('${p._id}')" style="background:green; color:white; padding:5px; border-radius:4px; cursor:pointer;">Save</button></td>
            </tr>`;
    });
}

async function saveManualPoint(id) {
    const updatedData = {
        mp: document.getElementById(`mp-${id}`).value,
        w: document.getElementById(`w-${id}`).value,
        d: document.getElementById(`d-${id}`).value,
        l: document.getElementById(`l-${id}`).value,
        pts: document.getElementById(`pts-${id}`).value
    };

    await fetch(`/api/update-single-point/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
    });
    alert("আপডেট হয়েছে!");
}
document.getElementById('add-video-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        title: document.getElementById('vidTitle').value,
        youtubeUrl: document.getElementById('vidUrl').value,
        thumbnail: document.getElementById('vidThumb').value
    };
    await fetch('/api/add-video', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    alert("ভিডিও সফলভাবে আপলোড হয়েছে!");
    location.reload();
});
loadMatches(); loadBlogs();