import { pgTable, pgEnum, serial, varchar, timestamp, foreignKey, unique, integer, json, jsonb, text } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"

export const factorType = pgEnum("factor_type", ['totp', 'webauthn', 'phone'])
export const factorStatus = pgEnum("factor_status", ['unverified', 'verified'])
export const aalLevel = pgEnum("aal_level", ['aal1', 'aal2', 'aal3'])
export const codeChallengeMethod = pgEnum("code_challenge_method", ['s256', 'plain'])
export const oneTimeTokenType = pgEnum("one_time_token_type", ['confirmation_token', 'reauthentication_token', 'recovery_token', 'email_change_token_new', 'email_change_token_current', 'phone_change_token'])
export const equalityOp = pgEnum("equality_op", ['eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'in'])
export const action = pgEnum("action", ['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'ERROR'])
export const oauthRegistrationType = pgEnum("oauth_registration_type", ['dynamic', 'manual'])


export const form = pgTable("form", {
	id: serial("id").primaryKey().notNull(),
	name: varchar("name", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const formDetails = pgTable("form_details", {
	id: serial("id").primaryKey().notNull(),
	formId: integer("form_id").notNull().references(() => form.id, { onDelete: "cascade" } ),
	formFields: json("form_fields"),
},
(table) => {
	return {
		formDetailsFormIdKey: unique("form_details_form_id_key").on(table.formId),
	}
});

export const formResults = pgTable("form_results", {
	id: serial("id").primaryKey().notNull(),
	formId: integer("form_id").notNull().references(() => form.id, { onDelete: "cascade" } ),
	submittedAt: timestamp("submitted_at", { mode: 'string' }).defaultNow(),
	results: jsonb("results").notNull(),
});

export const formFaqs = pgTable("form_faqs", {
	id: serial("id").primaryKey().notNull(),
	formId: integer("form_id").notNull().references(() => form.id),
	question: text("question").notNull(),
	answer: text("answer").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});