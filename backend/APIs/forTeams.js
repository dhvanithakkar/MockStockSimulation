const express = require('express');
const router = express.Router();

const Participant = require('./data/Participant');
const Stock = require('./data/Stock');
const Transaction = require('./data/Transaction');

//getting all stocks list
router.get('/stocks', async (req, res) => {
  try {
    const stocks = await Stock.find();
    res.json(stocks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching stocks' });
  }
});

//portfolio
router.get('/portfolio/:username', async (req, res) => {
    const username = req.params.username;
    const stockSymbols = []; // Array to store stock symbols
    try{
    const participant = await Participant.findOne({ username });
  
        participant.portfolio.forEach((portfolioItem) => {
        stockSymbols.push(portfolioItem.stockSymbol);
      });
  
      const stockPrices = await Promise.all(
        stockSymbols.map(async (symbol) => {
          const stock = await Stock.findOne({ symbol });
          return { symbol: stock.symbol, price: stock.price };
        })
      );
  
      const completePortfolio = participant.portfolio.map((portfolioItem, index) => ({
        stockSymbol: portfolioItem.stockSymbol,
        price: portfolioItem.stockSymbol.price, 
        quantity: portfolioItem.quantity,
      }));
  
      res.json(formattedPortfolio);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching portfolio' });
    }
  });
  


