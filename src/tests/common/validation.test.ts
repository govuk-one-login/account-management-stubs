import { validateFields } from "../../common/validation";

describe("validateFields Function", () => {
  it("should validate required fields successfully", () => {
    const fields = {
      firstName: "John",
      lastName: "Doe",
    };
    const checks = {
      firstName: /^[a-zA-Z]+$/,
      lastName: /^[a-zA-Z]+$/,
    };
    expect(() => validateFields(fields, checks)).not.toThrow(Error);
  });

  it("should throw an error when a required field is missing", () => {
    const fields = { firstName: undefined };
    const checks = {
      firstName: /^[a-zA-Z]+$/,
      lastName: /^[a-zA-Z]+$/,
    };
    expect(() => validateFields(fields, checks)).toThrow(
      /no firstName provided/
    );
  });

  it("should throw an error when provided field does not match the regular expression", () => {
    const fields = {
      firstName: "John1",
      lastName: "Doe",
    };
    const checks = {
      firstName: /^[a-zA-Z]+$/,
      lastName: /^[a-zA-Z]+$/,
    };
    expect(() => validateFields(fields, checks)).toThrow(/invalid firstName/);
  });

  it("should validate numeric fields when converted to string and match the regular expression", () => {
    const fields = {
      mfaIdentifier: 2,
    };
    const checks = {
      mfaIdentifier: /^[0-9]+$/,
    };
    expect(() => validateFields(fields, checks)).not.toThrow(Error);
  });

  it("should throw an error when numeric field does not match the regular expression", () => {
    const fields = {
      mfaIdentifier: 2.5,
    };
    const checks = {
      mfaIdentifier: /^[0-9]+$/,
    };
    expect(() => validateFields(fields, checks)).toThrow(
      /invalid mfaIdentifier/
    );
  });
});
