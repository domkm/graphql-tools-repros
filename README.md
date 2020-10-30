# TypeError: iterator.next is not a function

### Run the service:

```
yarn service
```

GraphQL Playground will be available at http://localhost:4000/graphql. Queries, mutations, and subscriptions work correctly.

### Run the gateway:

```
yarn gateway
```

GraphQL Playground will be available at http://localhost:4001/graphql. Queries and mutations work correctly. Subscriptions cause `iterator.next is not a function` error.
