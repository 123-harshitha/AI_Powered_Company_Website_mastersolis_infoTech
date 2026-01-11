"""
AI-Powered Interview Bot Service
"""
import json
import os
from typing import Dict, List, Any, Optional
from datetime import datetime
import asyncio
import aiohttp

class InterviewBot:
    """AI-powered interview bot with dynamic question generation"""
    
    def __init__(self):
        self.interview_sessions = {}
        self.question_templates = self._load_question_templates()
        self.scoring_criteria = self._load_scoring_criteria()
    
    def _load_question_templates(self) -> Dict[str, List[Dict]]:
        """Load question templates for different interview types"""
        return {
            'TECHNICAL': [
                {
                    'type': 'coding',
                    'questions': [
                        'Can you walk me through your approach to solving problems?',
                        'How do you handle debugging complex issues?',
                        'Explain a challenging technical problem you\'ve solved recently.',
                        'What design patterns do you commonly use and why?'
                    ]
                },
                {
                    'type': 'system_design',
                    'questions': [
                        'How would you design a scalable web application?',
                        'Describe how you\'d handle high-traffic scenarios.',
                        'What caching strategies have you used?',
                        'Describe a microservices architecture you\'ve worked with.'
                    ]
                }
            ],
            'BEHAVIORAL': [
                {
                    'type': 'situational',
                    'questions': [
                        'Tell me about a time you had to deal with a difficult team member.',
                        'Describe a situation where you had to learn something new quickly.',
                        'Give an example of a project where you had to meet a tight deadline.',
                        'Tell me about a time you failed and what you learned from it.'
                    ]
                },
                {
                    'type': 'leadership',
                    'questions': [
                        'How do you motivate team members?',
                        'Describe a time when you had to give constructive feedback.',
                        'Tell me about a project you led successfully.',
                        'How do you handle conflicts in your team?'
                    ]
                }
            ],
            'GENERAL': [
                {
                    'type': 'motivation',
                    'questions': [
                        'What interests you about this role?',
                        'Where do you see yourself in 5 years?',
                        'What is your greatest professional achievement?',
                        'What attracted you to our company?'
                    ]
                }
            ]
        }
    
    def _load_scoring_criteria(self) -> Dict[str, List[Dict]]:
        """Load scoring criteria for different aspects"""
        return {
            'TECHNICAL': [
                {'criterion': 'Problem Solving', 'weight': 0.3},
                {'criterion': 'Technical Knowledge', 'weight': 0.25},
                {'criterion': 'Code Quality', 'weight': 0.2},
                {'criterion': 'System Thinking', 'weight': 0.15},
                {'criterion': 'Communication', 'weight': 0.1}
            ],
            'BEHAVIORAL': [
                {'criterion': 'Communication', 'weight': 0.25},
                {'criterion': 'Problem Solving', 'weight': 0.2},
                {'criterion': 'Leadership', 'weight': 0.2},
                {'criterion': 'Adaptability', 'weight': 0.15},
                {'criterion': 'Team Collaboration', 'weight': 0.2}
            ],
            'GENERAL': [
                {'criterion': 'Motivation', 'weight': 0.3},
                {'criterion': 'Cultural Fit', 'weight': 0.25},
                {'criterion': 'Career Goals', 'weight': 0.2},
                {'criterion': 'Company Interest', 'weight': 0.25}
            ]
        }
    
    async def start_interview_session(self, candidate_id: str, interview_type: str, 
                                    job_title: str, candidate_profile: Dict) -> Dict[str, Any]:
        """Start a new interview session"""
        session_id = f"{candidate_id}_{int(datetime.now().timestamp())}"
        
        session_data = {
            'session_id': session_id,
            'candidate_id': candidate_id,
            'interview_type': interview_type,
            'job_title': job_title,
            'candidate_profile': candidate_profile,
            'questions': self._generate_questions(interview_type, job_title, candidate_profile),
            'current_question_index': 0,
            'responses': [],
            'scores': {},
            'started_at': datetime.now().isoformat(),
            'status': 'IN_PROGRESS'
        }
        
        self.interview_sessions[session_id] = session_data
        
        return {
            'session_id': session_id,
            'greeting': self._generate_greeting(candidate_id, job_title),
            'first_question': session_data['questions'][0],
            'total_questions': len(session_data['questions']),
            'estimated_duration': len(session_data['questions']) * 3  # 3 minutes per question
        }
    
    def _generate_questions(self, interview_type: str, job_title: str, 
                          candidate_profile: Dict) -> List[Dict]:
        """Generate personalized questions based on role and candidate profile"""
        base_questions = self.question_templates.get(interview_type, [])
        personalized_questions = []
        
        for category in base_questions:
            for question in category['questions']:
                personalized_questions.append({
                    'text': question,
                    'type': category['type'],
                    'expected_keywords': self._extract_keywords(question),
                    'scoring_notes': '',
                    'time_limit': 300  # 5 minutes default
                })
        
        # Add role-specific questions based on job title
        role_questions = self._generate_role_specific_questions(job_title, candidate_profile)
        personalized_questions.extend(role_questions)
        
        return personalized_questions[:8]  # Limit to 8 questions per interview
    
    def _generate_role_specific_questions(self, job_title: str, candidate_profile: Dict) -> List[Dict]:
        """Generate questions specific to the job role"""
        role_keywords = job_title.lower()
        specific_questions = []
        
        if 'senior' in role_keywords or 'lead' in role_keywords:
            specific_questions.extend([
                {
                    'text': 'How do you mentor junior developers?',
                    'type': 'leadership',
                    'expected_keywords': ['mentoring', 'guidance', 'knowledge sharing', 'team development'],
                    'scoring_notes': '',
                    'time_limit': 300
                },
                {
                    'text': 'Describe a time when you made a technical decision that impacted the team.',
                    'type': 'decision_making',
                    'expected_keywords': ['technical decision', 'team impact', 'trade-offs', 'leadership'],
                    'scoring_notes': '',
                    'time_limit': 300
                }
            ])
        
        if 'data' in role_keywords or 'analytics' in role_keywords:
            specific_questions.extend([
                {
                    'text': 'How do you ensure data quality in your analyses?',
                    'type': 'technical',
                    'expected_keywords': ['data validation', 'testing', 'quality assurance', 'verification'],
                    'scoring_notes': '',
                    'time_limit': 300
                }
            ])
        
        if 'frontend' in role_keywords or 'ui' in role_keywords:
            specific_questions.extend([
                {
                    'text': 'How do you ensure accessibility in your frontend applications?',
                    'type': 'technical',
                    'expected_keywords': ['accessibility', 'WCAG', 'screen readers', 'inclusive design'],
                    'scoring_notes': '',
                    'time_limit': 300
                }
            ])
        
        return specific_questions
    
    def _extract_keywords(self, question: str) -> List[str]:
        """Extract relevant keywords from questions"""
        tech_keywords = ['coding', 'algorithm', 'database', 'API', 'framework', 'testing']
        soft_keywords = ['team', 'leadership', 'communication', 'problem', 'project', 'collaboration']
        
        question_lower = question.lower()
        keywords = []
        
        for keyword in tech_keywords + soft_keywords:
            if keyword in question_lower:
                keywords.append(keyword)
        
        return keywords
    
    def _generate_greeting(self, candidate_name: str, job_title: str) -> str:
        """Generate personalized greeting"""
        greetings = [
            f"Hello {candidate_name}! Welcome to your interview for the {job_title} position.",
            f"Hi {candidate_name}, it's great to have you here today for the {job_title} role interview.",
            f"Welcome {candidate_name}! I'm excited to learn more about your experience for the {job_title} position."
        ]
        
        # Simple hash-based selection for consistency
        selection = hash(candidate_name + job_title) % len(greetings)
        return greetings[selection]
    
    async def submit_response(self, session_id: str, question_index: int, 
                            response: str, timestamp: datetime = None) -> Dict[str, Any]:
        """Process candidate response"""
        if session_id not in self.interview_sessions:
            return {'error': 'Interview session not found'}
        
        session = self.interview_sessions[session_id]
        
        if question_index >= len(session['questions']):
            return {'error': 'Invalid question index'}
        
        question = session['questions'][question_index]
        
        # Analyze response
        response_analysis = await self._analyze_response(response, question)
        
        # Store response
        response_data = {
            'question_index': question_index,
            'question': question['text'],
            'response': response,
            'timestamp': timestamp or datetime.now(),
            'analysis': response_analysis
        }
        
        session['responses'].append(response_data)
        
        # Calculate next question
        next_question_index = question_index + 1
        is_complete = next_question_index >= len(session['questions'])
        
        result = {
            'response_processed': True,
            'score': response_analysis['score'],
            'feedback': response_analysis['feedback'],
            'is_interview_complete': is_complete
        }
        
        if is_complete:
            # Calculate final interview score
            final_score = self._calculate_final_score(session)
            session['status'] = 'COMPLETED'
            session['completed_at'] = datetime.now().isoformat()
            
            result['final_score'] = final_score
            result['summary'] = self._generate_interview_summary(session)
        else:
            result['next_question'] = session['questions'][next_question_index]
            result['questions_remaining'] = len(session['questions']) - next_question_index
        
        return result
    
    async def _analyze_response(self, response: str, question: Dict) -> Dict[str, Any]:
        """Analyze candidate response using AI/NLP"""
        # This would typically integrate with OpenAI, Anthropic, or similar
        # For now, we'll use keyword matching and heuristics
        
        response_lower = response.lower()
        score = 0
        feedback_items = []
        
        # Keyword analysis
        expected_keywords = question.get('expected_keywords', [])
        matched_keywords = [kw for kw in expected_keywords if kw in response_lower]
        
        if expected_keywords:
            keyword_score = (len(matched_keywords) / len(expected_keywords)) * 60
            score += keyword_score
        
        # Response length analysis
        word_count = len(response.split())
        if word_count < 20:
            feedback_items.append('Response could be more detailed')
        elif word_count > 100:
            feedback_items.append('Consider being more concise')
        else:
            score += 10
        
        # Technical terms usage
        tech_indicators = ['architecture', 'algorithm', 'framework', 'database', 'API', 'performance']
        tech_terms_used = sum(1 for term in tech_indicators if term in response_lower)
        if tech_terms_used > 0:
            score += min(tech_terms_used * 5, 20)
            feedback_items.append('Good use of technical terminology')
        
        # Structure analysis
        structure_indicators = ['first', 'then', 'finally', 'because', 'however', 'therefore']
        structure_score = sum(1 for indicator in structure_indicators if indicator in response_lower)
        score += min(structure_score * 3, 10)
        
        # Final scoring
        final_score = min(max(score, 0), 100)
        
        # Generate feedback
        if final_score >= 80:
            feedback = 'Excellent response with strong technical understanding.'
        elif final_score >= 60:
            feedback = 'Good response, consider providing more specific examples.'
        elif final_score >= 40:
            feedback = 'Adequate response, try to elaborate on technical details.'
        else:
            feedback = 'Response needs more depth and specific examples.'
        
        if matched_keywords:
            feedback += f" Good alignment with expected skills: {', '.join(matched_keywords[:3])}"
        
        feedback_items = list(set(feedback_items))  # Remove duplicates
        
        return {
            'score': final_score,
            'feedback': feedback,
            'detailed_feedback': feedback_items,
            'keywords_matched': matched_keywords,
            'word_count': word_count,
            'technical_depth': tech_terms_used
        }
    
    def _calculate_final_score(self, session: Dict) -> Dict[str, Any]:
        """Calculate final interview score"""
        responses = session['responses']
        if not responses:
            return {'overall_score': 0, 'breakdown': {}}
        
        # Calculate average scores by category
        category_scores = {}
        
        total_score = 0
        for response in responses:
            question_type = session['questions'][response['question_index']]['type']
            if question_type not in category_scores:
                category_scores[question_type] = []
            
            category_scores[question_type].append(response['analysis']['score'])
            total_score += response['analysis']['score']
        
        # Calculate category averages
        category_averages = {}
        for category, scores in category_scores.items():
            category_averages[category] = round(sum(scores) / len(scores), 1)
        
        overall_score = round(total_score / len(responses), 1)
        
        # Determine strengths and weaknesses
        strengths = []
        weaknesses = []
        
        for category, score in category_averages.items():
            if score >= 75:
                strengths.append(category)
            elif score < 60:
                weaknesses.append(category)
        
        return {
            'overall_score': overall_score,
            'category_breakdown': category_averages,
            'strengths': strengths,
            'weaknesses': weaknesses,
            'total_questions': len(responses),
            'recommendation': self._get_recommendation(overall_score)
        }
    
    def _get_recommendation(self, score: float) -> str:
        """Get hiring recommendation based on score"""
        if score >= 80:
            return "STRONG_HIRE"
        elif score >= 70:
            return "HIRE"
        elif score >= 60:
            return "CONDITIONAL_HIRE"
        elif score >= 50:
            return "NO_HIRE"
        else:
            return "STRONG_NO_HIRE"
    
    def _generate_interview_summary(self, session: Dict) -> Dict[str, Any]:
        """Generate comprehensive interview summary"""
        final_score_data = self._calculate_final_score(session)
        
        summary = {
            'interview_type': session['interview_type'],
            'job_title': session['job_title'],
            'duration_minutes': self._calculate_duration(session),
            'final_score': final_score_data,
            'key_insights': self._extract_key_insights(session),
            'recommendation_reason': self._get_recommendation_reason(final_score_data)
        }
        
        return summary
    
    def _calculate_duration(self, session: Dict) -> int:
        """Calculate interview duration in minutes"""
        if 'completed_at' in session:
            start_time = datetime.fromisoformat(session['started_at'])
            end_time = datetime.fromisoformat(session['completed_at'])
            duration = (end_time - start_time).total_seconds() / 60
            return round(duration)
        return 0
    
    def _extract_key_insights(self, session: Dict) -> List[str]:
        """Extract key insights from interview responses"""
        insights = []
        responses = session['responses']
        
        if not responses:
            return ["No responses recorded"]
        
        # Technical depth score
        tech_depth_scores = [r['analysis']['technical_depth'] for r in responses]
        avg_tech_depth = sum(tech_depth_scores) / len(tech_depth_scores)
        
        if avg_tech_depth >= 2:
            insights.append('Demonstrates strong technical depth in responses')
        elif avg_tech_depth >= 1:
            insights.append('Shows adequate technical understanding')
        else:
            insights.append('May benefit from more technical experience')
        
        # Communication pattern
        avg_word_count = sum(r['analysis']['word_count'] for r in responses) / len(responses)
        if avg_word_count >= 50:
            insights.append('Communicates ideas thoroughly and comprehensively')
        elif avg_word_count >= 30:
            insights.append('Provides adequate detail in responses')
        else:
            insights.append('Could provide more detailed explanations')
        
        # Consistency analysis
        scores = [r['analysis']['score'] for r in responses]
        score_variance = max(scores) - min(scores)
        
        if score_variance < 20:
            insights.append('Consistent performance across all questions')
        else:
            insights.append('Variable performance - stronger in some areas')
        
        return insights
    
    def _get_recommendation_reason(self, score_data: Dict) -> str:
        """Get reasoning for hiring recommendation"""
        score = score_data['overall_score']
        recommendation = score_data['recommendation']
        
        reasons = {
            'STRONG_HIRE': f"Outstanding performance (Score: {score}). Demonstrates strong technical skills and excellent communication.",
            'HIRE': f"Good performance (Score: {score}). Meets requirements and shows potential for growth.",
            'CONDITIONAL_HIRE': f"Adequate performance (Score: {score}). May require additional training or support.",
            'NO_HIRE': f"Below expectations (Score: {score}). Lacks required skills or experience.",
            'STRONG_NO_HIRE': f"Insufficient performance (Score: {score}). Significant gaps in required competencies."
        }
        
        return reasons.get(recommendation, f"Performance score: {score}")
    
    def get_session_data(self, session_id: str) -> Dict[str, Any]:
        """Get complete interview session data"""
        if session_id not in self.interview_sessions:
            return {'error': 'Session not found'}
        
        return self.interview_sessions[session_id]
    
    def list_active_sessions(self) -> List[Dict[str, str]]:
        """List all active interview sessions"""
        active_sessions = []
        
        for session_id, session_data in self.interview_sessions.items():
            if session_data['status'] == 'IN_PROGRESS':
                active_sessions.append({
                    'session_id': session_id,
                    'candidate_id': session_data['candidate_id'],
                    'interview_type': session_data['interview_type'],
                    'started_at': session_data['started_at'],
                    'progress': f"{len(session_data['responses'])}/{len(session_data['questions'])}"
                })
        
        return active_sessions

# Global instance
interview_bot = InterviewBot()
