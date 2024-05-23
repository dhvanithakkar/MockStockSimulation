drop database mockstock;
create database mockstock;
use mockstock;

CREATE TABLE Colleges (
  CollegeID INT PRIMARY KEY AUTO_INCREMENT,
  CollegeName VARCHAR(255) NOT NULL,
  CollegePassword VARCHAR(255) NOT NULL
);

CREATE TABLE Competitions (
  CompetitionID INT PRIMARY KEY AUTO_INCREMENT,
  CollegeID INT NOT NULL,
  CompetitionName VARCHAR(255) NOT NULL,
  StartDate DATETIME NOT NULL,
  EndDate DATETIME NOT NULL,
  InitialCash DECIMAL(10,2) NOT NULL,
  NumberOfParticipants INT NOT NULL,
  URL VARCHAR(255),
  FOREIGN KEY (CollegeID) REFERENCES Colleges(CollegeID)
);

CREATE TABLE Teams (
  TeamID INT PRIMARY KEY AUTO_INCREMENT,
  TeamPassword VARCHAR(255) NOT NULL,
  CompetitionID INT NOT NULL,
  TeamName VARCHAR(255) NOT NULL,
  Email VARCHAR(255),
  CurrentCash DECIMAL(10,2) NOT NULL DEFAULT 0,
  FOREIGN KEY (CompetitionID) REFERENCES Competitions(CompetitionID)
);

CREATE TABLE Sectors (
  SectorID INT PRIMARY KEY AUTO_INCREMENT,
  SectorName VARCHAR(255) NOT NULL
);

CREATE TABLE Stocks (
  CompetitionID INT NOT NULL,
  StockSymbol VARCHAR(10) NOT NULL,
  StockName VARCHAR(255) NOT NULL,
  InitialPrice DECIMAL(10,2) NOT NULL,
  CurrentPrice DECIMAL(10,2) NOT NULL,
  AvailableShares INT NOT NULL,
  TotalShares INT NOT NULL,
  BuyOrders INT NOT NULL DEFAULT 0,
  SellOrders INT NOT NULL DEFAULT 0,
  BetaValue DECIMAL(10,2),
  SectorID INT NOT NULL,
  PRIMARY KEY (StockSymbol, CompetitionID),
  FOREIGN KEY (CompetitionID) REFERENCES Competitions(CompetitionID),
  FOREIGN KEY (SectorID) REFERENCES Sectors(SectorID)
);


CREATE TABLE Transactions (
  TransactionID INT PRIMARY KEY AUTO_INCREMENT,
  TeamID INT NOT NULL,
  StockSymbol VARCHAR(10) NOT NULL,
  CompetitionID INT NOT NULL,
  TransactionType ENUM('BUY', 'SELL') NOT NULL,
  TransactionTime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
  Price DECIMAL(10,2) NOT NULL,
  Quantity INT NOT NULL,
  FOREIGN KEY (TeamID) REFERENCES Teams(TeamID),
  FOREIGN KEY (StockSymbol, CompetitionID) REFERENCES Stocks(StockSymbol, CompetitionID)
);

DELIMITER //
CREATE TRIGGER set_team_cash_before_insert
BEFORE INSERT ON Teams
FOR EACH ROW
BEGIN
  SET NEW.CurrentCash = (SELECT InitialCash FROM Competitions WHERE CompetitionID = NEW.CompetitionID);
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER set_available_shares_on_insert
BEFORE INSERT ON Stocks
FOR EACH ROW
BEGIN
  SET NEW.AvailableShares = NEW.TotalShares;
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER update_stock_orders 
AFTER INSERT ON Transactions
FOR EACH ROW
BEGIN

  UPDATE Stocks
  SET 
    BuyOrders = IF(NEW.TransactionType = 'BUY', BuyOrders + NEW.Quantity, BuyOrders),
    SellOrders = IF(NEW.TransactionType = 'SELL', SellOrders + NEW.Quantity, SellOrders),
    AvailableShares = AvailableShares - IF(NEW.TransactionType = 'BUY', NEW.Quantity, 0) + IF(NEW.TransactionType = 'SELL', NEW.Quantity, 0)
  WHERE StockSymbol = NEW.StockSymbol AND CompetitionID = NEW.CompetitionID;

END //
DELIMITER ;

INSERT INTO Colleges (CollegeName, CollegePassword) VALUES 
  ('NM College', 'password123'),
  ('DJSCE', 'password456');

INSERT INTO Competitions (CollegeID, CompetitionName, StartDate, EndDate, InitialCash, NumberOfParticipants, URL) VALUES
  (1, 'Mock Stock Tester', '2024-05-23 00:00:00', '2024-05-23 15:00:00', 10000.00, 10, 'https://basic.url.com/mockstocktester'),
  (2, 'Trading Competition', '2024-07-24 00:00:00', '2024-07-24 11:00:00', 5000.00, 5, 'https://basic.url.com/tradingcompetition');

INSERT INTO Teams (CompetitionID, TeamPassword, TeamName, Email) VALUES
  (1, 'team123', 'The Investment Club', 'invest@nm.edu'),
  (1, 'team456', 'The Wolf of Wall Street', 'wallstreet@nm.edu'),
  (2, 'team789', 'The Market Movers', 'movers@djsce.edu');

INSERT INTO Sectors (SectorName) VALUES
  ('Technology'),
  ('Healthcare'),
  ('Consumer Staples');

INSERT INTO Stocks (CompetitionID, StockSymbol, StockName, InitialPrice, CurrentPrice, TotalShares, BetaValue, SectorID) VALUES
  (1, 'AAPL', 'Apple Inc.', 150.00, 150.00, 10000, 1.00, 1),
  (1, 'AMZN', 'Amazon.com Inc.', 120.00, 120.00, 8000, 1.20, 2),
  (1, 'TSLA', 'Tesla Inc.', 200.00, 200.00, 5000, 1.50, 1),
  (2, 'AAPL', 'Apple Inc.', 150.00, 150.00, 10000, 1.00, 1),
  (2, 'AMZN', 'Amazon.com Inc.', 120.00, 120.00, 8000, 1.20, 2),
  (2, 'TSLA', 'Tesla Inc.', 200.00, 200.00, 5000, 1.50, 1),
  (2, 'JNJ', 'Johnson & Johnson', 130.00, 130.00, 7000, 0.80, 3),
  (1, 'JNJ', 'Johnson & Johnson2', 130.00, 130.00, 7000, 0.80, 3);

INSERT INTO Transactions (TeamID, CompetitionID, StockSymbol, TransactionType, Price, Quantity)
VALUES (1, 1, 'AAPL', 'BUY',  150.25, 10),
       (2, 1, 'AMZN', 'SELL', 300.00, 5),
        (1, 1, 'TSLA', 'BUY', 200.50, 20),
        (3, 2, 'AAPL', 'BUY', 150.25, 10),
        (3, 2, 'AMZN', 'SELL', 350.00, 5),
        (1, 1, 'TSLA', 'SELL', 200.50, 10),
        (1, 1, 'AMZN', 'BUY', 240.00, 5),
        (1, 1, 'AAPL', 'BUY', 220.00, 15),
        (1, 1, 'TSLA', 'BUY', 200.50, 20),
        (1, 1, 'AAPL', 'BUY',   150.25, 10),
       (2, 1, 'AMZN', 'SELL',  300.00, 5),
       (1, 1, 'TSLA', 'BUY', 200.50, 20),
       (3, 2, 'AAPL', 'BUY',  150.25, 10),
       (3, 2, 'AMZN', 'SELL',  350.00, 5),
       (1, 1, 'TSLA', 'SELL', 200.50, 10),
       (1, 1, 'JNJ', 'BUY', 240.00, 5),
       (1, 1, 'JNJ', 'BUY',  220.00, 15),
       (2, 1, 'JNJ', 'BUY',  150.25, 10),
       (2, 1, 'JNJ', 'SELL',  350.00, 5),
       (1, 1, 'JNJ', 'SELL', 200.50, 10),
       (3, 2, 'JNJ', 'BUY', 240.00, 5),
       (3, 2, 'JNJ', 'BUY',  220.00, 15),
       (1, 2, 'TSLA', 'BUY', 200.50, 20);
