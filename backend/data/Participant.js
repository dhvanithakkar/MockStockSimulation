const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },  
  name: { type: String },  
  funds: { type: Number, required: true },  
  portfolio: [{
    stockSymbol: { type: String, required: true },
    quantity: { type: Number, required: true }
  }],
  transactionHistory: [{  
    stockSymbol: { type: String, required: true }, 
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }, //don't do schema.type
    transactionType: { type: String, required: true, enum: ['buy', 'sell'] },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });  



module.exports = mongoose.model('Participant', participantSchema);
