import { validateFields, validateSameHostname } from "../../common/validation";

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

describe(validateSameHostname, () => {
  test("it throws an error if either URI is malformed", () => {
    expect(() => {
      validateSameHostname("Not a URI", "http://example.com");
    }).toThrow();

    expect(() => {
      validateSameHostname("http://example.com", "Not a URI");
    }).toThrow();
  });

  test("it throws an error if the hostnames don't match", () => {
    expect(() => {
      validateSameHostname("http://not-example.com", "http://example.com");
    }).toThrow();
  });

  test("it doesn't throw an error when the hostnames match", () => {
    expect(() => {
      validateSameHostname("http://example.com", "http://example.com");
    }).not.toThrow();
  });
});
