import { TokenResponse } from "../models";
import { Response, handler } from "../oidc-token-api-stub";

describe("handler", () => {
  beforeEach(() => {
    process.env.OIDC_CLIENT_ID = "12345";
    process.env.ENVIRONMENT = "dev";
    process.env.JWK_KEY_SECRET =
      '{"kty":"EC","d":"Ob4_qMu1nkkBLEw97u--PHVsShP3xOKOJ6z0WsdU0Xw","use":"sig","crv":"P-256","kid":"B-QMUxdJOJ8ubkmArc4i1SGmfZnNNlM-va9h0HJ0jCo","x":"YrTTzbuUwQhWyaj11w33k-K8bFydLfQssVqr8mx6AVE","y":"8UQcw-6Wp0bp8iIIkRw8PW2RSSjmj1I_8euyKEDtWRk","alg":"ES256"}';
  });

  test("returns 200 OK response including body with access token", async () => {
    const result: Response = await handler();
    const body: TokenResponse = JSON.parse(result.body);
    expect(result.statusCode).toEqual(200);
    expect(body.id_token).toContain(
      "eyJraWQiOiJCLVFNVXhkSk9KOHVia21BcmM0aTFTR21mWm5OTmxNLXZhOWgwSEowakNvIiwiYWxnIjoiRVMyNTYifQ."
    );
  });
});
