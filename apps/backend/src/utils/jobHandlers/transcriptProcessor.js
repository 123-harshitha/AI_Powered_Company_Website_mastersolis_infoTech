// AI Interview Transcript Processing Job Handler
const axios = require('axios');

const processInterviewTranscript = async (job) => {
  const { 
    transcriptId, 
    interviewId, 
    candidateId, 
    jobPostingId, 
    transcript, 
    duration,
    jobTitle,
    jobRequirements,
    candidateName,
    candidateResume
  } = job.data;

  try {
    console.log(`Processing interview transcript ${transcriptId} for candidate ${candidateName}`);

    // Prepare data for AI analysis
    const analysisData = {
      transcript,
      duration,
      jobTitle,
      jobRequirements: Array.isArray(jobRequirements) ? jobRequirements : [],
      candidateName,
      candidateResume: candidateResume || '',
      interviewType: 'technical', // This could be passed from the interview data
      timestamp: new Date().toISOString()
    };

    // Call AI service for transcript analysis
    let aiAnalysis;
    try {
      const aiResponse = await axios.post(`${process.env.ML_SERVICE_URL || 'http://localhost:5000'}/analyze-interview`, {
        ...analysisData
      }, {
        timeout: 30000 // 30 second timeout
      });

      aiAnalysis = aiResponse.data;
    } catch (aiError) {
      console.error('AI service error:', aiError.message);
      
      // Fallback analysis if AI service is unavailable
      aiAnalysis = generateFallbackAnalysis(transcript, jobRequirements);
    }

    // Calculate scores
    const scores = calculateScores(aiAnalysis, transcript, duration);

    // Update transcript with analysis results
    const database = require('../database/connection');
    
    await database.updateOne(
      'interview_transcripts',
      { _id: transcriptId },
      { 
        $set: { 
          analysis: aiAnalysis,
          scores,
          status: 'ANALYZED',
          analyzedAt: new Date()
        }
      }
    );

    // Update interview with AI scores
    await database.updateOne(
      'interviews',
      { _id: interviewId },
      { 
        $set: { 
          aiAnalysis,
          aiScores: scores,
          status: 'ANALYZED'
        }
      }
    );

    console.log(`Successfully processed transcript ${transcriptId} with score: ${scores.overallScore}`);

    return {
      success: true,
      transcriptId,
      scores,
      analysis: aiAnalysis
    };

  } catch (error) {
    console.error(`Error processing transcript ${transcriptId}:`, error);
    
    // Update transcript with error status
    try {
      const database = require('../database/connection');
      await database.updateOne(
        'interview_transcripts',
        { _id: transcriptId },
        { 
          $set: { 
            status: 'ERROR',
            error: error.message,
            analyzedAt: new Date()
          }
        }
      );
    } catch (updateError) {
      console.error('Error updating transcript status:', updateError);
    }

    throw error;
  }
};

// Fallback analysis when AI service is unavailable
const generateFallbackAnalysis = (transcript, jobRequirements) => {
  const words = transcript.split(' ').length;
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const avgWordsPerSentence = words / sentences || 0;

  // Basic keyword matching
  const requirementKeywords = jobRequirements?.join(' ').toLowerCase() || '';
  const transcriptLower = transcript.toLowerCase();
  
  const matchedKeywords = requirementKeywords.split(' ')
    .filter(keyword => keyword.length > 3)
    .filter(keyword => transcriptLower.includes(keyword));

  const keywordMatchScore = (matchedKeywords.length / Math.max(requirementKeywords.split(' ').length, 1)) * 100;

  return {
    overallScore: Math.min(Math.round(keywordMatchScore * 0.7 + Math.min(avgWordsPerSentence * 2, 30)), 100),
    communicationScore: Math.min(Math.round(avgWordsPerSentence * 3), 100),
    technicalScore: Math.round(keywordMatchScore),
    confidenceScore: Math.round(keywordMatchScore * 0.8),
    strengths: [
      matchedKeywords.length > 0 ? 'Demonstrated relevant technical knowledge' : 'Participated actively in interview',
      avgWordsPerSentence > 10 ? 'Clear communication skills' : 'Concise responses'
    ],
    weaknesses: [
      matchedKeywords.length === 0 ? 'Limited technical keyword usage' : 'Could improve technical depth',
      avgWordsPerSentence < 5 ? 'Very brief responses' : 'Could provide more detailed explanations'
    ],
    recommendations: [
      'Review technical requirements more thoroughly',
      'Practice explaining technical concepts clearly',
      'Prepare specific examples of relevant experience'
    ],
    sentiment: 'neutral',
    topics: matchedKeywords.slice(0, 5),
    analysisMethod: 'fallback'
  };
};

// Calculate comprehensive scores
const calculateScores = (analysis, transcript, duration) => {
  const baseScore = analysis.overallScore || 0;
  
  // Duration factor (optimal interview length)
  const optimalDuration = 30; // 30 minutes
  const durationFactor = Math.max(0.8, Math.min(1.2, duration / optimalDuration));
  
  // Communication quality based on transcript length and structure
  const wordsPerMinute = transcript.split(' ').length / (duration / 60) || 0;
  const communicationFactor = Math.max(0.7, Math.min(1.1, wordsPerMinute / 100));
  
  // Calculate final scores
  const overallScore = Math.round(baseScore * durationFactor * communicationFactor);
  const communicationScore = Math.round((analysis.communicationScore || baseScore) * communicationFactor);
  const technicalScore = Math.round(analysis.technicalScore || baseScore);
  const confidenceScore = Math.round(analysis.confidenceScore || baseScore);

  return {
    overallScore: Math.min(overallScore, 100),
    communicationScore: Math.min(communicationScore, 100),
    technicalScore: Math.min(technicalScore, 100),
    confidenceScore: Math.min(confidenceScore, 100),
    duration: duration,
    wordsPerMinute: Math.round(wordsPerMinute),
    analysisTimestamp: new Date().toISOString(),
    factors: {
      durationFactor: Math.round(durationFactor * 100) / 100,
      communicationFactor: Math.round(communicationFactor * 100) / 100
    }
  };
};

module.exports = processInterviewTranscript;
