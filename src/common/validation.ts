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

export const validateSameHostname = (firstUri: string, secondUri: string) => {
  const first = new URL(firstUri);
  const second = new URL(secondUri);

  if (first.hostname != second.hostname) {
    throw new Error(
      `Hostnames ${first.hostname} and ${second.hostname} do not match`
    );
  }
};
