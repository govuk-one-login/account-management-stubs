import { components as mfaMethodComponents } from "../method-management/models/schema";


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
    mfaMethods: mfaMethodComponents["schemas"]["MfaMethod"][];
    otpNotification:
      | { success: true; }
      | { success: false; code: number }
  };
  [key: string]: Partial<UserScenarios["default"]>;
}
