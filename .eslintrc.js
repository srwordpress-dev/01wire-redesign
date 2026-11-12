module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "prettier",
  ],
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react", "react-hooks", "@typescript-eslint", "import", "prettier"],
  rules: {
    "react/prop-types": "off",
    "no-shadow": "off",
    "react/no-unescaped-entities": "off",
    "react/jsx-props-no-spreading": "off",
    "react/react-in-jsx-scope": "off",
    "react/require-default-props": "off",
    "no-param-reassign": "off",
    "jsx-a11y/alt-text": "off",
    "react/display-name": "off",
    "@typescript-eslint/ban-types": [
      "error",
      {
        types: {
          String: false,
          Boolean: false,
          Number: false,
          Symbol: false,
          "{}": false,
          Object: false,
          object: false,
          Function: false,
        },
        extendDefaults: true,
      },
    ],
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "import/extensions": [
      "error",
      "ignorePackages",
      { js: "never", jsx: "never", ts: "never", tsx: "never" },
    ],
    "react/jsx-filename-extension": ["warn", { extensions: [".js",".tsx",".jsx"] }],
  },
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      typescript: {},
    },
  },
};
