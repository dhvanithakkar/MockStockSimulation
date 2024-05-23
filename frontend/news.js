function logout() {
    // Redirect to index.html
    window.location.href = 'index.html';
}
    function toggleUserDetailsPanel() {
            var panel = document.getElementById("userDetailsPanel");
            panel.classList.toggle("show");
        }
    // Sample news data for demonstration
    var news = [
        { headline: "Company A Reports Better-Than-Expected Earnings", impact: "+2%" },
        { headline: "New Government Regulation Affects Tech Stocks", impact: "-3%" },
        { headline: "Oil Prices Surge Due to Geopolitical Tensions", impact: "+5%" }
    ];

    // Function to display news items
    function displayNews() {
        var newsContainer = document.getElementById('news-container');
        newsContainer.innerHTML = '';
        news.forEach(function(item) {
            var newsItem = document.createElement('div');
            newsItem.classList.add('news-item');
            newsItem.innerHTML = `<strong>${item.headline}</strong> <span>(${item.impact})</span>`;
            newsItem.addEventListener('click', function() {
                showNotification(item.headline);
            });
            newsContainer.appendChild(newsItem);
        });
    }

    // Function to show notification
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

    // Display initial news items
    displayNews();
    function updateTimer() {
            const timerElement = document.getElementById('timer');
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            timerElement.textContent = `${hours}:${minutes}:${seconds}`;
        }

        setInterval(updateTimer, 1000); // Update the timer every second
        updateTimer(); // Initialize the timer immediately