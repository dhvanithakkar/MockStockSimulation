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
  addStockToList(stockName, stockPrice);
  closeModal("createStockModal");
}



function deleteStock() {
  var selectedStock = document.querySelector(".stocks-list li.selected");
  if (selectedStock) {
    selectedStock.remove();
  }
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