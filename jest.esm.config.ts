// jest.esm.config.ts
import baseConfig from "./jest.config"; // Import your main settings

export default {
  ...baseConfig,
  testMatch: ["**/src/tests/oidc/authorize.test.ts"], // ONLY run this file
  testPathIgnorePatterns: ["/node_modules/"], // Remove the ignore for this file
};
