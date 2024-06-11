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
      updated_at: string;
    };
    mfaMethods: {
      mfaIdentifier: number;
      priorityIdentifier: "PRIMARY" | "SECONDARY";
      mfaMethodType: "SMS" | "AUTH_APP";
      endPoint?: string;
      methodVerified: boolean;
    }[];
  };
  [key: string]: Partial<UserScenarios["default"]>;
}
