function logout() {
    // Redirect to index.html
    window.location.href = 'index.html';
}
        function toggleUserDetailsPanel() {
            var panel = document.getElementById("userDetailsPanel");
            panel.classList.toggle("show");
        }
        function navigateToSector(sector) {
            window.location.href = `${sector}.html`;
        }
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
        function logout() {
    // Redirect to index.html
    window.location.href = 'index.html';
}
