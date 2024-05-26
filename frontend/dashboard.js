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

    leaderboardContainer.innerHTML = ''; // Clear existing leaderboard content

    leaderboardData.forEach((team, index) => {
        const leaderboardItem = document.createElement('div');
        leaderboardItem.classList.add('leaderboard-item');
        leaderboardItem.innerHTML = `
            <span class="position">${index + 1}</span>

            <span class="team-name">${team.TeamName}</span>

            <span class="total-net-worth">${team.TotalNetWorth}</span>
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

// Function to limit checkbox selection to 5
const checkboxes = document.querySelectorAll('.stock-checkbox');
let checkedCount = 0;
const maxChecked = 5;

checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            checkedCount++;
        } else {
            checkedCount--;
        }

        if (checkedCount > maxChecked) {
            this.checked = false;
            checkedCount--;
            alert('You can select up to 5 companies only.');
            this.classList.add('checkbox-limit-exceeded');
            setTimeout(() => {
                this.classList.remove('checkbox-limit-exceeded');
            }, 1000);
        }

        displaySelectedCharts();
    });
});

// Function to create chart for a company
function createChart(companyName, value, color, index) {
    const chartDiv = document.createElement('div');
    chartDiv.classList.add('chart');
    chartDiv.innerHTML = `<canvas id="companyChart${index}"></canvas>`;
    document.getElementById('chartContainer').appendChild(chartDiv);

    const ctx = document.getElementById(`companyChart${index}`).getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [companyName],
            datasets: [{
                label: 'Stock Value',
                data: [value],
                backgroundColor: [color],
                borderColor: [color],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Function to display charts for selected companies
function displaySelectedCharts() {
    document.getElementById('chartContainer').innerHTML = ''; // Clear existing charts

    checkboxes.forEach((checkbox, index) => {
        if (checkbox.checked) {
            const companyName = checkbox.parentElement.querySelector('.stock-name').textContent;
            const stockValue = parseFloat(checkbox.parentElement.querySelector('.stock-value').textContent);
            const color = index % 2 === 0 ? 'rgba(75, 192, 192, 0.2)' : 'rgba(255, 99, 132, 0.2)';
            createChart(companyName, stockValue, color, index);
        }
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

function renderPortfolio(portfolio) {
    const portfolioSection = document.getElementById('stockListBox');
    const totalInvestment = document.getElementById('totalInvestment');
    const returnofinvestment = document.getElementById('percent');
    portfolioSection.innerHTML = ''; // Clear any existing content
    totalInvestment.innerHTML = '';

    let sum1 = 0;
    let sum2 = 0;
    portfolio.forEach(stock => {
        const profitLoss = ((stock.CurrentPrice - (stock.TotalAmountInvested / stock.CurrentHoldings)) * stock.CurrentHoldings).toFixed(4);
        const profitLossClass = profitLoss >= 0 ? 'green' : 'red';
        const stockItem = document.createElement('div');
        stockItem.classList.add('stock-item');
        stockItem.innerHTML = `
            <span>${stock.StockSymbol} - ${stock.CurrentHoldings} units</span>
            <span>Total Invested: $${stock.TotalAmountInvested}</span>
            <span>Current Price: $${stock.CurrentPrice}</span>
            <span>Total Market Value: $${stock.TotalMarketValue}</span>
            <span class="${profitLossClass} profit-loss">Profit/Loss: $${profitLoss}</span>
        `;
        stockItem.addEventListener('click', function() {
            if (!openedGraphs[stock.StockSymbol]) {
                renderGraph(stock, stockItem);
                openedGraphs[stock.StockSymbol] = true;
            }
        });
        portfolioSection.appendChild(stockItem);
        sum1 = sum1 + Number(stock.TotalAmountInvested);
        sum2 = sum2 + Number(stock.TotalMarketValue);
    });
    totalInvestment.innerHTML = "$ " + sum1;
    const roi = ((sum2 - sum1)/sum1 * 100).toFixed(4);
    console.log(roi);
    returnofinvestment.innerHTML = roi + "%";
}

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
async function fetchPortfolioData(competitionId, teamId) {
    try {
        const response = await fetch(`http://localhost:5500/portfolio/${competitionId}/${teamId}`);
        const portfolio = await response.json();
        renderPortfolio(portfolio);
    } catch (error) {
        console.error('Error fetching portfolio:', error);
    }
}
// Call displayWalletData function with the competition ID and team ID
const competitionID = 1;
const teamID = 1; // Replace with the actual team ID
displayWalletData(competitionID, teamID);
displayLeaderboard(competitionID);


