---
globs: "**/*.js"
description: Coding standards for node-etsy-client repository based on legacy
  codebase analysis
alwaysApply: false
---

**Code Style**
- ES6+ modules (import/export)
- Classes for services (PascalCase)
- Private methods prefixed with `_` (e.g. `_assumeApiKey()`)
- Constants in SCREAMING_SNAKE_CASE
- Helper functions after `//~` comment separator

**Patterns**
- Environment variables with fallback defaults in constructor
- Options object pattern: merge with defaults via `getOptions()`
- Promise-based async APIs
- Static methods for utilities (e.g. `static _response()`)
- Debug mode via `DEBUG_NAME === "true"` or `"1"` env vars
- Dry mode pattern for testing without API calls
- Rate limiting wrapper via `limitedEtsyApiFetch()`

**Security**
- Hide sensitive data (API keys) in errors via `secureAttributeValue()`
- Use `**hidden**` placeholder for masked values

**Error Handling**
- Throw strings for validation errors (e.g. `throw "shopId is not defined"`)
- Promise reject with sanitized error objects

**Code Organization**
- Validation methods: `_assumeX()` pattern
- Keep utility files minimal (e.g. `commonsUtils.js`)
- Export classes via barrel file (`lib/export.js`)
- TypeScript definitions separate (`.d.ts` files)