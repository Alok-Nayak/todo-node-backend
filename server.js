// backend-repo/server.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const AWS = require('aws-sdk');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB Atlas using environment variable
mongoose.connect(process.env.MONGODB_ATLAS_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Define Todo schema and model
const todoSchema = new mongoose.Schema({
    task: String,
    completed: Boolean,
});

const Todo = mongoose.model('Todo', todoSchema);

// Configure AWS SDK for SQS using environment variable
const sqs = new AWS.SQS({
    region: process.env.AWS_REGION
});
const queueUrl = process.env.SQS_QUEUE_URL;

// API endpoint to get all todos
app.get('/api/todos', async (req, res) => {
    try {
        const todos = await Todo.find();
        res.json(todos);
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});

// API endpoint to add a new todo
app.post('/api/todos', async (req, res) => {
    const {
        task,
        completed
    } = req.body;

    try {
        const newTodo = new Todo({
            task,
            completed
        });
        const savedTodo = await newTodo.save();

        // Send message to SQS queue
        const sqsParams = {
            MessageBody: JSON.stringify(savedTodo),
            QueueUrl: queueUrl,
        };

        await sqs.sendMessage(sqsParams).promise();

        res.json(savedTodo);
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});