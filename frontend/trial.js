function logout() {
    window.location.href = 'index.html';
}
const CompetitionID = 1;//sessionStorage.getItem('CompetitionID');

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
                        <div class="stock-beta-value">Beta Value: ${stock.BetaValue}</div>
                        <div class="button-group">
                            <button onclick="updateStock('${stock.StockSymbol}', ${CompetitionID}, )">Update</button>
                            <button onclick="deleteStock('${stock.StockSymbol}, ${CompetitionID}')">Delete</button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>`;
}
function deleteStock(stockSymbol, competitionId) {
    var data = {
      CompetitionID: competitionId,
      stockSymbol: stockSymbol}
  
    // Send an HTTP DELETE request to the API endpoint
    fetch(`http://localhost:5500/organiser/deleteStocks`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
      })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to delete stock');
      }
      return response.json();
    })
    .then(data => {
      console.log(data.message); 
      FetchList();
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }
  
  async function updateStock(stockSymbol, competitionId) {
  
    // Prompt the user to enter the new price and beta value
    var newPrice = prompt("Enter the new price for the stock:");
    var newBeta = prompt("Enter the new beta value for the stock:");
  
    if (!newPrice || isNaN(newPrice) || !newBeta || isNaN(newBeta)) {
      console.error('Invalid input for price or beta value');
      return;
    }
  
    // Prepare the data to send in the request body
    var data1 = {
      CompetitionID: competitionId,
      stockSymbol: stockSymbol,
      newPrice: parseFloat(newPrice) // Convert to float
    };
    var data2 = {
      CompetitionID: competitionId,
      stockSymbol: stockSymbol,
      newBeta: parseFloat(newBeta) // Convert to float
    };
  
    try {
      // Send an HTTP PUT request to the API endpoint for updating price
      let response = await fetch('http://localhost:5500/organisers/changePrice', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data1)
      });
  
      if (!response.ok) {
        throw new Error('Failed to update stock price');
      }
  
      let result = await response.json();
      console.log(result.message); // Assuming the response contains a message field
      // Optionally update the UI to reflect the new price
  
      // Send an HTTP PUT request to the API endpoint for updating beta value
      response = await fetch('http://localhost:5500/organisers/changeBeta', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data2)
      });
  
      if (!response.ok) {
        throw new Error('Failed to update stock beta value');
      }
  
      result = await response.json();
      console.log(result.message); 
      FetchList();// Assuming the response contains a message field
      // Optionally update the UI to reflect the new beta value
  
    } catch (error) {
      console.error('Error:', error);
      // Handle error, e.g., display an error message to the user
    }
  }

  function closeModal(modalId) {
    var modal = document.getElementById(modalId);
    modal.style.display = "none";
  }
  
  function showCreateForm() {
    var createModal = document.getElementById("createStockModal");
    createModal.style.display = "block";
  }
  
  function showUpdateForm() {
    var updateModal = document.getElementById("updateStockModal");
    updateModal.style.display = "block";
  }
  
  function createStock() {
    var stockName = document.getElementById("stockName").value;
    var stockPrice = document.getElementById("stockPrice").value;
    var betaPrice = document.getElementById("betaPrice").value;
    var stockSymbol = document.getElementById("stockSymbol").value;
    var TotalShares = document.getElementById("TotalShares").value;
  
    // Prepare the data to send in the request body
    var data = {
      CompetitionID: '1', 
      stockName: stockName,
      stockSymbol: stockSymbol,
      initialPrice: stockPrice,
      betaValue: betaPrice,
      sectorId: 1,
      TotalShares: TotalShares
    };
  
    // Send an HTTP POST request to the API endpoint
    fetch('http://localhost:5500/organiser/makeStocks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to create stock');
      }
      return response.json();
    })
    .then(data => {
      console.log(data.message); // Assuming the response contains a message field
      closeModal("createStockModal");
      FetchList();
    })
    .catch(error => {
      console.error('Error:', error);
      // Handle error, e.g., display an error message to the user
    });
  }


  function FetchList() {
    fetch('http://localhost:5500/companies')
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
  
    // Call the updateTimer function initially as well
    updateTimer();
    setInterval(updateTimer, 1000);
  }
  
  document.addEventListener('DOMContentLoaded', FetchList);
  
