import { APIGatewayProxyEvent } from "aws-lambda";
import { RedirectResponse } from "../common/response-utils";
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

export const inferRedirectUriFromReferrer = (
  referrer: string | undefined,
  origin: string | undefined
): string => {
  const targetUri = referrer ? referrer : origin;

  if (!targetUri) {
    throw new Error(
      "Can't infer redirect URI without one of Referer or Origin headers"
    );
  }

  const target = new URL(targetUri);
  target.pathname = "/logout-return";
  return target.href;
};

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<RedirectResponse> => {
  const token = event.queryStringParameters?.id_token_hint;
  let redirectUri = event.queryStringParameters?.post_logout_redirect_uri;
  const state = event.queryStringParameters?.state;
  const referrer = event.headers.Referer;
  const origin = event.headers.Origin;

  validateReferrerAndOrigin(referrer, origin);

  if (!redirectUri || !token) {
    if (!redirectUri && !token) {
      redirectUri = inferRedirectUriFromReferrer(referrer, origin);
    } else {
      throw new Error(
        "Must provide both id_token_hint and post_logout_redirect_uri or neither"
      );
    }
  }

  validateRedirectUri(redirectUri);

  if (referrer) {
    validateSameHostname(redirectUri, referrer);
  }
  if (origin) {
    validateSameHostname(redirectUri, origin);
  }

  if (state) {
    const url = new URL(redirectUri);
    url.searchParams.append("state", state);
    redirectUri = url.href;
  }

  return {
    statusCode: 302,
    headers: {
      Location: redirectUri,
    },
  };
};
