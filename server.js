// backend-repo/server.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Use environment variables for MongoDB connection
const mongoDbUrl = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'efiling';
const collectionName = process.env.COLLECTION_NAME || 'todo_app';

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB using environment variables
mongoose.connect(mongoDbUrl, { useNewUrlParser: true, useUnifiedTopology: true });

// Define Todo schema and model with dynamic collection name
const todoSchema = new mongoose.Schema({
  task: String,
  completed: Boolean,
}, { collection: collectionName });

const Todo = mongoose.model('Todo', todoSchema);

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Server health check passed!');
});

// API endpoint to get all todos
app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find();

    // Set cache headers to control caching behavior
    res.setHeader('Cache-Control', 'public, max-age=300'); // Example: Cache for 5 minutes

    res.json(todos);
  } catch (error) {
    console.error('Error in GET /api/todos:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to add a new todo
app.post('/api/todos', async (req, res) => {
  const { task, completed } = req.body;

  try {
    const newTodo = new Todo({ task, completed });
    const savedTodo = await newTodo.save();
    res.json(savedTodo);
  } catch (error) {
    console.error('Error in POST /api/todos:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
