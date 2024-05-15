const config = require('./gameConfig.json'); 

const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  //buyOrders: { type: Number, required: true};
  //sellOrders: { type: Number, required: true};
  initialPrice: {type:Number, required:true},
  maxLimit: { type: Number }, 
  totalInvestment: { type: Number },
  supply: {  
    type: Number,
    required: true,
    get: function() {  
      return Math.floor((this.maxLimit || 0) * (this.totalInvestment || 0) * (config.numberOfParticipants || 0) / this.initialPrice);
    }
  },   
  transactionHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
});

module.exports = mongoose.model('Stock', stockSchema);
