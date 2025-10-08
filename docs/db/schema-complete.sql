-- =============================================
-- Contract Advice AI Tool - Complete Database Schema
-- Generated: 2025-10-08
-- Database: Supabase PostgreSQL
-- Project: lfedmwfgftpkknllchxr
-- =============================================
-- 
-- This file contains the complete DDL to recreate the database schema
-- Execute sections in order:
--   1. Enums
--   2. Sequences
--   3. Tables
--   4. Primary Keys
--   5. Foreign Keys
--   6. Unique Constraints
--   7. Indexes
--
-- =============================================

-- =============================================
-- SECTION 1: ENUM TYPES
-- =============================================

CREATE TYPE public.aal_level AS ENUM (
  'aal3',
  'aal2',
  'aal1'
);

CREATE TYPE public.action AS ENUM (
  'ERROR',
  'TRUNCATE',
  'DELETE',
  'UPDATE',
  'INSERT'
);

CREATE TYPE public.audience_enum AS ENUM (
  'Requestor',
  'Admin',
  'Both'
);

CREATE TYPE public.branch_effect_enum AS ENUM (
  'Show',
  'Hide',
  'Require',
  'JumpTo'
);

CREATE TYPE public.code_challenge_method AS ENUM (
  'plain',
  's256'
);

CREATE TYPE public.email_status_enum AS ENUM (
  'Queued',
  'Sent',
  'Failed'
);

CREATE TYPE public.equality_op AS ENUM (
  'in',
  'gte',
  'gt',
  'lte',
  'lt',
  'neq',
  'eq'
);

CREATE TYPE public.export_format_enum AS ENUM (
  'CSV',
  'XLSX'
);

CREATE TYPE public.export_status_enum AS ENUM (
  'Queued',
  'Running',
  'Completed',
  'Failed'
);

CREATE TYPE public.factor_status AS ENUM (
  'verified',
  'unverified'
);

CREATE TYPE public.factor_type AS ENUM (
  'phone',
  'webauthn',
  'totp'
);

CREATE TYPE public.form_status_enum AS ENUM (
  'Draft',
  'Active',
  'Archived'
);

CREATE TYPE public.match_type_enum AS ENUM (
  'Exact',
  'Contains',
  'Regex'
);

CREATE TYPE public.oauth_registration_type AS ENUM (
  'manual',
  'dynamic'
);

CREATE TYPE public.one_time_token_type AS ENUM (
  'phone_change_token',
  'email_change_token_current',
  'email_change_token_new',
  'recovery_token',
  'reauthentication_token',
  'confirmation_token'
);

CREATE TYPE public.org_unit_type_enum AS ENUM (
  'Faculty',
  'Department',
  'School',
  'Center',
  'Other'
);

CREATE TYPE public.q_type_enum AS ENUM (
  'ShortText',
  'LongText',
  'Select',
  'MultiSelect',
  'File',
  'Date',
  'Email',
  'Number'
);

CREATE TYPE public.resource_type_enum AS ENUM (
  'Link',
  'HTML',
  'File',
  'Video'
);

CREATE TYPE public.rule_type_enum AS ENUM (
  'Regex',
  'Range',
  'EmailFormat',
  'FileType',
  'FileSize'
);

CREATE TYPE public.submission_status_enum AS ENUM (
  'Stored',
  'EmailQueued',
  'EmailSent',
  'EmailFailed'
);

CREATE TYPE public.workflow_type_enum AS ENUM (
  'Simple',
  'Complex'
);

-- =============================================
-- SECTION 2: SEQUENCES
-- =============================================

CREATE SEQUENCE public.form_details_id_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE public.form_results_id_seq START WITH 1 INCREMENT BY 1;

-- =============================================
-- SECTION 3: TABLES
-- =============================================

-- Admin Users
CREATE TABLE public.admin_user (
  id bigint NOT NULL,
  name varchar(100) NOT NULL,
  email varchar(320) NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE public.admin_user_role (
  admin_user_id bigint NOT NULL,
  role_name varchar(50) NOT NULL
);

-- Answer Tables
CREATE TABLE public.answer (
  id bigint NOT NULL,
  submission_id bigint NOT NULL,
  question_id bigint NOT NULL,
  value_text text,
  recorded_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE public.answer_multi_value (
  answer_id bigint NOT NULL,
  item_value varchar(255) NOT NULL
);

-- Attachment Management
CREATE TABLE public.attachment (
  id bigint NOT NULL,
  submission_id bigint NOT NULL,
  question_id bigint,
  original_filename varchar(255) NOT NULL,
  mime_type varchar(127) NOT NULL,
  size_bytes bigint NOT NULL,
  storage_uri varchar(500) NOT NULL,
  checksum_sha256 character,
  uploaded_at timestamp NOT NULL DEFAULT now()
);

-- Branch Rules
CREATE TABLE public.branch_rule (
  id bigint NOT NULL,
  question_id bigint NOT NULL,
  condition_expr text NOT NULL,
  effect branch_effect_enum NOT NULL,
  target_ref varchar(64),
  order_index integer NOT NULL DEFAULT 1
);

-- Consent Logging
CREATE TABLE public.consent_log (
  id bigint NOT NULL,
  submission_id bigint NOT NULL,
  policy_version varchar(50) NOT NULL,
  accepted_at timestamp NOT NULL DEFAULT now(),
  ip_address varchar(45),
  user_agent varchar(400)
);

-- Email System
CREATE TABLE public.email_attachment_map (
  email_id bigint NOT NULL,
  attachment_id bigint NOT NULL
);

CREATE TABLE public.email_message (
  id bigint NOT NULL,
  submission_id bigint NOT NULL,
  to_address varchar(320) NOT NULL,
  subject varchar(255) NOT NULL,
  body_text text NOT NULL,
  status email_status_enum NOT NULL,
  retry_count integer NOT NULL DEFAULT 0,
  last_error text,
  next_attempt_at timestamp,
  queued_at timestamp NOT NULL DEFAULT now(),
  sent_at timestamp
);

CREATE TABLE public.email_template (
  id bigint NOT NULL,
  form_id bigint,
  name varchar(100) NOT NULL,
  subject_tpl varchar(255) NOT NULL,
  body_tpl text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

-- Export Jobs
CREATE TABLE public.export_job (
  id bigint NOT NULL,
  requested_by varchar(320) NOT NULL,
  form_id bigint,
  date_from date,
  date_to date,
  workflow_type workflow_type_enum,
  status export_status_enum NOT NULL,
  format export_format_enum NOT NULL,
  file_uri varchar(500),
  created_at timestamp NOT NULL DEFAULT now(),
  completed_at timestamp,
  error_message text
);

-- Form Tables
CREATE TABLE public.form (
  id bigint NOT NULL,
  form_key varchar(64),
  title varchar(200),
  description text,
  status form_status_enum NOT NULL,
  version_no integer NOT NULL,
  email_subject_tpl varchar(255),
  email_body_tpl text,
  created_at timestamp NOT NULL,
  updated_at timestamp NOT NULL
);

CREATE TABLE public.form_default_recipient (
  form_id bigint NOT NULL,
  email varchar(320) NOT NULL
);

CREATE TABLE public.form_details (
  id integer NOT NULL DEFAULT nextval('form_details_id_seq'::regclass),
  form_id integer NOT NULL,
  form_fields jsonb NOT NULL
);

CREATE TABLE public.form_results (
  id integer NOT NULL DEFAULT nextval('form_results_id_seq'::regclass),
  form_id integer NOT NULL,
  submitted_at timestamp DEFAULT now(),
  results jsonb NOT NULL
);

CREATE TABLE public.form_section (
  id bigint NOT NULL,
  form_id bigint NOT NULL,
  title varchar(200) NOT NULL,
  description text,
  order_index integer NOT NULL
);

-- Grant Schemes
CREATE TABLE public.grant_scheme (
  id bigint NOT NULL,
  code varchar(50) NOT NULL,
  name varchar(200) NOT NULL,
  active boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 100
);

-- Guidance System
CREATE TABLE public.guidance_binding (
  id bigint NOT NULL,
  form_id bigint,
  question_id bigint NOT NULL,
  resource_id bigint NOT NULL,
  display_order integer NOT NULL DEFAULT 100,
  visibility_condition_expr text,
  note varchar(255),
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE public.guidance_resource (
  id bigint NOT NULL,
  resource_type resource_type_enum NOT NULL DEFAULT 'Link'::resource_type_enum,
  title varchar(255) NOT NULL,
  summary text,
  content_html text,
  content_uri varchar(500),
  icon varchar(64),
  audience audience_enum NOT NULL DEFAULT 'Requestor'::audience_enum,
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE public.guidance_resource_tag (
  resource_id bigint NOT NULL,
  tag varchar(64) NOT NULL
);

CREATE TABLE public.guidance_search_log (
  id bigint NOT NULL,
  submission_id bigint,
  query_text varchar(500) NOT NULL,
  results_count integer,
  clicked_resource_id bigint,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE public.guidance_trigger (
  id bigint NOT NULL,
  form_id bigint,
  question_id bigint,
  keyword varchar(100) NOT NULL,
  match_type match_type_enum NOT NULL,
  weight integer NOT NULL DEFAULT 100,
  resource_id bigint NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

-- Organization Units
CREATE TABLE public.org_unit (
  id bigint NOT NULL,
  parent_id bigint,
  code varchar(50),
  name varchar(200) NOT NULL,
  unit_type org_unit_type_enum NOT NULL,
  active boolean NOT NULL DEFAULT true
);

-- Person Management
CREATE TABLE public.person (
  id bigint NOT NULL,
  name varchar(200) NOT NULL,
  email varchar(320),
  org_unit_id bigint,
  role_label varchar(100),
  active boolean NOT NULL DEFAULT true
);

-- Questions
CREATE TABLE public.question (
  id bigint NOT NULL,
  form_id bigint NOT NULL,
  section_id bigint,
  label varchar(255) NOT NULL,
  q_type q_type_enum NOT NULL,
  is_required boolean NOT NULL DEFAULT false,
  help_text text,
  order_index integer NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE public.question_option (
  id bigint NOT NULL,
  question_id bigint NOT NULL,
  value_key varchar(128) NOT NULL,
  display_text varchar(255) NOT NULL,
  order_index integer NOT NULL
);

-- Submissions
CREATE TABLE public.submission (
  id bigint NOT NULL,
  submission_uid varchar(40) NOT NULL,
  form_id bigint NOT NULL,
  workflow_type workflow_type_enum NOT NULL,
  status submission_status_enum NOT NULL,
  created_by varchar(200),
  created_at timestamp NOT NULL DEFAULT now()
);

-- Submission Drafts
CREATE TABLE public.submission_draft (
  id bigint NOT NULL,
  form_id bigint NOT NULL,
  draft_uid character NOT NULL,
  expires_at timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE public.submission_draft_answer (
  id bigint NOT NULL,
  draft_id bigint NOT NULL,
  question_id bigint NOT NULL,
  value_text text,
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE public.submission_draft_answer_multi (
  draft_answer_id bigint NOT NULL,
  item_value varchar(255) NOT NULL
);

-- Submission Status History
CREATE TABLE public.submission_status_history (
  id bigint NOT NULL,
  submission_id bigint NOT NULL,
  from_status submission_status_enum,
  to_status submission_status_enum NOT NULL,
  changed_at timestamp NOT NULL DEFAULT now(),
  changed_by varchar(200),
  note varchar(500)
);

-- System Settings
CREATE TABLE public.system_setting (
  setting_key varchar(100) NOT NULL,
  value_text text,
  updated_at timestamp NOT NULL DEFAULT now()
);

-- Validation Rules
CREATE TABLE public.validation_rule (
  id bigint NOT NULL,
  question_id bigint NOT NULL,
  rule_type rule_type_enum NOT NULL,
  error_message varchar(255) NOT NULL,
  order_index integer NOT NULL DEFAULT 1
);

CREATE TABLE public.validation_rule_param (
  rule_id bigint NOT NULL,
  param_key varchar(50) NOT NULL,
  param_value varchar(255) NOT NULL
);

-- =============================================
-- SECTION 4: PRIMARY KEYS
-- =============================================

ALTER TABLE public.admin_user ADD CONSTRAINT admin_user_pkey PRIMARY KEY (id);
ALTER TABLE public.admin_user_role ADD CONSTRAINT admin_user_role_pkey PRIMARY KEY (admin_user_id, role_name);
ALTER TABLE public.answer ADD CONSTRAINT answer_pkey PRIMARY KEY (id);
ALTER TABLE public.answer_multi_value ADD CONSTRAINT answer_multi_value_pkey PRIMARY KEY (answer_id, item_value);
ALTER TABLE public.attachment ADD CONSTRAINT attachment_pkey PRIMARY KEY (id);
ALTER TABLE public.branch_rule ADD CONSTRAINT branch_rule_pkey PRIMARY KEY (id);
ALTER TABLE public.consent_log ADD CONSTRAINT consent_log_pkey PRIMARY KEY (id);
ALTER TABLE public.email_attachment_map ADD CONSTRAINT email_attachment_map_pkey PRIMARY KEY (email_id, attachment_id);
ALTER TABLE public.email_message ADD CONSTRAINT email_message_pkey PRIMARY KEY (id);
ALTER TABLE public.email_template ADD CONSTRAINT email_template_pkey PRIMARY KEY (id);
ALTER TABLE public.export_job ADD CONSTRAINT export_job_pkey PRIMARY KEY (id);
ALTER TABLE public.form_default_recipient ADD CONSTRAINT form_default_recipient_pkey PRIMARY KEY (form_id, email);
ALTER TABLE public.form_details ADD CONSTRAINT form_details_pkey PRIMARY KEY (id);
ALTER TABLE public.form_results ADD CONSTRAINT form_results_pkey PRIMARY KEY (id);
ALTER TABLE public.form_section ADD CONSTRAINT form_section_pkey PRIMARY KEY (id);
ALTER TABLE public.grant_scheme ADD CONSTRAINT grant_scheme_pkey PRIMARY KEY (id);
ALTER TABLE public.guidance_binding ADD CONSTRAINT guidance_binding_pkey PRIMARY KEY (id);
ALTER TABLE public.guidance_resource ADD CONSTRAINT guidance_resource_pkey PRIMARY KEY (id);
ALTER TABLE public.guidance_resource_tag ADD CONSTRAINT guidance_resource_tag_pkey PRIMARY KEY (resource_id, tag);
ALTER TABLE public.guidance_search_log ADD CONSTRAINT guidance_search_log_pkey PRIMARY KEY (id);
ALTER TABLE public.guidance_trigger ADD CONSTRAINT guidance_trigger_pkey PRIMARY KEY (id);
ALTER TABLE public.org_unit ADD CONSTRAINT org_unit_pkey PRIMARY KEY (id);
ALTER TABLE public.person ADD CONSTRAINT person_pkey PRIMARY KEY (id);
ALTER TABLE public.question ADD CONSTRAINT question_pkey PRIMARY KEY (id);
ALTER TABLE public.question_option ADD CONSTRAINT question_option_pkey PRIMARY KEY (id);
ALTER TABLE public.submission ADD CONSTRAINT submission_pkey PRIMARY KEY (id);
ALTER TABLE public.submission_draft ADD CONSTRAINT submission_draft_pkey PRIMARY KEY (id);
ALTER TABLE public.submission_draft_answer ADD CONSTRAINT submission_draft_answer_pkey PRIMARY KEY (id);
ALTER TABLE public.submission_draft_answer_multi ADD CONSTRAINT submission_draft_answer_multi_pkey PRIMARY KEY (draft_answer_id, item_value);
ALTER TABLE public.submission_status_history ADD CONSTRAINT submission_status_history_pkey PRIMARY KEY (id);
ALTER TABLE public.system_setting ADD CONSTRAINT system_setting_pkey PRIMARY KEY (setting_key);
ALTER TABLE public.validation_rule ADD CONSTRAINT validation_rule_pkey PRIMARY KEY (id);
ALTER TABLE public.validation_rule_param ADD CONSTRAINT validation_rule_param_pkey PRIMARY KEY (rule_id, param_key);

-- =============================================
-- SECTION 5: FOREIGN KEYS
-- =============================================

ALTER TABLE public.admin_user_role ADD CONSTRAINT admin_user_role_admin_user_id_admin_user_id_fk FOREIGN KEY (admin_user_id) REFERENCES public.admin_user (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE public.answer ADD CONSTRAINT answer_question_id_question_id_fk FOREIGN KEY (question_id) REFERENCES public.question (id) ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE public.answer ADD CONSTRAINT answer_submission_id_submission_id_fk FOREIGN KEY (submission_id) REFERENCES public.submission (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE public.answer_multi_value ADD CONSTRAINT answer_multi_value_answer_id_answer_id_fk FOREIGN KEY (answer_id) REFERENCES public.answer (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE public.attachment ADD CONSTRAINT attachment_question_id_question_id_fk FOREIGN KEY (question_id) REFERENCES public.question (id) ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE public.attachment ADD CONSTRAINT attachment_submission_id_submission_id_fk FOREIGN KEY (submission_id) REFERENCES public.submission (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE public.branch_rule ADD CONSTRAINT branch_rule_question_id_question_id_fk FOREIGN KEY (question_id) REFERENCES public.question (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE public.consent_log ADD CONSTRAINT consent_log_submission_id_submission_id_fk FOREIGN KEY (submission_id) REFERENCES public.submission (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE public.email_attachment_map ADD CONSTRAINT email_attachment_map_attachment_id_attachment_id_fk FOREIGN KEY (attachment_id) REFERENCES public.attachment (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE public.email_attachment_map ADD CONSTRAINT email_attachment_map_email_id_email_message_id_fk FOREIGN KEY (email_id) REFERENCES public.email_message (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE public.email_message ADD CONSTRAINT email_message_submission_id_submission_id_fk FOREIGN KEY (submission_id) REFERENCES public.submission (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE public.guidance_binding ADD CONSTRAINT guidance_binding_question_id_question_id_fk FOREIGN KEY (question_id) REFERENCES public.question (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE public.guidance_binding ADD CONSTRAINT guidance_binding_resource_id_guidance_resource_id_fk FOREIGN KEY (resource_id) REFERENCES public.guidance_resource (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE public.guidance_resource_tag ADD CONSTRAINT guidance_resource_tag_resource_id_guidance_resource_id_fk FOREIGN KEY (resource_id) REFERENCES public.guidance_resource (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE public.guidance_search_log ADD CONSTRAINT guidance_search_log_clicked_resource_id_guidance_resource_id_fk FOREIGN KEY (clicked_resource_id) REFERENCES public.guidance_resource (id) ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE public.guidance_search_log ADD CONSTRAINT guidance_search_log_submission_id_submission_id_fk FOREIGN KEY (submission_id) REFERENCES public.submission (id) ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE public.guidance_trigger ADD CONSTRAINT guidance_trigger_question_id_question_id_fk FOREIGN KEY (question_id) REFERENCES public.question (id) ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE public.guidance_trigger ADD CONSTRAINT guidance_trigger_resource_id_guidance_resource_id_fk FOREIGN KEY (resource_id) REFERENCES public.guidance_resource (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE public.org_unit ADD CONSTRAINT fk_org_parent FOREIGN KEY (parent_id) REFERENCES public.org_unit (id) ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE public.person ADD CONSTRAINT person_org_unit_id_org_unit_id_fk FOREIGN KEY (org_unit_id) REFERENCES public.org_unit (id) ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE public.question ADD CONSTRAINT question_section_id_form_section_id_fk FOREIGN KEY (section_id) REFERENCES public.form_section (id) ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE public.question_option ADD CONSTRAINT question_option_question_id_question_id_fk FOREIGN KEY (question_id) REFERENCES public.question (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE public.submission_draft_answer ADD CONSTRAINT submission_draft_answer_draft_id_submission_draft_id_fk FOREIGN KEY (draft_id) REFERENCES public.submission_draft (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE public.submission_draft_answer ADD CONSTRAINT submission_draft_answer_question_id_question_id_fk FOREIGN KEY (question_id) REFERENCES public.question (id) ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE public.submission_draft_answer_multi ADD CONSTRAINT submission_draft_answer_multi_draft_answer_id_submission_draft_ FOREIGN KEY (draft_answer_id) REFERENCES public.submission_draft_answer (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE public.submission_status_history ADD CONSTRAINT submission_status_history_submission_id_submission_id_fk FOREIGN KEY (submission_id) REFERENCES public.submission (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE public.validation_rule ADD CONSTRAINT validation_rule_question_id_question_id_fk FOREIGN KEY (question_id) REFERENCES public.question (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE public.validation_rule_param ADD CONSTRAINT validation_rule_param_rule_id_validation_rule_id_fk FOREIGN KEY (rule_id) REFERENCES public.validation_rule (id) ON DELETE CASCADE ON UPDATE NO ACTION;

-- =============================================
-- SECTION 6: UNIQUE CONSTRAINTS
-- =============================================

ALTER TABLE public.admin_user ADD CONSTRAINT admin_user_email_key UNIQUE (email);
ALTER TABLE public.answer ADD CONSTRAINT uq_answer_unique UNIQUE (submission_id, question_id);
ALTER TABLE public.email_template ADD CONSTRAINT uq_tpl_scope_name UNIQUE (form_id, name);
ALTER TABLE public.form_details ADD CONSTRAINT form_details_form_id_key UNIQUE (form_id);
ALTER TABLE public.form_section ADD CONSTRAINT uq_form_section_order UNIQUE (form_id, order_index);
ALTER TABLE public.grant_scheme ADD CONSTRAINT grant_scheme_code_key UNIQUE (code);
ALTER TABLE public.guidance_binding ADD CONSTRAINT uq_binding UNIQUE (question_id, resource_id);
ALTER TABLE public.org_unit ADD CONSTRAINT org_unit_code_key UNIQUE (code);
ALTER TABLE public.person ADD CONSTRAINT person_email_key UNIQUE (email);
ALTER TABLE public.question_option ADD CONSTRAINT uq_question_value UNIQUE (question_id, value_key);
ALTER TABLE public.submission ADD CONSTRAINT submission_submission_uid_key UNIQUE (submission_uid);
ALTER TABLE public.submission_draft ADD CONSTRAINT submission_draft_draft_uid_key UNIQUE (draft_uid);
ALTER TABLE public.submission_draft_answer ADD CONSTRAINT uq_draft_question UNIQUE (draft_id, question_id);

-- =============================================
-- SECTION 7: INDEXES
-- =============================================

CREATE INDEX idx_answer_submission ON public.answer USING btree (submission_id);
CREATE UNIQUE INDEX uq_answer_unique ON public.answer USING btree (submission_id, question_id);
CREATE INDEX idx_att_submission ON public.attachment USING btree (submission_id);
CREATE INDEX idx_brule_question ON public.branch_rule USING btree (question_id, order_index);
CREATE INDEX idx_consent_submission ON public.consent_log USING btree (submission_id);
CREATE INDEX idx_email_status_next ON public.email_message USING btree (status, next_attempt_at);
CREATE INDEX idx_email_submission ON public.email_message USING btree (submission_id);
CREATE UNIQUE INDEX uq_tpl_scope_name ON public.email_template USING btree (form_id, name);
CREATE INDEX idx_export_filter ON public.export_job USING btree (form_id, workflow_type, date_from, date_to);
CREATE INDEX idx_export_status_time ON public.export_job USING btree (status, created_at);
CREATE UNIQUE INDEX uq_form_section_order ON public.form_section USING btree (form_id, order_index);
CREATE INDEX idx_binding_form_q ON public.guidance_binding USING btree (form_id, question_id);
CREATE INDEX idx_binding_q_order ON public.guidance_binding USING btree (question_id, display_order);
CREATE UNIQUE INDEX uq_binding ON public.guidance_binding USING btree (question_id, resource_id);
CREATE INDEX ft_title_summary ON public.guidance_resource USING gin (to_tsvector('simple'::regconfig, (((COALESCE(title, ''::character varying))::text || ' '::text) || COALESCE(summary, ''::text))));
CREATE INDEX idx_gslog_created ON public.guidance_search_log USING btree (created_at);
CREATE INDEX idx_gtrig_active ON public.guidance_trigger USING btree (active, weight);
CREATE INDEX idx_gtrig_keyword ON public.guidance_trigger USING btree (keyword);
CREATE INDEX idx_gtrig_scope ON public.guidance_trigger USING btree (form_id, question_id);
CREATE INDEX idx_org_unit_type_active ON public.org_unit USING btree (unit_type, active);
CREATE INDEX idx_person_name ON public.person USING btree (name);
CREATE INDEX idx_question_form_order ON public.question USING btree (form_id, order_index);
CREATE UNIQUE INDEX uq_question_value ON public.question_option USING btree (question_id, value_key);
CREATE INDEX idx_submission_form_time ON public.submission USING btree (form_id, created_at);
CREATE INDEX idx_submission_type_time ON public.submission USING btree (workflow_type, created_at);
CREATE INDEX idx_draft_expiry ON public.submission_draft USING btree (expires_at);
CREATE UNIQUE INDEX uq_draft_question ON public.submission_draft_answer USING btree (draft_id, question_id);
CREATE INDEX idx_status_sub_time ON public.submission_status_history USING btree (submission_id, changed_at);
CREATE INDEX idx_vrule_question ON public.validation_rule USING btree (question_id, order_index);

-- =============================================
-- COMMENTS & DOCUMENTATION
-- =============================================

COMMENT ON TABLE public.form IS 'Stores form definitions and metadata';
COMMENT ON TABLE public.form_details IS 'JSON-based form field configurations';
COMMENT ON TABLE public.form_results IS 'JSON-based form submission results';
COMMENT ON TABLE public.submission IS 'Form submissions and workflow tracking';
COMMENT ON TABLE public.answer IS 'Individual answers to form questions';
COMMENT ON TABLE public.guidance_resource IS 'Contextual help and guidance resources';
COMMENT ON TABLE public.email_message IS 'Email queue and delivery tracking';
COMMENT ON TABLE public.export_job IS 'Asynchronous data export jobs';

-- =============================================
-- END OF SCHEMA
-- =============================================
