document.addEventListener("DOMContentLoaded", function() {
  const newsForm = document.getElementById("newsForm");
  const newsList = document.getElementById("newsList");
  const competitionID = 1;  

  newsForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const newsTitle = document.getElementById("newsTitle").value;
    const newsContent = document.getElementById("newsContent").value;

    const newsData = {
      title: Title,
      content: Content,
      CompetitionID: competitionID
    };

    try {
      const response = await fetch('http://localhost:5500/news/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newsData)
      });

      if (!response.ok) {
        throw new Error('Failed to create news entry');
      }

      const result = await response.json();
      console.log(result.message);

      // Create a new news item
      const newsItem = document.createElement("div");
      newsItem.classList.add("news-item");
      newsItem.innerHTML = `
        <h3>${newsTitle}</h3>
        <p>${newsContent}</p>
      `;

      // Append the new news item to the news list
      newsList.appendChild(newsItem);

      // Clear the form fields
      newsForm.reset();

    } catch (error) {
      console.error('Error:', error);
      alert('Error creating news entry');
    }
  });

  // Function to log out
  function logout() {
    // Redirect to index.html
    window.location.href = 'index.html';
  }

  // Function to toggle user details panel
  function toggleUserDetailsPanel() {
    const panel = document.getElementById("userDetailsPanel");
    panel.classList.toggle("show");
  }
});
