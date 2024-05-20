const express = require('express');
const connectToDatabase = require('./database'); 

const app = express();
app.use(express.json());


app.get('/portfolio/:teamId', async (req, res) => {
  const teamId = req.params.teamId; 

  try {
    const holdings = await getPortfolio(teamId); 
    res.json(holdings); 
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching portfolio'); 
  }
});


async function getPortfolio(teamId) {
  try{
  const pool = await connectToDatabase();
  const [rows] = await pool.query(`
    SELECT 
      Transactions.StockSymbol, 
      Transactions.Quantity, 
      Transactions.Price AS TransactionPrice, 
      Stocks.StockName, 
      Stocks.CurrentPrice
    FROM Transactions
    INNER JOIN Stocks ON Transactions.StockSymbol = Stocks.StockSymbol
    WHERE Transactions.TeamID = ?
  `, [teamId]);
  return rows; }
  catch (error) {
    console.error(error);
    res.status(500).send('Error fetching portfolio');}
}


 

app.post('/buy', async (req, res) => {
  const teamId = req.body.teamId;
  const stockSymbol = req.body.stockSymbol;
  const quantity = req.body.quantity;



  try {
    const pool = await connectToDatabase();

    try {
  
      const availableShares = await checkStockAvailability(pool, stockSymbol);
      if (availableShares < quantity) {
        return res.status(400).send('Insufficient stock available');
      }

      const teamFunds = await getTeamFunds(pool, teamId);
      const totalPrice = quantity * await getStockPrice(pool, stockSymbol);
      if (teamFunds < totalPrice) {
        return res.status(400).send('Insufficient funds');
      }

      await pool.query(`
        INSERT INTO Transactions (TeamID, StockSymbol, Quantity, Price)
        VALUES (?, ?, ?, ?)
      `, [teamId, stockSymbol, quantity, totalPrice]);

      //const currentPrice = write formala here 
      const currentPrice = await getStockPrice(pool, stockSymbol);
      const newAvailableShares = availableShares - quantity;
      await pool.query(`
        UPDATE Stocks
        SET AvailableShares = ?, CurrentPrice = ?
        WHERE StockSymbol = ?
      `, [newAvailableShares, currentPrice, stockSymbol]);

      await pool.query(`
        UPDATE Teams
        SET CurrentCash = CurrentCash - ?
        WHERE TeamID = ?
      `, [totalPrice, teamId]);
      res.status(200).send('Stock purchased successfully!');
    } catch (error) {
      console.error('Error buying stock:', error);
      res.status(500).send('Error during purchase');
    }
  } catch (error) {
    console.error('Error during purchase:', error);
    res.status(500).send('Error during purchase');
  }
});
app.post('/sell', async (req, res) => {
  const teamId = req.body.teamId;
  const stockSymbol = req.body.stockSymbol;
  const quantity = req.body.quantity;

  try {
    const pool = await connectToDatabase();

    try {
      // Check for sufficient team holdings
      const currentHoldings = await getTeamHoldings(pool, teamId, stockSymbol);
      if (currentHoldings < quantity) {
        return res.status(400).send('Insufficient stock holdings');
      }

      // Get current stock price
      const currentPrice = await getStockPrice(pool, stockSymbol);
      const totalSellValue = quantity * currentPrice;

      // Start transaction (consider adding `await pool.beginTransaction()` later)

      // Update Teams table
      await pool.query(`
        UPDATE Teams
        SET CurrentCash = CurrentCash + ?
        WHERE TeamID = ?
      `, [totalSellValue, teamId]);

      // Update Stocks table (assuming separate table for stocks)
      await pool.query(`
        UPDATE Stocks
        SET AvailableShares = AvailableShares + ?
        WHERE StockSymbol = ?
      `, [quantity, stockSymbol]);

      // Update Transactions table (assuming separate table for transactions)
      await pool.query(`
        INSERT INTO Transactions (TeamID, StockSymbol, Quantity, Price)
        VALUES (?, ?, ?, ?)
      `, [teamId, stockSymbol, -quantity, currentPrice]); // Negative quantity for selling

      // End transaction (consider adding `await pool.commit()` later)

      res.status(200).send('Stock sold successfully!');
    } catch (error) {
      console.error('Error selling stock:', error);
      res.status(500).send('Error during sale');
    }
  } catch (error) {
    console.error('Error during sale:', error);
    res.status(500).send('Error during sale');
  }
});


async function checkStockAvailability(pool, stockSymbol) {
  const [rows] = await pool.query(`
    SELECT AvailableShares
    FROM Stocks
    WHERE StockSymbol = ?
  `, [stockSymbol]);

  return rows[0].AvailableShares;
}

async function getTeamHoldings(pool, teamId, stockSymbol) {
  const [rows] = await pool.query(`
    SELECT SUM(Quantity) AS Quantity
    FROM Transactions
    WHERE TeamID = ? AND StockSymbol = ?
  `, [teamId, stockSymbol]);

  const holdings = rows[0]?.Quantity || 0;

  return holdings;
}


async function getTeamFunds(pool, teamId) {
  const [rows] = await pool.query(`
    SELECT CurrentCash
    FROM Teams
    WHERE TeamID = ?
  `, [teamId]);

  return rows[0].CurrentCash;
}

async function getStockPrice(pool, stockSymbol) {
  const [rows] = await pool.query(`
    SELECT CurrentPrice
    FROM Stocks
    WHERE StockSymbol = ?
  `, [stockSymbol]);
  return rows[0].CurrentPrice;
}



app.listen(8000, () => console.log('Server listening on port 8000'));



















