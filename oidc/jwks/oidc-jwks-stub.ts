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
        kid: "B-QMUxdJOJ8ubkmArc4i1SGmfZnNNlM-va9h0HJ0jCo",
        x: "YrTTzbuUwQhWyaj11w33k-K8bFydLfQssVqr8mx6AVE",
        y: "8UQcw-6Wp0bp8iIIkRw8PW2RSSjmj1I_8euyKEDtWRk",
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
