"""
AI-Powered Interview Chatbot for Candidate Pre-Screening
Part of FWC HRMS ML Services
"""
import json
import random
import logging
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime
import numpy as np

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class InterviewQuestion:
    question_id: str
    question_text: str
    category: str
    difficulty: str
    expected_keywords: List[str]
    scoring_criteria: Dict[str, float]

@dataclass
class InterviewSession:
    session_id: str
    candidate_id: str
    job_role: str
    questions_asked: List[str]
    responses: List[str]
    scores: List[Dict]
    current_question_index: int = 0
    session_status: str = "ongoing"
    started_at: datetime = None

@dataclass
class CandidateAssessment:
    technical_score: float
    communication_score: float
    problem_solving_score: float
    cultural_fit_score: float
    confidence_level: float
    overall_assessment: str
    strengths: List[str]
    areas_for_improvement: List[str]

class AIInterviewChatbot:
    def __init__(self):
        # Question templates organized by role and category
        self.question_library = {
            "software_developer": {
                "technical": [
                    {
                        "question": "Can you explain how you would optimize a slow database query?",
                        "keywords": ["index", "indexes", "query optimization", "performance", "query plan", "profiling"],
                        "difficulty": "intermediate"
                    },
                    {
                        "question": "How would you handle a production bug that only occurs under certain conditions?",
                        "keywords": ["debugging", "logs", "reproduction", "testing", "edge cases", "monitoring"],
                        "difficulty": "mid"
                    },
                    {
                        "question": "Describe your approach to code review. What do you look for?",
                        "keywords": ["clean code", "best practices", "security", "performance", "readability", "design patterns"],
                        "difficulty": "junior"
                    },
                    {
                        "question": "How would you design a scalable microservices architecture?",
                        "keywords": ["microservices", "distributed", "scalability", "communication", "database", "api gateway"],
                        "difficulty": "senior"
                    }
                ],
                "behavioral": [
                    {
                        "question": "Tell me about a time when you had to learn a new technology quickly",
                        "keywords": ["learning", "adaptability", "time management", "problem solving", "persistence"],
                        "difficulty": "junior"
                    },
                    {
                        "question": "Describe a challenging project you worked on. What made it challenging and how did you handle it?",
                        "keywords": ["challenge", "problem solving", "persistence", "teamwork", "communication", "solution"],
                        "difficulty": "mid"
                    },
                    {
                        "question": "How do you stay updated with the latest technologies and industry trends?",
                        "keywords": ["continuous learning", "technology", "industry", "community", "experiment", "best practices"],
                        "difficulty": "senior"
                    }
                ],
                "problem_solving": [
                    {
                        "question": "How would you verify if a user's email address is valid without using regex?",
                        "keywords": ["validation", "email", "domains", "servers", "testing", "verification"],
                        "difficulty": "junior"
                    },
                    {
                        "question": "Design a system to handle massive data uploads with validation",
                        "keywords": ["system design", "performance", "validation", "data", "architecture", "scalability"],
                        "difficulty": "senior"
                    }
                ]
            },
            "data_analyst": {
                "technical": [
                    {
                        "question": "How would you approach analyzing customer behavior data to reduce churn?",
                        "keywords": ["analysis", "data mining", "patterns", "correlation", "prediction", "visualization"],
                        "difficulty": "mid"
                    },
                    {
                        "question": "Describe your experience with data cleaning and preprocessing",
                        "keywords": ["data cleaning", "preprocessing", "quality", "validation", "transformation"],
                        "difficulty": "junior"
                    }
                ],
                "analytical": [
                    {
                        "question": "How do you ensure your data analysis conclusions are reliable and actionable?",
                        "keywords": ["reliability", "validation", "testing", "confidence", "verification", "quality"],
                        "difficulty": "mid"
                    }
                ]
            },
            "general": {
                "behavioral": [
                    {
                        "question": "Tell me about yourself and why you're interested in this role",
                        "keywords": ["experience", "interest", "motivation", "skills", "background"],
                        "difficulty": "junior"
                    },
                    {
                        "question": "Where do you see yourself in 5 years?",
                        "keywords": ["goals", "career growth", "ambition", "development", "long-term"],
                        "difficulty": "junior"
                    }
                ]
            }
        }

    def initiate_interview(self, candidate_id: str, job_role: str) -> InterviewSession:
        """Start a new interview session"""
        session_id = f"interview_{candidate_id}_{datetime.now().timestamp()}"
        
        session = InterviewSession(
            session_id=session_id,
            candidate_id=candidate_id,
            job_role=job_role,
            questions_asked=[],
            responses=[],
            scores=[],
            current_question_index=0,
            session_status="ongoing",
            started_at=datetime.now()
        )
        
        logger.info(f"Interview session {session_id} initiated for candidate {candidate_id}")
        return session

    def get_next_question(self, session: InterviewSession) -> Optional[Dict]:
        """Generate the next appropriate question for the interview"""
        if session.current_question_index >= 10:  # End after 10 questions
            return self.end_interview(session)
        
        # Determine question category based on progress
        categories = ["technical", "behavioral", "problem_solving", "behavioral"]
        category_index = (session.current_question_index // 3) % len(categories)
        question_category = categories[category_index]
        
        # Get role-specific questions or general questions
        role_questions = self.question_library.get(session.job_role.lower(), self.question_library["general"])
        available_questions = role_questions.get(question_category, [])
        
        if not available_questions:
            available_questions = self.question_library["general"]["behavioral"]
        
        # Select random question from category
        selected_question_data = random.choice(available_questions)
        
        # Ensure we haven't asked this question before
        question_id = f"{session.current_question_index}_{question_category}"
        
        question_obj = InterviewQuestion(
            question_id=question_id,
            question_text=selected_question_data["question"],
            category=question_category,
            difficulty=selected_question_data["difficulty"],
            expected_keywords=selected_question_data["keywords"],
            scoring_criteria={
                "technical_depth": 0.0,
                "communication_clarity": 0.0,
                "problem_solving": 0.0,
                "confidence": 0.0,
                "relevance": 0.0
            }
        )
        
        return {
            "question_id": question_obj.question_id,
            "question_text": question_obj.question_text,
            "category": question_obj.category,
            "difficulty": question_obj.difficulty,
            "progress": f"{session.current_question_index + 1}/10"
        }

    def process_answer(self, session: InterviewSession, answer_text: str, question_id: str) -> Dict:
        """Process candidate's answer and provide scoring"""
        # Find the question that was asked
        current_question_index = question_id.split("_")[0]
        try:
            question_index = int(current_question_index)
        except ValueError:
            question_index = session.current_question_index
        
        # Score the answer based on the question category
        answer_score = self._score_answer(answer_text, question_id)
        
        # Store response and score
        session.responses.append(answer_text)
        session.scores.append(answer_score)
        session.current_question_index += 1
        
        ## Add contextual feedback based on answer quality
        feedback = self._generate_contextual_feedback(answer_score, answer_text)
        
        ## Determine if interview should continue
        if session.current_question_index >= 10:
            session.session_status = "completed"
            assessment = self.generate_final_assessment(session)
            return {
                "status": "interview_completed",
                "assessment": assessment,
                "message": "Thank you for completing the interview!"
            }
        
        ## Return feedback and next question info
        return {
            "status": "continue",
            "answer_feedback": feedback,
            "next_question": self.get_next_question(session),
            "progress": f"{session.current_question_index}/10",
            "total_score_so_far": self._calculate_session_progress(session)
        }

    def _score_answer(self, answer_text: str, question_id: str) -> Dict[str, float]:
        """Score candidate's answer on multiple dimensions"""
        answer_lower = answer_text.lower()
        
        # Technical depth scoring (based on relevant keywords)
        technical_score = self._calculate_keyword_relevance(answer_text)
        
        # Communication clarity (based on response structure and completeness)
        communication_score = self._calculate_communication_score(answer_text)
        
        # Problem solving approach (based on analytical language)
        problem_solving_score = self._calculate_problem_solving_score(answer_text)
        
        # Confidence level (based on assertive language)
        confidence_score = self._calculate_confidence_score(answer_text)
        
        # Relevance to question
        relevance_score = self._calculate_relevance_score(answer_text, question_id)
        
        return {
            "technical_depth": round(technical_score, 2),
            "communication_clarity": round(communication_score, 2),
            "problem_solving": round(problem_solving_score, 2),
            "confidence": round(confidence_score, 2),
            "relevance": round(relevance_score, 2),
            "overall_score": round((technical_score + communication_score + problem_solving_score + confidence_score + relevance_score) / 5, 2)
        }

    def _calculate_keyword_relevance(self, answer_text: str) -> float:
        """Calculate technical keyword relevance score"""
        technical_keywords = [
            "architecture", "design", "algorithm", "database", "performance",
            "scalability", "security", "testing", "deployment", "optimization",
            "best practices", "patterns", "framework", "API", "API", "REST"
        ]
        
        answer_lower = answer_text.lower()
        matches = sum(1 for keyword in technical_keywords if keyword in answer_lower)
        return min(1.0, matches / 5.0)  # Cap at 1.0 for 5+ keyword matches

    def _calculate_communication_score(self, answer_text: str) -> float:
        """Calculate communication clarity score"""
        score = 0.5  # Base score
        
        # Length indicator (reasonable response length)
        word_count = len(answer_text.split())
        if 20 <= word_count <= 200:
            score += 0.2
        elif word_count < 10:
            score -= 0.2  # Too concise
        elif word_count > 300:
            score -= 0.1  # Too verbose
        
        # Structure indicators
        if any(structure_word in answer_text.lower() for structure_word in ["first", "second", "next", "then", "finally"]):
            score += 0.1
        
        # Clarity indicators
        clear_indicators = ["specifically", "for example", "in other words", "to clarify"]
        if any(indicator in answer_text.lower() for indicator in clear_indicators):
            score += 0.2
        
        return min(1.0, max(0.0, score))

    def _calculate_problem_solving_score(self, answer_text: str) -> float:
        """Calculate problem-solving approach score"""
        problem_solving_keywords = [
            "analyze", "identify", "steps", "solution", "approach", "method",
            "investigate", "troubleshoot", "debug", "solve", "resolve"
        ]
        
        answer_lower = answer_text.lower()
        keyword_count = sum(1 for keyword in problem_solving_keywords if keyword in answer_lower)
        
        # Bonus for showing analytical thinking
        analytical_phrases = ["let me think", "first i would", "step by step", "my approach"]
        if any(phrase in answer_lower for phrase in analytical_phrases):
            keyword_count += 2
        
        return min(1.0, keyword_count / 8.0)

    def _calculate_confidence_score(self, answer_text: str) -> float:
        """Calculate confidence level score"""
        confident_indicators = [
            "certainly", "definitely", "absolutely", "confident", "sure",
            "experienced", "skilled", "proficient", "expert", "understand"
        ]
        
        uncertain_indicators = [
            "probably", "maybe", "not sure", "think", "guess", "might",
            "possibly", "not certain", "unclear"
        ]
        
        answer_lower = answer_text.lower()
        confident_count = sum(1 for word in confident_indicators if word in answer_lower)
        uncertain_count = sum(1 for word in uncertain_indicators if word in answer_lower)
        
        confidence_score = (confident_count * 0.1) - (uncertain_count * 0.05)
        return min(1.0, max(0.0, 0.5 + confidence_score))

    def _calculate_relevance_score(self, answer_text: str, question_id: str) -> float:
        """Calculate relevance to the specific question"""
        # Simplified relevance scoring
        relevance_score = 0.5  # Base score
        
        answer_lower = answer_text.lower()
        
        # Check for question-related keywords
        if "question" in question_id:
            relevant_terms = ["experience", "example", "situation", "time", "project"]
            matches = sum(1 for term in relevant_terms if term in answer_lower)
            relevance_score += matches * 0.1
        
        return min(1.0, relevance_score)

    def _generate_contextual_feedback(self, score: Dict[str, float], answer_text: str) -> Dict:
        """Generate contextual feedback for candidate's answer"""
        overall_score = score["overall_score"]
        
        feedback_messages = {
            "excellent": [
                "Great detailed explanation! You showed strong technical understanding.",
                "Excellent answer! You demonstrated clear problem-solving skills.",
                "Outstanding response! You provided a comprehensive solution."
            ],
            "good": [
                "Good answer! You covered the key points well.",
                "Nice explanation! You showed solid understanding of the topic.",
                "Well done! Your response shows good technical knowledge."
            ],
            "adequate": [
                "Decent response. Consider providing more specific examples.",
                "Your answer was okay. Try to include more technical details.",
                "Basic understanding shown. You could elaborate more on the solution."
            ],
            "needs_improvement": [
                "Please provide more specific details in your response.",
                "Try to give concrete examples to support your answer.",
                "Your answer was quite brief. Consider expanding on your technical experience."
            ]
        }
        
        if overall_score >= 0.8:
            category = "excellent"
        elif overall_score >= 0.6:
            category = "good"
        elif overall_score >= 0.4:
            category = "adequate"
        else:
            category = "needs_improvement"
        
        return {
            "message": random.choice(feedback_messages[category]),
            "score_breakdown": score,
            "suggestions": self._generate_improvement_suggestions(score)
        }

    def _generate_improvement_suggestions(self, score: Dict[str, float]) -> List[str]:
        """Generate specific improvement suggestions"""
        suggestions = []
        
        if score["technical_depth"] < 0.6:
            suggestions.append("Try to include more technical details and specific examples")
        
        if score["communication_clarity"] < 0.6:
            suggestions.append("Consider structuring your answer more clearly with bullet points or steps")
        
        if score["problem_solving"] < 0.6:
            suggestions.append("Explain your thought process step-by-step to show your analytical approach")
        
        if score["confidence"] < 0.6:
            suggestions.append("Be more assertive in your responses - show enthusiasm for your expertise")
        
        return suggestions[:2]  # Limit to 2 suggestions

    def _calculate_session_progress(self, session: InterviewSession) -> float:
        """Calculate current session progress score"""
        if not session.scores:
            return 0.0
        
        # Calculate weighted average of response scores
        weights = [1.0, 1.0, 1.0, 1.0]  # Equal weight for now
        weighted_score = sum(score["overall_score"] * weights[i % len(weights)] 
                           for i, score in enumerate(session.scores))
        total_weight = sum(weights[:len(session.scores)])
        
        return weighted_score / total_weight if total_weight > 0 else 0.0

    def generate_final_assessment(self, session: InterviewSession) -> CandidateAssessment:
        """Generate final candidate assessment"""
        if not session.scores:
            return CandidateAssessment(
                technical_score=0.0,
                communication_score=0.0,
                problem_solving_score=0.0,
                cultural_fit_score=0.0,
                confidence_level=0.0,
                overall_assessment="No responses provided",
                strengths=[],
                areas_for_improvement=[]
            )
        
        # Calculate overall scores by category
        overall_scores = {
            "technical_depth": sum(score["technical_depth"] for score in session.scores) / len(session.scores),
            "communication_clarity": sum(score["communication_clarity"] for score in session.scores) / len(session.scores),
            "problem_solving": sum(score["problem_solving"] for score in session.scores) / len(session.scores),
            "confidence": sum(score["confidence"] for score in session.scores) / len(session.scores)
        }
        
        # Determine overall assessment grade
        overall_average = sum(overall_scores.values()) / len(overall_scores)
        
        if overall_average >= 0.8:
            assessment_level = "Excellent - Highly Recommended"
        elif overall_average >= 0.6:
            assessment_level = "Good - Recommended"
        elif overall_average >= 0.4:
            assessment_level = "Average - Requires Further Review"
        else:
            assessment_level = "Needs Improvement - Not Recommended"
        
        # Generate strengths and improvements
        strengths = []
        improvements = []
        
        if overall_scores["technical_depth"] >= 0.7:
            strengths.append("Strong technical skills demonstrated")
        else:
            improvements.append("Consider gaining more hands-on technical experience")
        
        if overall_scores["communication_clarity"] >= 0.7:
            strengths.append("Clear communication style")
        else:
            improvements.append("Develop communication skills and clarity in explanations")
        
        if overall_scores["problem_solving"] >= 0.7:
            strengths.append("Good analytical and problem-solving approach")
        else:
            improvements.append("Enhance analytical thinking and structured problem-solving")
        
        return CandidateAssessment(
            technical_score=overall_scores["technical_depth"] * 100,
            communication_score=overall_scores["communication_clarity"] * 100,
            problem_solving_score=overall_scores["problem_solving"] * 100,
            cultural_fit_score=overall_scores["confidence"] * 100,  # Simplified
            confidence_level=overall_scores["confidence"] * 100,
            overall_assessment=assessment_level,
            strengths=strengths,
            areas_for_improvement=improvements
        )

    def end_interview(self, session: InterviewSession) -> None:
        """End the interview session"""
        session.session_status = "completed"
        logger.info(f"Interview session {session.session_id} completed")

# Example usage
if __name__ == "__main__":
    chatbot = AIInterviewChatbot()
    
    # Initialize interview session
    session = chatbot.initiate_interview("candidate_123", "software_developer")
    
    # Simulate interview flow
    print("=== AI Interview Session Started ===")
    
    # First question
    question = chatbot.get_next_question(session)
    print(f"\nQuestion: {question['question_text']}")
    
    if question:
        # Simulate candidate answer
        sample_answer = """
        I would approach this by first understanding the problem domain and requirements clearly. 
        I'd analyze the existing system, identify bottlenecks, and design a scalable microservices 
        architecture using Docker containers and Kubernetes for orchestration. I'd implement proper 
        API gateway for routing and load balancing, and ensure database separation per service.
        """
        
        # Process the answer
        response = chatbot.process_answer(session, sample_answer, question["question_id"])
        print(f"\nFeedback: {response['answer_feedback']['message']}")
        print(f"Next Question: {response['next_question']['question_text'] if response.get('next_question') else 'Interview Complete'}")
    
    # End session
    if session.session_status == "completed":
        assessment = chatbot.generate_final_assessment(session)
        print(f"\n=== Final Assessment ===")
        print(f"Overall Grade: {assessment.overall_assessment}")
        print(f"Technical Score: {assessment.technical_score:.1f}%")
        print(f"Communication Score: {assessment.communication_score:.1f}%")
