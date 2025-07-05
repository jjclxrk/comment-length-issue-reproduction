import commentLength from "eslint-plugin-comment-length";
import tsParser from "@typescript-eslint/parser";

export default [
  commentLength.configs["flat/recommended"],
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
  },
]