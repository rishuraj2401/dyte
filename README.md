About The Project

[Query Ingestor and Query Interface ]

The Log Management System is designed to streamline the ingestion, storage, and retrieval of logs from diverse sources. It features a hybrid database approach, utilizing both MongoDB and MySQL, to cater to different data storage needs. The system leverages RabbitMQ as a message queue for asynchronous log ingestion, ensuring scalability and resilience. Logs are ingested into the system by sending HTTP POST requests to the /ingest endpoint with log data in the request body. This data is then efficiently stored in both MongoDB and MySQL databases simultaneously, offering flexibility and optimization based on specific use cases. The centralized platform supports full-text search across MongoDB and MySQL collections, allowing users to query logs based on various parameters such as level, message, resourceId, timestamp, traceId, spanId, commit, and even JSON-formatted metadata. The project's hybrid database architecture, coupled with RabbitMQ for asynchronous processing, enhances the system's overall performance, scalability, and adaptability to diverse logging requirements.

(back to top)
Built With

    [React.js][https://reactjs.org/]
    [Express.js][https://expressjs.com/]
    [Node.js][https://nodejs.org/]
    [Mongodb][https://www.mongodb.com/]
    [MySQL][https://www.mysql.com/]
    [RabbitMQ][https://www.rabbitmq.com/]

(back to top)
Getting Started

Clone the Repository:

git clone https://github.com/rishuraj2401/dyte.git

### Prerequisites

Before getting started, ensure you have the following installed:

- Node.js
- MongoDB
- MySQL
- RabbitMQ
* npm
```sh
npm install npm@latest -g

Installation

1.   cd your_folder
2.   npm install
3.   cd client
4.   npm install
5. Enter your password in .env folder`
const mongoPassword = ENTER YOUR MONGODB CLUSTUR PASSWORD;
const sqlPassword= ENTER YOUR MYSQL PASSWORD


RUN

In root directory run : npm start 
cd client  $env:PORT=4004
            npm start
(Due to react default port is 3000 but PORT=3000 I am using for backend so changing the react PORT to 4004)            
