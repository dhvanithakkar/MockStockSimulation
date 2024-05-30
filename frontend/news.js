function logout() {
    window.location.href = 'index.html';
}
const CompetitionID = 1;//sessionStorage.getItem('CompetitionID');
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
            body: JSON.stringify({ CompetitionID: CompetitionID }) 
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

async function fetchEndTime(competitionID) {
    try {
        const response = await fetch(`http://localhost:5500/endTime/${competitionID}`);
        const data = await response.json();
        return new Date(data[0].EndDate); // Assuming the end time is returned as a string
    } catch (error) {
        console.error('Error fetching end time:', error);
        return null;
    }
}

// Function to update the stopwatch timer
async function updateStopwatch() {
    const timerElement = document.getElementById('timer');
    const endTime = await fetchEndTime(1); // Replace 1 with the actual CompetitionID

    if (!endTime) {
        timerElement.textContent = 'Error fetching end time';
        return;
    }

    setInterval(() => {
        const now = new Date();
        const timeDifference = endTime - now;

        if (timeDifference <= 0) {
            timerElement.textContent = 'Competition Ended';
        } else {
            const hours = String(Math.floor(timeDifference / (1000 * 60 * 60))).padStart(2, '0');
            const minutes = String(Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
            const seconds = String(Math.floor((timeDifference % (1000 * 60)) / 1000)).padStart(2, '0');
            timerElement.textContent = `${hours}:${minutes}:${seconds}`;
        }
    }, 1000);
}

// Call the updateStopwatch function to start the timer
updateStopwatch();

