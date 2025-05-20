export const formatResponse = (
  statusCode: number,
  body: unknown
): Response => ({
  statusCode,
  body: JSON.stringify(body),
});

export interface Response {
  statusCode: number;
  body: string;
}

export interface RedirectResponse {
  statusCode: 302;
  headers: {
    Location: string;
  };
}
