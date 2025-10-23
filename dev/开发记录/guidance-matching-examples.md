# Guidance Matching Examples - Answer to Response Mapping

This document provides concrete examples of how user answers should map to guidance responses.

## Example 1: Simple Query - Background IP Review

### User's Submission

```json
{
  "name": "Dr. Sarah Chen",
  "email": "sarah.chen@university.edu.au",
  "grants-team": ["health-medical"],
  "stage-of-query": "pre-award",
  "query-type": "simple",
  "simple-grants-scheme": ["nhmrc"],
  "simple-mri-involvement": "no",
  "simple-type-of-query": ["contractual"],
  "simple-clause-type": ["background-ip"],
  "simple-guide-check": "yes",
  "simple-request-explanation": "I need to review the background IP clause in my NHMRC collaboration agreement with XYZ University. They want rights to use our existing research tools.",
  "simple-urgency": "yes",
  "simple-urgency-date": "2025-10-20"
}
```

### System Should Return

```json
{
  "submissionId": "SR-20251016-001",
  "queryType": "simple",
  "response": {
    "message": "Based on your query about Background IP clauses in NHMRC agreements, here are the relevant resources:",
    "guidanceResources": [
      {
        "id": 1,
        "resourceType": "HTML",
        "title": "Background IP Clause Guidelines",
        "summary": "Understanding and negotiating background intellectual property clauses",
        "contentHtml": "<div class='guidance'><h2>Background IP in NHMRC Grants</h2><p><strong>Definition:</strong> Background IP refers to intellectual property that exists before the project commences.</p><h3>Key Points for Your Review:</h3><ul><li><strong>Ownership:</strong> Background IP should remain with the original owner (your institution)</li><li><strong>Access Rights:</strong> Collaborators may request limited access rights for the specific project</li><li><strong>Licensing:</strong> Consider granting a non-exclusive license rather than ownership transfer</li><li><strong>Restrictions:</strong> Include restrictions on commercial use of your background IP</li></ul><h3>Standard NHMRC Position:</h3><p>NHMRC typically expects background IP to remain with the originating institution. Collaborators should only receive access necessary for the project.</p><h3>Recommended Clause Language:</h3><code>Each party retains ownership of its Background IP. Party A grants Party B a non-exclusive, royalty-free license to use Background IP solely for the purposes of this Project.</code></div>",
        "matchReason": "Matched based on: simple-clause-type = 'background-ip' AND simple-grants-scheme = 'nhmrc'",
        "displayOrder": 1
      },
      {
        "id": 2,
        "resourceType": "Link",
        "title": "EAAC Grants Training Guide - IP Section",
        "summary": "Official guide covering IP management in research agreements (Section 4.2)",
        "contentUri": "/documents/EAAC-Grants-Training-Guide-May2024.pdf#page=42",
        "matchReason": "User confirmed checking the guide",
        "displayOrder": 2
      },
      {
        "id": 3,
        "resourceType": "HTML",
        "title": "Collaboration Agreement Checklist",
        "summary": "Step-by-step checklist for reviewing collaboration agreements",
        "contentHtml": "<div><h3>IP Clause Review Checklist:</h3><ol><li>✓ Verify background IP ownership remains with original owner</li><li>✓ Check scope of access rights granted to collaborators</li><li>✓ Confirm limitations on commercial use</li><li>✓ Review termination provisions for IP licenses</li><li>✓ Ensure confidentiality obligations protect background IP</li></ol></div>",
        "matchReason": "Matched based on: simple-type-of-query = 'contractual'",
        "displayOrder": 3
      }
    ],
    "recommendations": [
      "Review clause 4.2 of the EAAC Training Guide for specific NHMRC requirements",
      "Ensure the agreement specifies that your institution retains ownership of all background IP",
      "If collaborator requests are too broad, suggest limiting to 'reasonable access for project purposes only'",
      "Given the urgency (due: 2025-10-20), you may escalate to grants team if you need immediate assistance"
    ],
    "urgentNotice": {
      "show": true,
      "message": "You indicated this is urgent (due: Oct 20, 2025). If the provided guidance doesn't resolve your query, please escalate to the grants team immediately.",
      "daysUntilDue": 4
    }
  }
}
```

---

## Example 2: Simple Query - Multiple Clause Types

### User's Submission

```json
{
  "name": "Prof. John Williams",
  "email": "j.williams@university.edu.au",
  "grants-team": ["international", "arc-d"],
  "stage-of-query": "post-award",
  "query-type": "simple",
  "simple-grants-scheme": ["arc"],
  "simple-mri-involvement": "yes",
  "simple-type-of-query": ["contractual", "compliance-advice"],
  "simple-clause-type": ["liability", "indemnity", "insurance"],
  "simple-guide-check": "no",
  "simple-request-explanation": "Our ARC project involves an MRI facility. The facility owner wants us to accept unlimited liability and provide $10M insurance. Is this standard?",
  "simple-urgency": "no"
}
```

### System Should Return

```json
{
  "submissionId": "SR-20251016-002",
  "queryType": "simple",
  "response": {
    "message": "Your query involves liability, indemnity, and insurance clauses in an ARC-funded MRI project. Here's comprehensive guidance:",
    "guidanceResources": [
      {
        "id": 10,
        "resourceType": "HTML",
        "title": "⚠️ EAAC Grants Training Guide - Must Read First",
        "summary": "You indicated you haven't checked the guide yet. This is essential reading before proceeding.",
        "contentHtml": "<div class='alert-warning'><h2>Important Notice</h2><p>The EAAC Grants Training Guide contains essential information about liability, indemnity, and insurance clauses. Please review this first:</p><a href='/documents/EAAC-Grants-Training-Guide-May2024.pdf' class='btn-primary'>Download EAAC Training Guide</a><p><strong>Relevant Sections:</strong></p><ul><li>Section 5.1: Liability Limitations</li><li>Section 5.2: Indemnity Clauses</li><li>Section 5.3: Insurance Requirements</li></ul></div>",
        "matchReason": "User answered 'no' to simple-guide-check",
        "displayOrder": 1,
        "priority": "high"
      },
      {
        "id": 4,
        "resourceType": "HTML",
        "title": "Liability Clauses in Research Agreements",
        "summary": "Understanding and negotiating liability limitations",
        "contentHtml": "<div><h2>Liability Clauses - Key Principles</h2><h3>University Policy on Liability:</h3><p>The University <strong>does not accept unlimited liability</strong> in research agreements.</p><h3>Standard Position:</h3><ul><li><strong>Direct Damages Only:</strong> Liability should be limited to direct damages only, excluding consequential losses</li><li><strong>Cap Amount:</strong> Liability typically capped at the lower of:<ul><li>Grant value, or</li><li>$1 million per incident</li></ul></li><li><strong>Exclusions:</strong> Exclude liability for acts of third parties, force majeure, and events beyond reasonable control</li></ul><h3>⚠️ Red Flags in Your Case:</h3><p class='warning'>Unlimited liability is <strong>not acceptable</strong> and conflicts with university policy. This must be negotiated.</p></div>",
        "matchReason": "Matched: simple-clause-type includes 'liability'",
        "displayOrder": 2
      },
      {
        "id": 5,
        "resourceType": "HTML",
        "title": "Indemnity Clauses - What's Acceptable",
        "summary": "Guidelines for reviewing and negotiating indemnity provisions",
        "contentHtml": "<div><h2>Indemnity Clauses</h2><h3>University Position:</h3><ul><li><strong>Mutual Indemnity Preferred:</strong> Both parties should indemnify each other for their own negligent acts</li><li><strong>Scope Limitations:</strong> Indemnity should be limited to direct, proven losses</li><li><strong>No Third-Party Indemnity:</strong> University does not indemnify for third-party actions</li></ul><h3>Standard Acceptable Language:</h3><code>Each party shall indemnify the other for direct losses arising solely from its own negligent acts or omissions, up to the liability cap specified in this agreement.</code></div>",
        "matchReason": "Matched: simple-clause-type includes 'indemnity'",
        "displayOrder": 3
      },
      {
        "id": 6,
        "resourceType": "HTML",
        "title": "Insurance Requirements for MRI Facilities",
        "summary": "Standard insurance coverage for research involving specialized equipment",
        "contentHtml": "<div><h2>Insurance for MRI Facility Use</h2><h3>Standard University Coverage:</h3><ul><li><strong>Public Liability:</strong> $20 million (standard university policy)</li><li><strong>Professional Indemnity:</strong> $20 million</li><li><strong>Property Insurance:</strong> Covers university equipment</li></ul><h3>⚠️ Assessment of $10M Requirement:</h3><p>The facility's request for $10M insurance is <strong>within reasonable range</strong> and covered by the university's existing public liability policy ($20M).</p><h3>What You Need to Do:</h3><ol><li>Confirm with Risk Management that current coverage applies to this MRI facility use</li><li>Request Certificate of Currency from Risk Management</li><li>Provide certificate to facility owner</li></ol><p><strong>Contact:</strong> riskmanagement@university.edu.au</p></div>",
        "matchReason": "Matched: simple-clause-type includes 'insurance' AND simple-mri-involvement = 'yes'",
        "displayOrder": 4
      },
      {
        "id": 7,
        "resourceType": "Link",
        "title": "ARC Compliance Requirements",
        "summary": "Official ARC guidelines for post-award agreement management",
        "contentUri": "https://www.arc.gov.au/grants/grant-agreements",
        "matchReason": "Matched: simple-grants-scheme = 'arc' AND stage-of-query = 'post-award'",
        "displayOrder": 5
      }
    ],
    "recommendations": [
      "PRIORITY: Read EAAC Training Guide sections 5.1-5.3 before proceeding",
      "The unlimited liability clause must be negotiated - this is not acceptable under university policy",
      "The $10M insurance requirement is reasonable and likely covered by existing university insurance",
      "Contact Risk Management to obtain Certificate of Currency",
      "Suggest counter-proposal: Liability capped at $1M for direct damages only, mutual indemnity",
      "Since this is post-award and involves compliance, ensure any agreement variations are approved by ARC"
    ],
    "criticalActions": [
      {
        "priority": "critical",
        "action": "Negotiate unlimited liability clause - NOT ACCEPTABLE",
        "reason": "Conflicts with university policy"
      },
      {
        "priority": "high",
        "action": "Review EAAC Training Guide",
        "reason": "Essential prerequisite for negotiation"
      },
      {
        "priority": "medium",
        "action": "Contact Risk Management for insurance certificate",
        "reason": "Required to satisfy facility owner"
      }
    ],
    "contacts": {
      "riskManagement": "riskmanagement@university.edu.au",
      "grantsTeam": "grants@university.edu.au",
      "arcCompliance": "arc-compliance@university.edu.au"
    }
  }
}
```

---

## Example 3: Complex Query - Multi-Party Agreement

### User's Submission

```json
{
  "name": "Dr. Maria Garcia",
  "email": "m.garcia@university.edu.au",
  "grants-team": ["health-medical", "research-infrastructure"],
  "stage-of-query": "pre-award",
  "query-type": "complex",
  "complex-grants-scheme": ["nhmrc", "mrff"],
  "complex-mri-involvement": ["yes"],
  "complex-chief-investigator": "Prof. Robert Smith",
  "complex-faculty-department": "Medicine - Cardiology",
  "complex-project-title": "Advanced Cardiac Imaging Study",
  "complex-uom-lead": ["lead"],
  "complex-other-parties": "yes",
  "complex-party1-name": "Peter MacCallum Cancer Centre",
  "complex-party1-role": "collaborator",
  "complex-additional-parties": "yes",
  "complex-party2-name": "Siemens Healthineers",
  "complex-party2-role": "incoming-party",
  "complex-additional-parties-2": "no",
  "complex-agreement-types": ["multi-institutional", "collaboration", "acquisition-services"],
  "complex-hpecm-reference": "HPECM-2024-1234",
  "complex-how-can-we-help": "We need help drafting agreements with Peter Mac (research collaboration) and Siemens (MRI equipment supply and maintenance). Complex IP issues as Siemens wants access to imaging data.",
  "complex-documents-attached": "https://drive.google.com/folder/xyz123",
  "complex-urgency": "yes",
  "complex-urgency-date": "2025-10-25"
}
```

### System Should Return

```json
{
  "submissionId": "SR-20251016-003",
  "queryType": "complex",
  "status": "escalated",
  "response": {
    "message": "Your complex query has been received and assigned to the grants team for detailed review.",
    "acknowledgment": {
      "title": "Query Assigned to Grants Team",
      "description": "This involves multiple parties, complex IP arrangements, and commercial considerations. A grants advisor will review your submission and provide personalized assistance.",
      "caseNumber": "SR-20251016-003",
      "assignedTeams": ["Health and Medical", "Research Infrastructure"],
      "estimatedResponseTime": "1-2 business days",
      "dueDate": "2025-10-25",
      "priority": "high"
    },
    "preliminaryGuidance": [
      {
        "id": 20,
        "resourceType": "HTML",
        "title": "Multi-Party Agreement Overview",
        "summary": "Initial guidance while you wait for grants team review",
        "contentHtml": "<div><h2>Your Complex Query - What Happens Next</h2><h3>Your Situation:</h3><ul><li><strong>Lead Institution:</strong> University of Melbourne</li><li><strong>Collaborator:</strong> Peter MacCallum Cancer Centre</li><li><strong>Commercial Partner:</strong> Siemens Healthineers (equipment supplier)</li><li><strong>Funding:</strong> NHMRC + MRFF</li><li><strong>MRI Involvement:</strong> Yes</li></ul><h3>Key Complexity Factors:</h3><ol><li><strong>Multiple Agreement Types Needed:</strong><ul><li>Multi-institutional research agreement with Peter Mac</li><li>Collaboration agreement (research terms)</li><li>Acquisition of services agreement with Siemens</li></ul></li><li><strong>Commercial IP Considerations:</strong><ul><li>Siemens' request for imaging data access</li><li>Need to protect research IP while allowing equipment optimization</li><li>NHMRC/MRFF IP requirements must be maintained</li></ul></li><li><strong>Tripartite Considerations:</strong><ul><li>Data sharing between 3 parties</li><li>Publication rights coordination</li><li>Equipment maintenance vs. data access trade-offs</li></ul></li></ol><h3>Grants Team Will Help With:</h3><ul><li>Drafting appropriate agreement structure</li><li>Negotiating data access terms with Siemens</li><li>Ensuring NHMRC/MRFF compliance</li><li>Coordinating multi-institutional IP arrangements</li><li>Reviewing your existing documents</li></ul></div>",
        "displayOrder": 1
      },
      {
        "id": 21,
        "resourceType": "Link",
        "title": "NHMRC IP Policy for Commercial Partnerships",
        "summary": "Guidelines for managing IP when commercial entities are involved",
        "contentUri": "https://www.nhmrc.gov.au/about-us/resources/ip-commercial-partnerships",
        "displayOrder": 2
      },
      {
        "id": 22,
        "resourceType": "HTML",
        "title": "Data Sharing with Equipment Suppliers - Considerations",
        "summary": "Key issues when equipment suppliers request research data access",
        "contentHtml": "<div><h2>⚠️ Important Considerations</h2><h3>Siemens Data Access Request:</h3><p>Equipment suppliers sometimes request data access for product improvement. Key considerations:</p><ul><li><strong>Separate Agreements:</strong> Research collaboration (with Peter Mac) should be separate from equipment supply (Siemens)</li><li><strong>De-identification:</strong> Any data shared with Siemens should be de-identified</li><li><strong>Limited Purpose:</strong> Restrict data use to equipment optimization only</li><li><strong>Publication Rights:</strong> Ensure Siemens cannot publish or commercialize research findings</li><li><strong>NHMRC Compliance:</strong> Verify data sharing complies with NHMRC grant terms</li></ul><p><strong>Your grants advisor will help structure this appropriately.</strong></p></div>",
        "displayOrder": 3
      }
    ],
    "nextSteps": [
      {
        "step": 1,
        "action": "Grants Team Review",
        "description": "Advisor will review your submission and attached documents",
        "timeline": "Within 24 hours"
      },
      {
        "step": 2,
        "action": "Initial Consultation",
        "description": "Advisor will contact you to discuss requirements and strategy",
        "timeline": "24-48 hours"
      },
      {
        "step": 3,
        "action": "Agreement Drafting",
        "description": "Team will draft appropriate agreement structures",
        "timeline": "3-5 business days"
      },
      {
        "step": 4,
        "action": "Negotiation Support",
        "description": "Advisor will assist with negotiations with Peter Mac and Siemens",
        "timeline": "Ongoing"
      }
    ],
    "documentChecklist": {
      "message": "Please ensure you've attached the following (if available):",
      "items": [
        { "item": "NHMRC/MRFF grant agreement", "status": "pending" },
        { "item": "Draft agreement from Peter Mac (if any)", "status": "pending" },
        { "item": "Siemens equipment quote/proposal", "status": "pending" },
        { "item": "Project budget breakdown", "status": "pending" },
        { "item": "Ethics approval documents", "status": "pending" }
      ]
    },
    "urgencyNotice": {
      "priority": "high",
      "message": "Due date: October 25, 2025 (9 days). Given the complexity and urgency, a senior advisor will prioritize your case.",
      "escalationLevel": "senior-advisor"
    },
    "contactInfo": {
      "primaryContact": {
        "name": "Grants Team",
        "email": "grants@university.edu.au",
        "phone": "+61 3 9035 5511"
      },
      "assignedAdvisor": "Will be assigned within 24 hours",
      "officeHours": "Monday-Friday, 9:00 AM - 5:00 PM AEST"
    }
  },
  "notifications": {
    "userEmailSent": true,
    "grantTeamNotified": true,
    "documentsReceived": true,
    "hpecmLinked": "HPECM-2024-1234"
  }
}
```

---

## Matching Rules Summary

### 1. Direct Question Binding
- When user selects specific options, return directly bound resources
- Example: `simple-clause-type = "background-ip"` → Background IP Guide

### 2. Multi-Answer Matching
- When multiple clause types selected, return resources for each
- Example: `simple-clause-type = ["liability", "indemnity", "insurance"]` → All three guides

### 3. Conditional Logic
- Combine answers for more specific guidance
- Example: `grants-scheme = "nhmrc" AND clause-type = "background-ip"` → NHMRC-specific IP guide

### 4. Priority-Based Display
- Critical warnings first (e.g., haven't checked guide)
- Most relevant content next
- General resources last

### 5. Escalation Triggers
- Complex query type → Always escalate to human
- Urgent + complicated → Higher priority
- Commercial involvement → Senior advisor

### 6. Contextual Additions
- MRI involvement → Add equipment-specific guidance
- Post-award → Add compliance reminders
- Multiple parties → Add coordination guidance

## Implementation Notes

1. **Resource Database**: Store guidance resources with metadata about triggering conditions
2. **Matching Engine**: Evaluate user answers against resource conditions
3. **Scoring System**: Calculate relevance scores based on number of matching conditions
4. **Template System**: Use templates for consistent response formatting
5. **Dynamic Content**: Inject user-specific data (names, dates, etc.) into response
