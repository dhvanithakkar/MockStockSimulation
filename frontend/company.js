function logout() {
    window.location.href = 'index.html';
}
const teamId = 1; //sessionStorage.getItem('TeamID')
const CompetitionID = 1; //sessionStorage.getItem('CompetitionID')
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
    var stockSymbol = company; // Assuming company is the stock symbol

    fetch(`http://localhost:5500/buy/${CompetitionID}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            teamId: teamId,
            stockSymbol: stockSymbol,
            quantity: quantity
        })
    })
    .then(response => {
        if (response.ok) {
            // Handle success, maybe show a confirmation message
            alert('Purchase successful!');
            FetchList();
        } else {
            // Handle error response
            return response.text().then(errorMessage => {
                throw new Error(errorMessage);
            });
        }
    })
    .catch(error => {
        // Handle fetch error
        console.error('Error buying stock:', error);
        alert('Error buying stock: ' + error.message);
    });
}


function sellStock(company, price) {
    var quantity = document.getElementById(company + '-quantity').value;
    var totalAmount = quantity * price;
    var stockSymbol = company; // Assuming company is the stock symbol


    fetch(`http://localhost:5500/sell/${CompetitionID}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            teamId: teamId,
            stockSymbol: stockSymbol,
            quantity: quantity
        })
    })
    .then(response => {
        if (response.ok) {
            // Handle success, maybe show a confirmation message
            alert('Sale successful!');
            FetchList();
        } else {
            // Handle error response
            return response.text().then(errorMessage => {
                throw new Error(errorMessage);
            });
        }
    })
    .catch(error => {
        // Handle fetch error
        console.error('Error selling stock:', error);
        alert('Error selling stock: ' + error.message);
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

function FetchList() {
    fetch(`http://localhost:5500/companies/${CompetitionID}`)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        const stocksContainer = document.getElementById('stocks-container');
        stocksContainer.innerHTML = ''; // Clear the container before adding new data
  
        data.forEach(stock => {
          stocksContainer.innerHTML += generateStockHTML(stock);
        });
      })
      .catch(error => console.error('Error fetching companies:', error));
  
   
  }
  
  document.addEventListener('DOMContentLoaded', FetchList);
