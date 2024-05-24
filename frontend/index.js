document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;
    const loginFeedback = document.getElementById("loginFeedback");

    try {
        const response = await fetch('/logincredentials');
        const credentials = await response.json();
        
        const user = credentials.find(user => user.TeamID === username && user.TeamPassword === password);
        
        if (user) {
            if (role === "user") {
                window.location.href = "dashboard.html";
            } else if (role === "admin") {
                window.location.href = "admin_game.html";
            }
        } else {
            loginFeedback.textContent = "Invalid username or password.";
        }
    } catch (error) {
        console.error('Error fetching login credentials:', error);
        loginFeedback.textContent = "Error logging in. Please try again later.";
    }
});
