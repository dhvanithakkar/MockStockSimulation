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
  AvailableShares INT NOT NULL DEFAULT 0,
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

CREATE TABLE Graph (
  stockSymbol VARCHAR(10) NOT NULL,
  competitionID INT NOT NULL,
  timest DATETIME NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (stockSymbol, competitionID, timest)  -- Composite primary key
--   FOREIGN KEY (stockSymbol, competitionID) REFERENCES Stocks(StockSymbol, CompetitionID)  -- Foreign key relationship
);
