export interface Response {
  statusCode: number;
  body: string;
}

export const handler = async () => {
  const data = {
    keys: [
      {
        kty: "EC",
        use: "sig",
        crv: "P-256",
        kid: "f02aec21220ef7b502e6396304345a7b87cffbdc4239ed09a136b164c6cf8e30",
        x: "qBwa5L5ZA33RortEjaQ8_lwrVd-EE2eVsgOC84VwyVQ",
        y: "ONF88GoP9xQJtq8RRV6zquggcd7xtggzZ20yW-PljHE",
        alg: "ES256",
      },
    ],
  };

  const response = {
    statusCode: 200,
    body: JSON.stringify(data),
  };

  return response;
};
