const express = require('express');
const bodyParser = require('body-parser');
const amqp = require('amqplib/callback_api');
const { Op } = require('sequelize');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = 3000;
app.use(cors());
require('dotenv').config();


// MongoDB Connection
const mongoPassword=process.env.mongoPassword;
const sqlPassword=process.env.sqlPassword;
mongoose.connect(`mongodb+srv://rishuraj2401:${mongoPassword}@cluster0.twrql.mongodb.net/logs`, { useNewUrlParser: true, useUnifiedTopology: true });
const LogMongo = mongoose.model('Log', {
  level: String,
  message: String,
  resourceId: String,
  timestamp: Date,
  traceId: String,
  spanId: String,
  commit: String,
  metadata: {
    parentResourceId: String,
  }, 
});

// MySQL Connection using Sequelize
const Sequelize = require('sequelize'); 
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'localhost', // Replace with your MySQL host
  username: 'root', // Replace with your MySQL username
  password: sqlPassword, // Replace with your MySQL password
  database: 'Logs', // Replace with your MySQL database name
});

const LogMySQL = sequelize.define('Log', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  level: Sequelize.STRING,
  message: Sequelize.STRING,
  resourceId: Sequelize.STRING,
  timestamp: Sequelize.DATE,
  traceId: Sequelize.STRING,
  spanId: Sequelize.STRING,
  commit: Sequelize.STRING,
  metadata: {
    type: Sequelize.JSON, // or Sequelize.JSONB if using JSONB data type
    allowNull: true,
  },
});

// Create the 'Logs' table
sequelize.sync()
  .then(() => {
    console.log('MySQL tables synchronized');
  })
  .catch((error) => {
    console.error('Error synchronizing MySQL tables:', error);
  });

// Connect to RabbitMQ
amqp.connect('amqp://localhost', (err, connection) => {
  if (err) {
    throw err;
  }

  connection.createChannel((err, channel) => {
    if (err) {
      throw err;
    }

    const queue = 'logs';

    // Ensure the 'logs' queue exists
    channel.assertQueue(queue, { durable: false });
    console.log('Connected to RabbitMQ');

    // Consume messages from the queue
    channel.consume(queue, (msg) => {
      const logData = JSON.parse(msg.content.toString());
      ingestLog(logData);
    }, { noAck: true });
  });
});

// Middleware for parsing JSON
app.use(bodyParser.json());

// Ingest logs route
app.post('/ingest', (req, res) => {
  const logData = req.body;

  // Send log to RabbitMQ for asynchronous processing
  sendMessageToQueue('logs', JSON.stringify(logData));

  res.json({ message: 'Log ingested successfully' });
});

// Query logs route
app.get(`/query`, async (req, res) => {
  const param=Object.keys(req.query)[0]
  // const param='metadata'
  const x= Object.values(req.query)[0]

  try {
    // Define allowed parameters for search
    const allowedParams = [
      'level',
      'message',
      'resourceId',
      'timestamp',
      'traceId',
      'spanId',
      'commit',
      'parentResourceId',
    ];

    // Check if the provided parameter is allowed
    if (!allowedParams.includes(param)) {
      return res.status(400).json({ error: 'Invalid parameter' });
    }

    // Construct MongoDB query

    const mongoQuery = {
      [param]: { $regex:`${x}`, $options: 'i' },
      // [param]: { $regex: new RegExp(`${x}`, 'i') },
    };

    // MongoDB search
    const mongoResult = await LogMongo.find(mongoQuery).exec();
    // console.log(param);

    // Construct Sequelize query
    const sequelizeQuery = { 
     
      where: {
        [param]: { [Op.like]: `%${x}%` },
      },
    };

    // Sequelize search
    const sequelizeResult = await LogMySQL.findAll(sequelizeQuery);

    const result = [...mongoResult, ...sequelizeResult];
    res.json(result);
  } catch (error) {
    console.error('Error searching logs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Function to ingest log into MySQL and MongoDB
async function ingestLog(logData) {
  try {
    const sanitizedLogData = logData.map((log) => {
      return {
        createdAt: log.createdAt || new Date(), // Provide a default value if undefined
        level: log.level || 'info', // Provide a default value if undefined
        message: log.message || 'No message', // Provide a default value if undefined
        // ... add default values for other properties as needed
      };
    });
    // Ingest log into MongoDB
    await LogMongo.create(logData);

    // Ingest log into MySQL
    await LogMySQL.bulkCreate(logData);

    console.log('Log ingested into MongoDB and MySQL:', logData);
  } catch (error) {
    console.error('Error ingesting log:', error);
  }
} 

// Function to send messages to RabbitMQ queue
function sendMessageToQueue(queueName, message) {
  amqp.connect('amqp://localhost', (err, connection) => {
    if (err) {
      throw err;
    }

    connection.createChannel((err, channel) => {
      if (err) {
        throw err;
      }

      // Ensure the queue exists
      channel.assertQueue(queueName, { durable: false });

      // Send message to the queue
      channel.sendToQueue(queueName, Buffer.from(message));

      console.log(`Message sent to ${queueName}: ${message}`);
    });

    setTimeout(() => {
      connection.close();
    }, 500);
  });
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
