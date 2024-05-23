const express = require('express');
const router = express.Router();

//getting portfolio of any team
router.get('/portfolio/:teamId', async (req, res) => {
    const teamId = req.params.teamId;
    try {
      const pool = await connectToDatabase();
      const [rows] = await pool.query(`
        SELECT 
          s.StockSymbol, 
          SUM(CASE WHEN t.TransactionType = 'BUY' THEN t.Quantity * t.Price ELSE -t.Quantity * t.Price END) AS TotalAmountInvested,
          SUM(CASE WHEN t.TransactionType = 'BUY' THEN t.Quantity ELSE -t.Quantity END) AS CurrentHoldings, s.CurrentPrice, 
          s.CurrentPrice * SUM(CASE WHEN t.TransactionType = 'BUY' THEN t.Quantity ELSE -t.Quantity END) AS TotalMarketValue
        FROM Transactions t
        INNER JOIN Stocks s ON t.StockSymbol = s.StockSymbol
        WHERE TeamID = ?
        GROUP BY s.StockSymbol, s.CurrentPrice;
      `, [teamId]);
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching portfolio');
    }
  });

  //change price of stock, all arguments in request body
  router.put('/organisers/changePrice', async (req, res) => {
    const { CompetitionID, stockSymbol, newPrice } = req.body;
    try {
      const pool = await connectToDatabase();
      const sql = `
        UPDATE Stocks
        SET CurrentPrice = ?
        WHERE CompetitionID = ? AND StockSymbol = ?
      `;
      const [result] = await pool.query(sql, [newPrice, CompetitionID, stockSymbol]);
  
  
      if (result.affectedRows === 0) {
        throw new Error('Stock not found or update failed');
      }
  
      res.json({ message: 'Stock price updated successfully.' });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  });
  
  //change beta of stock, all arguments in request body
  router.put('/organisers/changeBeta', async (req, res) => {
    const { CompetitionID, stockSymbol, newBeta } = req.body;
    try {
      const pool = await connectToDatabase();
      const sql = `
        UPDATE Stocks
        SET BetaValue = ?
        WHERE CompetitionID = ? AND StockSymbol = ?
      `;
      const [result] = await pool.query(sql, [newBeta, CompetitionID, stockSymbol]);
  
  
      if (result.affectedRows === 0) {
        throw new Error('Stock not found or update failed');
      }
  
      res.json({ message: 'Beta value updated successfully.' });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  });

//api to show transaction history. competiton id in url. if we want all transactions, write all in stockSymbol and teamId in body.
//if we want stockwise history (history of one particular stock), write all in teamId and specific stock stockSymbol. same if we want teamwise transaction history
app.get('/organisers/transactions/:CompetitionID', async (req, res) => {
    const CompetitionID = parseInt(req.params.CompetitionID, 10);
    const stockSymbol = req.query.stockSymbol; 
    let teamId = req.query.teamId; 
  
    try {
      const pool = await connectToDatabase();
      let query = `
        SELECT *
        FROM Transactions
        INNER JOIN Stocks S ON Transactions.StockSymbol = S.StockSymbol
        WHERE S.CompetitionID = ?
      `;
       
      const params = [CompetitionID];
  
      if (stockSymbol) {
        query += ` AND Transactions.StockSymbol = ?`;
        params.push(stockSymbol);
      }
  
      if (teamId) {
        teamId = parseInt(req.query.teamId, 10);
          query += ` AND `;
        query += ` Transactions.TeamID = ?`;
        params.push(teamId);
      }
  
  
      const [rows] = await pool.query(query, params);
      res.json(rows);
    } catch (error) {
      console.error(error);
    }
  });

//this is for organises to create a new stock
app.post('/organiser/makeStocks', async (req, res) => {
    const {
      CompetitionID, stockSymbol, stockName, initialPrice, currentPrice, availableShares, betaValue, sectorId
    } = req.body;
    console.log('Received data:', {
      CompetitionID,
      stockSymbol,
      stockName,
      initialPrice,
      currentPrice,
      availableShares,
      betaValue,
      sectorId
    });
  
    try {
      const pool = await connectToDatabase();
      const preparedStatement = `INSERT INTO Stocks (CompetitionID, StockSymbol, StockName, InitialPrice, CurrentPrice, AvailableShares, BetaValue, SectorID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      const result = await pool.query(preparedStatement, [
        CompetitionID,
        stockSymbol,
        stockName,
        initialPrice,
        currentPrice,
        availableShares,
        betaValue,
        sectorId,
      ]);
  
      if (result.affectedRows === 0) {
        throw new Error('Failed to create stock');
      }
  
      res.json({ message: 'Stock created successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error creating stock');
    }
  });
  
  
  //for deleting stock
  app.post('/organiser/deleteStocks', async(req, res) =>{
    const {StockSymbol, CompetitionID} = req.body;
    try{
      const pool = await connectToDatabase();
      const result = await pool.query(`
      DELETE
    FROM Transactions
    WHERE CompetitionID = ? AND StockSymbol = ?;`, [CompetitionID, StockSymbol]);
    if (result.affectedRows === 0) {
      throw new Error('Failed to delete stock');
    }
  
    res.json({ message: 'Stock deleted successfully' });
  } 
  catch (error) {
    console.error(error);
    res.status(500).send('Error deleting stock');
  }
  
  });
  
  //for deleting team
  app.post('/organiser/deleteTeam', async(req, res) =>{
    const {TeamID, CompetitionID} = req.body;
    try{
      const pool = await connectToDatabase();
      const result1 = await pool.query(`
      DELETE FROM Transactions
  WHERE CompetitionID = ? AND TeamID = ?;`, [CompetitionID, TeamID]);
    if (result1.affectedRows === 0) {
      throw new Error('Failed to delete team');
    }
    const result2 = await pool.query(`
    DDELETE FROM Teams
    WHERE CompetitionID = ? AND TeamID = ?;`, [CompetitionID, TeamID]);     
  if (result2.affectedRows === 0) {
    throw new Error('Failed to delete stock');
  }
  
  
    res.json({ message: 'Team deleted successfully' });
  } 
  catch (error) {
    console.error(error);
    res.status(500).send('Error deleting team');
  }
  });

module.exports = router;