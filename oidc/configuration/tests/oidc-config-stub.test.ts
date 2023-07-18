import { handler, Response } from "../oidc-config-stub";

describe("handler", () => {
  beforeEach(() => {
    process.env.ENVIRONMENT = "dev";
  });

  test("returns configuration file with environment variables replaced ", async () => {
    const result: Response = await handler();
    expect(result.statusCode).toEqual(200);
    expect(result.body).toContain(
      '"authorization_endpoint":"https://oidc-stub.home.dev.account.gov.uk/authorize"'
    );
  });
});
