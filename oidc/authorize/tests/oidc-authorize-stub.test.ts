import { handler, Response } from "../oidc-authorize-stub";

describe("handler", () => {
  test("returns status code 204", async () => {
    const result: Response = await handler();
    expect(result.statusCode).toEqual(302);
  });
});
