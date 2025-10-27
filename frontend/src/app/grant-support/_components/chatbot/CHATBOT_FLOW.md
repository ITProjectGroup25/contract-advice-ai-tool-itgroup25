# 🤖 Chatbot Conversation Flow - Complete Guide

## 📊 Flow Diagram

```
User opens chatbot
        ↓
    [Loading FAQ data...]
        ↓
    ┌───────────┐
    │  FAQ Found? │
    └───────────┘
         ↓
    Yes ↙  ↘ No
       ↓      ↓
   [A]      [B]
```

---

## 🎯 Scenario A: FAQ Match Found

### **Step 1: Show Matched FAQ**
```
Good news! We have found pre-prepared answers for your form selections 
provided by the RIC Staff.

**Your Selections:**
**Grant Team:** ARC-D
**Is UOM the lead?:** Yes

**Answer from RIC Staff:**
[The pre-prepared answer text goes here]

Does this answer your question?

[Yes, this answers my question]  [No, I need further human assistance]
```

### **Step 2a: User Clicks "Yes"**
```
Great! I'm glad I could help. If you have any other questions in the 
future, feel free to reach out. Have a great day!

[End - No more options]
```

### **Step 2b: User Clicks "No" (Needs More Help)**
```
No problem! We have forwarded your form to the RIC staff who will 
contact you at their earliest availability.

For now, please follow the below:

**For contractual clause reviews:**
- Please refer to the EAAC Grants Training Guide for standard clause interpretations
- Common issues with Background IP, Project IP, and Liability clauses are covered in sections 3-5
- If your clause falls outside standard parameters, human review may be required

**For grant compliance queries:**
- Standard compliance requirements are outlined in your grant agreement
- Common compliance issues and solutions are available in our knowledge base
- Monthly compliance reminders are sent to all grant holders

**Next Steps:**
1. Review the relevant documentation linked above
2. If your issue is resolved, no further action is needed
3. If you need additional clarification, the RIC staff will contact you within 1-2 business days

This automated response covers approximately 80% of simple queries. If your 
specific situation requires personalized attention, our grants team will 
review your submission within 1-2 business days.

[End - No more options]
```

---

## 🚫 Scenario B: No FAQ Match Found

### **Step 1: Show Helpful Information**
```
Unfortunately, we have not found any pre-prepared answers for your form 
selections. We have forwarded your form to the RIC staff who will contact 
you at their earliest availability.

For now, please follow the below:

**For contractual clause reviews:**
- Please refer to the EAAC Grants Training Guide for standard clause interpretations
- Common issues with Background IP, Project IP, and Liability clauses are covered in sections 3-5
- If your clause falls outside standard parameters, human review may be required

**For grant compliance queries:**
- Standard compliance requirements are outlined in your grant agreement
- Common compliance issues and solutions are available in our knowledge base
- Monthly compliance reminders are sent to all grant holders

**Next Steps:**
1. Review the relevant documentation linked above
2. If your issue is resolved, no further action is needed
3. If you need additional clarification, the RIC staff will contact you within 1-2 business days

This automated response covers approximately 80% of simple queries. If your 
specific situation requires personalized attention, our grants team will 
review your submission within 1-2 business days.

[End - No more options]
```

---

## 🎨 Visual Formatting Features

### **Bold Blue Questions**
Questions are highlighted in **bold blue** text:
```html
**Grant Team:** ARC-D  <!-- "Grant Team" appears in bold blue -->
```

### **Structured Layout**
- Clear sections with headers
- Bullet points for lists
- Numbered steps for actions
- Professional formatting

---

## 📝 Example Messages

### **Example 1: FAQ Found with Selections**
```
Good news! We have found pre-prepared answers for your form selections 
provided by the RIC Staff.

**Your Selections:**
**Grant Team:** ARC-D
**Query Type:** Complex
**Is UOM the lead?:** Yes

**Answer from RIC Staff:**
For ARC-D grants where UOM is the lead, you should contact the ARC-D 
team directly at arc-d@unimelb.edu.au. They will be able to assist 
you with your complex query.

Does this answer your question?
```

### **Example 2: No FAQ Found**
```
Unfortunately, we have not found any pre-prepared answers for your form 
selections. We have forwarded your form to the RIC staff who will contact 
you at their earliest availability.

For now, please follow the below:

[Helpful information shown...]
```

---

## 🔄 Complete Flow Summary

1. **User opens chatbot** → FAQ matching starts
2. **FAQ found?**
   - ✅ **Yes** → Show matched FAQ with selections and answer
     - User satisfied? → End with success message
     - Need more help? → Show helpful info + escalate
   - ❌ **No** → Show helpful info + escalate immediately

3. **Both paths include:**
   - Contractual clause review guidance
   - Grant compliance information
   - Next steps
   - Timeline expectations (1-2 business days)

---

## 🎯 Key Benefits

1. ✅ **Smart matching** - Shows relevant pre-prepared answers
2. ✅ **Helpful fallback** - Always provides useful information
3. ✅ **Clear expectations** - 1-2 business day response time
4. ✅ **Self-service options** - Links to documentation
5. ✅ **Professional appearance** - Clean, formatted messages
6. ✅ **No dead ends** - Every path provides value

---

## 🚀 Implementation

All of this is handled automatically by:
- `ChatBot.tsx` - UI and flow control
- `conversationFlow-updated.tsx` - Message content and routing
- `faqMatchingUtils.ts` - FAQ matching logic
- `extractFaqFieldInfo()` - Clean selection formatting

Just use: `<ChatBot submissionId="abc-123" />`

🎉 **Done!**