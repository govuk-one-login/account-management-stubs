import assert from "node:assert/strict";

export const validateFields = (
  fields: Record<string, string | number | undefined>,
  checks: Record<string, RegExp>
) => {
  Object.entries(fields).forEach(([key, value]) => {
    assert(value, `no ${key} provided`);
    if (checks[key]) {
      if (typeof value === "string") {
        assert.match(value, checks[key], `invalid ${key}`);
      } else {
        assert.match(String(value), checks[key], `invalid ${key}`);
      }
    }
  });
};

export const validateBearerToken = (authHeader: string | undefined): void => {
  assert(
    authHeader && /^Bearer \S+$/.test(authHeader),
    "Authorization header must be in format 'Bearer token'"
  );
};
