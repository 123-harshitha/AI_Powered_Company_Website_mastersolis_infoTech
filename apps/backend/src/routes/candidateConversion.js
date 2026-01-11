// Candidate to Employee conversion API endpoints
const express = require('express');
const router = express.Router();
const database = require('../database/connection');
const { verifyToken } = require('../middleware/authMiddleware');
const bcrypt = require('bcrypt');
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

// Convert candidate to employee
router.post('/convert', verifyToken, async (req, res) => {
  try {
    const { 
      candidateId, 
      jobPostingId, 
      interviewId,
      employeeData,
      startDate,
      salary,
      department,
      position,
      managerId,
      notes
    } = req.body;
    const userId = req.user._id;

    // Verify user has permission to convert candidates
    const user = await database.findOne('users', { _id: userId });
    if (!['HR', 'ADMIN'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to convert candidates'
      });
    }

    // Get candidate details
    const candidate = await database.findOne('candidates', { _id: candidateId });
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Get job posting details
    const jobPosting = await database.findOne('job_postings', { _id: jobPostingId });
    if (!jobPosting) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    // Get interview details
    const interview = await database.findOne('interviews', { _id: interviewId });
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Check if candidate is already converted
    const existingEmployee = await database.findOne('employees', { 
      candidateId: candidateId 
    });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Candidate has already been converted to employee'
      });
    }

    // Generate employee ID
    const employeeId = `EMP${Date.now().toString().slice(-6)}`;

    // Create employee record
    const employee = {
      employeeId,
      candidateId,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      phone: candidate.phone,
      dateOfBirth: candidate.dateOfBirth,
      address: candidate.address,
      department: department || jobPosting.department,
      position: position || jobPosting.title,
      jobTitle: jobPosting.title,
      managerId: managerId || null,
      startDate: new Date(startDate),
      salary: salary || jobPosting.salaryRange?.min || 0,
      status: 'ACTIVE',
      employmentType: 'FULL_TIME',
      workLocation: jobPosting.location || 'Office',
      benefits: jobPosting.benefits || [],
      skills: candidate.skills || [],
      experience: candidate.experience || 0,
      education: candidate.education || [],
      resumeUrl: candidate.resumeUrl,
      profilePicture: candidate.profilePicture,
      emergencyContact: candidate.emergencyContact,
      notes: notes || '',
      convertedBy: userId,
      convertedAt: new Date(),
      interviewScore: interview.finalScore || interview.aiScores?.overallScore || 0,
      onboardingStatus: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const employeeResult = await database.insertOne('employees', employee);

    // Create user account for the new employee
    const hashedPassword = await bcrypt.hash('Welcome123!', 10); // Default password
    const userAccount = {
      username: candidate.email,
      email: candidate.email,
      password: hashedPassword,
      role: 'EMPLOYEE',
      employeeId: employeeResult.insertedId,
      candidateId: candidateId,
      isActive: true,
      profileComplete: true,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const userResult = await database.insertOne('users', userAccount);

    // Update candidate status
    await database.updateOne(
      'candidates',
      { _id: candidateId },
      { 
        $set: { 
          status: 'HIRED',
          convertedToEmployee: true,
          employeeId: employeeResult.insertedId,
          convertedAt: new Date(),
          convertedBy: userId
        }
      }
    );

    // Update interview status
    await database.updateOne(
      'interviews',
      { _id: interviewId },
      { 
        $set: { 
          status: 'HIRED',
          outcome: 'HIRED',
          completedAt: new Date()
        }
      }
    );

    // Update job posting if needed
    await database.updateOne(
      'job_postings',
      { _id: jobPostingId },
      { 
        $inc: { 
          hiredCount: 1,
          openPositions: -1
        },
        $set: {
          lastHiredAt: new Date()
        }
      }
    );

    // Create onboarding record
    const onboarding = {
      employeeId: employeeResult.insertedId,
      candidateId: candidateId,
      jobPostingId: jobPostingId,
      interviewId: interviewId,
      status: 'PENDING',
      startDate: new Date(startDate),
      tasks: [
        { task: 'Complete HR paperwork', status: 'PENDING', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        { task: 'IT account setup', status: 'PENDING', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
        { task: 'Equipment assignment', status: 'PENDING', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
        { task: 'Orientation session', status: 'PENDING', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
        { task: 'Manager introduction', status: 'PENDING', dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) }
      ],
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await database.insertOne('onboarding', onboarding);

    // Send welcome email to new employee
    if (emailQueue) {
      await emailQueue.add('send-email', {
        type: 'employee_welcome',
        to: candidate.email,
        data: {
          employeeName: `${candidate.firstName} ${candidate.lastName}`,
          jobTitle: jobPosting.title,
          department: department || jobPosting.department,
          startDate: new Date(startDate).toLocaleDateString(),
          managerName: managerId ? 'Your Manager' : 'TBD', // Could fetch manager name
          salary: salary || 'TBD',
          employeeId: employeeId,
          loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`,
          onboardingUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/employee/onboarding`
        }
      });
    }

    // Send notification to HR team
    if (emailQueue) {
      await emailQueue.add('send-email', {
        type: 'candidate_hired',
        to: user.email, // HR user email
        data: {
          candidateName: `${candidate.firstName} ${candidate.lastName}`,
          jobTitle: jobPosting.title,
          department: department || jobPosting.department,
          startDate: new Date(startDate).toLocaleDateString(),
          employeeId: employeeId,
          interviewScore: interview.finalScore || interview.aiScores?.overallScore || 0,
          convertedBy: user.name || user.email
        }
      });
    }

    res.json({
      success: true,
      message: 'Candidate successfully converted to employee',
      data: {
        employeeId: employeeResult.insertedId,
        userId: userResult.insertedId,
        employeeId: employeeId,
        onboardingId: onboarding._id
      }
    });

  } catch (error) {
    console.error('Convert candidate error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get candidates ready for conversion
router.get('/candidates-ready', verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Verify user has permission
    const user = await database.findOne('users', { _id: userId });
    if (!['HR', 'ADMIN'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    // Get candidates with completed interviews and good scores
    const candidates = await database.find('candidates', {
      status: { $in: ['SCREENED', 'INTERVIEWED'] },
      convertedToEmployee: { $ne: true }
    });

    // Get their interviews and scores
    const candidatesWithScores = await Promise.all(
      candidates.map(async (candidate) => {
        const interviews = await database.find('interviews', {
          candidateId: candidate._id,
          status: { $in: ['COMPLETED', 'ANALYZED', 'EVALUATED'] }
        });

        const jobAttachments = await database.find('job_attachments', {
          candidateId: candidate._id,
          status: 'APPROVED'
        });

        const bestInterview = interviews.reduce((best, current) => {
          const currentScore = current.finalScore || current.aiScores?.overallScore || 0;
          const bestScore = best.finalScore || best.aiScores?.overallScore || 0;
          return currentScore > bestScore ? current : best;
        }, interviews[0]);

        const bestAttachment = jobAttachments.reduce((best, current) => {
          return current.fitScore > best.fitScore ? current : best;
        }, jobAttachments[0]);

        return {
          ...candidate,
          bestInterview,
          bestAttachment,
          interviewScore: bestInterview?.finalScore || bestInterview?.aiScores?.overallScore || 0,
          fitScore: bestAttachment?.fitScore || 0,
          readyForConversion: (bestInterview?.finalScore || bestInterview?.aiScores?.overallScore || 0) >= 70
        };
      })
    );

    // Filter candidates ready for conversion
    const readyCandidates = candidatesWithScores.filter(candidate => 
      candidate.readyForConversion && candidate.bestInterview
    );

    // Sort by score descending
    readyCandidates.sort((a, b) => b.interviewScore - a.interviewScore);

    res.json({
      success: true,
      data: readyCandidates
    });

  } catch (error) {
    console.error('Get ready candidates error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get conversion history
router.get('/conversion-history', verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 20, offset = 0 } = req.query;

    // Verify user has permission
    const user = await database.findOne('users', { _id: userId });
    if (!['HR', 'ADMIN'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    // Get converted employees
    const employees = await database.find(
      'employees',
      { convertedBy: { $exists: true } },
      { 
        sort: { convertedAt: -1 },
        limit: parseInt(limit),
        skip: parseInt(offset)
      }
    );

    // Populate related data
    const populatedEmployees = await Promise.all(
      employees.map(async (employee) => {
        const candidate = await database.findOne('candidates', { _id: employee.candidateId });
        const jobPosting = await database.findOne('job_postings', { _id: employee.jobPostingId });
        const interview = await database.findOne('interviews', { _id: employee.interviewId });
        const onboarding = await database.findOne('onboarding', { employeeId: employee._id });

        return {
          ...employee,
          candidate: {
            firstName: candidate?.firstName,
            lastName: candidate?.lastName,
            email: candidate?.email
          },
          jobPosting: {
            title: jobPosting?.title,
            department: jobPosting?.department
          },
          interview: {
            finalScore: interview?.finalScore,
            aiScores: interview?.aiScores
          },
          onboarding: {
            status: onboarding?.status,
            tasksCompleted: onboarding?.tasks?.filter(task => task.status === 'COMPLETED').length || 0,
            totalTasks: onboarding?.tasks?.length || 0
          }
        };
      })
    );

    res.json({
      success: true,
      data: populatedEmployees
    });

  } catch (error) {
    console.error('Get conversion history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get onboarding status
router.get('/onboarding/:employeeId', verifyToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const userId = req.user._id;

    // Verify user has permission or is the employee
    const user = await database.findOne('users', { _id: userId });
    const employee = await database.findOne('employees', { _id: employeeId });

    if (!['HR', 'ADMIN'].includes(user.role) && employee?.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const onboarding = await database.findOne('onboarding', { employeeId });

    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding record not found'
      });
    }

    res.json({
      success: true,
      data: onboarding
    });

  } catch (error) {
    console.error('Get onboarding status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Update onboarding task status
router.put('/onboarding/:employeeId/task/:taskId', verifyToken, async (req, res) => {
  try {
    const { employeeId, taskId } = req.params;
    const { status, notes } = req.body;
    const userId = req.user._id;

    // Verify user has permission
    const user = await database.findOne('users', { _id: userId });
    if (!['HR', 'ADMIN'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const onboarding = await database.findOne('onboarding', { employeeId });
    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding record not found'
      });
    }

    // Update task status
    const updatedTasks = onboarding.tasks.map(task => {
      if (task._id.toString() === taskId) {
        return {
          ...task,
          status,
          notes: notes || task.notes,
          completedAt: status === 'COMPLETED' ? new Date() : task.completedAt,
          completedBy: status === 'COMPLETED' ? userId : task.completedBy
        };
      }
      return task;
    });

    // Update overall status
    const completedTasks = updatedTasks.filter(task => task.status === 'COMPLETED').length;
    const overallStatus = completedTasks === updatedTasks.length ? 'COMPLETED' : 
                         completedTasks > 0 ? 'IN_PROGRESS' : 'PENDING';

    await database.updateOne(
      'onboarding',
      { _id: onboarding._id },
      { 
        $set: { 
          tasks: updatedTasks,
          status: overallStatus,
          updatedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: {
        status: overallStatus,
        completedTasks,
        totalTasks: updatedTasks.length
      }
    });

  } catch (error) {
    console.error('Update onboarding task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
