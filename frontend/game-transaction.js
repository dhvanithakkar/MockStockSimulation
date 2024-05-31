document.addEventListener('DOMContentLoaded', function() {
  const competitionId = sessionStorage.getItem('CompetitionID');

  fetchTransactionHistory(competitionId);


});



async function fetchTransactionHistory(competitionId) {
  try {
      const response = await fetch(`http://localhost:5500/organisers/transactions/${competitionId}`);
      const transactions = await response.json();

      const transactionHistoryContainer = document.getElementById('transaction-history-container');
      transactionHistoryContainer.innerHTML = '';

      // Create table element
      const historyTable = document.createElement('table');
      historyTable.className = 'history-table';

      // Create table header
      const headerRow = document.createElement('tr');
      headerRow.innerHTML = `
          <th>Team ID</th>
          <th>Date</th>
          <th>Stock Symbol</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Type</th>
      `;
      historyTable.appendChild(headerRow);

      // Add transaction details as table rows
      transactions.forEach(transaction => {
          const row = document.createElement('tr');
          row.innerHTML = `
              <td>${transaction.TeamID}</td>
              <td>${transaction.TransactionTime}</td>
              <td>${transaction.StockSymbol}</td>
              <td>${transaction.Quantity}</td>
              <td>INR ${transaction.Price}</td>
              <td>${transaction.TransactionType}</td>
          `;
          historyTable.appendChild(row);
      });

      // Append table to transaction history container
      transactionHistoryContainer.appendChild(historyTable);
  } catch (error) {
      console.error('Error fetching transaction history:', error);
  }
}



function logout() {
  window.location.href = 'index.html';
}

function toggleUserDetailsPanel() {
  const panel = document.getElementById("userDetailsPanel");
  panel.classList.toggle("show");
}

function renderGraph(stock, stockItem) {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 200;
  canvas.classList.add('graph-canvas');
  stockItem.insertAdjacentElement('afterend', canvas);

  const ctx = canvas.getContext('2d');
  const chart = new Chart(ctx, {
      type: 'line',
      data: {
          labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
          datasets: [{
              label: `${stock.StockSymbol}`,
              data: [65, 59, 80, 81, 56, 55, 40],
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
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

  canvas.addEventListener('click', function(event) {
      event.stopPropagation();
      canvas.remove();
      openedGraphs[stock.StockSymbol] = false;
      chart.destroy();
  });
}


setInterval(updateTimer, 1000);
updateTimer();
