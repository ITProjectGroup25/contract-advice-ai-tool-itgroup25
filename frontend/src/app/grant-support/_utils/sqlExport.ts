import { localDB, FormSubmission } from "./localDatabase";

interface FormData {
  [key: string]: any;
}

interface Question {
  id: string;
  title: string;
  type: string;
  section: string;
  required: boolean;
}

interface FileData {
  name: string;
  size: number;
  type: string;
  data: string; // base64 encoded
}

export function generateSQLFromFormData(
  formData: FormData,
  questions: Question[],
  submissionId: string = `submission_${Date.now()}`
): string {
  const timestamp = new Date().toISOString();

  // Create the main submissions table
  let sql = `-- Form Submission Export\n`;
  sql += `-- Generated on: ${timestamp}\n`;
  sql += `-- Submission ID: ${submissionId}\n\n`;

  // Create tables if they don't exist
  sql += `-- Create submissions table\n`;
  sql += `CREATE TABLE IF NOT EXISTS form_submissions (\n`;
  sql += `  id VARCHAR(255) PRIMARY KEY,\n`;
  sql += `  submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n`;
  sql += `  query_type VARCHAR(50),\n`;
  sql += `  status VARCHAR(50) DEFAULT 'submitted'\n`;
  sql += `);\n\n`;

  sql += `-- Create submission responses table\n`;
  sql += `CREATE TABLE IF NOT EXISTS submission_responses (\n`;
  sql += `  id INT AUTO_INCREMENT PRIMARY KEY,\n`;
  sql += `  submission_id VARCHAR(255),\n`;
  sql += `  question_id VARCHAR(255),\n`;
  sql += `  question_title TEXT,\n`;
  sql += `  question_type VARCHAR(50),\n`;
  sql += `  response_value TEXT,\n`;
  sql += `  section_name VARCHAR(255),\n`;
  sql += `  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n`;
  sql += `  FOREIGN KEY (submission_id) REFERENCES form_submissions(id)\n`;
  sql += `);\n\n`;

  sql += `-- Create file attachments table\n`;
  sql += `CREATE TABLE IF NOT EXISTS file_attachments (\n`;
  sql += `  id INT AUTO_INCREMENT PRIMARY KEY,\n`;
  sql += `  submission_id VARCHAR(255),\n`;
  sql += `  question_id VARCHAR(255),\n`;
  sql += `  file_name VARCHAR(500),\n`;
  sql += `  file_size INT,\n`;
  sql += `  file_type VARCHAR(255),\n`;
  sql += `  file_data LONGTEXT,\n`;
  sql += `  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n`;
  sql += `  FOREIGN KEY (submission_id) REFERENCES form_submissions(id)\n`;
  sql += `);\n\n`;

  // Insert main submission record
  const queryType = formData["query-type"] || "unknown";
  sql += `-- Insert main submission record\n`;
  sql += `INSERT INTO form_submissions (id, submission_date, query_type, status)\n`;
  sql += `VALUES ('${submissionId}', '${timestamp}', '${queryType}', 'submitted');\n\n`;

  // Insert individual responses
  sql += `-- Insert form responses\n`;

  for (const [fieldName, value] of Object.entries(formData)) {
    if (value === undefined || value === null || value === "") continue;

    // Find the corresponding question
    const question = questions.find((q) => q.id === fieldName);

    if (question) {
      // Handle file upload fields specially
      if (question.type === "file-upload" && Array.isArray(value)) {
        const files = value as FileData[];
        for (const file of files) {
          sql += `INSERT INTO file_attachments (submission_id, question_id, file_name, file_size, file_type, file_data)\n`;
          sql += `VALUES ('${submissionId}', '${question.id}', '${file.name.replace(/'/g, "''")}', ${file.size}, '${file.type}', '${file.data}');\n`;
        }

        // Also add a summary response
        const fileSummary = files
          .map((f) => `${f.name} (${Math.round(f.size / 1024)}KB)`)
          .join(", ");
        sql += `INSERT INTO submission_responses (submission_id, question_id, question_title, question_type, response_value, section_name)\n`;
        sql += `VALUES ('${submissionId}', '${question.id}', '${question.title.replace(/'/g, "''")}', '${question.type}', 'Files: ${fileSummary}', '${question.section}');\n`;
      } else {
        // Handle other field types
        let responseValue = "";
        if (Array.isArray(value)) {
          responseValue = value.join(", ");
        } else {
          responseValue = String(value);
        }

        // Escape single quotes in the response value
        responseValue = responseValue.replace(/'/g, "''");

        sql += `INSERT INTO submission_responses (submission_id, question_id, question_title, question_type, response_value, section_name)\n`;
        sql += `VALUES ('${submissionId}', '${question.id}', '${question.title.replace(/'/g, "''")}', '${question.type}', '${responseValue}', '${question.section}');\n`;
      }
    } else if (fieldName.includes("_other")) {
      // Handle "other" fields
      const baseFieldName = fieldName.split("_")[0];
      const baseQuestion = questions.find((q) => q.id === baseFieldName);

      if (baseQuestion && value) {
        const responseValue = String(value).replace(/'/g, "''");
        sql += `INSERT INTO submission_responses (submission_id, question_id, question_title, question_type, response_value, section_name)\n`;
        sql += `VALUES ('${submissionId}', '${fieldName}', '${baseQuestion.title} - Other Specification', 'text', '${responseValue}', '${baseQuestion.section}');\n`;
      }
    }
  }

  sql += `\n-- End of submission data\n`;
  sql += `-- Total responses recorded: ${Object.keys(formData).filter((key) => formData[key] !== undefined && formData[key] !== null && formData[key] !== "").length}\n`;

  return sql;
}

export function downloadSQLFile(
  sqlContent: string,
  filename: string = `form_submission_${Date.now()}.sql`
) {
  // Create a Blob with the SQL content
  const blob = new Blob([sqlContent], { type: "application/sql" });

  // Create a temporary URL for the blob
  const url = URL.createObjectURL(blob);

  // Create a temporary anchor element to trigger the download
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(url);
}

export async function exportFormSubmissionAsSQL(
  formData: FormData,
  questions: Question[],
  queryType: "simple" | "complex",
  options?: { filename?: string; submissionId?: string }
): Promise<string> {
  const submissionId =
    options?.submissionId ?? `submission_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  const sqlContent = generateSQLFromFormData(formData, questions, submissionId);
  const submission: FormSubmission = {
    id: submissionId,
    timestamp: new Date().toISOString(),
    queryType,
    formData,
    sqlStatement: sqlContent,
    status: "submitted",
  };

  try {
    await localDB.saveSubmission(submission);
    console.log("Form submission saved to local database:", submissionId);
  } catch (error) {
    console.error("Error saving to local database:", error);
  }

  return submissionId;
}
