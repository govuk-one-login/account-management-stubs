import { UserScenarios } from "./scenarios.interfaces";

export const ERROR_CODES = {
  NEW_PASSWORD_SAME_AS_EXISTING: 1024,
  PASSWORD_IS_COMMON: 1040,
  NEW_PHONE_NUMBER_SAME_AS_EXISTING: 1044,
};

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
  },
  methodManagementDev: {
    userinfo: {
      sub: "F5CE808F-75AB-4ECD-BBFC-FF9DBF5330FA",
      email: "your.name@example.com",
      email_verified: true,
      phone_number: "1234567890",
      phone_number_verified: true,
      public_subject_id: "ooVD4Sm9oPoZTHdY6ekyoexHDb_AoN4uDd7uHH-eQqk",
    },
  },
  userDEFAULTAuthApp: {
    userinfo: {
      sub: "F5CE808F-75AB-4ECD-BBFC-FF9DBF5330FA",
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
  },
  userDEFAULTSms: {
    userinfo: {
      sub: "F5CE808F-75AB-4ECD-BBFC-FF9DBF5330FA",
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
  },
  userDEFAULTSmsBackupAuthApp: {
    userinfo: {
      sub: "F5CE808F-75AB-4ECD-BBFC-FF9DBF5330FA",
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
  },
  userDEFAULTAuthAppBackupSms: {
    userinfo: {
      sub: "F5CE808F-75AB-4ECD-BBFC-FF9DBF5330FA",
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
  },
  userDEFAULTSmsBackupSms: {
    userinfo: {
      sub: "F5CE808F-75AB-4ECD-BBFC-FF9DBF5330FA",
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
  },
  userNewPhoneNumberSameAsExisting: {
    userinfo: {
      sub: "F5CE808F-75AB-4ECD-BBFC-FF9DBF5330FA",
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
  },
  userOtpCodeWrong: {
    userinfo: {
      sub: "F5CE808F-75AB-4ECD-BBFC-FF9DBF5330FA",
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
  },
  errorNoMfaMethods: {
    userinfo: {
      sub: "F5CE808F-75AB-4ECD-BBFC-FF9DBF5330FA",
      email: "your.name@example.com",
      email_verified: true,
      phone_number: "1234567890",
      phone_number_verified: true,
      public_subject_id: "errorNoMfaMethods",
    },
    mfaMethods: [],
  },
  errorMoreThanTwoMethods: {
    userinfo: {
      sub: "F5CE808F-75AB-4ECD-BBFC-FF9DBF5330FA",
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
  },
  errorNoDEFAULTMethod: {
    userinfo: {
      sub: "F5CE808F-75AB-4ECD-BBFC-FF9DBF5330FA",
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
  },
  errorMultipleDEFAULTMethods: {
    userinfo: {
      sub: "F5CE808F-75AB-4ECD-BBFC-FF9DBF5330FA",
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
  },
  errorMultipleAuthAppMethods: {
    userinfo: {
      sub: "F5CE808F-75AB-4ECD-BBFC-FF9DBF5330FA",
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
  },
  errorMfa400: {
    userinfo: {
      sub: "F5CE808F-75AB-4ECD-BBFC-FF9DBF5330FA",
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
  },
  errorMfa404: {
    userinfo: {
      sub: "F5CE808F-75AB-4ECD-BBFC-FF9DBF5330FA",
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
  },
  errorMfa500: {
    userinfo: {
      sub: "F5CE808F-75AB-4ECD-BBFC-FF9DBF5330FA",
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
  },
  userPerformanceTest: {
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
  },
};
