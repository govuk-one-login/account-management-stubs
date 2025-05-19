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

export const validateReferrerAndOrigin = (
  referrerUri: string | undefined,
  originUri: string | undefined
) => {
  if (!referrerUri && !originUri) {
    throw new Error("Must provide at least one of Origin or Referer headers");
  }

  let referrer: URL;
  let origin: URL;

  if (referrerUri) {
    referrer = new URL(referrerUri);
    if (!VALID_HOSTNAMES.includes(referrer.hostname)) {
      throw new Error("Referrer must be an allowed domain");
    }
  }

  if (originUri) {
    origin = new URL(originUri);
    if (!VALID_HOSTNAMES.includes(origin.hostname)) {
      throw new Error("Origin must be an allowed domain");
    }
  }

  if (referrerUri && originUri) {
    validateSameHostname(referrerUri, originUri);
  }
};

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<RedirectResponse> => {
  assert(event.queryStringParameters, "No query parameters provided");

  const token = event.queryStringParameters.id_token_hint;
  const redirectUri = event.queryStringParameters.post_logout_redirect_uri;
  const referrer = event.headers.Referer;
  const origin = event.headers.Origin;

  assert(token, "No id_token_hint provided");
  assert(redirectUri, "No post_logout_redirect_uri provided");

  validateReferrerAndOrigin(referrer, origin);
  validateRedirectUri(redirectUri);

  if (referrer) {
    validateSameHostname(redirectUri, referrer);
  }
  if (origin) {
    validateSameHostname(redirectUri, origin);
  }

  return {
    statusCode: 302,
    headers: {
      Location: redirectUri,
    },
  };
};
