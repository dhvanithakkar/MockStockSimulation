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

function renderPortfolio(stockData) {
    const totalInvestment = document.getElementById('totalInvestment');
    const returnofinvestment = document.getElementById('percent');
    totalInvestment.innerHTML = '';

    let sum1 = 0;
    let sum2 = 0;
  // Assuming you have your data in a Javascript array called 'stockData'

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
  arrow.textContent = profitLoss >= 0 ? 'Up' : 'Down';
  stockItem.appendChild(arrow);

  // Append the new list item to the stock list
  stockList.appendChild(stockItem);
  sum1 = sum1 + Number(stockData[i].TotalAmountInvested);
sum2 = sum2 + Number(stockData[i].TotalMarketValue);
}
console.log(sum1, sum2);
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
fetchPortfolioData(competitionID, teamID);


