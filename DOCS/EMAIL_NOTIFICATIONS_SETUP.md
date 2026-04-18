# Email Notifications System - Candidate Applications

## Overview

The Campus Ballot system now includes professional email notifications for candidate applications. Users receive emails at three key stages of the candidacy application process:

1. **Application Submitted** - When a student applies to be a candidate (Status: Pending)
2. **Application Approved** - When an admin approves the candidacy
3. **Application Disqualified** - When an admin disqualifies the candidacy

## Email Service Setup

### Requirements

The email notification system uses **Brevo API** (formerly Sendinblue) for sending professional transactional emails.

### Environment Variables

Add the following to your `.env` file:

```env
EMAIL_PASS=your_brevo_api_key_here
```

- **EMAIL_PASS**: Your Brevo API key (get from [https://app.brevo.com/](https://app.brevo.com/))

### Brevo Setup Steps

1. Create a Brevo account at [https://www.brevo.com/](https://www.brevo.com/)
2. Log in to your dashboard
3. Navigate to **Settings → SMTP & API**
4. Copy your API Key (this is your EMAIL_PASS value)
5. Add it to your `.env` file in the backend directory
6. Restart the backend server

## Email Templates

All email templates are stored in `/backend/utils/emailTemplates.js` and feature:

- **Professional Design**: Clean, modern HTML layout
- **Brand Colors**: Blue (#0d6efd) matching Campus Ballot branding
- **No Gradients**: Solid color scheme for consistency and accessibility
- **Responsive**: Optimized for mobile and desktop viewing
- **Information Hierarchy**: Clear, scannable content structure

### Email Types

#### 1. Application Submitted Email
**When**: Immediately after a student submits their candidacy application
**Status**: Pending
**File Location**: `/backend/controllers/applicationController.js` - `createApplication()`

**Template Fields**:
- Candidate Name
- Election Title
- Position Applied For
- Recipient Email

**Key Features**:
- Confirms receipt of application
- Shows candidate details
- Explains next steps in review process
- Sets expectations for timeline

#### 2. Application Approved Email
**When**: When admin clicks "Approve" on a pending candidate
**Status**: Approved
**File Location**: `/backend/controllers/candidateController.js` - `approveCandidate()`

**Template Fields**:
- Candidate Name
- Election Title
- Position Approved For
- Recipient Email

**Key Features**:
- Congratulations message
- Confirms candidate status
- Explains what happens next
- Link to candidate dashboard
- Professional success messaging

#### 3. Application Disqualified Email
**When**: When admin clicks "Disqualify" on a pending candidate
**Status**: Disqualified
**File Location**: `/backend/controllers/candidateController.js` - `disqualifyCandidate()`

**Template Fields**:
- Candidate Name
- Election Title
- Position Applied For
- Optional Reason for Disqualification
- Recipient Email

**Key Features**:
- Respectful tone
- Clear disqualification status
- Optional admin-provided reason
- Encouragement for future participation
- Professional rejection messaging

## Implementation Details

### Sending Pending Email (Application Submission)

**File**: `/backend/controllers/applicationController.js`

```javascript
// Email is sent after candidate application is created
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

**Error Handling**: Failures are logged but don't block the application submission

### Sending Approval Email

**File**: `/backend/controllers/candidateController.js`

```javascript
// Email is sent after candidate status is updated to 'approved'
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

**Side Effects**:
- User is given "candidate" role (added to additionalRoles)
- User can now access Candidate Dashboard
- Activity log is updated

### Sending Disqualification Email

**File**: `/backend/controllers/candidateController.js`

```javascript
// Email is sent after candidate status is updated to 'disqualified'
const emailTemplate = emailTemplates.applicationDisqualified({
  candidateName: candidate.name,
  electionTitle: candidate.election.title,
  position: candidate.position,
  userEmail: candidate.user.email,
  reason: reason || undefined  // Optional admin-provided reason
});

await sendEmail({
  to: candidate.user.email,
  subject: emailTemplate.subject,
  html: emailTemplate.html
});
```

**Optional Parameter**: Admins can provide a reason for disqualification which will be included in the email

## API Endpoints

### Sending Pending Email
- **Route**: `POST /api/applications`
- **Controller**: `applicationController.createApplication()`
- **Automatic**: Email sent automatically after successful application creation

### Sending Approval Email
- **Route**: `PUT /api/candidates/:id/approve`
- **Controller**: `candidateController.approveCandidate()`
- **Automatic**: Email sent automatically after status update
- **Permissions**: Admin or Super Admin only

### Sending Disqualification Email
- **Route**: `PUT /api/candidates/:id/disqualify`
- **Controller**: `candidateController.disqualifyCandidate()`
- **Body Parameter**: `{ "reason": "Optional reason for disqualification" }`
- **Automatic**: Email sent automatically after status update
- **Permissions**: Admin or Super Admin only

## Testing Email Notifications

### Prerequisites
1. Ensure `.env` has `EMAIL_PASS` set with valid Brevo API key
2. Backend server is running
3. MongoDB connection is active

### Test Scenario 1: Pending Email
1. Log in as a student
2. Navigate to Elections
3. Click "Apply as Candidate"
4. Fill in application details
5. Submit application
6. Check email inbox (or Brevo dashboard) for pending application email

### Test Scenario 2: Approval Email
1. Log in as admin
2. Navigate to Candidate Management
3. Find a pending candidate
4. Click "Approve"
5. Check candidate user's email for approval email

### Test Scenario 3: Disqualification Email
1. Log in as admin
2. Navigate to Candidate Management
3. Find a pending candidate
4. Click "Disqualify"
5. Optionally enter a rejection reason
6. Check candidate user's email for disqualification email

## Troubleshooting

### Emails Not Sending

1. **Check Brevo API Key**
   - Verify EMAIL_PASS is set correctly in `.env`
   - Test key validity on Brevo dashboard

2. **Check Logs**
   - Backend console will show `[EMAIL SENT]` or `[EMAIL ERROR]` messages
   - Look for email sending errors in logs

3. **Verify Database Connection**
   - Ensure User model queries succeed
   - Confirm candidate records have user references populated

4. **Verify Email Addresses**
   - Ensure User documents have valid email field
   - Check if email addresses are correct

### Email Content Issues

1. **Template Not Found**
   - Verify emailTemplates.js exports all three functions
   - Check function names match exactly

2. **Missing Information**
   - Verify Candidate and User models are populated correctly
   - Ensure Election title is available

## Design Specifications

### Color Scheme
- **Primary Blue**: #0d6efd (Campus Ballot brand color)
- **Text**: #333 (Dark gray for readability)
- **Backgrounds**: #f0f6ff (Light blue for info boxes), #f9f9f9 (Light gray for footer)
- **No Gradients**: All colors are solid for consistency

### Typography
- **Font Family**: Segoe UI, Tahoma, Geneva, Verdana, sans-serif
- **Header**: 28px bold
- **Subheader**: 20px bold
- **Body**: 14px normal
- **Links**: 14px, #0d6efd, bold

### Layout
- **Max Width**: 600px (mobile-friendly)
- **Padding**: Balanced for all screen sizes
- **Shadows**: Subtle box-shadow for depth
- **Border Radius**: 8px for containers, 20px for badges

## Files Modified/Created

### New Files
- `/backend/utils/emailTemplates.js` - Professional HTML email templates (3 types)

### Modified Files
- `/backend/controllers/applicationController.js` - Added pending email sending
- `/backend/controllers/candidateController.js` - Added approval and disqualification email sending

### Unchanged (Existing Email Service)
- `/backend/utils/sendEmail.js` - Brevo API integration utility

## Future Enhancements

Potential improvements to the email notification system:

1. **Email Templates in Database**
   - Store templates in MongoDB for admin customization
   - Allow admins to modify email content without code changes

2. **Email History**
   - Track all sent emails in a log
   - Enable email resend functionality

3. **Unsubscribe Options**
   - Add unsubscribe links for compliance
   - Allow users to manage notification preferences

4. **Scheduled Emails**
   - Send reminders before election day
   - Automated status update emails

5. **Template Variants**
   - Internationalization support
   - Different templates for different election types

## Support & Maintenance

For issues or questions about the email notification system:

1. Check the Brevo dashboard for bounced/failed emails
2. Review backend console logs for error messages
3. Verify environment variables are set correctly
4. Test with a known good email address

## Summary

The email notification system is now fully integrated into the candidate application workflow. Users receive professional, branded emails at each stage of the application process, improving communication and transparency.

**Status**: ✅ Production Ready

- All three email types implemented
- Error handling in place
- Non-blocking email failures
- Professional design with brand colors
- No gradients as requested
