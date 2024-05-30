document.addEventListener('DOMContentLoaded', async () => {
    const toggleUserFormButton = document.getElementById('toggleUserFormButton');
    const toggleTeamFormButton = document.getElementById('toggleTeamFormButton');
    const userForm = document.getElementById('userForm');
    const teamForm = document.getElementById('teamForm');
    const userList = document.getElementById('userList');
    const transactionHistory = document.getElementById('transactionHistory');
    const transactions = document.getElementById('transactions');

    let users = [];

    toggleUserFormButton.addEventListener('click', () => {
        if (userForm.classList.contains('hidden')) {
            userForm.classList.remove('hidden');
            teamForm.classList.add('hidden');
            generatePassword();
        }
    });

    toggleTeamFormButton.addEventListener('click', () => {
        if (teamForm.classList.contains('hidden')) {
            teamForm.classList.remove('hidden');
            userForm.classList.add('hidden');
        }
    });

    userForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const user = { id: users.length + 1, name, email, password, transactions: generateTransactions() };
        users.push(user);
        addUserToList(user);
        userForm.reset();
        userForm.classList.add('hidden');
    });

    teamForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const teamName = document.getElementById('teamName').value;
        const email = document.getElementById('teamEmail').value;
        const competitionID = document.getElementById('competitionID').value;
        const teamID = Math.random().toString(36).substr(2, 9); // Example TeamID generation
        const teamPassword = Math.random().toString(36).slice(-8); // Example TeamPassword generation

        const teamData = {
            TeamID: teamID,
            TeamPassword: teamPassword,
            CompetitionID: competitionID,
            TeamName: teamName,
            Email: email
        };

        try {
            const response = await fetch('http://localhost:5500/organiser/createTeam', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(teamData)
            });

            if (!response.ok) {
                throw new Error('Failed to create team');
            }

            const result = await response.json();
            alert(result.message);
            teamForm.reset();
            teamForm.classList.add('hidden');
        } catch (error) {
            console.error('Error:', error);
            alert('Error creating team');
        }
    });

    // Fetch and display the user list
    try {
        const competitionID = 1; // Example CompetitionID
        const response = await fetch(`http://localhost:5500/organiser/displayTeams/${competitionID}`);
        if (!response.ok) {
            throw new Error('Failed to fetch teams');
        }
        const teams = await response.json();
        teams.forEach(team => {
            addUserToList(team);
        });
    } catch (error) {
        console.error('Error:', error);
        alert('Error fetching teams');
    }

    // Function to generate a random password
    function generatePassword() {
        const passwordField = document.getElementById('password');
        passwordField.value = Math.random().toString(36).slice(-8);
    }

    // Function to add a user to the list
    function addUserToList(user) {
        const userItem = document.createElement('li');
        userItem.textContent = `${user.TeamName} (${user.TeamID}) - Cash: ${user.CurrentCash}`;
        userList.appendChild(userItem);
    }

    // Update the function to fetch and display transaction history
    async function fetchTransactionHistory(CompetitionID, stockSymbol, teamId) {
        try {
            const response = await fetch(`http://localhost:5500/organisers/transactions/${CompetitionID}?stockSymbol=${stockSymbol}&teamId=${teamId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch transaction history');
            }
            const transactions = await response.json();
            displayTransactionHistory(transactions);
        } catch (error) {
            console.error('Error:', error);
            // Handle error appropriately, e.g., show an error message to the user
        }
    }

    // Function to display transaction history
    function displayTransactionHistory(transactions) {
        // Clear previous transaction history
        transactionHistory.innerHTML = '';

        // Display each transaction
        transactions.forEach(transaction => {
            const transactionItem = document.createElement('li');
            // Customize the display based on your transaction data structure
            transactionItem.textContent = `${transaction.TransactionID}: ${transaction.TransactionType} ${transaction.Quantity} shares of ${transaction.StockSymbol} at ${transaction.Price}`;
            transactionHistory.appendChild(transactionItem);
        });
    }

    
    fetchTransactionHistory(CompetitionID, stockSymbol, teamId);
});
