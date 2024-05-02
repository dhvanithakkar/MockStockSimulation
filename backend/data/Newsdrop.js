const mongoose = require('mongoose');

const newsdropSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  impact: { 
    stockSymbol: { type: String },
    priceChange: { type: Number, required: true },  // will multiply this to get difference
    type: { type: String, enum: ['positive', 'negative'] } 
  },
  round: { type: Number, required: true }  // Round number when the newsdrop is released
});

module.exports = mongoose.model('Newsdrop', newsdropSchema);
