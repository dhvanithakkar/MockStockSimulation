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

        // Create table
        const table = document.createElement('table');
        table.className = 'history-table'; // Adding class for styling

        // Create table header
        const headerRow = document.createElement('tr');
        const headers = ['Date', 'Stock', 'Quantity', 'Price', 'Type'];

        headers.forEach(headerText => {
            const header = document.createElement('th');
            header.textContent = headerText;
            headerRow.appendChild(header);
        });

        table.appendChild(headerRow);

        transactions.slice(0, 5).forEach(transaction => {
            const row = document.createElement('tr');

            // Populate table cells with transaction data
            const dateCell = document.createElement('td');
            dateCell.textContent = transaction.TransactionTime;
            row.appendChild(dateCell);

            const stockCell = document.createElement('td');
            stockCell.textContent = transaction.StockSymbol;
            row.appendChild(stockCell);

            const quantityCell = document.createElement('td');
            quantityCell.textContent = transaction.Quantity;
            row.appendChild(quantityCell);

            const priceCell = document.createElement('td');
            priceCell.textContent = transaction.Price;
            row.appendChild(priceCell);

            const typeCell = document.createElement('td');
            typeCell.textContent = transaction.TransactionType;
            row.appendChild(typeCell);

            table.appendChild(row);
        });

        transactionHistory.appendChild(table);
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

async function fetchEndTime(competitionID) {
    try {
        const response = await fetch(`http://localhost:5500/endTime/${competitionID}`);
        const data = await response.json();
        return new Date(data[0].EndDate); // Assuming the end time is returned as a string
    } catch (error) {
        console.error('Error fetching end time:', error);
        return null;
    }
}

// Function to update the stopwatch timer
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

// Call the updateStopwatch function to start the timer
updateStopwatch();


