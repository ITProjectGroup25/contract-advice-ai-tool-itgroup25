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

  const emailjsImplementation = {
    init:
      overrides.emailjsInit ??
      (() => {
        /* noop */
      }),
    send:
      overrides.emailjsSend ??
      (async () => ({
        status: 200,
      })),
  };

  const emailjsModule = {
    __esModule: true,
    default: emailjsImplementation,
    ...emailjsImplementation,
  };

  const sandbox = {
    console,
    window: overrides.window ?? {},
    module: { exports: {} },
    exports: {},
    require: (specifier) => {
      if (specifier.startsWith("./api")) {
        return apiModule;
      }
      if (specifier === "@emailjs/browser") {
        return emailjsModule;
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
    emailjsInit: () => {
      throw new Error("emailjs.init should not be called when config is missing");
    },
    emailjsSend: () => {
      throw new Error("emailjs.send should not be called when config is missing");
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
    emailjsInit: () => {
      throw new Error("emailjs.init should not be called when config is missing");
    },
    emailjsSend: () => {
      throw new Error("emailjs.send should not be called when config is missing");
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

test("sendConfirmationEmail sends email when configuration is available", async () => {
  const initCalls = [];
  const sendCalls = [];
  const emailService = loadEmailService({
    fetchEmailConfig: async () => ({
      configured: true,
      config: {
        serviceId: "service_123",
        templateId: "template_confirm",
        publicKey: "public_key_abc",
        grantTeamEmail: "team@example.com",
        grantTeamTemplateId: "template_grant",
      },
    }),
    emailjsInit: (key) => {
      initCalls.push(key);
    },
    emailjsSend: async (serviceId, templateId, params) => {
      sendCalls.push({ serviceId, templateId, params });
      return { status: 200 };
    },
  });

  emailService.clearCache();

  const result = await emailService.sendConfirmationEmail({
    userEmail: "applicant@example.com",
    userName: "Case Tester",
    submissionId: "test-confirm-002",
    queryType: "simple",
    timestamp: "2025-10-31T14:47:34.000Z",
    formData: { field: "value" },
  });

  assert.equal(result, true, "Confirmation email should report success when send resolves 200");
  assert.deepEqual(initCalls, ["public_key_abc"], "emailjs.init should be called with the public key");
  assert.equal(sendCalls.length, 1, "emailjs.send should be called exactly once");
  assert.equal(sendCalls[0].serviceId, "service_123");
  assert.equal(sendCalls[0].templateId, "template_confirm");
  assert.equal(sendCalls[0].params.to_email, "applicant@example.com");
  assert.ok(
    sendCalls[0].params.form_data.includes('"field": "value"'),
    "Form data should be serialised in template params"
  );
});

test("sendGrantTeamNotification sends email when configuration is available", async () => {
  const initCalls = [];
  const sendCalls = [];
  const emailService = loadEmailService({
    fetchEmailConfig: async () => ({
      configured: true,
      config: {
        serviceId: "service_123",
        templateId: "template_confirm",
        publicKey: "public_key_abc",
        grantTeamEmail: "team@example.com",
        grantTeamTemplateId: "template_grant",
      },
    }),
    emailjsInit: (key) => {
      initCalls.push(key);
    },
    emailjsSend: async (serviceId, templateId, params) => {
      sendCalls.push({ serviceId, templateId, params });
      return { status: 200 };
    },
  });

  emailService.clearCache();

  const result = await emailService.sendGrantTeamNotification({
    submissionId: "test-escalate-002",
    queryType: "escalated",
    userEmail: "applicant@example.com",
    userName: "Case Tester",
    timestamp: "2025-10-31T14:47:34.000Z",
    formData: { field: "value" },
    matchedSelections: ["foo", "bar"],
  });

  assert.equal(result, true, "Grant team email should report success when send resolves 200");
  assert.deepEqual(initCalls, ["public_key_abc"], "emailjs.init should be called with the public key");
  assert.equal(sendCalls.length, 1, "emailjs.send should be called exactly once");
  assert.equal(sendCalls[0].serviceId, "service_123");
  assert.equal(sendCalls[0].templateId, "template_grant");
  assert.equal(sendCalls[0].params.grant_team_email, "team@example.com");
  assert.equal(sendCalls[0].params.matched_selections, "foo, bar");
});
