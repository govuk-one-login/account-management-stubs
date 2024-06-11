import { UserScenarios } from "./scenarios.interfaces";

export const userScenarios: UserScenarios = {
  default: {
    httpResponse: {
      code: 200,
      message: "OK",
    },
    userinfo: {
      sub: "F5CE808F-75AB-4ECD-BBFC-FF9DBF5330FA",
      email: "your.name@example.com",
      email_verified: true,
      phone_number: "1234567890",
      phone_number_verified: true,
      updated_at: Date.now().toString(),
    },
    mfaMethods: [
      {
        mfaIdentifier: 0,
        priorityIdentifier: "PRIMARY",
        mfaMethodType: "SMS",
        endPoint: "07123456789",
        methodVerified: true,
      },
    ],
  },
  userPrimaryAuthApp: {
    mfaMethods: [
      {
        mfaIdentifier: 1,
        priorityIdentifier: "PRIMARY",
        mfaMethodType: "AUTH_APP",
        methodVerified: true,
      },
    ],
  },
  userPrimarySms: {
    mfaMethods: [
      {
        mfaIdentifier: 1,
        priorityIdentifier: "PRIMARY",
        mfaMethodType: "SMS",
        endPoint: "0123456789",
        methodVerified: true,
      },
    ],
  },
  userPrimarySmsBackupAuthApp: {
    mfaMethods: [
      {
        mfaIdentifier: 1,
        priorityIdentifier: "PRIMARY",
        mfaMethodType: "SMS",
        endPoint: "0123456789",
        methodVerified: true,
      },
      {
        mfaIdentifier: 2,
        priorityIdentifier: "SECONDARY",
        mfaMethodType: "AUTH_APP",
        methodVerified: true,
      },
    ],
  },
  userPrimaryAuthAppBackupSms: {
    mfaMethods: [
      {
        mfaIdentifier: 1,
        priorityIdentifier: "PRIMARY",
        mfaMethodType: "AUTH_APP",
        methodVerified: true,
      },
      {
        mfaIdentifier: 2,
        priorityIdentifier: "SECONDARY",
        mfaMethodType: "SMS",
        endPoint: "0123456789",
        methodVerified: true,
      },
    ],
  },
  userPrimarySmsBackupSms: {
    mfaMethods: [
      {
        mfaIdentifier: 1,
        priorityIdentifier: "PRIMARY",
        mfaMethodType: "SMS",
        endPoint: "0123456789",
        methodVerified: true,
      },
      {
        mfaIdentifier: 2,
        priorityIdentifier: "SECONDARY",
        mfaMethodType: "SMS",
        endPoint: "99940850934",
        methodVerified: true,
      },
    ],
  },
  errorNoMfaMethods: {
    mfaMethods: [],
  },
  errorMoreThanTwoMethods: {
    mfaMethods: [
      {
        mfaIdentifier: 1,
        priorityIdentifier: "PRIMARY",
        mfaMethodType: "SMS",
        endPoint: "99940850934",
        methodVerified: true,
      },
      {
        mfaIdentifier: 2,
        priorityIdentifier: "SECONDARY",
        mfaMethodType: "SMS",
        endPoint: "99940850934",
        methodVerified: true,
      },
      {
        mfaIdentifier: 3,
        priorityIdentifier: "SECONDARY",
        mfaMethodType: "SMS",
        endPoint: "99940850934",
        methodVerified: true,
      },
    ],
  },
  errorNoPrimaryMethod: {
    mfaMethods: [
      {
        mfaIdentifier: 2,
        priorityIdentifier: "SECONDARY",
        mfaMethodType: "SMS",
        endPoint: "99940850934",
        methodVerified: true,
      },
      {
        mfaIdentifier: 3,
        priorityIdentifier: "SECONDARY",
        mfaMethodType: "SMS",
        endPoint: "99940850934",
        methodVerified: true,
      },
    ],
  },
  errorMultiplePrimaryMethods: {
    mfaMethods: [
      {
        mfaIdentifier: 2,
        priorityIdentifier: "PRIMARY",
        mfaMethodType: "SMS",
        endPoint: "99940850934",
        methodVerified: true,
      },
      {
        mfaIdentifier: 3,
        priorityIdentifier: "PRIMARY",
        mfaMethodType: "SMS",
        endPoint: "99940850934",
        methodVerified: true,
      },
    ],
  },
  errorMultipleAuthAppMethods: {
    mfaMethods: [
      {
        mfaIdentifier: 1,
        priorityIdentifier: "PRIMARY",
        mfaMethodType: "AUTH_APP",
        methodVerified: true,
      },
      {
        mfaIdentifier: 2,
        priorityIdentifier: "SECONDARY",
        mfaMethodType: "AUTH_APP",
        methodVerified: true,
      },
    ],
  },
  errorMfa400: {
    httpResponse: {
      code: 400,
      message: "BAD REQUEST",
    },
    mfaMethods: [
      {
        mfaIdentifier: 1,
        priorityIdentifier: "PRIMARY",
        mfaMethodType: "SMS",
        endPoint: "0123456789",
        methodVerified: true,
      },
    ],
  },
  errorMfa404: {
    httpResponse: {
      code: 404,
      message: "NOT FOUND",
    },
    mfaMethods: [
      {
        mfaIdentifier: 1,
        priorityIdentifier: "PRIMARY",
        mfaMethodType: "SMS",
        endPoint: "0123456789",
        methodVerified: true,
      },
    ],
  },
  errorMfa500: {
    httpResponse: {
      code: 500,
      message: "INTERNAL SERVER ERROR",
    },
    mfaMethods: [
      {
        mfaIdentifier: 1,
        priorityIdentifier: "PRIMARY",
        mfaMethodType: "SMS",
        endPoint: "0123456789",
        methodVerified: true,
      },
    ],
  },
};
