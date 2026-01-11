"""
Emotion Analysis Module for SmartHire AI Recruitment System
Real-time emotion detection and sentiment analysis
"""
import cv2
import numpy as np
import tensorflow as tf
from PIL import Image
import base64
import io
from typing import Dict, List, Any, Optional, Tuple
import logging
from datetime import datetime
import json

logger = logging.getLogger(__name__)

class EmotionAnalyzer:
    """Advanced emotion analysis using computer vision and NLP"""
    
    def __init__(self):
        self.emotion_model = None
        self.face_cascade = None
        self.emotion_labels = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']
        self.sentiment_keywords = {
            'positive': ['excellent', 'great', 'amazing', 'wonderful', 'fantastic', 'outstanding'],
            'negative': ['terrible', 'awful', 'horrible', 'disappointing', 'frustrating', 'difficult'],
            'neutral': ['okay', 'fine', 'average', 'normal', 'standard', 'typical']
        }
        
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize emotion detection models"""
        try:
            # Load emotion detection model
            self.emotion_model = tf.keras.models.load_model('emotion_model.h5')
            logger.info("✅ Emotion model loaded successfully")
        except Exception as e:
            logger.warning(f"⚠️ Emotion model not available: {e}")
            self.emotion_model = None
        
        try:
            # Load OpenCV face cascade
            self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            logger.info("✅ Face detection cascade loaded")
        except Exception as e:
            logger.warning(f"⚠️ Face cascade not available: {e}")
            self.face_cascade = None
    
    def analyze_image_emotion(self, image_data: str) -> Dict[str, Any]:
        """Analyze emotion from base64 encoded image"""
        try:
            # Decode base64 image
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
            
            # Convert to OpenCV format
            cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            
            # Detect faces
            faces = self._detect_faces(cv_image)
            
            if not faces:
                return {
                    "emotion": "neutral",
                    "confidence": 0.5,
                    "face_detected": False,
                    "message": "No face detected in image"
                }
            
            # Analyze emotion for each face
            emotion_results = []
            for face in faces:
                emotion_result = self._analyze_face_emotion(cv_image, face)
                emotion_results.append(emotion_result)
            
            # Return primary emotion (highest confidence)
            primary_emotion = max(emotion_results, key=lambda x: x['confidence'])
            
            return {
                "emotion": primary_emotion['emotion'],
                "confidence": primary_emotion['confidence'],
                "face_detected": True,
                "faces_analyzed": len(faces),
                "all_emotions": emotion_results,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Image emotion analysis error: {e}")
            return {
                "emotion": "neutral",
                "confidence": 0.0,
                "error": str(e),
                "face_detected": False
            }
    
    def _detect_faces(self, image: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """Detect faces in image"""
        if self.face_cascade is None:
            return []
        
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.1, 4)
        return faces.tolist()
    
    def _analyze_face_emotion(self, image: np.ndarray, face: Tuple[int, int, int, int]) -> Dict[str, Any]:
        """Analyze emotion for a specific face"""
        if self.emotion_model is None:
            return {
                "emotion": "neutral",
                "confidence": 0.5,
                "all_emotions": {label: 0.14 for label in self.emotion_labels}
            }
        
        x, y, w, h = face
        
        # Extract face region
        face_roi = image[y:y+h, x:x+w]
        
        # Convert to grayscale and resize
        gray_face = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
        resized_face = cv2.resize(gray_face, (48, 48))
        
        # Normalize
        normalized_face = resized_face.astype('float32') / 255.0
        reshaped_face = normalized_face.reshape(1, 48, 48, 1)
        
        # Predict emotion
        predictions = self.emotion_model.predict(reshaped_face, verbose=0)
        emotion_scores = predictions[0]
        
        # Get emotion with highest confidence
        emotion_idx = np.argmax(emotion_scores)
        emotion = self.emotion_labels[emotion_idx]
        confidence = float(emotion_scores[emotion_idx])
        
        # Create emotion distribution
        emotion_distribution = {
            label: float(score) for label, score in zip(self.emotion_labels, emotion_scores)
        }
        
        return {
            "emotion": emotion,
            "confidence": confidence,
            "all_emotions": emotion_distribution,
            "face_coordinates": face
        }
    
    def analyze_text_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment from text using keyword analysis"""
        try:
            text_lower = text.lower()
            
            # Count sentiment keywords
            positive_count = sum(1 for word in self.sentiment_keywords['positive'] if word in text_lower)
            negative_count = sum(1 for word in self.sentiment_keywords['negative'] if word in text_lower)
            neutral_count = sum(1 for word in self.sentiment_keywords['neutral'] if word in text_lower)
            
            # Calculate sentiment score
            total_words = len(text.split())
            sentiment_score = (positive_count - negative_count) / max(total_words, 1)
            
            # Determine sentiment
            if sentiment_score > 0.1:
                sentiment = "positive"
                confidence = min(abs(sentiment_score) * 2, 1.0)
            elif sentiment_score < -0.1:
                sentiment = "negative"
                confidence = min(abs(sentiment_score) * 2, 1.0)
            else:
                sentiment = "neutral"
                confidence = 0.5
            
            # Analyze emotional indicators
            emotional_indicators = self._analyze_emotional_indicators(text)
            
            return {
                "sentiment": sentiment,
                "sentiment_score": sentiment_score,
                "confidence": confidence,
                "emotional_indicators": emotional_indicators,
                "word_count": total_words,
                "keyword_counts": {
                    "positive": positive_count,
                    "negative": negative_count,
                    "neutral": neutral_count
                },
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Text sentiment analysis error: {e}")
            return {
                "sentiment": "neutral",
                "sentiment_score": 0.0,
                "confidence": 0.0,
                "error": str(e)
            }
    
    def _analyze_emotional_indicators(self, text: str) -> Dict[str, Any]:
        """Analyze emotional indicators in text"""
        text_lower = text.lower()
        
        # Stress indicators
        stress_words = ['stress', 'pressure', 'anxious', 'worried', 'nervous', 'tense']
        stress_level = sum(1 for word in stress_words if word in text_lower) / len(text.split())
        
        # Confidence indicators
        confidence_words = ['confident', 'sure', 'certain', 'definitely', 'absolutely', 'expert']
        confidence_level = sum(1 for word in confidence_words if word in text_lower) / len(text.split())
        
        # Engagement indicators
        engagement_words = ['excited', 'interested', 'passionate', 'motivated', 'enthusiastic']
        engagement_level = sum(1 for word in engagement_words if word in text_lower) / len(text.split())
        
        return {
            "stress_level": min(stress_level * 10, 1.0),
            "confidence_level": min(confidence_level * 10, 1.0),
            "engagement_level": min(engagement_level * 10, 1.0)
        }
    
    def analyze_interview_performance(self, emotion_data: List[Dict], sentiment_data: List[Dict]) -> Dict[str, Any]:
        """Analyze overall interview performance based on emotion and sentiment data"""
        try:
            if not emotion_data and not sentiment_data:
                return {"error": "No data provided for analysis"}
            
            # Calculate average emotion confidence
            avg_emotion_confidence = 0
            emotion_distribution = {emotion: 0 for emotion in self.emotion_labels}
            
            if emotion_data:
                total_confidence = sum(data.get('confidence', 0) for data in emotion_data)
                avg_emotion_confidence = total_confidence / len(emotion_data)
                
                # Calculate emotion distribution
                for data in emotion_data:
                    if 'all_emotions' in data:
                        for emotion, score in data['all_emotions'].items():
                            emotion_distribution[emotion] += score
                
                # Normalize distribution
                total_emotion_score = sum(emotion_distribution.values())
                if total_emotion_score > 0:
                    emotion_distribution = {
                        emotion: score / total_emotion_score 
                        for emotion, score in emotion_distribution.items()
                    }
            
            # Calculate average sentiment
            avg_sentiment_score = 0
            avg_confidence = 0
            
            if sentiment_data:
                total_sentiment = sum(data.get('sentiment_score', 0) for data in sentiment_data)
                total_conf = sum(data.get('confidence', 0) for data in sentiment_data)
                avg_sentiment_score = total_sentiment / len(sentiment_data)
                avg_confidence = total_conf / len(sentiment_data)
            
            # Calculate performance metrics
            performance_score = self._calculate_performance_score(
                avg_emotion_confidence, avg_sentiment_score, emotion_distribution
            )
            
            # Generate recommendations
            recommendations = self._generate_performance_recommendations(
                emotion_distribution, avg_sentiment_score, performance_score
            )
            
            return {
                "overall_performance_score": performance_score,
                "emotion_analysis": {
                    "average_confidence": avg_emotion_confidence,
                    "emotion_distribution": emotion_distribution,
                    "primary_emotion": max(emotion_distribution.items(), key=lambda x: x[1])[0]
                },
                "sentiment_analysis": {
                    "average_sentiment_score": avg_sentiment_score,
                    "average_confidence": avg_confidence,
                    "overall_sentiment": "positive" if avg_sentiment_score > 0.1 else "negative" if avg_sentiment_score < -0.1 else "neutral"
                },
                "recommendations": recommendations,
                "analysis_timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Interview performance analysis error: {e}")
            return {"error": str(e)}
    
    def _calculate_performance_score(self, emotion_confidence: float, sentiment_score: float, emotion_dist: Dict) -> float:
        """Calculate overall performance score"""
        # Base score from sentiment
        sentiment_component = (sentiment_score + 1) * 25  # Convert -1 to 1 range to 0-50
        
        # Emotion component (prefer positive emotions)
        positive_emotions = emotion_dist.get('happy', 0) + emotion_dist.get('surprise', 0)
        negative_emotions = emotion_dist.get('angry', 0) + emotion_dist.get('sad', 0) + emotion_dist.get('fear', 0)
        emotion_component = (positive_emotions - negative_emotions) * 25 + 25
        
        # Confidence component
        confidence_component = emotion_confidence * 25
        
        # Weighted average
        performance_score = (sentiment_component * 0.4 + emotion_component * 0.4 + confidence_component * 0.2)
        
        return min(max(performance_score, 0), 100)
    
    def _generate_performance_recommendations(self, emotion_dist: Dict, sentiment_score: float, performance_score: float) -> List[str]:
        """Generate performance recommendations"""
        recommendations = []
        
        # Emotion-based recommendations
        if emotion_dist.get('angry', 0) > 0.3:
            recommendations.append("Consider techniques to manage stress and maintain composure during interviews")
        
        if emotion_dist.get('sad', 0) > 0.3:
            recommendations.append("Work on projecting more positive energy and enthusiasm")
        
        if emotion_dist.get('fear', 0) > 0.3:
            recommendations.append("Practice interview scenarios to build confidence and reduce anxiety")
        
        if emotion_dist.get('happy', 0) > 0.4:
            recommendations.append("Excellent positive demeanor - maintain this energy throughout interviews")
        
        # Sentiment-based recommendations
        if sentiment_score < -0.2:
            recommendations.append("Focus on highlighting positive experiences and achievements")
        elif sentiment_score > 0.2:
            recommendations.append("Great positive communication - continue emphasizing strengths")
        
        # Performance-based recommendations
        if performance_score < 60:
            recommendations.append("Consider interview coaching to improve overall performance")
        elif performance_score > 80:
            recommendations.append("Outstanding interview performance - excellent candidate")
        
        return recommendations[:5]  # Limit to 5 recommendations
    
    def get_real_time_emotion_feedback(self, current_emotion: str, confidence: float) -> Dict[str, Any]:
        """Provide real-time feedback during interview"""
        feedback_messages = {
            'happy': "Great! You're showing positive energy",
            'neutral': "Maintain steady composure",
            'surprise': "Good engagement level",
            'sad': "Try to project more enthusiasm",
            'angry': "Take a moment to relax and refocus",
            'fear': "Remember to breathe and stay confident",
            'disgust': "Try to maintain a positive demeanor"
        }
        
        return {
            "current_emotion": current_emotion,
            "confidence": confidence,
            "feedback_message": feedback_messages.get(current_emotion, "Continue with confidence"),
            "recommendation": self._get_emotion_recommendation(current_emotion, confidence),
            "timestamp": datetime.now().isoformat()
        }
    
    def _get_emotion_recommendation(self, emotion: str, confidence: float) -> str:
        """Get specific recommendation based on emotion"""
        if emotion in ['happy', 'surprise'] and confidence > 0.7:
            return "Excellent emotional state - maintain this positive energy"
        elif emotion == 'neutral' and confidence > 0.6:
            return "Good composure - consider showing more enthusiasm"
        elif emotion in ['sad', 'angry', 'fear']:
            return "Take a deep breath and try to project more confidence"
        else:
            return "Continue with steady composure"

# Global instance
emotion_analyzer = EmotionAnalyzer()

# Example usage and testing
if __name__ == "__main__":
    # Test emotion analyzer
    analyzer = EmotionAnalyzer()
    
    # Test text sentiment analysis
    test_text = "I'm really excited about this opportunity and confident in my abilities!"
    sentiment_result = analyzer.analyze_text_sentiment(test_text)
    print("Sentiment Analysis Result:")
    print(json.dumps(sentiment_result, indent=2))
    
    # Test emotional indicators
    emotional_indicators = analyzer._analyze_emotional_indicators(test_text)
    print("\nEmotional Indicators:")
    print(json.dumps(emotional_indicators, indent=2))
