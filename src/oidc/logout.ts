import { APIGatewayProxyEvent } from "aws-lambda";
import { RedirectResponse } from "../common/response-utils";
import { validateSameHostname } from "../common/validation";

export const validateHostname = (host: string) => {
  // Domain is localhost OR ends in .account.gov.uk
  if (!host.match(/(?:.+\.account\.gov\.uk$)|^localhost$/)) {
    throw new Error(`Hostname ${host} is not allowed`);
  }
};

export const validateRedirectUri = (redirectUri: string) => {
  const url = new URL(redirectUri);
  validateHostname(url.hostname);

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

  if (referrerUri) {
    const referrer = new URL(referrerUri);
    validateHostname(referrer.hostname);
  }

  if (originUri) {
    const origin = new URL(originUri);
    validateHostname(origin.hostname);
  }

  if (referrerUri && originUri) {
    validateSameHostname(referrerUri, originUri);
  }
};

const buildDefaultRedirectUri = (): string => {
  return `https://signin.${process.env?.ENVIRONMENT}.account.gov.uk/signed-out`;
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

  if (redirectUri) {
    if (referrer) {
      validateSameHostname(redirectUri, referrer);
    }
    if (origin) {
      validateSameHostname(redirectUri, origin);
    }
  }

  if (!redirectUri || !token) {
    if (!redirectUri && !token) {
      redirectUri = buildDefaultRedirectUri();
    } else {
      throw new Error(
        "Must provide both id_token_hint and post_logout_redirect_uri or neither"
      );
    }
  }

  validateRedirectUri(redirectUri);

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
