const mongoose = require('mongoose');
const uri = "mongodb+srv://vruddhishah173:vruddhi@mockstock.9lxwa9c.mongodb.net/mockstock"; 

mongoose.connect(uri, { useNewUrlParser: true })
  .then(() => console.log('MongoDB database connection established successfully'))
  .catch(err => console.error('Error connecting to MongoDB database:', err));

  const Participant = require('./data/Participant');
  const Stock = require('./data/Stock');
  const Newsdrop = require('./data/Newsdrop');
  const Transaction = require('./data/Transaction');
