"""
Real-time NLP and Emotion Analysis Engine
Analyzes transcript text for sentiment, emotion, and confidence
"""

import asyncio
import logging
import re
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import numpy as np
from transformers import pipeline
import spacy
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class AnalysisResult(BaseModel):
    timestamp: float
    text: str
    sentiment_score: float
    emotion_scores: Dict[str, float]
    confidence_score: float
    stress_level: float
    keywords: List[str]
    technical_skills: List[str]
    communication_clarity: float

class RealTimeAnalyzer:
    def __init__(self):
        self.sentiment_analyzer = None
        self.emotion_analyzer = None
        self.nlp = None
        self.technical_keywords = self._load_technical_keywords()
        self.soft_skills_keywords = self._load_soft_skills_keywords()
        
    async def initialize(self):
        """Initialize NLP models"""
        try:
            # Initialize sentiment analysis
            self.sentiment_analyzer = pipeline(
                "sentiment-analysis",
                model="cardiffnlp/twitter-roberta-base-sentiment-latest",
                return_all_scores=True
            )
            
            # Initialize emotion analysis
            self.emotion_analyzer = pipeline(
                "text-classification",
                model="j-hartmann/emotion-english-distilroberta-base"
            )
            
            # Initialize spaCy for NER and keyword extraction
            try:
                self.nlp = spacy.load("en_core_web_sm")
            except OSError:
                logger.warning("spaCy model not found, using basic tokenization")
                self.nlp = None
                
            logger.info("NLP models initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing NLP models: {e}")
            raise
    
    def _load_technical_keywords(self) -> List[str]:
        """Load technical skills keywords"""
        return [
            "python", "javascript", "react", "node.js", "sql", "database",
            "api", "rest", "graphql", "docker", "kubernetes", "aws", "azure",
            "machine learning", "ai", "data science", "analytics", "frontend",
            "backend", "full stack", "devops", "ci/cd", "git", "agile", "scrum",
            "testing", "unit test", "integration test", "microservices",
            "cloud", "serverless", "lambda", "elasticsearch", "redis",
            "mongodb", "postgresql", "mysql", "typescript", "vue", "angular"
        ]
    
    def _load_soft_skills_keywords(self) -> List[str]:
        """Load soft skills keywords"""
        return [
            "leadership", "teamwork", "communication", "problem solving",
            "critical thinking", "adaptability", "time management",
            "project management", "mentoring", "collaboration", "creativity",
            "analytical", "detail oriented", "self motivated", "initiative",
            "flexibility", "patience", "empathy", "negotiation", "presentation"
        ]
    
    async def analyze_text(self, text: str, timestamp: float) -> AnalysisResult:
        """Analyze text for sentiment, emotion, and other metrics"""
        try:
            # Clean and preprocess text
            cleaned_text = self._clean_text(text)
            
            if not cleaned_text.strip():
                return AnalysisResult(
                    timestamp=timestamp,
                    text=text,
                    sentiment_score=0.0,
                    emotion_scores={},
                    confidence_score=0.0,
                    stress_level=0.0,
                    keywords=[],
                    technical_skills=[],
                    communication_clarity=0.0
                )
            
            # Run analyses in parallel
            sentiment_task = self._analyze_sentiment(cleaned_text)
            emotion_task = self._analyze_emotion(cleaned_text)
            keyword_task = self._extract_keywords(cleaned_text)
            technical_task = self._extract_technical_skills(cleaned_text)
            clarity_task = self._analyze_communication_clarity(cleaned_text)
            
            # Wait for all analyses to complete
            sentiment_score = await sentiment_task
            emotion_scores = await emotion_task
            keywords = await keyword_task
            technical_skills = await technical_task
            communication_clarity = await clarity_task
            
            # Calculate confidence and stress levels
            confidence_score = self._calculate_confidence_score(sentiment_score, emotion_scores)
            stress_level = self._calculate_stress_level(emotion_scores, sentiment_score)
            
            return AnalysisResult(
                timestamp=timestamp,
                text=text,
                sentiment_score=sentiment_score,
                emotion_scores=emotion_scores,
                confidence_score=confidence_score,
                stress_level=stress_level,
                keywords=keywords,
                technical_skills=technical_skills,
                communication_clarity=communication_clarity
            )
            
        except Exception as e:
            logger.error(f"Error analyzing text: {e}")
            return AnalysisResult(
                timestamp=timestamp,
                text=text,
                sentiment_score=0.0,
                emotion_scores={},
                confidence_score=0.0,
                stress_level=0.0,
                keywords=[],
                technical_skills=[],
                communication_clarity=0.0
            )
    
    async def _analyze_sentiment(self, text: str) -> float:
        """Analyze sentiment of text"""
        try:
            if not self.sentiment_analyzer:
                return 0.0
            
            results = self.sentiment_analyzer(text)
            
            # Convert to numerical score (-1 to 1)
            sentiment_map = {
                "LABEL_0": -1.0,  # Negative
                "LABEL_1": 0.0,   # Neutral
                "LABEL_2": 1.0    # Positive
            }
            
            # Get the highest scoring sentiment
            best_result = max(results[0], key=lambda x: x['score'])
            sentiment_label = best_result['label']
            confidence = best_result['score']
            
            base_score = sentiment_map.get(sentiment_label, 0.0)
            return base_score * confidence
            
        except Exception as e:
            logger.error(f"Sentiment analysis error: {e}")
            return 0.0
    
    async def _analyze_emotion(self, text: str) -> Dict[str, float]:
        """Analyze emotions in text"""
        try:
            if not self.emotion_analyzer:
                return {}
            
            results = self.emotion_analyzer(text)
            
            # Convert to dictionary format
            emotion_scores = {}
            for result in results:
                emotion_scores[result['label']] = result['score']
            
            return emotion_scores
            
        except Exception as e:
            logger.error(f"Emotion analysis error: {e}")
            return {}
    
    async def _extract_keywords(self, text: str) -> List[str]:
        """Extract important keywords from text"""
        try:
            keywords = []
            
            if self.nlp:
                doc = self.nlp(text)
                
                # Extract named entities
                for ent in doc.ents:
                    if ent.label_ in ["PERSON", "ORG", "GPE", "PRODUCT"]:
                        keywords.append(ent.text.lower())
                
                # Extract important nouns and adjectives
                for token in doc:
                    if (token.pos_ in ["NOUN", "ADJ"] and 
                        not token.is_stop and 
                        not token.is_punct and
                        len(token.text) > 2):
                        keywords.append(token.text.lower())
            else:
                # Basic keyword extraction without spaCy
                words = re.findall(r'\b\w+\b', text.lower())
                keywords = [word for word in words if len(word) > 3]
            
            # Remove duplicates and limit to top keywords
            keywords = list(set(keywords))[:10]
            return keywords
            
        except Exception as e:
            logger.error(f"Keyword extraction error: {e}")
            return []
    
    async def _extract_technical_skills(self, text: str) -> List[str]:
        """Extract technical skills mentioned in text"""
        try:
            text_lower = text.lower()
            found_skills = []
            
            for skill in self.technical_keywords:
                if skill in text_lower:
                    found_skills.append(skill)
            
            return found_skills
            
        except Exception as e:
            logger.error(f"Technical skills extraction error: {e}")
            return []
    
    async def _analyze_communication_clarity(self, text: str) -> float:
        """Analyze communication clarity based on text structure"""
        try:
            # Simple clarity metrics
            sentences = re.split(r'[.!?]+', text)
            words = re.findall(r'\b\w+\b', text)
            
            if not sentences or not words:
                return 0.0
            
            # Average sentence length (optimal: 15-20 words)
            avg_sentence_length = len(words) / len(sentences)
            sentence_score = max(0, 1 - abs(avg_sentence_length - 17.5) / 17.5)
            
            # Word complexity (ratio of long words)
            long_words = [word for word in words if len(word) > 6]
            complexity_score = len(long_words) / len(words) if words else 0
            
            # Repetition penalty
            unique_words = set(words)
            repetition_penalty = len(unique_words) / len(words) if words else 0
            
            # Combine scores
            clarity_score = (sentence_score * 0.4 + 
                           complexity_score * 0.3 + 
                           repetition_penalty * 0.3)
            
            return min(1.0, max(0.0, clarity_score))
            
        except Exception as e:
            logger.error(f"Communication clarity analysis error: {e}")
            return 0.0
    
    def _calculate_confidence_score(self, sentiment_score: float, emotion_scores: Dict[str, float]) -> float:
        """Calculate confidence score based on sentiment and emotions"""
        try:
            # Base confidence from sentiment
            confidence = abs(sentiment_score)
            
            # Adjust based on emotion stability
            if emotion_scores:
                # High confidence emotions
                confident_emotions = ["joy", "optimism", "confidence"]
                # Low confidence emotions
                uncertain_emotions = ["fear", "sadness", "anger", "disgust"]
                
                confident_score = sum(emotion_scores.get(emotion, 0) for emotion in confident_emotions)
                uncertain_score = sum(emotion_scores.get(emotion, 0) for emotion in uncertain_emotions)
                
                emotion_adjustment = (confident_score - uncertain_score) * 0.3
                confidence += emotion_adjustment
            
            return min(1.0, max(0.0, confidence))
            
        except Exception as e:
            logger.error(f"Confidence calculation error: {e}")
            return 0.0
    
    def _calculate_stress_level(self, emotion_scores: Dict[str, float], sentiment_score: float) -> float:
        """Calculate stress level based on emotions and sentiment"""
        try:
            stress_emotions = ["fear", "anger", "disgust", "sadness"]
            stress_score = sum(emotion_scores.get(emotion, 0) for emotion in stress_emotions)
            
            # Adjust based on negative sentiment
            if sentiment_score < 0:
                stress_score += abs(sentiment_score) * 0.5
            
            return min(1.0, max(0.0, stress_score))
            
        except Exception as e:
            logger.error(f"Stress level calculation error: {e}")
            return 0.0
    
    def _clean_text(self, text: str) -> str:
        """Clean and preprocess text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep punctuation
        text = re.sub(r'[^\w\s.,!?;:]', '', text)
        
        # Remove repeated punctuation
        text = re.sub(r'[.]{2,}', '.', text)
        text = re.sub(r'[!]{2,}', '!', text)
        text = re.sub(r'[?]{2,}', '?', text)
        
        return text.strip()
    
    async def analyze_transcript_batch(self, transcript_chunks: List[Tuple[str, float]]) -> List[AnalysisResult]:
        """Analyze multiple transcript chunks in batch"""
        tasks = []
        for text, timestamp in transcript_chunks:
            task = self.analyze_text(text, timestamp)
            tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out exceptions
        valid_results = []
        for result in results:
            if isinstance(result, AnalysisResult):
                valid_results.append(result)
            else:
                logger.error(f"Analysis error: {result}")
        
        return valid_results
