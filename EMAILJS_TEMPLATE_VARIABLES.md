# EmailJS Template Variables Reference

## Overview
This document lists all available variables you can use in your EmailJS templates.

## User Confirmation Email Template

Use these variables in your **User Confirmation Email** template (NEXT_PUBLIC_EMAILJS_TEMPLATE_ID):

### User Information
- `{{user_name}}` or `{{userName}}` or `{{submitter_name}}` or `{{submitterName}}` - User's full name
- `{{submitter_email}}` or `{{submitterEmail}}` or `{{to_email}}` - User's email address

### Submission Information
- `{{submission_id}}` or `{{submissionId}}` - Unique submission ID
- `{{query_type}}` or `{{queryType}}` - Type of query (simple/complex)
- `{{timestamp}}` or `{{date}}` - Submission date and time (formatted: "November 1, 2025, 08:59 AM")

### Form Data
- `{{form_data}}` - Raw JSON format of form data
- `{{form_data_pretty}}` or `{{formData}}` or `{{form_details}}` - Formatted form data (human-readable)

### Email Metadata
- `{{subject}}` - Email subject line

### Example Template
```
Subject: Contract Advice Request Confirmation

Dear {{user_name}},

Thank you for submitting your contract advice request.

**Submission Details:**
- Submission ID: {{submission_id}}
- Query Type: {{query_type}}
- Submitted on: {{date}}

**Your Form Details:**
{{form_details}}

Our team will review your request and get back to you shortly.

Best regards,
Contract Advice Team
```

---

## Grant Team Notification Email Template

Use these variables in your **Grant Team Notification** template (NEXT_PUBLIC_EMAILJS_GRANT_TEAM_TEMPLATE_ID):

### User Information
- `{{user_name}}` or `{{userName}}` or `{{submitter_name}}` or `{{submitterName}}` - Submitter's full name
- `{{user_email}}` or `{{submitter_email}}` or `{{submitterEmail}}` - Submitter's email address

### Submission Information
- `{{submission_id}}` or `{{submissionId}}` - Unique submission ID
- `{{query_type}}` or `{{queryType}}` - Type of query (simple/complex)
- `{{timestamp}}` or `{{date}}` - Submission date and time (formatted)

### Grant Team Specific
- `{{grant_teams}}` or `{{grantTeams}}` - Comma-separated list of selected grant teams
- `{{grant_team_list}}` - Line-separated list of grant teams (for better formatting)
- `{{urgency}}` or `{{urgency_status}}` - "URGENT" or "Normal"

### Form Data
- `{{form_data}}` - Raw JSON format of form data
- `{{form_data_pretty}}` or `{{formData}}` or `{{form_details}}` - Formatted form data (human-readable)

### Example Template
```
Subject: New Contract Advice Request - {{urgency_status}}

**New Submission Alert**

A new contract advice request has been submitted.

**Submitter Information:**
- Name: {{user_name}}
- Email: {{user_email}}

**Request Details:**
- Submission ID: {{submission_id}}
- Query Type: {{query_type}}
- Grant Teams: {{grant_teams}}
- Urgency: {{urgency_status}}
- Submitted on: {{date}}

**Form Details:**
{{form_details}}

Please review and respond accordingly.
```

---

## Date Format

The `{{timestamp}}` and `{{date}}` variables are formatted as:
- Format: `en-AU` locale
- Example: `November 1, 2025, 08:59 AM`

---

## Form Data Format

The `{{form_details}}`, `{{formData}}`, and `{{form_data_pretty}}` variables display form data in this format:

```
name: John Doe
email: john.doe@example.com
grants-team: Health and Medical, International
stage: Pre-Award
query-type: Simple
...
```

---

## Tips for Creating Templates

1. **Use multiple variable names**: The system provides multiple aliases (e.g., `user_name`, `userName`) to support different naming conventions. Pick the one you prefer.

2. **Test with sample data**: Always test your template with sample submissions before going live.

3. **HTML formatting**: EmailJS supports HTML in templates. You can use `<strong>`, `<br>`, `<ul>`, etc.

4. **Conditional content**: Some EmailJS plans support conditional blocks:
   ```
   {{#urgency}}
   ⚠️ URGENT: This request requires immediate attention
   {{/urgency}}
   ```

5. **Line breaks**: Use `<br>` for HTML templates or `\n` in plain text templates.

---

## Environment Variables

Make sure these are configured in your `.env.local`:

```env
NEXT_PUBLIC_EMAILJS_ENABLED=true
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_user_confirmation_template_id
NEXT_PUBLIC_EMAILJS_GRANT_TEAM_TEMPLATE_ID=your_grant_team_template_id
```
