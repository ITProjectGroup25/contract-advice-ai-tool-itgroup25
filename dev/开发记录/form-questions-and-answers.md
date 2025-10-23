# Contract Advice Form - All Questions and Answers

## Overview
This form has two main paths based on query type: **Simple** or **Complex**

---

## SECTION 1: Basic Information (All Users)

### Q1: Your Name
- Type: Text input
- Required: Yes
- User enters their full name

### Q2: Your Email
- Type: Email input
- Required: Yes
- User enters their email address

---

## SECTION 2: Grants Team (All Users)

### Q3: Grants Team
- Type: Multiple choice (checkboxes)
- Required: Yes
- Options:
  - Health and Medical
  - International
  - ARC-D
  - RDS
  - Research Infrastructure

---

## SECTION 3: Stage of Query (All Users)

### Q4: Stage of Query
- Type: Single choice (radio buttons)
- Required: Yes
- Options:
  - Pre-Award
  - Post-Award
  - Other (with text field)

---

## SECTION 4: Query Type (All Users) - CRITICAL BRANCHING POINT

### Q5: Query Type
- Type: Single choice (radio buttons)
- Required: Yes
- Options:
  - **Simple** → Goes to Simple Query path
  - **Complex** → Goes to Complex Query path

---

# SIMPLE QUERY PATH

## SECTION 5: Grants Scheme (Simple)

### Q6: Grants Scheme
- Type: Multiple choice (checkboxes)
- Required: Yes
- Shown when: Query Type = Simple
- Options:
  - NHMRC
  - MRFF
  - ARC
  - ECR
  - NIH
  - Other (with text field)

---

## SECTION 6: MRI Involvement (Simple)

### Q7: MRI Involvement
- Type: Single choice (radio buttons)
- Required: Yes
- Shown when: Query Type = Simple
- Options:
  - Yes
  - No
  - Other (with text field)

---

## SECTION 7: Type of Query (Simple)

### Q8: Type of Query
- Type: Multiple choice (checkboxes)
- Required: Yes
- Shown when: Query Type = Simple
- Options:
  - Review of a contractual clause → Triggers Q9
  - Support with negotiations
  - Advice on appropriate agreement
  - Advice on compliance with grant obligations
  - Other (with text field)

---

## SECTION 8: Request Details (Simple)

### Q9: What type of clause requires review?
- Type: Multiple choice (checkboxes)
- Required: Yes
- Shown when: "Review of a contractual clause" is selected in Q8
- Options:
  - Background IP
  - Project IP
  - Liability
  - Indemnity
  - Warranty
  - Insurance
  - Publication
  - Moral Rights
  - Other (with text field)

### Q10: Have you checked the guide?
- Type: Single choice (radio buttons)
- Required: Yes
- Shown when: Any clause type is selected in Q9 (except "Other")
- Options:
  - Yes - I have checked the guide
  - No - Please direct me to the guide

### Q11: Request Explanation
- Type: Long text (textarea)
- Required: Yes
- Shown when: Query Type = Simple
- User describes their request in detail

### Q12: Is there urgency on this request?
- Type: Single choice (radio buttons)
- Required: Yes
- Shown when: Query Type = Simple
- Options:
  - Yes → Triggers Q13
  - No

### Q13: Please provide the date by which you need this completed
- Type: Date picker
- Required: No
- Shown when: Urgency = Yes

---

# COMPLEX QUERY PATH

## SECTION 9: Grants Scheme (Complex)

### Q14: Grants Scheme
- Type: Multiple choice (checkboxes)
- Required: Yes
- Shown when: Query Type = Complex
- Options:
  - NHMRC
  - MRFF
  - ARC
  - ECR
  - NIH
  - Other (with text field)

---

## SECTION 10: MRI Involvement (Complex)

### Q15: Does this involve an MRI?
- Type: Multiple choice (checkboxes)
- Required: Yes
- Shown when: Query Type = Complex
- Options:
  - Yes
  - No
  - Other (with text field)

---

## SECTION 11: Project Details (Complex)

### Q16: Chief Investigator
- Type: Text input
- Required: Yes
- Shown when: Query Type = Complex
- User enters Chief Investigator name

### Q17: Faculty and Department
- Type: Text input
- Required: Yes
- Shown when: Query Type = Complex
- User enters faculty and department

### Q18: Project Title
- Type: Text input
- Required: Yes
- Shown when: Query Type = Complex
- User enters project title

### Q19: Is UOM the lead?
- Type: Multiple choice (checkboxes)
- Required: Yes
- Shown when: Query Type = Complex
- Options:
  - Lead
  - Non-Lead

---

## SECTION 12: Project Parties (Complex)

### Q20: Are there other parties involved in the Project?
- Type: Single choice (radio buttons)
- Required: Yes
- Shown when: Query Type = Complex
- Options:
  - Yes → Triggers Party 1 questions
  - No

### Q21: Other Party 1 - Name
- Type: Text input
- Required: Yes
- Shown when: Q20 = Yes
- User enters name of first other party

### Q22: Other Party 1 - Role in the project
- Type: Single choice (radio buttons)
- Required: Yes
- Shown when: Q20 = Yes
- Options:
  - Funder
  - Administering Organisation
  - Collaborator
  - Incoming party
  - Outgoing party
  - Other (with text field)

### Q23: Are there other parties involved?
- Type: Single choice (radio buttons)
- Required: Yes
- Shown when: Q20 = Yes
- Options:
  - Yes → Triggers Party 2 questions
  - No

### Q24: Other Party 2 - Name
- Type: Text input
- Required: Yes
- Shown when: Q23 = Yes
- User enters name of second other party

### Q25: Other Party 2 - Role in the project
- Type: Single choice (radio buttons)
- Required: Yes
- Shown when: Q23 = Yes
- Options:
  - Funder
  - Administering Organisation
  - Collaborator
  - Incoming party
  - Outgoing party
  - Other (with text field)

### Q26: Are there other parties involved? (for Party 3)
- Type: Single choice (radio buttons)
- Required: Yes
- Shown when: Q23 = Yes
- Options:
  - Yes → Triggers Party 3 questions
  - No

### Q27: Other Party 3 - Name
- Type: Text input
- Required: Yes
- Shown when: Q26 = Yes
- User enters name of third other party

### Q28: Other Party 3 - Role in the project
- Type: Single choice (radio buttons)
- Required: Yes
- Shown when: Q26 = Yes
- Options:
  - Funder
  - Administering Organisation
  - Collaborator
  - Incoming party
  - Outgoing party
  - Other (with text field)

---

## SECTION 13: Agreement Information (Complex)

### Q29: Type of Agreement for review
- Type: Multiple choice (checkboxes)
- Required: Yes
- Shown when: Query Type = Complex
- Options:
  - Multi-institutional agreement
  - Collaboration agreement
  - Partner organisation letter
  - Acquisition of services agreement
  - Novation agreement
  - Accession agreement
  - Subaward agreement
  - Subcontract agreement
  - Variation agreement
  - Funding agreement
  - Other (with text field)

---

## SECTION 14: Support Required (Complex)

### Q30: HPECM reference
- Type: Long text (textarea)
- Required: No
- Shown when: Query Type = Complex
- User enters HPECM reference number

### Q31: Are there other agreements that relate to this project?
- Type: Long text (textarea)
- Required: No
- Shown when: Query Type = Complex
- User describes other related agreements

### Q32: How can we help?
- Type: Long text (textarea)
- Required: Yes
- Shown when: Query Type = Complex
- User describes what help they need

### Q33: Other notes
- Type: Long text (textarea)
- Required: No
- Shown when: Query Type = Complex
- User can add any additional notes

### Q34: Attach all relevant documents
- Type: Long text (textarea)
- Required: Yes
- Shown when: Query Type = Complex
- User provides online drive link to documents
- Note: Should include Google Drive or OneDrive link

### Q35: Document List
- Type: Long text (textarea)
- Required: No
- Shown when: Query Type = Complex
- User lists the documents they have attached

### Q36: Is there urgency on this request?
- Type: Single choice (radio buttons)
- Required: Yes
- Shown when: Query Type = Complex
- Options:
  - Yes → Triggers Q37
  - No

### Q37: Please provide the date by which you need this completed
- Type: Date picker
- Required: No
- Shown when: Q36 = Yes

---

# Summary Statistics

## Total Questions
- **Simple Query Path**: 13 questions (Q1-Q13)
- **Complex Query Path**: 37 questions maximum (Q1-Q5, Q14-Q37)
  - Without additional parties: 23 questions
  - With 1 additional party: 29 questions
  - With 2 additional parties: 33 questions
  - With 3 additional parties: 37 questions

## Question Types
- Text input: 8 questions
- Email input: 1 question
- Long text (textarea): 9 questions
- Single choice (radio): 11+ questions
- Multiple choice (checkbox): 8 questions
- Date picker: 2 questions

## Conditional Logic
- Main branching: Query Type (Simple vs Complex)
- Simple path conditionals:
  - Clause type review questions (based on "contractual" selection)
  - Urgency date (based on urgency yes/no)
- Complex path conditionals:
  - Party details (up to 3 parties can be added dynamically)
  - Urgency date (based on urgency yes/no)

## Key Answer Options

### Grants Schemes (appears in both paths)
- NHMRC
- MRFF
- ARC
- ECR
- NIH
- Other

### Clause Types (Simple query only)
- Background IP
- Project IP
- Liability
- Indemnity
- Warranty
- Insurance
- Publication
- Moral Rights

### Agreement Types (Complex query only)
- Multi-institutional agreement
- Collaboration agreement
- Partner organisation letter
- Acquisition of services agreement
- Novation agreement
- Accession agreement
- Subaward agreement
- Subcontract agreement
- Variation agreement
- Funding agreement

### Party Roles (Complex query only)
- Funder
- Administering Organisation
- Collaborator
- Incoming party
- Outgoing party

---

# Form Flow Diagram

```
Start
  ↓
Basic Info (Q1-Q2)
  ↓
Grants Team (Q3)
  ↓
Stage of Query (Q4)
  ↓
Query Type (Q5)
  ↓
  ├─→ SIMPLE
  │     ↓
  │   Grants Scheme (Q6)
  │     ↓
  │   MRI Involvement (Q7)
  │     ↓
  │   Type of Query (Q8)
  │     ↓
  │   ├─→ If "Contractual" selected
  │   │     ↓
  │   │   Clause Type (Q9)
  │   │     ↓
  │   │   Guide Check (Q10)
  │   │
  │   Request Explanation (Q11)
  │     ↓
  │   Urgency (Q12)
  │     ↓
  │   └─→ If Yes: Date (Q13)
  │     ↓
  │   Submit
  │
  └─→ COMPLEX
        ↓
      Grants Scheme (Q14)
        ↓
      MRI Involvement (Q15)
        ↓
      Project Details (Q16-Q19)
        ↓
      Other Parties? (Q20)
        ↓
      ├─→ If Yes:
      │     Party 1 Info (Q21-Q22)
      │       ↓
      │     More parties? (Q23)
      │       ↓
      │     ├─→ If Yes:
      │     │     Party 2 Info (Q24-Q25)
      │     │       ↓
      │     │     More parties? (Q26)
      │     │       ↓
      │     │     └─→ If Yes:
      │     │           Party 3 Info (Q27-Q28)
      │     
      Agreement Type (Q29)
        ↓
      Support Required (Q30-Q35)
        ↓
      Urgency (Q36)
        ↓
      └─→ If Yes: Date (Q37)
        ↓
      Submit
```
