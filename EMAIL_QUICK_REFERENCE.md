# Email Notifications - Quick Reference

## 🚀 Quick Start

### 1. Set Environment Variable
```bash
# Add to backend/.env
EMAIL_PASS=your_brevo_api_key
```

### 2. Verify Installation
All files are already in place:
- ✅ `/backend/utils/emailTemplates.js` - Email templates
- ✅ `/backend/controllers/applicationController.js` - Updated
- ✅ `/backend/controllers/candidateController.js` - Updated
- ✅ `/backend/utils/sendEmail.js` - Already working

### 3. Test It
```
1. Apply as candidate → Pending email sent
2. Admin approves → Approval email sent
3. Admin disqualifies → Disqualification email sent
```

---

## 📧 Email Types at a Glance

| Email | When | Template | File |
|-------|------|----------|------|
| **Pending** | Application submitted | `applicationSubmitted()` | `applicationController.js` |
| **Approved** | Admin approves | `applicationApproved()` | `candidateController.js` |
| **Disqualified** | Admin disqualifies | `applicationDisqualified()` | `candidateController.js` |

---

## 💻 API Endpoints

### Submit Application (Triggers Pending Email)
```
POST /api/applications
Body: {
  user, election, name, position, 
  description, manifesto, photo, symbol
}
Response: 201 with candidate object
```

### Approve Candidate (Triggers Approval Email)
```
PUT /api/candidates/:id/approve
Response: 200 { message: "Candidate approved" }
```

### Disqualify Candidate (Triggers Disqualification Email)
```
PUT /api/candidates/:id/disqualify
Body: { reason: "optional reason text" }
Response: 200 { message: "Candidate disqualified" }
```

---

## 🎨 Design Reference

**Color**: `#0d6efd` (Brand blue)
**Theme**: Professional, clean, no gradients
**Responsive**: Mobile and desktop optimized
**Accessibility**: High contrast, clear typography

---

## 🔧 Customizing Email Templates

Edit `/backend/utils/emailTemplates.js`:

```javascript
applicationSubmitted: ({ candidateName, electionTitle, position, userEmail }) => {
  return {
    subject: "Your custom subject",
    html: `<!-- Your HTML here -->`
  };
}
```

The function receives:
- `candidateName` - Student's name
- `electionTitle` - Election name
- `position` - Position applied for
- `userEmail` - Student's email
- `reason` - (Disqualification only) Optional rejection reason

---

## 🐛 Troubleshooting

### Emails Not Sending?
1. Check EMAIL_PASS in .env
2. Check backend logs for `[EMAIL ERROR]`
3. Verify Brevo account is active
4. Test with known email address

### Email Content Wrong?
1. Check `/backend/utils/emailTemplates.js`
2. Verify field names match (candidateName, etc.)
3. Check email template HTML

### Brevo Dashboard
Visit https://app.brevo.com/ to:
- Monitor email delivery
- Check bounce rates
- View email logs
- Test SMTP connection

---

## 📊 Implementation Files

### New File
```
backend/utils/emailTemplates.js
├── applicationSubmitted()
├── applicationApproved()
└── applicationDisqualified()
```

### Modified Files
```
backend/controllers/applicationController.js
└── Added pending email sending

backend/controllers/candidateController.js
├── Added approval email sending
└── Added disqualification email sending
```

### Already Working
```
backend/utils/sendEmail.js
└── Brevo API integration (no changes needed)
```

---

## ✅ Verification Commands

```bash
# Check syntax
cd /workspaces/campus-ballot/backend
node -c server.js

# Check imports
grep -r "emailTemplates" backend/controllers/
grep -r "sendEmail" backend/controllers/

# Check templates exist
ls -la backend/utils/emailTemplates.js
```

---

## 📝 Code Examples

### Sending Pending Email
```javascript
// Automatically sent in createApplication()
const emailTemplate = emailTemplates.applicationSubmitted({
  candidateName: name,
  electionTitle: validElection.title,
  position: position,
  userEmail: applicantUser.email
});

await sendEmail({
  to: applicantUser.email,
  subject: emailTemplate.subject,
  html: emailTemplate.html
});
```

### Sending Approval Email
```javascript
// Automatically sent in approveCandidate()
const emailTemplate = emailTemplates.applicationApproved({
  candidateName: candidate.name,
  electionTitle: candidate.election.title,
  position: candidate.position,
  userEmail: updatedUser.email
});

await sendEmail({
  to: updatedUser.email,
  subject: emailTemplate.subject,
  html: emailTemplate.html
});
```

### Sending Disqualification Email
```javascript
// Automatically sent in disqualifyCandidate()
const emailTemplate = emailTemplates.applicationDisqualified({
  candidateName: candidate.name,
  electionTitle: candidate.election.title,
  position: candidate.position,
  userEmail: candidate.user.email,
  reason: reason || undefined  // Optional
});

await sendEmail({
  to: candidate.user.email,
  subject: emailTemplate.subject,
  html: emailTemplate.html
});
```

---

## 🎯 Key Points

✅ **No Setup Required** - Just add EMAIL_PASS to .env
✅ **Automatic** - Emails send on application status changes
✅ **Professional** - Uses brand colors and design
✅ **Safe** - Email failures don't block operations
✅ **Logged** - Console shows success/failure messages
✅ **Customizable** - Edit templates in emailTemplates.js
✅ **Scalable** - Easy to add more email types

---

## 🌐 Resources

- [Full Setup Guide](./EMAIL_NOTIFICATIONS_SETUP.md)
- [Implementation Details](./EMAIL_NOTIFICATIONS_IMPLEMENTATION.md)
- [Complete Summary](./EMAIL_NOTIFICATIONS_COMPLETE.md)
- [Brevo Docs](https://developers.brevo.com/)

---

## 💬 Common Questions

**Q: Will email failures break my app?**
A: No. Emails wrap in try-catch blocks with error logging.

**Q: Can I customize the emails?**
A: Yes. Edit `/backend/utils/emailTemplates.js`.

**Q: How do I get a Brevo API key?**
A: Visit brevo.com, create account, get key from Settings → SMTP & API.

**Q: What if EMAIL_PASS is missing?**
A: App will error when trying to send. Add it to .env and restart.

**Q: Can I add more email types?**
A: Yes. Add function to emailTemplates.js, import where needed.

**Q: Where are emails sent from?**
A: From email configured in Brevo (usually noreply@yourdomain.com).

---

## 🚀 Ready to Deploy?

1. ✅ Add EMAIL_PASS to .env
2. ✅ Test email functionality
3. ✅ Push code to repository
4. ✅ Deploy backend
5. ✅ Monitor Brevo dashboard

**Status**: Production Ready ✅

---

**Last Updated**: 2024 | **Version**: 1.0
