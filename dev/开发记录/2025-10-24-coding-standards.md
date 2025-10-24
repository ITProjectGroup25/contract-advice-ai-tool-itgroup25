# Project Coding Standards

**Status**: Rigorous Enforcement (Level 4)  
**Last Updated**: 2025-10-24  
**Version**: 1.0

## Overview

This document defines the mandatory coding standards for the Contract Advice AI Tool project. All code contributions MUST comply with these standards to pass automated checks and be merged into the repository.

## Code Quality Tools

### 1. Prettier (Code Formatting)

**Purpose**: Enforce consistent code formatting across the entire codebase.

**Configuration**: `.prettierrc.json`
- Semi-colons: Required
- Single quotes: No (use double quotes)
- Print width: 100 characters
- Tab width: 2 spaces
- Trailing commas: ES5 style
- Arrow function parens: Always
- End of line: LF (Unix style)
- TailwindCSS plugin: Enabled for automatic class sorting

**Files Checked**: `*.{js,jsx,ts,tsx,json,css,scss}`

### 2. ESLint (Code Quality)

**Purpose**: Enforce code quality rules, catch potential bugs, and ensure best practices.

**Configuration**: `frontend/.eslintrc.json`

**Extended Rulesets**:
- `next/core-web-vitals` - Next.js best practices
- `plugin:@typescript-eslint/recommended` - TypeScript standards
- `plugin:import/recommended` - Import/export best practices
- `plugin:import/typescript` - TypeScript import resolution
- `plugin:jsx-a11y/recommended` - Accessibility standards
- `prettier` - Prettier compatibility

**Plugins**:
- `@typescript-eslint` - TypeScript support
- `import` - Import/export validation
- `jsx-a11y` - Accessibility checks
- `unused-imports` - Detect unused imports

**Key Rules** (Strict Mode):
- TypeScript type safety
- Import ordering (alphabetical, grouped)
- Accessibility compliance
- React hooks best practices
- Zero unused variables/imports
- **Maximum warnings allowed**: 0 (zero tolerance)

### 3. TypeScript (Type Safety)

**Purpose**: Ensure type safety and catch type-related errors at compile time.

**Configuration**: `tsconfig.json` (per workspace)

**Requirements**:
- All TypeScript files must pass type checking
- No implicit `any` types (except where explicitly allowed)
- Strict mode enabled
- No type errors allowed in production code

### 4. Git Hooks (Husky + lint-staged)

**Purpose**: Enforce standards before code is committed or pushed.

#### Pre-commit Hook
**Triggered**: Before every commit  
**Actions**:
1. Run Prettier on staged files (auto-format)
2. Run ESLint on staged frontend files (auto-fix where possible)
3. **Block commit if unfixable errors exist**

**Configuration**: `.husky/pre-commit` + `lint-staged` in `package.json`

#### Pre-push Hook
**Triggered**: Before pushing to remote  
**Actions**:
1. Check code formatting (Prettier)
2. Run full ESLint check
3. Run TypeScript type checking on all workspaces
4. **Block push if any check fails**

**Configuration**: `.husky/pre-push` → runs `npm run check`

## Automated CI/CD Checks

### GitHub Actions Workflow

**File**: `.github/workflows/frontend-ci.yml`

**Triggers**: 
- Every push to any branch
- Every pull request

**Steps** (All Must Pass):
1. **Code Formatting Check**: `npm run format:check`
   - Verifies all files are properly formatted
   - Fails if any file is not formatted according to Prettier rules

2. **ESLint Check**: `npm run lint --workspace frontend`
   - Runs ESLint on all frontend code
   - **Maximum warnings: 0** (zero tolerance in strict mode)
   - Fails on any error or warning

3. **Type Check**: `npm run typecheck`
   - Checks TypeScript types across all workspaces
   - Fails on any type error

4. **Build Check**: `npm run build --workspace frontend`
   - Ensures code can be built successfully
   - Fails on build errors

**Result**: All checks must pass before code can be merged.

## How to Test Before Committing

### Option 1: Run Full Check Suite (Recommended)

```bash
npm run check
```

This runs:
- `npm run format:check` - Check formatting
- `npm run lint` - Check code quality
- `npm run typecheck` - Check types

**Expected Output**: All checks should pass with exit code 0.

### Option 2: Individual Checks

```bash
# Check formatting only
npm run format:check

# Fix formatting issues
npm run format

# Run ESLint
npm run lint

# Run TypeScript type check
npm run typecheck

# Build project
npm run build
```

### Option 3: Test Git Hooks Locally

```bash
# Test pre-commit hook
git add .
git commit -m "test commit"
# This will auto-format and lint staged files

# Test pre-push hook
git push
# This will run the full check suite
```

## Common Issues and Fixes

### 1. Formatting Errors

**Error**: "Code style issues found in the above file(s)."

**Fix**:
```bash
npm run format
```

### 2. ESLint Warnings/Errors

**Error**: ESLint warnings or errors reported

**Fix**:
```bash
# Auto-fix fixable issues
npm run lint --workspace frontend -- --fix

# For unfixable issues, manually correct the code
```

**Common ESLint Issues**:
- Unused variables: Remove or prefix with `_` (e.g., `_unusedVar`)
- Missing imports: Add required import statements
- Import order: Will be auto-fixed by ESLint

### 3. TypeScript Type Errors

**Error**: Type checking failed

**Fix**:
- Add proper type annotations
- Fix type mismatches
- Use type guards where necessary
- Avoid using `any` type

```bash
# Check types
npm run typecheck
```

### 4. Build Errors

**Error**: Build failed

**Fix**:
- Resolve all ESLint and TypeScript errors first
- Check for missing dependencies
- Verify environment variables are set

## Enforcement Rules

### Strict Mode (Current Configuration)

1. **Pre-commit**:
   - All staged files MUST be properly formatted
   - All staged files MUST pass ESLint checks
   - Commit is BLOCKED if standards are not met

2. **Pre-push**:
   - All files in the repository MUST pass format check
   - All files MUST pass ESLint (zero warnings/errors)
   - All TypeScript files MUST pass type checking
   - Push is BLOCKED if any check fails

3. **CI/CD (GitHub Actions)**:
   - All checks MUST pass on every push and PR
   - PR cannot be merged if CI fails
   - Deployment only happens after all checks pass

### Zero Tolerance Policy

- **Max warnings**: 0
- **Max errors**: 0
- **Type errors**: 0
- **Formatting violations**: 0

Any violation will prevent:
- Commit (for unfixable errors)
- Push (for any check failure)
- PR merge (for CI failure)

## Developer Workflow

### Before Starting Work

1. Pull latest changes: `git pull`
2. Install dependencies: `npm install`
3. Verify setup: `npm run check`

### During Development

1. Write code following standards
2. Save files (IDE should auto-format if configured)
3. Run checks frequently: `npm run check`
4. Fix issues as they appear

### Before Committing

1. Stage changes: `git add .`
2. Run full check: `npm run check`
3. Commit: `git commit -m "your message"`
   - Pre-commit hook will auto-format and check
4. If commit is blocked, fix errors and try again

### Before Pushing

1. Ensure all commits follow standards
2. Run: `npm run check` (pre-push hook will do this)
3. Push: `git push`
   - Pre-push hook will run full check suite
4. If push is blocked, fix all errors and try again

## IDE Integration (Recommended)

### VS Code

Install extensions:
- ESLint
- Prettier - Code formatter
- EditorConfig for VS Code

Configure settings (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

## Summary

**To pass all checks and successfully upload to GitHub:**

1. **Before commit**: Code must be formatted and pass ESLint auto-fix
2. **Before push**: Code must pass format check, ESLint (zero warnings), and TypeScript type check
3. **Before merge**: CI must pass all checks (formatting, linting, type checking, building)

**Quick Test Command**: `npm run check`

**Zero Tolerance**: No warnings, no errors, no exceptions.

## Resources

- [ESLint Documentation](https://eslint.org/)
- [Prettier Documentation](https://prettier.io/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Next.js ESLint](https://nextjs.org/docs/basic-features/eslint)
- [React Accessibility](https://reactjs.org/docs/accessibility.html)
