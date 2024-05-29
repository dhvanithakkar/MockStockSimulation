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


async function addUser() {
  var name = document.getElementById('name').value;
  var email = document.getElementById('email').value;

  if (name && email) {
    // Prepare data for API request
    const data = {
      TeamName: name, // Assuming TeamName maps to user name
      Email: email,
      CompetitionID: 1,
      TeamPassword: document.getElementById('password').value,

    };

    try {
      // Send a POST request to the API endpoint
      const response = await fetch('http://localhost:5500/organiser/createTeam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to create user: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('API response:', responseData);

      // User created successfully, update UI
      var userItem = document.createElement('li');
      userItem.textContent = `Name: ${name}, Email: ${email}`;
      // No team number displayed as it's not retrieved from the API
      document.getElementById('usersList').appendChild(userItem);
      document.getElementById('userForm').reset();
      document.getElementById('addUserForm').style.display = 'none';
    } catch (error) {
      alert(`Error creating user: ${error.message}`);
    }
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

// Function to fetch and display teams
async function fetchAndDisplayTeams(competitionID) {
  try {
    const response = await fetch(`http://localhost:5500/organiser/displayTeams/${competitionID}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch teams: ${response.statusText}`);
    }
    const teams = await response.json();
    displayTeams(teams);
  } catch (error) {
    console.error(error);
    alert('Error fetching teams');
  }
}

// Function to display teams in the UI
function displayTeams(teams) {
  const teamsList = document.getElementById('teamsList');
  teamsList.innerHTML = ''; // Clear previous list

  teams.forEach(team => {
    const teamItem = document.createElement('li');
    teamItem.textContent = `Team Name: ${team.TeamName}, Team ID: ${team.TeamID}, Current Cash: ${team.CurrentCash}`;
    teamsList.appendChild(teamItem);
  });
}

// Call fetchAndDisplayTeams when the page loads
window.addEventListener('load', () => {
  const competitionID = 1; // You may change this to match your competition ID
  fetchAndDisplayTeams(competitionID);
});
