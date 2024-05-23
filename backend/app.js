const express = require('express');
const connectToDatabase = require('./database'); 

const app = express();
app.use(express.json());

//getting portfolio of a specific team
app.get('/portfolio/:teamId', async (req, res) => {
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

//change price of stock
app.put('/organisers/changePrice', async (req, res) => {
  // Retrieve data from request body
  const { CompetitionID, stockSymbol, newPrice } = req.body;

  // Input validation (optional but recommended)
  if (!CompetitionID || !stockSymbol || !newPrice) {
    return res.status(400).send('Missing required fields: CompetitionID, stockSymbol, and newPrice');
  }

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




app.post('/buy/:CompetitionID', async (req, res) => {
  const CompetitionID = parseInt(req.params.CompetitionID, 10);
  const teamId = req.body.teamId;
  const stockSymbol = req.body.stockSymbol;
  const quantity = req.body.quantity;



  try {
    const pool = await connectToDatabase();

    try {
  
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
        INSERT INTO Transactions (TeamID, StockSymbol, Quantity, Price)
        VALUES (?, ?, ?, ?)
      `, [teamId, stockSymbol, quantity, totalPrice]);

      //const currentPrice = write formala here 
      const currentPrice = await getStockPrice(pool, stockSymbol, CompetitionID);
      const newAvailableShares = availableShares - quantity;
      await pool.query(`
        UPDATE Stocks
        SET AvailableShares = ? AND CurrentPrice = ?
        WHERE StockSymbol = ? AND CompetitionID = ?;
      `, [newAvailableShares, currentPrice, stockSymbol, CompetitionID]);

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
      const totalSellValue = quantity * currentPrice;
      await pool.query(`
        UPDATE Teams
        SET CurrentCash = CurrentCash + ?
        WHERE TeamID = ?
      `, [totalSellValue, teamId]);

      // price here
      await pool.query(`
        UPDATE Stocks
        SET AvailableShares = AvailableShares + ?
        WHERE StockSymbol = ? AND CompetitionID = ?;
      `, [quantity, stockSymbol, CompetitionID]);

    
      await pool.query(`
        INSERT INTO Transactions (TeamID, StockSymbol, Quantity, Price)
        VALUES (?, ?, ?, ?)
      `, [teamId, stockSymbol, -quantity, currentPrice]);

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

app.get('/organisers/transactions/:CompetitionID', async (req, res) => {
  const CompetitionID = parseInt(req.params.CompetitionID, 10);
  const stockSymbol = req.query.stockSymbol; //write all if you want all
  const teamId = req.query.teamId; //write all if you want all

  try {
    const pool = await connectToDatabase();
    let query = `
      SELECT *
      FROM Transactions
      INNER JOIN Stocks S ON Transactions.StockSymbol = S.StockSymbol
      WHERE S.CompetitionID = ?
    `;

    const params = [CompetitionID];

    if (stockSymbol !== 'all') {
      query += ` WHERE Transactions.StockSymbol = ?`;
      params.push(stockSymbol);
    }

    if (teamId !== 'all') {
      if (stockSymbol !== 'all') {
        query += ` AND `;
      } else {
        query += ` WHERE `;
      }
      query += ` Transactions.TeamID = ?`;
      params.push(teamId);
    }

    query += ` ORDER BY Transactions.CreatedAt ASC;`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});



app.post('/organiser/makeStocks', async (req, res) => {
  const {
    CompetitionID,
    stockSymbol,
    stockName,
    initialPrice,
    currentPrice,
    availableShares,
    betaValue,
    sectorId,
  } = req.body;

  if (!CompetitionID || !stockSymbol || !stockName || !initialPrice || !currentPrice || !availableShares || !betaValue || !sectorId) {
    return res.status(400).send('Missing required fields in request body'); //maybe competition Id is not compulsory 
  }

  try {
    const pool = await connectToDatabase();
    const result = await pool.query(`
      INSERT INTO Stocks (
        CompetitionID,
        StockSymbol,
        StockName,
        InitialPrice,
        CurrentPrice,
        AvailableShares,
        BetaValue,
        SectorID
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
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



app.listen(8000, () => console.log('Server listening on port 8000'));



















