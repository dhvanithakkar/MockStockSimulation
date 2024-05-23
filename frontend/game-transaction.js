// Dummy transaction data
let transactions = [
    { id: 1, type: 'Buy', stock: 'AAPL', quantity: 10, price: 150.25, timestamp: '2024-05-25 09:30:00' },
    { id: 2, type: 'Sell', stock: 'GOOGL', quantity: 5, price: 2750.50, timestamp: '2024-05-25 10:15:00' },
    { id: 3, type: 'Buy', stock: 'MSFT', quantity: 8, price: 260.75, timestamp: '2024-05-25 11:00:00' }
  ];
  
  // Function to display transaction history
  function displayTransactions() {
    const transactionList = document.getElementById('transactionList');
    transactionList.innerHTML = '';
  
    transactions.forEach(transaction => {
      const listItem = document.createElement('li');
      listItem.innerHTML = `
        <strong>${transaction.type}:</strong> ${transaction.quantity} shares of ${transaction.stock} at $${transaction.price.toFixed(2)} (${transaction.timestamp})
      `;
      transactionList.appendChild(listItem);
    });
  }
  
  // Initial display of transaction history
  displayTransactions();
  function logout() {
    // Redirect to index.html
    window.location.href = 'index.html';
}

// Function to toggle user details panel
function toggleUserDetailsPanel() {
    var panel = document.getElementById("userDetailsPanel");
    panel.classList.toggle("show");
}
  