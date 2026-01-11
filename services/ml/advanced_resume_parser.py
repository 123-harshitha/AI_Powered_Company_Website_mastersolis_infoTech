"""
Advanced Resume Parser with AI-Powered Analysis
Part of FWC HRMS ML Services
"""
import json
import re
import logging
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
import PyPDF2
import docx
from collections import Counter

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class EducationInfo:
    institution: str
    degree: str
    field: str
    graduation_year: Optional[int]
    gpa: Optional[float]

@dataclass
class ExperienceInfo:
    company: str
    position: str
    duration_months: int
    skills_used: List[str]
    achievements: List[str]

@dataclass
class PersonProfile:
    skills: List[str]
    experience: List[ExperienceInfo]
    education: List[EducationInfo]
    personality_traits: List[str]
    work_style: str

@dataclass
class JobAnalysis:
    required_skills: List[str]
    nice_to_have_skills: List[str]
    experience_level: str
    industry_domain: str
    company_culture: List[str]

class AdvancedResumeAnalyzer:
    def __init__(self):
        self.skill_weights = {
            # Technical Skills with confidence scores
            "python": 0.95, "javascript": 0.90, "react": 0.85, "node.js": 0.85,
            "sql": 0.90, "mongodb": 0.80, "aws": 0.85, "docker": 0.75,
            "git": 0.85, "linux": 0.80, "api": 0.80, "rest": 0.85,
            "graphql": 0.75, "microservices": 0.70, "kubernetes": 0.75,
            "tensorflow": 0.80, "pytorch": 0.80, "machine_learning": 0.85,
            "data_analysis": 0.80, "pandas": 0.70, "numpy": 0.70
        }
        
        self.experience_patterns = {
            "leadership": ["manage", "lead", "team", "supervise", "director", "manager"],
            "technical": ["develop", "implement", "design", "build", "create", "engineer"],
            "analytical": ["analyze", "research", "optimize", "improve", "metrics"],
            "communication": ["present", "collaborate", "communicate", "train", "teach"]
        }

    def extract_text_from_file(self, file_path: str) -> str:
        """Extract text from PDF or DOCX files"""
        try:
            if file_path.endswith('.pdf'):
                return self._extract_pdf_text(file_path)
            elif file_path.endswith('.docx'):
                return self._extract_docx_text(file_path)
            else:
                raise ValueError(f"Unsupported file format for {file_path}")
        except Exception as e:
            logger.error(f"Error extracting text from {file_path}: {e}")
            return ""

    def _extract_pdf_text(self, file_path: str) -> str:
        """Extract text from PDF file"""
        text = ""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
        except Exception as e:
            logger.error(f"PDF extraction error: {e}")
        return text

    def _extract_docx_text(self, file_path: str) -> str:
        """Extlect text from DOCX file"""
        try:
            doc = docx.Document(file_path)
            return "\n".join([paragraph.text for paragraph in doc.paragraphs])
        except Exception as e:
            logger.error(f"DOCX extraction error: {e}")
            return ""

    def extract_detailed_skills(self, resume_text: str) -> Dict[str, Dict]:
        """Extract skills with confidence scores and proficiency indicators"""
        text_lower = resume_text.lower()
        extracted_skills = {}
        
        for skill, base_confidance in self.skill_weights.items():
            confidence = base_confidance
            
            # Increase confidence based on context
            contexts = [
                f"{skill} experience", f"proficient in {skill}",
                f"skilled in {skill}", f"expert in {skill}",
                f"{skill} developer", f"{skill} engineer"
            ]
            
            for context in contexts:
                if context in text_lower:
                    confidence = min(0.98, confidence + 0.10)
                    break
            
            # Expert indicators
            expert_indicators = [
                f"{skill} architect", f"{skill} consultant",
                f"advanced {skill}", f"senior {skill}"
            ]
            
            for indicator in expert_indicators:
                if indicator in text_lower:
                    confidence = min(0.98, confidence + 0.15)
                    break
            
            if confidence >= 0.60:  # Minimum threshold
                proficiency_level = self._calculate_proficiency_mevel(skill, text_lower)
                extracted_skills[skill] = {
                    "confidence": round(confidence, 3),
                    "proficiency": proficiency_level,
                    "mentions": text_lower.count(skill)
                }
        
        return extracted_skills

    def _calculate_proficiency_mevel(self, skill: str, text: str) -> str:
        """Calculate proficiency level based on context"""
        beginner_indicators = ["learning", "beginner", "introduction"]
        intermediate_indicators = ["intermediate", "working knowledge", "experience"]
        expert_indicators = ["expert", "advanced", "proficient", "master", "senior"]
        
        if any(indicator in text for indicator in expert_indicators):
            return "Expert"
        elif any(indicator in text for indicator in intermediate_indicators):
            return "Intermediate"
        else:
            return "Beginner"

    def extract_experience_insights(self, resume_text: str) -> Tuple[List[ExperienceInfo], Dict]:
        """Extract detailed experience information"""
        experiences = []
        career_insights = {
            "total_experience_months": 0,
            "industry_experience": {},
            "role_progression": [],
            "career_gaps": [],
            "leadership_experience": False
        }
        
        # Extract company and position information
        company_patterns = [
            r"([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:Inc|Corp|LLC|Ltd)",
            r"(\w+(?:\s+\w+)*)\s+company",
            r"worked at\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)"
        ]
        
        companies = []
        for pattern in company_patterns:
            matches = re.findall(pattern, resume_text, re.IGNORECASE)
            companies.extend(matches)
        
        # Calculate duration and analyze progression
        duration_pattern = r"(\d+)[\+\s\-/]*years?"
        duration_years = re.findall(duration_pattern, resume_text.lower())
        
        if duration_years:
            try:
                career_insights["total_experience_months"] = sum(int(y) for y in duration_years) * 12
            except ValueError:
                career_insights["total_experience_months"] = len(duration_years) * 24  # Estimated
        
        # Detect leadership experience
        leadership_keywords = ["managed", "lead", "supervised", "team", "department"]
        career_insights["leadership_experience"] = any(
            keyword in resume_text.lower() for keyword in leadership_keywords
        )
        
        return experiences, career_insights

    def analyze_personality_traits(self, resume_text: str) -> Dict[str, float]:
        """Analyze personality traits from resume content"""
        traits = {
            "collaborative": 0.0,
            "detail_oriented": 0.0,
            "innovative": 0.0,
            "communication_focused": 0.0,
            "results_driven": 0.0
        }
        
        # Collaborative indicators
        collaborative_indicators = ["teamwork", "collaborated", "team player", "coordinated"]
        traits["collaborative"] = min(1.0, sum(1 for word in collaborative_indicators if word in resume_text.lower()) * 0.25)
        
        # Detail oriented indicators
        detail_indicators = ["accuracy", "quality", "precision", "optimize", "improve"]
        traits["detail_oriented"] = min(1.0, sum(1 for word in detail_indicators if word in resume_text.lower()) * 0.20)
        
        # Innovative indicators
        innovative_indicators = ["innovation", "creative", "problem solving", "novel", "breakthrough"]
        traits["innovative"] = min(1.0, sum(1 for word in innovative_indicators if word in resume_text.lower()) * 0.30)
        
        # Communication indicators
        comm_indicators = ["presented", "communicated", "wrote", "documented", "trained"]
        traits["communication_focused"] = min(1.0, sum(1 for word in comm_indicators if word in resume_text.lower()) * 0.20)
        
        # Results driven indicators
        results_indicators = ["achieved", "increased", "improved", "delivered", "performance"]
        traits["results_driven"] = min(1.0, sum(1 for word in results_indicators if word in resume_text.lower()) * 0.20)
        
        return traits

    def calculate_job_fit_score(self, profile: PersonProfile, job_requirements: JobAnalysis) -> Dict:
        """Calculate comprehensive job fit score"""
        
        # Skill matching score (60% weight)
        skill_score = self._calculate_skill_match_score(profile.skills, job_requirements.required_skills)
        
        # Experience relevance (25% weight)
        experience_score = self._calculate_experience_relevance(profile.experience, job_requirements.experience_level)
        
        # Culture fit (15% weight)
        culture_score = self._calculate_culture_fit(profile.personality_traits, job_requirements.company_culture)
        
        # Overall weighted score
        final_score = (skill_score * 0.60) + (experience_score * 0.25) + (culture_score * 0.15)
        
        return {
            "overall_score": round(final_score * 100, 1),
            "skill_match": round(skill_score * 100, 1),
            "experience_match": round(experience_score * 100, 1),
            "culture_fit": round(culture_score * 100, 1),
            "strength_areas": self._identify_strengths(profile, job_requirements),
            "improvement_areas": self._identify_gaps(profile, job_requirements)
        }

    def _calculate_skill_match_score(self, candidate_skills: List[str], required_skills: List[str]) -> float:
        """Calculate skill matching percentage"""
        if not required_skills:
            return 1.0
        
        matched_skills = sum(1 for skill in required_skills if skill.lower() in [s.lower() for s in candidate_skills])
        return matched_skills / len(required_skills)

    def _calculate_experience_relevance(self, experience: List[ExperienceInfo], required_level: str) -> float:
        """Calculate experience level relevance"""
        if not experience:
            return 0.0
        
        total_months = sum(exp.duration_months for exp in experience)
        
        level_requirements = {
            "entry": 0,
            "junior": 12,
            "mid": 24,
            "senior": 48,
            "lead": 72
        }
        
        required_months = level_requirements.get(required_level.lower(), 24)
        return min(1.0, total_months / required_months)

    def _calculate_culture_fit(self, personality_traits: List[str], company_culture: List[str]) -> float:
        """Calculate culture fit score"""
        # Simplified culture matching - in reality this would be more sophisticated
        trait_keywards = ["collaborative", "innovative", "detail-orientated", "results-driven"]
        matching_traits = sum(1 for trait in personality_traits if trait in trait_keywards)
        return min(1.0, matching_traits / len(trait_keywards)) if trait_keywards else 0.5

    def _identify_strengths(self, profile: PersonProfile, job_requirements: JobAnalysis) -> List[str]:
        """Identify candidate strengths for this job"""
        strengths = []
        
        # Strong technical skills
        strong_skills = [skill for skill in profile.skills if skill in job_requirements.required_skills]
        if strong_skills:
            strengths.append(f"Strong technical skills in {', '.join(strong_skills[:3])}")
        
        # Experience relevance
        if profile.experience:
            strengths.append(f"{len(profile.experience)} years of relevant experience")
        
        # Leadership experience
        leadership_experience = any("lead" in exp.position.lower() or "manage" in exp.position.lower() for exp in profile.experience)
        if leadership_experience:
            strengths.append("Demonstrated leadership experience")
        
        return strengths[:3]  # Return top 3 strengths

    def _identify_gaps(self, profile: PersonProfile, job_requirements: JobAnalysis) -> List[str]:
        """Identify areas for improvement"""
        gaps = []
        
        # Missing required skills
        missing_skills = [skill for skill in job_requirements.required_skills 
                         if skill not in profile.skills]
        if missing_gaps:
            gaps.append(f"Consider gaining experience in: {', '.join(missing_skills[:2])}")
        
        # Experience level gap
        if not profile.experience:
            gaps.append("Limited professional experience")
        
        return gaps[:2]  # Return top 2 gaps

    def analyze_resume(self, file_path: str, job_requirements: Dict = None) -> Dict:
        """
        Main method to analyze a resume comprehensively
        """
        try:
            # Extract text
            resume_text = self.extract_text_from_file(file_path)
            if not resume_text:
                return {"error": "Could not extract text from resume"}
            
            # Analyze various aspects
            skills = self.extract_detailed_skills(resume_text)
            experiences, career_insights = self.extract_experience_insights(resume_text)
            personality_traits = self.analyze_personality_traits(resume_text)
            
            # Create profile
            profile = PersonProfile(
                skills=list(skills.keys()),
                experience=experiences,
                education=[],  # Would need specific education extraction
                personality_traits=list(personality_traits.keys()),
                work_style="Unknown"  # Would need more sophisticated analysis
            )
            
            # Analyze job fit if requirements provided
            fit_score = None
            if job_requirements:
                job_analysis = JobAnalysis(
                    required_skills=job_requirements.get("skills", []),
                    nice_to_have_skills=job_requirements.get("nice_to_have", []),
                    experience_level=job_requirements.get("experience_level", "mid"),
                    industry_domain=job_requirements.get("industry", "technology"),
                    company_culture=job_requirements.get("culture", ["innovative", "collaborative"])
                )
                fit_score = self.calculate_job_fit_score(profile, job_analysis)
            
            return {
                "success": True,
                "candidate_profile": {
                    "skills_detected": skills,
                    "career_insights": career_insights,
                    "personality_traits": personality_traits,
                    "experiences": len(experiences),
                    "education_completed": len(profile.education)
                },
                "job_fit_analysis": fit_score,
                "analysis_confidence": self._calculate_overall_confidence(resume_text),
                "timestamp": self._get_current_timestamp()
            }
            
        except Exception as e:
            logger.error(f"Error during resume analysis: {e}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": self._get_current_timestamp()
            }

    def _calculate_overall_confidence(self, text: str) -> float:
        """Calculate overall confidence in the analysis"""
        # More sophisticated confidence calculation based on text quality and completeness
        confidence = 0.7  # Base confidence
        
        if len(text) > 500:
            confidence += 0.1
        if any(word in text.lower() for word in ["experience", "education", "skills", "work"]):
            confidence += 0.1
        if "python" in text.lower() or "javascript" in text.lower():
            confidence += 0.05  # Bonus for tech keywords
            
        return min(0.95, confidence)

    def _get_current_timestamp(self) -> str:
        """Get current timestamp for analysis"""
        from datetime import datetime
        return datetime.now().isoformat()

# Usage example
if __name__ == "__main__":
    analyzer = AdvancedResumeAnalyzer()
    
    # Example job requirements
    sample_job = {
        "skills": ["python", "javascript", "react", "node.js"],
        "experience_level": "mid",
        "industry": "technology"
    }
    
    # Analyze resume and return detailed scoring
    result = analyzer.analyze_resume("sample_resume.pdf", sample_job)
    print(json.dumps(result, indent=2))
