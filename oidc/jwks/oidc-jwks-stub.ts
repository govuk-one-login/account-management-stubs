import { KMSClient, GetPublicKeyCommand } from "@aws-sdk/client-kms";

export interface Response {
  statusCode: number;
  body: string;
}

interface JksKey {
  kty: string;
  use: string;
  crv: string;
  kid: string;
  x: string;
  y: string;
  alg: string;
}

const publicKey = async (keyId: string): Promise<JksKey> => {
  const getPublicKeyCommand = new GetPublicKeyCommand({
    KeyId: keyId,
  });
  const kmsClient = new KMSClient({});
  const kmsResponse = await kmsClient.send(getPublicKeyCommand);
  if (!kmsResponse.KeyId || !kmsResponse.SigningAlgorithms) {
    throw new Error(`Failed to get KMS Key with KeyId: ${keyId}`);
  }
  return {
    kty: "EC",
    use: "sig",
    crv: "P-256",
    kid: keyId,
    x: "unsure",
    y: "unsure",
    alg: kmsResponse.SigningAlgorithms[0],
  };
};

export const handler = async () => {
  const { SIGNING_KEY_ID } = process.env;

  if (typeof SIGNING_KEY_ID === "undefined") {
    throw new Error(`environemnt variable SIGNING_KEY_ID is null`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(await publicKey(SIGNING_KEY_ID)),
  };
};
