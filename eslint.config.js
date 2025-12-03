import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

export default [
    {
        ignores: ["dist", "dist-electron", "release", "node_modules", ".eslintrc.cjs"],
    },
    {
        files: ["**/*.{ts,tsx,js,jsx}"],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: "module",
            parser: typescriptParser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2020,
            },
        },
        plugins: {
            "@typescript-eslint": typescript,
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...typescript.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
            "@typescript-eslint/no-explicit-any": "warn",
        },
    },
];
