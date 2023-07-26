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

const publicKey = async (keyId: string): JksKey => {

  const getPublicKeyCommand = new GetPublicKeyCommand({
    KeyId: keyId
  });
  const kmsClient = new KMSClient({});
  const kmsResponse = await kmsClient.send(getPublicKeyCommand);
  if (!kmsResponse.KeyId) {
    throw new Error(`Failed to get KMS Key with KeyId: ${keyId}`);
  }
  const returnableKey: JksKey = {  
    kty: "EC",
    use: "sig",
    crv: "P-256"
    kid: kmsResponse.KeyId,
    x: string;
    y: string;
    alg: kmsResponse.SigningAlgorithms,
  }
}

export const handler = async () => {

  const { SIGNING_KEY_ID } = process.env;

  if (
    typeof keyId === "undefined"
  ) {
    throw new Error(
      `environemnt variable SIGNING_KEY_ID is null`
    );
  }

  const publicKey: JksKey = publicKey(SIGNING_KEY_ID);


  const data = 
  const response = {
    statusCode: 200,
    body: JSON.stringify([]),
  };
  return response;
};
