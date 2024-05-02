const config = require('./gameConfig.json'); 

const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  initialPrice: { type: Number, required: true },
  currentPrice: { type: Number, required: true },
  maxLimit: { type: Number }, 
  totalInvestment: { type: Number },
  supply: {  // Total number of available shares (initially calculated, then updated)
    type: Number,
    required: true,
    get: function() {  // Virtual getter for initial calculation
      return Math.floor((this.maxLimit || 0) * (this.totalInvestment || 0) * (config.numberOfParticipants || 0) / this.initialPrice);
    }
  },   
  transactionHistory: [{
    participantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant' },
    timestamp: { type: Date, default: Date.now },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    transactionType: { type: String, required: true, enum: ['buy', 'sell'] }
  }]
});

module.exports = mongoose.model('Stock', stockSchema);
