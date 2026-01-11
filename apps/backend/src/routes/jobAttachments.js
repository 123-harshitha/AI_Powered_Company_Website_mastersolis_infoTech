// Job posting attachment API endpoints
const express = require('express');
const router = express.Router();
const database = require('../database/connection');
const { verifyToken } = require('../middleware/authMiddleware');

// Attach screened candidate to job posting
router.post('/attach', verifyToken, async (req, res) => {
  try {
    // Check if user has HR or ADMIN role
    if (!['HR', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. HR or Admin role required.'
      });
    }

    const { candidateId, jobPostingId, attachmentNotes, priority = 'NORMAL' } = req.body;

    if (!candidateId || !jobPostingId) {
      return res.status(400).json({
        success: false,
        message: 'Candidate ID and Job Posting ID are required'
      });
    }

    // Validate priority
    if (!['HIGH', 'NORMAL', 'LOW'].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid priority. Must be HIGH, NORMAL, or LOW'
      });
    }

    // Get candidate and job posting details
    const candidate = await database.findOne('candidates', { _id: candidateId });
    const jobPosting = await database.findOne('job_postings', { _id: jobPostingId });

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

    // Check if candidate has been screened for this job
    const screening = await database.findOne('resume_screenings', {
      candidateId,
      jobPostingId,
      status: { $in: ['SCREENED', 'APPROVED'] }
    });

    if (!screening) {
      return res.status(400).json({
        success: false,
        message: 'Candidate must be screened and approved before attachment'
      });
    }

    // Check if already attached
    const existingAttachment = await database.findOne('job_attachments', {
      candidateId,
      jobPostingId
    });

    if (existingAttachment) {
      return res.status(400).json({
        success: false,
        message: 'Candidate is already attached to this job posting'
      });
    }

    // Create attachment record
    const attachment = {
      candidateId,
      jobPostingId,
      screeningId: screening._id,
      attachedBy: req.user._id,
      attachedByName: req.user.name,
      attachmentDate: new Date(),
      priority,
      attachmentNotes: attachmentNotes || '',
      status: 'ATTACHED',
      fitScore: screening.fitScore,
      aiAnalysis: screening.aiAnalysis
    };

    const attachmentResult = await database.insertOne('job_attachments', attachment);

    // Update candidate application status
    await database.updateOne(
      'candidate_applications',
      { candidateId, jobPostingId },
      { 
        $set: { 
          status: 'SHORTLISTED',
          attachmentId: attachmentResult.insertedId,
          attachedAt: new Date()
        }
      }
    );

    // Update job posting with attachment count
    await database.updateOne(
      'job_postings',
      { _id: jobPostingId },
      { 
        $inc: { 
          shortlistedCount: 1,
          totalAttachments: 1
        }
      }
    );

    res.json({
      success: true,
      message: 'Candidate attached to job posting successfully',
      data: {
        attachmentId: attachmentResult.insertedId,
        candidate: {
          name: candidate.name,
          email: candidate.email
        },
        jobPosting: {
          title: jobPosting.title,
          department: jobPosting.department
        },
        priority,
        fitScore: screening.fitScore
      }
    });

  } catch (error) {
    console.error('Job attachment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get all attachments for a job posting
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
    const { status, priority, sortBy = 'attachmentDate', sortOrder = 'desc' } = req.query;

    // Build filter
    const filter = { jobPostingId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get attachments
    const attachments = await database.find(
      'job_attachments',
      filter,
      { sort }
    );

    // Populate candidate and job posting details
    const populatedAttachments = await Promise.all(
      attachments.map(async (attachment) => {
        const candidate = await database.findOne('candidates', { _id: attachment.candidateId });
        const jobPosting = await database.findOne('job_postings', { _id: attachment.jobPostingId });
        const screening = await database.findOne('resume_screenings', { _id: attachment.screeningId });
        
        return {
          ...attachment,
          candidate: candidate ? {
            name: candidate.name,
            email: candidate.email,
            phone: candidate.phone,
            resumeUploaded: candidate.resumeUploaded
          } : null,
          jobPosting: jobPosting ? {
            title: jobPosting.title,
            department: jobPosting.department
          } : null,
          screening: screening ? {
            fitScore: screening.fitScore,
            strengths: screening.strengths,
            weaknesses: screening.weaknesses,
            recommendations: screening.recommendations
          } : null
        };
      })
    );

    res.json({
      success: true,
      data: populatedAttachments
    });

  } catch (error) {
    console.error('Get job attachments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get all attachments for a candidate
router.get('/candidate/:candidateId', verifyToken, async (req, res) => {
  try {
    // Check if user has HR, ADMIN, or MANAGER role
    if (!['HR', 'ADMIN', 'MANAGER'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. HR, Admin, or Manager role required.'
      });
    }

    const { candidateId } = req.params;

    // Get attachments
    const attachments = await database.find(
      'job_attachments',
      { candidateId },
      { sort: { attachmentDate: -1 } }
    );

    // Populate job posting details
    const populatedAttachments = await Promise.all(
      attachments.map(async (attachment) => {
        const jobPosting = await database.findOne('job_postings', { _id: attachment.jobPostingId });
        
        return {
          ...attachment,
          jobPosting: jobPosting ? {
            title: jobPosting.title,
            department: jobPosting.department,
            status: jobPosting.status
          } : null
        };
      })
    );

    res.json({
      success: true,
      data: populatedAttachments
    });

  } catch (error) {
    console.error('Get candidate attachments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Update attachment status
router.put('/:attachmentId/status', verifyToken, async (req, res) => {
  try {
    // Check if user has HR or ADMIN role
    if (!['HR', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. HR or Admin role required.'
      });
    }

    const { attachmentId } = req.params;
    const { status, notes } = req.body;

    if (!['ATTACHED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'OFFERED', 'HIRED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const attachment = await database.findOne('job_attachments', { _id: attachmentId });
    
    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }

    // Update attachment status
    await database.updateOne(
      'job_attachments',
      { _id: attachmentId },
      { 
        $set: { 
          status,
          statusNotes: notes || '',
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
          status: status === 'HIRED' ? 'HIRED' : 
                 status === 'REJECTED' ? 'REJECTED' :
                 status === 'OFFERED' ? 'OFFERED' :
                 status === 'INTERVIEWED' ? 'INTERVIEWED' :
                 status === 'INTERVIEW_SCHEDULED' ? 'INTERVIEW_SCHEDULED' :
                 'SHORTLISTED',
          updatedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: `Attachment status updated to ${status}`,
      data: { status, notes: notes || '' }
    });

  } catch (error) {
    console.error('Update attachment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Remove attachment
router.delete('/:attachmentId', verifyToken, async (req, res) => {
  try {
    // Check if user has HR or ADMIN role
    if (!['HR', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. HR or Admin role required.'
      });
    }

    const { attachmentId } = req.params;

    const attachment = await database.findOne('job_attachments', { _id: attachmentId });
    
    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }

    // Remove attachment
    await database.deleteOne('job_attachments', { _id: attachmentId });

    // Update candidate application status
    await database.updateOne(
      'candidate_applications',
      { candidateId: attachment.candidateId, jobPostingId: attachment.jobPostingId },
      { 
        $set: { 
          status: 'APPLIED',
          attachmentId: null,
          attachedAt: null
        }
      }
    );

    // Update job posting counts
    await database.updateOne(
      'job_postings',
      { _id: attachment.jobPostingId },
      { 
        $inc: { 
          shortlistedCount: -1,
          totalAttachments: -1
        }
      }
    );

    res.json({
      success: true,
      message: 'Attachment removed successfully'
    });

  } catch (error) {
    console.error('Remove attachment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get attachment details
router.get('/:attachmentId', verifyToken, async (req, res) => {
  try {
    const { attachmentId } = req.params;

    const attachment = await database.findOne('job_attachments', { _id: attachmentId });
    
    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }

    // Get candidate and job posting details
    const candidate = await database.findOne('candidates', { _id: attachment.candidateId });
    const jobPosting = await database.findOne('job_postings', { _id: attachment.jobPostingId });
    const screening = await database.findOne('resume_screenings', { _id: attachment.screeningId });

    res.json({
      success: true,
      data: {
        ...attachment,
        candidate: candidate ? {
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          resumeUploaded: candidate.resumeUploaded,
          resumePath: candidate.resumePath
        } : null,
        jobPosting: jobPosting ? {
          title: jobPosting.title,
          department: jobPosting.department,
          description: jobPosting.description,
          requirements: jobPosting.requirements
        } : null,
        screening: screening ? {
          fitScore: screening.fitScore,
          strengths: screening.strengths,
          weaknesses: screening.weaknesses,
          recommendations: screening.recommendations,
          aiAnalysis: screening.aiAnalysis
        } : null
      }
    });

  } catch (error) {
    console.error('Get attachment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
