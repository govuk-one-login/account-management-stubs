import { handler, validateRedirectUri } from "../../oidc/logout";
import { APIGatewayProxyEvent } from "aws-lambda";

describe(validateRedirectUri, () => {
  test("throws an error when an invalid URI is passed in", () => {
    expect(() => {
      validateRedirectUri("Not a URL");
    }).toThrow();
  });

  test("throws an error when process.env.POST_LOGOUT_REDIRECT_URIS is undefined", () => {
    expect(() => {
      validateRedirectUri("https://example.com/logout");
    }).toThrow();
  });

  test("throws an error when process.env.POST_LOGOUT_REDIRECT_URIS is not an array", () => {
    expect(() => {
      process.env.POST_LOGOUT_REDIRECT_URIS = JSON.stringify("Not an array");
      validateRedirectUri("https://example.com/logout");
    }).toThrow();
  });

  test("throws an error when process.env.POST_LOGOUT_REDIRECT_URIS is an empty array", () => {
    expect(() => {
      process.env.POST_LOGOUT_REDIRECT_URIS = JSON.stringify([]);
      validateRedirectUri("https://example.com/logout");
    }).toThrow();
  });

  test("throws an error when process.env.POST_LOGOUT_REDIRECT_URIS contains invalid URIs", () => {
    expect(() => {
      process.env.POST_LOGOUT_REDIRECT_URIS = JSON.stringify([
        "https://example.com/logout",
        "Not a URL",
      ]);
      validateRedirectUri("https://example.com/logout");
    }).toThrow();
  });

  test("throws an error when the passed in URI does not match any of the POST_LOGOUT_REDIRECT_URIS", () => {
    expect(() => {
      process.env.POST_LOGOUT_REDIRECT_URIS = JSON.stringify([
        "https://example1.com/logout",
        "https://example.com/login",
        "http://example.com/logout",
      ]);
      validateRedirectUri("https://example.com/logout");
    }).toThrow();
  });

  test("doesn't throw an error when the passed in URI does match some of the POST_LOGOUT_REDIRECT_URIS", () => {
    expect(() => {
      process.env.POST_LOGOUT_REDIRECT_URIS = JSON.stringify([
        "https://example1.com/logout",
        "https://example.com/login",
        "https://example.com/logout",
      ]);
      validateRedirectUri("https://example.com/logout");
    }).not.toThrow();
  });
});

describe(handler, () => {
  beforeAll(() => {
    process.env.ENVIRONMENT = "test";
    process.env.POST_LOGOUT_REDIRECT_URIS = JSON.stringify([
      "https://home.dev.account.gov.uk/logout",
      "https://home.dev.account.gov.uk/alternative-logout",
    ]);
  });

  afterAll(() => {
    delete process.env.ENVIRONMENT;
    delete process.env.POST_LOGOUT_REDIRECT_URIS;
  });

  test("returns the default redirect URI when post_logout_redirect_uri is not a valid URI", async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {
        post_logout_redirect_uri: "Not a URI",
        id_token_hint: "123456789",
      },
    };
    const response = await handler(event as APIGatewayProxyEvent);
    expect(response.statusCode).toBe(302);
    expect(response.headers.Location).toBe(
      "https://signin.test.account.gov.uk/signed-out"
    );
  });

  test("returns the default redirect URI when id_token_hint is not sent", async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {
        post_logout_redirect_uri:
          "https://home.dev.account.gov.uk/alternative-logout",
      },
    };
    const response = await handler(event as APIGatewayProxyEvent);
    expect(response.statusCode).toBe(302);
    expect(response.headers.Location).toBe(
      "https://signin.test.account.gov.uk/signed-out"
    );
  });

  test("returns the default redirect URI when post_logout_redirect_uri does not match the post logout URIs configured for the RP", async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {
        post_logout_redirect_uri:
          "https://home.dev.account.gov.uk/unknown-logout",
        id_token_hint: "123456789",
      },
    };
    const response = await handler(event as APIGatewayProxyEvent);
    expect(response.statusCode).toBe(302);
    expect(response.headers.Location).toBe(
      "https://signin.test.account.gov.uk/signed-out"
    );
  });

  test("returns the sent redirect URI", async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {
        post_logout_redirect_uri:
          "https://home.dev.account.gov.uk/alternative-logout",
        id_token_hint: "123456789",
      },
    };
    const response = await handler(event as APIGatewayProxyEvent);
    expect(response.statusCode).toBe(302);
    expect(response.headers.Location).toBe(
      "https://home.dev.account.gov.uk/alternative-logout"
    );
  });

  test("returns the sent redirect URI with state added to the query string", async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {
        post_logout_redirect_uri:
          "https://home.dev.account.gov.uk/alternative-logout",
        id_token_hint: "123456789",
        state: "fake_state",
      },
    };
    const response = await handler(event as APIGatewayProxyEvent);
    expect(response.statusCode).toBe(302);
    expect(response.headers.Location).toBe(
      "https://home.dev.account.gov.uk/alternative-logout?state=fake_state"
    );
  });
});
