document.addEventListener('DOMContentLoaded', function() {
  const competitionId = 1; //sessionStorage.getItem('CompetitionID');

  fetchTransactionHistory(competitionId);


});



async function fetchTransactionHistory(competitionId) {
  try {
      const response = await fetch(`http://localhost:5500/organisers/transactions/${competitionId}`);
      const transactions = await response.json();

      const transactionHistory = document.getElementById('transaction-history');
      transactionHistory.innerHTML = '';

      transactions.forEach(transaction => {
          const listItem = document.createElement('li');
          listItem.textContent = `TeamID: ${transaction.TeamID}, Date: ${transaction.TransactionTime}, Stock: ${transaction.StockSymbol}, 
                                  Quantity: ${transaction.Quantity}, Price: $${transaction.Price}, Type: ${transaction.TransactionType}`;
          transactionHistory.appendChild(listItem);
      });
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

function updateTimer() {
  const timerElement = document.getElementById('timer');
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  timerElement.textContent = `${hours}:${minutes}:${seconds}`;
}

setInterval(updateTimer, 1000);
updateTimer();
