const params = new URLSearchParams(window.location.search);
const gameName = params.get('name');

document.getElementById('gameName').innerText = gameName;

let users = [
  {
    username: 'john_doe',
    password: 'password123',
    balance: 15000,
    stocks: [{ name: 'AAPL', quantity: 10 }, { name: 'GOOGL', quantity: 5 }],
    transactions: ['Bought 10 shares of AAPL', 'Bought 5 shares of GOOGL']
  }
];

function addUser() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (username && password) {
    const user = {
      username,
      password,
      balance: 10000, // Initial balance
      stocks: [],
      transactions: []
    };

    users.push(user);
    updateUserList();
    document.getElementById('userForm').reset();
  } else {
    alert("Please fill in both fields.");
  }
}

function updateUserList() {
  const usersList = document.getElementById('usersList');
  usersList.innerHTML = '';

  users.forEach((user, index) => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `<strong>${user.username}</strong>`;
    listItem.addEventListener('click', () => {
      showUserDetails(index);
    });
    usersList.appendChild(listItem);
  });
}

function showUserDetails(userIndex) {
  const user = users[userIndex];
  const userDetails = `
    <h3>${user.username}'s Portfolio</h3>
    <p><strong>Balance:</strong> $${user.balance}</p>
    <h4>Stocks</h4>
    <ul>
      ${user.stocks.length ? user.stocks.map(stock => `<li>${stock.name}: ${stock.quantity} shares</li>`).join('') : '<li>No stocks owned</li>'}
    </ul>
    <h4>Transactions</h4>
    <ul>
      ${user.transactions.length ? user.transactions.map(transaction => `<li>${transaction}</li>`).join('') : '<li>No transactions</li>'}
    </ul>
  `;

  const gameDetailsDiv = document.getElementById('gameDetails');
  gameDetailsDiv.innerHTML = userDetails;

  // Dummy data for graph
  const ctx = document.getElementById('portfolioGraph').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['January', 'February', 'March', 'April', 'May', 'June'],
      datasets: [{
        label: 'Portfolio Value',
        data: [10000, 10500, 11000, 11500, 12000, 12500],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
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

updateUserList();
function logout() {
    // Redirect to index.html
    window.location.href = 'index.html';
}

// Function to toggle user details panel
function toggleUserDetailsPanel() {
    var panel = document.getElementById("userDetailsPanel");
    panel.classList.toggle("show");
}
