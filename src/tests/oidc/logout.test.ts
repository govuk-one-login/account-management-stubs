import {
  handler,
  validateRedirectUri,
  validateReferrer,
} from "../../oidc/logout";
import { APIGatewayProxyEvent } from "aws-lambda";

const VALID_REDIRECT_URI = "https://home.dev.account.gov.uk/logout";

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
      validateRedirectUri(VALID_REDIRECT_URI);
    }).not.toThrow();
  });
});

describe(validateReferrer, () => {
  test("throws an error with a malformed URI", () => {
    expect(() => {
      validateReferrer("Not a URL");
    }).toThrow();
  });

  test("throws an error when the domain is not allowed", () => {
    expect(() => {
      validateReferrer("https://example.com/logout");
    }).toThrow();
  });

  test("doesn't throw an error when referrer is localhost", () => {
    expect(() => {
      validateReferrer("http://localhost/logout");
    }).not.toThrow();
  });

  test("doesn't throw an error when redirecting to a valid domain on https", () => {
    expect(() => {
      validateReferrer(VALID_REDIRECT_URI);
    }).not.toThrow();
  });
});

describe(handler, () => {
  test("returns a redirect response from a valid request", async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {
        post_logout_redirect_uri: VALID_REDIRECT_URI,
        id_token_hint: "id-token",
      },
      headers: {
        Referer: VALID_REDIRECT_URI,
      },
    };
    const response = await handler(event as APIGatewayProxyEvent);
    expect(response.statusCode).toBe(302);
    expect(response.headers.Location).toBe(VALID_REDIRECT_URI);
  });

  test("throws an error when ID token is missing", async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {
        post_logout_redirect_uri: VALID_REDIRECT_URI,
      },
      headers: {
        Referer: VALID_REDIRECT_URI,
      },
    };
    expect(handler(event as APIGatewayProxyEvent)).rejects.toThrow();
  });

  test("throws an error when redirect URI is missing", async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {
        id_token_hint: "id-token",
      },
      headers: {
        Referer: VALID_REDIRECT_URI,
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
        Referer: VALID_REDIRECT_URI,
      },
    };
    expect(handler(event as APIGatewayProxyEvent)).rejects.toThrow();
  });

  test("throws an error when referrer header is missing", async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {
        post_logout_redirect_uri: VALID_REDIRECT_URI,
        id_token_hint: "id-token",
      },
    };
    expect(handler(event as APIGatewayProxyEvent)).rejects.toThrow();
  });

  test("throws an error when referrer is not on the allow list", async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {
        post_logout_redirect_uri: VALID_REDIRECT_URI,
        id_token_hint: "id-token",
      },
      headers: {
        Referer: "https://example.com/logout",
      },
    };
    expect(handler(event as APIGatewayProxyEvent)).rejects.toThrow();
  });

  test("throws an error when referrer and redirect domains don't match", async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {
        post_logout_redirect_uri: VALID_REDIRECT_URI,
        id_token_hint: "id-token",
      },
      headers: {
        Referer: "http://localhost/logout",
      },
    };
    expect(handler(event as APIGatewayProxyEvent)).rejects.toThrow();
  });
});
