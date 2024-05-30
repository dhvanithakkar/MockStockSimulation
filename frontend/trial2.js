document.addEventListener('DOMContentLoaded', () => {
    const toggleFormButton = document.getElementById('toggleFormButton');
    const userForm = document.getElementById('userForm');
    const userList = document.getElementById('userList');
    const transactionHistory = document.getElementById('transactionHistory');
    const transactions = document.getElementById('transactions');

    let users = [];

    toggleFormButton.addEventListener('click', () => {
        if (userForm.classList.contains('hidden')) {
            userForm.classList.remove('hidden');
            generatePassword();
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

    function generatePassword() {
        const passwordField = document.getElementById('password');
        passwordField.value = Math.random().toString(36).slice(-8);
    }

    function addUserToList(user) {
        const userItem = document.createElement('li');
        userItem.textContent = `${user.name} (${user.email})`;
        userItem.dataset.userId = user.id;
        userItem.addEventListener('click', () => showTransactions(user));
        userList.appendChild(userItem);
    }

    function showTransactions(user) {
        transactionHistory.classList.remove('hidden');
        transactions.innerHTML = ''; // Clear previous transactions
        user.transactions.forEach(transaction => {
            const transactionItem = document.createElement('li');
            transactionItem.textContent = transaction;
            transactions.appendChild(transactionItem);
        });
    }

    function generateTransactions() {
        return ['Transaction 1', 'Transaction 2', 'Transaction 3']; // Placeholder transactions
    }
});
