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
  INSERT INTO StockGraphs(stockSymbol,  competitionID, timest,  price)
  VALUES (NEW.StockSymbol, NEW.CompetitionID, CURRENT_TIMESTAMP(), NEW.InitialPrice);

END //
DELIMITER ;
--
