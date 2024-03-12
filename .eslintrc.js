module.exports = {
    extends: [
        "airbnb-base",
        "airbnb-typescript",
        "plugin:prettier/recommended",
        "eslint:recommended",
        "prettier"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "sourceType": "module",
        "tsconfigRootDir": __dirname,
        "project": ["./tsconfig.json"]
    },
    "plugins": [
        "@typescript-eslint",
    ],
    "rules": {
        "no-param-reassign": "off",
        "import/no-cycle": "off",
        "react/jsx-filename-extension": "off",
        "linebreak-style": 0,
        "no-underscore-dangle": 0,
        "no-restricted-syntax": 0,
        "no-await-in-loop": 0,
        "consistent-return": 0,
        "no-continue": 0,
        "class-methods-use-this": "off",
        "import/prefer-default-export": "off",
        "no-useless-constructor": "off",
        "no-empty-function": "off",
        "no-unused-vars": [
            "error",
            {
                "args": "none"
            }
        ],
        "import/extensions": [
            "error",
            "ignorePackages",
            {
                "js": "never",
                "jsx": "never",
                "ts": "never",
                "tsx": "never"
            }
        ]
    },
    "settings": {
        "import/parsers": {
            "@typescript-eslint/parser": [".ts", ".tsx"]
        },
        "import/resolver": {
            "typescript": {
                "alwaysTryTypes": true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
                "project": "./tsconfig.json"
            }
        }
    }
}