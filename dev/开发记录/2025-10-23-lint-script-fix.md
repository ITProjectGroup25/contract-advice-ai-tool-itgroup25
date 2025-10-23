# Lint Script Error Handling Fix

## Date
2025-10-23

## Issue
The `scripts/lint-frontend-staged.js` script had several problems with error handling and robustness:

1. **Inadequate exit code handling**: Used `result.status ?? 1` which could lead to incorrect exit behavior
2. **Missing working directory**: No `cwd` parameter specified for spawn commands
3. **Insufficient error logging**: Error messages lacked context for debugging
4. **Ambiguous error conditions**: Didn't distinguish between spawn errors and ESLint failures

## Changes Made

### 1. Added explicit `cwd` parameter
- Added `cwd: repoRoot` to both `spawnSync` calls (lines 44, 55)
- Ensures commands always run from the correct working directory

### 2. Improved error handling logic
Replaced the simple error check:
```javascript
if (result.error) {
  console.error(result.error);
}
process.exit(result.status ?? 1);
```

With comprehensive error handling:
```javascript
// Handle errors from spawn itself (e.g., command not found)
if (result.error) {
  console.error("\n[lint-frontend-staged] Failed to execute ESLint:");
  console.error(result.error);
  process.exit(1);
}

// Handle non-zero exit status from ESLint
if (result.status !== 0) {
  console.error(`\n[lint-frontend-staged] ESLint failed with exit code ${result.status}`);
  process.exit(result.status);
}

// Success
process.exit(0);
```

### 3. Enhanced error messages
- Added prefix `[lint-frontend-staged]` to all error messages
- Separated spawn errors from ESLint execution errors
- Added explicit exit code reporting

## Benefits
- More reliable execution regardless of where the script is invoked from
- Clearer error messages for debugging
- Proper exit code propagation for CI/CD pipelines
- Better distinction between different failure modes

## Files Modified
- `scripts/lint-frontend-staged.js`
- `.gitignore` (allowed `dev/开发记录/` folder to be tracked)

## Testing
The script should now:
- Always run ESLint from the correct directory
- Properly report spawn failures (e.g., npm not found)
- Properly report ESLint failures with exit codes
- Exit with code 0 only on success
