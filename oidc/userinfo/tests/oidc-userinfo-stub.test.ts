
import { handler, Response } from "../oidc-userinfo-stub";

describe("handler", () => {
  test("returns status code 200", async () => {
    const result: Response = await handler();
    expect(result.statusCode).toEqual(200);
  });
});
