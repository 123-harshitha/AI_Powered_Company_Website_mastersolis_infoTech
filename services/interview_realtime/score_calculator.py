"""
Real-time Scoring Calculator
Combines sentiment, emotion, and keyword matching into final scores
"""

import logging
import statistics
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import numpy as np
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class ScoreMetrics(BaseModel):
    timestamp: float
    overall_score: float
    sentiment_score: float
    emotion_stability: float
    confidence_score: float
    keyword_match_score: float
    communication_clarity: float
    technical_score: float
    stress_level: float
    engagement_score: float

class InterviewScore:
    def __init__(self):
        self.score_history: List[ScoreMetrics] = []
        self.job_requirements: List[str] = []
        self.weights = {
            "sentiment": 0.25,
            "emotion_stability": 0.20,
            "confidence": 0.20,
            "keyword_match": 0.15,
            "communication_clarity": 0.10,
            "technical": 0.10
        }
    
    def set_job_requirements(self, requirements: List[str]):
        """Set job requirements for keyword matching"""
        self.job_requirements = [req.lower() for req in requirements]
    
    def calculate_real_time_score(self, analysis_result) -> ScoreMetrics:
        """Calculate real-time score from analysis result"""
        try:
            # Calculate individual component scores
            sentiment_score = self._normalize_sentiment_score(analysis_result.sentiment_score)
            emotion_stability = self._calculate_emotion_stability(analysis_result.emotion_scores)
            confidence_score = analysis_result.confidence_score
            keyword_match_score = self._calculate_keyword_match_score(analysis_result.keywords, analysis_result.technical_skills)
            communication_clarity = analysis_result.communication_clarity
            technical_score = self._calculate_technical_score(analysis_result.technical_skills)
            stress_level = analysis_result.stress_level
            engagement_score = self._calculate_engagement_score(analysis_result.emotion_scores)
            
            # Calculate weighted overall score
            overall_score = (
                sentiment_score * self.weights["sentiment"] +
                emotion_stability * self.weights["emotion_stability"] +
                confidence_score * self.weights["confidence"] +
                keyword_match_score * self.weights["keyword_match"] +
                communication_clarity * self.weights["communication_clarity"] +
                technical_score * self.weights["technical"]
            )
            
            # Ensure score is between 0 and 100
            overall_score = max(0, min(100, overall_score * 100))
            
            score_metrics = ScoreMetrics(
                timestamp=analysis_result.timestamp,
                overall_score=overall_score,
                sentiment_score=sentiment_score * 100,
                emotion_stability=emotion_stability * 100,
                confidence_score=confidence_score * 100,
                keyword_match_score=keyword_match_score * 100,
                communication_clarity=communication_clarity * 100,
                technical_score=technical_score * 100,
                stress_level=stress_level * 100,
                engagement_score=engagement_score * 100
            )
            
            # Add to history
            self.score_history.append(score_metrics)
            
            return score_metrics
            
        except Exception as e:
            logger.error(f"Error calculating real-time score: {e}")
            return ScoreMetrics(
                timestamp=analysis_result.timestamp,
                overall_score=0.0,
                sentiment_score=0.0,
                emotion_stability=0.0,
                confidence_score=0.0,
                keyword_match_score=0.0,
                communication_clarity=0.0,
                technical_score=0.0,
                stress_level=0.0,
                engagement_score=0.0
            )
    
    def _normalize_sentiment_score(self, sentiment_score: float) -> float:
        """Normalize sentiment score from -1,1 to 0,1"""
        return (sentiment_score + 1) / 2
    
    def _calculate_emotion_stability(self, emotion_scores: Dict[str, float]) -> float:
        """Calculate emotion stability score"""
        try:
            if not emotion_scores:
                return 0.5  # Neutral if no emotions detected
            
            # Positive emotions contribute to stability
            positive_emotions = ["joy", "optimism", "confidence", "trust"]
            negative_emotions = ["fear", "anger", "sadness", "disgust", "surprise"]
            
            positive_score = sum(emotion_scores.get(emotion, 0) for emotion in positive_emotions)
            negative_score = sum(emotion_scores.get(emotion, 0) for emotion in negative_emotions)
            
            # Calculate stability (higher when positive emotions dominate)
            stability = positive_score / (positive_score + negative_score) if (positive_score + negative_score) > 0 else 0.5
            
            return stability
            
        except Exception as e:
            logger.error(f"Error calculating emotion stability: {e}")
            return 0.5
    
    def _calculate_keyword_match_score(self, keywords: List[str], technical_skills: List[str]) -> float:
        """Calculate keyword matching score"""
        try:
            if not self.job_requirements:
                # If no job requirements, score based on technical skills mentioned
                return min(1.0, len(technical_skills) / 10.0)
            
            # Count matches between keywords/skills and job requirements
            all_mentioned = keywords + technical_skills
            matches = 0
            
            for requirement in self.job_requirements:
                for mentioned in all_mentioned:
                    if requirement in mentioned.lower() or mentioned.lower() in requirement:
                        matches += 1
                        break
            
            # Calculate match percentage
            match_score = matches / len(self.job_requirements)
            return min(1.0, match_score)
            
        except Exception as e:
            logger.error(f"Error calculating keyword match score: {e}")
            return 0.0
    
    def _calculate_technical_score(self, technical_skills: List[str]) -> float:
        """Calculate technical skills score"""
        try:
            # Score based on number and diversity of technical skills mentioned
            if not technical_skills:
                return 0.0
            
            # Different skill categories with different weights
            skill_categories = {
                "programming": ["python", "javascript", "java", "c++", "typescript"],
                "frameworks": ["react", "angular", "vue", "node.js", "django"],
                "databases": ["sql", "mongodb", "postgresql", "mysql", "redis"],
                "cloud": ["aws", "azure", "gcp", "docker", "kubernetes"],
                "tools": ["git", "jenkins", "ci/cd", "devops", "testing"]
            }
            
            category_scores = []
            for category, skills in skill_categories.items():
                category_matches = sum(1 for skill in technical_skills if skill in skills)
                category_score = min(1.0, category_matches / len(skills))
                category_scores.append(category_score)
            
            # Average across categories
            technical_score = statistics.mean(category_scores) if category_scores else 0.0
            return technical_score
            
        except Exception as e:
            logger.error(f"Error calculating technical score: {e}")
            return 0.0
    
    def _calculate_engagement_score(self, emotion_scores: Dict[str, float]) -> float:
        """Calculate engagement score from emotions"""
        try:
            if not emotion_scores:
                return 0.5
            
            # High engagement emotions
            engagement_emotions = ["joy", "optimism", "confidence", "excitement"]
            # Low engagement emotions
            disengagement_emotions = ["boredom", "sadness", "fear", "anger"]
            
            engagement_score = sum(emotion_scores.get(emotion, 0) for emotion in engagement_emotions)
            disengagement_score = sum(emotion_scores.get(emotion, 0) for emotion in disengagement_emotions)
            
            # Calculate net engagement
            net_engagement = engagement_score - disengagement_score
            return max(0.0, min(1.0, (net_engagement + 1) / 2))  # Normalize to 0-1
            
        except Exception as e:
            logger.error(f"Error calculating engagement score: {e}")
            return 0.5
    
    def get_average_score(self, time_window: Optional[int] = None) -> float:
        """Get average score over time window (in seconds)"""
        try:
            if not self.score_history:
                return 0.0
            
            if time_window is None:
                # Return overall average
                return statistics.mean([score.overall_score for score in self.score_history])
            
            # Calculate average over time window
            current_time = datetime.now().timestamp()
            cutoff_time = current_time - time_window
            
            recent_scores = [
                score.overall_score for score in self.score_history 
                if score.timestamp >= cutoff_time
            ]
            
            return statistics.mean(recent_scores) if recent_scores else 0.0
            
        except Exception as e:
            logger.error(f"Error calculating average score: {e}")
            return 0.0
    
    def get_score_trend(self, window_size: int = 5) -> str:
        """Get score trend (improving, declining, stable)"""
        try:
            if len(self.score_history) < window_size:
                return "insufficient_data"
            
            recent_scores = [score.overall_score for score in self.score_history[-window_size:]]
            
            # Calculate trend
            if len(recent_scores) < 2:
                return "stable"
            
            # Simple linear trend calculation
            x = list(range(len(recent_scores)))
            y = recent_scores
            
            # Calculate slope
            n = len(x)
            sum_x = sum(x)
            sum_y = sum(y)
            sum_xy = sum(x[i] * y[i] for i in range(n))
            sum_x2 = sum(x[i] ** 2 for i in range(n))
            
            slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x ** 2)
            
            if slope > 2:
                return "improving"
            elif slope < -2:
                return "declining"
            else:
                return "stable"
                
        except Exception as e:
            logger.error(f"Error calculating score trend: {e}")
            return "stable"
    
    def get_performance_summary(self) -> Dict:
        """Get comprehensive performance summary"""
        try:
            if not self.score_history:
                return {
                    "overall_score": 0.0,
                    "trend": "no_data",
                    "strengths": [],
                    "weaknesses": [],
                    "recommendations": []
                }
            
            # Calculate metrics
            overall_score = self.get_average_score()
            trend = self.get_score_trend()
            
            # Get latest scores for analysis
            latest_scores = self.score_history[-1] if self.score_history else None
            
            # Identify strengths and weaknesses
            strengths = []
            weaknesses = []
            
            if latest_scores:
                if latest_scores.confidence_score > 70:
                    strengths.append("High confidence")
                if latest_scores.communication_clarity > 70:
                    strengths.append("Clear communication")
                if latest_scores.technical_score > 70:
                    strengths.append("Strong technical knowledge")
                
                if latest_scores.stress_level > 60:
                    weaknesses.append("High stress levels")
                if latest_scores.communication_clarity < 50:
                    weaknesses.append("Communication clarity needs improvement")
                if latest_scores.confidence_score < 50:
                    weaknesses.append("Confidence building needed")
            
            # Generate recommendations
            recommendations = []
            if latest_scores and latest_scores.stress_level > 60:
                recommendations.append("Consider stress management techniques")
            if latest_scores and latest_scores.communication_clarity < 60:
                recommendations.append("Practice clear and concise communication")
            if latest_scores and latest_scores.confidence_score < 60:
                recommendations.append("Build confidence through preparation and practice")
            
            return {
                "overall_score": overall_score,
                "trend": trend,
                "strengths": strengths,
                "weaknesses": weaknesses,
                "recommendations": recommendations,
                "total_analysis_points": len(self.score_history)
            }
            
        except Exception as e:
            logger.error(f"Error generating performance summary: {e}")
            return {
                "overall_score": 0.0,
                "trend": "error",
                "strengths": [],
                "weaknesses": [],
                "recommendations": []
            }
    
    def reset_scores(self):
        """Reset score history"""
        self.score_history = []
        logger.info("Score history reset")
