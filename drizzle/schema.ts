import { pgTable, pgEnum, serial, varchar, timestamp, foreignKey, unique, integer, jsonb } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"

export const factorType = pgEnum("factor_type", ['phone', 'webauthn', 'totp'])
export const factorStatus = pgEnum("factor_status", ['verified', 'unverified'])
export const aalLevel = pgEnum("aal_level", ['aal3', 'aal2', 'aal1'])
export const codeChallengeMethod = pgEnum("code_challenge_method", ['plain', 's256'])
export const oneTimeTokenType = pgEnum("one_time_token_type", ['phone_change_token', 'email_change_token_current', 'email_change_token_new', 'recovery_token', 'reauthentication_token', 'confirmation_token'])
export const equalityOp = pgEnum("equality_op", ['in', 'gte', 'gt', 'lte', 'lt', 'neq', 'eq'])
export const action = pgEnum("action", ['ERROR', 'TRUNCATE', 'DELETE', 'UPDATE', 'INSERT'])
export const oauthRegistrationType = pgEnum("oauth_registration_type", ['manual', 'dynamic'])


export const form = pgTable("form", {
	id: serial("id").primaryKey().notNull(),
	name: varchar("name", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const formDetails = pgTable("form_details", {
	id: serial("id").primaryKey().notNull(),
	formId: integer("form_id").notNull().references(() => form.id, { onDelete: "cascade" } ),
	formFields: jsonb("form_fields").notNull(),
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