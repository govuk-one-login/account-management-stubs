import { handler, Response } from "../../oidc/userinfo";

describe("handler", () => {
  test("returns status code 200", async () => {
    const mockApiEvent: APIGatewayProxyEvent = {
      body: "client_assertion_type=urn%3Aietf%3Aparams%3Aoauth%3Aclient-assertion-type%3Ajwt-bearer&client_assertion=eyJhbGkpXVCJ9.ey5BPMzRJIn0.RmHvYkaw&grant_type=authorization_code&code=ccca4dec-6799-413c-ab45-896d050006b5&redirect_uri=https%3A%2F%2Fhome.dev.account.gov.uk%2Fauth%2Fcallback",
    } as never;
    const result: Response = await handler(mockApiEvent);
    expect(result.statusCode).toEqual(200);
  });
});
