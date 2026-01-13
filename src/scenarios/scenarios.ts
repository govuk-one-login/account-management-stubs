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
    userInfoSigned: {
      isSigned: true,
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
  },
  unsignedUserInfo: {
    userInfoSigned: {
      isSigned: false,
    },
  },
};
