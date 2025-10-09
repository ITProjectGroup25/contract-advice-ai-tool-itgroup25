import {
  pgTable,
  unique,
  pgEnum,
  bigint,
  varchar,
  boolean,
  timestamp,
  serial,
  integer,
  jsonb,
  text,
  index,
  foreignKey,
  char,
  date,
  primaryKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const factorType = pgEnum("factor_type", ['totp', 'webauthn', 'phone'])
export const factorStatus = pgEnum("factor_status", ['unverified', 'verified'])
export const aalLevel = pgEnum("aal_level", ['aal1', 'aal2', 'aal3'])
export const codeChallengeMethod = pgEnum("code_challenge_method", ['s256', 'plain'])
export const oneTimeTokenType = pgEnum("one_time_token_type", ['confirmation_token', 'reauthentication_token', 'recovery_token', 'email_change_token_new', 'email_change_token_current', 'phone_change_token'])
export const oauthRegistrationType = pgEnum("oauth_registration_type", ['dynamic', 'manual'])
export const equalityOp = pgEnum("equality_op", ['eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'in'])
export const action = pgEnum("action", ['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'ERROR'])
export const buckettype = pgEnum("buckettype", ['STANDARD', 'ANALYTICS'])
export const formStatusEnum = pgEnum("form_status_enum", ['Draft', 'Active', 'Archived'])
export const qTypeEnum = pgEnum("q_type_enum", ['ShortText', 'LongText', 'Select', 'MultiSelect', 'File', 'Date', 'Email', 'Number'])
export const ruleTypeEnum = pgEnum("rule_type_enum", ['Regex', 'Range', 'EmailFormat', 'FileType', 'FileSize'])
export const branchEffectEnum = pgEnum("branch_effect_enum", ['Show', 'Hide', 'Require', 'JumpTo'])
export const orgUnitTypeEnum = pgEnum("org_unit_type_enum", ['Faculty', 'Department', 'School', 'Center', 'Other'])
export const workflowTypeEnum = pgEnum("workflow_type_enum", ['Simple', 'Complex'])
export const submissionStatusEnum = pgEnum("submission_status_enum", ['Stored', 'EmailQueued', 'EmailSent', 'EmailFailed'])
export const emailStatusEnum = pgEnum("email_status_enum", ['Queued', 'Sent', 'Failed'])
export const exportStatusEnum = pgEnum("export_status_enum", ['Queued', 'Running', 'Completed', 'Failed'])
export const exportFormatEnum = pgEnum("export_format_enum", ['CSV', 'XLSX'])
export const resourceTypeEnum = pgEnum("resource_type_enum", ['Link', 'HTML', 'File', 'Video'])
export const audienceEnum = pgEnum("audience_enum", ['Requestor', 'Admin', 'Both'])
export const matchTypeEnum = pgEnum("match_type_enum", ['Exact', 'Contains', 'Regex'])


export const adminUser = pgTable("admin_user", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	name: varchar("name", { length: 100 }).notNull(),
	email: varchar("email", { length: 320 }).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		adminUserEmailKey: unique("admin_user_email_key").on(table.email),
	}
});

export const formDetails = pgTable("form_details", {
	id: serial("id").primaryKey().notNull(),
	formId: integer("form_id").notNull(),
	formFields: jsonb("form_fields").notNull(),
},
(table) => {
	return {
		formDetailsFormIdKey: unique("form_details_form_id_key").on(table.formId),
	}
});

export const formResults = pgTable("form_results", {
	id: serial("id").primaryKey().notNull(),
	formId: integer("form_id").notNull(),
	submittedAt: timestamp("submitted_at", { mode: 'string' }).defaultNow(),
	results: jsonb("results").notNull(),
});

export const form = pgTable("form", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).notNull(),
	formKey: varchar("form_key", { length: 64 }),
	title: varchar("title", { length: 200 }),
	description: text("description"),
	status: formStatusEnum("status").notNull(),
	versionNo: integer("version_no").notNull(),
	emailSubjectTpl: varchar("email_subject_tpl", { length: 255 }),
	emailBodyTpl: text("email_body_tpl"),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
});

export const referralSubmissions = pgTable("referral_submissions", {
	id: serial("id").primaryKey().notNull(),
	submissionUid: varchar("submission_uid", { length: 64 }).notNull(),
	formId: integer("form_id").references(() => form.id, { onDelete: "set null" } ),
	queryType: varchar("query_type", { length: 32 }).notNull(),
	status: varchar("status", { length: 32 }).default('submitted').notNull(),
	userName: varchar("user_name", { length: 200 }),
	userEmail: varchar("user_email", { length: 200 }),
	formData: jsonb("form_data").notNull(),
	attachments: jsonb("attachments").default(sql`'[]'::jsonb`).notNull(),
	metadata: jsonb("metadata"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		referralSubmissionsSubmissionUidKey: unique("referral_submissions_submission_uid_key").on(table.submissionUid),
	}
});

export const formSection = pgTable("form_section", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	formId: bigint("form_id", { mode: "number" }).notNull(),
	title: varchar("title", { length: 200 }).notNull(),
	description: text("description"),
	orderIndex: integer("order_index").notNull(),
},
(table) => {
	return {
		uqFormSectionOrder: unique("uq_form_section_order").on(table.formId, table.orderIndex),
	}
});

export const branchRule = pgTable("branch_rule", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	questionId: bigint("question_id", { mode: "number" }).notNull().references(() => question.id, { onDelete: "cascade" } ),
	conditionExpr: text("condition_expr").notNull(),
	effect: branchEffectEnum("effect").notNull(),
	targetRef: varchar("target_ref", { length: 64 }),
	orderIndex: integer("order_index").default(1).notNull(),
},
(table) => {
	return {
		idxBruleQuestion: index("idx_brule_question").on(table.orderIndex, table.questionId),
	}
});

export const question = pgTable("question", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	formId: bigint("form_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	sectionId: bigint("section_id", { mode: "number" }).references(() => formSection.id, { onDelete: "set null" } ),
	label: varchar("label", { length: 255 }).notNull(),
	qType: qTypeEnum("q_type").notNull(),
	isRequired: boolean("is_required").default(false).notNull(),
	helpText: text("help_text"),
	orderIndex: integer("order_index").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		idxQuestionFormOrder: index("idx_question_form_order").on(table.formId, table.orderIndex),
	}
});

export const questionOption = pgTable("question_option", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	questionId: bigint("question_id", { mode: "number" }).notNull().references(() => question.id, { onDelete: "cascade" } ),
	valueKey: varchar("value_key", { length: 128 }).notNull(),
	displayText: varchar("display_text", { length: 255 }).notNull(),
	orderIndex: integer("order_index").notNull(),
},
(table) => {
	return {
		uqQuestionValue: unique("uq_question_value").on(table.questionId, table.valueKey),
	}
});

export const validationRule = pgTable("validation_rule", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	questionId: bigint("question_id", { mode: "number" }).notNull().references(() => question.id, { onDelete: "cascade" } ),
	ruleType: ruleTypeEnum("rule_type").notNull(),
	errorMessage: varchar("error_message", { length: 255 }).notNull(),
	orderIndex: integer("order_index").default(1).notNull(),
},
(table) => {
	return {
		idxVruleQuestion: index("idx_vrule_question").on(table.orderIndex, table.questionId),
	}
});

export const grantScheme = pgTable("grant_scheme", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	code: varchar("code", { length: 50 }).notNull(),
	name: varchar("name", { length: 200 }).notNull(),
	active: boolean("active").default(true).notNull(),
	orderIndex: integer("order_index").default(100).notNull(),
},
(table) => {
	return {
		grantSchemeCodeKey: unique("grant_scheme_code_key").on(table.code),
	}
});

export const orgUnit = pgTable("org_unit", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	parentId: bigint("parent_id", { mode: "number" }),
	code: varchar("code", { length: 50 }),
	name: varchar("name", { length: 200 }).notNull(),
	unitType: orgUnitTypeEnum("unit_type").notNull(),
	active: boolean("active").default(true).notNull(),
},
(table) => {
	return {
		idxOrgUnitTypeActive: index("idx_org_unit_type_active").on(table.active, table.unitType),
		fkOrgParent: foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "fk_org_parent"
		}).onDelete("set null"),
		orgUnitCodeKey: unique("org_unit_code_key").on(table.code),
	}
});

export const person = pgTable("person", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	name: varchar("name", { length: 200 }).notNull(),
	email: varchar("email", { length: 320 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	orgUnitId: bigint("org_unit_id", { mode: "number" }).references(() => orgUnit.id, { onDelete: "set null" } ),
	roleLabel: varchar("role_label", { length: 100 }),
	active: boolean("active").default(true).notNull(),
},
(table) => {
	return {
		idxPersonName: index("idx_person_name").on(table.name),
		personEmailKey: unique("person_email_key").on(table.email),
	}
});

export const submission = pgTable("submission", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	submissionUid: varchar("submission_uid", { length: 40 }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	formId: bigint("form_id", { mode: "number" }).notNull(),
	workflowType: workflowTypeEnum("workflow_type").notNull(),
	status: submissionStatusEnum("status").notNull(),
	createdBy: varchar("created_by", { length: 200 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		idxSubmissionFormTime: index("idx_submission_form_time").on(table.createdAt, table.formId),
		idxSubmissionTypeTime: index("idx_submission_type_time").on(table.createdAt, table.workflowType),
		submissionSubmissionUidKey: unique("submission_submission_uid_key").on(table.submissionUid),
	}
});

export const submissionStatusHistory = pgTable("submission_status_history", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	submissionId: bigint("submission_id", { mode: "number" }).notNull().references(() => submission.id, { onDelete: "cascade" } ),
	fromStatus: submissionStatusEnum("from_status"),
	toStatus: submissionStatusEnum("to_status").notNull(),
	changedAt: timestamp("changed_at", { mode: 'string' }).defaultNow().notNull(),
	changedBy: varchar("changed_by", { length: 200 }),
	note: varchar("note", { length: 500 }),
},
(table) => {
	return {
		idxStatusSubTime: index("idx_status_sub_time").on(table.changedAt, table.submissionId),
	}
});

export const consentLog = pgTable("consent_log", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	submissionId: bigint("submission_id", { mode: "number" }).notNull().references(() => submission.id, { onDelete: "cascade" } ),
	policyVersion: varchar("policy_version", { length: 50 }).notNull(),
	acceptedAt: timestamp("accepted_at", { mode: 'string' }).defaultNow().notNull(),
	ipAddress: varchar("ip_address", { length: 45 }),
	userAgent: varchar("user_agent", { length: 400 }),
},
(table) => {
	return {
		idxConsentSubmission: index("idx_consent_submission").on(table.submissionId),
	}
});

export const answer = pgTable("answer", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	submissionId: bigint("submission_id", { mode: "number" }).notNull().references(() => submission.id, { onDelete: "cascade" } ),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	questionId: bigint("question_id", { mode: "number" }).notNull().references(() => question.id, { onDelete: "restrict" } ),
	valueText: text("value_text"),
	recordedAt: timestamp("recorded_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		idxAnswerSubmission: index("idx_answer_submission").on(table.submissionId),
		uqAnswerUnique: unique("uq_answer_unique").on(table.submissionId, table.questionId),
	}
});

export const attachment = pgTable("attachment", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	submissionId: bigint("submission_id", { mode: "number" }).notNull().references(() => submission.id, { onDelete: "cascade" } ),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	questionId: bigint("question_id", { mode: "number" }).references(() => question.id, { onDelete: "set null" } ),
	originalFilename: varchar("original_filename", { length: 255 }).notNull(),
	mimeType: varchar("mime_type", { length: 127 }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
	storageUri: varchar("storage_uri", { length: 500 }).notNull(),
	checksumSha256: char("checksum_sha256", { length: 64 }),
	uploadedAt: timestamp("uploaded_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		idxAttSubmission: index("idx_att_submission").on(table.submissionId),
	}
});

export const guidanceResource = pgTable("guidance_resource", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	resourceType: resourceTypeEnum("resource_type").default('Link').notNull(),
	title: varchar("title", { length: 255 }).notNull(),
	summary: text("summary"),
	contentHtml: text("content_html"),
	contentUri: varchar("content_uri", { length: 500 }),
	icon: varchar("icon", { length: 64 }),
	audience: audienceEnum("audience").default('Requestor').notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const emailMessage = pgTable("email_message", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	submissionId: bigint("submission_id", { mode: "number" }).notNull().references(() => submission.id, { onDelete: "cascade" } ),
	toAddress: varchar("to_address", { length: 320 }).notNull(),
	subject: varchar("subject", { length: 255 }).notNull(),
	bodyText: text("body_text").notNull(),
	status: emailStatusEnum("status").notNull(),
	retryCount: integer("retry_count").default(0).notNull(),
	lastError: text("last_error"),
	nextAttemptAt: timestamp("next_attempt_at", { mode: 'string' }),
	queuedAt: timestamp("queued_at", { mode: 'string' }).defaultNow().notNull(),
	sentAt: timestamp("sent_at", { mode: 'string' }),
},
(table) => {
	return {
		idxEmailStatusNext: index("idx_email_status_next").on(table.nextAttemptAt, table.status),
		idxEmailSubmission: index("idx_email_submission").on(table.submissionId),
	}
});

export const emailTemplate = pgTable("email_template", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	formId: bigint("form_id", { mode: "number" }),
	name: varchar("name", { length: 100 }).notNull(),
	subjectTpl: varchar("subject_tpl", { length: 255 }).notNull(),
	bodyTpl: text("body_tpl").notNull(),
	isDefault: boolean("is_default").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		uqTplScopeName: unique("uq_tpl_scope_name").on(table.formId, table.name),
	}
});

export const guidanceBinding = pgTable("guidance_binding", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	formId: bigint("form_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	questionId: bigint("question_id", { mode: "number" }).notNull().references(() => question.id, { onDelete: "cascade" } ),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	resourceId: bigint("resource_id", { mode: "number" }).notNull().references(() => guidanceResource.id, { onDelete: "cascade" } ),
	displayOrder: integer("display_order").default(100).notNull(),
	visibilityConditionExpr: text("visibility_condition_expr"),
	note: varchar("note", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		idxBindingQOrder: index("idx_binding_q_order").on(table.displayOrder, table.questionId),
		idxBindingFormQ: index("idx_binding_form_q").on(table.formId, table.questionId),
		uqBinding: unique("uq_binding").on(table.questionId, table.resourceId),
	}
});

export const guidanceTrigger = pgTable("guidance_trigger", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	formId: bigint("form_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	questionId: bigint("question_id", { mode: "number" }).references(() => question.id, { onDelete: "set null" } ),
	keyword: varchar("keyword", { length: 100 }).notNull(),
	matchType: matchTypeEnum("match_type").notNull(),
	weight: integer("weight").default(100).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	resourceId: bigint("resource_id", { mode: "number" }).notNull().references(() => guidanceResource.id, { onDelete: "cascade" } ),
	active: boolean("active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		idxGtrigKeyword: index("idx_gtrig_keyword").on(table.keyword),
		idxGtrigActive: index("idx_gtrig_active").on(table.active, table.weight),
		idxGtrigScope: index("idx_gtrig_scope").on(table.formId, table.questionId),
	}
});

export const guidanceSearchLog = pgTable("guidance_search_log", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	submissionId: bigint("submission_id", { mode: "number" }).references(() => submission.id, { onDelete: "set null" } ),
	queryText: varchar("query_text", { length: 500 }).notNull(),
	resultsCount: integer("results_count"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	clickedResourceId: bigint("clicked_resource_id", { mode: "number" }).references(() => guidanceResource.id, { onDelete: "set null" } ),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		idxGslogCreated: index("idx_gslog_created").on(table.createdAt),
	}
});

export const submissionDraft = pgTable("submission_draft", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	formId: bigint("form_id", { mode: "number" }).notNull(),
	draftUid: char("draft_uid", { length: 36 }).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		idxDraftExpiry: index("idx_draft_expiry").on(table.expiresAt),
		submissionDraftDraftUidKey: unique("submission_draft_draft_uid_key").on(table.draftUid),
	}
});

export const submissionDraftAnswer = pgTable("submission_draft_answer", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	draftId: bigint("draft_id", { mode: "number" }).notNull().references(() => submissionDraft.id, { onDelete: "cascade" } ),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	questionId: bigint("question_id", { mode: "number" }).notNull().references(() => question.id, { onDelete: "restrict" } ),
	valueText: text("value_text"),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		uqDraftQuestion: unique("uq_draft_question").on(table.draftId, table.questionId),
	}
});

export const exportJob = pgTable("export_job", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	requestedBy: varchar("requested_by", { length: 320 }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	formId: bigint("form_id", { mode: "number" }),
	dateFrom: date("date_from"),
	dateTo: date("date_to"),
	workflowType: workflowTypeEnum("workflow_type"),
	status: exportStatusEnum("status").notNull(),
	format: exportFormatEnum("format").notNull(),
	fileUri: varchar("file_uri", { length: 500 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	errorMessage: text("error_message"),
},
(table) => {
	return {
		idxExportStatusTime: index("idx_export_status_time").on(table.createdAt, table.status),
		idxExportFilter: index("idx_export_filter").on(table.dateFrom, table.dateTo, table.formId, table.workflowType),
	}
});

export const systemSetting = pgTable("system_setting", {
	settingKey: varchar("setting_key", { length: 100 }).primaryKey().notNull(),
	valueText: text("value_text"),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const adminUserRole = pgTable("admin_user_role", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	adminUserId: bigint("admin_user_id", { mode: "number" }).notNull().references(() => adminUser.id, { onDelete: "cascade" } ),
	roleName: varchar("role_name", { length: 50 }).notNull(),
},
(table) => {
	return {
		adminUserRolePkey: primaryKey({ columns: [table.adminUserId, table.roleName], name: "admin_user_role_pkey"})
	}
});

export const formDefaultRecipient = pgTable("form_default_recipient", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	formId: bigint("form_id", { mode: "number" }).notNull(),
	email: varchar("email", { length: 320 }).notNull(),
},
(table) => {
	return {
		formDefaultRecipientPkey: primaryKey({ columns: [table.formId, table.email], name: "form_default_recipient_pkey"})
	}
});

export const answerMultiValue = pgTable("answer_multi_value", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	answerId: bigint("answer_id", { mode: "number" }).notNull().references(() => answer.id, { onDelete: "cascade" } ),
	itemValue: varchar("item_value", { length: 255 }).notNull(),
},
(table) => {
	return {
		answerMultiValuePkey: primaryKey({ columns: [table.answerId, table.itemValue], name: "answer_multi_value_pkey"})
	}
});

export const emailAttachmentMap = pgTable("email_attachment_map", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	emailId: bigint("email_id", { mode: "number" }).notNull().references(() => emailMessage.id, { onDelete: "cascade" } ),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	attachmentId: bigint("attachment_id", { mode: "number" }).notNull().references(() => attachment.id, { onDelete: "cascade" } ),
},
(table) => {
	return {
		emailAttachmentMapPkey: primaryKey({ columns: [table.emailId, table.attachmentId], name: "email_attachment_map_pkey"})
	}
});

export const guidanceResourceTag = pgTable("guidance_resource_tag", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	resourceId: bigint("resource_id", { mode: "number" }).notNull().references(() => guidanceResource.id, { onDelete: "cascade" } ),
	tag: varchar("tag", { length: 64 }).notNull(),
},
(table) => {
	return {
		guidanceResourceTagPkey: primaryKey({ columns: [table.resourceId, table.tag], name: "guidance_resource_tag_pkey"})
	}
});

export const submissionDraftAnswerMulti = pgTable("submission_draft_answer_multi", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	draftAnswerId: bigint("draft_answer_id", { mode: "number" }).notNull().references(() => submissionDraftAnswer.id, { onDelete: "cascade" } ),
	itemValue: varchar("item_value", { length: 255 }).notNull(),
},
(table) => {
	return {
		submissionDraftAnswerMultiPkey: primaryKey({ columns: [table.draftAnswerId, table.itemValue], name: "submission_draft_answer_multi_pkey"})
	}
});

export const validationRuleParam = pgTable("validation_rule_param", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	ruleId: bigint("rule_id", { mode: "number" }).notNull().references(() => validationRule.id, { onDelete: "cascade" } ),
	paramKey: varchar("param_key", { length: 50 }).notNull(),
	paramValue: varchar("param_value", { length: 255 }).notNull(),
},
(table) => {
	return {
		validationRuleParamPkey: primaryKey({ columns: [table.ruleId, table.paramKey], name: "validation_rule_param_pkey"})
	}
});
