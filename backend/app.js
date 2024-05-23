const express = require('express');
const connectToDatabase = require('./database'); 

const app = express();
app.use(express.json());

//getting portfolio of a specific team. teamID in url
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

//change price of stock, all arguments in request body
app.put('/organisers/changePrice', async (req, res) => {
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
app.put('/organisers/changeBeta', async (req, res) => {
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



//api for buying stock, competitionID in url, all others in request body
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
        INSERT INTO Transactions (TeamID, StockSymbol, Quantity, Price, CompetitionID)
        VALUES (?, ?, ?, ?, ?)
      `, [teamId, stockSymbol, quantity, totalPrice, CompetitionID]);

       
  
      const rows = await pool.query(`
    SELECT TotalShares, BuyOrders, SellOrders, CurrentPrice, InitialPrice, BetaValue
    FROM Stocks
    WHERE StockSymbol = ? AND CompetitionID = ?`, [stockSymbol, CompetitionID]);
    const TotalShares = rows[0].TotalShares;
    const BuyOrders = rows[0].BuyOrders;
    const currentPrice = rows[0].CurrentPrice;
    const InitialPrice = rows[0].InitialPrice;
    const BetaValue = rows[0].BetaValue;

    
    const newPrice = InitialPrice + (InitialPrice * ((BuyOrders - SellOrders) / TotalShares) * Beta) - (currentPrice / 2);

      const newAvailableShares = availableShares - quantity;
      await pool.query(`
        UPDATE Stocks
        SET AvailableShares = ? AND CurrentPrice = ?
        WHERE StockSymbol = ? AND CompetitionID = ?;
      `, [newAvailableShares, newPrice, stockSymbol, CompetitionID]);

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
      const totalSellValue = quantity * currentPrice;
      await pool.query(`
        UPDATE Teams
        SET CurrentCash = CurrentCash + ?
        WHERE TeamID = ?
      `, [totalSellValue, teamId]);


      await pool.query(`
        INSERT INTO Transactions (TeamID, StockSymbol, Quantity, Price, CompetitionID)
        VALUES (?, ?, ?, ?, ?)
      `, [teamId, stockSymbol, -quantity, currentPrice, CompetitionID]);

      const rows = await pool.query(`
      SELECT TotalShares, BuyOrders, SellOrders, CurrentPrice, InitialPrice, BetaValue
      FROM Stocks
      WHERE StockSymbol = ? AND CompetitionID = ?`, [stockSymbol, CompetitionID]);
      const TotalShares = rows[0].TotalShares;
      const BuyOrders = rows[0].BuyOrders;
      const InitialPrice = rows[0].InitialPrice;
      const BetaValue = rows[0].BetaValue;

      const newPrice = InitialPrice + (InitialPrice * ((BuyOrders - SellOrders) / TotalShares) * Beta) - (currentPrice / 2);
      await pool.query(`
      UPDATE Stocks
      SET AvailableShares = AvailableShares + ? AND CurrentPrice = ?
      WHERE StockSymbol = ? AND CompetitionID = ?;
    `, [quantity, newPrice, stockSymbol, CompetitionID]);

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

//api to show transaction history. competiton id in url. if we want all transactions, write all in stockSymbol and teamId in body.
//if we want stockwise history (history of one particular stock), write all in teamId and specific stock stockSymbol. same if we want teamwise transaction history
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


//this is for organises to create a new stock
app.post('/organiser/makeStocks', async (req, res) => {
  const {
    CompetitionID, stockSymbol, stockName, initialPrice, currentPrice, availableShares, betaValue, sectorId} = req.body;

  try {
    const pool = await connectToDatabase();
    const result = await pool.query(`
      INSERT INTO Stocks (CompetitionID, StockSymbol, StockName, InitialPrice, CurrentPrice, AvailableShares, BetaValue, SectorID) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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





































