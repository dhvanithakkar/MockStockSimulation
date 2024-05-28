// Function to fetch leaderboard data
async function fetchLeaderboard(competitionID) {
    try {
        const response = await fetch(`http://localhost:5500/organiser/leaderboard/${competitionID}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        return [];
    }
}

// Function to display leaderboard
async function displayLeaderboard(competitionID) {
    const leaderboardData = await fetchLeaderboard(competitionID);
    const leaderboardContainer = document.querySelector('.rectangle-box.leaderboard');

    // Clear existing leaderboard items, but keep the heading
    leaderboardContainer.innerHTML = '<h2>Leaderboard</h2>';

    leaderboardData.forEach((team, index) => {
        const leaderboardItem = document.createElement('div');
        leaderboardItem.classList.add('leaderboard-item');
        leaderboardItem.innerHTML = `
            <span class="position">${index + 1}</span>
            <span class="team-name">${team.TeamName}</span>
            <span class="total-net-worth">$${team.TotalNetWorth}</span>
        `;
        leaderboardContainer.appendChild(leaderboardItem);
    });
}

// Function to logout
function logout() {
    // Redirect to index.html
    window.location.href = 'index.html';
}

// Function to toggle user details panel
function toggleUserDetailsPanel() {
    var panel = document.getElementById("userDetailsPanel");
    panel.classList.toggle("show");
}

function toggleCheckboxes() {
    const checkboxes = document.querySelectorAll('.stock-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.style.display = checkbox.style.display === 'none' ? 'inline-block' : 'none';
    });
}

// Function to update charts whenever a checkbox is clicked
function handleCheckboxClick(event) {
    const clickedElement = event.target;

    // Check if the clicked element is a checkbox
    if (clickedElement.classList.contains('stock-checkbox')) {
        displaySelectedCharts();
    }
}

// Attach event listener to a parent element containing all the checkboxes
document.querySelector('.stock-list').addEventListener('click', handleCheckboxClick);


// Function to fetch graph data
async function fetchGraphData(competitionID, stockSymbol) {
    try {
        fetch(`http://localhost:5500/forgraph/${competitionID}/${stockSymbol}`)
            .then(response => response.json())
            .then(data => {
                const prices = data.map(item => item.price);
                const timestamps = data.map(item => new Date(item.timest).toLocaleString());})
                .catch(error => console.error('Error fetching data:', error));
    } catch (error) {
        console.error('Error fetching graph data:', error);
        return [];
    }
}

// Function to create a chart for a company
function createChart(chartId, data, timestamps, detailsId) {
    var ctx = document.getElementById(chartId).getContext('2d');
    var detailsContainer = document.getElementById(detailsId);
    var chartContainer = detailsContainer.getElementById('chartContainer');

    chartContainer.style.width = '75%';
    chartContainer.style.height = '100%';

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: timestamps,
            datasets: [{
                label: chartId.split('-')[0] + ' Stock Price',
                data: data,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// Function to display selected charts
async function displaySelectedCharts() {
    const chartContainer = document.getElementById('chartContainer');
    chartContainer.innerHTML = ''; // Clear existing charts

    const checkboxes = document.querySelectorAll('.stock-checkbox');
    for (let checkbox of checkboxes) {
        if (checkbox.checked) {
            const companyName = checkbox.parentElement.querySelector('.stock-name').textContent;
            const stockSymbol = companyName; // Assuming stock symbol is the company name
            const data = await fetchGraphData(1, stockSymbol); // Replace 1 with the actual CompetitionID
            createChart(chartId, data, timestamps, detailsId);
        }
    }
}

// Function to update the timer
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

function renderPortfolio(stockData) {
    const totalInvestment = document.getElementById('totalInvestment');
    const returnofinvestment = document.getElementById('percent');
    totalInvestment.innerHTML = '';

    let sum1 = 0;
    let sum2 = 0;
    var stockList = document.getElementById("stockListBox").getElementsByClassName("stock-list")[0];

    // Clear any existing list items
    stockList.innerHTML = "";

    for (var i = 0; i < stockData.length; i++) {
        var stockItem = document.createElement("li");
        stockItem.className = "stock-item";

        // Create checkbox element
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "stock-checkbox";
        stockItem.appendChild(checkbox);

        // Create span element for company name
        var companyName = document.createElement("span");
        companyName.className = "stock-name";
        companyName.textContent = stockData[i].StockSymbol; 
        stockItem.appendChild(companyName);

        // Create span element for stock value
        var stockValue = document.createElement("span");
        stockValue.className = "stock-value";
        stockValue.textContent = stockData[i].CurrentPrice; 
        stockItem.appendChild(stockValue);

        // Create span element for arrow (up or down)
        const profitLoss = ((stockData[i].CurrentPrice - (stockData[i].TotalAmountInvested / stockData[i].CurrentHoldings)) * stockData[i].CurrentHoldings).toFixed(4);
        const profitLossClass = profitLoss >= 0 ? 'arrow arrow-up' : 'arrow arrow-down';
        var arrow = document.createElement("span");
        arrow.className = profitLossClass;
        arrow.textContent = profitLoss >= 0 ? '↑' : '↓';
        stockItem.appendChild(arrow);

        // Append the new list item to the stock list
        stockList.appendChild(stockItem);
        sum1 = sum1 + Number(stockData[i].TotalAmountInvested);
        sum2 = sum2 + Number(stockData[i].TotalMarketValue);
    }

    totalInvestment.innerHTML = "$ " + sum1;
    const roi = ((sum2 - sum1) / sum1 * 100).toFixed(4);
    returnofinvestment.innerHTML = roi + "%";
}

// Function to fetch wallet data
async function fetchWalletData(competitionID, teamID) {
    try {
        const response = await fetch(`http://localhost:5500/mywallet/${competitionID}/${teamID}`);
        const data = await response.json();
        return data.CurrentCash;
    } catch (error) {
        console.error('Error fetching wallet data:', error);
        return 0; // Default to 0 if there's an error
    }
}

// Function to display wallet data
async function displayWalletData(competitionID, teamID) {
    const walletValue = await fetchWalletData(competitionID, teamID);
    const walletValueElement = document.getElementById('walletValue');
    walletValueElement.textContent = `$${walletValue}`;
}

// Function to fetch portfolio data
async function fetchPortfolioData(competitionId, teamId) {
    try {
        const response = await fetch(`http://localhost:5500/portfolio/${competitionId}/${teamId}`);
        const portfolio = await response.json();
        renderPortfolio(portfolio);
    } catch (error) {
        console.error('Error fetching portfolio:', error);
    }
}
// Function to fetch transaction history data
async function fetchTransactionHistory(competitionId, teamId) {
    try {
        const response = await fetch(`http://localhost:5500/organisers/transactions/${competitionId}?teamId=${teamId}`);
        const transactionHistory = await response.json();
        renderTransactionHistory(transactionHistory);
    } catch (error) {
        console.error('Error fetching transaction history:', error);
    }
}

function renderTransactionHistory(transactionHistory) {
    const historyContainer = document.getElementById('history-list');
    historyContainer.innerHTML = '<h2>Recent Transactions</h2>';
    const maxTransactions = 5;
    const transactionCount = Math.min(transactionHistory.length, maxTransactions);
    
    for (let i = 0; i < transactionCount; i++) {
        const transaction = transactionHistory[i];
        const historyItem = document.createElement("div");
        historyItem.className = "history-item";
    
        // Display transaction details
        historyItem.innerHTML = `
            <span class="transaction-type">${transaction.TransactionType}</span>
            <span class="stock-symbol">${transaction.StockSymbol}</span>
            <span class="quantity">${transaction.Quantity}</span>
            <span class="price">${transaction.Price}</span>
            <span class="timestamp">${transaction.TransactionTime}</span>
        `;
    
        historyContainer.appendChild(historyItem);
    }
    
}



// Initial function calls
const competitionID = 1;
const teamID = 1; //sessionStorage.getItem('teamId');
displayWalletData(competitionID, teamID);
displayLeaderboard(competitionID);
fetchPortfolioData(competitionID, teamID);
fetchTransactionHistory(competitionID, teamID);

