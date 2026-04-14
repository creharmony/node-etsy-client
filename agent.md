# node-etsy-client — LLM Agent Instructions

## Project Context

**node-etsy-client** is a Node.js REST API client for Etsy API V3, providing both JavaScript and TypeScript support.

- **Purpose**: Query Etsy shop data (listings, sections, images) and manage OAuth2 workflows
- **Main Components**:
  - `EtsyClientV3`: Core client (apiKey auth + OAuth2 flows)
  - `OAuth2Service`: Handles OAuth2 token management, refresh, and callback flows
  - `CommonsUtils`: Utility functions (isSet checks, logging helpers)
- **Type System**: Native ES modules (`"type": "module"` in package.json), dual `.js` + `.d.ts` files
- **Exported**: Main entry point is `lib/export.js` (transpiled dist)

## Code Conventions

### Language & Style
- **All code, commit messages, documentation**: English only
- **File encoding**: UTF-8, no BOM
- **Module format**: ES6 modules (import/export)
- **Linting**: ESLint (.eslintrc), JSHint (.jshintrc) enabled
- **Case conventions**:
  - Classes: PascalCase (`EtsyClientV3`, `OAuth2Service`)
  - Methods/functions: camelCase
  - Constants: UPPER_SNAKE_CASE
  - Private methods: prefix with `_` (convention, not enforced)

### Documentation
- Use self-documenting code: clear method names, inline comments for complex logic only
- No redundant JSDoc; add brief 1–2 line doc only when non-obvious or exotic behavior is involved
- Each method should clarify: parameters, return type, side effects

### Testing
- **Framework**: Mocha 11.3.0+ (latest stable)
- **Assertion**: Chai
- **Coverage**: c8 (configured in `.c8rc`)
- **Test location**: `tests/v3/*.test.js`, `tests/mytest.js`
- **Run**: `pnpm run test` (all V3 tests), `pnpm run simpleTest` (mytest.js)
- **Manual/WIP tests**: `tests/manual/*.test.js` (not in CI by default)

## Security & Dependencies

### Audit Status
- **Target**: `pnpm audit` = 0 vulnerabilities
- cf package.json for dependencies

## Directory Structure

```
src/
  ├── EtsyClientV3.{js,d.ts}  # Main Etsy API client
  ├── OAuth2Service.{js,d.ts} # OAuth2 token management
  ├── commonsUtils.js         # Shared utility functions
  └── sample/
      └── oauth.js            # Manual OAuth2 workflow example

lib/
  ├── export.{js,d.ts}        # Dist entry point (compiled from src/)

tests/
  ├── v3/
  │   ├── authenticated_client.test.js
  │   ├── unauthenticated_client.test.js
  │   └── manual_oauth_client.tst.js
  ├── mytest.js               # Basic test suite
  └── manual/                 # WIP/manual tests (not in CI)

client-sample/
  └── typescript-client/      # Example TypeScript consumer
```

## Git & Release Workflow

### Commit Message Format
All commits must be in **English** following Conventional Commits:
```
type(scope): short description

[optional body]

[optional footer: Closes #123, Fixes #456]
```

**Types**: fix, feat, docs, test, refactor, chore, perf, security  
**Scope examples**: oauth, audit, types, tests

### Examples
```bash
git commit -m "fix(security): serialize-javascript override to close npm audit (#84)"
git commit -m "feat(oauth): add token expiry refresh callback support"
git commit -m "docs: update OAuth2 setup guide"
```

## Environment & Setup

- **Node versions tested**: See GitHub Actions in `.github/workflows/`
- **Env vars** (optional):
  - `ETSY_SILENT_API_KEY_WARNING`: Suppress warnings if "true" or "1"
  - `ETSY_*`: API credentials for manual tests (see `env/initEnv.example.sh`)
- **OAuth2 flow**: Requires `callbackURL` matching Etsy app registration

## LLM Agent Guidelines

1. **Prefer MCP IntelliJ** for file edits (JSON/package.json restrictions)
2. **Read before editing**: Always read full context; trace imports/exports
3. **Auto-doc rule**: If code is clear, don't force docs; use inline comments sparingly
4. **Test after change**: Run `pnpm run simpleTest` or `source ./env/initEnv.dontpush.sh && pnpm run test` before confirming
5. **English-only**: Code, commits, meaningful comments in English
6. **Security-first**: Any dependency change must be validated with `pnpm audit`

