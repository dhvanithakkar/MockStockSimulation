document.addEventListener('DOMContentLoaded', async () => {
    const toggleUserFormButton = document.getElementById('toggleUserFormButton');
    const userForm = document.getElementById('userForm');
    const userList = document.getElementById('userList');
    const transactionHistory = document.getElementById('transactionHistory');

    let users = [];

    toggleUserFormButton.addEventListener('click', () => {
        if (userForm.classList.contains('hidden')) {
            userForm.classList.remove('hidden');
            generatePassword();
        }
    });

    userForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const userData = {
            name,
            email,
            password
        };

        try {
            const response = await fetch('http://localhost:5500/user/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error('Failed to add user');
            }

            const result = await response.json();
            alert(result.message);
            addUserToList(userData);
            userForm.reset();
            userForm.classList.add('hidden');
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding user');
        }
    });

    // Function to generate a random password
    function generatePassword() {
        const passwordField = document.getElementById('password');
        passwordField.value = Math.random().toString(36).slice(-8);
    }

    // Function to add a user to the list
    function addUserToList(user) {
        const userItem = document.createElement('li');
        userItem.textContent = `${user.name} - ${user.email}`;
        userList.appendChild(userItem);
    }

    // Function to fetch and display transaction history
    async function fetchTransactionHistory(competitionId, teamId) {
        try {
            const response = await fetch(`http://localhost:5500/organisers/transactions/${competitionId}?teamId=${teamId}`);
            const transactions = await response.json();
    
            const transactionHistory = document.getElementById('transaction-history');
            transactionHistory.innerHTML = '';
    
            transactions.forEach(transaction => {
                const listItem = document.createElement('li');
                listItem.textContent = `Date: ${transaction.TransactionTime}, Stock: ${transaction.StockSymbol}, 
                                        Quantity: ${transaction.Quantity}, Price: $${transaction.Price}`;
                transactionHistory.appendChild(listItem);
            });
        } catch (error) {
            console.error('Error fetching transaction history:', error);
        }
    }
    // Example usage:
    const CompetitionID = 1; // Example CompetitionID
    const stockSymbol = 'AAPL'; // Example stock symbol
    const teamId = '12345'; // Example team ID
    fetchTransactionHistory(CompetitionID, stockSymbol, teamId);
});
document.addEventListener('DOMContentLoaded', async () => {
    const userList = document.getElementById('userList');

    async function fetchTeams(CompetitionID) {
        try {
            const response = await fetch(`http://localhost:5500/organiser/displayTeams/${CompetitionID}`);
            if (!response.ok) {
                throw new Error('Failed to fetch teams');
            }
            const teams = await response.json();
            displayTeams(teams);
        } catch (error) {
            console.error('Error:', error);
            // Handle error appropriately
        }
    }

    function displayTeams(teams) {
        // Clear previous user list
        userList.innerHTML = '';

        // Display each team
        teams.forEach(team => {
            const teamItem = document.createElement('li');
            teamItem.textContent = `Team: ${team.TeamName}, ID: ${team.TeamID}, Cash: ${team.CurrentCash}`;
            userList.appendChild(teamItem);
        });
    }

    // Example usage:
    const CompetitionID = 1; // Example CompetitionID
    fetchTeams(CompetitionID);
});

