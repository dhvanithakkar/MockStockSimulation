function logout() {
    window.location.href = 'index.html';
}

function toggleUserDetailsPanel() {
    var panel = document.getElementById("userDetailsPanel");
    panel.classList.toggle("show");
}

async function fetchNews() {
    try {
        const response = await fetch('http://localhost:5500/news/display', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ CompetitionID: 1 }) // Replace with actual CompetitionID
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const news = await response.json();
        displayNews(news);
    } catch (error) {
        console.error('Failed to fetch news:', error);
    }
}

function displayNews(news) {
    var newsContainer = document.getElementById('news-container');
    newsContainer.innerHTML = '';
    news[0].forEach(function(item) {
        var newsItem = document.createElement('div');
        newsItem.classList.add('news-item');
        newsItem.innerHTML = `<strong>${item.Title}</strong> <span>(${item.Content})</span>`;
        newsItem.addEventListener('click', function() {
            showNotification(item.Title);
        });
        newsContainer.appendChild(newsItem);
    });
}

function showNotification(headline) {
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
        var notification = new Notification(headline);
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {
            if (permission === "granted") {
                var notification = new Notification(headline);
            }
        });
    }
}

function updateTimer() {
    const timerElement = document.getElementById('timer');
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    timerElement.textContent = `${hours}:${minutes}:${seconds}`;
}

setInterval(updateTimer, 1000);
updateTimer();
fetchNews();
