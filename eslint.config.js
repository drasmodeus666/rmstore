import { createRequire } from "module"
const require = createRequire(import.meta.url)

/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    "@next/next/no-img-element": "off",
    "react/no-unescaped-entities": "off",
    "@next/next/no-page-custom-font": "off",
    "react-hooks/exhaustive-deps": "warn",
    "no-unused-vars": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "off",
    "prefer-const": "warn",
  },
  ignorePatterns: ["node_modules/", ".next/", "out/", "build/", "dist/", "*.config.js", "*.config.ts"],
}
