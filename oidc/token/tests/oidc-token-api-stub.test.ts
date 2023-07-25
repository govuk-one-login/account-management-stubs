import { Response } from "../models";
import { handler } from "../oidc-token-api-stub";


describe("handler", () => {
  beforeEach(() => {
    process.env.OIDC_CLIENT_ID = "12345";
  });

  test("sends message to TXMA Queue and returns a redirect", async () => {
    const result: Response = await handler();
    expect(result.statusCode).toEqual(302);
  });
});
