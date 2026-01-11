// Interview scheduling API endpoints
const express = require('express');
const router = express.Router();
const database = require('../database/connection');
const { verifyToken } = require('../middleware/authMiddleware');
const Queue = require('bull');
const { ObjectId } = require('mongodb');

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

// Schedule interview
router.post('/schedule', verifyToken, async (req, res) => {
  try {
    // Check if user has MANAGER, HR, or ADMIN role
    if (!['MANAGER', 'HR', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Manager, HR, or Admin role required.'
      });
    }

    const { 
      attachmentId, 
      scheduledAt, 
      interviewType, 
      location, 
      meetingLink, 
      interviewNotes,
      interviewers = [],
      duration = 60
    } = req.body;

    if (!attachmentId || !scheduledAt || !interviewType) {
      return res.status(400).json({
        success: false,
        message: 'Attachment ID, scheduled date/time, and interview type are required'
      });
    }

    // Validate interview type
    if (!['PHONE', 'VIDEO', 'IN_PERSON', 'PANEL'].includes(interviewType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview type. Must be PHONE, VIDEO, IN_PERSON, or PANEL'
      });
    }

    // Get attachment details
    const attachment = await database.findOne('job_attachments', { _id: attachmentId });
    
    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }

    // Check if interview is already scheduled
    const existingInterview = await database.findOne('interviews', { attachmentId });
    if (existingInterview) {
      return res.status(400).json({
        success: false,
        message: 'Interview is already scheduled for this candidate'
      });
    }

    // Get candidate and job posting details
    const candidate = await database.findOne('candidates', { _id: attachment.candidateId });
    const jobPosting = await database.findOne('job_postings', { _id: attachment.jobPostingId });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    if (!jobPosting) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    // For VIDEO and PANEL interviews, use AI interview system (no external meeting link needed)
    let finalMeetingLink = null;
    if (interviewType === 'VIDEO' || interviewType === 'PANEL') {
      // AI interview is handled internally, no external meeting link
      finalMeetingLink = null;
    } else {
      finalMeetingLink = meetingLink || null;
    }

    // Create interview record
    // Ensure candidateId is stored as ObjectId for consistent querying
    const candidateObjectId = ObjectId.isValid(attachment.candidateId) 
      ? new ObjectId(attachment.candidateId) 
      : attachment.candidateId;
    
    const interview = {
      attachmentId,
      candidateId: candidateObjectId, // Store as ObjectId for proper matching
      jobPostingId: attachment.jobPostingId,
      scheduledBy: req.user._id,
      scheduledByName: req.user.name,
      scheduledAt: new Date(scheduledAt),
      interviewType,
      location: location || null,
      meetingLink: finalMeetingLink || null,
      interviewNotes: interviewNotes || '',
      interviewers: Array.isArray(interviewers) ? interviewers : [],
      duration: parseInt(duration) || 60,
      status: 'SCHEDULED',
      createdAt: new Date()
    };

    const interviewResult = await database.insertOne('interviews', interview);

    // Update attachment status
    await database.updateOne(
      'job_attachments',
      { _id: attachmentId },
      { 
        $set: { 
          status: 'INTERVIEW_SCHEDULED',
          statusUpdatedBy: req.user._id,
          statusUpdatedAt: new Date()
        }
      }
    );

    // Update candidate application status
    await database.updateOne(
      'candidate_applications',
      { candidateId: attachment.candidateId, jobPostingId: attachment.jobPostingId },
      { 
        $set: { 
          status: 'INTERVIEW_SCHEDULED',
          updatedAt: new Date()
        }
      }
    );

    // Send email notification to candidate
    if (emailQueue) {
      await emailQueue.add('send-email', {
        type: 'interview_scheduled',
        to: candidate.email,
        data: {
          candidateName: candidate.name,
          jobTitle: jobPosting.title,
          scheduledAt: interview.scheduledAt,
          type: interviewType,
          location: location,
          meetingLink: finalMeetingLink,
          duration: duration,
          interviewers: interviewers,
          scheduledByName: req.user.name
        }
      });
    }

    res.json({
      success: true,
      message: 'Interview scheduled successfully',
      data: {
        interviewId: interviewResult.insertedId,
        candidate: {
          name: candidate.name,
          email: candidate.email
        },
        jobPosting: {
          title: jobPosting.title,
          department: jobPosting.department
        },
        interview: {
          scheduledAt: interview.scheduledAt,
          interviewType,
          location,
          meetingLink: finalMeetingLink,
          duration
        }
      }
    });

  } catch (error) {
    console.error('Schedule interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Schedule AI interview (no attachment required)
router.post('/schedule-ai', verifyToken, async (req, res) => {
  try {
    if (!['MANAGER', 'HR', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied. Manager, HR, or Admin role required.' });
    }

    const { candidateId, jobPostingId, scheduledAt, meetingLink, interviewNotes, interviewers = [], duration = 45 } = req.body;
    if (!candidateId || !jobPostingId) {
      return res.status(400).json({ success: false, message: 'candidateId and jobPostingId are required' });
    }

    const normalizedCandidateId = ObjectId.isValid(candidateId) ? new ObjectId(candidateId) : candidateId;
    const normalizedJobPostingId = ObjectId.isValid(jobPostingId) ? new ObjectId(jobPostingId) : jobPostingId;

    const candidate = await database.findOne('candidates', { _id: normalizedCandidateId });
    const jobPosting = await database.findOne('job_postings', { _id: normalizedJobPostingId });
    if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found' });
    if (!jobPosting) return res.status(404).json({ success: false, message: 'Job posting not found' });

    const interview = {
      candidateId: normalizedCandidateId, // Ensure ObjectId format
      jobPostingId: normalizedJobPostingId,
      scheduledBy: req.user._id,
      scheduledByName: req.user.name,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(Date.now() + 60 * 60 * 1000),
      interviewType: 'AI',
      location: 'VIRTUAL',
      meetingLink: meetingLink || null,
      interviewNotes: interviewNotes || '',
      interviewers: Array.isArray(interviewers) ? interviewers : [],
      duration: parseInt(duration) || 45,
      status: 'SCHEDULED',
      createdAt: new Date()
    };

    const interviewResult = await database.insertOne('interviews', interview);

    res.json({ success: true, message: 'AI interview scheduled successfully', data: { interviewId: interviewResult.insertedId, scheduledAt: interview.scheduledAt } });
  } catch (error) {
    console.error('Schedule AI interview error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// Get interviews for a manager
router.get('/manager/:managerId', verifyToken, async (req, res) => {
  try {
    const { managerId } = req.params;
    const { status, dateRange, sortBy = 'scheduledAt', sortOrder = 'asc' } = req.query;

    // Check if user can access this data
    if (req.user._id !== managerId && !['HR', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Build filter: show interviews scheduled by manager or where manager is listed as interviewer
    const filter = { $or: [ { scheduledBy: managerId }, { interviewers: { $in: [managerId] } } ] };
    if (status) filter.status = status;
    
    if (dateRange) {
      const [startDate, endDate] = dateRange.split(',');
      if (startDate && endDate) {
        filter.scheduledAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
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

    // Populate candidate and job posting details
    const populatedInterviews = await Promise.all(
      interviews.map(async (interview) => {
        const candidate = await database.findOne('candidates', { _id: interview.candidateId });
        const jobPosting = await database.findOne('job_postings', { _id: interview.jobPostingId });
        const attachment = await database.findOne('job_attachments', { _id: interview.attachmentId });
        
        return {
          ...interview,
          candidate: candidate ? {
            name: candidate.name,
            email: candidate.email,
            phone: candidate.phone
          } : null,
          jobPosting: jobPosting ? {
            title: jobPosting.title,
            department: jobPosting.department
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
    console.error('Get manager interviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get interviews for a job posting
router.get('/job/:jobPostingId', verifyToken, async (req, res) => {
  try {
    // Check if user has HR, ADMIN, or MANAGER role
    if (!['HR', 'ADMIN', 'MANAGER'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. HR, Admin, or Manager role required.'
      });
    }

    const { jobPostingId } = req.params;

    // Get interviews
    const interviews = await database.find(
      'interviews',
      { jobPostingId },
      { sort: { scheduledAt: 1 } }
    );

    // Populate candidate details
    const populatedInterviews = await Promise.all(
      interviews.map(async (interview) => {
        const candidate = await database.findOne('candidates', { _id: interview.candidateId });
        
        return {
          ...interview,
          candidate: candidate ? {
            name: candidate.name,
            email: candidate.email,
            phone: candidate.phone
          } : null
        };
      })
    );

    res.json({
      success: true,
      data: populatedInterviews
    });

  } catch (error) {
    console.error('Get job interviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Update interview status
router.put('/:interviewId/status', verifyToken, async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { status, notes, feedback } = req.body;

    if (!['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const interview = await database.findOne('interviews', { _id: interviewId });
    
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Check if user can update this interview
    if (interview.scheduledBy !== req.user._id && !['HR', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the interviewer or HR/Admin can update interview status.'
      });
    }

    // Update interview status
    const updateData = {
      status,
      statusUpdatedBy: req.user.userId,
      statusUpdatedAt: new Date()
    };

    if (notes) updateData.interviewNotes = notes;
    if (feedback) updateData.feedback = feedback;

    await database.updateOne(
      'interviews',
      { _id: interviewId },
      { $set: updateData }
    );

    // Update attachment status if interview is completed
    if (status === 'COMPLETED') {
      await database.updateOne(
        'job_attachments',
        { _id: interview.attachmentId },
        { 
          $set: { 
            status: 'INTERVIEWED',
            statusUpdatedBy: req.user._id,
            statusUpdatedAt: new Date()
          }
        }
      );

      // Update candidate application status
      await database.updateOne(
        'candidate_applications',
        { candidateId: interview.candidateId, jobPostingId: interview.jobPostingId },
        { 
          $set: { 
            status: 'INTERVIEWED',
            updatedAt: new Date()
          }
        }
      );
    }

    res.json({
      success: true,
      message: `Interview status updated to ${status}`,
      data: { status, notes, feedback }
    });

  } catch (error) {
    console.error('Update interview status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Reschedule interview
router.put('/:interviewId/reschedule', verifyToken, async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { scheduledAt, location, meetingLink, notes } = req.body;

    if (!scheduledAt) {
      return res.status(400).json({
        success: false,
        message: 'New scheduled date/time is required'
      });
    }

    const interview = await database.findOne('interviews', { _id: interviewId });
    
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Check if user can reschedule this interview
    if (interview.scheduledBy !== req.user._id && !['HR', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the interviewer or HR/Admin can reschedule.'
      });
    }

    // Update interview
    await database.updateOne(
      'interviews',
      { _id: interviewId },
      { 
        $set: { 
          scheduledAt: new Date(scheduledAt),
          location: location || interview.location,
          meetingLink: meetingLink || interview.meetingLink,
          interviewNotes: notes || interview.interviewNotes,
          rescheduledBy: req.user._id,
          rescheduledAt: new Date()
        }
      }
    );

    // Send reschedule notification to candidate
    const candidate = await database.findOne('candidates', { _id: interview.candidateId });
    const jobPosting = await database.findOne('job_postings', { _id: interview.jobPostingId });

    if (emailQueue && candidate) {
      await emailQueue.add('send-email', {
        type: 'interview_rescheduled',
        to: candidate.email,
        data: {
          candidateName: candidate.name,
          jobTitle: jobPosting.title,
          oldScheduledAt: interview.scheduledAt,
          newScheduledAt: new Date(scheduledAt),
          type: interview.interviewType,
          location: location || interview.location,
          meetingLink: meetingLink || interview.meetingLink,
          rescheduledByName: req.user.name
        }
      });
    }

    res.json({
      success: true,
      message: 'Interview rescheduled successfully',
      data: {
        interviewId,
        newScheduledAt: new Date(scheduledAt),
        location: location || interview.location,
        meetingLink: meetingLink || interview.meetingLink
      }
    });

  } catch (error) {
    console.error('Reschedule interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Cancel interview
router.put('/:interviewId/cancel', verifyToken, async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { reason } = req.body;

    const interview = await database.findOne('interviews', { _id: interviewId });
    
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Check if user can cancel this interview
    if (interview.scheduledBy !== req.user._id && !['HR', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the interviewer or HR/Admin can cancel.'
      });
    }

    // Update interview status
    await database.updateOne(
      'interviews',
      { _id: interviewId },
      { 
        $set: { 
          status: 'CANCELLED',
          cancellationReason: reason || '',
          cancelledBy: req.user._id,
          cancelledAt: new Date()
        }
      }
    );

    // Update attachment status
    await database.updateOne(
      'job_attachments',
      { _id: interview.attachmentId },
      { 
        $set: { 
          status: 'SHORTLISTED',
          statusUpdatedBy: req.user._id,
          statusUpdatedAt: new Date()
        }
      }
    );

    // Send cancellation notification to candidate
    const candidate = await database.findOne('candidates', { _id: interview.candidateId });
    const jobPosting = await database.findOne('job_postings', { _id: interview.jobPostingId });

    if (emailQueue && candidate) {
      await emailQueue.add('send-email', {
        type: 'interview_cancelled',
        to: candidate.email,
        data: {
          candidateName: candidate.name,
          jobTitle: jobPosting.title,
          scheduledAt: interview.scheduledAt,
          reason: reason || 'No reason provided',
          cancelledByName: req.user.name
        }
      });
    }

    res.json({
      success: true,
      message: 'Interview cancelled successfully',
      data: { reason: reason || '' }
    });

  } catch (error) {
    console.error('Cancel interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get interview details
router.get('/:interviewId', verifyToken, async (req, res) => {
  try {
    const { interviewId } = req.params;

    const interview = await database.findOne('interviews', { _id: interviewId });
    
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Get candidate, job posting, and attachment details
    const candidate = await database.findOne('candidates', { _id: interview.candidateId });
    const jobPosting = await database.findOne('job_postings', { _id: interview.jobPostingId });
    const attachment = await database.findOne('job_attachments', { _id: interview.attachmentId });

    res.json({
      success: true,
      data: {
        ...interview,
        candidate: candidate ? {
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          resumePath: candidate.resumePath
        } : null,
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

module.exports = router;
