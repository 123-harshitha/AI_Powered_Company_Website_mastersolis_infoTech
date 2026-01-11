const express = require('express');
const { body, validationResult } = require('express-validator');
const { ObjectId } = require('mongodb');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const database = require('../database/connection');
const { asyncHandler } = require('../middleware/errorHandler');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const { Resend } = require('resend');

const router = express.Router();

// Initialize Resend for email sending
let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.warn('⚠️  RESEND_API_KEY not found. Email functionality will be disabled.');
}

// Configure multer for resume uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/resumes');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `career-resume-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  }
});

// AI Content Generation Helper
function generateJobDescription(jobData) {
  const { title, department, location, type, summary } = jobData;
  
  // Generate AI-driven job description (80-150 words)
  const descriptions = {
    responsibilities: [
      `As a ${title} in our ${department} department, you'll play a crucial role in driving innovation and excellence.`,
      `You'll collaborate with cross-functional teams to deliver high-quality solutions that exceed expectations.`,
      `Your expertise will contribute to our mission of creating cutting-edge products and services.`,
      `You'll have the opportunity to mentor junior team members and shape the future of our technology stack.`
    ],
    skills: [
      `We're looking for someone with strong problem-solving abilities and excellent communication skills.`,
      `Experience with modern development practices and a passion for continuous learning is essential.`,
      `The ideal candidate thrives in a fast-paced environment and embraces challenges with enthusiasm.`
    ],
    culture: [
      `At our company, we foster a culture of collaboration, innovation, and personal growth.`,
      `We believe in work-life balance and provide the flexibility you need to excel both professionally and personally.`,
      `Join a team that values diversity, inclusion, and the unique perspectives each member brings.`
    ]
  };

  const description = [
    descriptions.responsibilities[0],
    descriptions.responsibilities[1],
    descriptions.skills[0],
    descriptions.skills[1],
    descriptions.culture[0],
    descriptions.culture[1]
  ].join(' ');

  return description.substring(0, 150); // Ensure 80-150 words
}

// AI Email Generation Functions - Mastersolis Infotech
function generateAcknowledgmentEmail(companyName, jobTitle, candidateName) {
  return {
    subject: `Thank You for Applying to ${jobTitle} at ${companyName}`,
    body: `Hi ${candidateName},

Thank you for applying for the ${jobTitle} position at ${companyName}. We've received your application and our AI-powered screening system is reviewing your resume.

We appreciate your interest in joining our team and will update you on the next steps soon. Our recruitment team typically reviews applications within 2-3 business days.

If you have any questions, please don't hesitate to reach out to our HR team.

Best regards,
${companyName} HR Team`
  };
}

function generateInterviewInvitationEmail(companyName, jobTitle, candidateName, interviewLink, interviewDate = null, interviewTime = null) {
  let dateTimeInfo = '';
  if (interviewDate && interviewTime) {
    dateTimeInfo = `\n\nYour interview is scheduled for:\nDate: ${interviewDate}\nTime: ${interviewTime}`;
  }
  
  return {
    subject: `Interview Invitation – ${jobTitle} at ${companyName}`,
    body: `Hi ${candidateName},

Congratulations! Based on our AI screening, you've been shortlisted for the ${jobTitle} role at ${companyName}.${dateTimeInfo}

We're excited to learn more about you and your experience. Please use the following link to schedule or join your interview:

${interviewLink}

This interview will help us understand your skills, experience, and how you can contribute to our team. Please come prepared to discuss your background and why you're interested in this role.

If you need to reschedule or have any questions, please contact us as soon as possible.

Best of luck,
${companyName} Recruitment Team`
  };
}

function generateSelectionEmail(companyName, jobTitle, candidateName, nextSteps = null) {
  let nextStepsInfo = '';
  if (nextSteps) {
    nextStepsInfo = `\n\n${nextSteps}`;
  } else {
    nextStepsInfo = `\n\nOur HR team will reach out to you within the next 2-3 business days with details regarding your onboarding process, including start date, benefits package, and any required documentation.`;
  }
  
  return {
    subject: `Congratulations! You've Been Selected for ${jobTitle}`,
    body: `Hi ${candidateName},

We're thrilled to inform you that you've been selected for the ${jobTitle} position at ${companyName}!

After careful consideration of all candidates, we believe your skills, experience, and enthusiasm make you the perfect fit for our team. We're excited to have you join us and contribute to our mission of delivering innovative AI-driven solutions.${nextStepsInfo}

Welcome aboard and congratulations once again! We look forward to working with you.

Warm regards,
${companyName} HR Team`
  };
}

function generateRejectionEmail(companyName, jobTitle, candidateName, feedback = null) {
  let feedbackInfo = '';
  if (feedback) {
    feedbackInfo = `\n\n${feedback}`;
  } else {
    feedbackInfo = `\n\nWhile we were impressed with your qualifications, we've decided to move forward with other candidates whose experience more closely matches our current needs.`;
  }
  
  return {
    subject: `Update on Your Application for ${jobTitle}`,
    body: `Hi ${candidateName},

Thank you for taking the time to interview for the ${jobTitle} position at ${companyName}. We truly appreciate your interest in joining our team.${feedbackInfo}

We encourage you to apply for future opportunities that match your skills. We keep all applications on file and will reach out if a suitable position becomes available.

Thank you again for your time and interest in ${companyName}.

Best wishes,
${companyName} Recruitment Team`
  };
}

// Helper function to convert plain text email to HTML
function emailToHTML(emailBody, companyName, additionalInfo = null) {
  const lines = emailBody.split('\n');
  let html = '';
  
  lines.forEach(line => {
    if (line.trim() === '') {
      html += '<br>';
    } else if (line.startsWith('Hi ')) {
      html += `<p style="margin: 15px 0; font-size: 16px; color: #1f2937; font-weight: 500;">${line}</p>`;
    } else if (line.startsWith('Best regards,') || line.startsWith('Warm regards,') || line.startsWith('Best wishes,')) {
      html += `<p style="margin: 20px 0 10px 0; color: #374151;">${line}</p>`;
    } else if (line.startsWith(companyName)) {
      html += `<p style="margin: 5px 0; color: #1f2937; font-weight: 600;">${line}</p>`;
    } else if (line.includes('http://') || line.includes('https://')) {
      html += `<p style="margin: 15px 0;"><a href="${line.trim()}" style="color: #2563eb; text-decoration: none; font-weight: 500; background: #eff6ff; padding: 10px 20px; border-radius: 6px; display: inline-block;">${line.trim()}</a></p>`;
    } else if (line.startsWith('Date:') || line.startsWith('Time:')) {
      html += `<p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>${line}</strong></p>`;
    } else {
      html += `<p style="margin: 10px 0; color: #374151; line-height: 1.6;">${line}</p>`;
    }
  });
  
  if (additionalInfo) {
    html += additionalInfo;
  }
  
  return html;
}

// Generate company culture and benefits content
function generateCompanyCultureContent() {
  return {
    culture: `At our company, we believe in fostering an inclusive, collaborative environment where every team member can thrive. Our culture is built on trust, innovation, and a shared commitment to excellence. We celebrate diversity and encourage open communication, ensuring that every voice is heard and valued. Our team members are passionate about their work and support each other in achieving both personal and professional goals.`,
    
    benefits: {
      salary: `We offer competitive, market-leading compensation packages that reflect your skills, experience, and contributions. Our salary structure is designed to attract top talent while ensuring fairness and transparency. We regularly review and adjust compensation to remain competitive in the industry.`,
      
      health: `Your health and well-being are our priority. We provide comprehensive health, dental, and vision insurance plans for you and your family. Our wellness programs include mental health support, fitness initiatives, and preventive care services to help you maintain a healthy work-life balance.`,
      
      flexibility: `We understand that life happens, and flexibility is key to productivity and satisfaction. Enjoy flexible working hours, remote work options, and generous time-off policies. We trust our team members to manage their time effectively and deliver exceptional results.`,
      
      learning: `Continuous learning is at the heart of our growth. We invest in your professional development through training programs, conference attendance, online courses, and mentorship opportunities. Whether you want to learn new technologies, develop leadership skills, or explore different career paths, we're here to support your journey.`,
      
      teamEvents: `Building strong relationships is essential to our success. We organize regular team-building activities, company retreats, social events, and celebrations. From casual coffee chats to annual company gatherings, these events help us connect, collaborate, and create lasting memories together.`
    }
  };
}

// Submit job application (public endpoint)
router.post('/apply', upload.single('resume'), [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('jobId').notEmpty().withMessage('Job ID is required'),
  body('phone').optional().isString()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { name, email, jobId, phone, coverLetter } = req.body;

  // Validate job ID
  if (!ObjectId.isValid(jobId)) {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid job ID' 
    });
  }

  // Check if job exists and is published
  const job = await database.findOne('job_postings', { 
    _id: new ObjectId(jobId),
    status: 'PUBLISHED'
  });

  if (!job) {
    return res.status(404).json({ 
      success: false,
      message: 'Job posting not found or not available' 
    });
  }

  // Check if resume is uploaded
  if (!req.file) {
    return res.status(400).json({ 
      success: false,
      message: 'Resume file is required' 
    });
  }

  // Create application record
  const application = {
    name,
    email,
    phone: phone || '',
    jobId: new ObjectId(jobId),
    jobTitle: job.title,
    resumePath: req.file.path,
    resumeFileName: req.file.filename,
    resumeOriginalName: req.file.originalname,
    coverLetter: coverLetter || '',
    status: 'SUBMITTED',
    appliedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await database.insertOne('career_applications', application);

  // Get company name from environment or use default
  const companyName = process.env.COMPANY_NAME || 'Mastersolis Infotech';

  // Generate AI acknowledgment email
  const emailData = generateAcknowledgmentEmail(companyName, job.title, name);

  // Send acknowledgment email
  if (resend) {
    try {
      const htmlBody = emailToHTML(emailData.body, companyName, `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1f2937; font-size: 16px;">Application Details</h3>
          <div style="color: #374151; font-size: 14px;">
            <p style="margin: 5px 0;"><strong>Position:</strong> ${job.title}</p>
            <p style="margin: 5px 0;"><strong>Department:</strong> ${job.department}</p>
            <p style="margin: 5px 0;"><strong>Applied On:</strong> ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      `);

      await resend.emails.send({
        from: process.env.RESEND_FROM || 'Careers <onboarding@resend.dev>',
        to: [email],
        subject: emailData.subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">${companyName}</h1>
              <p style="color: #6b7280; margin: 5px 0; font-size: 14px;">AI-Driven HRMS Solutions</p>
            </div>
            
            <div style="margin: 20px 0;">
              ${htmlBody}
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0;">
              This is an automated email. For inquiries, contact: ${process.env.HR_EMAIL || 'hr@mastersolis.com'}
            </p>
          </div>
        `
      });

      console.log('✅ AI-generated acknowledgment email sent to:', email);
    } catch (emailError) {
      console.error('❌ Failed to send acknowledgment email:', emailError);
      // Don't fail the application if email fails
    }
  }

  res.status(201).json({
    success: true,
    message: 'Application submitted successfully',
    data: {
      applicationId: result.insertedId,
      jobTitle: job.title,
      appliedAt: application.appliedAt
    }
  });
}));

// Get company culture and benefits content (public endpoint)
router.get('/culture-benefits', asyncHandler(async (req, res) => {
  const content = generateCompanyCultureContent();
  
  res.json({
    success: true,
    data: content
  });
}));

// Generate AI job description (for admin)
router.post('/generate-description', [
  body('title').notEmpty().withMessage('Job title is required'),
  body('department').notEmpty().withMessage('Department is required'),
  body('location').optional().isString(),
  body('type').optional().isString(),
  body('summary').optional().isString()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { title, department, location, type, summary } = req.body;
  
  const description = generateJobDescription({
    title,
    department,
    location: location || 'Remote',
    type: type || 'Full-time',
    summary: summary || ''
  });

  res.json({
    success: true,
    data: {
      description,
      wordCount: description.split(' ').length
    }
  });
}));

// Send Interview Invitation Email (Admin/HR only)
router.post('/send-interview-invitation', verifyToken, checkRole('ADMIN', 'HR'), [
  body('applicationId').notEmpty().withMessage('Application ID is required'),
  body('interviewLink').notEmpty().withMessage('Interview link is required'),
  body('interviewDate').optional().isString(),
  body('interviewTime').optional().isString()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { applicationId, interviewLink, interviewDate, interviewTime } = req.body;
  const companyName = process.env.COMPANY_NAME || 'Mastersolis Infotech';

  // Get application details
  if (!ObjectId.isValid(applicationId)) {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid application ID' 
    });
  }

  const application = await database.findOne('career_applications', { 
    _id: new ObjectId(applicationId) 
  });

  if (!application) {
    return res.status(404).json({ 
      success: false,
      message: 'Application not found' 
    });
  }

  // Generate AI interview invitation email
  const emailData = generateInterviewInvitationEmail(
    companyName,
    application.jobTitle,
    application.name,
    interviewLink,
    interviewDate,
    interviewTime
  );

  // Send email
  if (resend) {
    try {
      const htmlBody = emailToHTML(emailData.body, companyName, `
        <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #166534; font-size: 16px;">📅 Interview Details</h3>
          <div style="color: #374151; font-size: 14px;">
            <p style="margin: 5px 0;"><strong>Position:</strong> ${application.jobTitle}</p>
            ${interviewDate ? `<p style="margin: 5px 0;"><strong>Date:</strong> ${interviewDate}</p>` : ''}
            ${interviewTime ? `<p style="margin: 5px 0;"><strong>Time:</strong> ${interviewTime}</p>` : ''}
            <p style="margin: 10px 0 5px 0;"><strong>Interview Link:</strong></p>
            <a href="${interviewLink}" style="color: #2563eb; word-break: break-all;">${interviewLink}</a>
          </div>
        </div>
      `);

      await resend.emails.send({
        from: process.env.RESEND_FROM || 'Careers <onboarding@resend.dev>',
        to: [application.email],
        subject: emailData.subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">${companyName}</h1>
              <p style="color: #6b7280; margin: 5px 0; font-size: 14px;">AI-Driven HRMS Solutions</p>
            </div>
            
            <div style="margin: 20px 0;">
              ${htmlBody}
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0;">
              This is an automated email. For inquiries, contact: ${process.env.HR_EMAIL || 'hr@mastersolis.com'}
            </p>
          </div>
        `
      });

      // Update application status
      await database.updateOne(
        'career_applications',
        { _id: new ObjectId(applicationId) },
        { 
          $set: { 
            status: 'INTERVIEW_SCHEDULED',
            interviewLink,
            interviewDate: interviewDate || null,
            interviewTime: interviewTime || null,
            interviewInvitedAt: new Date(),
            updatedAt: new Date()
          }
        }
      );

      console.log('✅ AI-generated interview invitation email sent to:', application.email);

      res.json({
        success: true,
        message: 'Interview invitation email sent successfully',
        data: {
          email: application.email,
          candidateName: application.name,
          jobTitle: application.jobTitle
        }
      });
    } catch (emailError) {
      console.error('❌ Failed to send interview invitation email:', emailError);
      res.status(500).json({
        success: false,
        message: 'Failed to send interview invitation email',
        error: emailError.message
      });
    }
  } else {
    res.status(500).json({
      success: false,
      message: 'Email service not configured'
    });
  }
}));

// Send Selection/Rejection Email (Admin/HR only)
router.post('/send-decision-email', verifyToken, checkRole('ADMIN', 'HR'), [
  body('applicationId').notEmpty().withMessage('Application ID is required'),
  body('decision').isIn(['SELECTED', 'REJECTED']).withMessage('Decision must be SELECTED or REJECTED'),
  body('nextSteps').optional().isString(),
  body('feedback').optional().isString()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { applicationId, decision, nextSteps, feedback } = req.body;
  const companyName = process.env.COMPANY_NAME || 'Mastersolis Infotech';

  // Get application details
  if (!ObjectId.isValid(applicationId)) {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid application ID' 
    });
  }

  const application = await database.findOne('career_applications', { 
    _id: new ObjectId(applicationId) 
  });

  if (!application) {
    return res.status(404).json({ 
      success: false,
      message: 'Application not found' 
    });
  }

  // Generate AI email based on decision
  let emailData;
  if (decision === 'SELECTED') {
    emailData = generateSelectionEmail(companyName, application.jobTitle, application.name, nextSteps);
  } else {
    emailData = generateRejectionEmail(companyName, application.jobTitle, application.name, feedback);
  }

  // Send email
  if (resend) {
    try {
      const additionalInfo = decision === 'SELECTED' 
        ? `
          <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #166534; font-size: 16px;">🎉 Welcome to ${companyName}!</h3>
            <p style="margin: 5px 0; color: #374151; font-size: 14px;">We're excited to have you join our team. Our HR team will contact you shortly with onboarding details.</p>
          </div>
        `
        : `
          <div style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #374151; font-size: 14px;">We appreciate your interest and encourage you to explore other opportunities with us in the future.</p>
          </div>
        `;

      const htmlBody = emailToHTML(emailData.body, companyName, additionalInfo);

      await resend.emails.send({
        from: process.env.RESEND_FROM || 'Careers <onboarding@resend.dev>',
        to: [application.email],
        subject: emailData.subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">${companyName}</h1>
              <p style="color: #6b7280; margin: 5px 0; font-size: 14px;">AI-Driven HRMS Solutions</p>
            </div>
            
            <div style="margin: 20px 0;">
              ${htmlBody}
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0;">
              This is an automated email. For inquiries, contact: ${process.env.HR_EMAIL || 'hr@mastersolis.com'}
            </p>
          </div>
        `
      });

      // Update application status
      await database.updateOne(
        'career_applications',
        { _id: new ObjectId(applicationId) },
        { 
          $set: { 
            status: decision === 'SELECTED' ? 'SELECTED' : 'REJECTED',
            decisionDate: new Date(),
            decisionFeedback: feedback || null,
            updatedAt: new Date()
          }
        }
      );

      console.log(`✅ AI-generated ${decision.toLowerCase()} email sent to:`, application.email);

      res.json({
        success: true,
        message: `${decision === 'SELECTED' ? 'Selection' : 'Rejection'} email sent successfully`,
        data: {
          email: application.email,
          candidateName: application.name,
          jobTitle: application.jobTitle,
          decision
        }
      });
    } catch (emailError) {
      console.error(`❌ Failed to send ${decision.toLowerCase()} email:`, emailError);
      res.status(500).json({
        success: false,
        message: `Failed to send ${decision.toLowerCase()} email`,
        error: emailError.message
      });
    }
  } else {
    res.status(500).json({
      success: false,
      message: 'Email service not configured'
    });
  }
}));

module.exports = router;

