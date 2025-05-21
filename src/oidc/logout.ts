import { APIGatewayProxyEvent } from "aws-lambda";
import { RedirectResponse } from "../common/response-utils";
import * as v from "valibot";

export const validateRedirectUri = (rawRedirectUri: string) => {
  const redirectUri = v.parse(v.pipe(v.string(), v.url()), rawRedirectUri);

  const rawLogoutRedirectUrisConfiguredForRp = JSON.parse(
    process.env.POST_LOGOUT_REDIRECT_URIS ?? "[]"
  );

  const postLogoutRedirectUrisConfiguredForRp = v.parse(
    v.pipe(v.array(v.pipe(v.string(), v.url())), v.minLength(1)),
    rawLogoutRedirectUrisConfiguredForRp
  );

  for (const postLogoutRedirectUriConfiguredForRp of postLogoutRedirectUrisConfiguredForRp) {
    if (redirectUri === postLogoutRedirectUriConfiguredForRp) {
      return;
    }
  }

  throw new Error(
    `Redirect URI must match one of the post logout redirect URIs configured for this RP: ${process.env.POST_LOGOUT_REDIRECT_URIS}`
  );
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

  if (redirectUri && token) {
    try {
      validateRedirectUri(redirectUri);
      const uri = new URL(redirectUri);
      if (state) {
        uri.searchParams.append("state", state);
      }
      redirectUri = uri.href;
    } catch {
      redirectUri = buildDefaultRedirectUri();
    }
  } else {
    redirectUri = buildDefaultRedirectUri();
  }

  return {
    statusCode: 302,
    headers: {
      Location: redirectUri,
    },
  };
};
