-- Buy: reduce current cash, reduce availableStocks, update the buy orders, update price
-- Sell: Increase current cash, Increase availableStocks,  update the sell orders, update price


DELIMITER //
CREATE TRIGGER update_current_cash 
AFTER INSERT ON Transactions
FOR EACH ROW
BEGIN

  UPDATE Teams
  SET 
    CurrentCash = CurrentCash - IF(NEW.TransactionType = 'BUY', NEW.Quantity * NEW.Price, 0) + IF(NEW.TransactionType = 'SELL', NEW.Quantity * NEW.Price, 0)
  WHERE TeamID = NEW.TeamID;

END //
DELIMITER ;


DELIMITER //
CREATE TRIGGER update_stock_orders_price
AFTER INSERT ON Transactions
FOR EACH ROW
BEGIN
  DECLARE initial_price DECIMAL(10,2);
  DECLARE new_price DECIMAL(10,2);
  DECLARE buy_orders INT;
  DECLARE sell_orders INT;
  DECLARE supply INT;
  DECLARE beta DECIMAL(10,2);

  UPDATE Stocks
  SET 
    BuyOrders = IF(NEW.TransactionType = 'BUY', BuyOrders + NEW.Quantity, BuyOrders),
    SellOrders = IF(NEW.TransactionType = 'SELL', SellOrders + NEW.Quantity, SellOrders),
    AvailableShares = AvailableShares - IF(NEW.TransactionType = 'BUY', NEW.Quantity, 0) + IF(NEW.TransactionType = 'SELL', NEW.Quantity, 0)
  WHERE StockSymbol = NEW.StockSymbol AND CompetitionID = NEW.CompetitionID;


  SELECT st.BuyOrders, st.SellOrders, st.TotalShares, st.BetaValue, st.InitialPrice
  INTO buy_orders, sell_orders, supply, beta, initial_price
  FROM Stocks st
  WHERE st.StockSymbol = NEW.StockSymbol AND st.CompetitionID = NEW.CompetitionID;

  SET new_price = initial_price + initial_price * ((buy_orders - sell_orders) / supply) * beta;

  UPDATE Stocks
  SET CurrentPrice = new_price
  WHERE StockSymbol = NEW.StockSymbol AND CompetitionID = NEW.CompetitionID;
  
  INSERT INTO Graph(stockSymbol,  competitionID, timest,  price)
  VALUES (NEW.StockSymbol, NEW.CompetitionID, NEW.TransactionTime, NEW.price);
  
END //
DELIMITER ;
