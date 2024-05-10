const mongoose = require('mongoose');

participantSchema = new mongoose.Schema({
  _id:username,
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  funds: { type: Number, required: true },
  portfolio: [
    {
    stockSymbol: { type: String, required: true },
    quantity: { type: Number, required: true }
  }],
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
}, { timestamps: true });




module.exports = mongoose.model('Participant', participantSchema);
