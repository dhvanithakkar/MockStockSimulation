const express = require('express');
const connectToDatabase = require('./database'); 
const cors = require('cors');
const app = express();
const allowedOrigin = 'http://127.0.0.1:5501';
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());
//to get current cash in my wallet
app.get('mywallet/:CompetitionID/:TeamID', async (req, res) => {
  const TeamId = req.params.TeamID;
  const CompetitionID = req.params.CompetitionID;
  try{
    const pool = await connectToDatabase();
    const [rows] = await pool.query(`
    SELECT CurrentCash from teams where CompetitionID = ? AND TeamID = ?`, [CompetitionID, TeamID]);
    res.json(rows);}
    catch (error) {
      console.error(error);
      res.status(500).send('Error fetching current cash');
    }
})

app.get('forgraph/:CompetitionID/:StockSymbol', async (req, res) => {
    const CompetitionID = req.params.CompetitionID;
    const StockSymbol = req.params.StockSymbol;
    try{
      const pool = await connectToDatabase();
    const [rows] = await pool.query(`
    SELECT price, timest from graph where StockSymbol = ? AND CompetitionID = ?`, [StockSymbol, CompetitionID]);
    console.log(rows);
    res.json(rows);
    }
    catch (error) {
      console.error(error);
      res.status(500).send('Error fetching graph');
    }
});

app.get('/listsectors/:CompetitionID', async (req, res) => {
  const CompetitionID = req.params.CompetitionID;
  try{
    const pool = await connectToDatabase();
    const [rows] = await pool.query(` `)
  }
})

//get sectorwise stocks
app.get('/getsectorwise/:SectorName', async (req, res) => {
  const SectorName = req.params.SectorName;
  try{
    const pool = await connectToDatabase();
    const [rows] = await pool.query(`
    SELECT s.CurrentPrice, s.StockSymbol FROM Stocks s and Sectors sec where s.sectorId = sec.sectorId and sec.SectorName = ?`,
  [SectorName]);
  console.log(rows);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching portfolio');
  }
});

//getting portfolio of a specific team. teamID in url
app.get('/portfolio/:CompetitionID/:teamId', async (req, res) => {
  const teamId = req.params.teamId;
  const CompetitionID = req.params.CompetitionID;
  try {
    const pool = await connectToDatabase();
    const [rows] = await pool.query(`
    SELECT 
    s.StockSymbol, 
    s.CurrentPrice,
    SUM(CASE WHEN t.TransactionType = 'BUY' THEN t.Quantity * t.Price ELSE -t.Quantity * t.Price END) AS TotalAmountInvested,
    SUM(CASE WHEN t.TransactionType = 'BUY' THEN t.Quantity ELSE -t.Quantity END) AS CurrentHoldings,
    s.CurrentPrice * SUM(CASE WHEN t.TransactionType = 'BUY' THEN t.Quantity ELSE -t.Quantity END) AS TotalMarketValue
  FROM Transactions t
  INNER JOIN Stocks s ON t.StockSymbol = s.StockSymbol
  WHERE TeamID = ? AND s.CompetitionID = ?
  GROUP BY s.StockSymbol, s.CurrentPrice;
    `, [teamId, CompetitionID]);
    console.log(rows);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching portfolio');
  }
});
//get teamId and teamPassword
app.get('/logincredentials', async (req, res) => {
  try {
    const pool = await connectToDatabase();
    const [rows] = await pool.query(`
      SELECT 
        TeamID, TeamPassword 
      FROM Teams
      `);
    console.log(rows);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching login credentials');
  }
});
//get admin credentials
app.get('/admincredentials', async (req, res) => {
  try {
    const pool = await connectToDatabase();
    const [rows] = await pool.query(`
      SELECT 
      CollegeID  , CollegePassword 
      FROM Colleges
      `);
    console.log(rows);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching college credentials');
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
      updategraph();
      
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
    updategraph();
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

//for making leaderboard
app.get('/organiser/leaderboard/:competitionID', async(req, res) => {
  const CompetitionID = parseInt(req.params.competitionID, 10);
  try{
    const pool = await connectToDatabase();
    let query = `
    SELECT 
  team.TeamName,
  nw.TotalMarketValue + team.CurrentCash AS TotalNetWorth,
  nw.TotalMarketValue as StockValue,
  CurrentCash as CashValue
FROM Teams team
INNER JOIN (
  SELECT 
    t.TeamID,
    SUM(s.CurrentPrice * CASE WHEN t.TransactionType = 'BUY' THEN t.Quantity ELSE -t.Quantity END) AS TotalMarketValue
	FROM Transactions t
	INNER JOIN Stocks s ON t.StockSymbol = s.StockSymbol
	GROUP BY t.TeamID
) nw 
ON team.TeamID = nw.TeamID
WHERE team.CompetitionID = ?
ORDER BY TotalNetWorth DESC`;
  const [rows] = await pool.query(query, [CompetitionID]);
  res.json(rows);
} catch (error) {
  console.error(error);
}
});

//this is for organises to create a new game
app.post('/organiser/makeGame', async (req, res) => {
  const {
    CompetitionID, CollegeID, CompetitionName, StartDate, EndDate  , InitialCash , NumberOfParticipants} = req.body;
  
  try {
    const pool = await connectToDatabase();
const preparedStatement = `INSERT INTO Stocks (CompetitionID, CollegeID, CompetitionName, StartDate, EndDate  , InitialCash , NumberOfParticipants) VALUES (?, ?, ?, ?, ?, ?, ?)`;
const result = await pool.query(preparedStatement, [
  CompetitionID, CollegeID, CompetitionName, StartDate, EndDate  , InitialCash , NumberOfParticipants
]);
if (result.affectedRows === 0) {
      throw new Error('Failed to create stock');
    }
  res.json({ message: 'Game created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating game');
  }
});


//this is for organises to create a new stock
app.post('/organiser/makeStocks', async (req, res) => {
  const {
    CompetitionID, stockSymbol, stockName, initialPrice, TotalShares, betaValue, sectorId} = req.body;
    console.log('Received data:', {
      CompetitionID,
      stockSymbol,
      stockName,
      initialPrice,
      TotalShares,
      betaValue,
      sectorId
    });
    
  try {
    const pool = await connectToDatabase();
    

const preparedStatement = `INSERT INTO Stocks (CompetitionID, StockSymbol, StockName, InitialPrice, TotalShares, BetaValue, SectorID) VALUES (?, ?, ?, ?, ?, ?, ?)`;
const result = await pool.query(preparedStatement, [
  CompetitionID,
  stockSymbol,
  stockName,
  initialPrice,
  TotalShares,
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




app.listen(5500, () => console.log('Server listening on port 5500'));

