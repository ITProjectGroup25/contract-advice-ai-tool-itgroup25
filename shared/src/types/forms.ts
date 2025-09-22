export type FieldOptionSelectModel = {
  id: number;
  text: string;
  value?: string | null;
};

export type QuestionSelectModel = {
  id: number;
  text: string;
  description?: string | null;
  fieldType?: string | null;
  fieldOptions: FieldOptionSelectModel[];
};

export type FormSelectModel = {
  id: number;
  formID?: string | null;
  name: string;
  description?: string | null;
  createdAt: string | Date;
};

export type FormWithQuestions = FormSelectModel & {
  questions: Array<QuestionSelectModel>;
};
