import * as jose from "jose";
import { randomUUID } from "node:crypto";

let cachedJWK: unknown | null = null;

export async function generateJwks() {
  if (cachedJWK) {
    return cachedJWK;
  }

  const { publicKey } = await jose.generateKeyPair("RSA-OAEP-256");

  const publicJwk = await jose.exportJWK(publicKey);

  cachedJWK = {
    keys: [
      {
        ...publicJwk,
        kid: randomUUID(),
        alg: "RSA-OAEP-256",
        use: "enc",
      },
    ],
  };

  return cachedJWK;
}
