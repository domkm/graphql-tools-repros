import { fetch } from "cross-fetch";
import { print } from "graphql";
import { ApolloServer } from "apollo-server";
import { introspectSchema, wrapSchema } from "@graphql-tools/wrap";
import { AsyncExecutor, Subscriber } from "@graphql-tools/delegate";
import {
  observableToAsyncIterable,
  ExecutionResult,
} from "@graphql-tools/utils";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { omitBy } from "lodash";
import { w3cwebsocket } from "websocket";

const start = async () => {
  const graphqlEndpointHttp = "http://localhost:4000/graphql";
  const graphqlEndpointWs = (() => {
    const url = new URL(graphqlEndpointHttp);
    url.protocol = url.protocol === "http:" ? "ws:" : "wss:";
    return url.toString();
  })();
  const executor = async ({ document, variables, context }) => {
    const headers = omitBy(context, (_, k) => {
      return k === "host" || k === "_extensionStack";
    });
    headers["content-type"] = "application/json";
    const query = print(document);
    const fetchResult = await fetch(graphqlEndpointHttp, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
    });
    return fetchResult.json();
  };
  const subscriptionClient = new SubscriptionClient(
    graphqlEndpointWs,
    {
      connectionCallback: (e) => {
        console.error(e);
      },
    },
    w3cwebsocket
  );
  subscriptionClient.onError((e) => {
    console.error(e);
  });
  const subscriber: Subscriber = async <TReturn, TArgs>({
    document,
    variables,
    context,
  }) => {
    return observableToAsyncIterable(
      subscriptionClient.request({
        query: document,
        variables,
        context,
      })
    ) as AsyncIterableIterator<ExecutionResult<TReturn>>;
  };
  const schema = wrapSchema({
    schema: await introspectSchema(executor),
    executor,
    subscriber,
  });
  const server = new ApolloServer({
    schema,
    debug: true,
    cors: true,
    context: ({ req, connection }) => {
      if (connection) {
        return connection.context;
      } else {
        return req.headers;
      }
    },
    subscriptions: {
      onConnect: (connectionParams, webSocket) => {
        return connectionParams;
      },
      onDisconnect: (webSocket, context) => {
        console.log("WS disconnect");
      },
    },
  });
  server.listen({ port: 4001 }).then(({ url, subscriptionsUrl }) => {
    console.log(`🚀 Server ready at ${url}`);
    console.log(`🚀 Subscriptions ready at ${subscriptionsUrl}`);
  });
};

start().catch((reason) => {
  console.error(reason);
});
