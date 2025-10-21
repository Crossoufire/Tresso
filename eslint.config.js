import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactPlugin from "@eslint-react/eslint-plugin";
import reactCompiler from "eslint-plugin-react-compiler";
import tanstackQuery from "@tanstack/eslint-plugin-query";
import tanstackRouter from "@tanstack/eslint-plugin-router";


export default [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        plugins: {
            "react-hooks": reactHooks,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
        },
    },
    reactPlugin.configs.recommended,
    {
        plugins: {
            "react-compiler": reactCompiler,
        },
        rules: {
            "@eslint-react/dom/no-flush-sync": "off",
            "@eslint-react/naming-convention/use-state": "off",
        },
    },
    ...tanstackQuery.configs["flat/recommended"],
    ...tanstackRouter.configs["flat/recommended"],
    {
        files: ["**/*.{js,jsx,ts,tsx}"],
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@eslint-react/no-unstable-context-value": "off",
        },
    },
    {
        files: ["*.config.cjs", "*.config.js", "*.config.mjs"],
        languageOptions: {
            env: {
                node: true,
            },
        },
    },
    {
        ignores: [
            "dist/**",
            "build/**",
            "node_modules/**",
            "*.config.js",
        ],
    },
];
