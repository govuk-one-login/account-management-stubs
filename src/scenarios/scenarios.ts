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
        priorityIdentifier: "DEFAULT",
        method: {
        mfaMethodType: "SMS",
        endPoint: "07123456789",
        },
        methodVerified: true,
      },
    ],
  },
  userDEFAULTAuthApp: {
    mfaMethods: [
      {
        mfaIdentifier: 1,
        priorityIdentifier: "DEFAULT",
        method: {
          mfaMethodType: "AUTH_APP",
        },
        methodVerified: true,
      },
    ],
  },
  userDEFAULTSms: {
    mfaMethods: [
      {
        mfaIdentifier: 1,
        priorityIdentifier: "DEFAULT",
        method: {
          mfaMethodType: "SMS",
          endPoint: "0123456789",
        },
        methodVerified: true,
      },
    ],
  },
  userDEFAULTSmsBackupAuthApp: {
    mfaMethods: [
      {
        mfaIdentifier: 1,
        priorityIdentifier: "DEFAULT",
        method: {
          mfaMethodType: "SMS",
          endPoint: "0123456789",
        },
        methodVerified: true,
      },
      {
        mfaIdentifier: 2,
        priorityIdentifier: "BACKUP",
        method: {
          mfaMethodType: "AUTH_APP",
        },
        methodVerified: true,
      },
    ],
  },
  userDEFAULTAuthAppBackupSms: {
    mfaMethods: [
      {
        mfaIdentifier: 1,
        priorityIdentifier: "DEFAULT",
        method: {
          mfaMethodType: "AUTH_APP",
        },
        methodVerified: true,
      },
      {
        mfaIdentifier: 2,
        priorityIdentifier: "BACKUP",
        method: {
          mfaMethodType: "SMS",
          endPoint: "0123456789",
		    },
        methodVerified: true,
      },
    ],
  },
  userDEFAULTSmsBackupSms: {
    mfaMethods: [
      {
        mfaIdentifier: 1,
        priorityIdentifier: "DEFAULT",
        method: {
          mfaMethodType: "SMS",
          endPoint: "0123456789",
		    },
        methodVerified: true,
      },
      {
        mfaIdentifier: 2,
        priorityIdentifier: "BACKUP",
        method: {
          mfaMethodType: "SMS",
          endPoint: "99940850934",
        },
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
        priorityIdentifier: "DEFAULT",
        method: {
          mfaMethodType: "SMS",
          endPoint: "99940850934",
        },
        methodVerified: true,
      },
      {
        mfaIdentifier: 2,
        priorityIdentifier: "BACKUP",
        method: {
          mfaMethodType: "SMS",
          endPoint: "99940850934",
        },
        methodVerified: true,
      },
      {
        mfaIdentifier: 3,
        priorityIdentifier: "BACKUP",
        method: {
          mfaMethodType: "SMS",
          endPoint: "99940850934",
        },
        methodVerified: true,
      },
    ],
  },
  errorNoDEFAULTMethod: {
    mfaMethods: [
      {
        mfaIdentifier: 2,
        priorityIdentifier: "BACKUP",
        method: {
          mfaMethodType: "SMS",
          endPoint: "99940850934",
        },
        methodVerified: true,
      },
      {
        mfaIdentifier: 3,
        priorityIdentifier: "BACKUP",
        method: {
          mfaMethodType: "SMS",
          endPoint: "99940850934",
        },
        methodVerified: true,
      },
    ],
  },
  errorMultipleDEFAULTMethods: {
    mfaMethods: [
      {
        mfaIdentifier: 2,
        priorityIdentifier: "DEFAULT",
        method: {
          mfaMethodType: "SMS",
          endPoint: "99940850934",
        },
        methodVerified: true,
      },
      {
        mfaIdentifier: 3,
        priorityIdentifier: "DEFAULT",
        method: {
          mfaMethodType: "SMS",
          endPoint: "99940850934",
        },
        methodVerified: true,
      },
    ],
  },
  errorMultipleAuthAppMethods: {
    mfaMethods: [
      {
        mfaIdentifier: 1,
        priorityIdentifier: "DEFAULT",
        method: {
          mfaMethodType: "AUTH_APP",
        },
        methodVerified: true,
      },
      {
        mfaIdentifier: 2,
        priorityIdentifier: "BACKUP",
        method: {
          mfaMethodType: "AUTH_APP",
        },
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
        priorityIdentifier: "DEFAULT",
        method: {
          mfaMethodType: "SMS",
          endPoint: "0123456789",
        },
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
        priorityIdentifier: "DEFAULT",
        method: {
          mfaMethodType: "SMS",
          endPoint: "0123456789",
        },
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
        priorityIdentifier: "DEFAULT",
        method: {
          mfaMethodType: "SMS",
          endPoint: "0123456789",
		    },
        methodVerified: true,
      },
    ],
  },
};
