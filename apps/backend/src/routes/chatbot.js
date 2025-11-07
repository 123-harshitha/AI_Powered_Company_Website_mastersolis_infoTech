const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { body, validationResult } = require('express-validator');
const database = require('../database/connection');
const { asyncHandler } = require('../middleware/errorHandler');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const router = express.Router();

// Initialize Gemini AI
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCmR_wq6S2eXY2vqrphxaKo0VXNt7zkCWI';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Enhanced Company context for the chatbot - Industry-oriented
const COMPANY_CONTEXT = `You are an expert AI-powered virtual assistant for Mastersolis Infotech, a leading provider of HRMS & AI-driven IT Solutions. Your role is to provide professional, industry-oriented guidance to potential clients, job seekers, and website visitors.

COMPANY PROFILE:
- Company Name: Mastersolis Infotech
- Industry: Enterprise HRMS Solutions & AI-Powered IT Services
- Specialization: Human Resource Management Systems, AI-driven automation, Enterprise software solutions
- Market Position: Industry leader in HR technology transformation
- Target Clients: Enterprises, SMBs, HR departments, IT organizations

CORE PRODUCTS & SERVICES:

1. HRMS PLATFORM (Enterprise-Grade)
   - Complete employee lifecycle management from onboarding to offboarding
   - Multi-tenant architecture supporting organizations of all sizes
   - Cloud-based and on-premise deployment options
   - Real-time analytics and business intelligence

2. PAYROLL MANAGEMENT SYSTEM
   - Automated salary processing with tax compliance
   - Multi-country payroll support
   - Benefits administration and deductions management
   - Integration with accounting systems

3. ATTENDANCE & TIME TRACKING
   - Real-time clock-in/out with geolocation and biometric verification
   - Shift management and scheduling
   - Overtime calculation and compliance
   - Mobile app for remote workforce

4. LEAVE MANAGEMENT
   - Automated approval workflows with multi-level authorization
   - Calendar integration and conflict detection
   - Policy enforcement and compliance
   - Self-service portal for employees

5. PERFORMANCE MANAGEMENT
   - 360-degree feedback system
   - Goal setting and tracking (OKRs/KPIs)
   - Performance reviews and appraisals
   - Career development planning

6. RECRUITMENT & TALENT ACQUISITION
   - AI-powered resume screening and candidate matching
   - Automated interview scheduling
   - Candidate relationship management (CRM)
   - Job posting and applicant tracking system (ATS)

7. ANALYTICS & REPORTING
   - Real-time dashboards and KPIs
   - Predictive analytics for HR metrics
   - Custom report builder
   - Data visualization and insights

8. AI-POWERED FEATURES
   - Intelligent resume parsing and analysis
   - Automated interview assessments
   - Sentiment analysis for employee feedback
   - Predictive analytics for retention and performance

INDUSTRY EXPERTISE:
- Serves multiple industries: Technology, Finance, Healthcare, Manufacturing, Retail, Education
- Compliance: GDPR, SOC 2, ISO 27001 certified
- Integration: Works with 100+ third-party applications (Slack, Microsoft Teams, SAP, Oracle, etc.)
- Scalability: Supports organizations from 50 to 50,000+ employees

WEBSITE NAVIGATION:
- Home (/) - Main landing page
- Who we serve (/who-we-serve) - Target industries and client profiles
- What we do (/what-we-do) - Services and solutions overview
- Who we are (/who-we-are) - Company background and team
- Why choose us (/why-choose-us) - Competitive advantages and differentiators
- Contact (/contact) - Get in touch with sales/support
- Careers (/careers) - Job openings and career opportunities
- Features (/features) - Detailed feature list
- About (/about) - Company information

YOUR RESPONSIBILITIES:
1. Provide accurate, industry-specific information about HRMS solutions
2. Guide potential clients through our services and help them understand ROI
3. Assist job seekers with application process and career opportunities
4. Answer technical questions about our platform capabilities
5. Generate professional summaries, descriptions, and content
6. Handle inquiries professionally and route to appropriate departments
7. Provide industry insights and best practices when relevant

COMMUNICATION STYLE:
- Professional yet approachable
- Industry-focused with technical accuracy
- Solution-oriented responses
- Clear, concise, and actionable
- Use industry terminology appropriately
- Provide specific examples when relevant
- Always maintain Mastersolis Infotech's brand voice

RESPONSE GUIDELINES:
- For service inquiries: Provide detailed, technical information with business value
- For job seekers: Be helpful and guide through application process
- For technical questions: Provide accurate, detailed answers
- For general queries: Be informative and suggest relevant next steps
- Always end with a helpful call-to-action when appropriate

Remember: You represent a leading HRMS solution provider. Be knowledgeable, professional, and demonstrate industry expertise in every interaction.`;

// Configure multer for resume uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/chatbot');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `resume-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed'));
    }
  }
});

// Classify query type for better response handling
function classifyQuery(message) {
  const lowerMessage = message.toLowerCase();
  
  // Service-related keywords
  const serviceKeywords = ['service', 'hrms', 'platform', 'solution', 'feature', 'product', 'system', 'software', 'module', 'functionality', 'capability', 'what can', 'how does', 'tell me about'];
  if (serviceKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'service_inquiry';
  }
  
  // Job/career-related keywords
  const jobKeywords = ['job', 'career', 'opening', 'position', 'vacancy', 'hiring', 'recruit', 'apply', 'application', 'opportunity', 'role', 'work at'];
  if (jobKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'job_inquiry';
  }
  
  // Technical keywords
  const technicalKeywords = ['api', 'integration', 'implement', 'deploy', 'technical', 'architecture', 'database', 'security', 'compliance', 'sso', 'oauth', 'rest', 'graphql', 'sdk', 'documentation'];
  if (technicalKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'technical_question';
  }
  
  // Contact/sales keywords
  const contactKeywords = ['contact', 'reach', 'call', 'email', 'phone', 'sales', 'demo', 'consultation', 'meeting', 'schedule', 'talk', 'speak', 'get in touch'];
  if (contactKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'contact_request';
  }
  
  // Default to general question
  return 'general_question';
}

// Get or create chat session
async function getOrCreateSession(sessionId, userId = null) {
  if (!database.isConnected) {
    return { sessionId, messages: [] };
  }

  try {
    let session = await database.findOne('chatbot_sessions', { sessionId });
    
    if (!session) {
      session = {
        sessionId,
        userId,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await database.insertOne('chatbot_sessions', session);
    }
    
    return session;
  } catch (error) {
    console.error('Error getting/creating session:', error);
    return { sessionId, messages: [] };
  }
}

// Save message to session
async function saveMessage(sessionId, role, content, metadata = {}) {
  if (!database.isConnected) return;

  try {
    const message = {
      role,
      content,
      metadata,
      timestamp: new Date()
    };
    
    await database.updateOne(
      'chatbot_sessions',
      { sessionId },
      {
        $push: { messages: message },
        $set: { updatedAt: new Date() }
      }
    );
  } catch (error) {
    console.error('Error saving message:', error);
  }
}

// Chat endpoint with enhanced Gemini API integration
router.post('/chat', [
  body('message').notEmpty().withMessage('Message is required'),
  body('sessionId').optional().isString()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { message, sessionId: providedSessionId } = req.body;
  const sessionId = providedSessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  try {
    // Get or create session
    const session = await getOrCreateSession(sessionId);
    
    // Initialize model with proper configuration
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0.8, // Slightly higher for more dynamic responses
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048, // Increased for more comprehensive answers
      },
    });

    // Build conversation history for context (last 10 messages for better context)
    const recentMessages = session.messages.slice(-10);
    const conversationHistory = recentMessages.map(msg => 
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n');

    // Classify query type for better response handling
    const queryType = classifyQuery(message);
    
    // Build comprehensive prompt with query-specific instructions
    const systemPrompt = `${COMPANY_CONTEXT}\n\n`;
    const historyContext = conversationHistory ? `Previous Conversation:\n${conversationHistory}\n\n` : '';
    const userQuery = `Current User Query: ${message}\n\n`;
    
    // Query-specific instructions
    let instruction = '';
    switch (queryType) {
      case 'service_inquiry':
        instruction = `This is a service inquiry. Provide detailed information about our HRMS services, features, benefits, and how they can help the user. Include specific examples and use cases. Be solution-oriented and highlight business value.`;
        break;
      case 'job_inquiry':
        instruction = `This is a job/career inquiry. Provide information about career opportunities, job openings, application process, and company culture. Be encouraging and helpful.`;
        break;
      case 'technical_question':
        instruction = `This is a technical question. Provide accurate, detailed technical information about our platform, integrations, implementation, and technical capabilities. Use industry terminology appropriately.`;
        break;
      case 'contact_request':
        instruction = `This is a contact or sales inquiry. Provide contact information, encourage them to reach out, and offer to help schedule a consultation or demo. Be warm and professional.`;
        break;
      case 'general_question':
        instruction = `This is a general question. Provide helpful, informative answers while maintaining relevance to our HRMS solutions and services. Be conversational yet professional.`;
        break;
      default:
        instruction = `Please provide a helpful, professional, and industry-oriented response. Be specific, accurate, and solution-focused. Address the user's query comprehensively.`;
    }

    const fullPrompt = `${systemPrompt}${historyContext}${userQuery}${instruction}\n\nIMPORTANT: Always provide a complete, helpful answer. If you don't have specific information, provide general guidance and suggest contacting our team for detailed assistance. Never say "I don't know" - instead, redirect to helpful resources or our contact information.`;

    // Generate response with retry logic
    let responseText = '';
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        responseText = response.text();
        
        // Validate response
        if (responseText && responseText.trim().length > 0) {
          break;
        }
      } catch (apiError) {
        attempts++;
        console.error(`Gemini API attempt ${attempts} failed:`, apiError.message);
        
        if (attempts >= maxAttempts) {
          // Fallback response
          responseText = `I apologize, but I'm experiencing technical difficulties. However, I can still help you! 

For immediate assistance, please:
- Visit our Contact page at /contact
- Email us at info@mastersolisinfotech.com
- Call our support team

For information about our services, I can tell you that Mastersolis Infotech provides enterprise-grade HRMS solutions including:
- Employee Management & Lifecycle
- Payroll Processing & Compliance
- Attendance & Time Tracking
- Performance Management
- AI-Powered Recruitment

Would you like me to help you with any specific service or feature?`;
          break;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }

    // Save messages
    await saveMessage(sessionId, 'user', message);
    await saveMessage(sessionId, 'assistant', responseText);

    res.json({
      success: true,
      sessionId,
      response: responseText,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    
    // Provide helpful error response
    const errorResponse = `I apologize, but I encountered an issue processing your request. 

Here's how I can still help:
1. **Our Services**: We offer comprehensive HRMS solutions including Employee Management, Payroll, Attendance, Performance Reviews, and AI-powered Recruitment.

2. **Get in Touch**: 
   - Visit /contact for direct contact
   - Email: info@mastersolisinfotech.com
   - Our team is ready to assist you

3. **Try Again**: Please rephrase your question or try asking about:
   - Our HRMS platform features
   - Implementation and deployment options
   - Industry-specific solutions
   - Career opportunities

I'm here to help - please try your question again!`;

    res.status(500).json({
      success: false,
      message: 'Error processing chat message',
      response: errorResponse,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// Resume upload and analysis
router.post('/resume/upload', upload.single('resume'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Resume file is required'
    });
  }

  try {
    const { sessionId, candidateName, candidateEmail } = req.body;
    
    // Read file content (for text extraction)
    const filePath = req.file.path;
    let fileContent = '';
    
    try {
      if (req.file.mimetype === 'text/plain') {
        fileContent = await fs.readFile(filePath, 'utf-8');
      } else {
        // For PDF/DOC files, we'd need a parser library
        // For now, just note the file was uploaded
        fileContent = `Resume file uploaded: ${req.file.originalname}`;
      }
    } catch (error) {
      console.error('Error reading file:', error);
    }

    // Use Gemini to analyze resume
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Analyze this resume and extract key information in JSON format:
- candidateName
- email
- phone
- skills (array)
- experience (years)
- education
- summary

Resume content:
${fileContent.substring(0, 5000)}`;

    const result = await model.generateContent(prompt);
    const analysis = await result.response.text();

    // Save to database
    if (database.isConnected) {
      const resumeData = {
        sessionId: sessionId || `resume-${Date.now()}`,
        candidateName: candidateName || 'Unknown',
        candidateEmail: candidateEmail || '',
        fileName: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        analysis,
        uploadedAt: new Date()
      };
      
      await database.insertOne('chatbot_resumes', resumeData);
    }

    res.json({
      success: true,
      message: 'Resume uploaded and analyzed successfully',
      analysis,
      file: {
        name: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing resume',
      error: error.message
    });
  }
}));

// Job application submission
router.post('/application/submit', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('jobId').optional().isString()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { name, email, jobId, coverLetter, resumeUrl, sessionId } = req.body;

  try {
    // Save application
    if (database.isConnected) {
      const application = {
        name,
        email,
        jobId,
        coverLetter,
        resumeUrl,
        sessionId,
        status: 'pending',
        submittedAt: new Date()
      };
      
      await database.insertOne('chatbot_applications', application);
    }

    // Generate acknowledgment message using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Generate a professional acknowledgment message for a job application:
- Applicant name: ${name}
- Position: ${jobId || 'General Application'}
- Company: Mastersolis Infotech
- Tone: Professional, warm, and encouraging
- Include: Thank you, next steps, timeline expectations`;

    const result = await model.generateContent(prompt);
    const acknowledgment = await result.response.text();

    res.json({
      success: true,
      message: 'Application submitted successfully',
      acknowledgment,
      applicationId: `app-${Date.now()}`
    });
  } catch (error) {
    console.error('Application submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting application',
      error: error.message
    });
  }
}));

// Contact form submission
router.post('/contact', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('message').notEmpty().withMessage('Message is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { name, email, message, subject, phone, sessionId } = req.body;

  try {
    // Save contact inquiry
    if (database.isConnected) {
      const inquiry = {
        name,
        email,
        phone,
        subject: subject || 'General Inquiry',
        message,
        sessionId,
        status: 'new',
        createdAt: new Date()
      };
      
      await database.insertOne('chatbot_inquiries', inquiry);
    }

    // Generate response using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Generate a professional response to a contact inquiry:
- Inquirer name: ${name}
- Subject: ${subject || 'General Inquiry'}
- Message: ${message}
- Company: Mastersolis Infotech
- Tone: Professional, helpful, and prompt
- Include: Thank you, acknowledgment, next steps`;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    res.json({
      success: true,
      message: 'Contact inquiry submitted successfully',
      response,
      inquiryId: `inq-${Date.now()}`
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting contact inquiry',
      error: error.message
    });
  }
}));

// Get job openings
router.get('/jobs', asyncHandler(async (req, res) => {
  try {
    let jobs = [];
    
    if (database.isConnected) {
      jobs = await database.find('job_postings', { 
        status: 'active' 
      }, { 
        limit: 10,
        sort: { postedAt: -1 }
      });
    }

    // If no jobs in DB, return sample jobs
    if (jobs.length === 0) {
      jobs = [
        {
          _id: '1',
          title: 'Senior Full Stack Developer',
          department: 'Engineering',
          location: 'Remote',
          type: 'Full-time',
          description: 'We are looking for an experienced Full Stack Developer...'
        },
        {
          _id: '2',
          title: 'HR Business Partner',
          department: 'Human Resources',
          location: 'Bengaluru',
          type: 'Full-time',
          description: 'Join our HR team to help shape the future of HRMS...'
        }
      ];
    }

    res.json({
      success: true,
      jobs
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job openings',
      error: error.message
    });
  }
}));

// Generate content (for SEO, summaries, etc.)
router.post('/generate-content', [
  body('type').isIn(['summary', 'tagline', 'description', 'testimonial']).withMessage('Invalid content type'),
  body('input').notEmpty().withMessage('Input is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { type, input } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    let prompt = '';
    switch (type) {
      case 'summary':
        prompt = `Summarize the following content into a concise, SEO-friendly summary (80-150 words):\n\n${input}`;
        break;
      case 'tagline':
        prompt = `Generate a catchy, professional tagline for Mastersolis Infotech based on: ${input}`;
        break;
      case 'description':
        prompt = `Generate a professional service description for Mastersolis Infotech: ${input}`;
        break;
      case 'testimonial':
        prompt = `Generate a professional testimonial for Mastersolis Infotech based on: ${input}`;
        break;
    }

    const result = await model.generateContent(prompt);
    const content = await result.response.text();

    res.json({
      success: true,
      type,
      content
    });
  } catch (error) {
    console.error('Content generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating content',
      error: error.message
    });
  }
}));

module.exports = router;

