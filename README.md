# Account Management Stubs

Repository to store stubs for services that GOV.UK One Login Account Management integrates with

## Method Management API

The `method-management` module has a folder of models that are generated from the OpenAPI spec using `openapi-typescript`

```shell
npm install -g openapi-typescript
openapi-typescript ../../../openapi-specs/auth/method-management-api.yaml --output models/schema.d.ts
```

