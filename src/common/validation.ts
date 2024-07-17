import assert from "node:assert/strict";

export const validateFields = (
  fields: { [key: string]: string | number | undefined },
  checks: { [key: string]: RegExp }
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
