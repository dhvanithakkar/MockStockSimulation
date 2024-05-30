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
    addStockToList(stockName, stockPrice);
    closeModal("createStockModal");
  })
  .catch(error => {
    console.error('Error:', error);
    // Handle error, e.g., display an error message to the user
  });
}

async function updateStock() {
  var selectedStock = document.querySelector(".stocks-list li.selected");
  if (!selectedStock) {
    console.error('No stock selected');
    return;
  }

  // Extract the stock symbol and competition ID from the selected stock
  var stockSymbol = selectedStock.dataset.symbol;
  var competitionId = selectedStock.dataset.competitionId;

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
    console.log(result.message); // Assuming the response contains a message field
    // Optionally update the UI to reflect the new beta value

  } catch (error) {
    console.error('Error:', error);
    // Handle error, e.g., display an error message to the user
  }
}



function deleteStock() {
  var selectedStock = document.querySelector(".stocks-list li.selected");
  if (!selectedStock) {
    console.error('No stock selected');
    return;
  }

  // Extract the stock symbol and competition ID from the selected stock
  var stockSymbol = selectedStock.dataset.symbol;
  var competitionId = selectedStock.dataset.competitionId;

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
    console.log(data.message); // Assuming the response contains a message field
    selectedStock.remove(); // Remove the deleted stock from the UI
  })
  .catch(error => {
    console.error('Error:', error);
    // Handle error, e.g., display an error message to the user
  });
}



function toggleUserDetailsPanel() {
  var panel = document.getElementById("userDetailsPanel");
  panel.classList.toggle("show");
}

function logout() {
  console.log("Logging out...");
}

function addStockToList(name, price) {
  var stocksList = document.getElementById("stocksList");
  var li = document.createElement("li");
  li.textContent = name + " - $" + price;
  li.dataset.symbol = name; // Assuming stock name is the symbol
  li.dataset.competitionId = '1'; // Replace with actual competition ID
  li.onclick = function() {
    var selectedStock = document.querySelector(".stocks-list li.selected");
    if (selectedStock) {
      selectedStock.classList.remove("selected");
    }
    li.classList.add("selected");
  };
  stocksList.appendChild(li);
}

async function fetchStocks() {
  try {
    const response = await fetch('http://localhost:5500/organiser/displayStocks/1'); // Replace 1 with the actual CompetitionID
    if (response.ok) {
      const stocks = await response.json();
      stocks.forEach(stock => addStockToList(stock.StockName, stock.CurrentPrice));

      // Call API to get graph data for the selected stock (assuming a stock is selected)
      const selectedStock = document.querySelector(".stocks-list li.selected");
      if (selectedStock) {
        const competitionId = '1'; // Replace with actual competition ID
        const stockSymbol = selectedStock.dataset.symbol;
        const graphDataResponse = await fetch(`/forgraph/${competitionId}/${stockSymbol}`);
        if (graphDataResponse.ok) {
          const graphData = await graphDataResponse.json();
          // Use the graphData to create the chart (explained in step 2)
        } else {
          console.error('Error fetching graph data:', await graphDataResponse.text());
        }
      }
    } else {
      console.error('Error fetching stocks:', await response.text());
      // Handle API errors by displaying an error message to the user
    }
  } catch (error) {
    console.error('Error fetching stocks:', error);
    // Handle other errors during the fetch request
  }
}
function createLineChart(graphData) {
  const ctx = document.getElementById('portfolioGraph').getContext('2d');
  const labels = graphData.map(point => point.timest);
  const prices = graphData.map(point => point.price);
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Stock Price',
        data: prices,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    }
  });
}
if (graphDataResponse.ok) {
  const graphData = await graphDataResponse.json();
  createLineChart(graphData);
}


