// Interview transcript processing API endpoints
const express = require('express');
const router = express.Router();
const database = require('../database/connection');
const { verifyToken } = require('../middleware/authMiddleware');
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

// Start interview recording
router.post('/start-recording', verifyToken, async (req, res) => {
  try {
    const { interviewId, meetingLink, participants } = req.body;
    const userId = req.user._id;

    // Verify interview exists and user has access
    const interview = await database.findOne('interviews', { 
      _id: interviewId,
      $or: [
        { scheduledBy: userId },
        { interviewers: { $in: [userId] } }
      ]
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found or access denied'
      });
    }

    // Create transcript record
    const transcript = {
      interviewId,
      meetingLink,
      participants: Array.isArray(participants) ? participants : [],
      startedBy: userId,
      startedAt: new Date(),
      status: 'RECORDING',
      transcript: '',
      analysis: null,
      scores: null,
      duration: 0
    };

    const result = await database.insertOne('interview_transcripts', transcript);

    // Update interview status
    await database.updateOne(
      'interviews',
      { _id: interviewId },
      { 
        $set: { 
          status: 'IN_PROGRESS',
          transcriptId: result.insertedId,
          startedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: 'Interview recording started',
      data: {
        transcriptId: result.insertedId,
        status: 'RECORDING'
      }
    });

  } catch (error) {
    console.error('Start recording error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Update transcript (real-time)
router.post('/update-transcript', verifyToken, async (req, res) => {
  try {
    const { transcriptId, transcript, timestamp } = req.body;
    const userId = req.user._id;

    // Verify transcript exists and user has access
    const transcriptRecord = await database.findOne('interview_transcripts', { 
      _id: transcriptId,
      startedBy: userId
    });

    if (!transcriptRecord) {
      return res.status(404).json({
        success: false,
        message: 'Transcript not found or access denied'
      });
    }

    // Update transcript
    await database.updateOne(
      'interview_transcripts',
      { _id: transcriptId },
      { 
        $set: { 
          transcript,
          lastUpdated: new Date(),
          duration: timestamp || 0
        }
      }
    );

    res.json({
      success: true,
      message: 'Transcript updated successfully'
    });

  } catch (error) {
    console.error('Update transcript error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// End interview recording and trigger AI analysis
router.post('/end-recording', verifyToken, async (req, res) => {
  try {
    const { transcriptId, finalTranscript, duration } = req.body;
    const userId = req.user._id;

    // Verify transcript exists and user has access
    const transcriptRecord = await database.findOne('interview_transcripts', { 
      _id: transcriptId,
      startedBy: userId
    });

    if (!transcriptRecord) {
      return res.status(404).json({
        success: false,
        message: 'Transcript not found or access denied'
      });
    }

    // Update transcript with final data
    await database.updateOne(
      'interview_transcripts',
      { _id: transcriptId },
      { 
        $set: { 
          transcript: finalTranscript,
          duration: duration || 0,
          status: 'PROCESSING',
          endedAt: new Date(),
          endedBy: userId
        }
      }
    );

    // Get interview details for AI analysis
    const interview = await database.findOne('interviews', { 
      _id: transcriptRecord.interviewId 
    });

    const jobPosting = await database.findOne('job_postings', { 
      _id: interview.jobPostingId 
    });

    const candidate = await database.findOne('candidates', { 
      _id: interview.candidateId 
    });

    // Queue AI analysis job
    if (emailQueue) {
      await emailQueue.add('process-interview-transcript', {
        transcriptId,
        interviewId: interview._id,
        candidateId: interview.candidateId,
        jobPostingId: interview.jobPostingId,
        transcript: finalTranscript,
        duration: duration || 0,
        jobTitle: jobPosting?.title,
        jobRequirements: jobPosting?.requirements,
        candidateName: candidate?.name,
        candidateResume: candidate?.resumeText
      });
    }

    // Update interview status
    await database.updateOne(
      'interviews',
      { _id: interview._id },
      { 
        $set: { 
          status: 'COMPLETED',
          completedAt: new Date(),
          duration: duration || 0
        }
      }
    );

    res.json({
      success: true,
      message: 'Interview recording ended and AI analysis queued',
      data: {
        transcriptId,
        status: 'PROCESSING'
      }
    });

  } catch (error) {
    console.error('End recording error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get transcript analysis results
router.get('/transcript/:transcriptId', verifyToken, async (req, res) => {
  try {
    const { transcriptId } = req.params;
    const userId = req.user._id;

    const transcript = await database.findOne('interview_transcripts', { 
      _id: transcriptId,
      $or: [
        { startedBy: userId },
        { 'participants.userId': userId }
      ]
    });

    if (!transcript) {
      return res.status(404).json({
        success: false,
        message: 'Transcript not found or access denied'
      });
    }

    // Get related data
    const interview = await database.findOne('interviews', { 
      _id: transcript.interviewId 
    });

    const jobPosting = await database.findOne('job_postings', { 
      _id: interview.jobPostingId 
    });

    const candidate = await database.findOne('candidates', { 
      _id: interview.candidateId 
    });

    res.json({
      success: true,
      data: {
        ...transcript,
        interview: {
          scheduledAt: interview.scheduledAt,
          interviewType: interview.interviewType,
          duration: interview.duration,
          status: interview.status
        },
        jobPosting: {
          title: jobPosting?.title,
          department: jobPosting?.department,
          requirements: jobPosting?.requirements
        },
        candidate: {
          name: candidate?.name,
          email: candidate?.email
        }
      }
    });

  } catch (error) {
    console.error('Get transcript error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get all transcripts for a user
router.get('/my-transcripts', verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, sortBy = 'startedAt', sortOrder = 'desc' } = req.query;

    // Build filter
    const filter = {
      $or: [
        { startedBy: userId },
        { 'participants.userId': userId }
      ]
    };
    if (status) filter.status = status;

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const transcripts = await database.find(
      'interview_transcripts',
      filter,
      { sort }
    );

    // Populate related data
    const populatedTranscripts = await Promise.all(
      transcripts.map(async (transcript) => {
        const interview = await database.findOne('interviews', { 
          _id: transcript.interviewId 
        });
        const jobPosting = await database.findOne('job_postings', { 
          _id: interview.jobPostingId 
        });
        const candidate = await database.findOne('candidates', { 
          _id: interview.candidateId 
        });

        return {
          ...transcript,
          interview: {
            scheduledAt: interview.scheduledAt,
            interviewType: interview.interviewType,
            status: interview.status
          },
          jobPosting: {
            title: jobPosting?.title,
            department: jobPosting?.department
          },
          candidate: {
            name: candidate?.name
          }
        };
      })
    );

    res.json({
      success: true,
      data: populatedTranscripts
    });

  } catch (error) {
    console.error('Get transcripts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Submit manual scores
router.post('/submit-scores', verifyToken, async (req, res) => {
  try {
    const { transcriptId, manualScores, overallRating, notes } = req.body;
    const userId = req.user._id;

    // Verify transcript exists and user has access
    const transcript = await database.findOne('interview_transcripts', { 
      _id: transcriptId,
      $or: [
        { startedBy: userId },
        { 'participants.userId': userId }
      ]
    });

    if (!transcript) {
      return res.status(404).json({
        success: false,
        message: 'Transcript not found or access denied'
      });
    }

    // Update transcript with manual scores
    await database.updateOne(
      'interview_transcripts',
      { _id: transcriptId },
      { 
        $set: { 
          manualScores: {
            scores: manualScores,
            overallRating,
            notes,
            submittedBy: userId,
            submittedAt: new Date()
          },
          status: 'COMPLETED'
        }
      }
    );

    // Calculate final combined score
    const aiScore = transcript.analysis?.overallScore || 0;
    const manualScore = overallRating || 0;
    const finalScore = Math.round((aiScore + manualScore) / 2);

    // Update transcript with final score
    await database.updateOne(
      'interview_transcripts',
      { _id: transcriptId },
      { 
        $set: { 
          finalScore,
          status: 'COMPLETED'
        }
      }
    );

    // Update interview with final score
    await database.updateOne(
      'interviews',
      { _id: transcript.interviewId },
      { 
        $set: { 
          finalScore,
          status: 'EVALUATED'
        }
      }
    );

    res.json({
      success: true,
      message: 'Manual scores submitted successfully',
      data: {
        finalScore,
        aiScore,
        manualScore
      }
    });

  } catch (error) {
    console.error('Submit scores error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get interview analytics
router.get('/analytics', verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { timeframe = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get transcripts in date range
    const transcripts = await database.find('interview_transcripts', {
      startedBy: userId,
      startedAt: { $gte: startDate }
    });

    // Calculate analytics
    const analytics = {
      totalInterviews: transcripts.length,
      averageDuration: transcripts.reduce((sum, t) => sum + (t.duration || 0), 0) / transcripts.length || 0,
      averageScore: transcripts.reduce((sum, t) => sum + (t.finalScore || 0), 0) / transcripts.length || 0,
      statusBreakdown: {
        completed: transcripts.filter(t => t.status === 'COMPLETED').length,
        processing: transcripts.filter(t => t.status === 'PROCESSING').length,
        recording: transcripts.filter(t => t.status === 'RECORDING').length
      },
      scoreDistribution: {
        excellent: transcripts.filter(t => (t.finalScore || 0) >= 90).length,
        good: transcripts.filter(t => (t.finalScore || 0) >= 70 && (t.finalScore || 0) < 90).length,
        average: transcripts.filter(t => (t.finalScore || 0) >= 50 && (t.finalScore || 0) < 70).length,
        poor: transcripts.filter(t => (t.finalScore || 0) < 50).length
      }
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
