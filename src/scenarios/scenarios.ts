import { UserScenarios } from "./scenarios.interfaces";

export const ERROR_CODES = {
  NEW_PASSWORD_SAME_AS_EXISTING: 1024,
  PASSWORD_IS_COMMON: 1040,
  NEW_PHONE_NUMBER_SAME_AS_EXISTING: 1044,
};

const somePasskeys = [
  {
    credential: "fake-credential-1",
    id: "f5cf86e0-6eb5-4965-8c5e-2516b8f1c625",
    aaguid: "1ac71f64-468d-4fe0-bef1-0e5f2f551f18",
    isAttested: true,
    signCount: 1,
    transports: ["usb"],
    isBackUpEligible: false,
    isBackedUp: false,
    createdAt: "2026-01-25T19:04:16.341Z",
    lastUsedAt: "2026-02-08T09:33:10.341Z",
  },
  {
    credential: "fake-credential-2",
    id: "8518d6e1-a126-463f-b682-103b7f8b1852",
    aaguid: "dd4ec289-e01d-41c9-bb89-70fa845d4bf2",
    isAttested: false,
    signCount: 0,
    transports: ["internal"],
    isBackUpEligible: true,
    isBackedUp: true,
    createdAt: "2026-01-19T19:04:16.341Z",
    lastUsedAt: "2026-02-25T20:06:19.341Z",
  },
];

export const userScenarios: UserScenarios = {
  default: {
    httpResponse: {
      code: 200,
      message: "OK",
    },
    userInfoSigned: {
      isSigned: false,
    },
    userinfo: {
      sub: "urn:fdc:gov.uk:default",
      email: "your.name@example.com",
      email_verified: true,
      phone_number: "1234567890",
      phone_number_verified: true,
      public_subject_id: "default",
    },
    mfaMethods: [
      {
        mfaIdentifier: "0",
        priorityIdentifier: "DEFAULT",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "07123456789",
        },
        methodVerified: true,
      },
    ],
    otpNotification: {
      success: true,
    },
    passkeys: somePasskeys,
  },
  methodManagementDev: {
    userinfo: {
      sub: "urn:fdc:gov.uk:methodManagementDev",
      email: "your.name@example.com",
      email_verified: true,
      phone_number: "1234567890",
      phone_number_verified: true,
      public_subject_id: "ooVD4Sm9oPoZTHdY6ekyoexHDb_AoN4uDd7uHH-eQqk",
    },
    passkeys: somePasskeys,
  },
  userDEFAULTAuthApp: {
    userinfo: {
      sub: "urn:fdc:gov.uk:userDEFAULTAuthApp",
      email: "your.name@example.com",
      email_verified: true,
      phone_number: "1234567890",
      phone_number_verified: true,
      public_subject_id: "userDEFAULTAuthApp",
    },
    mfaMethods: [
      {
        mfaIdentifier: "1",
        priorityIdentifier: "DEFAULT",
        method: {
          mfaMethodType: "AUTH_APP",
          credential: "ABC",
        },
        methodVerified: true,
      },
    ],
    passkeys: somePasskeys,
  },
  userDEFAULTSms: {
    userinfo: {
      sub: "urn:fdc:gov.uk:userDEFAULTSms",
      email: "your.name@example.com",
      email_verified: true,
      phone_number: "1234567890",
      phone_number_verified: true,
      public_subject_id: "userDEFAULTSms",
    },
    mfaMethods: [
      {
        mfaIdentifier: "1",
        priorityIdentifier: "DEFAULT",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "0123456789",
        },
        methodVerified: true,
      },
    ],
    passkeys: somePasskeys,
  },
  userDEFAULTSmsBackupAuthApp: {
    userinfo: {
      sub: "urn:fdc:gov.uk:userDEFAULTSmsBackupAuthApp",
      email: "your.name@example.com",
      email_verified: true,
      phone_number: "1234567890",
      phone_number_verified: true,
      public_subject_id: "userDEFAULTSmsBackupAuthApp",
    },
    mfaMethods: [
      {
        mfaIdentifier: "1",
        priorityIdentifier: "DEFAULT",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "0123456789",
        },
        methodVerified: true,
      },
      {
        mfaIdentifier: "2",
        priorityIdentifier: "BACKUP",
        method: {
          mfaMethodType: "AUTH_APP",
          credential: "ABC",
        },
        methodVerified: true,
      },
    ],
    passkeys: somePasskeys,
  },
  userDEFAULTAuthAppBackupSms: {
    userinfo: {
      sub: "urn:fdc:gov.uk:userDEFAULTAuthAppBackupSms",
      email: "your.name@example.com",
      email_verified: true,
      phone_number: "1234567890",
      phone_number_verified: true,
      public_subject_id: "userDEFAULTAuthAppBackupSms",
    },
    mfaMethods: [
      {
        mfaIdentifier: "1",
        priorityIdentifier: "DEFAULT",
        method: {
          mfaMethodType: "AUTH_APP",
          credential: "ABC",
        },
        methodVerified: true,
      },
      {
        mfaIdentifier: "2",
        priorityIdentifier: "BACKUP",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "0123456789",
        },
        methodVerified: true,
      },
    ],
    passkeys: somePasskeys,
  },
  userDEFAULTSmsBackupSms: {
    userinfo: {
      sub: "urn:fdc:gov.uk:userDEFAULTSmsBackupSms",
      email: "your.name@example.com",
      email_verified: true,
      phone_number: "1234567890",
      phone_number_verified: true,
      public_subject_id: "userDEFAULTSmsBackupSms",
    },
    mfaMethods: [
      {
        mfaIdentifier: "1",
        priorityIdentifier: "DEFAULT",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "0123456789",
        },
        methodVerified: true,
      },
      {
        mfaIdentifier: "2",
        priorityIdentifier: "BACKUP",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "99940850934",
        },
        methodVerified: true,
      },
    ],
    passkeys: somePasskeys,
  },
  userNewPhoneNumberSameAsExisting: {
    userinfo: {
      sub: "urn:fdc:gov.uk:userNewPhoneNumberSameAsExisting",
      email: "your.name@example.com",
      email_verified: true,
      phone_number: "1234567890",
      phone_number_verified: true,
      public_subject_id: "userNewPhoneNumberSameAsExisting",
    },
    otpNotification: {
      success: false,
      code: ERROR_CODES.NEW_PHONE_NUMBER_SAME_AS_EXISTING,
    },
    mfaMethods: [
      {
        mfaIdentifier: "1",
        priorityIdentifier: "DEFAULT",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "0123456789",
        },
        methodVerified: true,
      },
    ],
    passkeys: somePasskeys,
  },
  userOtpCodeWrong: {
    userinfo: {
      sub: "urn:fdc:gov.uk:userOtpCodeWrong",
      email: "your.name@example.com",
      email_verified: true,
      phone_number: "1234567890",
      phone_number_verified: true,
      public_subject_id: "userOtpCodeWrong",
    },
    httpResponse: {
      code: 400,
      message: "OTP incorrect",
    },
    passkeys: somePasskeys,
  },
  errorNoMfaMethods: {
    userinfo: {
      sub: "urn:fdc:gov.uk:errorNoMfaMethods",
      email: "your.name@example.com",
      email_verified: true,
      phone_number: "1234567890",
      phone_number_verified: true,
      public_subject_id: "errorNoMfaMethods",
    },
    mfaMethods: [],
    passkeys: somePasskeys,
  },
  errorMoreThanTwoMethods: {
    userinfo: {
      sub: "urn:fdc:gov.uk:errorMoreThanTwoMethods",
      email: "your.name@example.com",
      email_verified: true,
      phone_number: "1234567890",
      phone_number_verified: true,
      public_subject_id: "errorMoreThanTwoMethods",
    },
    mfaMethods: [
      {
        mfaIdentifier: "1",
        priorityIdentifier: "DEFAULT",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "99940850934",
        },
        methodVerified: true,
      },
      {
        mfaIdentifier: "2",
        priorityIdentifier: "BACKUP",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "99940850934",
        },
        methodVerified: true,
      },
      {
        mfaIdentifier: "3",
        priorityIdentifier: "BACKUP",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "99940850934",
        },
        methodVerified: true,
      },
    ],
    passkeys: somePasskeys,
  },
  errorNoDEFAULTMethod: {
    userinfo: {
      sub: "urn:fdc:gov.uk:errorNoDEFAULTMethod",
      email: "your.name@example.com",
      email_verified: true,
      phone_number: "1234567890",
      phone_number_verified: true,
      public_subject_id: "errorNoDEFAULTMethod",
    },
    mfaMethods: [
      {
        mfaIdentifier: "2",
        priorityIdentifier: "BACKUP",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "99940850934",
        },
        methodVerified: true,
      },
      {
        mfaIdentifier: "3",
        priorityIdentifier: "BACKUP",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "99940850934",
        },
        methodVerified: true,
      },
    ],
    passkeys: somePasskeys,
  },
  errorMultipleDEFAULTMethods: {
    userinfo: {
      sub: "urn:fdc:gov.uk:errorMultipleDEFAULTMethods",
      email: "your.name@example.com",
      email_verified: true,
      phone_number: "1234567890",
      phone_number_verified: true,
      public_subject_id: "errorMultipleDEFAULTMethods",
    },
    mfaMethods: [
      {
        mfaIdentifier: "2",
        priorityIdentifier: "DEFAULT",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "99940850934",
        },
        methodVerified: true,
      },
      {
        mfaIdentifier: "3",
        priorityIdentifier: "DEFAULT",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "99940850934",
        },
        methodVerified: true,
      },
    ],
    passkeys: somePasskeys,
  },
  errorMultipleAuthAppMethods: {
    userinfo: {
      sub: "urn:fdc:gov.uk:errorMultipleAuthAppMethods",
      email: "your.name@example.com",
      email_verified: true,
      phone_number: "1234567890",
      phone_number_verified: true,
      public_subject_id: "errorMultipleAuthAppMethods",
    },
    mfaMethods: [
      {
        mfaIdentifier: "1",
        priorityIdentifier: "DEFAULT",
        method: {
          mfaMethodType: "AUTH_APP",
          credential: "ABC",
        },
        methodVerified: true,
      },
      {
        mfaIdentifier: "2",
        priorityIdentifier: "BACKUP",
        method: {
          mfaMethodType: "AUTH_APP",
          credential: "ABC",
        },
        methodVerified: true,
      },
    ],
    passkeys: somePasskeys,
  },
  errorMfa400: {
    userinfo: {
      sub: "urn:fdc:gov.uk:errorMfa400",
      email: "your.name@example.com",
      email_verified: true,
      phone_number: "1234567890",
      phone_number_verified: true,
      public_subject_id: "errorMfa400",
    },
    httpResponse: {
      code: 400,
      message: "BAD REQUEST",
    },
    mfaMethods: [
      {
        mfaIdentifier: "1",
        priorityIdentifier: "DEFAULT",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "0123456789",
        },
        methodVerified: true,
      },
    ],
    passkeys: somePasskeys,
  },
  errorMfa404: {
    userinfo: {
      sub: "urn:fdc:gov.uk:errorMfa404",
      email: "your.name@example.com",
      email_verified: true,
      phone_number: "1234567890",
      phone_number_verified: true,
      public_subject_id: "errorMfa404",
    },
    httpResponse: {
      code: 404,
      message: "NOT FOUND",
    },
    mfaMethods: [
      {
        mfaIdentifier: "1",
        priorityIdentifier: "DEFAULT",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "0123456789",
        },
        methodVerified: true,
      },
    ],
    passkeys: somePasskeys,
  },
  errorMfa500: {
    userinfo: {
      sub: "urn:fdc:gov.uk:errorMfa500",
      email: "your.name@example.com",
      email_verified: true,
      phone_number: "1234567890",
      phone_number_verified: true,
      public_subject_id: "errorMfa500",
    },
    httpResponse: {
      code: 500,
      message: "INTERNAL SERVER ERROR",
    },
    mfaMethods: [
      {
        mfaIdentifier: "1",
        priorityIdentifier: "DEFAULT",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "0123456789",
        },
        methodVerified: true,
      },
    ],
    passkeys: somePasskeys,
  },
  userPerformanceTest: {
    httpResponse: {
      code: 200,
      message: "OK",
    },
    userinfo: {
      sub: "urn:fdc:gov.uk:userPerformanceTest",
      email: "your.name@example.com",
      email_verified: true,
      phone_number: "1234567890",
      phone_number_verified: true,
      public_subject_id: "userPerformanceTest-eQqk",
    },
    mfaMethods: [
      {
        mfaIdentifier: "0",
        priorityIdentifier: "DEFAULT",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "07123456789",
        },
        methodVerified: true,
      },
    ],
    otpNotification: {
      success: true,
    },
    passkeys: somePasskeys,
  },
  permanentlySuspended: {
    httpResponse: {
      code: 200,
      message: "OK",
    },
    userinfo: {
      sub: "urn:fdc:gov.uk:default",
      email: "your.name@example.com",
      email_verified: true,
      phone_number: "1234567890",
      phone_number_verified: true,
      public_subject_id: "default",
    },
    mfaMethods: [
      {
        mfaIdentifier: "0",
        priorityIdentifier: "DEFAULT",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "07123456789",
        },
        methodVerified: true,
      },
    ],
    otpNotification: {
      success: true,
    },
    interventions: {
      suspended: false,
      blocked: true,
    },
    passkeys: somePasskeys,
  },
  temporarilySuspended: {
    httpResponse: {
      code: 200,
      message: "OK",
    },
    userinfo: {
      sub: "urn:fdc:gov.uk:default",
      email: "your.name@example.com",
      email_verified: true,
      phone_number: "1234567890",
      phone_number_verified: true,
      public_subject_id: "default",
    },
    mfaMethods: [
      {
        mfaIdentifier: "0",
        priorityIdentifier: "DEFAULT",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "07123456789",
        },
        methodVerified: true,
      },
    ],
    otpNotification: {
      success: true,
    },
    interventions: {
      suspended: true,
      blocked: false,
    },
    passkeys: somePasskeys,
  },
  suspendedAndBlocked: {
    httpResponse: {
      code: 200,
      message: "OK",
    },
    userinfo: {
      sub: "urn:fdc:gov.uk:default",
      email: "your.name@example.com",
      email_verified: true,
      phone_number: "1234567890",
      phone_number_verified: true,
      public_subject_id: "default",
    },
    mfaMethods: [
      {
        mfaIdentifier: "0",
        priorityIdentifier: "DEFAULT",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "07123456789",
        },
        methodVerified: true,
      },
    ],
    otpNotification: {
      success: true,
    },
    interventions: {
      suspended: true,
      blocked: true,
    },
    passkeys: somePasskeys,
  },
  unsignedUserInfo: {
    userInfoSigned: {
      isSigned: false,
    },
    passkeys: somePasskeys,
  },
  noPasskeys: {
    httpResponse: {
      code: 200,
      message: "OK",
    },
    userInfoSigned: {
      isSigned: false,
    },
    userinfo: {
      sub: "urn:fdc:gov.uk:default",
      email: "your.name@example.com",
      email_verified: true,
      phone_number: "1234567890",
      phone_number_verified: true,
      public_subject_id: "default",
    },
    mfaMethods: [
      {
        mfaIdentifier: "0",
        priorityIdentifier: "DEFAULT",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "07123456789",
        },
        methodVerified: true,
      },
    ],
    otpNotification: {
      success: true,
    },
    passkeys: [],
  },
  fourPasskeys: {
    httpResponse: {
      code: 200,
      message: "OK",
    },
    userInfoSigned: {
      isSigned: false,
    },
    userinfo: {
      sub: "urn:fdc:gov.uk:default",
      email: "your.name@example.com",
      email_verified: true,
      phone_number: "1234567890",
      phone_number_verified: true,
      public_subject_id: "default",
    },
    mfaMethods: [
      {
        mfaIdentifier: "0",
        priorityIdentifier: "DEFAULT",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "07123456789",
        },
        methodVerified: true,
      },
    ],
    otpNotification: {
      success: true,
    },
    passkeys: [
      ...somePasskeys,
      {
        credential: "fake-credential-3",
        id: "7b83b06f-f5a7-495b-9f1c-5485c66b19ee",
        aaguid: "ea9b8d66-4d01-1d21-3ce4-b6b48cb575d4",
        isAttested: false,
        signCount: 0,
        transports: ["internal"],
        isBackUpEligible: true,
        isBackedUp: true,
        createdAt: "2025-12-19T12:32:19.341Z",
        lastUsedAt: "2025-12-25T08:14:00.341Z",
      },
      {
        credential: "fake-credential-4",
        id: "2250f2de-2add-4d2d-bb0c-4e67f2a7d4bf",
        aaguid: "00000000-0000-0000-0000-000000000000",
        isAttested: false,
        signCount: 0,
        transports: ["internal"],
        isBackUpEligible: true,
        isBackedUp: true,
        createdAt: "2025-11-05T05:09:01.341Z",
        lastUsedAt: "2025-11-11T23:56:58.341Z",
      },
    ],
  },
};
