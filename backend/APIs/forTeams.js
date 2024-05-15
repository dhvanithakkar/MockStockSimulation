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

  //buying
  router.post('/portfolio/:username/buy', async (req, res) => {
    const username = req.params.username;
    const { quantity } = req.body;
  
    try {
      const participant = await Participant.findOne({ username });
      if (!participant) {
        return res.status(404).json({ message: 'Participant not found' });
      }
  
      const stock = await Stock.findOne({ symbol: participant.portfolio.stockSymbol });
      if (!stock) {
        return res.status(404).json({ message: 'Stock not found' });
      }
  
      const transactionCost = quantity * stock.price;
  
      if (participant.funds < transactionCost) {
        return res.status(400).json({ message: 'Insufficient funds' });
      }
  
      const session = await mongoose.startSession();
      session.startTransaction();
  
      try {
        if (stock.supply < quantity) {
          return res.status(400).json({ message: 'Insufficient stock supply' });
        }
  
        participant.funds -= transactionCost;
  
        const transaction = new Transaction({
          participant: participant._id,
          stock: stock._id, 
          quantity: quantity,
          price: stock.price,
          transactionType: 'buy', 
        });
        
        await transaction.save({ session });
  
        let existingPortfolioItem = participant.portfolio.find(
          (item) => item.stockSymbol === stock.symbol
        );
  
        if (existingPortfolioItem) {
          existingPortfolioItem.quantity += quantity;
        } else {
          participant.portfolio.push({ stockSymbol: stock.symbol, quantity });
        }
  
        stock.supply -= quantity;
        //update price here
        await stock.save({ session });
  
        await participant.save({ session });
  
        await session.commitTransaction();
        session.endSession();
  
        res.json({ message: 'Stock purchase successful', portfolio: participant.portfolio });
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error);
        return res.status(500).json({ message: 'Error purchasing stock' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error purchasing stock' });
    }
  });
  
//selling
router.post('/portfolio/:username/sell', async (req, res) => {
  const username = req.params.username;
  const { quantity } = req.body;

  try {
    const participant = await Participant.findOne({ username });
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    const stock = await Stock.findOne({ symbol: participant.portfolio.stockSymbol });
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    const sellingPrice = quantity * stock.price; // Calculate potential selling price

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const existingPortfolioItem = participant.portfolio.find(
        (item) => item.stockSymbol === stock.symbol
      );
      if (!existingPortfolioItem || existingPortfolioItem.quantity < quantity) {
        return res.status(400).json({ message: 'Insufficient stock quantity' });
      }

      participant.funds += sellingPrice;

      const transaction = new Transaction({
        participant: participant._id,
        stock: stock._id, 
        quantity: quantity,
        price: stock.price, 
        transactionType: 'sell', 
      });
      
      await transaction.save({ session });

      existingPortfolioItem.quantity -= quantity;

      if (existingPortfolioItem.quantity === 0) {
        participant.portfolio = participant.portfolio.filter(
          (item) => item.stockSymbol !== stock.symbol
        );
      }
      await participant.save({ session });

      stock.supply += quantity;
      //update price
      await stock.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.json({ message: 'Stock sold successfully', portfolio: participant.portfolio });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error(error);
      return res.status(500).json({ message: 'Error selling stock' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error selling stock' });
  }
});



  


