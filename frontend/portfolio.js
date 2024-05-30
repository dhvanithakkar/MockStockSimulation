document.addEventListener('DOMContentLoaded', function() {
    const competitionId = 1; // sessionStorage.getItem('CompetitionID')
    const teamId = 1; // sessionStorage.getItem('TeamID')

    fetchPortfolioData(competitionId, teamId);
    fetchTransactionHistory(competitionId, teamId);
    fetchWalletData(competitionId, teamId); // Add this line
});

async function fetchWalletData(competitionId, teamId) {
    try {
        const response = await fetch(`http://localhost:5500/mywallet/${competitionId}/${teamId}`);
        const walletData = await response.json();
        const walletValue = document.getElementById('wallet-value');
        walletValue.textContent = `$ ${walletData.CurrentCash}`;
    } catch (error) {
        console.error('Error fetching wallet data:', error);
    }
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

async function fetchTransactionHistory(competitionId, teamId) {
    try {
        const response = await fetch(`http://localhost:5500/organisers/transactions/${competitionId}?teamId=${teamId}`);
        const transactions = await response.json();

        const transactionHistory = document.getElementById('transaction-history');
        transactionHistory.innerHTML = '';

        transactions.forEach(transaction => {
            const listItem = document.createElement('li');
            listItem.textContent = `Date: ${transaction.TransactionTime}, Stock: ${transaction.StockSymbol}, 
                                    Quantity: ${transaction.Quantity}, Price: $${transaction.Price}, Type: ${transaction.TransactionType}`;
            transactionHistory.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching transaction history:', error);
    }
}



function renderPortfolio(portfolio) {
    const portfolioSection = document.getElementById('portfolio');
    const totalInvestment = document.getElementById('totalInvestment');
    const returnofinvestment = document.getElementById('percent');
    portfolioSection.innerHTML = ''; // Clear any existing content
    totalInvestment.innerHTML = '';

    let sum1 = 0;
    let sum2 = 0;
    portfolio.forEach(stock => {
        if(stock.CurrentHoldings > 0){
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
}});
    totalInvestment.innerHTML = "$ " + sum1;
    const roi = ((sum2 - sum1)/sum1 * 100).toFixed(4);
    console.log(roi);
    returnofinvestment.innerHTML = roi + "%";
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


