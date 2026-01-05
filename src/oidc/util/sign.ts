import { JWK, JWTHeaderParameters, importJWK } from "jose";

export const algorithm = "ES256";
export const jwtHeader: JWTHeaderParameters = {
  kid: "B-QMUxdJOJ8ubkmArc4i1SGmfZnNNlM-va9h0HJ0jCo",
  alg: algorithm,
};

let cachedPrivateKey: Uint8Array | CryptoKey;
export const getPrivateKey = async () => {
  if (!cachedPrivateKey) {
    if (typeof process.env["JWK_KEY_SECRET"] === "undefined") {
      throw new Error("JWK_KEY_SECRET environment variable is undefined");
    }
    const jwkSecret = JSON.parse(process.env["JWK_KEY_SECRET"]);
    const jwk: JWK = JSON.parse(jwkSecret);
    cachedPrivateKey = await importJWK(jwk, algorithm);
  }
  return cachedPrivateKey;
};

getPrivateKey(); //populate cache on runtime
