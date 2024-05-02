const mongoose = require('mongoose');
const uri = "mongodb://localhost:27017/mockstock"; 

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB database connection established successfully'))
  .catch(err => console.error('Error connecting to MongoDB database:', err));

  const Participant = require('./data/Participant');
  const Stock = require('./data/Stock');
  
  
  console.log('Participant schema:', Participant.schema);
  console.log('Stock schema:', Stock.schema);