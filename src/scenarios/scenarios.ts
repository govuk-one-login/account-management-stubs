import assert from "node:assert/strict";

interface UserScenarios {
  [key: string]: {
    userinfo: {
      email: string;
      email_verified: boolean;
      sub: keyof UserScenarios;
      phone_number: string;
      phone_number_verified: boolean;
      updated_at: string;
    };
  };
}

type NestedKeys<T> = keyof T[keyof T];

const userScenarios: UserScenarios = {
  "F5CE808F-75AB-4ECD-BBFC-FF9DBF5330FA": {
    userinfo: {
      sub: "F5CE808F-75AB-4ECD-BBFC-FF9DBF5330FAs",
      email: "your.name@example.com",
      email_verified: true,
      phone_number: "1234567890",
      phone_number_verified: true,
      updated_at: Date.now().toString(),
    },
  },
  user1: {
    userinfo: {
      email: "user1@example.com",
      email_verified: true,
      sub: "user1",
      phone_number: "999",
      phone_number_verified: true,
      updated_at: Date.now().toString(),
    },
  },
};

const getUserScenario = (
  userId: keyof typeof userScenarios,
  scenario: NestedKeys<UserScenarios>
) => {
  assert(
    userScenarios[userId] && userScenarios[userId][scenario],
    `scenario "${scenario}" does not exist for user "${userId}"`
  );

  return userScenarios[userId][scenario];
};
export default getUserScenario;
