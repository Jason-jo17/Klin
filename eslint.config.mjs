import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

/**
 * Shared root config every app/template lints against via
 * `eslint . --config ../../eslint.config.mjs`. Deliberately lightweight
 * (no eslint-config-next — its FlatCompat shim collides with this
 * dependency set) but still catches real correctness issues: unused
 * vars/imports, React Hooks rule violations, and standard TS lint rules.
 */
export default tseslint.config(
  {
    ignores: ["**/.next/**", "**/dist/**", "**/node_modules/**", "**/.turbo/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "off",
      // build.md §10: "No eval, new Function, or dangerouslySetInnerHTML
      // anywhere outside @kiln/sandbox's iframe boundary" — enforced here,
      // not just by convention. @kiln/sandbox itself doesn't need any of
      // these (it renders untrusted HTML via the iframe `srcDoc` attribute,
      // never by injecting into the DOM), so no path is excluded.
      "no-restricted-syntax": [
        "error",
        { selector: "CallExpression[callee.name='eval']", message: "eval() is banned — see build.md §10 and docs/SECURITY.md." },
        { selector: "NewExpression[callee.name='Function']", message: "new Function(...) is banned — see build.md §10 and docs/SECURITY.md." },
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message: "dangerouslySetInnerHTML is banned — model output must go through @kiln/sandbox's iframe boundary, never straight into the DOM. See build.md §10.",
        },
      ],
    },
  },
  {
    files: ["**/*.config.{js,mjs,ts}", "**/next-env.d.ts"],
    rules: { "@typescript-eslint/no-unused-vars": "off" },
  },
);
