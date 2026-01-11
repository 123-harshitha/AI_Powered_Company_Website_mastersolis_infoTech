"""
Advanced Resume Parser Service
"""
import os
import re
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import PyPDF2
import docx
from pathlib import Path

class ResumeParser:
    """Advanced resume parsing with NLP and ML capabilities"""
    
    def __init__(self):
        self.skills_database = self._load_skills_database()
        self.degree_patterns = self._init_degree_patterns()
        self.experience_patterns = self._init_experience_patterns()
    
    def _load_skills_database(self) -> Dict[str, List[str]]:
        """Load comprehensive skills database"""
        return {
            'programming_languages': [
                'Python', 'JavaScript', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
                'Swift', 'Kotlin', 'TypeScript', 'Scala', 'Haskell', 'Clojure', 'Elixir'
            ],
            'web_frameworks': [
                'React', 'Angular', 'Vue.js', 'Express.js', 'Django', 'Flask', 'Spring',
                'Rails', 'Laravel', 'ASP.NET', 'FastAPI', 'Next.js', 'Nuxt.js', 'Svelte'
            ],
            'databases': [
                'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Cassandra',
                'SQLite', 'Oracle', 'SQL Server', 'DynamoDB', 'CouchDB', 'Neo4j'
            ],
            'cloud_platforms': [
                'AWS', 'Azure', 'GCP', 'Heroku', 'DigitalOcean', 'Linode', 'Vultr'
            ],
            'devops_tools': [
                'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'GitHub Actions',
                'Terraform', 'Ansible', 'Chef', 'Puppet', 'CircleCI', 'Travis CI'
            ],
            'data_science': [
                'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn',
                'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Plotly', 'Jupyter'
            ],
            'soft_skills': [
                'Leadership', 'Communication', 'Teamwork', 'Problem Solving',
                'Analytical Thinking', 'Project Management', 'Time Management',
                'Customer Service', 'Public Speaking', 'Negotiation'
            ]
        }
    
    def _init_degree_patterns(self) -> List[str]:
        """Initialize degree recognition patterns"""
        return [
            r'\b(?:Bachelor|Bsc?\w?|Bachelor\'?s)\s+(?:of\s+)?(?:Science|Arts|Engineering|Business|Computer)\b',
            r'\b(?:Master|Msc?\w?|Master\'?s)\s+(?:of\s+)?(?:Science|Arts|Engineering|Business|Computer|MBA)\b',
            r'\b(?:PhD|Ph\.D|Doctor|Doctorate)\s+(?:of\s+)?(?:Philosophy|Science|Engineering)\b',
            r'\b(?:Associate|Certificate|Diploma)\b',
            r'\b(?:Computer Science|Engineering|IT|Information Technology)\b'
        ]
    
    def _init_experience_patterns(self) -> List[str]:
        """Initialize experience extraction patterns"""
        return [
            r'(?:experience|experiência)\s*[:.]?\s*(\d+)\+?\s*(?:years?|anos?|yrs?)',
            r'(\d+)\+?\s*(?:years?|anos?|yrs?)\s*(?:of\s+)?(?:experience|experiência)',
            r'(?:minimum|minimum|at\s+least)\s+(\d+)\+?\s*(?:years?|anos?|yrs?)',
            r'(?:(\d{4})\s*[-–]\s*(\d{4}|present|current|atual))',
            r'(?:(\d{1,2})\s*(?:/\d{1,2})?\s*(?:/\d{2,4}))\s*[-–]\s*(\d{1,2}\s*(?:/\d{1,2})?\s*(?:/\d{2,4})|present|current|atual)'
        ]
    
    def parse_resume(self, file_path: str) -> Dict[str, Any]:
        """Main resume parsing method"""
        try:
            # Extract text from file
            text = self._extract_text(file_path)
            
            if not text or len(text.strip()) < 50:
                raise ValueError("Resume file appears to be empty or corrupted")
            
            # Extract information sections
            personal_info = self._extract_personal_info(text)
            skills = self._extract_skills(text)
            education = self._extract_education(text)
            experience = self._extract_experience(text)
            work_history = self._extract_work_history(text)
            
            # Calculate metrics
            years_experience = self._calculate_experience_years(experience, work_history)
            resume_quality = self._analyze_resume_quality(text, skills, education, work_history)
            
            # Generate insights
            strengths = self._identify_strengths(skills, experience, education)
            improvements = self._identify_improvement_areas(text, skills, education, work_history)
            recommended_role = self._recommend_role(skills, years_experience, education)
            
            return {
                'parsed_at': datetime.now().isoformat(),
                'personal_info': personal_info,
                'skills': {
                    'technical': skills['technical'],
                    'soft': skills['soft'],
                    'all_skills': skills['all'],
                    'skill_categories': skills['categories']
                },
                'education': education,
                'work_experience': work_history,
                'years_of_experience': years_experience,
                'metrics': {
                    'resume_quality_score': resume_quality['score'],
                    'completeness_score': resume_quality['completeness'],
                    'professionalism_score': resume_quality['professionalism'],
                    'skill_diversity_score': resume_quality['skill_diversity']
                },
                'insights': {
                    'strengths': strengths,
                    'areas_for_improvement': improvements,
                    'recommended_role': recommended_role,
                    'fit_confidence': self._calculate_fit_confidence(skills, experience, resume_quality)
                }
            }
            
        except Exception as e:
            return {
                'error': str(e),
                'parsed_at': datetime.now().isoformat(),
                'status': 'failed'
            }
    
    def _extract_text(self, file_path: str) -> str:
        """Extract text from various file formats"""
        file_path = Path(file_path)
        
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        if file_path.suffix.lower() == '.pdf':
            return self._extract_text_from_pdf(file_path)
        elif file_path.suffix.lower() in ['.docx', '.doc']:
            return self._extract_text_from_docx(file_path)
        elif file_path.suffix.lower() == '.txt':
            return self._extract_text_from_txt(file_path)
        else:
            # Try to read as plain text
            return self._extract_text_from_txt(file_path)
    
    def _extract_text_from_pdf(self, file_path: Path) -> str:
        """Extract text from PDF file"""
        try:
            import PyPDF2
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                return text
        except Exception as e:
            raise Exception(f"Error extracting text from PDF: {str(e)}")
    
    def _extract_text_from_docx(self, file_path: Path) -> str:
        """Extract text from DOCX file"""
        try:
            doc = docx.Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text
        except Exception as e:
            raise Exception(f"Error extracting text from DOCX: {str(e)}")
    
    def _extract_text_from_txt(self, file_path: Path) -> str:
        """Extract text from TXT file"""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
                return file.read()
        except Exception as e:
            raise Exception(f"Error extracting text from TXT: {str(e)}")
    
    def _extract_personal_info(self, text: str) -> Dict[str, str]:
        """Extract personal information from resume text"""
        # Email pattern
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text)
        
        # Phone pattern (international formats)
        phone_patterns = [
            r'\+\d{1 and 3}\s?\d{1,4}\s?\d{1,4}\s?\d{1,9}',
            r'\(\d{3}\)\s?\d{3}-\d{4}',
            r'\d{3}[-.\s]?\d{3}[-.\s]?\d{4}',
            r'\d{10}'
        ]
        
        phones = []
        for pattern in phone_patterns:
            phones.extend(re.findall(pattern, text))
        
        # Name extraction (first few lines)
        lines = text.split('\n')[:10]
        potential_names = []
        
        for line in lines:
            line = line.strip()
            if len(line) > 0 and not re.search(r'[{}]', line):
                words = line.split()
                if 2 <= len(words) <= 4 and all(word.isalpha() for word in words):
                    potential_names.append(line)
                    break
        
        return {
            'email': emails[0] if emails else '',
            'phone': phones[0] if phones else '',
            'name': potential_names[0] if potential_names else '',
            'all_emails': emails,
            'all_phones': phones
        }
    
    def _extract_skills(self, text: str) -> Dict[str, List[str]]:
        """Extract technical and soft skills from resume"""
        text_lower = text.lower()
        found_skills = {'technical': [], 'soft': [], 'all': [], 'categories': {}}
        
        # Check each skill category
        for category, skills_list in self.skills_database.items():
            category_skills = []
            for skill in skills_list:
                if skill.lower() in text_lower:
                    category_skills.append(skill)
                    found_skills['all'].append(skill)
            
            if category_skills:
                found_skills['categories'][category] = category_skills
                if category in ['soft_skills']:
                    found_skills['soft'].extend(category_skills)
                else:
                    found_skills['technical'].extend(category_skills)
        
        # Remove duplicates while preserving order
        found_skills['technical'] = list(dict.fromkeys(found_skills['technical']))
        found_skills['soft'] = list(dict.fromkeys(found_skills['soft']))
        found_skills['all'] = list(dict.fromkeys(found_skills['all']))
        
        return found_skills
    
    def _extract_education(self, text: str) -> List[Dict[str, str]]:
        """Extract education information"""
        education = []
        lines = text.split('\n')
        
        for i, line in enumerate(lines):
            line_lower = line.lower()
            for degree_pattern in self.degree_patterns:
                if re.search(degree_pattern, line_lower):
                    # Found a degree mention
                    education_item = {
                        'degree': line.strip(),
                        'year': '',
                        'institution': '',
                        'field': ''
                    }
                    
                    # Extract year from current line or nearby lines
                    year_match = re.search(r'\b(19|20)\d{2}\b', line)
                    if year_match:
                        education_item['year'] = year_match.group()
                    
                    # Extract institution from next line(s)
                    for j in range(1, 3):
                        if i + j < len(lines):
                            next_line = lines[i + j].strip()
                            if len(next_line) > 5 and not re.search(degree_pattern, next_line.lower()):
                                education_item['institution'] = next_line
                                break
                    
                    education.append(education_item)
                    break
        
        return education
    
    def _extract_experience(self, text: str) -> List[str]:
        """Extract experience-related information"""
        experience_mentions = []
        
        for pattern in self.experience_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            experience_mentions.extend(matches)
        
        return list(set(experience_mentions))
    
    def _extract_work_history(self, text: str) -> List[Dict[str, Any]]:
        """Extract detailed work history"""
        work_history = []
        lines = text.split('\n')
        
        current_job = {}
        
        for line in lines:
            line_lower = line.lower()
            
            # Check for job title patterns
            job_indicators = ['developer', 'engineer', 'manager', 'analyst', 'consultant', 'specialist']
            if any(indicator in line_lower for indicator in job_indicators) and 'experience' not in line_lower:
                if current_job:
                    work_history.append(current_job)
                
                current_job = {
                    'position': line.strip(),
                    'company': '',
                    'location': '',
                    'duration': '',
                    'description': []
                }
            
            elif current_job and line.strip():
                # Add to current job description
                current_job['description'].append(line.strip())
        
        if current_job:
            work_history.append(current_job)
        
        return work_history
    
    def _calculate_experience_years(self, experience: List[str], work_history: List[Dict]) -> float:
        """Calculate years of experience"""
        # Extract years from experience mentions
        years_extracted = []
        
        for exp in experience:
            if isinstance(exp, tuple):
                years_extracted.extend([year for year in exp if year.isdigit()])
            elif isinstance(exp, str) and exp.isdigit():
                years_extracted.append(exp)
        
        if years_extracted:
            return float(max([int(year) for year in years_extracted]))
        
        # Fallback: estimate based on work history length
        return min(len(work_history) * 1.5, 10.0)
    
    def _analyze_resume_quality(self, text: str, skills: Dict, education: List, work_history: List) -> Dict[str, float]:
        """Analyze overall resume quality"""
        quality_scores = {}
        
        # Length and completeness
        text_length_score = min(len(text) / 2000 * 100, 100)  # Target 2000+ chars
        quality_scores['score'] = text_length_score
        
        # Completeness score
        sections_present = 0
        sections = ['experience', 'education', 'skills', 'contact', 'summary']
        text_lower = text.lower()
        
        for section in sections:
            if section in text_lower or f'{section}:' in text_lower:
                sections_present += 1
        
        quality_scores['completeness'] = (sections_present / len(sections)) * 100
        
        # Professionalism score
        professional_keywords = ['achieved', 'developed', 'managed', 'designed', 'implemented', 'led', 'created']
        professionalism_score = sum(1 for keyword in professional_keywords if keyword in text_lower) * 5
        quality_scores['professionalism'] = min(professionalism_score, 100)
        
        # Skill diversity score
        skill_count = len(skills['technical']) + len(skills['soft'])
        quality_scores['skill_diversity'] = min(skill_count * 3, 100)
        
        return quality_scores
    
    def _identify_strengths(self, skills: Dict, experience: List, education: List) -> List[str]:
        """Identify candidate strengths"""
        strengths = []
        
        # Technical skills strength
        if len(skills['technical']) > 5:
            strengths.append('Strong technical skillset')
        
        # Programming languages
        prog_langs = skills['categories'].get('programming_languages', [])
        if len(prog_langs) > 3:
            strengths.append(f'Articulate in multiple languages: {", ".join(prog_langs[:3])}')
        
        # Cloud/platform skills
        cloud_skills = skills['categories'].get('cloud_platforms', [])
        if cloud_skills:
            strengths.append('Cloud platform experience')
        
        # Data science skills
        data_skills = skills['categories'].get('data_science', [])
        if data_skills:
            strengths.append('Data science capabilities')
        
        # Education level
        if any('master' in edu['degree'].lower() or 'mba' in edu['degree'].lower() for edu in education):
            strengths.append('Advanced degree qualification')
        
        return strengths[:5]  # Top 5 strengths
    
    def _identify_improvement_areas(self, text: str, skills: Dict, education: List, work_history: List) -> List[str]:
        """Identify areas for improvement"""
        improvements = []
        
        # Missing technical skills
        if len(skills['technical']) < 3:
            improvements.append('Consider adding more technical skills')
        
        # Missing soft skills
        if len(skills['soft']) < 3:
            improvements.append('Highlight leadership and communication skills')
        
        # Resume length
        if len(text) < 500:
            improvements.append('Resume could be more detailed')
        
        # Work experience detail
        if len(work_history) < 2:
            improvements.append('Add more detailed work experience descriptions')
        
        # Contact information
        personal_info = self._extract_personal_info(text)
        if not personal_info['email']:
            improvements.append('Include professional email contact')
        
        return improvements[:5]
    
    def _recommend_role(self, skills: Dict, years_experience: float, education: List) -> str:
        """Recommend suitable role based on skills and experience"""
        technical_skills = skills['technical']
        
        # Seniority level based on experience
        if years_experience > 5:
            seniority = 'Senior '
        elif years_experience > 2:
            seniority = 'Mid-level '
        else:
            seniority = 'Junior '
        
        # Role based on skills
        if any(skill in technical_skills for skill in ['Machine Learning', 'Data Science', 'TensorFlow']):
            return f"{seniority}Data Scientist"
        elif any(skill in technical_skills for skill in ['AWS', 'Azure', 'Docker', 'Kubernetes']):
            return f"{seniority}DevOps Engineer"
        elif any(skill in technical_skills for skill in ['React', 'Angular', 'Vue.js']):
            return f"{seniority}Frontend Developer"
        elif any(skill in technical_skills for skill in ['Python', 'Node.js', 'Java']):
            return f"{seniority}Backend Developer"
        elif any(skill in technical_skills for skill in ['Full Stack', 'React', 'Node.js']):
            return f"{seniority}Full Stack Developer"
        else:
            return f"Software Developer"
    
    def _calculate_fit_confidence(self, skills: Dict, experience: List, quality: Dict) -> float:
        """Calculate confidence in fit recommendations"""
        # Base confidence on skill diversity and resume quality
        skill_score = len(skills['all']) * 2
        quality_score = quality['score']
        
        total_score = skill_count + quality_score
        confidence = min(total_score / 2, 100)
        
        return round(confidence, 1)

def analyze_resume_file(file_path: str, job_requirements: List[str] = None) -> Dict[str, Any]:
    """Main function to analyze resume file"""
    parser = ResumeParser()
    result = parser.parse_resume(file_path)
    
    # Add job matching if requirements provided
    if job_requirements and 'error' not in result:
        result['job_matching'] = calculate_job_match(result['skills']['all'], job_requirements)
    
    return result

def calculate_job_match(candidate_skills: List[str], job_requirements: List[str]) -> Dict[str, Any]:
    """Calculate how well candidate matches job requirements"""
    if not job_requirements:
        return {'score': 0, 'matched_skills': [], 'missing_skills': []}
    
    job_reqs_lower = [req.lower() for req in job_requirements]
    candidate_skills_lower = [skill.lower() for skill in candidate_skills]
    
    matched_skills = []
    missing_skills = []
    
    for req in job_requirements:
        req_lower = req.lower()
        if any(req_lower in skill_lower for skill_lower in candidate_skills_lower):
            matched_skills.append(req)
        else:
            missing_skills.append(req)
    
    match_score = (len(matched_skills) / len(job_requirements)) * 100
    
    return {
        'score': round(match_score, 1),
        'matched_skills': matched_skills,
        'missing_skills': missing_skills,
        'total_requirements': len(job_requirements),
        'match_percentage': round(match_score, 1)
    }
