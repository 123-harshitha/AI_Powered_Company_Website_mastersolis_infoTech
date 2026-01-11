// Resume processing job handler (Simplified - No ML dependency)
const processResume = async (jobData) => {
  const { filePath, candidateId, jobPostingId } = jobData;
  
  try {
    console.log(`Processing resume for candidate ${candidateId}`);
    
    // Simple processing without ML service
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        skills: JSON.stringify(['General Skills', 'Communication', 'Problem Solving']),
        fitScore: 75, // Default score
        recommendedRole: 'General Position',
        isProcessed: true,
        processedAt: new Date()
      }
    });

    await prisma.$disconnect();

    // Trigger email notification for HR
    const { addJob } = require('../bullmq');
    await addJob('emailNotifications', 'send-email', {
      type: 'resume_processed',
      candidateId,
      hrEmail: 'hr@company.com', // This would come from job posting or company config
      data: {
        candidateName: 'Candidate',
        fitScore: 75,
        jobTitle: 'Position'
      }
    });

    return {
      success: true,
      candidateId,
      skills: ['General Skills', 'Communication', 'Problem Solving'],
      fitScore: 75
    };

  } catch (error) {
    console.error('Resume processing failed:', error);
    
    // Log error and mark candidate as failed
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        isProcessed: false,
        processingError: error.message || 'Unknown error',
        processedAt: new Date()
      }
    });

    await prisma.$disconnect();

    throw error;
  }
};

module.exports = processResume;
