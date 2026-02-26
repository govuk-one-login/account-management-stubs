import { APIGatewayProxyEvent } from "aws-lambda";
import { generateJwks } from "./utils/generate-jwks";


export const handler = async (event: APIGatewayProxyEvent) => {
  if (event.path === "/status") {
    return {
      statusCode: 200,
      body: JSON.stringify({}),
    };
  }

  if (event.path === "/.well-known/jwks.json" && event.httpMethod === "GET") {
    const jwks = await generateJwks();
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jwks),
    };
  }

  if (event.path === "/authorize" && event.httpMethod === "GET") {
    const params = event.queryStringParameters || {};
    const errors: string[] = [];

    if (!params.client_id || params.client_id.length === 0) {
      errors.push("client_id is required and must not be empty");
    }
    if (!params.scope || params.scope.length === 0) {
      errors.push("scope is required and must not be empty");
    }
    if (!params.response_type || params.response_type !== "code") {
      errors.push("response_type is required and must be 'code'");
    }
    if (!params.redirect_uri || params.redirect_uri.length === 0) {
      errors.push("redirect_uri is required and must not be empty");
    } else {
      try {
        new URL(params.redirect_uri);
      } catch {
        errors.push("redirect_uri must be a valid URL");
      }
    }
    if (!params.request || params.request.length === 0) {
      errors.push("request is required and must not be empty");
    }
    if (!params.state || params.state.length === 0) {
      errors.push("state is required and must not be empty");
    }

    if (errors.length > 0) {
      const html = `<!DOCTYPE html>
                    <html>
                    <head><title>Validation Error</title></head>
                    <body>
                    <h1>Validation Failed</h1>
                    <ul>${errors.map(error => `<li>${error}</li>`).join('')}</ul>
                    </body>
                    </html>`;
      return {
        statusCode: 400,
        headers: { "Content-Type": "text/html" },
        body: html,
      };
    } 

    const redirectUri = params.redirect_uri;
    const state = params.state;

    const html = `<!DOCTYPE html>
                  <html>
                  <head><title>Account Management Component Stub</title></head>
                  <body>
                  <h1>Account Management Component Stub</h1>

                  <h2>Journey outcome endpoint success responses</h2>
                  <p>These links are for simulating /journeyoutcome success responses as detailed in the spec at <a href="https://github.com/govuk-one-login/account-components/blob/main/solutions/api/spec.yaml">account-components/solutions/api/spec.yaml</a></p>
                  <a href="${redirectUri}?code=journeyoutcome_response__%7B%22body%22%3A%7B%22email%22%3A%22testuser%40test.null.local%22%2C%22journeys%22%3A%5B%7B%22details%22%3A%7B%7D%2C%22journey%22%3A%22testing-journey%22%2C%22success%22%3Atrue%2C%22timestamp%22%3A1770630621788%7D%5D%2C%22outcome_id%22%3A%22e015cbfbfb80b1d0b48454c2e033e04910c27d58827b31d8%22%2C%22scope%22%3A%22testing-journey%22%2C%22sub%22%3A%22urn%3Afdc%3Agov.uk%3Adefault%22%2C%22success%22%3Atrue%7D%2C%22statusCode%22%3A200%7D%27&state=${state}">testing-journey success</a><br>
                  <a href="${redirectUri}?code=journeyoutcome_response__%7B%22body%22%3A%7B%22email%22%3A%22testuser%40test.null.local%22%2C%22journeys%22%3A%5B%7B%22details%22%3A%7B%7D%2C%22journey%22%3A%22account-delete%22%2C%22success%22%3Atrue%2C%22timestamp%22%3A1770630621788%7D%5D%2C%22outcome_id%22%3A%22e015cbfbfb80b1d0b48454c2e033e04910c27d58827b31d8%22%2C%22scope%22%3A%22account-delete%22%2C%22sub%22%3A%22urn%3Afdc%3Agov.uk%3Adefault%22%2C%22success%22%3Atrue%7D%2C%22statusCode%22%3A200%7D%27&state=${state}">account-delete success</a><br>
                  <a href="${redirectUri}?code=journeyoutcome_response__%7B%22body%22%3A%7B%22email%22%3A%22testuser%40test.null.local%22%2C%22journeys%22%3A%5B%7B%22details%22%3A%7B%7D%2C%22journey%22%3A%22passkey-create%22%2C%22success%22%3Atrue%2C%22timestamp%22%3A1770630621788%7D%5D%2C%22outcome_id%22%3A%22e015cbfbfb80b1d0b48454c2e033e04910c27d58827b31d8%22%2C%22scope%22%3A%22passkey-create%22%2C%22sub%22%3A%22urn%3Afdc%3Agov.uk%3Adefault%22%2C%22success%22%3Atrue%7D%2C%22statusCode%22%3A200%7D%27&state=${state}">passkey-create success</a><br>
                  <a href="${redirectUri}?code=journeyoutcome_response__%7B%22body%22%3A%7B%22email%22%3A%22testuser%40test.null.local%22%2C%22journeys%22%3A%5B%7B%22details%22%3A%7B%22error%22%3A%7B%22code%22%3A1001%2C%22description%22%3A%22UserSignedOut%22%7D%7D%2C%22journey%22%3A%22testing-journey%22%2C%22success%22%3Afalse%2C%22timestamp%22%3A1770631329893%7D%5D%2C%22outcome_id%22%3A%2267ed54cfef70b3a5a7c88da6cabca2a128eb57a2aa92a81b%22%2C%22scope%22%3A%22testing-journey%22%2C%22sub%22%3A%22urn%3Afdc%3Agov.uk%3Adefault%22%2C%22success%22%3Afalse%7D%2C%22statusCode%22%3A200%7D%27&state=${state}">testing-journey user signed out</a><br>
                  <a href="${redirectUri}?code=journeyoutcome_response__%7B%22body%22%3A%7B%22email%22%3A%22testuser%40test.null.local%22%2C%22journeys%22%3A%5B%7B%22details%22%3A%7B%22error%22%3A%7B%22code%22%3A1001%2C%22description%22%3A%22UserSignedOut%22%7D%7D%2C%22journey%22%3A%22account-delete%22%2C%22success%22%3Afalse%2C%22timestamp%22%3A1770631329893%7D%5D%2C%22outcome_id%22%3A%2267ed54cfef70b3a5a7c88da6cabca2a128eb57a2aa92a81b%22%2C%22scope%22%3A%22account-delete%22%2C%22sub%22%3A%22urn%3Afdc%3Agov.uk%3Adefault%22%2C%22success%22%3Afalse%7D%2C%22statusCode%22%3A200%7D%27&state=${state}">account-delete user signed out</a><br>
                  <a href="${redirectUri}?code=journeyoutcome_response__%7B%22body%22%3A%7B%22email%22%3A%22testuser%40test.null.local%22%2C%22journeys%22%3A%5B%7B%22details%22%3A%7B%22error%22%3A%7B%22code%22%3A1001%2C%22description%22%3A%22UserSignedOut%22%7D%7D%2C%22journey%22%3A%22passkey-create%22%2C%22success%22%3Afalse%2C%22timestamp%22%3A1770631329893%7D%5D%2C%22outcome_id%22%3A%2267ed54cfef70b3a5a7c88da6cabca2a128eb57a2aa92a81b%22%2C%22scope%22%3A%22passkey-create%22%2C%22sub%22%3A%22urn%3Afdc%3Agov.uk%3Adefault%22%2C%22success%22%3Afalse%7D%2C%22statusCode%22%3A200%7D%27&state=${state}">passkey-create user signed out</a><br>

                  <h2>Journey outcome endpoint error responses</h2>
                  <p>These links are for simulating /journeyoutcome error responses as detailed in the spec at <a href="https://github.com/govuk-one-login/account-components/blob/main/solutions/api/spec.yaml">account-components/solutions/api/spec.yaml</a></p>
                  <a href="${redirectUri}?code=journeyoutcome_response__%7B%22body%22%3A%7B%22error%22%3A%22invalid_request%22%2C%22error_description%22%3A%22E4006%22%7D%2C%22statusCode%22%3A400%7D&state=${state}">invalid_authorization_header E4006</a><br>
                  <a href="${redirectUri}?code=journeyoutcome_response__%7B%22body%22%3A%7B%22error%22%3A%22invalid_request%22%2C%22error_description%22%3A%22E4005%22%7D%2C%22statusCode%22%3A400%7D&state=${state}">outcome_sub_does_not_match_payload E4005</a><br>
                  <a href="${redirectUri}?code=journeyoutcome_response__%7B%22body%22%3A%7B%22error%22%3A%22invalid_request%22%2C%22error_description%22%3A%22E4007%22%7D%2C%22statusCode%22%3A400%7D&state=${state}">invalid_access_token E4007</a><br>
                  <a href="${redirectUri}?code=journeyoutcome_response__%7B%22body%22%3A%7B%22error%22%3A%22invalid_request%22%2C%22error_description%22%3A%22E4008%22%7D%2C%22statusCode%22%3A400%7D&state=${state}">access_token_signature_invalid E4008</a><br>
                  <a href="${redirectUri}?code=journeyoutcome_response__%7B%22statusCode%22%3A401%7D&state=${state}">Missing or invalid access token</a><br>
                  <a href="${redirectUri}?code=journeyoutcome_response__%7B%22body%22%3A%7B%22error%22%3A%22not_found%22%2C%22error_description%22%3A%22E404%22%7D%2C%22statusCode%22%3A404%7D&state=${state}">missing_outcome E404</a><br>
                  <a href="${redirectUri}?code=journeyoutcome_response__%7B%22body%22%3A%7B%22error%22%3A%22internal_server_error%22%2C%22error_description%22%3A%22E500%22%7D%2C%22statusCode%22%3A500%7D&state=${state}">generic_error E500</a><br>
                  <a href="${redirectUri}?code=journeyoutcome_response__%7B%22body%22%3A%7B%22error%22%3A%22internal_server_error%22%2C%22error_description%22%3A%22E5001%22%7D%2C%22statusCode%22%3A500%7D&state=${state}">failed_to_find_outcome E5001</a><br>

                  <h2>Token endpoint error responses</h2>
                  <p>These links are for simulating /token error responses as detailed in the spec at <a href="https://github.com/govuk-one-login/account-components/blob/main/solutions/api/spec.yaml">account-components/solutions/api/spec.yaml</a></p>
                  <a href="${redirectUri}?code=token_response__%7B%22body%22%3A%7B%22error%22%3A%22invalid_request%22%2C%22error_description%22%3A%22E4001%22%7D%2C%22statusCode%22%3A400%7D&state=${state}">invalid_request E4001</a><br>
                  <a href="${redirectUri}?code=token_response__%7B%22body%22%3A%7B%22error%22%3A%22invalid_request%22%2C%22error_description%22%3A%22E4002%22%7D%2C%22statusCode%22%3A400%7D&state=${state}">invalid_client_assertion E4002</a><br>
                  <a href="${redirectUri}?code=token_response__%7B%22body%22%3A%7B%22error%22%3A%22invalid_grant%22%2C%22error_description%22%3A%22E4003%22%7D%2C%22statusCode%22%3A400%7D&state=${state}">invalid_code E4003</a><br>
                  <a href="${redirectUri}?code=token_response__%7B%22body%22%3A%7B%22error%22%3A%22internal_server_error%22%2C%22error_description%22%3A%22E500%22%7D%2C%22statusCode%22%3A500%7D&state=${state}">generic_error E500</a><br>

                  <h2>Authorize error responses</h2>
                  <p>These links are for simulating /authorize error responses as detailed in the spec at <a href="https://github.com/govuk-one-login/account-components/blob/main/solutions/frontend/spec.yaml">account-components/solutions/frontend/spec.yaml</a></p>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1001&state=${state}">alg_not_allowed E1001</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1002&state=${state}">invalid_client_assertion E1002</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1003&state=${state}">invalid_request_jwt E1003</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1004&state=${state}">invalid_request_jwt_signature E1004</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1005&state=${state}">invalid_request_jwt_expired E1005</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1006&state=${state}">invalid_request_jwt_nbf E1006</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1007&state=${state}">invalid_request_jwt_aud E1007</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1008&state=${state}">invalid_request_jwt_iss E1008</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1009&state=${state}">invalid_request_jwt_sub E1009</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1010&state=${state}">invalid_request_jwt_response_type E1010</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1011&state=${state}">invalid_request_jwt_client_id E1011</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1012&state=${state}">invalid_request_jwt_redirect_uri E1012</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1013&state=${state}">invalid_request_jwt_scope E1013</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1014&state=${state}">invalid_request_jwt_state E1014</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1015&state=${state}">invalid_request_jwt_nonce E1015</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1016&state=${state}">invalid_request_jwt_claims E1016</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1017&state=${state}">invalid_request_jwt_vtr E1017</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1018&state=${state}">invalid_request_jwt_vtm E1018</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1019&state=${state}">invalid_request_jwt_ui_locales E1019</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1020&state=${state}">invalid_request_jwt_rp_sid E1020</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1021&state=${state}">invalid_request_jwt_govuk_signin_journey_id E1021</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1022&state=${state}">invalid_request_jwt_cookie_consent E1022</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1023&state=${state}">invalid_request_jwt_ga E1023</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1024&state=${state}">invalid_request_jwt_reprove_identity E1024</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1025&state=${state}">invalid_request_jwt_uplift E1025</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1026&state=${state}">invalid_request_jwt_identity_required E1026</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1027&state=${state}">invalid_request_jwt_prompt E1027</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1028&state=${state}">invalid_request_jwt_max_age E1028</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1029&state=${state}">invalid_request_jwt_login_hint E1029</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1030&state=${state}">invalid_request_jwt_id_token_hint E1030</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1031&state=${state}">invalid_request_jwt_acr_values E1031</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1032&state=${state}">invalid_request_jwt_display E1032</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1033&state=${state}">invalid_request_jwt_code_challenge E1033</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1034&state=${state}">invalid_request_jwt_code_challenge_method E1034</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1035&state=${state}">invalid_request_jwt_request_uri E1035</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1036&state=${state}">invalid_request_jwt_registration E1036</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1037&state=${state}">invalid_request_jwt_request E1037</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1038&state=${state}">invalid_request_jwt_response_mode E1038</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1039&state=${state}">invalid_request_jwt_unknown_claim E1039</a><br>
                  <a href="${redirectUri}?error=invalid_client&error_description=E1040&state=${state}">invalid_client E1040</a><br>
                  <a href="${redirectUri}?error=unsupported_response_type&error_description=E1041&state=${state}">unsupported_response_type E1041</a><br>
                  <a href="${redirectUri}?error=invalid_scope&error_description=E1042&state=${state}">invalid_scope E1042</a><br>
                  <a href="${redirectUri}?error=server_error&error_description=E1043&state=${state}">server_error E1043</a><br>
                  <a href="${redirectUri}?error=temporarily_unavailable&error_description=E1044&state=${state}">temporarily_unavailable E1044</a><br>
                  <a href="${redirectUri}?error=interaction_required&error_description=E1045&state=${state}">interaction_required E1045</a><br>
                  <a href="${redirectUri}?error=login_required&error_description=E1046&state=${state}">login_required E1046</a><br>
                  <a href="${redirectUri}?error=account_selection_required&error_description=E1047&state=${state}">account_selection_required E1047</a><br>
                  <a href="${redirectUri}?error=consent_required&error_description=E1048&state=${state}">consent_required E1048</a><br>
                  <a href="${redirectUri}?error=invalid_request_uri&error_description=E1049&state=${state}">invalid_request_uri E1049</a><br>
                  <a href="${redirectUri}?error=invalid_request_object&error_description=E1050&state=${state}">invalid_request_object E1050</a><br>
                  <a href="${redirectUri}?error=request_not_supported&error_description=E1051&state=${state}">request_not_supported E1051</a><br>
                  <a href="${redirectUri}?error=request_uri_not_supported&error_description=E1052&state=${state}">request_uri_not_supported E1052</a><br>
                  <a href="${redirectUri}?error=registration_not_supported&error_description=E1053&state=${state}">registration_not_supported E1053</a><br>

                  </body>
                  </html>`;

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: html,
    };
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ error: "Not Found" }),
  };
};
