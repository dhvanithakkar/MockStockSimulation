document.addEventListener('DOMContentLoaded', function() {
  // Fetch and display transactions when the page loads
  fetchTransactions();

  // Function to fetch transaction history from the backend API
  async function fetchTransactions() {
    const competitionId = 1;  // Replace with the actual competition ID or retrieve dynamically
    const url = `/organisers/transactions/${competitionId}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const transactions = await response.json();
      displayTransactions(transactions);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  }

  // Function to display transaction history
  function displayTransactions(transactions) {
    const transactionList = document.getElementById('transactionList');
    transactionList.innerHTML = '';

    transactions.forEach(transaction => {
      const listItem = document.createElement('li');
      listItem.innerHTML = `
        <strong>${transaction.TransactionType}:</strong> ${transaction.Quantity} shares of ${transaction.StockSymbol} at $${transaction.Price.toFixed(2)} (${transaction.Timestamp})
      `;
      transactionList.appendChild(listItem);
    });
  }

  function logout() {
    // Redirect to index.html
    window.location.href = 'index.html';
  }

  // Function to toggle user details panel
  function toggleUserDetailsPanel() {
    var panel = document.getElementById("userDetailsPanel");
    panel.classList.toggle("show");
  }
});
