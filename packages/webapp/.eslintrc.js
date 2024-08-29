module.exports = {
  "extends": "next/core-web-vitals",
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "MemberExpression[object.name='process'][property.name='env']",
        "message": "Using process.env is not allowed, user serverEnv instead"
      }
    ]
  },
  "overrides": [
    {
      "files": [
        "src/lib/server/server-env.ts",
        //later we are going to move it to a separate package, with as minimal dependencies as possible
        "src/lib/server/route-helpers.ts"
      ],
      "rules": {
        "no-restricted-syntax": "off"
      }
    }
  ]
}