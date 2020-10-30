import { ApolloServer, gql, PubSub } from "apollo-server";

const start = async () => {
  const pubsub = new PubSub();
  const typeDefs = gql`
    type Book {
      title: String
      author: String
    }
    type Query {
      books: [Book]
    }
    type Mutation {
      addBook(title: String, author: String): Book
    }
    type Subscription {
      bookAdded: Book
    }
  `;
  const books = [
    {
      title: "The Awakening",
      author: "Kate Chopin",
    },
    {
      title: "City of Glass",
      author: "Paul Auster",
    },
  ];
  const BOOK_ADDED = "BOOK_ADDED";
  const resolvers = {
    Query: {
      books: () => books,
    },
    Mutation: {
      addBook: (root, args, ctx) => {
        books.push(args);
        pubsub.publish(BOOK_ADDED, { bookAdded: args });
        return args;
      },
    },
    Subscription: {
      bookAdded: {
        subscribe: () => {
          console.log("subscribe");
          return pubsub.asyncIterator([BOOK_ADDED]);
        },
      },
    },
  };
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    debug: true,
    context: ({ req, connection }) => {
      if (connection) {
        return connection.context;
      } else {
        return req.headers;
      }
    },
    subscriptions: {
      onConnect: (connectionParams, webSocket) => {
        console.log("connectionParams");
        console.dir(connectionParams);
        return connectionParams;
      },
      onDisconnect: (webSocket, context) => {
        console.log("WS disconnect");
      },
    },
  });
  server.listen({ port: 4000 }).then(({ url, subscriptionsUrl }) => {
    console.log(`🚀 Server ready at ${url}`);
    console.log(`🚀 Subscriptions ready at ${subscriptionsUrl}`);
  });
};

start().catch((reason) => {
  console.error(reason);
});
