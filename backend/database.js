import mongoose from 'mongoose';
const uri = "mongodb+srv://vruddhishah173:vruddhi@mockstock.9lxwa9c.mongodb.net/mockstock/stocks"; 

mongoose.connect(uri)
  .then(() => console.log('MongoDB database connection established successfully'))
  .catch(err => console.error('Error connecting to MongoDB database:', err));




