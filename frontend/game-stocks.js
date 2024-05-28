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

function updateStock() {
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

  // Send an HTTP DELETE request to the API endpoint
  fetch(`http://localhost:5500/organiser/deleteStock?stockSymbol=${stockSymbol}&CompetitionID=${competitionId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
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
  li.onclick = function() {
    var selectedStock = document.querySelector(".stocks-list li.selected");
    if (selectedStock) {
      selectedStock.classList.remove("selected");
    }
    li.classList.add("selected");
  };
  stocksList.appendChild(li);
}