import { makeExecutableSchema } from "@graphql-tools/schema";
import { stitchSchemas } from "@graphql-tools/stitch";
import * as gql from "graphql";

let schema1 = makeExecutableSchema({
  typeDefs: `
    type Query {
      schema1Boolean: Boolean
      schema1Query: Query
    }
  `,
  resolvers: {
    Query: {
      schema1Boolean: () => {
        return true;
      },
      schema1Query: () => {
        return {};
      },
    },
  },
});

let schema2 = makeExecutableSchema({
  typeDefs: `
    type Query {
      schema2Boolean: Boolean
      schema2Query: Query
    }
  `,
  resolvers: {
    Query: {
      schema2Boolean: () => {
        return true;
      },
      schema2Query: () => {
        return {};
      },
    },
  },
});

const schema = stitchSchemas({
  subschemas: [schema1, schema2],
});

const execute = async (query: string) => {
  const document = gql.parse(query);
  const result = await gql.execute({ schema, document });
  console.log(JSON.stringify(result, null, 2));
};

const test = async () => {
  console.log("\nCorrect:");
  await execute(`
  query {
    schema1Boolean
  }`);

  console.log("\nCorrect:");
  await execute(`
  query {
    schema2Boolean
  }`);

  console.log("\nCorrect:");
  await execute(`
  query {
    schema1Query {
      schema1Boolean
      schema1Query {
        schema1Boolean
      }
    }
    schema2Query {
      schema2Boolean
      schema2Query {
        schema2Boolean
      }
    }
  }`);

  console.log("\nIncorrect:");
  console.log("(missing nested fields from other schema)");
  await execute(`
  query {
    schema1Query {
      schema1Boolean
      schema2Query {
        schema1Boolean
      }
    }
    schema2Query {
      schema2Boolean
      schema1Query {
        schema2Boolean
      }
    }
  }`);

  console.log("\nCorrect:");
  console.log("(including field from initial schema 'fixes' bug)");
  await execute(`
  query {
    schema1Query {
      schema1Boolean
      schema2Query {
        schema1Boolean
        schema2Boolean
      }
    }
    schema2Query {
      schema2Boolean
      schema1Query {
        schema1Boolean
        schema2Boolean
      }
    }
  }`);
};

test();
