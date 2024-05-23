document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();
    var role = document.getElementById("role").value;
    if (role === "user") {
        window.location.href = "dashboard.html";
    } else if (role === "admin") {
        window.location.href = "admin_game.html";
    }
});
