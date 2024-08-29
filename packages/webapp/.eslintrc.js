{
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
        "src/lib/server/route-helpers.ts"
      ],
      "rules": {
        "no-restricted-syntax": "off"
      }
    }
  ]
}