// Dummy data for stocks
let stocks = [
    { name: 'AAPL', price: 150.25, history: [145, 148, 152, 150, 153, 155] },
    { name: 'GOOGL', price: 2750.50, history: [2745, 2760, 2755, 2770, 2758, 2765] },
    { name: 'MSFT', price: 260.75, history: [258, 262, 261, 259, 263, 260] }
  ];
  
  // Function to display stocks list
  function displayStocks() {
    const stocksList = document.getElementById('stocksList');
    stocksList.innerHTML = '';
  
    stocks.forEach(stock => {
      const listItem = document.createElement('li');
      listItem.innerHTML = `
        <strong>${stock.name}</strong>
        <p>Price: $${stock.price}</p>
      `;
      listItem.addEventListener('click', () => {
        showStockDetails(stock);
      });
      stocksList.appendChild(listItem);
    });
  }
  
  // Function to show detailed information about a stock
  function showStockDetails(stock) {
    const stockDetails = document.getElementById('stockDetails');
    stockDetails.innerHTML = `
      <h2>${stock.name}</h2>
      <p>Price: $${stock.price}</p>
      <canvas id="stockGraph"></canvas>
    `;
  
    const ctx = document.getElementById('stockGraph').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Price',
          data: stock.history,
          borderColor: '#007bff',
          borderWidth: 2,
          fill: false
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    });
  }
  
  // Initial display of stocks
  displayStocks();
  function logout() {
    // Redirect to index.html
    window.location.href = 'index.html';
}

// Function to toggle user details panel
function toggleUserDetailsPanel() {
    var panel = document.getElementById("userDetailsPanel");
    panel.classList.toggle("show");
}