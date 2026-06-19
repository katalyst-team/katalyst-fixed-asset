import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

// Import ESLint plugins

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: ["next", "prettier", "plugin:@typescript-eslint/recommended"],
    // plugins: {
    //   "simple-import-sort": simpleImportSort,
    //   "sort-keys-fix": sortKeysFix,
    //   "unused-imports": unusedImports,
    // },
    parser: "@typescript-eslint/parser",
    plugins: [
      "simple-import-sort",
      "import",
      "unused-imports",
      "react",
      "react-hooks",
      "jsx-a11y",
      // "cypress",
      "sort-keys-fix",
      // "sonarjs",
      // "prettier"
    ],
    rules: {
      "@typescript-eslint/naming-convention": [
        "error",
        {
          format: ["camelCase"],
          leadingUnderscore: "require",
          modifiers: ["private"],
          selector: "memberLike",
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          vars: "all",
          varsIgnorePattern: "^_",
        },
      ],
      "max-lines": [
        "error",
        {
          max: 500,
          skipBlankLines: false,
          skipComments: false,
        },
      ],
      "no-inline-comments": "off",
      "no-unused-vars": "error",
      "react/display-name": "off",
      "react/function-component-definition": [
        "error",
        {
          namedComponents: ["function-declaration", "arrow-function"],
          unnamedComponents: "arrow-function",
        },
      ],
      "react/jsx-handler-names": [
        "error",
        {
          eventHandlerPrefix: "on",
          eventHandlerPropPrefix: "on",
        },
      ],
      "react/jsx-key": "warn",
      // "no-inline-functions": "error", // Changed to "error" (ESLint doesn't recognize "on")
      "react/jsx-max-props-per-line": [
        "error",
        {
          when: "multiline",
        },
      ],

      "react/jsx-pascal-case": "off",

      "react/jsx-sort-props": [
        "warn",
        {
          callbacksLast: true,
          ignoreCase: true,
          noSortAlphabetically: false,
          reservedFirst: true,
          shorthandFirst: true,
          shorthandLast: true,
        },
      ],

      "react/no-access-state-in-setstate": "warn",

      "react/no-unused-state": "warn",

      "react/prop-types": "off",

      semi: ["error"],

      "simple-import-sort/exports": ["error"],

      "simple-import-sort/imports": ["error"],
      "sort-keys-fix/sort-keys-fix": ["warn"],
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          vars: "all",
          varsIgnorePattern: "^_",
        },
      ],
    },
    settings: {
      next: {
        rootDir: "packages/my-app/",
      },
    },
  }),
];

export default eslintConfig;
