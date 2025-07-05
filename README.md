# types exports results in `noUnusedParameters` type-checking errors

Version: eslint-plugin-comment-length@2.2.1

## Problem

This plugin exports its type definitions as a regular typescript file (`.ts`
extension) instead of a compiled declaration file (`.d.ts` extension):

https://github.com/lasselupe33/eslint-plugin-comment-length/blob/master/rules/package.json#L11

This means that enabling `skipLibCheck` in the `tsconfig.json` for another
package with `eslint-plugin-comment-length` as a dependency can't be used to
prevent the compiler typechecking the plugin package. This is an issue because
there is a function defined in that package which doesn't make use of all of its
provided arguments, meaning that if we enable the `noUnusedParameters` compiler
option in a package which imports `eslint-plugin-comment-length` running `tsc`
will fail.

## Reproduction

A reproduction of the issue is available at https://github.com/jjclxrk/comment-length-issue-reproduction

1. Set up a project with compiler options in `tsconfig.json` as follows:

```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "allowJs": true,
    "noUnusedParameters": true,
    "skipLibCheck": true,
    /* ... */
  }
}
```

2. Import the plugin in your ESLint config:

```js
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
```

3. Run the TypeScript compiler:

```bash
npx tsc # or `npm run build` in the reproduction repo
```

### Actual Error

```
node_modules/eslint-plugin-comment-length/src/rules/limit-multi-line-comments/detect.overflow.ts(9,3): error TS6133: 'ruleContext' is declared but its value is never read.
```

The unused parameter is declared here:

```ts
export function detectOverflowInMultilineBlocks(
  ruleContext: RuleContext<string, unknown[]>,
  context: Context,
  blocks: MultilineBlock[],
) { ... }
```

## Expected Behaviour

The plugin should ship only `.d.ts` declaration files for its types so
projects making use of this plugin can skip type-checking them via `skipLibCheck`.

## Proposed Solutions

1. **Publish `.d.ts` declarations**: Configure the build to emit type declarations and update the `types` field in `package.json` to point at `lib/index.d.ts`, removing the `.ts` source from `exports.types`.
2. **Remove or rename unused parameters**: Eliminate or rename the unused `ruleContext` parameter (e.g. to `_ruleContext`) so `noUnusedParameters` checks do not fail.
