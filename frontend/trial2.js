const CompetitionID = 1;
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
        var name = document.getElementById('name').value;
        var email = document.getElementById('email').value;
        var password = document.getElementById('password').value;

        const userData = {
            TeamName: name,
            Email: email,
            TeamPassword: password, CompetitionID: CompetitionID
        };

        try {
            const response = await fetch('http://localhost:5500/organiser/createTeam', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error('Failed to add user');
            }

            var result = await response.json();
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
        var passwordField = document.getElementById('password');
        passwordField.value = Math.random().toString(36).slice(-8);
    }

    // Function to add a user to the list
    function addUserToList(user) {
        const userItem = document.createElement('li');
        userItem.textContent = `${user.name} - ${user.email}`;
        userList.appendChild(userItem);
    }

    
});
async function fetchTransactionHistory(competitionId, teamId) {
    try {
        const response = await fetch(`http://localhost:5500/organisers/transactions/${competitionId}?teamId=${teamId}`);
        const transactions = await response.json();

        const transactionHistory = document.getElementById('transactionHistory');
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
const competitionSelect = document.getElementById('competitionSelect');
const teamSelect = document.getElementById('teamSelect');
fetchTransactionHistory(competitionSelect, teamSelect);

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
