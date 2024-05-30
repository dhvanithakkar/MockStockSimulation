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


app.get('/companies', async (req, res) => {
  const CompetitionID = req.params.CompetitionID;
  try {
      const pool = await connectToDatabase();
      const [rows] = await pool.query(`
          SELECT StockSymbol, CurrentPrice, CompetitionID, AvailableShares, BetaValue FROM Stocks WHERE CompetitionID = 1`);
      res.json(rows);
  } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching companies');
  }
});

//to get current cash in my wallet
app.get('/mywallet/:CompetitionID/:TeamID', async (req, res) => {
  const CompetitionID = req.params.CompetitionID;
  const TeamID = req.params.TeamID;
  try {
    const pool = await connectToDatabase();
    const [rows] = await pool.query(`
      SELECT t.CurrentCash 
      FROM teams t
      WHERE t.CompetitionID = ? AND t.TeamID = ?`, [CompetitionID, TeamID]);
    if (rows.length === 0) {
      return res.status(404).send('Team not found');
    }

    res.json(rows[0]); 
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching team cash');
  }
});


app.get('/forgraph/:CompetitionID/:StockSymbol', async (req, res) => {
    const CompetitionID = req.params.CompetitionID;
    const StockSymbol = req.params.StockSymbol;
    console.log(CompetitionID, StockSymbol);
    try{
      const pool = await connectToDatabase();
    const [rows] = await pool.query(`
    SELECT price, timest from StockGraphs where StockSymbol = ? AND CompetitionID = ?`, [StockSymbol, CompetitionID]);
    console.log(rows);
    res.json(rows);
    }
    catch (error) {
      console.error(error);
      res.status(500).send('Error fetching graph');
    }
});

//get list of sectors
app.get('/listsectors/:CompetitionID', async (req, res) => {
  const CompetitionID = req.params.CompetitionID;
  try{
    const pool = await connectToDatabase();
    const [rows] = await pool.query(`SELECT SectorName, SectorID
    FROM Sectors 
    WHERE SectorID IN
    ( SELECT SectorID
    FROM Stocks 
    WHERE CompetitionID = ?);`, [CompetitionID]);
    console.log(rows);
    res.json(rows);
  }
  catch (error) {
    console.error(error);
    res.status(500).send('Error fetching stocks list');
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
  console.log("Recieved data", CompetitionID, stockSymbol, newPrice);
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
        INSERT INTO Transactions (TeamID, StockSymbol, Quantity, Price, TransactionType, CompetitionID)
        VALUES (?, ?, ?, ?, 'BUY', ?)
      `, [teamId, stockSymbol, quantity, totalPrice, CompetitionID]);
    
      
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
      const currentHoldings = await getTeamHoldings(pool, teamId, stockSymbol, CompetitionID);
      console.log("Current holdings are", currentHoldings);
      if (currentHoldings < quantity) {
        console.log("Current holdings are", currentHoldings);
        return res.status(400).send('Insufficient stock holdings');
      }
      
      const currentPrice = await getStockPrice(pool, stockSymbol, CompetitionID);
    
      await pool.query(`
      INSERT INTO Transactions (TeamID, StockSymbol, Quantity, Price, TransactionType, CompetitionID)
      VALUES (?, ?, ?, ?, 'SELL', ?)
    `, [teamId, stockSymbol, quantity, currentPrice, CompetitionID]);

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
//if we want stockwise history (history of one particular stock), write all in teamID and specific stock stockSymbol. same if we want teamwise transaction history
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
    query += ` ORDER BY Transactions.TransactionTime DESC`;
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
  }
});

//get competitionID from teamID
app.get('/getGameID/:teamID', async(req, res) => {
  const TeamID = parseInt(req.params.teamID, 10);
  try{
    const pool = await connectToDatabase();
    let query = `
    SELECT CompetitionID
FROM Teams 

WHERE TeamID = ?
`;
  const [rows] = await pool.query(query, [TeamID]);
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
    CompetitionID, CollegeID, CompetitionName, StartDate, EndDate  , InitialCash , NumberOfParticipants, Description} = req.body;
  
  try {
    const pool = await connectToDatabase();
const preparedStatement = `INSERT INTO Competitions (CompetitionID, CollegeID, CompetitionName, StartDate, EndDate  , InitialCash , NumberOfParticipants, Description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
const result = await pool.query(preparedStatement, [
  CompetitionID, CollegeID, CompetitionName, StartDate, EndDate, InitialCash , NumberOfParticipants, Description
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
    

const preparedStatement = `INSERT INTO Stocks (CompetitionID, StockSymbol, StockName, InitialPrice, TotalShares, BetaValue, SectorID, CurrentPrice) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
const result = await pool.query(preparedStatement, [
  CompetitionID,
  stockSymbol,
  stockName,
  initialPrice,
  TotalShares,
  betaValue,
  sectorId,
  initialPrice
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
//displaying game list
app.get('/organiser/displayGames', async(req, res) => {
  const CompetitionID = parseInt(req.params.CompetitionID, 10);
  try{
    const pool = await connectToDatabase();
    const [rows] = await pool.query(`
    SELECT CompetitionID, CompetitionName, StartDate, EndDate, InitialCash, Description FROM Competitions`);
    console.log(rows);
    res.json(rows);
    }
    catch (error) {
      console.error(error);
      res.status(500).send('Error displaying games');
    }
});

//for displaying stocks
app.get('/organiser/displayStocks/:CompetitionID', async(req, res) => {
  const CompetitionID = parseInt(req.params.CompetitionID, 10);
  try{
    const pool = await connectToDatabase();
    const [rows] = await pool.query(`
    SELECT StockSymbol, StockName, CurrentPrice, BetaValue, AvailableShares 
    FROM stocks
    where CompetitionID = ?`, [CompetitionID]);
    console.log(rows);
    res.json(rows);
    }
    catch (error) {
      console.error(error);
      res.status(500).send('Error fetching stocks');
    }
});

//for displaying teams
app.get('/organiser/displayTeams/:CompetitionID', async (req, res) => {
  const CompetitionID = parseInt(req.params.CompetitionID, 10);
  
  try {
    const pool = await connectToDatabase();
    
    const [rows] = await pool.query(`
      SELECT TeamName, TeamID, CurrentCash
      FROM Teams
      WHERE CompetitionID = ?
    `, [CompetitionID]);

    console.log(rows);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching teams');
  }
});

//end date and time
app.get('/endTime/:CompetitionID', async (req, res) => {
  const CompetitionID = parseInt(req.params.CompetitionID, 10);
  
  try {
    const pool = await connectToDatabase();
    
    const [rows] = await pool.query(`
      SELECT EndDate
      FROM Competitions
      WHERE CompetitionID = ?
    `, [CompetitionID]);

    console.log(rows);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching end time');
  }
});



//for deleting stock
app.delete('/organiser/deleteStocks', async(req, res) =>{
  const {StockSymbol, CompetitionID} = req.body;
  try{
    const pool = await connectToDatabase();
    await pool.query(`
    DELETE
  FROM Transactions
  WHERE CompetitionID = ? AND StockSymbol = ?;`, [CompetitionID, StockSymbol]);
  await pool.query(`
    DELETE
  FROM StockGraphs
  WHERE CompetitionID = ? AND StockSymbol = ?;`, [CompetitionID, StockSymbol]);
  const result = await pool.query(`
  DELETE FROM Stocks
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

//for making a team
app.post('/organiser/createTeam', async (req, res) => {
  const {
    TeamID,
    TeamPassword,
    CompetitionID,
    TeamName,
    Email
  } = req.body;
  
  console.log('Create team API called. Received data:', {
    TeamID,
    TeamPassword,
    CompetitionID,
    TeamName,
    Email
  });

  try {
    const pool = await connectToDatabase();

    const preparedStatement = `
      INSERT INTO Teams (TeamID, TeamPassword, CompetitionID, TeamName, Email)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const result = await pool.query(preparedStatement, [
      TeamID,
      TeamPassword,
      CompetitionID,
      TeamName,
      Email
    ]);

    if (result.affectedRows === 0) {
      throw new Error('Failed to create team');
    }

    res.json({ message: 'Team created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating team');
  }
});

//for creating news
app.post('/news/create', async (req, res) => {
  const { title, content, CompetitionID } = req.body;

  console.log('Received data:', { title, content, CompetitionID });

  try {
    const pool = await connectToDatabase();

    const preparedStatement = `
      INSERT INTO News (Title, Content, CompetitionID)
      VALUES (?, ?, ?)
    `;

    const result = await pool.query(preparedStatement, [title, content, CompetitionID]);

    if (result.affectedRows === 0) {
      throw new Error('Failed to create news entry');
    }

    res.json({ message: 'News created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating news entry');
  }
});

app.post('/news/display', async (req, res) => {
  const { CompetitionID } = req.body;


  try {
    const pool = await connectToDatabase();

    const preparedStatement = `
      SELECT * FROM NEWS WHERE CompetitionID = ?
    `;

    const result = await pool.query(preparedStatement, [CompetitionID]);

    if (result.affectedRows === 0) {
      throw new Error('Failed to create news entry');
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error displaying news');
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

async function getTeamHoldings(pool, teamId, stockSymbol, competitionID) {
  const [rows] = await pool.query(`
    SELECT SUM(CASE WHEN TransactionType = 'BUY' THEN Quantity ELSE -Quantity END) AS Quantity
    FROM Transactions
    WHERE TeamID = ? AND StockSymbol = ? AND CompetitionID = ?
  `, [teamId, stockSymbol, competitionID]);

  const holdings = rows[0].Quantity;

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

