#!/usr/bin/env node
const { spawnSync } = require("child_process");
const path = require("path");

const repoRoot = process.cwd();
const frontendRoot = path.resolve(repoRoot, "frontend");

const files = process.argv
  .slice(2)
  .map((filePath) => {
    const absolutePath = path.resolve(repoRoot, filePath);
    const relativeToFrontend = path.relative(frontendRoot, absolutePath);
    if (relativeToFrontend.startsWith("..") || path.isAbsolute(relativeToFrontend)) {
      return null;
    }

    return relativeToFrontend.replace(/\\/g, "/");
  })
  .filter(Boolean);

if (files.length === 0) {
  process.exit(0);
}

const npmExecPath = process.env.npm_execpath;

let result;
if (npmExecPath) {
  result = spawnSync(
    process.execPath,
    [
      npmExecPath,
      "exec",
      "--workspace",
      "frontend",
      "--",
      "eslint",
      "--max-warnings=60",
      "--fix",
      ...files,
    ],
    {
      stdio: "inherit",
      cwd: repoRoot,
    }
  );
} else {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  result = spawnSync(
    npmCommand,
    ["exec", "--workspace", "frontend", "--", "eslint", "--max-warnings=999", "--fix", ...files],
    {
      stdio: "inherit",
      shell: true,
      cwd: repoRoot,
    }
  );
}

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
