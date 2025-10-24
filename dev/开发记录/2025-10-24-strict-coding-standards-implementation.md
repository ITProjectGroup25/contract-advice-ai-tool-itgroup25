# Strict Coding Standards Implementation

**Date**: 2025-10-24  
**Task**: Upgrade coding standards to Level 4 (Rigorous Enforcement)

## Objective

Upgrade the project's coding standards from Level 3 (sometimes enforced) to Level 4 (rigorously enforced) with zero tolerance for violations.

## Changes Made

### 1. Frontend Package Configuration

**File**: `frontend/package.json`

**Change**: Updated ESLint command to enforce zero warnings

```diff
- "lint": "next lint --max-warnings=50",
+ "lint": "next lint --max-warnings=0",
```

**Impact**: Frontend lint checks now fail if ANY warnings exist.

### 2. Lint Staged Script

**File**: `scripts/lint-frontend-staged.js`

**Changes**: Updated both max-warnings settings to zero

```diff
- "--max-warnings=50",
+ "--max-warnings=0",

- ["exec", "--workspace", "frontend", "--", "eslint", "--max-warnings=999", "--fix", ...files],
+ ["exec", "--workspace", "frontend", "--", "eslint", "--max-warnings=0", "--fix", ...files],
```

**Impact**: Pre-commit hook now enforces zero warnings policy.

### 3. ESLint Configuration

**File**: `frontend/.eslintrc.json`

**Changes**: Upgraded critical rules from "warn" to "error"

```diff
- "@typescript-eslint/ban-types": "warn",
+ "@typescript-eslint/ban-types": "error",

- "@typescript-eslint/no-unused-vars": ["warn", ...],
+ "@typescript-eslint/no-unused-vars": ["error", ...],

- "import/order": ["warn", ...],
+ "import/order": ["error", ...],

- "react-hooks/exhaustive-deps": "warn",
+ "react-hooks/exhaustive-deps": "error",

- "jsx-a11y/anchor-has-content": "warn",
- "jsx-a11y/click-events-have-key-events": "warn",
- "jsx-a11y/label-has-associated-control": "warn",
- "jsx-a11y/no-autofocus": "warn",
- "jsx-a11y/no-static-element-interactions": "warn",
+ "jsx-a11y/anchor-has-content": "error",
+ "jsx-a11y/click-events-have-key-events": "error",
+ "jsx-a11y/label-has-associated-control": "error",
+ "jsx-a11y/no-autofocus": "error",
+ "jsx-a11y/no-static-element-interactions": "error",
```

**Impact**: All these violations now block commits and CI builds.

### 4. Documentation

**File**: `dev/开发记录/2025-10-24-coding-standards.md`

Created comprehensive documentation covering:
- Code quality tools and their purposes
- Configuration details for each tool
- Git hooks (pre-commit, pre-push)
- CI/CD automated checks
- Developer workflow and testing procedures
- Common issues and fixes
- Zero tolerance enforcement rules

## Enforcement Levels

### Before (Level 3)

- Max warnings: 50 in staging, 999 in some paths
- Rules: Mostly "warn" (non-blocking)
- Policy: Flexible, allows violations

### After (Level 4)

- Max warnings: 0 everywhere
- Rules: Critical rules upgraded to "error" (blocking)
- Policy: Zero tolerance

## Testing Requirements

### Before Commit

Run: `npm run check`

This executes:
1. `npm run format:check` - Check code formatting
2. `npm run lint` - ESLint with zero warnings
3. `npm run typecheck` - TypeScript type checking

**All must pass with exit code 0.**

### Auto-Fix Available

```bash
# Fix formatting
npm run format

# Fix auto-fixable ESLint issues
npm run lint --workspace frontend -- --fix
```

### Manual Fixes Required

Some issues require manual intervention:
- Unused variables: Remove or prefix with underscore
- Type errors: Add proper type annotations
- Accessibility issues: Fix markup and attributes
- React hooks dependencies: Add missing dependencies

## Git Workflow Enforcement

### Pre-commit Hook

Location: `.husky/pre-commit`

Runs: `npx lint-staged`

Actions:
- Auto-format with Prettier
- Run ESLint with auto-fix on staged files
- Block commit if errors remain

### Pre-push Hook

Location: `.husky/pre-push`

Runs: `npm run check`

Actions:
- Check formatting (all files)
- Run ESLint (all files, zero warnings)
- Run TypeScript type check (all workspaces)
- Block push if any check fails

### CI Pipeline

Location: `.github/workflows/frontend-ci.yml`

Runs on:
- Every push to any branch
- Every pull request

Steps:
1. Format check (Prettier)
2. Lint check (ESLint, zero warnings)
3. Type check (TypeScript)
4. Build check (Next.js)

**All steps must pass to merge PR.**

## Current Status

**Level**: 4 - Rigorous Enforcement

**Evidence**:
- Standards are clearly defined in documentation
- Zero tolerance policy implemented (max-warnings=0)
- Critical ESLint rules upgraded to "error"
- Automated enforcement at multiple checkpoints:
  - Pre-commit: Auto-fix and block on errors
  - Pre-push: Full check suite, block on any failure
  - CI: Complete validation, block PR merge on failure
- Developer testing procedures documented
- Common issues and fixes provided

## Next Steps for Developers

1. **Pull latest changes**: `git pull`
2. **Review documentation**: Read `dev/开发记录/2025-10-24-coding-standards.md`
3. **Test current codebase**: Run `npm run check`
4. **Fix any violations**:
   - Auto-fix: `npm run format && npm run lint --workspace frontend -- --fix`
   - Manual fixes: Follow error messages and documentation
5. **Verify**: Run `npm run check` again until all pass
6. **Commit and push**: Hooks will enforce standards

## Breaking Changes

This is a BREAKING CHANGE for development workflow:

- Code that previously passed with warnings will now FAIL
- Commits will be BLOCKED if unfixable errors exist
- Pushes will be BLOCKED if any check fails
- CI will FAIL and block PR merges on violations

**Action Required**: All developers must fix existing violations before they can commit/push.

## Benefits

1. **Code Quality**: Higher quality, more maintainable code
2. **Consistency**: Uniform code style across the entire project
3. **Early Detection**: Catch errors before they reach production
4. **Team Alignment**: Clear expectations for all developers
5. **Professional Standards**: Industry-standard best practices

## Rollback Instructions

If needed to rollback (not recommended):

1. Revert changes to `frontend/package.json` (set max-warnings=50)
2. Revert changes to `scripts/lint-frontend-staged.js` (restore original values)
3. Revert changes to `frontend/.eslintrc.json` (change "error" back to "warn")

## Support

For questions or issues:
- Review documentation in `dev/开发记录/2025-10-24-coding-standards.md`
- Check common issues section
- Run `npm run check` to see specific violations
- Fix issues one at a time, test frequently

## Conclusion

The project now meets the criteria for Level 4: "Coding standards are defined and rigorously enforced."

All code contributions must comply with the strict standards to be accepted into the repository.
