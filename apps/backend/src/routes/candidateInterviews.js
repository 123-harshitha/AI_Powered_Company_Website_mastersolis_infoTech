// Candidate interview management API endpoints
const express = require('express');
const router = express.Router();
const database = require('../database/connection');
const { authenticateCandidate } = require('../middleware/authMiddleware');
const { ObjectId } = require('mongodb');
const Queue = require('bull');

// Initialize email queue
let emailQueue;
try {
  emailQueue = new Queue('email-notifications', {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
    }
  });
} catch (error) {
  console.warn('Email queue not available:', error.message);
}

// Get candidate's interviews
router.get('/my-interviews', authenticateCandidate, async (req, res) => {
  // Set cache-control headers to prevent browser caching
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  try {
    const candidateId = req.candidateId;
    // Filter out cache-busting parameters
    const { status, sortBy = 'scheduledAt', sortOrder = 'asc', _t, ...rest } = req.query;

    // Ensure candidateId is ObjectId for proper matching
    const candidateObjectId = ObjectId.isValid(candidateId) ? new ObjectId(candidateId) : candidateId;

    // Build filter - try both ObjectId and string formats to handle any existing data inconsistencies
    const filter = {
      $or: [
        { candidateId: candidateObjectId },
        { candidateId: candidateId.toString() },
        { candidateId: candidateObjectId.toString() }
      ]
    };
    if (status) {
      filter.status = status;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get interviews
    const interviews = await database.find(
      'interviews',
      filter,
      { sort }
    );

    // Populate job posting details
    const populatedInterviews = await Promise.all(
      interviews.map(async (interview) => {
        const jobPosting = await database.findOne('job_postings', { _id: interview.jobPostingId });
        const attachment = await database.findOne('job_attachments', { _id: interview.attachmentId });
        
        return {
          ...interview,
          jobPosting: jobPosting ? {
            title: jobPosting.title,
            department: jobPosting.department,
            description: jobPosting.description,
            requirements: jobPosting.requirements
          } : null,
          attachment: attachment ? {
            fitScore: attachment.fitScore,
            priority: attachment.priority
          } : null
        };
      })
    );

    res.json({
      success: true,
      data: populatedInterviews
    });

  } catch (error) {
    console.error('Get candidate interviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get interview details
router.get('/interview/:interviewId', authenticateCandidate, async (req, res) => {
  try {
    const { interviewId } = req.params;
    const candidateId = req.candidateId;

    const interview = await database.findOne('interviews', { 
      _id: interviewId,
      candidateId 
    });
    
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found or access denied'
      });
    }

    // Get job posting details
    const jobPosting = await database.findOne('job_postings', { _id: interview.jobPostingId });
    const attachment = await database.findOne('job_attachments', { _id: interview.attachmentId });

    res.json({
      success: true,
      data: {
        ...interview,
        jobPosting: jobPosting ? {
          title: jobPosting.title,
          department: jobPosting.department,
          description: jobPosting.description,
          requirements: jobPosting.requirements
        } : null,
        attachment: attachment ? {
          fitScore: attachment.fitScore,
          priority: attachment.priority,
          strengths: attachment.screening?.strengths,
          weaknesses: attachment.screening?.weaknesses
        } : null
      }
    });

  } catch (error) {
    console.error('Get interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Request interview reschedule
router.post('/interview/:interviewId/request-reschedule', authenticateCandidate, async (req, res) => {
  try {
    const { interviewId } = req.params;
    const candidateId = req.candidateId;
    const { reason, preferredTimes } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Reschedule reason is required'
      });
    }

    const interview = await database.findOne('interviews', { 
      _id: interviewId,
      candidateId 
    });
    
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found or access denied'
      });
    }

    // Check if interview can be rescheduled
    if (interview.status !== 'SCHEDULED') {
      return res.status(400).json({
        success: false,
        message: 'Only scheduled interviews can be rescheduled'
      });
    }

    // Check if reschedule request is within reasonable time
    const interviewDate = new Date(interview.scheduledAt);
    const now = new Date();
    const hoursUntilInterview = (interviewDate - now) / (1000 * 60 * 60);

    if (hoursUntilInterview < 24) {
      return res.status(400).json({
        success: false,
        message: 'Reschedule requests must be made at least 24 hours before the interview'
      });
    }

    // Create reschedule request
    const rescheduleRequest = {
      interviewId,
      candidateId,
      requestedBy: candidateId,
      requestedByName: req.candidate.name,
      reason,
      preferredTimes: Array.isArray(preferredTimes) ? preferredTimes : [],
      status: 'PENDING',
      requestedAt: new Date()
    };

    const requestResult = await database.insertOne('reschedule_requests', rescheduleRequest);

    // Send notification to HR/Manager
    const jobPosting = await database.findOne('job_postings', { _id: interview.jobPostingId });
    
    if (emailQueue) {
      await emailQueue.add('send-email', {
        type: 'reschedule_request',
        to: interview.scheduledByName, // This should be the manager's email
        data: {
          candidateName: req.candidate.name,
          jobTitle: jobPosting?.title,
          currentScheduledAt: interview.scheduledAt,
          reason,
          preferredTimes: preferredTimes || [],
          requestId: requestResult.insertedId
        }
      });
    }

    res.json({
      success: true,
      message: 'Reschedule request submitted successfully',
      data: {
        requestId: requestResult.insertedId,
        status: 'PENDING'
      }
    });

  } catch (error) {
    console.error('Request reschedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Confirm interview attendance
router.post('/interview/:interviewId/confirm', authenticateCandidate, async (req, res) => {
  try {
    const { interviewId } = req.params;
    const candidateId = req.candidateId;

    // Ensure interviewId and candidateId are ObjectIds for proper matching
    const interviewObjectId = ObjectId.isValid(interviewId) ? new ObjectId(interviewId) : interviewId;
    const candidateObjectId = ObjectId.isValid(candidateId) ? new ObjectId(candidateId) : candidateId;

    // Try to find interview with both ObjectId and string formats
    let interview = await database.findOne('interviews', { 
      _id: interviewObjectId,
      candidateId: candidateObjectId
    });
    
    // If not found, try with string format
    if (!interview) {
      interview = await database.findOne('interviews', { 
        _id: interviewId,
        candidateId: candidateId.toString()
      });
    }
    
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found or access denied'
      });
    }

    if (interview.status !== 'SCHEDULED') {
      return res.status(400).json({
        success: false,
        message: 'Only scheduled interviews can be confirmed'
      });
    }

    // Update interview with confirmation (use the found interview's _id)
    await database.updateOne(
      'interviews',
      { _id: interview._id },
      { 
        $set: { 
          candidateConfirmed: true,
          confirmedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: 'Interview attendance confirmed successfully'
    });

  } catch (error) {
    console.error('Confirm interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get candidate's application status
router.get('/application-status', authenticateCandidate, async (req, res) => {
  try {
    const candidateId = req.candidateId;

    // Get all applications for this candidate
    const applications = await database.find(
      'candidate_applications',
      { candidateId },
      { sort: { appliedAt: -1 } }
    );

    // Populate job posting details
    const populatedApplications = await Promise.all(
      applications.map(async (application) => {
        const jobPosting = await database.findOne('job_postings', { _id: application.jobPostingId });
        const interview = await database.findOne('interviews', { 
          candidateId, 
          jobPostingId: application.jobPostingId 
        });
        
        return {
          ...application,
          jobPosting: jobPosting ? {
            title: jobPosting.title,
            department: jobPosting.department,
            status: jobPosting.status
          } : null,
          interview: interview ? {
            scheduledAt: interview.scheduledAt,
            status: interview.status,
            interviewType: interview.interviewType,
            location: interview.location,
            meetingLink: interview.meetingLink
          } : null
        };
      })
    );

    res.json({
      success: true,
      data: populatedApplications
    });

  } catch (error) {
    console.error('Get application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Send interview reminder request
router.post('/interview/:interviewId/reminder', authenticateCandidate, async (req, res) => {
  try {
    const { interviewId } = req.params;
    const candidateId = req.candidateId;

    const interview = await database.findOne('interviews', { 
      _id: interviewId,
      candidateId 
    });
    
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found or access denied'
      });
    }

    if (interview.status !== 'SCHEDULED') {
      return res.status(400).json({
        success: false,
        message: 'Only scheduled interviews can have reminders sent'
      });
    }

    // Send reminder email to candidate
    const jobPosting = await database.findOne('job_postings', { _id: interview.jobPostingId });
    
    if (emailQueue) {
      await emailQueue.add('send-email', {
        type: 'interview_reminder',
        to: req.candidate.email,
        data: {
          candidateName: req.candidate.name,
          jobTitle: jobPosting?.title,
          scheduledAt: interview.scheduledAt,
          type: interview.interviewType,
          location: interview.location,
          meetingLink: interview.meetingLink,
          time: new Date(interview.scheduledAt).toLocaleTimeString()
        }
      });
    }

    res.json({
      success: true,
      message: 'Interview reminder sent successfully'
    });

  } catch (error) {
    console.error('Send reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
