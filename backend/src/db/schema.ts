// @ts-nocheck - Temporarily disabled due to Drizzle ORM version compatibility issues
import {
  pgTable,
  index,
  foreignKey,
  unique,
  bigint,
  varchar,
  boolean,
  integer,
  text,
  timestamp,
  jsonb,
  date,
  check,
  char,
  bigserial,
  serial,
  uuid,
  vector,
  primaryKey,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const aalLevel = pgEnum("aal_level", ["aal3", "aal2", "aal1"]);
export const action = pgEnum("action", ["ERROR", "TRUNCATE", "DELETE", "UPDATE", "INSERT"]);
export const audienceEnum = pgEnum("audience_enum", ["Requestor", "Admin", "Both"]);
export const branchEffectEnum = pgEnum("branch_effect_enum", ["Show", "Hide", "Require", "JumpTo"]);
export const codeChallengeMethod = pgEnum("code_challenge_method", ["plain", "s256"]);
export const emailStatusEnum = pgEnum("email_status_enum", ["Queued", "Sent", "Failed"]);
export const equalityOp = pgEnum("equality_op", ["in", "gte", "gt", "lte", "lt", "neq", "eq"]);
export const exportFormatEnum = pgEnum("export_format_enum", ["CSV", "XLSX"]);
export const exportStatusEnum = pgEnum("export_status_enum", [
  "Queued",
  "Running",
  "Completed",
  "Failed",
]);
export const factorStatus = pgEnum("factor_status", ["verified", "unverified"]);
export const factorType = pgEnum("factor_type", ["phone", "webauthn", "totp"]);
export const formStatusEnum = pgEnum("form_status_enum", ["Draft", "Active", "Archived"]);
export const matchTypeEnum = pgEnum("match_type_enum", ["Exact", "Contains", "Regex"]);
export const oauthRegistrationType = pgEnum("oauth_registration_type", ["manual", "dynamic"]);
export const oneTimeTokenType = pgEnum("one_time_token_type", [
  "phone_change_token",
  "email_change_token_current",
  "email_change_token_new",
  "recovery_token",
  "reauthentication_token",
  "confirmation_token",
]);
export const orgUnitTypeEnum = pgEnum("org_unit_type_enum", [
  "Faculty",
  "Department",
  "School",
  "Center",
  "Other",
]);
export const qTypeEnum = pgEnum("q_type_enum", [
  "ShortText",
  "LongText",
  "Select",
  "MultiSelect",
  "File",
  "Date",
  "Email",
  "Number",
]);
export const resourceTypeEnum = pgEnum("resource_type_enum", ["Link", "HTML", "File", "Video"]);
export const ruleTypeEnum = pgEnum("rule_type_enum", [
  "Regex",
  "Range",
  "EmailFormat",
  "FileType",
  "FileSize",
]);
export const submissionStatusEnum = pgEnum("submission_status_enum", [
  "Stored",
  "EmailQueued",
  "EmailSent",
  "EmailFailed",
]);
export const workflowTypeEnum = pgEnum("workflow_type_enum", ["Simple", "Complex"]);

export const orgUnit = pgTable(
  "org_unit",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "org_unit_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    parentId: bigint("parent_id", { mode: "number" }),
    code: varchar({ length: 50 }),
    name: varchar({ length: 200 }),
    unitType: orgUnitTypeEnum("unit_type").notNull(),
    active: boolean().default(true).notNull(),
  },
  (table) => [
    index("idx_org_unit_type_active").using(
      "btree",
      table.unitType.asc().nullsLast().op("bool_ops"),
      table.active.asc().nullsLast().op("bool_ops")
    ),
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: "fk_org_parent",
    }).onDelete("set null"),
    unique("org_unit_code_key").on(table.code),
  ]
);

export const grantScheme = pgTable(
  "grant_scheme",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "grant_scheme_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    code: varchar({ length: 50 }),
    name: varchar({ length: 200 }),
    active: boolean().default(true).notNull(),
    orderIndex: integer("order_index").default(100).notNull(),
  },
  (table) => [unique("grant_scheme_code_key").on(table.code)]
);

export const form = pgTable(
  "form",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "form_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    formKey: varchar("form_key", { length: 64 }),
    title: varchar({ length: 200 }),
    description: text(),
    status: formStatusEnum().notNull(),
    versionNo: integer("version_no").default(1).notNull(),
    emailSubjectTpl: varchar("email_subject_tpl", { length: 255 }),
    emailBodyTpl: text("email_body_tpl"),
    createdAt: timestamp("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    formSections: jsonb("form_sections"),
  },
  (table) => [unique("form_form_key_key").on(table.formKey)]
);

export const formSection = pgTable(
  "form_section",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "form_section_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    formId: bigint("form_id", { mode: "number" }).notNull(),
    title: varchar({ length: 200 }),
    description: text(),
    orderIndex: integer("order_index").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.formId],
      foreignColumns: [form.id],
      name: "fk_section_form",
    }).onDelete("cascade"),
    unique("uq_form_section_order").on(table.formId, table.orderIndex),
  ]
);

export const guidanceResourceTag = pgTable("guidance_resource_tag", {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  resourceId: bigint("resource_id", { mode: "number" }).notNull(),
  tag: varchar({ length: 64 }),
});

export const exportJob = pgTable(
  "export_job",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "export_job_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    requestedBy: varchar("requested_by", { length: 320 }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    formId: bigint("form_id", { mode: "number" }),
    dateFrom: date("date_from"),
    dateTo: date("date_to"),
    workflowType: workflowTypeEnum("workflow_type"),
    status: exportStatusEnum().notNull(),
    format: exportFormatEnum().notNull(),
    fileUri: varchar("file_uri", { length: 500 }),
    createdAt: timestamp("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    completedAt: timestamp("completed_at", { mode: "string" }),
    errorMessage: text("error_message"),
  },
  (table) => [
    index("idx_export_filter").using(
      "btree",
      table.formId.asc().nullsLast().op("date_ops"),
      table.workflowType.asc().nullsLast().op("date_ops"),
      table.dateFrom.asc().nullsLast().op("enum_ops"),
      table.dateTo.asc().nullsLast().op("date_ops")
    ),
    index("idx_export_status_time").using(
      "btree",
      table.status.asc().nullsLast().op("enum_ops"),
      table.createdAt.asc().nullsLast().op("enum_ops")
    ),
    foreignKey({
      columns: [table.formId],
      foreignColumns: [form.id],
      name: "fk_export_form",
    }).onDelete("set null"),
  ]
);

export const person = pgTable(
  "person",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "person_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    name: varchar("name", { length: 200 }),
    email: varchar("email", { length: 320 }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    orgUnitId: bigint("org_unit_id", { mode: "number" }),
    roleLabel: varchar("role_label", { length: 100 }),
    active: boolean().default(true).notNull(),
  },
  (table) => [
    index("idx_person_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
    foreignKey({
      columns: [table.orgUnitId],
      foreignColumns: [orgUnit.id],
      name: "fk_person_org",
    }).onDelete("set null"),
    unique("person_email_key").on(table.email),
  ]
);

export const question = pgTable(
  "question",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "question_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    formId: bigint("form_id", { mode: "number" }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    sectionId: bigint("section_id", { mode: "number" }),
    label: varchar({ length: 255 }),
    qType: qTypeEnum("q_type").notNull(),
    isRequired: boolean("is_required").default(false).notNull(),
    helpText: text("help_text"),
    orderIndex: integer("order_index").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("idx_question_form_order").using(
      "btree",
      table.formId.asc().nullsLast().op("int4_ops"),
      table.orderIndex.asc().nullsLast().op("int4_ops")
    ),
    foreignKey({
      columns: [table.formId],
      foreignColumns: [form.id],
      name: "fk_question_form",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.sectionId],
      foreignColumns: [formSection.id],
      name: "fk_question_section",
    }).onDelete("set null"),
  ]
);

export const validationRule = pgTable(
  "validation_rule",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "validation_rule_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    questionId: bigint("question_id", { mode: "number" }).notNull(),
    ruleType: ruleTypeEnum("rule_type").notNull(),
    errorMessage: varchar("error_message", { length: 255 }),
    orderIndex: integer("order_index").default(1).notNull(),
  },
  (table) => [
    index("idx_vrule_question").using(
      "btree",
      table.questionId.asc().nullsLast().op("int4_ops"),
      table.orderIndex.asc().nullsLast().op("int4_ops")
    ),
    foreignKey({
      columns: [table.questionId],
      foreignColumns: [question.id],
      name: "fk_vrule_question",
    }).onDelete("cascade"),
  ]
);

export const guidanceSearchLog = pgTable(
  "guidance_search_log",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "guidance_search_log_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    submissionId: bigint("submission_id", { mode: "number" }),
    queryText: varchar("query_text", { length: 500 }),
    resultsCount: integer("results_count"),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    clickedResourceId: bigint("clicked_resource_id", { mode: "number" }),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
  },
  (table) => [
    index("idx_gslog_created").using(
      "btree",
      table.createdAt.asc().nullsLast().op("timestamp_ops")
    ),
    foreignKey({
      columns: [table.clickedResourceId],
      foreignColumns: [guidanceResource.id],
      name: "fk_gslog_clicked",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.submissionId],
      foreignColumns: [submission.id],
      name: "fk_gslog_submission",
    }).onDelete("set null"),
  ]
);

export const questionOption = pgTable(
  "question_option",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "question_option_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    questionId: bigint("question_id", { mode: "number" }).notNull(),
    valueKey: varchar("value_key", { length: 128 }),
    displayText: varchar("display_text", { length: 255 }),
    orderIndex: integer("order_index").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.questionId],
      foreignColumns: [question.id],
      name: "fk_option_question",
    }).onDelete("cascade"),
    unique("uq_question_value").on(table.questionId, table.valueKey),
    unique("question_option_value_key_key").on(table.valueKey),
    unique("question_option_display_text_key").on(table.displayText),
  ]
);

export const branchRule = pgTable(
  "branch_rule",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "branch_rule_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    questionId: bigint("question_id", { mode: "number" }).notNull(),
    conditionExpr: text("condition_expr").notNull(),
    effect: branchEffectEnum().notNull(),
    targetRef: varchar("target_ref", { length: 64 }),
    orderIndex: integer("order_index").default(1).notNull(),
  },
  (table) => [
    index("idx_brule_question").using(
      "btree",
      table.questionId.asc().nullsLast().op("int4_ops"),
      table.orderIndex.asc().nullsLast().op("int4_ops")
    ),
    foreignKey({
      columns: [table.questionId],
      foreignColumns: [question.id],
      name: "fk_brule_question",
    }).onDelete("cascade"),
  ]
);

export const submission = pgTable(
  "submission",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "submission_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    submissionUid: varchar("submission_uid", { length: 40 }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    formId: bigint("form_id", { mode: "number" }).notNull(),
    workflowType: workflowTypeEnum("workflow_type").notNull(),
    status: submissionStatusEnum().notNull(),
    createdBy: varchar("created_by", { length: 200 }),
    createdAt: timestamp("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("idx_submission_form_time").using(
      "btree",
      table.formId.asc().nullsLast().op("timestamp_ops"),
      table.createdAt.asc().nullsLast().op("int8_ops")
    ),
    index("idx_submission_type_time").using(
      "btree",
      table.workflowType.asc().nullsLast().op("enum_ops"),
      table.createdAt.asc().nullsLast().op("timestamp_ops")
    ),
    foreignKey({
      columns: [table.formId],
      foreignColumns: [form.id],
      name: "fk_submission_form",
    }).onDelete("restrict"),
    unique("submission_submission_uid_key").on(table.submissionUid),
  ]
);

export const submissionStatusHistory = pgTable(
  "submission_status_history",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "submission_status_history_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    submissionId: bigint("submission_id", { mode: "number" }).notNull(),
    fromStatus: submissionStatusEnum("from_status"),
    toStatus: submissionStatusEnum("to_status").notNull(),
    changedAt: timestamp("changed_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    changedBy: varchar("changed_by", { length: 200 }),
    note: varchar({ length: 500 }),
  },
  (table) => [
    index("idx_status_sub_time").using(
      "btree",
      table.submissionId.asc().nullsLast().op("int8_ops"),
      table.changedAt.asc().nullsLast().op("int8_ops")
    ),
    foreignKey({
      columns: [table.submissionId],
      foreignColumns: [submission.id],
      name: "fk_status_submission",
    }).onDelete("cascade"),
  ]
);

export const consentLog = pgTable(
  "consent_log",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "consent_log_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    submissionId: bigint("submission_id", { mode: "number" }).notNull(),
    policyVersion: varchar("policy_version", { length: 50 }),
    acceptedAt: timestamp("accepted_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: varchar("user_agent", { length: 400 }),
  },
  (table) => [
    index("idx_consent_submission").using(
      "btree",
      table.submissionId.asc().nullsLast().op("int8_ops")
    ),
    foreignKey({
      columns: [table.submissionId],
      foreignColumns: [submission.id],
      name: "fk_consent_submission",
    }).onDelete("cascade"),
  ]
);

export const answer = pgTable(
  "answer",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "answer_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    submissionId: bigint("submission_id", { mode: "number" }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    questionId: bigint("question_id", { mode: "number" }).notNull(),
    valueText: text("value_text"),
    recordedAt: timestamp("recorded_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("idx_answer_submission").using(
      "btree",
      table.submissionId.asc().nullsLast().op("int8_ops")
    ),
    foreignKey({
      columns: [table.questionId],
      foreignColumns: [question.id],
      name: "fk_answer_question",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.submissionId],
      foreignColumns: [submission.id],
      name: "fk_answer_submission",
    }).onDelete("cascade"),
    unique("uq_answer_unique").on(table.submissionId, table.questionId),
  ]
);

export const attachment = pgTable(
  "attachment",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "attachment_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    submissionId: bigint("submission_id", { mode: "number" }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    questionId: bigint("question_id", { mode: "number" }),
    originalFilename: varchar("original_filename", { length: 255 }),
    mimeType: varchar("mime_type", { length: 127 }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
    storageUri: varchar("storage_uri", { length: 500 }),
    checksumSha256: char("checksum_sha256", { length: 64 }),
    uploadedAt: timestamp("uploaded_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("idx_att_submission").using("btree", table.submissionId.asc().nullsLast().op("int8_ops")),
    foreignKey({
      columns: [table.questionId],
      foreignColumns: [question.id],
      name: "fk_att_question",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.submissionId],
      foreignColumns: [submission.id],
      name: "fk_att_submission",
    }).onDelete("cascade"),
    check("attachment_size_bytes_check", sql`size_bytes >= 0`),
  ]
);

export const emailMessage = pgTable(
  "email_message",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "email_message_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    submissionId: bigint("submission_id", { mode: "number" }).notNull(),
    toAddress: varchar("to_address", { length: 320 }),
    subject: varchar({ length: 255 }),
    bodyText: text("body_text").notNull(),
    status: emailStatusEnum().notNull(),
    retryCount: integer("retry_count").default(0).notNull(),
    lastError: text("last_error"),
    nextAttemptAt: timestamp("next_attempt_at", { mode: "string" }),
    queuedAt: timestamp("queued_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    sentAt: timestamp("sent_at", { mode: "string" }),
  },
  (table) => [
    index("idx_email_status_next").using(
      "btree",
      table.status.asc().nullsLast().op("timestamp_ops"),
      table.nextAttemptAt.asc().nullsLast().op("timestamp_ops")
    ),
    index("idx_email_submission").using(
      "btree",
      table.submissionId.asc().nullsLast().op("int8_ops")
    ),
    foreignKey({
      columns: [table.submissionId],
      foreignColumns: [submission.id],
      name: "fk_email_submission",
    }).onDelete("cascade"),
  ]
);

export const adminUser = pgTable(
  "admin_user",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "admin_user_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [unique("admin_user_email_key").on(table.email)]
);

export const emailTemplate = pgTable("email_template", {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
    name: "email_template_id_seq",
    startWith: 1,
    increment: 1,
    minValue: 1,
    maxValue: 9223372036854775807,
    cache: 1,
  }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  formId: bigint("form_id", { mode: "number" }),
  name: varchar({ length: 100 }),
  subjectTpl: varchar("subject_tpl", { length: 255 }),
  bodyTpl: text("body_tpl").notNull(),
  isDefault: boolean("is_default").notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
});

export const guidanceBinding = pgTable("guidance_binding", {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
    name: "guidance_binding_id_seq",
    startWith: 1,
    increment: 1,
    minValue: 1,
    maxValue: 9223372036854775807,
    cache: 1,
  }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  formId: bigint("form_id", { mode: "number" }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  questionId: bigint("question_id", { mode: "number" }).notNull(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  resourceId: bigint("resource_id", { mode: "number" }).notNull(),
  displayOrder: integer("display_order").notNull(),
  visibilityConditionExpr: text("visibility_condition_expr"),
  note: varchar({ length: 255 }),
  createdAt: timestamp("created_at", { mode: "string" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const guidanceResource = pgTable("guidance_resource", {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
    name: "guidance_resource_id_seq",
    startWith: 1,
    increment: 1,
    minValue: 1,
    maxValue: 9223372036854775807,
    cache: 1,
  }),
  resourceType: resourceTypeEnum("resource_type").notNull(),
  title: varchar({ length: 255 }),
  summary: text(),
  contentHtml: text("content_html"),
  contentUri: varchar("content_uri", { length: 500 }),
  icon: varchar({ length: 64 }),
  audience: audienceEnum().notNull(),
  isActive: boolean("is_active").notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const guidanceTrigger = pgTable("guidance_trigger", {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
    name: "guidance_trigger_id_seq",
    startWith: 1,
    increment: 1,
    minValue: 1,
    maxValue: 9223372036854775807,
    cache: 1,
  }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  formId: bigint("form_id", { mode: "number" }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  questionId: bigint("question_id", { mode: "number" }),
  keyword: varchar({ length: 100 }),
  matchType: matchTypeEnum("match_type").notNull(),
  weight: integer().notNull(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  resourceId: bigint("resource_id", { mode: "number" }).notNull(),
  active: boolean().notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const submissionDraft = pgTable(
  "submission_draft",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "submission_draft_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    formId: bigint("form_id", { mode: "number" }).notNull(),
    draftUid: char("draft_uid", { length: 36 }),
    expiresAt: timestamp("expires_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("idx_draft_expiry").using("btree", table.expiresAt.asc().nullsLast().op("timestamp_ops")),
    foreignKey({
      columns: [table.formId],
      foreignColumns: [form.id],
      name: "fk_draft_form",
    }).onDelete("cascade"),
    unique("submission_draft_uid_key").on(table.draftUid),
  ]
);

export const systemSetting = pgTable("system_setting", {
  settingKey: varchar("setting_key", { length: 100 }).primaryKey().notNull(),
  valueText: text("value_text"),
  updatedAt: timestamp("updated_at", { mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const submissionDraftAnswer = pgTable(
  "submission_draft_answer",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "submission_draft_answer_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    draftId: bigint("draft_id", { mode: "number" }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    questionId: bigint("question_id", { mode: "number" }).notNull(),
    valueText: text("value_text"),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.draftId],
      foreignColumns: [submissionDraft.id],
      name: "fk_draftanswer_draft",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.questionId],
      foreignColumns: [question.id],
      name: "fk_draftanswer_question",
    }).onDelete("restrict"),
    unique("uq_draft_question").on(table.draftId, table.questionId),
  ]
);

export const grantSupportSubmissions = pgTable(
  "grant_support_submissions",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    submissionUid: varchar("submission_uid", { length: 40 }).notNull(),
    queryType: varchar("query_type", { length: 16 }).notNull(),
    status: varchar({ length: 32 }).default("submitted").notNull(),
    userEmail: varchar("user_email", { length: 320 }),
    userName: varchar("user_name", { length: 200 }),
    formData: jsonb("form_data").notNull(),
    userSatisfied: boolean("user_satisfied"),
    needsHumanReview: boolean("needs_human_review"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [unique("grant_support_submissions_submission_uid_key").on(table.submissionUid)]
);

export const referralSubmissions = pgTable(
  "referral_submissions",
  {
    id: serial("id").primaryKey().notNull(),
    submissionUid: varchar("submission_uid", { length: 64 }).notNull(),
    formId: integer("form_id"),
    queryType: varchar("query_type", { length: 32 }).notNull(),
    status: varchar("status", { length: 32 }).default("submitted").notNull(),
    userName: varchar("user_name", { length: 200 }),
    userEmail: varchar("user_email", { length: 200 }),
    formData: jsonb("form_data").notNull(),
    attachments: jsonb("attachments")
      .default(sql`'[]'::jsonb`)
      .notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.formId],
      foreignColumns: [form.id],
      name: "referral_submissions_form_id_form_id_fk",
    }).onDelete("set null"),
    unique("referral_submissions_submission_uid_key").on(table.submissionUid),
  ]
);

export const grantSupportFaqs = pgTable(
  "grant_support_faqs",
  {
    id: serial().primaryKey().notNull(),
    formId: integer("form_id").notNull(),
    answer: text().notNull(),
    selections: jsonb().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`
    ),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`
    ),
    name: text(),
  },
  (table) => [
    index("idx_grant_support_faqs_form_id").using(
      "btree",
      table.formId.asc().nullsLast().op("int4_ops")
    ),
    index("idx_grant_support_faqs_selections").using(
      "gin",
      table.selections.asc().nullsLast().op("jsonb_ops")
    ),
    foreignKey({
      columns: [table.formId],
      foreignColumns: [form.id],
      name: "fk_grant_support_faqs_form",
    }).onDelete("cascade"),
    unique("grant_support_faqs_name_key").on(table.name),
  ]
);

export const userGoogleTokens = pgTable("user_google_tokens", {
  userId: uuid("user_id").primaryKey().notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiryDate: timestamp("expiry_date", { withTimezone: true, mode: "string" }).notNull(),
  scope: text("scope").notNull(),
  tokenType: text("token_type").notNull(),
});

export const knowledgeBase = pgTable(
  "knowledge_base",
  {
    chunkId: bigserial("chunk_id", { mode: "bigint" }).primaryKey().notNull(),
    text: text("text").notNull(),
    embedding: vector({ dimensions: 1024 }),
    metadata: jsonb("metadata"),
    model: text("model"),
    dim: integer("dim").default(1024),
  },
  (table) => [
    index("kb_embedding_ivfflat_cos")
      .using("ivfflat", table.embedding.asc().nullsLast().op("vector_cosine_ops"))
      .with({ lists: "128" }),
    index("knowledge_base_embedding_ivfflat_cos")
      .using("ivfflat", table.embedding.asc().nullsLast().op("vector_cosine_ops"))
      .with({ lists: "100" }),
    unique("knowledge_base_chunk_id_key").on(table.chunkId),
    check("kb_embedding_dim_ck", sql`(embedding IS NULL) OR (vector_dims(embedding) = 1024)`),
  ]
);

export const formDefaultRecipient = pgTable(
  "form_default_recipient",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    formId: bigint("form_id", { mode: "number" }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
  },
  (table) => ({
    fkFormRecipient: foreignKey({
      columns: [table.formId],
      foreignColumns: [form.id],
      name: "fk_form_recipient",
    }).onDelete("cascade"),
    pk: primaryKey({ columns: [table.formId, table.email], name: "form_default_recipient_pkey" }),
  })
);

export const submissionDraftAnswerMulti = pgTable(
  "submission_draft_answer_multi",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    draftAnswerId: bigint("draft_answer_id", { mode: "number" }).notNull(),
    itemValue: varchar("item_value", { length: 255 }).notNull(),
  },
  (table) => ({
    fkDamAnswer: foreignKey({
      columns: [table.draftAnswerId],
      foreignColumns: [submissionDraftAnswer.id],
      name: "fk_dam_answer",
    }).onDelete("cascade"),
    pk: primaryKey({
      columns: [table.draftAnswerId, table.itemValue],
      name: "submission_draft_answer_multi_pkey",
    }),
  })
);

export const answerMultiValue = pgTable(
  "answer_multi_value",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    answerId: bigint("answer_id", { mode: "number" }).notNull(),
    itemValue: varchar("item_value", { length: 255 }).notNull(),
  },
  (table) => ({
    fkAmvAnswer: foreignKey({
      columns: [table.answerId],
      foreignColumns: [answer.id],
      name: "fk_amv_answer",
    }).onDelete("cascade"),
    pk: primaryKey({ columns: [table.answerId, table.itemValue], name: "answer_multi_value_pkey" }),
  })
);

export const adminUserRole = pgTable(
  "admin_user_role",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    adminUserId: bigint("admin_user_id", { mode: "number" }).notNull(),
    roleName: varchar("role_name", { length: 50 }).notNull(),
  },
  (table) => ({
    fkAdminroleUser: foreignKey({
      columns: [table.adminUserId],
      foreignColumns: [adminUser.id],
      name: "fk_adminrole_user",
    }).onDelete("cascade"),
    pk: primaryKey({ columns: [table.adminUserId, table.roleName], name: "admin_user_role_pkey" }),
  })
);

export const emailAttachmentMap = pgTable(
  "email_attachment_map",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    emailId: bigint("email_id", { mode: "number" }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    attachmentId: bigint("attachment_id", { mode: "number" }).notNull(),
  },
  (table) => ({
    fkEmapAtt: foreignKey({
      columns: [table.attachmentId],
      foreignColumns: [attachment.id],
      name: "fk_emap_att",
    }).onDelete("cascade"),
    fkEmapEmail: foreignKey({
      columns: [table.emailId],
      foreignColumns: [emailMessage.id],
      name: "fk_emap_email",
    }).onDelete("cascade"),
    pk: primaryKey({
      columns: [table.emailId, table.attachmentId],
      name: "email_attachment_map_pkey",
    }),
  })
);

export const validationRuleParam = pgTable(
  "validation_rule_param",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    ruleId: bigint("rule_id", { mode: "number" }).notNull(),
    paramKey: varchar("param_key", { length: 50 }).notNull(),
    paramValue: varchar("param_value", { length: 255 }),
  },
  (table) => ({
    fkVruleparamRule: foreignKey({
      columns: [table.ruleId],
      foreignColumns: [validationRule.id],
      name: "fk_vruleparam_rule",
    }).onDelete("cascade"),
    pk: primaryKey({ columns: [table.ruleId, table.paramKey], name: "validation_rule_param_pkey" }),
  })
);
