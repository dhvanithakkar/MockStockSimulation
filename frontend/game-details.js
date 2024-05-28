function toggleAddUserForm() {
    var form = document.getElementById('addUserForm');
    if (form.style.display === 'none' || form.style.display === '') {
      form.style.display = 'block';
      document.getElementById('password').value = generatePassword();
      document.getElementById('teamNo').value = generateTeamNo();
    } else {
      form.style.display = 'none';
    }
  }

  function generatePassword() {
    var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
  }

  function generateTeamNo() {
    return Math.floor(Math.random() * 1000) + 1;
  }

  function addUser() {
    var name = document.getElementById('name').value;
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var teamNo = document.getElementById('teamNo').value;

    if (name && email) {
      var userItem = document.createElement('li');
      userItem.textContent = `Name: ${name}, Email: ${email}, Team No: ${teamNo}`;
      userItem.dataset.name = name;
      userItem.dataset.email = email;
      userItem.dataset.teamNo = teamNo;
      userItem.addEventListener('click', function() {
        showUserDetails(this.dataset.name, this.dataset.email, this.dataset.teamNo);
      });
      document.getElementById('usersList').appendChild(userItem);
      document.getElementById('userForm').reset();
      document.getElementById('addUserForm').style.display = 'none';
    } else {
      alert('Please fill in all fields');
    }
  }

  async function showUserDetails(name, email, teamNo) {
    document.getElementById('detailName').textContent = `Name: ${name}`;
    document.getElementById('detailEmail').textContent = `Email: ${email}`;
    document.getElementById('detailTeamNo').textContent = `Team No: ${teamNo}`;
    
    const { balance, stocks, transactions } = await fetchUserDetails(name, email, teamNo);

    document.getElementById('detailBalance').textContent = `Balance: ${balance}`;
    document.getElementById('detailStocks').textContent = `Stocks Bought: ${stocks}`;
    document.getElementById('detailTransactions').textContent = `Transactions: ${transactions}`;
    document.getElementById('userDetails').style.display = 'block';

    // Generate a new chart or update existing chart
    var ctx = document.getElementById('portfolioGraph').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [{
          label: `${name}'s Portfolio`,
          data: [65, 59, 80, 81, 56, 55, 40],
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Month'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Value'
            }
          }
        }
      }
    });
  }

  // Simulated backend fetch function
  async function fetchUserDetails(name, email, teamNo) {
    // Simulate a delay for fetching data
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Example data returned from backend
    return {
      balance: `$${(Math.random() * 10000).toFixed(2)}`,
      stocks: 'AAPL, GOOG, TSLA',
      transactions: 'Bought AAPL, Sold TSLA'
    };
  }