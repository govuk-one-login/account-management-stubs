import { UserInfo } from "./models";
import { v4 as uuid } from "uuid";

export interface Response {
  statusCode: number;
  body: UserInfo;
}

const newUserInfo = (): UserInfo => ({
  sub: uuid(),
  email: "test@test.com",
  email_verified: true,
  phone: "1234567890",
  phone_verified: true,
  updated_at: Date.now().toString(),
});

export const handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify(newUserInfo()),
  };
};
