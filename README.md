# Account Management Stubs

Repository to store stubs for services that GOV.UK One Login Account Management integrates with

## Requirements

### Pre-commit

This repository uses [pre-commit](https://pre-commit.com/) to run linting on all staged files before they're committed.
Install & setup pre-commit by running:

```bash
pip install pre-commit
pre-commit install
```

## Method Management API

The `method-management` module has a folder of models that are generated from the OpenAPI spec using `openapi-typescript`

```shell
npm install -g openapi-typescript
openapi-typescript ../../../openapi-specs/auth/method-management-api.yaml --output models/schema.d.ts
```
