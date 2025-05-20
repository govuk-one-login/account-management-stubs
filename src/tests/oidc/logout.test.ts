import {
  handler,
  validateRedirectUri,
  validateReferrerAndOrigin,
  validateHostname,
} from "../../oidc/logout";
import { APIGatewayProxyEvent } from "aws-lambda";

const VALID_REDIRECT_OR_HEADER_URI = "https://home.dev.account.gov.uk/logout";
const EXPECTED_INFERRED_REDIRECT_URI =
  "https://signin.test.account.gov.uk/signed-out";

describe(validateRedirectUri, () => {
  test("throws an error with a malformed URI", () => {
    expect(() => {
      validateRedirectUri("Not a URL");
    }).toThrow();
  });

  test("throws an error when the domain is not allowed", () => {
    expect(() => {
      validateRedirectUri("https://example.com/logout");
    }).toThrow();
  });

  test("throws an error when domain is valid but not HTTPS", () => {
    expect(() => {
      validateRedirectUri("http://home.dev.account.gov.uk/logout");
    }).toThrow();
  });

  test("doesn't throw an error when redirecting to localhost on HTTP", () => {
    expect(() => {
      validateRedirectUri("http://localhost/logout");
    }).not.toThrow();
  });

  test("doesn't throw an error when redirecting to a valid domain on https", () => {
    expect(() => {
      validateRedirectUri(VALID_REDIRECT_OR_HEADER_URI);
    }).not.toThrow();
  });
});

describe(validateReferrerAndOrigin, () => {
  test("throws an error if either parameter is malformed", () => {
    expect(() => {
      validateReferrerAndOrigin("Not a URL", VALID_REDIRECT_OR_HEADER_URI);
    }).toThrow();

    expect(() => {
      validateReferrerAndOrigin(VALID_REDIRECT_OR_HEADER_URI, "Not a URL");
    }).toThrow();
  });

  test("throws an error if either URI isn't on the allow list", () => {
    expect(() => {
      validateReferrerAndOrigin(
        "http://example.com",
        VALID_REDIRECT_OR_HEADER_URI
      );
    }).toThrow();

    expect(() => {
      validateReferrerAndOrigin(
        VALID_REDIRECT_OR_HEADER_URI,
        "http://example.com"
      );
    }).toThrow();
  });

  test("throws an error if both parameters are undefined", () => {
    expect(() => {
      validateReferrerAndOrigin(undefined, undefined);
    }).toThrow();
  });

  test("throws an error when the domains don't match", () => {
    expect(() => {
      validateReferrerAndOrigin(
        VALID_REDIRECT_OR_HEADER_URI,
        "https://home.build.account.gov.uk/logout"
      );
    }).toThrow();
  });

  test("doesn't throw an error when only a valid referrer is passed ", () => {
    expect(() => {
      validateReferrerAndOrigin(VALID_REDIRECT_OR_HEADER_URI, undefined);
    }).not.toThrow();
  });

  test("doesn't throw an error when only a valid origin is passed ", () => {
    expect(() => {
      validateReferrerAndOrigin(undefined, VALID_REDIRECT_OR_HEADER_URI);
    }).not.toThrow();
  });

  test("doesn't throw an error when both valid referrer and origin is passed ", () => {
    expect(() => {
      validateReferrerAndOrigin(
        VALID_REDIRECT_OR_HEADER_URI,
        VALID_REDIRECT_OR_HEADER_URI
      );
    }).not.toThrow();
  });
});

describe(validateHostname, () => {
  test("doesn't throw an error with localhost", () => {
    expect(() => {
      validateHostname("localhost");
    }).not.toThrow();
  });

  test("doesn't throw an error with our dev domain", () => {
    expect(() => {
      validateHostname("home.dev.account.gov.uk");
    }).not.toThrow();
  });

  test("doesn't throw an error with Auths dev domain", () => {
    expect(() => {
      validateHostname("signin.dev.account.gov.uk");
    }).not.toThrow();
  });

  test("throws an error when the hostname is not allowed", () => {
    expect(() => {
      validateHostname("example.com");
    }).toThrow();
  });

  test("throws an error when the hostname is another GOV.UK domain", () => {
    expect(() => {
      validateHostname("www.gov.uk");
    }).toThrow();
  });

  test("throws an error when the hostname is the root account.gov.uk", () => {
    expect(() => {
      validateHostname("account.gov.uk");
    }).toThrow();
  });

  test("throws an error when the hostname only contains localhost", () => {
    expect(() => {
      validateHostname("localhost.example.com");
    }).toThrow();
  });
});

describe(handler, () => {
  beforeAll(() => {
    process.env.ENVIRONMENT = "test";
  });

  afterAll(() => {
    delete process.env.ENVIRONMENT;
  });
  test("returns a redirect response from a valid request with a referrer header", async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {
        post_logout_redirect_uri: VALID_REDIRECT_OR_HEADER_URI,
        id_token_hint: "id-token",
      },
      headers: {
        Referer: VALID_REDIRECT_OR_HEADER_URI,
      },
    };
    const response = await handler(event as APIGatewayProxyEvent);
    expect(response.statusCode).toBe(302);
    expect(response.headers.Location).toBe(VALID_REDIRECT_OR_HEADER_URI);
  });

  test("returns a redirect response from a valid request with an origin header", async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {
        post_logout_redirect_uri: VALID_REDIRECT_OR_HEADER_URI,
        id_token_hint: "id-token",
      },
      headers: {
        Origin: VALID_REDIRECT_OR_HEADER_URI,
      },
    };
    const response = await handler(event as APIGatewayProxyEvent);
    expect(response.statusCode).toBe(302);
    expect(response.headers.Location).toBe(VALID_REDIRECT_OR_HEADER_URI);
  });

  test("returns a redirect response when neither redirect URI nor ID token are passed", async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      headers: {
        Origin: VALID_REDIRECT_OR_HEADER_URI,
      },
    };
    const response = await handler(event as APIGatewayProxyEvent);
    expect(response.statusCode).toBe(302);
    expect(response.headers.Location).toBe(EXPECTED_INFERRED_REDIRECT_URI);
  });

  test("appends the state parameter to the redirect URL if provided", async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {
        state: "stateValue",
      },
      headers: {
        Origin: VALID_REDIRECT_OR_HEADER_URI,
      },
    };
    const response = await handler(event as APIGatewayProxyEvent);
    expect(response.statusCode).toBe(302);
    expect(response.headers.Location).toBe(
      `${EXPECTED_INFERRED_REDIRECT_URI}?state=stateValue`
    );
  });

  test("throws an error when redirect URI is passed but not ID token", async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {
        post_logout_redirect_uri: VALID_REDIRECT_OR_HEADER_URI,
      },
      headers: {
        Referer: VALID_REDIRECT_OR_HEADER_URI,
      },
    };
    expect(handler(event as APIGatewayProxyEvent)).rejects.toThrow();
  });

  test("throws an error when ID token is passed but not redirect URI", async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {
        id_token_hint: "id-token",
      },
      headers: {
        Referer: VALID_REDIRECT_OR_HEADER_URI,
      },
    };
    expect(handler(event as APIGatewayProxyEvent)).rejects.toThrow();
  });

  test("throws an error when redirect URI is not on the allow list", async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {
        post_logout_redirect_uri: "https://example.com/logout",
        id_token_hint: "id-token",
      },
      headers: {
        Referer: VALID_REDIRECT_OR_HEADER_URI,
      },
    };
    expect(handler(event as APIGatewayProxyEvent)).rejects.toThrow();
  });

  test("throws an error when referrer and origin headers are missing", async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {
        post_logout_redirect_uri: VALID_REDIRECT_OR_HEADER_URI,
        id_token_hint: "id-token",
      },
    };
    expect(handler(event as APIGatewayProxyEvent)).rejects.toThrow();
  });

  test("throws an error when referrer is not on the allow list", async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {
        post_logout_redirect_uri: VALID_REDIRECT_OR_HEADER_URI,
        id_token_hint: "id-token",
      },
      headers: {
        Referer: "https://example.com/logout",
      },
    };
    expect(handler(event as APIGatewayProxyEvent)).rejects.toThrow();
  });

  test("throws an error when origin is not on the allow list", async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {
        post_logout_redirect_uri: VALID_REDIRECT_OR_HEADER_URI,
        id_token_hint: "id-token",
      },
      headers: {
        Origin: "https://example.com/logout",
      },
    };
    expect(handler(event as APIGatewayProxyEvent)).rejects.toThrow();
  });

  test("throws an error when referrer and redirect domains don't match", async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {
        post_logout_redirect_uri: VALID_REDIRECT_OR_HEADER_URI,
        id_token_hint: "id-token",
      },
      headers: {
        Referer: "http://localhost/logout",
      },
    };
    expect(handler(event as APIGatewayProxyEvent)).rejects.toThrow();
  });

  test("throws an error when origin and redirect domains don't match", async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {
        post_logout_redirect_uri: VALID_REDIRECT_OR_HEADER_URI,
        id_token_hint: "id-token",
      },
      headers: {
        Origin: "http://localhost/logout",
      },
    };
    expect(handler(event as APIGatewayProxyEvent)).rejects.toThrow();
  });
});
