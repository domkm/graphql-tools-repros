Run `yarn dev`. It will output the following:

```
Correct:
{
  "data": {
    "schema1Boolean": true
  }
}

Correct:
{
  "data": {
    "schema2Boolean": true
  }
}

Correct:
{
  "data": {
    "schema1Query": {
      "schema1Boolean": true,
      "schema1Query": {
        "schema1Boolean": true
      }
    },
    "schema2Query": {
      "schema2Boolean": true,
      "schema2Query": {
        "schema2Boolean": true
      }
    }
  }
}

Incorrect:
(missing nested fields from other schema)
{
  "data": {
    "schema1Query": {
      "schema1Boolean": true,
      "schema2Query": null
    },
    "schema2Query": {
      "schema2Boolean": true,
      "schema1Query": null
    }
  }
}

Correct:
(including field from initial schema 'fixes' bug)
{
  "data": {
    "schema1Query": {
      "schema1Boolean": true,
      "schema2Query": {
        "schema1Boolean": true,
        "schema2Boolean": true
      }
    },
    "schema2Query": {
      "schema2Boolean": true,
      "schema1Query": {
        "schema1Boolean": true,
        "schema2Boolean": true
      }
    }
  }
}
```
