document.addEventListener("DOMContentLoaded", function() {
    const newsForm = document.getElementById("newsForm");
    const newsList = document.getElementById("newsList");
  
    newsForm.addEventListener("submit", function(event) {
      event.preventDefault();
  
      const newsTitle = document.getElementById("newsTitle").value;
      const newsContent = document.getElementById("newsContent").value;
  
      // Create a new news item
      const newsItem = document.createElement("div");
      newsItem.classList.add("news-item");
      newsItem.innerHTML = `
        <h3>${newsTitle}</h3>
        <p>${newsContent}</p>
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
