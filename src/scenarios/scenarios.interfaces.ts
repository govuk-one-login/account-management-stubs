import { components } from "../method-management/models/schema";

export interface OicdPersistedData {
  code: string;
  nonce: string;
  userId: string;
}

export interface UserScenarios {
  default: {
    httpResponse: {
      code: number;
      message: string;
    };
    userinfo: {
      email: string;
      email_verified: boolean;
      sub: string;
      phone_number: string;
      phone_number_verified: boolean;
    };
    mfaMethods: components["schemas"]["MfaMethod"][];
  };
  [key: string]: Partial<UserScenarios["default"]>;
}
