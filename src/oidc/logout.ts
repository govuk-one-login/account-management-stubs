import { APIGatewayProxyEvent } from "aws-lambda";
import { RedirectResponse } from "../common/response-utils";
import assert from "node:assert/strict";
import { validateSameHostname } from "../common/validation";

const VALID_HOSTNAMES = [
  "home.dev.account.gov.uk",
  "home.build.account.gov.uk",
  "localhost",
];

export const validateRedirectUri = (redirectUri: string) => {
  const url = new URL(redirectUri);
  if (!VALID_HOSTNAMES.includes(url.hostname)) {
    throw new Error("Redirect URI must be to an allowed domain");
  }

  if (url.hostname === "localhost" && url.protocol === "http:") {
    return;
  }

  if (url.protocol != "https:") {
    throw new Error("Redirect URI protocol must be HTTPS if not localhost");
  }
};

export const validateReferrer = (referrer: string) => {
  const url = new URL(referrer);
  if (!VALID_HOSTNAMES.includes(url.hostname)) {
    throw new Error("Referrer must be an allowed domain");
  }
};

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<RedirectResponse> => {
  assert(event.queryStringParameters, "No query parameters provided");

  const token = event.queryStringParameters.id_token_hint;
  const redirectUri = event.queryStringParameters.post_logout_redirect_uri;
  const referrer = event.headers.Referer;

  assert(token, "No id_token_hint provided");
  assert(redirectUri, "No post_logout_redirect_uri provided");
  assert(referrer, "No Origin header");

  validateReferrer(referrer);

  validateRedirectUri(redirectUri);
  validateSameHostname(redirectUri, referrer);
  return {
    statusCode: 302,
    headers: {
      Location: redirectUri,
    },
  };
};
