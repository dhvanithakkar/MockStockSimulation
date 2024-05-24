document.addEventListener('DOMContentLoaded', function() {
    const competitionId = 1; // Example competition ID
    const teamId = 1; // Example team ID, replace with actual value

    fetchTransactionHistory(competitionId, teamId);
});

async function fetchTransactionHistory(competitionId, teamId) {
    try {
        const response = await fetch(`/organisers/transactions/${competitionId}?teamId=${teamId}`);
        const transactions = await response.json();

        const transactionHistory = document.getElementById('transaction-history');
        transactionHistory.innerHTML = '';

        transactions.forEach(transaction => {
            const listItem = document.createElement('li');
            listItem.textContent = `Date: ${transaction.TranationTime}, Stock: ${transaction.StockSymbol}, 
                                    Quantity: ${transaction.Quantity}, Price: ${transaction.Price}`;
            transactionHistory.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching transaction history:', error);
    }
}

function logout() {
    // Redirect to index.html
    window.location.href = 'index.html';
}

function toggleUserDetailsPanel() {
    var panel = document.getElementById("userDetailsPanel");
    panel.classList.toggle("show");
}

// Sample data for demonstration
var stocks = [
    { name: "Company A", symbol: "AAA", quantity: 10, priceBought: 50, currentPrice: 60 },
    { name: "Company B", symbol: "BBB", quantity: 20, priceBought: 30, currentPrice: 25 }
];

// Object to store opened graphs
var openedGraphs = {};

// Populate portfolio section
var portfolioSection = document.getElementById('portfolio');
stocks.forEach(function(stock) {
    var profitLoss = ((stock.currentPrice - stock.priceBought) * stock.quantity).toFixed(2);
    var profitLossClass = profitLoss >= 0 ? 'green' : 'red';
    var stockItem = document.createElement('div');
    stockItem.classList.add('stock-item');
    stockItem.innerHTML = `
        <span>${stock.name} (${stock.symbol}) - ${stock.quantity} units</span>
        <span>Price Bought: $${stock.priceBought}</span>
        <span>Current Price: $${stock.currentPrice}</span>
        <span class="${profitLossClass} profit-loss">Profit/Loss: $${profitLoss}</span>
    `;
    stockItem.addEventListener('click', function() {
        if (!openedGraphs[stock.symbol]) {
            renderGraph(stock, stockItem);
            openedGraphs[stock.symbol] = true;
        }
    });
    portfolioSection.appendChild(stockItem);
});

// Function to render graph
function renderGraph(stock, stockItem) {
    // Create a canvas element for the graph
    var canvas = document.createElement('canvas');
    canvas.width = 400; // Adjust width as needed
    canvas.height = 200; // Adjust height as needed
    canvas.classList.add('graph-canvas'); // Add a class for easier selection

    // Insert the canvas element just below the clicked stock item
    stockItem.insertAdjacentElement('afterend', canvas);

    var ctx = canvas.getContext('2d');
    var chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
            datasets: [{
                label: `${stock.name} (${stock.symbol})`,
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

    // Add click event to close the graph
    canvas.addEventListener('click', function(event) {
        // Prevent event propagation to the canvas element, so it doesn't trigger the closing immediately
        event.stopPropagation();
        // Remove the canvas
        canvas.remove();
        // Update the openedGraphs object
        openedGraphs[stock.symbol] = false;
        // Remove the chart instance
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

setInterval(updateTimer, 1000); // Update the timer every second
updateTimer(); // Initialize the timer immediately
