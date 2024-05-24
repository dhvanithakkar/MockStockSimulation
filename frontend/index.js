document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    
    let username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;
    const loginFeedback = document.getElementById("loginFeedback");

    console.log('Form submitted');
    console.log('Username:', username);
    console.log('Password:', password);
    console.log('Role:', role);

    try {
        const response = await fetch('http://localhost:5500/logincredentials');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const credentials = await response.json();
        console.log('Fetched credentials:', credentials);
        username = parseInt(username, 10);
        const user = credentials.find(user => user.TeamID === username && user.TeamPassword === password);
        
        if (user) {
            console.log('User authenticated');
            if (role === "user") {
                window.location.href = "dashboard.html";
            } else if (role === "admin") {
                window.location.href = "admin_game.html";
            }
        } else {
            console.log('Invalid username or password');
            loginFeedback.textContent = "Invalid username or password.";
        }
    } catch (error) {
        console.error('Error fetching login credentials:', error);
        loginFeedback.textContent = "Error logging in. Please try again later.";
    }
});
