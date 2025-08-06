import { decodeJwt } from "jose";

const SUPPORTED_REDIRECT_URLS = [
  "https%3A%2F%2Fhome.dev.account.gov.uk%2Fauth%2Fcallback",
  "http%3A%2F%2Flocalhost%3A6001%2Fauth%2Fcallback",
  "https%3A%2F%2Fhome.build.account.gov.uk%2Fauth%2Fcallback",
];
const ALLOWED_GRANT_TYPES = ["authorization_code"];

export const getIssuerFromJWT = (token: string): string | undefined => {
  try {
    const decoded = decodeJwt(token);

    // Check if the decoded object is valid and has the `iss` property
    if (decoded && decoded.iss) {
      return decoded.iss;
    } else {
      throw new Error("`iss` not found in token");
    }
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return undefined;
  }
};

export const verifyParametersExistAndOnlyOnce = (eventBody: string) => {
  // verify parameter exist and exist once only
  if (
    !existsOnce(eventBody, "client_assertion_type=") ||
    !existsOnce(eventBody, "client_assertion=") ||
    !existsOnce(eventBody, "grant_type=") ||
    !existsOnce(eventBody, "code=") ||
    !existsOnce(eventBody, "redirect_uri=")
  ) {
    throw new Error(`Missing parameters or duplicate parameter`);
  }
};

const existsOnce = (str: string, value: string) => {
  const regex = new RegExp(value, "g");
  const matches = str.match(regex);
  return matches && matches.length === 1;
};

export const validateClientIdMatches = (
  eventBody: string,
  OIDC_CLIENT_ID: string
) => {
  const regex = /client_assertion=([^ ]+)/;
  const match = eventBody.match(regex);
  const fromClientAssertion = match ? match[1] : null;
  if (fromClientAssertion) {
    const clientAssertion = fromClientAssertion.split("&")[0];
    const iss = getIssuerFromJWT(clientAssertion);
    if (iss) {
      if (OIDC_CLIENT_ID !== iss) {
        throw new Error(`Invalid client`);
      }
    } else {
      throw new Error(`Invalid client`);
    }
  }
};

export const validateRedirectURLSupported = (eventBody: string) => {
  const regex = /redirect_uri=([^ ]+)/;
  const match = eventBody.match(regex);
  const redirectUrlPreSplit = match ? match[1] : null;
  if (redirectUrlPreSplit) {
    const redirectUrl = redirectUrlPreSplit.split("&")[0];
    if (!SUPPORTED_REDIRECT_URLS.includes(redirectUrl)) {
      throw new Error(`Invalid grant - Invalid redirect URL`);
    }
  }
};

export const extractGrantType = (eventBody: string): string => {
  const regex = /grant_type=(?<grantType>[^ ]+?)&|$/;
  const match = eventBody.match(regex);
  if (!match || !match.groups || !match.groups.grantType) {
    throw new Error("grant_type not found in the event body");
  }
  return match.groups.grantType;
};

export const validateSupportedGrantType = (eventBody: string) => {
  if (!ALLOWED_GRANT_TYPES.includes(extractGrantType(eventBody))) {
    throw new Error("Unauthorized Client - unsupported_grant_type");
  }
};
