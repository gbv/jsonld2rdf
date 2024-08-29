import js from "@eslint/js"
import globals from "globals"

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.mocha,
      },
    },
    rules: {
      indent: [ "error", 2, { SwitchCase: 1 } ],
      "linebreak-style": [ "error", "unix" ],
      quotes: [ "error", "double" ],
      "quote-props": [ "error", "as-needed" ],
      "comma-dangle": [ "error", "always-multiline" ],
      semi: [ "error", "never" ],
    },
  },
]
