const express = require('express');
const router = express.Router();

async function checkStockAvailability(pool, stockSymbol, CompetitionID) {
    const [rows] = await pool.query(`
      SELECT AvailableShares
      FROM Stocks
      WHERE StockSymbol = ? AND CompetitionID = ? 
    `, [stockSymbol, CompetitionID]); 
    if (rows.length === 0) {
      return 0; 
    }
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
  
  async function getStockPrice(pool, stockSymbol, CompetitionID) {
    const [rows] = await pool.query(`
      SELECT CurrentPrice
      FROM Stocks
      WHERE StockSymbol = ? AND CompetitionID = ?
    `, [stockSymbol, CompetitionID]);
    return rows[0].CurrentPrice;
  }

//api for buying stock, competitionID in url, all others in request body
app.post('/buy/:CompetitionID', async (req, res) => {
    const CompetitionID = parseInt(req.params.CompetitionID, 10);
    const teamId = req.body.teamId;
    const stockSymbol = req.body.stockSymbol;
    const quantity = req.body.quantity;
  
  
  
    try {
      const pool = await connectToDatabase();
  
      try {
        console.log(stockSymbol, CompetitionID);
        const availableShares = await checkStockAvailability(pool, stockSymbol, CompetitionID);
        if (availableShares < quantity) {
          return res.status(400).send('Insufficient stock available');
        }
  
        const teamFunds = await getTeamFunds(pool, teamId);
        const totalPrice = quantity * await getStockPrice(pool, stockSymbol, CompetitionID);
        if (teamFunds < totalPrice) {
          return res.status(400).send('Insufficient funds');
        }
        await pool.query(`
          INSERT INTO Transactions (TeamID, StockSymbol, Quantity, Price, TransactionType)
          VALUES (?, ?, ?, ?, 'BUY')
        `, [teamId, stockSymbol, quantity, totalPrice]);
        updateGraph();
        
      } catch (error) {
        console.error('Error buying stock:', error);
        res.status(500).send('Error during purchase');
      }
    } catch (error) {
      console.error('Error during purchase:', error);
      res.status(500).send('Error during purchase');
    }
  });
  
  
  
  //api for selling. competition id in url, everything else in request body
  app.post('/sell/:competitionID', async (req, res) => {
    const CompetitionID = parseInt(req.params.competitionID, 10);
    const teamId = req.body.teamId;
    const stockSymbol = req.body.stockSymbol;
    const quantity = req.body.quantity;
  
    try {
      const pool = await connectToDatabase();
  
      try {
        const currentHoldings = await getTeamHoldings(pool, teamId, stockSymbol);
        if (currentHoldings < quantity) {
          return res.status(400).send('Insufficient stock holdings');
        }
        
        const currentPrice = await getStockPrice(pool, stockSymbol, CompetitionID);
      
        await pool.query(`
        INSERT INTO Transactions (TeamID, StockSymbol, Quantity, Price, TransactionType)
        VALUES (?, ?, ?, ?, 'SELL')
      `, [teamId, stockSymbol, quantity, currentPrice]);
      updateGraph();
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

module.exports = router;