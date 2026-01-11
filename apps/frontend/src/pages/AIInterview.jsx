import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  VideoCameraIcon,
  MicrophoneIcon,
  StopIcon,
  PlayIcon,
  EyeIcon,
  HeartIcon,
  CpuChipIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { aiAPI } from '../services/api';

const AIInterview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const interviewData = location.state?.interview || {};
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [interviewSession, setInterviewSession] = useState(null);
  const [emotionData, setEmotionData] = useState(null);
  const [sentimentData, setSentimentData] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [interviewReport, setInterviewReport] = useState(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [transcriptionStatus, setTranscriptionStatus] = useState('idle'); // idle, active, error, unsupported
  const [emotionStatus, setEmotionStatus] = useState('idle'); // idle, active, error
  const [sentimentStatus, setSentimentStatus] = useState('idle'); // idle, active, error
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const websocketRef = useRef(null);
  const intervalRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');
  const errorShownRef = useRef(false);

  // Mock interview questions
  const mockQuestions = [
    {
      id: '1',
      question: "Tell me about yourself and your experience with software development.",
      category: "General",
      timeLimit: 300,
      keywords: ["experience", "software", "development", "background"]
    },
    {
      id: '2',
      question: "How do you approach debugging a complex issue in production?",
      category: "Technical",
      timeLimit: 240,
      keywords: ["debugging", "production", "troubleshooting", "analysis"]
    },
    {
      id: '3',
      question: "Describe a time when you had to work with a difficult team member.",
      category: "Behavioral",
      timeLimit: 180,
      keywords: ["teamwork", "conflict", "communication", "collaboration"]
    },
    {
      id: '4',
      question: "How would you design a scalable microservices architecture?",
      category: "System Design",
      timeLimit: 300,
      keywords: ["microservices", "scalability", "architecture", "design"]
    }
  ];

  useEffect(() => {
    // Initialize interview session
    const initializeInterview = async () => {
      try {
        // Start interview session with API
        const jobRole = interviewData.jobPosting?.title || interviewData.jobPostingId?.title || 'Software Developer';
        
        console.log('Initializing interview with jobRole:', jobRole);
        
        // Use candidate-specific endpoint
        const response = await aiAPI.startCandidateInterview(jobRole);
        console.log('Interview start response:', response);
        console.log('Response structure:', {
          hasData: !!response?.data,
          hasSessionId: !!response?.data?.session_id,
          hasNestedData: !!response?.data?.data,
          keys: response ? Object.keys(response) : [],
          dataKeys: response?.data ? Object.keys(response.data) : []
        });
        
        // Handle different response structures
        // Axios returns response.data, so response is already the data object
        let sessionIdValue = null;
        
        // Try response.data.session_id (most common)
        if (response?.data?.session_id) {
          sessionIdValue = response.data.session_id;
        }
        // Try response.session_id (direct)
        else if (response?.session_id) {
          sessionIdValue = response.session_id;
        }
        // Try nested response.data.data.session_id
        else if (response?.data?.data?.session_id) {
          sessionIdValue = response.data.data.session_id;
        }
        
        if (sessionIdValue) {
          console.log('Session ID set:', sessionIdValue);
          setSessionId(sessionIdValue);
          setInterviewSession(response.data || response);
        } else {
          console.warn('No session_id in response, generating temporary ID');
          // Generate a temporary session ID if API doesn't return one
          const tempSessionId = `temp_${Date.now()}`;
          setSessionId(tempSessionId);
          setInterviewSession({ session_id: tempSessionId, job_role: jobRole });
        }
        
        // Initialize with first question
        setCurrentQuestion(mockQuestions[0]);
        setTimeRemaining(mockQuestions[0].timeLimit);
      } catch (error) {
        console.error('Error initializing interview:', error);
        // Fallback to mock questions if API fails
        const tempSessionId = `temp_${Date.now()}`;
        setSessionId(tempSessionId);
        setInterviewSession({ session_id: tempSessionId });
        setCurrentQuestion(mockQuestions[0]);
        setTimeRemaining(mockQuestions[0].timeLimit);
        console.log('Using fallback session ID:', tempSessionId);
      }
    };

    initializeInterview();
    
    // Start timer
    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleNextQuestion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Start emotion analysis when both camera and session ID are available
  useEffect(() => {
    if (isCameraOn && sessionId && !websocketRef.current) {
      startEmotionAnalysis();
    }
  }, [isCameraOn, sessionId]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Verify audio tracks are present
      const audioTracks = stream.getAudioTracks();
      console.log('Camera started with audio tracks:', audioTracks.length);
      if (audioTracks.length > 0) {
        console.log('Audio track state:', audioTracks[0].readyState, 'label:', audioTracks[0].label);
      }
      
      setIsCameraOn(true);
      
      // Start emotion analysis if session ID is available
      if (sessionId) {
        startEmotionAnalysis();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      let errorMsg = 'Failed to access camera/microphone. ';
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMsg += 'Please allow camera and microphone access in your browser settings.';
      } else if (error.name === 'NotFoundError') {
        errorMsg += 'Camera or microphone not found. Please check your devices.';
      } else {
        errorMsg += error.message || 'Please check permissions.';
      }
      alert(errorMsg);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOn(false);
    setIsRecording(false);
  };

  const startEmotionAnalysis = () => {
    if (!sessionId) {
      console.warn('No session ID available for WebSocket connection');
      return;
    }

    // Connect to WebSocket for real-time emotion analysis using actual session ID
    const wsUrl = `ws://localhost:8000/ws/interview/${sessionId}`;
    websocketRef.current = new WebSocket(wsUrl);
    
    websocketRef.current.onopen = () => {
      console.log('WebSocket connected for session:', sessionId);
      setEmotionStatus('active');
      setSentimentStatus('active');
    };
    
    websocketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'emotion_update') {
          setEmotionData(data.data);
          setEmotionStatus('active');
          console.log('Emotion update received:', data.data);
        } else if (data.type === 'transcript_analysis') {
          // Update sentiment from transcript analysis
          if (data.data?.analysis?.sentiment) {
            const sentiment = data.data.analysis.sentiment;
            setSentimentData({
              sentiment: sentiment.label || sentiment.label || 'neutral',
              sentiment_score: sentiment.score || 0.5
            });
            setSentimentStatus('active');
            console.log('Sentiment update received:', sentiment);
          }
        } else if (data.type === 'error') {
          console.error('WebSocket error message:', data.error);
          if (data.error.includes('emotion')) {
            setEmotionStatus('error');
          }
          if (data.error.includes('sentiment')) {
            setSentimentStatus('error');
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    websocketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setEmotionStatus('error');
      setSentimentStatus('error');
    };

    websocketRef.current.onclose = () => {
      console.log('WebSocket closed');
      setEmotionStatus('idle');
      setSentimentStatus('idle');
    };

    // Capture frames for emotion analysis
    const captureFrame = () => {
      if (videoRef.current && canvasRef.current && isCameraOn) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
          websocketRef.current.send(JSON.stringify({
            type: 'emotion_analysis',
            image_data: imageData
          }));
        }
      }
      
      if (isCameraOn) {
        setTimeout(captureFrame, 1000); // Capture every second
      }
    };
    
    captureFrame();
  };

  const startRecording = async () => {
    try {
      // Check if MediaRecorder is supported
      if (!window.MediaRecorder) {
        alert('MediaRecorder is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Edge.');
        return;
      }

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Microphone access is not available in this browser. Please use a modern browser with HTTPS or localhost.');
        return;
      }

      let streamToUse = streamRef.current;
      let needsNewStream = false;

      // Check if existing stream has audio
      if (streamToUse) {
        const audioTracks = streamToUse.getAudioTracks();
        if (audioTracks.length === 0) {
          console.log('Existing stream has no audio tracks, requesting new stream');
          needsNewStream = true;
        } else {
          // Check if audio track is active
          const activeAudioTracks = audioTracks.filter(track => track.readyState === 'live');
          if (activeAudioTracks.length === 0) {
            console.log('Audio tracks exist but are not active, requesting new stream');
            needsNewStream = true;
          }
        }
      } else {
        needsNewStream = true;
      }

      // Request microphone access if needed
      if (needsNewStream) {
        try {
          console.log('Requesting microphone access...');
          const newStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            },
            video: false
          });
          
          console.log('Microphone access granted, audio tracks:', newStream.getAudioTracks().length);
          
          // If we have an existing video stream, add audio to it
          if (streamRef.current && streamRef.current.getVideoTracks().length > 0) {
            // Stop old audio tracks if any
            streamRef.current.getAudioTracks().forEach(track => track.stop());
            // Add new audio track
            newStream.getAudioTracks().forEach(track => {
              streamRef.current.addTrack(track);
            });
            // Stop the video tracks from the new stream (we only want audio)
            newStream.getVideoTracks().forEach(track => track.stop());
            streamToUse = streamRef.current;
          } else {
            streamRef.current = newStream;
            streamToUse = newStream;
          }
        } catch (error) {
          console.error('Error accessing microphone:', error);
          let errorMessage = 'Failed to access microphone. ';
          if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            errorMessage += 'Please allow microphone access in your browser settings:\n\n';
            errorMessage += 'Chrome/Edge: Click the lock icon in address bar → Site settings → Microphone → Allow\n';
            errorMessage += 'Safari: Safari → Settings → Websites → Microphone → Allow\n';
            errorMessage += 'Firefox: Click the lock icon → Permissions → Microphone → Allow';
          } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
            errorMessage += 'No microphone found. Please connect a microphone and try again.';
          } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
            errorMessage += 'Microphone is being used by another application. Please close other apps using the microphone.';
          } else {
            errorMessage += `Error: ${error.message}. Please check your microphone permissions.`;
          }
          alert(errorMessage);
          return;
        }
      }

      // Verify we have audio tracks
      const audioTracks = streamToUse.getAudioTracks();
      if (audioTracks.length === 0) {
        alert('No audio tracks available. Please check your microphone connection.');
        return;
      }

      const activeAudioTracks = audioTracks.filter(t => t.readyState === 'live');
      console.log('Audio tracks available:', audioTracks.length, 'Active:', activeAudioTracks.length);
      
      // If no active tracks, try to get a fresh stream
      if (activeAudioTracks.length === 0) {
        console.warn('No active audio tracks, requesting fresh stream...');
        try {
          const freshStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            },
            video: false
          });
          
          // Replace audio tracks in existing stream
          streamToUse.getAudioTracks().forEach(track => track.stop());
          freshStream.getAudioTracks().forEach(track => {
            streamToUse.addTrack(track);
          });
          freshStream.getVideoTracks().forEach(track => track.stop());
          
          console.log('Fresh audio stream obtained, active tracks:', streamToUse.getAudioTracks().filter(t => t.readyState === 'live').length);
        } catch (error) {
          console.error('Failed to get fresh audio stream:', error);
          alert('Failed to activate microphone. Please check permissions and try again.');
          return;
        }
      }

      // Try different mimeTypes as fallback
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/wav'
      ];

      let mediaRecorder = null;
      let selectedMimeType = null;

      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          try {
            mediaRecorder = new MediaRecorder(streamToUse, { mimeType });
            selectedMimeType = mimeType;
            console.log('✅ MediaRecorder created with mimeType:', mimeType);
            break;
          } catch (error) {
            console.warn(`Failed to create MediaRecorder with ${mimeType}:`, error);
            continue;
          }
        } else {
          console.log(`MimeType ${mimeType} not supported, trying next...`);
        }
      }

      // Fallback to default MediaRecorder if no specific mimeType worked
      if (!mediaRecorder) {
        try {
          mediaRecorder = new MediaRecorder(streamToUse);
          selectedMimeType = mediaRecorder.mimeType || 'audio/webm';
        } catch (error) {
          console.error('Failed to create MediaRecorder:', error);
          alert('Failed to initialize audio recording. Your browser may not support audio recording.');
          return;
        }
      }

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log('Audio chunk received:', event.data.size, 'bytes');
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        alert('An error occurred during recording. Please try again.');
        setIsRecording(false);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: selectedMimeType || 'audio/webm' });
        // Process audio for transcription (can be sent to backend)
        console.log('Audio recorded:', audioBlob.size, 'bytes', 'Type:', selectedMimeType);
      };

      // Start speech recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          console.log('Speech recognition started');
          setTranscriptionStatus('active');
        };

        recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          // Update transcript
          transcriptRef.current = finalTranscript + interimTranscript;
          setAnswerText(transcriptRef.current.trim());

          // Send transcript to WebSocket for real-time analysis
          if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN && finalTranscript) {
            websocketRef.current.send(JSON.stringify({
              type: 'transcript_line',
              text: finalTranscript.trim()
            }));
            setSentimentStatus('active');
          }
        };

        recognition.onerror = (event) => {
          // Ignore normal/expected errors that don't need user attention
          const ignorableErrors = ['no-speech', 'aborted'];
          if (ignorableErrors.includes(event.error)) {
            // These are normal, don't log or change status
            return;
          }
          
          // Only log and update status for actual errors, and only once
          if (!errorShownRef.current) {
            console.log('Speech recognition event:', event.error);
            errorShownRef.current = true;
            
            switch (event.error) {
              case 'not-allowed':
                // Permission denied - but user already granted for MediaRecorder
                // Just disable speech recognition, don't show alert
                setTranscriptionStatus('error');
                // Stop trying to restart
                if (recognitionRef.current) {
                  try {
                    recognitionRef.current.stop();
                  } catch (e) {
                    // Ignore
                  }
                }
                break;
              case 'audio-capture':
              case 'network':
              case 'service-not-allowed':
                // Log but don't change status - let user continue typing
                console.warn('Speech recognition issue:', event.error);
                setTranscriptionStatus('error');
                break;
              default:
                // Other errors - just log
                console.warn('Speech recognition error:', event.error);
            }
          }
        };

        recognition.onend = () => {
          // Only restart if still recording and no error occurred
          if (mediaRecorderRef.current && 
              mediaRecorderRef.current.state === 'recording' && 
              isRecording &&
              transcriptionStatus !== 'error' &&
              transcriptionStatus !== 'unsupported') {
            try {
              if (recognitionRef.current) {
                // Small delay before restarting to avoid rapid restarts
                setTimeout(() => {
                  if (recognitionRef.current && 
                      isRecording && 
                      transcriptionStatus !== 'error' &&
                      transcriptionStatus !== 'unsupported') {
                    try {
                      recognitionRef.current.start();
                    } catch (error) {
                      // Silently handle restart errors
                      if (error.name !== 'InvalidStateError' && error.name !== 'NotAllowedError') {
                        console.warn('Could not restart recognition:', error.message);
                      }
                    }
                  }
                }, 500); // Increased delay to prevent rapid restarts
              }
            } catch (error) {
              // Silently handle - recognition might have been stopped
            }
          }
        };

        recognitionRef.current = recognition;
        
        try {
          recognition.start();
          setTranscriptionStatus('active');
          console.log('Speech recognition started');
        } catch (error) {
          console.warn('Error starting speech recognition:', error);
          // Don't show alert if it's just a state error (might already be starting)
          if (error.name !== 'InvalidStateError') {
            setTranscriptionStatus('error');
          } else {
            // Already started or starting, just set as active
            setTranscriptionStatus('active');
          }
        }
      } else {
        console.warn('Speech recognition not supported in this browser');
        setTranscriptionStatus('unsupported');
        // Don't show alert - just silently disable speech recognition
        // User can still type manually
      }

      // Start MediaRecorder
      try {
        // Wait a bit to ensure stream is ready
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Verify MediaRecorder was created
        if (!mediaRecorder) {
          throw new Error('MediaRecorder initialization failed');
        }
        
        // Check MediaRecorder state before starting
        if (mediaRecorder.state === 'recording') {
          console.warn('MediaRecorder already recording');
          setIsRecording(true);
          return;
        }
        
        if (mediaRecorder.state === 'inactive') {
          // Verify stream is still active
          const activeTracks = streamToUse.getAudioTracks().filter(t => t.readyState === 'live');
          if (activeTracks.length === 0) {
            throw new Error('No active audio tracks available');
          }
          
          mediaRecorder.start(1000); // Collect data every second
          setIsRecording(true);
          console.log('✅ Recording started successfully with mimeType:', selectedMimeType);
          console.log('Active audio tracks:', activeTracks.length);
        } else {
          console.error('MediaRecorder in unexpected state:', mediaRecorder.state);
          alert('MediaRecorder is not ready. Please try again.');
          return;
        }
      } catch (error) {
        console.error('Error starting MediaRecorder:', error);
        setIsRecording(false);
        
        // Clean up on error
        if (mediaRecorderRef.current) {
          try {
            if (mediaRecorderRef.current.state !== 'inactive') {
              mediaRecorderRef.current.stop();
            }
          } catch (e) {
            console.error('Error stopping MediaRecorder:', e);
          }
        }
        
        // Provide more specific error message
        let errorMsg = 'Failed to start recording. ';
        if (error.message.includes('active audio tracks')) {
          errorMsg += 'Microphone is not active. Please check your microphone connection and permissions.';
        } else if (error.message.includes('initialization failed')) {
          errorMsg += 'Your browser may not support audio recording. Please try a different browser.';
        } else {
          errorMsg += error.message || 'Please check your microphone permissions and try again.';
        }
        
        alert(errorMsg);
        return;
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        alert('Microphone permission denied. Please allow microphone access in your browser settings.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        alert('No microphone found. Please connect a microphone and try again.');
      } else {
        alert(`Failed to start recording: ${error.message}. Please check microphone permissions.`);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    setIsRecording(false);
  };

  const handleNextQuestion = () => {
    if (questionIndex < mockQuestions.length - 1) {
      const nextIndex = questionIndex + 1;
      setQuestionIndex(nextIndex);
      setCurrentQuestion(mockQuestions[nextIndex]);
      setTimeRemaining(mockQuestions[nextIndex].timeLimit);
    } else {
      // Interview completed
      setCurrentQuestion(null);
      setTimeRemaining(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const submitAnswer = async () => {
    if (!answerText.trim() || !currentQuestion) {
      alert('Please provide an answer before submitting.');
      return;
    }

    // Ensure sessionId is set (use current state or generate one)
    let activeSessionId = sessionId;
    if (!activeSessionId) {
      console.warn('Session ID not found, generating temporary ID');
      activeSessionId = `temp_${Date.now()}`;
      setSessionId(activeSessionId);
    }

    setIsLoading(true);
    try {
      console.log('Submitting answer with sessionId:', activeSessionId);
      // Use candidate-specific endpoint
      const response = await aiAPI.submitCandidateAnswer(
        activeSessionId,
        answerText,
        currentQuestion.id
      );
      console.log('Submit answer response (raw):', response);
      
      // Axios returns: { data: { success, message, data: {...} }, status, headers, ... }
      // Backend returns: { success: true, message: "...", data: { answer_feedback: {...}, score: 98 } }
      // So we need: response.data.data to get the actual data object
      
      // Check the structure
      const backendResponse = response?.data || response;
      console.log('Backend response:', backendResponse);
      console.log('Backend response keys:', backendResponse ? Object.keys(backendResponse) : 'null');
      
      // Extract the actual data - backend wraps it in a "data" property
      let data = null;
      if (backendResponse && backendResponse.data) {
        data = backendResponse.data; // This should be { answer_feedback: {...}, score: 98 }
        console.log('✅ Extracted from backendResponse.data');
      } else if (backendResponse && (backendResponse.answer_feedback || backendResponse.score)) {
        data = backendResponse; // Data is directly in the response
        console.log('✅ Using backendResponse directly');
      } else {
        data = backendResponse;
        console.log('⚠️ Using backendResponse as fallback');
      }
      
      console.log('Final data object:', data);
      console.log('Data keys:', data ? Object.keys(data) : 'null');
      console.log('Full response data:', JSON.stringify(data, null, 2));
      
      // Extract score - handle both decimal (0.0-1.0) and percentage (0-100) formats
      let extractedScore = 0;
      
      // Debug: Check what's actually in the data
      console.log('Checking data structure:');
      console.log('- data type:', typeof data);
      console.log('- data.answer_feedback exists?', !!data.answer_feedback);
      console.log('- data.answer_feedback?.score_breakdown exists?', !!data.answer_feedback?.score_breakdown);
      console.log('- data.answer_feedback?.score_breakdown?.overall_score:', data.answer_feedback?.score_breakdown?.overall_score);
      console.log('- data.score:', data.score);
      
      // Check for answer_feedback.score_breakdown.overall_score (from ML service)
      // Use explicit checks instead of optional chaining to debug
      if (data && data.answer_feedback && 
          data.answer_feedback.score_breakdown && 
          data.answer_feedback.score_breakdown.overall_score !== undefined &&
          data.answer_feedback.score_breakdown.overall_score !== null) {
        extractedScore = data.answer_feedback.score_breakdown.overall_score;
        console.log('✅ Found overall_score in answer_feedback:', extractedScore);
        // If score is decimal (0.0-1.0), convert to percentage
        if (extractedScore <= 1.0) {
          extractedScore = extractedScore * 100;
          console.log('Converted decimal to percentage:', extractedScore);
        }
      } 
      // Check for direct score field (fallback from backend mock)
      else if (data && data.score !== undefined && data.score !== null) {
        extractedScore = data.score;
        console.log('✅ Found direct score field:', extractedScore);
      } 
      // Try to calculate from score breakdown if overall_score not present
      else if (data && data.answer_feedback && data.answer_feedback.score_breakdown) {
        const breakdown = data.answer_feedback.score_breakdown;
        console.log('Score breakdown found, calculating average:', breakdown);
        const scores = [
          breakdown.technical_depth,
          breakdown.communication_clarity,
          breakdown.problem_solving,
          breakdown.confidence,
          breakdown.relevance
        ].filter(s => s !== undefined && s !== null);
        
        if (scores.length > 0) {
          // Convert decimal scores to percentage if needed
          const convertedScores = scores.map(s => s <= 1.0 ? s * 100 : s);
          extractedScore = convertedScores.reduce((a, b) => a + b, 0) / convertedScores.length;
          console.log('✅ Calculated average from breakdown:', extractedScore);
        } else {
          console.warn('No valid scores found in breakdown');
        }
      } else {
        console.warn('❌ No score found in response data. Structure:', {
          hasAnswerFeedback: !!data?.answer_feedback,
          hasScoreBreakdown: !!(data?.answer_feedback && data.answer_feedback.score_breakdown),
          hasDirectScore: data?.score !== undefined,
          dataKeys: data ? Object.keys(data) : []
        });
      }
      
      console.log('Final extracted score:', extractedScore);
      
      if (response.success || response.data || data) {
        setAnswers(prev => [...prev, {
          question: currentQuestion.question,
          answer: answerText,
          score: Math.max(0, Math.round(extractedScore)), // Ensure non-negative
          feedback: data?.answer_feedback?.message || data?.feedback || 'Answer submitted successfully'
        }]);
        
        // Clear answer text
        setAnswerText('');
        
        // Move to next question
        handleNextQuestion();
      } else {
        alert('Failed to submit answer. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert(`Error submitting answer: ${error.response?.data?.message || error.message || 'Please try again'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExitInterview = () => {
    if (window.confirm('Are you sure you want to exit the interview? Your progress will be saved.')) {
      // Clean up resources
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopRecording();
      
      // Navigate back to interviews page
      navigate('/candidate-portal/interviews');
    }
  };

  const handleViewResults = async () => {
    if (!sessionId) {
      alert('Session ID not available. Cannot generate report.');
      return;
    }

    setIsLoadingReport(true);
    setShowResults(true);

    try {
      // Try to get interview report from API
      const response = await aiAPI.generateInterviewReport(sessionId);
      console.log('Interview report response:', response);
      
      if (response && (response.data || response.success)) {
        setInterviewReport(response.data || response);
      } else {
        // Generate local report from answers
        const localReport = {
          session_id: sessionId,
          total_questions: mockQuestions.length,
          answered_questions: answers.length,
          answers: answers,
          overall_score: answers.length > 0 
            ? Math.round(answers.reduce((sum, a) => sum + (a.score || 0), 0) / answers.length)
            : 0,
          emotion_analysis: emotionData,
          sentiment_analysis: sentimentData,
          completed_at: new Date().toISOString()
        };
        setInterviewReport(localReport);
      }
    } catch (error) {
      console.error('Error fetching interview report:', error);
      // Generate local report from answers as fallback
      const localReport = {
        session_id: sessionId,
        total_questions: mockQuestions.length,
        answered_questions: answers.length,
        answers: answers,
        overall_score: answers.length > 0 
          ? Math.round(answers.reduce((sum, a) => sum + (a.score || 0), 0) / answers.length)
          : 0,
        emotion_analysis: emotionData,
        sentiment_analysis: sentimentData,
        completed_at: new Date().toISOString()
      };
      setInterviewReport(localReport);
    } finally {
      setIsLoadingReport(false);
    }
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      happy: 'text-green-600 bg-green-100',
      sad: 'text-blue-600 bg-blue-100',
      angry: 'text-red-600 bg-red-100',
      fear: 'text-purple-600 bg-purple-100',
      surprise: 'text-yellow-600 bg-yellow-100',
      disgust: 'text-orange-600 bg-orange-100',
      neutral: 'text-gray-600 bg-gray-100'
    };
    return colors[emotion] || colors.neutral;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleExitInterview}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <XCircleIcon className="h-5 w-5 mr-2" />
              Exit Interview
            </button>
          </div>
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center space-x-3 mb-4"
            >
              <VideoCameraIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">AI-Powered Interview</h1>
            </motion.div>
            <p className="text-lg text-gray-600">
              Real-time emotion analysis and intelligent scoring
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Interview Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Feed */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Video Feed</h3>
                <div className="flex space-x-2">
                  {!isCameraOn ? (
                    <button
                      onClick={startCamera}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      Enable Camera
                    </button>
                  ) : (
                    <button
                      onClick={stopCamera}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <XCircleIcon className="h-4 w-4 mr-2" />
                      Disable Camera
                    </button>
                  )}
                </div>
              </div>
              
              <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                  style={{ display: isCameraOn ? 'block' : 'none' }}
                />
                
                {!isCameraOn && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <VideoCameraIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Camera disabled</p>
                    </div>
                  </div>
                )}
                
                <canvas ref={canvasRef} className="hidden" />
              </div>
            </div>

            {/* Current Question */}
            {currentQuestion ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Current Question</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4" />
                    <span className="font-mono">{formatTime(timeRemaining)}</span>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-lg text-blue-900 font-medium mb-2">
                    Question {questionIndex + 1} of {mockQuestions.length}
                  </p>
                  <p className="text-blue-800">{currentQuestion.question}</p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {currentQuestion.category}
                    </span>
                  </div>
                </div>
                
                {/* Answer Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Answer {isRecording && <span className="text-red-600 text-xs">(Recording...)</span>}
                  </label>
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder={isRecording ? "Speak your answer... (or type manually)" : "Type your answer here or use voice recording..."}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    disabled={isLoading}
                  />
                  {isRecording && (
                    <div className="text-xs text-gray-500 mt-1">
                      <p className="flex items-center">
                        <span className="inline-block w-2 h-2 bg-red-600 rounded-full mr-2 animate-pulse"></span>
                        {transcriptionStatus === 'active' && '🎤 Voice transcription active - speak your answer'}
                        {transcriptionStatus === 'unsupported' && '⌨️ Type your answer (voice transcription not available in this browser)'}
                        {transcriptionStatus === 'error' && '⌨️ Type your answer (voice transcription unavailable)'}
                        {transcriptionStatus === 'idle' && '🎤 Starting voice transcription...'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-4">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors"
                    >
                      <MicrophoneIcon className="h-5 w-5 mr-2" />
                      Start Recording
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors"
                    >
                      <StopIcon className="h-5 w-5 mr-2" />
                      Stop Recording
                    </button>
                  )}
                  
                  <button
                    onClick={submitAnswer}
                    disabled={isLoading || !answerText.trim()}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                        Submit Answer
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center"
              >
                <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Interview Completed!</h3>
                <p className="text-gray-600 mb-6">
                  Thank you for completing the AI interview. Your responses have been analyzed.
                </p>
                <button 
                  onClick={handleViewResults}
                  disabled={isLoadingReport}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoadingReport ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Loading Results...
                    </>
                  ) : (
                    <>
                      <ChartBarIcon className="h-5 w-5 mr-2" />
                      View Results
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </div>

          {/* Real-time Analysis Sidebar */}
          <div className="space-y-6">
            {/* Emotion Analysis */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <HeartIcon className="h-6 w-6 text-red-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Emotion Analysis</h3>
                </div>
                <div className={`h-2 w-2 rounded-full ${
                  emotionStatus === 'active' ? 'bg-green-500 animate-pulse' :
                  emotionStatus === 'error' ? 'bg-red-500' :
                  'bg-gray-300'
                }`} title={emotionStatus === 'active' ? 'Active' : emotionStatus === 'error' ? 'Error' : 'Inactive'} />
              </div>
              
              {emotionData ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-2 ${getEmotionColor(emotionData.emotion)}`}>
                      <HeartIcon className="h-8 w-8" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900 capitalize">
                      {emotionData.emotion}
                    </p>
                    <p className="text-sm text-gray-500">
                      {Math.round(emotionData.confidence * 100)}% confidence
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Emotion Distribution</h4>
                    {emotionData.all_emotions && Object.entries(emotionData.all_emotions).map(([emotion, score]) => (
                      <div key={emotion} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 capitalize">{emotion}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${score * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-8">
                            {Math.round(score * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <HeartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">
                    {!isCameraOn ? 'Enable camera to start emotion analysis' : 
                     emotionStatus === 'error' ? 'Emotion analysis error - check ML service' :
                     'Waiting for emotion data...'}
                  </p>
                  {emotionStatus === 'error' && (
                    <p className="text-xs text-red-600">Make sure ML service is running on port 8000</p>
                  )}
                </div>
              )}
            </div>

            {/* Sentiment Analysis */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <CpuChipIcon className="h-6 w-6 text-green-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Sentiment Analysis</h3>
                </div>
                <div className={`h-2 w-2 rounded-full ${
                  sentimentStatus === 'active' ? 'bg-green-500 animate-pulse' :
                  sentimentStatus === 'error' ? 'bg-red-500' :
                  'bg-gray-300'
                }`} title={sentimentStatus === 'active' ? 'Active' : sentimentStatus === 'error' ? 'Error' : 'Inactive'} />
              </div>
              
              {sentimentData ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-2 ${
                      sentimentData.sentiment === 'positive' ? 'text-green-600 bg-green-100' :
                      sentimentData.sentiment === 'negative' ? 'text-red-600 bg-red-100' :
                      'text-gray-600 bg-gray-100'
                    }`}>
                      <CpuChipIcon className="h-8 w-8" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900 capitalize">
                      {sentimentData.sentiment}
                    </p>
                    <p className="text-sm text-gray-500">
                      {Math.round(sentimentData.sentiment_score * 100)}% confidence
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CpuChipIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">
                    {!isRecording ? 'Start recording to analyze sentiment' :
                     sentimentStatus === 'error' ? 'Sentiment analysis error - check ML service' :
                     'Waiting for transcript data...'}
                  </p>
                  {sentimentStatus === 'error' && (
                    <p className="text-xs text-red-600">Make sure ML service is running on port 8000</p>
                  )}
                </div>
              )}
            </div>

            {/* Interview Progress */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <ChartBarIcon className="h-6 w-6 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Questions Completed</span>
                  <span className="text-sm font-medium text-gray-900">
                    {questionIndex} / {mockQuestions.length}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(questionIndex / mockQuestions.length) * 100}%` }}
                  />
                </div>
                
                <div className="space-y-2">
                  {answers.map((answer, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Q{index + 1}</span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          answer.score >= 80 ? 'bg-green-500' :
                          answer.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span className="text-sm font-medium text-gray-900">
                          {Math.round(answer.score)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Modal */}
      {showResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Interview Results</h2>
              <button
                onClick={() => setShowResults(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {isLoadingReport ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : interviewReport ? (
                <div className="space-y-6">
                  {/* Overall Score */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white text-center">
                    <h3 className="text-lg font-medium mb-2">Overall Score</h3>
                    <div className="text-5xl font-bold mb-2">
                      {interviewReport.overall_score || 0}%
                    </div>
                    <p className="text-blue-100">
                      {interviewReport.answered_questions || answers.length} of {interviewReport.total_questions || mockQuestions.length} questions answered
                    </p>
                  </div>

                  {/* Answers Summary */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Answers</h3>
                    <div className="space-y-4">
                      {answers.map((answer, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(answer.score || 0)}`}>
                              {Math.round(answer.score || 0)}%
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{answer.question}</p>
                          <p className="text-gray-800 mb-2">{answer.answer}</p>
                          {answer.feedback && (
                            <p className="text-sm text-blue-600 italic">"{answer.feedback}"</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Emotion & Sentiment Analysis */}
                  {(emotionData || sentimentData) && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Analysis</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {emotionData && (
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-2">Emotion Analysis</h4>
                            <div className="flex items-center space-x-2">
                              <div className={`px-3 py-1 rounded-full text-sm ${getEmotionColor(emotionData.emotion)}`}>
                                {emotionData.emotion || 'neutral'}
                              </div>
                              <span className="text-sm text-gray-600">
                                {Math.round((emotionData.confidence || 0) * 100)}% confidence
                              </span>
                            </div>
                          </div>
                        )}
                        {sentimentData && (
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-2">Sentiment Analysis</h4>
                            <div className="flex items-center space-x-2">
                              <div className={`px-3 py-1 rounded-full text-sm ${
                                sentimentData.sentiment === 'positive' ? 'text-green-600 bg-green-100' :
                                sentimentData.sentiment === 'negative' ? 'text-red-600 bg-red-100' :
                                'text-gray-600 bg-gray-100'
                              }`}>
                                {sentimentData.sentiment || 'neutral'}
                              </div>
                              <span className="text-sm text-gray-600">
                                {Math.round((sentimentData.sentiment_score || 0) * 100)}% confidence
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => navigate('/candidate-portal/interviews')}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Back to Interviews
                    </button>
                    <button
                      onClick={() => setShowResults(false)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No results available</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AIInterview;
