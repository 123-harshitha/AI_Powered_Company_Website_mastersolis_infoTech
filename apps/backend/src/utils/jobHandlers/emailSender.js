// Email sending job handler using Resend
const { Resend } = require('resend');

// Initialize Resend (only if API key is provided)
let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.warn('⚠️  RESEND_API_KEY not found. Email functionality will be disabled.');
}

// Email templates
const emailTemplates = {
  candidate_invitation: {
    subject: 'Invitation to Join Mastersolis Infotech Talent Pool',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Mastersolis Infotech</h1>
          <p style="color: #6b7280; margin: 5px 0;">Talent Acquisition Portal</p>
        </div>
        
        <h2 style="color: #1f2937;">You're Invited to Join Our Talent Pool!</h2>
        
        <p>Dear ${data.candidateName || 'Candidate'},</p>
        
        <p>We are excited to invite you to join our talent pool at Mastersolis Infotech. We believe your skills and experience could be a great fit for our organization.</p>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1f2937;">What's Next?</h3>
          <ol style="color: #374151;">
            <li><strong>Create Your Account:</strong> Click the link below to set up your candidate profile</li>
            <li><strong>Upload Your Resume:</strong> Share your professional background with us</li>
            <li><strong>Browse Opportunities:</strong> Explore current job openings that match your skills</li>
            <li><strong>Apply for Positions:</strong> Submit applications for roles that interest you</li>
          </ol>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.registrationLink}" 
             style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Create Your Account
          </a>
        </div>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;">
            <strong>Note:</strong> This invitation is valid for 7 days. If you don't create an account within this time, you can still register later using your email address.
          </p>
        </div>
        
        <p>If you have any questions, please don't hesitate to contact our HR team.</p>
        
        <p>We look forward to learning more about you!</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #6b7280; font-size: 14px;">
          Best regards,<br>
          <strong>Mastersolis Infotech HR Team</strong><br>
          <a href="mailto:hr@fwchrms.com" style="color: #2563eb;">hr@fwchrms.com</a>
        </p>
      </div>
    `
  },

  resume_processed: {
    subject: 'New Resume Processed - Candidate Application',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Candidate Resume Processed</h2>
        <p>Hello HR Team,</p>
        <p>A new resume has been processed and is ready for your review:</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Candidate Details</h3>
          <p><strong>Name:</strong> ${data.candidateName}</p>
          <p><strong>Job Title:</strong> ${data.jobTitle}</p>
          <p><strong>Fit Score:</strong> ${data.fitScore}/100</p>
        </div>
        
        <p>Please review the candidate's profile and schedule an interview if appropriate.</p>
        <p>Best regards,<br>Mastersolis Infotech System</p>
      </div>
    `
  },
  
  interview_scheduled: {
    subject: 'Interview Scheduled - ${jobTitle} Position',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Mastersolis Infotech</h1>
          <p style="color: #6b7280; margin: 5px 0;">Interview Notification</p>
        </div>
        
        <h2 style="color: #1f2937;">Interview Scheduled Successfully!</h2>
        
        <p>Dear ${data.candidateName},</p>
        
        <p>Congratulations! We are pleased to invite you for an interview for the <strong>${data.jobTitle}</strong> position.</p>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1f2937;">Interview Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Date & Time:</td>
              <td style="padding: 8px 0; color: #6b7280;">${new Date(data.scheduledAt).toLocaleDateString()} at ${new Date(data.scheduledAt).toLocaleTimeString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Duration:</td>
              <td style="padding: 8px 0; color: #6b7280;">${data.duration} minutes</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Type:</td>
              <td style="padding: 8px 0; color: #6b7280;">${data.type.replace('_', ' ')}</td>
            </tr>
            ${data.location ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Location:</td>
              <td style="padding: 8px 0; color: #6b7280;">${data.location}</td>
            </tr>
            ` : ''}
            ${data.meetingLink ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Meeting Link:</td>
              <td style="padding: 8px 0; color: #6b7280;">
                <a href="${data.meetingLink}" style="color: #2563eb; text-decoration: none;">Join Interview</a>
              </td>
            </tr>
            ` : ''}
            ${data.interviewers && data.interviewers.length > 0 ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Interviewers:</td>
              <td style="padding: 8px 0; color: #6b7280;">${data.interviewers.join(', ')}</td>
            </tr>
            ` : ''}
          </table>
        </div>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #92400e;">Important Reminders:</h4>
          <ul style="color: #92400e; margin: 0; padding-left: 20px;">
            <li>Please arrive 5-10 minutes early for your interview</li>
            <li>Test your technology (camera, microphone) if it's a video interview</li>
            <li>Have your resume and any relevant documents ready</li>
            <li>Prepare questions about the role and company</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          ${data.meetingLink ? `
          <a href="${data.meetingLink}" 
             style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-right: 10px;">
            Join Interview
          </a>
          ` : ''}
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/candidate-portal/interviews" 
             style="background: #6b7280; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            View All Interviews
          </a>
        </div>
        
        <p>If you need to reschedule or have any questions, please contact us as soon as possible.</p>
        
        <p>We look forward to speaking with you!</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #6b7280; font-size: 14px;">
          Best regards,<br>
          <strong>${data.scheduledByName}</strong><br>
          Mastersolis Infotech HR Team<br>
          <a href="mailto:hr@fwchrms.com" style="color: #2563eb;">hr@fwchrms.com</a>
        </p>
      </div>
    `
  },

  interview_rescheduled: {
    subject: 'Interview Rescheduled - ${jobTitle} Position',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Mastersolis Infotech</h1>
          <p style="color: #6b7280; margin: 5px 0;">Interview Update</p>
        </div>
        
        <h2 style="color: #1f2937;">Interview Rescheduled</h2>
        
        <p>Dear ${data.candidateName},</p>
        
        <p>We need to reschedule your interview for the <strong>${data.jobTitle}</strong> position.</p>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #92400e;">Schedule Change:</h4>
          <p style="color: #92400e; margin: 5px 0;">
            <strong>Previous:</strong> ${new Date(data.oldScheduledAt).toLocaleDateString()} at ${new Date(data.oldScheduledAt).toLocaleTimeString()}
          </p>
          <p style="color: #92400e; margin: 5px 0;">
            <strong>New:</strong> ${new Date(data.newScheduledAt).toLocaleDateString()} at ${new Date(data.newScheduledAt).toLocaleTimeString()}
          </p>
        </div>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1f2937;">Updated Interview Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Date & Time:</td>
              <td style="padding: 8px 0; color: #6b7280;">${new Date(data.newScheduledAt).toLocaleDateString()} at ${new Date(data.newScheduledAt).toLocaleTimeString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Type:</td>
              <td style="padding: 8px 0; color: #6b7280;">${data.type.replace('_', ' ')}</td>
            </tr>
            ${data.location ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Location:</td>
              <td style="padding: 8px 0; color: #6b7280;">${data.location}</td>
            </tr>
            ` : ''}
            ${data.meetingLink ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Meeting Link:</td>
              <td style="padding: 8px 0; color: #6b7280;">
                <a href="${data.meetingLink}" style="color: #2563eb; text-decoration: none;">Join Interview</a>
              </td>
            </tr>
            ` : ''}
          </table>
        </div>
        
        <p>We apologize for any inconvenience this may cause. If the new time doesn't work for you, please contact us immediately.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/candidate-portal/interviews" 
             style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            View Updated Schedule
          </a>
        </div>
        
        <p>Thank you for your understanding.</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #6b7280; font-size: 14px;">
          Best regards,<br>
          <strong>${data.rescheduledByName}</strong><br>
          Mastersolis Infotech HR Team<br>
          <a href="mailto:hr@fwchrms.com" style="color: #2563eb;">hr@fwchrms.com</a>
        </p>
      </div>
    `
  },

  interview_cancelled: {
    subject: 'Interview Cancelled - ${jobTitle} Position',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Mastersolis Infotech</h1>
          <p style="color: #6b7280; margin: 5px 0;">Interview Update</p>
        </div>
        
        <h2 style="color: #1f2937;">Interview Cancelled</h2>
        
        <p>Dear ${data.candidateName},</p>
        
        <p>We regret to inform you that your interview for the <strong>${data.jobTitle}</strong> position scheduled for <strong>${new Date(data.scheduledAt).toLocaleDateString()} at ${new Date(data.scheduledAt).toLocaleTimeString()}</strong> has been cancelled.</p>
        
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 15px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #dc2626;">Reason for Cancellation:</h4>
          <p style="color: #dc2626; margin: 0;">${data.reason}</p>
        </div>
        
        <p>We sincerely apologize for any inconvenience this may cause. We will be in touch soon to reschedule your interview or provide updates on the next steps in the process.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/candidate-portal/interviews" 
             style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            View Application Status
          </a>
        </div>
        
        <p>Thank you for your patience and continued interest in joining our team.</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #6b7280; font-size: 14px;">
          Best regards,<br>
          <strong>${data.cancelledByName}</strong><br>
          Mastersolis Infotech HR Team<br>
          <a href="mailto:hr@fwchrms.com" style="color: #2563eb;">hr@fwchrms.com</a>
        </p>
      </div>
    `
  },

  interview_reminder: {
    subject: 'Interview Reminder - Tomorrow at ${time}',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Mastersolis Infotech</h1>
          <p style="color: #6b7280; margin: 5px 0;">Interview Reminder</p>
        </div>
        
        <h2 style="color: #1f2937;">Interview Reminder</h2>
        
        <p>Dear ${data.candidateName},</p>
        
        <p>This is a friendly reminder that you have an interview scheduled for tomorrow for the <strong>${data.jobTitle}</strong> position.</p>
        
        <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0c4a6e;">Interview Details</h3>
          <p style="color: #0c4a6e; margin: 5px 0;"><strong>Date:</strong> ${new Date(data.scheduledAt).toLocaleDateString()}</p>
          <p style="color: #0c4a6e; margin: 5px 0;"><strong>Time:</strong> ${new Date(data.scheduledAt).toLocaleTimeString()}</p>
          <p style="color: #0c4a6e; margin: 5px 0;"><strong>Type:</strong> ${data.type.replace('_', ' ')}</p>
          ${data.location ? `<p style="color: #0c4a6e; margin: 5px 0;"><strong>Location:</strong> ${data.location}</p>` : ''}
          ${data.meetingLink ? `<p style="color: #0c4a6e; margin: 5px 0;"><strong>Meeting Link:</strong> <a href="${data.meetingLink}" style="color: #0ea5e9;">Join Interview</a></p>` : ''}
        </div>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #92400e;">Last-Minute Checklist:</h4>
          <ul style="color: #92400e; margin: 0; padding-left: 20px;">
            <li>Confirm your interview time and location</li>
            <li>Test your technology if it's a video interview</li>
            <li>Prepare your questions about the role</li>
            <li>Have your resume and documents ready</li>
            <li>Plan your route and timing for in-person interviews</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          ${data.meetingLink ? `
          <a href="${data.meetingLink}" 
             style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-right: 10px;">
            Join Interview
          </a>
          ` : ''}
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/candidate-portal/interviews" 
             style="background: #6b7280; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            View Interview Details
          </a>
        </div>
        
        <p>We look forward to speaking with you tomorrow!</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #6b7280; font-size: 14px;">
          Best regards,<br>
          <strong>Mastersolis Infotech HR Team</strong><br>
          <a href="mailto:hr@fwchrms.com" style="color: #2563eb;">hr@fwchrms.com</a>
        </p>
      </div>
    `
  },

  reschedule_request: {
    subject: 'Interview Reschedule Request - ${jobTitle}',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Mastersolis Infotech</h1>
          <p style="color: #6b7280; margin: 5px 0;">Reschedule Request</p>
        </div>
        
        <h2 style="color: #1f2937;">Interview Reschedule Request</h2>
        
        <p>Dear Manager,</p>
        
        <p><strong>${data.candidateName}</strong> has requested to reschedule their interview for the <strong>${data.jobTitle}</strong> position.</p>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #92400e;">Current Schedule:</h4>
          <p style="color: #92400e; margin: 0;">${new Date(data.currentScheduledAt).toLocaleDateString()} at ${new Date(data.currentScheduledAt).toLocaleTimeString()}</p>
        </div>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1f2937;">Reschedule Details</h3>
          <p style="color: #374151; margin: 5px 0;"><strong>Reason:</strong> ${data.reason}</p>
          ${data.preferredTimes && data.preferredTimes.length > 0 ? `
          <p style="color: #374151; margin: 5px 0;"><strong>Preferred Times:</strong></p>
          <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
            ${data.preferredTimes.map(time => `<li>${time}</li>`).join('')}
          </ul>
          ` : ''}
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/manager/interview-management" 
             style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Review Request
          </a>
        </div>
        
        <p>Please review this request and respond as soon as possible.</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #6b7280; font-size: 14px;">
          Best regards,<br>
          <strong>Mastersolis Infotech System</strong><br>
          <a href="mailto:hr@fwchrms.com" style="color: #2563eb;">hr@fwchrms.com</a>
        </p>
      </div>
    `
  },

  employee_welcome: {
    subject: 'Welcome to Mastersolis Infotech! Your Employee Account is Ready',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">🎉 Welcome to Mastersolis Infotech!</h1>
          <p style="color: #6b7280; margin: 5px 0;">Congratulations on joining our team!</p>
        </div>
        
        <h2 style="color: #1f2937;">Welcome, ${data.employeeName}!</h2>
        
        <p>We're thrilled to welcome you to the Mastersolis Infotech family! You've successfully completed our interview process and we're excited to have you join our team.</p>
        
        <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0c4a6e;">Your New Role Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Position:</td>
              <td style="padding: 8px 0; color: #6b7280;">${data.jobTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Department:</td>
              <td style="padding: 8px 0; color: #6b7280;">${data.department}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Start Date:</td>
              <td style="padding: 8px 0; color: #6b7280;">${data.startDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Employee ID:</td>
              <td style="padding: 8px 0; color: #6b7280;">${data.employeeId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Manager:</td>
              <td style="padding: 8px 0; color: #6b7280;">${data.managerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Salary:</td>
              <td style="padding: 8px 0; color: #6b7280;">${data.salary}</td>
            </tr>
          </table>
        </div>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #92400e;">Next Steps - Onboarding Process</h4>
          <ul style="color: #92400e; margin: 0; padding-left: 20px;">
            <li>Complete your employee profile and paperwork</li>
            <li>Attend orientation session on your first day</li>
            <li>Meet with your manager and team</li>
            <li>Set up your workspace and equipment</li>
            <li>Review company policies and procedures</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.loginUrl}" 
             style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-right: 10px;">
            Access Your Account
          </a>
          <a href="${data.onboardingUrl}" 
             style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            View Onboarding Tasks
          </a>
        </div>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #374151;">Login Credentials</h4>
          <p style="color: #6b7280; margin: 5px 0;"><strong>Username:</strong> Your email address</p>
          <p style="color: #6b7280; margin: 5px 0;"><strong>Password:</strong> Welcome123!</p>
          <p style="color: #6b7280; margin: 5px 0; font-size: 14px;"><em>Please change your password after your first login</em></p>
        </div>
        
        <p>If you have any questions before your start date, please don't hesitate to reach out to our HR team.</p>
        
        <p>We look forward to seeing you on ${data.startDate}!</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #6b7280; font-size: 14px;">
          Best regards,<br>
          <strong>Mastersolis Infotech HR Team</strong><br>
          <a href="mailto:hr@fwchrms.com" style="color: #2563eb;">hr@fwchrms.com</a><br>
          Phone: (555) 123-4567
        </p>
      </div>
    `
  },

  candidate_hired: {
    subject: 'Candidate Successfully Hired - ${candidateName}',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Mastersolis Infotech</h1>
          <p style="color: #6b7280; margin: 5px 0;">Hiring Notification</p>
        </div>
        
        <h2 style="color: #1f2937;">🎉 Candidate Successfully Hired!</h2>
        
        <p>Great news! We've successfully converted a candidate to employee status.</p>
        
        <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0c4a6e;">New Employee Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Name:</td>
              <td style="padding: 8px 0; color: #6b7280;">${data.candidateName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Position:</td>
              <td style="padding: 8px 0; color: #6b7280;">${data.jobTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Department:</td>
              <td style="padding: 8px 0; color: #6b7280;">${data.department}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Start Date:</td>
              <td style="padding: 8px 0; color: #6b7280;">${data.startDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Employee ID:</td>
              <td style="padding: 8px 0; color: #6b7280;">${data.employeeId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Interview Score:</td>
              <td style="padding: 8px 0; color: #6b7280;">${data.interviewScore}%</td>
            </tr>
          </table>
        </div>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #92400e;">Next Steps</h4>
          <ul style="color: #92400e; margin: 0; padding-left: 20px;">
            <li>Onboarding process has been initiated</li>
            <li>Employee account has been created</li>
            <li>Welcome email sent to new employee</li>
            <li>Manager has been notified</li>
            <li>IT team will set up equipment and access</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/hr/candidate-conversion" 
             style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            View Conversion Details
          </a>
        </div>
        
        <p>This completes the recruitment process for this position. Great work on the successful hire!</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #6b7280; font-size: 14px;">
          Best regards,<br>
          <strong>Mastersolis Infotech System</strong><br>
          <a href="mailto:hr@fwchrms.com" style="color: #2563eb;">hr@fwchrms.com</a>
        </p>
      </div>
    `
  },

  application_received: {
    subject: 'Application Received - Mastersolis Infotech',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Application Received</h2>
        <p>Dear ${data.candidateName},</p>
        <p>Thank you for your interest in the ${data.jobTitle} position.</p>
        <p>We have received your application and our team will review it shortly.</p>
        <p>You will hear from us within 5 business days.</p>
        <p>Best regards,<br>Mastersolis Infotech HR Team</p>
      </div>
    `
  },

  application_rejected: {
    subject: 'Application Update - Mastersolis Infotech',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Application Status Update</h2>
        <p>Dear ${data.candidateName},</p>
        <p>Thank you for applying for the ${data.jobTitle} position.</p>
        <p>After careful consideration, we have decided to move forward with other candidates at this time.</p>
        ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
        <p>We encourage you to apply for other positions that match your experience.</p>
        <p>Best regards,<br>Mastersolis Infotech HR Team</p>
      </div>
    `
  },

  leave_approved: {
    subject: 'Leave Request Approved - Mastersolis Infotech',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Leave Request Approved</h2>
        <p>Dear ${data.employeeName},</p>
        <p>Your leave request has been approved.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Leave Details</h3>
          <p><strong>Type:</strong> ${data.leaveType}</p>
          <p><strong>Start Date:</strong> ${new Date(data.startDate).toLocaleDateString()}</p>
          <p><strong>End Date:</strong> ${new Date(data.endDate).toLocaleDateString()}</p>
          <p><strong>Days:</strong> ${data.daysRequested}</p>
        </div>
        
        <p>Please ensure your work coverage is arranged before your leave period.</p>
        <p>Best regards,<br>Mastersolis Infotech HR Team</p>
      </div>
    `
  }
};

const sendEmail = async (jobData) => {
  const { type, to, data = {}, cc = [], bcc = [] } = jobData;
  
  // Check if Resend is initialized
  if (!resend) {
    console.warn(`⚠️  Email sending skipped (${type}): RESEND_API_KEY not configured`);
    return {
      success: false,
      error: 'Email service not configured. RESEND_API_KEY is required.',
      recipient: to,
      type
    };
  }
  
  try {
    console.log(`Sending ${type} email to ${to}`);
    
    const template = emailTemplates[type];
    if (!template) {
      throw new Error(`Email template '${type}' not found`);
    }

    // Prepare recipients
    const recipients = Array.isArray(to) ? to : [to];
    const ccRecipients = Array.isArray(cc) ? cc : (cc ? [cc] : []);
    const bccRecipients = Array.isArray(bcc) ? bcc : (bcc ? [bcc] : []);
    
    // Send email using Resend
    const emailData = {
      from: process.env.RESEND_FROM || 'Mastersolis Infotech <onboarding@resend.dev>',
      to: recipients,
      cc: ccRecipients.length > 0 ? ccRecipients : undefined,
      bcc: bccRecipients.length > 0 ? bccRecipients : undefined,
      subject: template.subject.replace(/\${(\w+)}/g, (match, key) => data[key] || match),
      html: template.html(data),
    };

    const result = await resend.emails.send(emailData);
    
    console.log(`Email sent successfully: ${result.data?.id}`);
    
    return {
      success: true,
      messageId: result.data?.id,
      recipient: to,
      type
    };

  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

module.exports = sendEmail;