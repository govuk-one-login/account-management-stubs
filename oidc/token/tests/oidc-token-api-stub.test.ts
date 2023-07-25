import { Response, TokenResponse } from "../models";
import { handler } from "../oidc-token-api-stub";


describe("handler", () => {
  beforeEach(() => {
    process.env.OIDC_CLIENT_ID = "12345";
  });

  test("returns 200 OK response including body with access token", async () => {
    const result: Response = await handler();
    const body: TokenResponse = JSON.parse(result.body);
    expect(result.statusCode).toEqual(200);
    expect(body.id_token).toContain("eyJraWQiOiJCLVFNVXhkSk9KOHVia21BcmM0aTFTR21mWm5OTmxNLXZhOWgwSEowakNvIiwiYWxnIjoiRVMyNTYifQ");

  });
});
