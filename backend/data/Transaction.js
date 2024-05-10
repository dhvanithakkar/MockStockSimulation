const mongoose = require('mongoose');
const transactionSchema = new mongoose.Schema({
    participant: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant', required: true },
    stock: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    transactionType: { type: String, required: true, enum: ['buy', 'sell'] },
    timestamp: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model('Transaction', transactionSchema);
  