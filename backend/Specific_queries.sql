-- ALL Transactions of THIS competition(1):
select * from Transactions
where CompetitionID = 1;


-- Transactions of THIS stock (AAPL)
select * from transactions
where CompetitionID = 1
and StockSymbol = "AAPL";

-- Transactions of THIS Team (1)
select * from transactions
where teamID = 1;

-- Portfolio of THIS Team (1)
SELECT 
  s.StockSymbol, 
  s.CurrentPrice,
  SUM(CASE WHEN t.TransactionType = 'BUY' THEN t.Quantity * t.Price ELSE -t.Quantity * t.Price END) AS TotalAmountInvested,
  SUM(CASE WHEN t.TransactionType = 'BUY' THEN t.Quantity ELSE -t.Quantity END) AS CurrentHoldings,
  s.CurrentPrice * SUM(CASE WHEN t.TransactionType = 'BUY' THEN t.Quantity ELSE -t.Quantity END) AS TotalMarketValue
FROM Transactions t
INNER JOIN Stocks s ON t.StockSymbol = s.StockSymbol
WHERE TeamID = 1 AND s.CompetitionID = 1
GROUP BY s.StockSymbol, s.CurrentPrice;

-- Delete Stock
DELETE FROM Transactions
WHERE CompetitionID = 1 AND StockSymbol = 'JNJ';

DELETE FROM Stocks
WHERE CompetitionID = 1 AND StockSymbol = 'JNJ';

DELETE FROM StockGraphs
WHERE CompetitionID = 1 AND StockSymbol = 'JNJ';

-- Delete Team
DELETE FROM Transactions
WHERE CompetitionID = 1 AND TeamID = 2;

DELETE FROM Teams
WHERE CompetitionID = 1 AND TeamID = 2;

-- Leaderboard
SELECT 
  team.TeamID,
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
WHERE team.CompetitionID = 1
ORDER BY TotalNetWorth DESC;


-- Graph data for stock "JNJ" of competition 1
SELECT Price, TransactionTime
FROM Transactions
WHERE StockSymbol = "JNJ" AND CompetitionID = 1
ORDER BY TransactionTime ASC;


-- Get sector names having stocks in competition 1
SELECT SectorName 
FROM Sectors 
WHERE SectorID IN
( SELECT SectorID
FROM Stocks 
WHERE CompetitionID = 2);
