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

// Function to update the timer
async function fetchEndTime(competitionID) {
    try {
        const response = await fetch(`http://localhost:5500/endTime/${competitionID}`);
        const data = await response.json();
        return new Date(data[0].EndDate);
    } catch (error) {
        console.error('Error fetching end time:', error);
        return null;
    }
}

async function updateStopwatch() {
    const timerElement = document.getElementById('timer');
    const endTime = await fetchEndTime(1); // Replace 1 with the actual CompetitionID

    if (!endTime) {
        timerElement.textContent = 'Error fetching end time';
        return;
    }

    setInterval(() => {
        const now = new Date();
        const timeDifference = endTime - now;

        if (timeDifference <= 0) {
            timerElement.textContent = 'Competition Ended';
        } else {
            const hours = String(Math.floor(timeDifference / (1000 * 60 * 60))).padStart(2, '0');
            const minutes = String(Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
            const seconds = String(Math.floor((timeDifference % (1000 * 60)) / 1000)).padStart(2, '0');
            timerElement.textContent = `${hours}:${minutes}:${seconds}`;
        }
    }, 1000);
}

updateStopwatch();

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

async function fetchAndProcessData() {
    const teamID = sessionStorage.getItem('TeamId');

    try {
        const response = await fetch(`http://localhost:5500/getGameID/${teamID}`);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();

        if (data.length > 0) {
            const competitionID = data[0].CompetitionID;
            sessionStorage.setItem('CompetitionID', competitionID);
        
            const storedCompetitionID = sessionStorage.getItem('CompetitionID');
            
            displayWalletData(storedCompetitionID, teamID);
            displayLeaderboard(storedCompetitionID);
            fetchPortfolioData(storedCompetitionID, teamID);
            fetchTransactionHistory(storedCompetitionID, teamID);
        } else {
            console.log('No CompetitionID found for this TeamID');
        }
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

// Function to fetch graph data for the selected stock and competition
async function fetchGraphData(competitionID, stockSymbol) {
    try {
        const response = await fetch(`http://localhost:5500/forgraph/${competitionID}/${stockSymbol}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching graph data:', error);
        return [];
    }
}

// Function to display the graph in the chart container
async function displayGraph(competitionID, stockSymbol) {
    const graphData = await fetchGraphData(competitionID, stockSymbol);

    if (graphData.length === 0) {
        console.log('No graph data available');
        return;
    }

    const labels = graphData.map(entry => entry.timest);
    const prices = graphData.map(entry => entry.price);

    const ctx = document.getElementById('chartContainer').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${stockSymbol} Price`,
                data: prices,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    }
                },
                y: {
                    beginAtZero: false
                }
            },
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            interaction: {
                mode: 'nearest',
                intersect: false
            }
        }
    });
}

// Function to display selected charts based on checked checkboxes
async function displaySelectedCharts() {
    const checkboxes = document.querySelectorAll('.stock-checkbox');
    const selectedStocks = [];

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const stockItem = checkbox.parentElement;
            const stockSymbol = stockItem.querySelector('.stock-name').textContent;
            selectedStocks.push(stockSymbol);
        }
    });

    const competitionID = sessionStorage.getItem('CompetitionID');

    if (selectedStocks.length > 0) {
        // Display the graph for the first selected stock (you can extend this to display multiple graphs if needed)
        await displayGraph(competitionID, selectedStocks[0]);
    }
}

// Function to initialize the dashboard
async function initializeDashboard() {
    const teamID = 1; // Replace with actual team ID
    const competitionID = 1; // Replace with actual competition ID

    await displayWalletData(competitionID, teamID);
    await displayLeaderboard(competitionID);
    await fetchPortfolioData(competitionID, teamID);
    await fetchTransactionHistory(competitionID, teamID);

    // Initialize chart container
    const chartContainer = document.getElementById('chartContainer');
    if (chartContainer) {
        chartContainer.innerHTML = '<canvas id="chartCanvas"></canvas>';
    }
}

// Call the initializeDashboard function to start the dashboard setup
initializeDashboard();
