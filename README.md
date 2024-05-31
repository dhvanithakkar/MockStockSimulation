# Mock Stock Server

Welcome to the Mock Stock Server! This server allows colleges to organize their own mock stock competitions, providing a platform for creating and managing stock market simulation games.

## Features

- **Game Creation**: Organize mock stock competitions by creating games.
- **Stock Management**: Add new stocks or use a pre-made list of stocks with customizable prices and beta values.
- **Game Scheduling**: Set start and end dates and times for games.
- **Participant Management**: Add participants (teams) to the competition.
- **Trading**: Participants can log in to buy and sell stocks.
- **Dynamic Pricing**: Stock prices are updated dynamically.
- **Leaderboard**: A real-time leaderboard is visible to everyone.

### Prerequisites

- Node.js
- npm
- MySQL

### Installation

1. Clone the repository:
   ```console
   git clone https://github.com/yourusername/mock-stock-server.git
   cd mock-stock-server
   ```

2. Create the database:
   - Set up a MySQL database by following the instructions in `backend/queries-for-setup.txt`.

3. Configure the database connection:
   - Update `backend/database.js` to connect to your own MySQL server. Modify the connection settings (host, user, password, database) to match your MySQL configuration.

4. Install dependencies:
   ```console
   npm install
   ```

5. Start the server:
   ```console
   npm start
   ```

The server will start on `http://localhost:5500`.
