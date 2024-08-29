import globals from "globals";
import pluginJs from "@eslint/js";
import tsEslint from "typescript-eslint";
import tsEslintParser from "@typescript-eslint/parser";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  {files: ["**/*.{js,mjs,cjs,ts}"]},
  {languageOptions: { globals: globals.browser, parser: tsEslintParser }},
  pluginJs.configs.recommended,
  ...tsEslint.configs.recommended,
  ...tsEslint.configs.stylistic,
  {
    ignores: ["coverage", ".aws-sam/"]
  },
  {
    "rules": {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: true,
          caughtErrors: "none",
        },
      ],
    }
  },
  eslintConfigPrettier
];
