import { KMSClient, SignCommand } from "@aws-sdk/client-kms";
import { mockClient } from "aws-sdk-client-mock";
import "aws-sdk-client-mock-jest";
import { Response, handler } from "../oidc-token-api-stub";
import { TokenResponse } from "../models";

const kmsMock = mockClient(KMSClient);

const OIDC_CLIENT_ID = "12345";
const SIGNING_KEY_ID = "B-QMUxdJOJ8ubkmArc4i1SGmfZnNNlM-va9h0HJ0jCo";
const ENVIRONMENT = "dev";

describe("handler", () => {
  beforeEach(() => {
    kmsMock.reset();
    process.env.OIDC_CLIENT_ID = OIDC_CLIENT_ID;
    process.env.SIGNING_KEY_ID = SIGNING_KEY_ID;
    process.env.ENVIRONMENT = ENVIRONMENT;
    kmsMock.on(SignCommand).resolves({
      KeyId: SIGNING_KEY_ID,
      Signature: Buffer.from("signed-blob"),
      SigningAlgorithm: "",
    });
  });

  test("returns 200 OK response including body with access token", async () => {
    const result: Response = await handler();
    const body: TokenResponse = JSON.parse(result.body);
    expect(result.statusCode).toEqual(200);
    expect(body.id_token).toContain(
      "eyJraWQiOiJCLVFNVXhkSk9KOHVia21BcmM0aTFTR21mWm5OTmxNLXZhOWgwSEowakNvIiwiYWxnIjoiRVMyNTYifQ."
    );
    expect(body.id_token).toContain(".c2lnbmVkLWJsb2I");
  });
});
