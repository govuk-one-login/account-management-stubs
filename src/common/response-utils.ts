import { Response } from "../method-management/method-management";

export const formatResponse = (
  statusCode: number,
  body: unknown,
): Response => ({
  statusCode,
  body: JSON.stringify(body),
});
