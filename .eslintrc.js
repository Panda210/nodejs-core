module.exports = {
  "extends": "eslint:recommended",
  "env": {
    "browser": false,
    "es6": true,
    "node": true
  },
  "parser": "babel-eslint",
  "rules": {
    "object-curly-spacing": [2, "always"],
    "strict": 0,
    "quotes": [2, "single", "avoid-escape"],
    "semi": [2, "always"],
    "space-before-function-paren": [2, "always"],
    "keyword-spacing": [2, {"before": true, "after": true}],
    "space-infix-ops": 2,
    "spaced-comment": [2, "always"],
    "arrow-spacing": 2,
    "no-console": 0
  },
  "globals": {
  }
};