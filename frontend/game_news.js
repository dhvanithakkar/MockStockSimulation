document.addEventListener("DOMContentLoaded", function() {
  const newsForm = document.getElementById("newsForm");
  const newsList = document.getElementById("newsList");
  const competitionID = sessionStorage.getItem('CompetitionID');

  // Function to fetch and display news
  async function fetchAndDisplayNews() {
    try {
      const response = await fetch('http://localhost:5500/news/display', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ CompetitionID: competitionID })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch news entries');
      }

      const newsEntries = await response.json();
      console.log(newsEntries);

      // Clear the news list
      newsList.innerHTML = '';

      if (newsEntries.message) {
        newsList.innerHTML = '<p>No news entries found.</p>';
      } else {
        newsEntries[0].forEach(news => {
          console.log("item", news.Title, news.Content);
          const newsItem = document.createElement("div");
          newsItem.classList.add("news-item");
          newsItem.innerHTML = `
            <h3>${news.Title}</h3>
            <p>${news.Content}</p>
          `;
          newsList.appendChild(newsItem);
        });
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error displaying news entries');
    }
  }

  // Initial fetch and display of news
  fetchAndDisplayNews();

  newsForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const newsTitle = document.getElementById("newsTitle").value;
    const newsContent = document.getElementById("newsContent").value;

    const newsData = {
      title: newsTitle,
      content: newsContent,
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

      // Clear the form fields
      newsForm.reset();

      // Fetch and display news after creating a new entry
      fetchAndDisplayNews();

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
