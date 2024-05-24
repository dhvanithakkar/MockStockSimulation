document.addEventListener("DOMContentLoaded", function() {
    const newsForm = document.getElementById("newsForm");
    const newsList = document.getElementById("newsList");
  
    newsForm.addEventListener("submit", function(event) {
      event.preventDefault();
  
      const newsTitle = document.getElementById("newsTitle").value;
      const newsContent = document.getElementById("newsContent").value;
      const scheduleTime = document.getElementById("scheduleTime").value;
  
      // Create a new news item
      const newsItem = document.createElement("div");
      newsItem.classList.add("news-item");
      newsItem.innerHTML = `
        <h3>${newsTitle}</h3>
        <p>${newsContent}</p>
        <p><strong>Scheduled Time:</strong> ${scheduleTime}</p>
        <button class="delete-btn">Delete</button>
      `;
  
      // Append the new news item to the news list
      newsList.appendChild(newsItem);
  
      // Clear the form fields
      newsForm.reset();
  
      // Schedule news item if schedule time is provided
      if (scheduleTime) {
        scheduleNewsItem(newsItem, scheduleTime);
      }
    });
  
    // Handle news item deletion
    newsList.addEventListener("click", function(event) {
      if (event.target.classList.contains("delete-btn")) {
        event.target.parentElement.remove();
      }
    });
  
    function scheduleNewsItem(newsItem, scheduleTime) {
      const currentTime = new Date();
      const scheduledTime = new Date(scheduleTime);
  
      // Calculate time difference in milliseconds
      const timeDiff = scheduledTime - currentTime;
  
      if (timeDiff > 0) {
        setTimeout(function() {
          newsItem.classList.add("scheduled");
        }, timeDiff);
      }
    }
  });
  function logout() {
    // Redirect to index.html
    window.location.href = 'index.html';
}

// Function to toggle user details panel
function toggleUserDetailsPanel() {
    var panel = document.getElementById("userDetailsPanel");
    panel.classList.toggle("show");
}
  