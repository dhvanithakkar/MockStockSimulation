function logout() {
    window.location.href = 'index.html';
}

function createChart(chartId, data, timestamps, detailsId) {
    var ctx = document.getElementById(chartId).getContext('2d');
    var detailsContainer = document.getElementById(detailsId);
    var chartContainer = detailsContainer.querySelector('.chart-container');

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

function toggleDetails(company, competitionID) {
    var details = document.getElementById(company + '-details');
    if (details.style.display === 'block') {
        details.style.display = 'none';
    } else {
        fetch(`http://localhost:5500/forgraph/${competitionID}/${company}`)
            .then(response => response.json())
            .then(data => {
                const prices = data.map(item => item.price);
                const timestamps = data.map(item => new Date(item.timest).toLocaleString());
                createChart(`${company}-chart`, prices, timestamps, `${company}-details`);
                details.style.display = 'block';
            })
            .catch(error => console.error('Error fetching data:', error));
    }
}

function updateTotalAmount(company, price) {
    var quantity = document.getElementById(company + '-quantity').value;
    var totalAmount = quantity * price;
    document.getElementById(company + '-total').innerText = 'Total: ₹' + totalAmount.toFixed(2);
}

function buyStock(company, price) {
    var quantity = document.getElementById(company + '-quantity').value;
    var totalAmount = quantity * price;
    alert('Buying ' + quantity + ' shares of ' + company + ' for ₹' + totalAmount.toFixed(2));
}

function sellStock(company, price) {
    var quantity = document.getElementById(company + '-quantity').value;
    var totalAmount = quantity * price;
    alert('Selling ' + quantity + ' shares of ' + company + ' for ₹' + totalAmount.toFixed(2));
}

function updateTimer() {
    const timerElement = document.getElementById('timer');
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    timerElement.textContent = `${hours}:${minutes}:${seconds}`;
}

function toggleUserDetailsPanel() {
    var panel = document.getElementById("userDetailsPanel");
    panel.classList.toggle("show");
}

function generateStockHTML(stock) {
    return `
    <div class="stock-line" onclick="toggleDetails('${stock.StockSymbol}', ${stock.CompetitionID})">
        <div class="company-name">${stock.StockSymbol}</div>
        <div class="stock-summary">
            <div class="stock-price"></div>
            <div class="stock-change"></div>
        </div>
    </div>
    <div class="stock-details-container" id="${stock.StockSymbol}-details">
        <div class="stock-details">
            <div class="details-wrapper">
                <div class="chart-container">
                    <canvas id="${stock.StockSymbol}-chart" class="chart"></canvas>
                </div>
                <div class="details-container">
                    <div class="stock-info">
                        <div class="stock-price-detail">Price: ${stock.CurrentPrice} </div>
                        <div class="stock-quantity">Available: ${stock.AvailableShares}</div>
                        <input type="number" id="${stock.StockSymbol}-quantity" placeholder="Quantity to buy" oninput="updateTotalAmount('${stock.StockSymbol}', ${stock.CurrentPrice})">
                        <div class="total-amount" id="${stock.StockSymbol}-total">Total: </div>
                        <div class="button-group">
                            <button onclick="buyStock('${stock.StockSymbol}', ${stock.CurrentPrice})">Buy</button>
                            <button onclick="sellStock('${stock.StockSymbol}', ${stock.CurrentPrice})">Sell</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}

document.addEventListener('DOMContentLoaded', function () {
    fetch('http://localhost:5500/companies')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const stocksContainer = document.getElementById('stocks-container');
            data.forEach(stock => {
                stocksContainer.innerHTML += generateStockHTML(stock);
            });
        })
        .catch(error => console.error('Error fetching companies:', error));

    setInterval(updateTimer, 1000);
    updateTimer();
});
