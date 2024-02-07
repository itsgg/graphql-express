import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';

import express from 'express';
import http from 'http';
import cors from 'cors';

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
    updateMessage: (_, { message }) => {
      console.log('message', message);
      currentMessage = message;
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

await server.start();

app.use('/graphql', cors(), express.json(), expressMiddleware(server));

await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
