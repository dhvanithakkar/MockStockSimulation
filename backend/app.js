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

app.put('/organisers/changePrice/:competitionId/:stockSymbol', async (req, res) => {
  const competitionId = req.params.competitionId;
  const stockSymbol = req.params.stockSymbol;

  const { newPrice } = req.body; 
  if (!newPrice) {
    return res.status(400).json({ error: 'Missing newPrice in request body' });
  }

  try {
    const updateResult = await updatePrice(competitionId, stockSymbol, newPrice); 
    if (updateResult.error) {
      return res.status(400).json(updateResult); 
    }
    res.json(updateResult);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});



app.delete('/organiser/delete/:participantId', async (req, res) => {
  const participantId = req.params.participantId;

  try {
    const removeResult = await removeParticipant(participantId);
    if (removeResult.error) {
      return res.status(400).json(removeResult); // Send specific error message
    }
    res.json(removeResult);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});



async function removeParticipant(participantId) {
  try {
    const pool = await connectToDatabase();
    const result = await pool.query(`
      DELETE FROM Teams  
      WHERE TeamsId = ? 
    `, [participantId]); 

    if (result.affectedRows === 0) {
      throw new Error('Team not found or removal failed');
    }

    return { message: 'Team removed successfully.' };
  } catch (error) {
    console.error(error);
    return { error: error.message }; 
  }
}


async function updatePrice(competitionId, stockSymbol, newPrice) {
  try {
    const pool = await connectToDatabase();
    const result = await pool.query(`
      UPDATE Stocks
      SET CurrentPrice = ?
      WHERE CompetitionID = ? AND StockSymbol = ?
    `, [newPrice, competitionId, stockSymbol.toUpperCase()]); // Ensure uppercase for symbol consistency

    if (result.affectedRows === 0) {
      throw new Error('Stock not found or update failed');
    }

    return { message: 'Stock price updated successfully.' };
  } catch (error) {
    console.error(error);
    return { error: error.message }; 
  }
}


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


 

app.post('/buy/:competitionId', async (req, res) => {
  const teamId = req.body.teamId;
  const stockSymbol = req.body.stockSymbol;
  const quantity = req.body.quantity;



  try {
    const pool = await connectToDatabase();

    try {
  
      const availableShares = await checkStockAvailability(pool, stockSymbol, competitionId);
      if (availableShares < quantity) {
        return res.status(400).send('Insufficient stock available');
      }

      const teamFunds = await getTeamFunds(pool, teamId);
      const totalPrice = quantity * await getStockPrice(pool, stockSymbol, competitionId);
      if (teamFunds < totalPrice) {
        return res.status(400).send('Insufficient funds');
      }

      await pool.query(`
        INSERT INTO Transactions (TeamID, StockSymbol, Quantity, Price)
        VALUES (?, ?, ?, ?)
      `, [teamId, stockSymbol, quantity, totalPrice]);

      //const currentPrice = write formala here 
      const currentPrice = await getStockPrice(pool, stockSymbol, competitionId);
      const newAvailableShares = availableShares - quantity;
      await pool.query(`
        UPDATE Stocks
        SET AvailableShares = ?, CurrentPrice = ?
        WHERE StockSymbol = ?, CompetitionId = ?
      `, [newAvailableShares, currentPrice, stockSymbol, competitionId]);

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
      const currentHoldings = await getTeamHoldings(pool, teamId, stockSymbol);
      if (currentHoldings < quantity) {
        return res.status(400).send('Insufficient stock holdings');
      }
      const currentPrice = await getStockPrice(pool, stockSymbol, competitionId);
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
        WHERE StockSymbol = ?, CompetitionId = ?
      `, [quantity, stockSymbol, competitionId]);

    
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

app.get('/organisers/transactions/:competitionId', async (req, res) => {
  const competitionId = req.params.competitionId;
  const stockSymbol = req.body.stockSymbol;
  const teamId = req.body.TeamId;

  try {
    const pool = await connectToDatabase();
    let query = `
      SELECT *
      FROM Transactions
      INNER JOIN Stocks S ON Transactions.StockSymbol = S.StockSymbol
      WHERE S.CompetitionId = ?
    `;

    const params = [competitionId];

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
    competitionId,
    stockSymbol,
    stockName,
    initialPrice,
    currentPrice,
    availableShares,
    betaValue,
    sectorId,
  } = req.body;

  if (!competitionId || !stockSymbol || !stockName || !initialPrice || !currentPrice || !availableShares || !betaValue || !sectorId) {
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
      competitionId,
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

async function checkStockAvailability(pool, stockSymbol, competitionId) {
  const [rows] = await pool.query(`
    SELECT AvailableShares
    FROM Stocks
    WHERE StockSymbol = ?, CompetitionId = ? 
  `, [stockSymbol, competitionId]);

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

async function getStockPrice(pool, stockSymbol, competitionId) {
  const [rows] = await pool.query(`
    SELECT CurrentPrice
    FROM Stocks
    WHERE StockSymbol = ?, CompetitionId = ?
  `, [stockSymbol, competitionId]);
  return rows[0].CurrentPrice;
}



app.listen(8000, () => console.log('Server listening on port 8000'));



















