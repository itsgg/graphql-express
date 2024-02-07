const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { Sequelize, DataTypes } = require('sequelize');
const express = require('express');
const http = require('http');
const cors = require('cors');
const sequelize = new Sequelize('postgresql://gg@127.0.0.1/todos');

const Task = require('./models/task')(sequelize, DataTypes);

async function init() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

console.log(Task);


init().then(() => {
  console.log('init');

  start();
});
const app = express();
const httpServer = http.createServer(app);

var currentMessage = 'Hello from the backend';

const typeDefs = `#gql
  type Query {
    hello: String
  }
  type Message {
    message: String
  }  
  type Mutation {
    updateMessage(message: String!): Message!
  }
`;

const resolvers = {
  Query: {
    hello: () => currentMessage,
  },
  Mutation: {
    updateMessage: async (_, { message }) => {
      console.log('message', message);
      currentMessage = message;
      await sequelize.sync({ force: true });
      const task = new Task({ title: message });
      await task.save();
      return {
        message: currentMessage,
      };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

async function start() {
  await server.start();
  httpServer.listen(4000, () => {
    console.log('Server is running on port 4000');
  });

  app.use('/graphql', cors(), express.json(), expressMiddleware(server));
}
