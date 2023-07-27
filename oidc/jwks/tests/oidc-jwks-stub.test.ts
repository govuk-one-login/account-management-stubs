import { KMSClient, GetPublicKeyCommand } from "@aws-sdk/client-kms";
import { mockClient } from "aws-sdk-client-mock";
import "aws-sdk-client-mock-jest";
import { Response, handler } from "../oidc-jwks-stub";

const kmsMock = mockClient(KMSClient);

const SIGNING_KEY_ID = "B-QMUxdJOJ8ubkmArc4i1SGmfZnNNlM-va9h0HJ0jCo";

describe("handler", () => {
  beforeEach(() => {
    kmsMock.reset();
    process.env.SIGNING_KEY_ID = SIGNING_KEY_ID;
    kmsMock.on(GetPublicKeyCommand).resolves({
      EncryptionAlgorithms: ["ES256"],
      KeyId: SIGNING_KEY_ID,
      KeySpec: "ECC_NIST_P256",
      KeyUsage: "SIGN_VERIFY",
      PublicKey: Buffer.from("public-key"),
      SigningAlgorithms: ["string"],
    });
  });

  test("returns jwks data", async () => {
    const result: Response = await handler();
    expect(result.statusCode).toEqual(200);
    expect(result.body).toContain(`"kid":"${SIGNING_KEY_ID}"`);
  });
});
