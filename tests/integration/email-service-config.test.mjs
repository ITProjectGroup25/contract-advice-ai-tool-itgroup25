import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { readFileSync } from "node:fs";
import ts from "typescript";
import vm from "node:vm";

const emailServicePath = path.resolve(
  process.cwd(),
  "frontend/src/app/grant-support/_utils/emailService.ts"
);

function loadEmailService(overrides = {}) {
  const source = readFileSync(emailServicePath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: "emailService.ts",
  }).outputText;

  const apiModule = {
    fetchEmailConfig:
      overrides.fetchEmailConfig ??
      (async () => ({ configured: false, config: null })),
    saveEmailConfig:
      overrides.saveEmailConfig ??
      (async (config) => ({
        configured: true,
        config,
      })),
  };

  const sandbox = {
    console,
    module: { exports: {} },
    exports: {},
    require: (specifier) => {
      if (specifier.startsWith("./api")) {
        return apiModule;
      }
      throw new Error(`Unexpected dependency request: ${specifier}`);
    },
  };

  vm.createContext(sandbox);
  sandbox.exports = sandbox.module.exports;

  new vm.Script(transpiled, { filename: "emailService.js" }).runInContext(sandbox);

  const emailService = sandbox.exports.emailService ?? sandbox.module.exports.emailService;
  assert.ok(emailService, "emailService export should be available");
  return emailService;
}

function captureConsole(method) {
  const original = console[method];
  const calls = [];
  console[method] = (...args) => {
    calls.push(args);
  };

  return {
    get calls() {
      return calls;
    },
    restore() {
      console[method] = original;
    },
  };
}

test("sendConfirmationEmail skips when no configuration is available", async () => {
  let fetchInvocations = 0;
  const emailService = loadEmailService({
    fetchEmailConfig: async () => {
      fetchInvocations += 1;
      return { configured: false, config: null };
    },
  });

  emailService.clearCache();

  const warnSpy = captureConsole("warn");
  const logSpy = captureConsole("log");

  const result = await emailService.sendConfirmationEmail({
    userEmail: "applicant@example.com",
    userName: "Case Tester",
    submissionId: "test-confirm-001",
    queryType: "simple",
    timestamp: new Date().toISOString(),
  });

  warnSpy.restore();
  logSpy.restore();

  assert.equal(result, false, "Confirmation email should not be sent without config");
  assert.equal(fetchInvocations, 1, "fetchEmailConfig should be called once");
  assert.ok(
    warnSpy.calls.length > 0 &&
      warnSpy.calls[0][0].toString().includes("Email configuration not set"),
    "A warning should be logged when configuration is missing"
  );
  assert.equal(
    logSpy.calls.length,
    0,
    "No confirmation email log should be produced when skipping send"
  );
});

test("sendGrantTeamNotification skips when no configuration is available", async () => {
  let fetchInvocations = 0;
  const emailService = loadEmailService({
    fetchEmailConfig: async () => {
      fetchInvocations += 1;
      return { configured: false, config: null };
    },
  });

  emailService.clearCache();

  const warnSpy = captureConsole("warn");
  const logSpy = captureConsole("log");

  const result = await emailService.sendGrantTeamNotification({
    submissionId: "test-escalate-001",
    queryType: "escalated",
    userEmail: "applicant@example.com",
    userName: "Case Tester",
    timestamp: new Date().toISOString(),
    formData: { field: "value" },
  });

  warnSpy.restore();
  logSpy.restore();

  assert.equal(result, false, "Grant team email should not be sent without config");
  assert.equal(fetchInvocations, 1, "fetchEmailConfig should be called once");
  assert.ok(
    warnSpy.calls.length > 0 &&
      warnSpy.calls[0][0].toString().includes("Email configuration not set"),
    "A warning should be logged when configuration is missing"
  );
  assert.equal(
    logSpy.calls.length,
    0,
    "No grant team notification log should be produced when skipping send"
  );
});
