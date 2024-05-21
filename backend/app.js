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
app.put('/organiser/events/:eventId/price', async (req, res) => {
  const eventId = req.params.eventId;
  const { newPrice } = req.body; 

  try {
    const updateResult = await updateEventPrice(eventId, newPrice);
    if (updateResult.error) {
      return res.status(400).json(updateResult); 
    }
    res.json(updateResult);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error'); 
  }
});

app.delete('/organiser/:eventId/participants/:participantId', async (req, res) => {
  const eventId = req.params.eventId;
  const participantId = req.params.participantId;

  try {
    const removeResult = await removeParticipant(eventId, participantId);
    if (removeResult.error) {
      return res.status(400).json(removeResult); 
    }
    res.json(removeResult);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


async function removeParticipant(eventId, participantId) {
  try {
    const pool = await connectToDatabase();
    const result = await pool.query(`
      DELETE FROM EventParticipants
      WHERE EventID = ? AND ParticipantID = ?
    `, [eventId, participantId]);

    if (result.affectedRows === 0) {
      throw new Error('Participant not found or removal failed');
    }

    return { message: 'Participant removed successfully.' };
  } catch (error) {
    console.error(error);
    return { error: error.message }; 
  }
}

async function updateEventPrice(eventId, newPrice) {
  try {
    const pool = await connectToDatabase();
    const result = await pool.query(`
      UPDATE Events
      SET Price = ?
      WHERE EventID = ?
    `, [newPrice, eventId]);

    if (result.affectedRows === 0) {
      throw new Error('Event not found or update failed');
    }

    return { message: 'Event price updated successfully.' };
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
  Stocks.StockSymbol, 
  SUM(Transactions.Quantity) AS TotalQuantity, 
  Transactions.Price AS TransactionPrice, 
  Stocks.StockName, 
  Stocks.CurrentPrice
FROM Transactions
INNER JOIN Stocks ON Transactions.StockSymbol = Stocks.StockSymbol
WHERE Transactions.TeamID = ?
GROUP BY Stocks.StockSymbol
HAVING SUM(Transactions.Quantity) <> 0;
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
      const currentHoldings = await getTeamHoldings(pool, teamId, stockSymbol);
      if (currentHoldings < quantity) {
        return res.status(400).send('Insufficient stock holdings');
      }
      const currentPrice = await getStockPrice(pool, stockSymbol);
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
        WHERE StockSymbol = ?
      `, [quantity, stockSymbol]);

    
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



















