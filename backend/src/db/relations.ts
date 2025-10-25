import { relations } from "drizzle-orm/relations";
import {
  orgUnit,
  form,
  formSection,
  exportJob,
  person,
  question,
  validationRule,
  guidanceResource,
  guidanceSearchLog,
  submission,
  questionOption,
  branchRule,
  submissionStatusHistory,
  consentLog,
  answer,
  attachment,
  emailMessage,
  submissionDraft,
  submissionDraftAnswer,
  grantSupportFaqs,
  formDefaultRecipient,
  submissionDraftAnswerMulti,
  answerMultiValue,
  adminUser,
  adminUserRole,
  emailAttachmentMap,
  validationRuleParam,
} from "./schema";

export const orgUnitRelations = relations(orgUnit, ({ one, many }) => ({
  orgUnit: one(orgUnit, {
    fields: [orgUnit.parentId],
    references: [orgUnit.id],
    relationName: "orgUnit_parentId_orgUnit_id",
  }),
  orgUnits: many(orgUnit, {
    relationName: "orgUnit_parentId_orgUnit_id",
  }),
  people: many(person),
}));

export const formSectionRelations = relations(formSection, ({ one, many }) => ({
  form: one(form, {
    fields: [formSection.formId],
    references: [form.id],
  }),
  questions: many(question),
}));

export const formRelations = relations(form, ({ many }) => ({
  formSections: many(formSection),
  exportJobs: many(exportJob),
  questions: many(question),
  submissions: many(submission),
  submissionDrafts: many(submissionDraft),
  grantSupportFaqs: many(grantSupportFaqs),
  formDefaultRecipients: many(formDefaultRecipient),
}));

export const exportJobRelations = relations(exportJob, ({ one }) => ({
  form: one(form, {
    fields: [exportJob.formId],
    references: [form.id],
  }),
}));

export const personRelations = relations(person, ({ one }) => ({
  orgUnit: one(orgUnit, {
    fields: [person.orgUnitId],
    references: [orgUnit.id],
  }),
}));

export const questionRelations = relations(question, ({ one, many }) => ({
  form: one(form, {
    fields: [question.formId],
    references: [form.id],
  }),
  formSection: one(formSection, {
    fields: [question.sectionId],
    references: [formSection.id],
  }),
  validationRules: many(validationRule),
  questionOptions: many(questionOption),
  branchRules: many(branchRule),
  answers: many(answer),
  attachments: many(attachment),
  submissionDraftAnswers: many(submissionDraftAnswer),
}));

export const validationRuleRelations = relations(validationRule, ({ one, many }) => ({
  question: one(question, {
    fields: [validationRule.questionId],
    references: [question.id],
  }),
  validationRuleParams: many(validationRuleParam),
}));

export const guidanceSearchLogRelations = relations(guidanceSearchLog, ({ one }) => ({
  guidanceResource: one(guidanceResource, {
    fields: [guidanceSearchLog.clickedResourceId],
    references: [guidanceResource.id],
  }),
  submission: one(submission, {
    fields: [guidanceSearchLog.submissionId],
    references: [submission.id],
  }),
}));

export const guidanceResourceRelations = relations(guidanceResource, ({ many }) => ({
  guidanceSearchLogs: many(guidanceSearchLog),
}));

export const submissionRelations = relations(submission, ({ one, many }) => ({
  guidanceSearchLogs: many(guidanceSearchLog),
  form: one(form, {
    fields: [submission.formId],
    references: [form.id],
  }),
  submissionStatusHistories: many(submissionStatusHistory),
  consentLogs: many(consentLog),
  answers: many(answer),
  attachments: many(attachment),
  emailMessages: many(emailMessage),
}));

export const questionOptionRelations = relations(questionOption, ({ one }) => ({
  question: one(question, {
    fields: [questionOption.questionId],
    references: [question.id],
  }),
}));

export const branchRuleRelations = relations(branchRule, ({ one }) => ({
  question: one(question, {
    fields: [branchRule.questionId],
    references: [question.id],
  }),
}));

export const submissionStatusHistoryRelations = relations(submissionStatusHistory, ({ one }) => ({
  submission: one(submission, {
    fields: [submissionStatusHistory.submissionId],
    references: [submission.id],
  }),
}));

export const consentLogRelations = relations(consentLog, ({ one }) => ({
  submission: one(submission, {
    fields: [consentLog.submissionId],
    references: [submission.id],
  }),
}));

export const answerRelations = relations(answer, ({ one, many }) => ({
  question: one(question, {
    fields: [answer.questionId],
    references: [question.id],
  }),
  submission: one(submission, {
    fields: [answer.submissionId],
    references: [submission.id],
  }),
  answerMultiValues: many(answerMultiValue),
}));

export const attachmentRelations = relations(attachment, ({ one, many }) => ({
  question: one(question, {
    fields: [attachment.questionId],
    references: [question.id],
  }),
  submission: one(submission, {
    fields: [attachment.submissionId],
    references: [submission.id],
  }),
  emailAttachmentMaps: many(emailAttachmentMap),
}));

export const emailMessageRelations = relations(emailMessage, ({ one, many }) => ({
  submission: one(submission, {
    fields: [emailMessage.submissionId],
    references: [submission.id],
  }),
  emailAttachmentMaps: many(emailAttachmentMap),
}));

export const submissionDraftRelations = relations(submissionDraft, ({ one, many }) => ({
  form: one(form, {
    fields: [submissionDraft.formId],
    references: [form.id],
  }),
  submissionDraftAnswers: many(submissionDraftAnswer),
}));

export const submissionDraftAnswerRelations = relations(submissionDraftAnswer, ({ one, many }) => ({
  submissionDraft: one(submissionDraft, {
    fields: [submissionDraftAnswer.draftId],
    references: [submissionDraft.id],
  }),
  question: one(question, {
    fields: [submissionDraftAnswer.questionId],
    references: [question.id],
  }),
  submissionDraftAnswerMultis: many(submissionDraftAnswerMulti),
}));

export const grantSupportFaqsRelations = relations(grantSupportFaqs, ({ one }) => ({
  form: one(form, {
    fields: [grantSupportFaqs.formId],
    references: [form.id],
  }),
}));

export const formDefaultRecipientRelations = relations(formDefaultRecipient, ({ one }) => ({
  form: one(form, {
    fields: [formDefaultRecipient.formId],
    references: [form.id],
  }),
}));

export const submissionDraftAnswerMultiRelations = relations(
  submissionDraftAnswerMulti,
  ({ one }) => ({
    submissionDraftAnswer: one(submissionDraftAnswer, {
      fields: [submissionDraftAnswerMulti.draftAnswerId],
      references: [submissionDraftAnswer.id],
    }),
  })
);

export const answerMultiValueRelations = relations(answerMultiValue, ({ one }) => ({
  answer: one(answer, {
    fields: [answerMultiValue.answerId],
    references: [answer.id],
  }),
}));

export const adminUserRoleRelations = relations(adminUserRole, ({ one }) => ({
  adminUser: one(adminUser, {
    fields: [adminUserRole.adminUserId],
    references: [adminUser.id],
  }),
}));

export const adminUserRelations = relations(adminUser, ({ many }) => ({
  adminUserRoles: many(adminUserRole),
}));

export const emailAttachmentMapRelations = relations(emailAttachmentMap, ({ one }) => ({
  attachment: one(attachment, {
    fields: [emailAttachmentMap.attachmentId],
    references: [attachment.id],
  }),
  emailMessage: one(emailMessage, {
    fields: [emailAttachmentMap.emailId],
    references: [emailMessage.id],
  }),
}));

export const validationRuleParamRelations = relations(validationRuleParam, ({ one }) => ({
  validationRule: one(validationRule, {
    fields: [validationRuleParam.ruleId],
    references: [validationRule.id],
  }),
}));
