import assert from "node:assert/strict";

export const validateFields = (
  fields: { [key: string]: string | undefined },
  checks: { [key: string]: RegExp }
) => {
  Object.entries(fields).forEach(([key, value]) => {
    assert(value, `no ${key} provided`);
    if (checks[key]) {
      assert.match(value, checks[key], `invalid ${key}`);
    }
  });
};
