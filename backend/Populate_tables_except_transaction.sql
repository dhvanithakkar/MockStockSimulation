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
