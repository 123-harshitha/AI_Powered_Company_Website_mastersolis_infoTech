"""
Report Generator Module for SmartHire AI Recruitment System
Generate comprehensive PDF and HTML reports for candidates
"""
import os
import json
import base64
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging
from pathlib import Path

# PDF Generation
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.graphics.shapes import Drawing, Rect
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.charts.piecharts import Pie

# HTML Generation
from jinja2 import Template
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.graph_objects as go
import plotly.express as px
from plotly.utils import PlotlyJSONEncoder
import io

logger = logging.getLogger(__name__)

class ReportGenerator:
    """Generate comprehensive candidate reports in multiple formats"""
    
    def __init__(self):
        self.template_dir = Path("templates")
        self.output_dir = Path("reports")
        self.assets_dir = Path("assets")
        
        # Create directories if they don't exist
        self.template_dir.mkdir(exist_ok=True)
        self.output_dir.mkdir(exist_ok=True)
        self.assets_dir.mkdir(exist_ok=True)
        
        # Initialize styles
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Setup custom paragraph styles"""
        # Title style
        self.title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=1,
            textColor=colors.HexColor('#1e40af')
        )
        
        # Section header style
        self.section_style = ParagraphStyle(
            'SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceAfter=12,
            spaceBefore=20,
            textColor=colors.HexColor('#374151')
        )
        
        # Body text style
        self.body_style = ParagraphStyle(
            'BodyText',
            parent=self.styles['Normal'],
            fontSize=11,
            spaceAfter=6,
            leading=14
        )
        
        # Score style
        self.score_style = ParagraphStyle(
            'ScoreText',
            parent=self.styles['Normal'],
            fontSize=12,
            textColor=colors.HexColor('#059669'),
            alignment=1
        )
    
    def generate_comprehensive_report(self, candidate_data: Dict[str, Any], report_type: str = "comprehensive") -> Dict[str, Any]:
        """Generate comprehensive candidate report"""
        try:
            report_id = f"report_{candidate_data.get('candidate_id', 'unknown')}_{int(datetime.now().timestamp())}"
            
            # Generate different format reports
            pdf_path = self.generate_pdf_report(candidate_data, report_id)
            html_path = self.generate_html_report(candidate_data, report_id)
            json_path = self.generate_json_report(candidate_data, report_id)
            
            return {
                "report_id": report_id,
                "generated_at": datetime.now().isoformat(),
                "report_type": report_type,
                "formats": {
                    "pdf": pdf_path,
                    "html": html_path,
                    "json": json_path
                },
                "summary": self._generate_report_summary(candidate_data)
            }
            
        except Exception as e:
            logger.error(f"Report generation error: {e}")
            return {"error": str(e)}
    
    def generate_pdf_report(self, candidate_data: Dict[str, Any], report_id: str) -> str:
        """Generate PDF report"""
        try:
            pdf_path = self.output_dir / f"{report_id}.pdf"
            doc = SimpleDocTemplate(str(pdf_path), pagesize=A4)
            story = []
            
            # Title page
            story.append(Paragraph("SmartHire AI Recruitment Report", self.title_style))
            story.append(Spacer(1, 20))
            
            # Candidate information
            story.append(Paragraph("Candidate Information", self.section_style))
            candidate_info = self._format_candidate_info(candidate_data)
            story.append(candidate_info)
            story.append(Spacer(1, 20))
            
            # Resume Analysis Section
            if 'resume_analysis' in candidate_data:
                story.append(Paragraph("Resume Analysis", self.section_style))
                resume_section = self._format_resume_analysis(candidate_data['resume_analysis'])
                story.extend(resume_section)
                story.append(Spacer(1, 20))
            
            # Interview Analysis Section
            if 'interview_analysis' in candidate_data:
                story.append(Paragraph("Interview Analysis", self.section_style))
                interview_section = self._format_interview_analysis(candidate_data['interview_analysis'])
                story.extend(interview_section)
                story.append(Spacer(1, 20))
            
            # Emotion Analysis Section
            if 'emotion_analysis' in candidate_data:
                story.append(Paragraph("Emotion & Sentiment Analysis", self.section_style))
                emotion_section = self._format_emotion_analysis(candidate_data['emotion_analysis'])
                story.extend(emotion_section)
                story.append(Spacer(1, 20))
            
            # Assessment Results Section
            if 'assessment_results' in candidate_data:
                story.append(Paragraph("Assessment Results", self.section_style))
                assessment_section = self._format_assessment_results(candidate_data['assessment_results'])
                story.extend(assessment_section)
                story.append(Spacer(1, 20))
            
            # Recommendations Section
            story.append(Paragraph("Recommendations", self.section_style))
            recommendations = self._format_recommendations(candidate_data.get('recommendations', []))
            story.extend(recommendations)
            story.append(Spacer(1, 20))
            
            # Overall Score Section
            story.append(Paragraph("Overall Assessment", self.section_style))
            overall_score = self._format_overall_score(candidate_data)
            story.append(overall_score)
            
            # Build PDF
            doc.build(story)
            
            logger.info(f"PDF report generated: {pdf_path}")
            return str(pdf_path)
            
        except Exception as e:
            logger.error(f"PDF generation error: {e}")
            raise e
    
    def generate_html_report(self, candidate_data: Dict[str, Any], report_id: str) -> str:
        """Generate HTML report with interactive charts"""
        try:
            html_path = self.output_dir / f"{report_id}.html"
            
            # Generate charts
            charts_data = self._generate_charts_data(candidate_data)
            
            # HTML template
            html_template = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>SmartHire Candidate Report</title>
                <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f8fafc; }
                    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .header { text-align: center; margin-bottom: 40px; }
                    .header h1 { color: #1e40af; font-size: 2.5rem; margin-bottom: 10px; }
                    .header p { color: #6b7280; font-size: 1.1rem; }
                    .section { margin-bottom: 40px; }
                    .section h2 { color: #374151; font-size: 1.5rem; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
                    .score-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
                    .score-card h3 { margin: 0; font-size: 2rem; }
                    .score-card p { margin: 5px 0 0 0; opacity: 0.9; }
                    .chart-container { margin: 20px 0; }
                    .recommendations { background: #f0f9ff; padding: 20px; border-radius: 10px; border-left: 4px solid #3b82f6; }
                    .recommendations ul { margin: 0; padding-left: 20px; }
                    .recommendations li { margin-bottom: 8px; }
                    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>SmartHire AI Recruitment Report</h1>
                        <p>Comprehensive candidate analysis powered by artificial intelligence</p>
                        <p><strong>Generated:</strong> {{ generated_at }}</p>
                    </div>
                    
                    <div class="section">
                        <h2>Candidate Overview</h2>
                        <div class="score-card">
                            <h3>{{ overall_score }}%</h3>
                            <p>Overall Assessment Score</p>
                        </div>
                        <p><strong>Name:</strong> {{ candidate_name }}</p>
                        <p><strong>Position:</strong> {{ job_role }}</p>
                        <p><strong>Assessment Date:</strong> {{ assessment_date }}</p>
                    </div>
                    
                    {% if resume_analysis %}
                    <div class="section">
                        <h2>Resume Analysis</h2>
                        <div class="chart-container" id="resume-chart"></div>
                        <p><strong>Skills Match:</strong> {{ resume_analysis.skills_match }}%</p>
                        <p><strong>Experience Level:</strong> {{ resume_analysis.experience_level }}</p>
                        <p><strong>Education Score:</strong> {{ resume_analysis.education_score }}/10</p>
                    </div>
                    {% endif %}
                    
                    {% if interview_analysis %}
                    <div class="section">
                        <h2>Interview Performance</h2>
                        <div class="chart-container" id="interview-chart"></div>
                        <p><strong>Technical Score:</strong> {{ interview_analysis.technical_score }}%</p>
                        <p><strong>Communication Score:</strong> {{ interview_analysis.communication_score }}%</p>
                        <p><strong>Problem Solving:</strong> {{ interview_analysis.problem_solving_score }}%</p>
                    </div>
                    {% endif %}
                    
                    {% if emotion_analysis %}
                    <div class="section">
                        <h2>Emotion & Sentiment Analysis</h2>
                        <div class="chart-container" id="emotion-chart"></div>
                        <p><strong>Primary Emotion:</strong> {{ emotion_analysis.primary_emotion }}</p>
                        <p><strong>Confidence Level:</strong> {{ emotion_analysis.confidence_level }}%</p>
                        <p><strong>Stress Level:</strong> {{ emotion_analysis.stress_level }}%</p>
                    </div>
                    {% endif %}
                    
                    {% if recommendations %}
                    <div class="section">
                        <h2>Recommendations</h2>
                        <div class="recommendations">
                            <ul>
                                {% for recommendation in recommendations %}
                                <li>{{ recommendation }}</li>
                                {% endfor %}
                            </ul>
                        </div>
                    </div>
                    {% endif %}
                    
                    <div class="footer">
                        <p>Report generated by SmartHire AI Recruitment System</p>
                        <p>Confidential - For internal use only</p>
                    </div>
                </div>
                
                <script>
                    // Resume Analysis Chart
                    {% if charts_data.resume_chart %}
                    Plotly.newPlot('resume-chart', {{ charts_data.resume_chart | safe }});
                    {% endif %}
                    
                    // Interview Performance Chart
                    {% if charts_data.interview_chart %}
                    Plotly.newPlot('interview-chart', {{ charts_data.interview_chart | safe }});
                    {% endif %}
                    
                    // Emotion Analysis Chart
                    {% if charts_data.emotion_chart %}
                    Plotly.newPlot('emotion-chart', {{ charts_data.emotion_chart | safe }});
                    {% endif %}
                </script>
            </body>
            </html>
            """
            
            # Render template
            template = Template(html_template)
            html_content = template.render(
                generated_at=datetime.now().strftime("%B %d, %Y at %I:%M %p"),
                overall_score=candidate_data.get('overall_score', 0),
                candidate_name=candidate_data.get('candidate_name', 'Unknown'),
                job_role=candidate_data.get('job_role', 'Position'),
                assessment_date=datetime.now().strftime("%B %d, %Y"),
                resume_analysis=candidate_data.get('resume_analysis', {}),
                interview_analysis=candidate_data.get('interview_analysis', {}),
                emotion_analysis=candidate_data.get('emotion_analysis', {}),
                recommendations=candidate_data.get('recommendations', []),
                charts_data=charts_data
            )
            
            # Write HTML file
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            logger.info(f"HTML report generated: {html_path}")
            return str(html_path)
            
        except Exception as e:
            logger.error(f"HTML generation error: {e}")
            raise e
    
    def generate_json_report(self, candidate_data: Dict[str, Any], report_id: str) -> str:
        """Generate JSON report"""
        try:
            json_path = self.output_dir / f"{report_id}.json"
            
            # Add metadata
            report_data = {
                "report_id": report_id,
                "generated_at": datetime.now().isoformat(),
                "report_type": "comprehensive",
                "version": "2.0.0",
                "candidate_data": candidate_data,
                "summary": self._generate_report_summary(candidate_data)
            }
            
            # Write JSON file
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(report_data, f, indent=2, ensure_ascii=False)
            
            logger.info(f"JSON report generated: {json_path}")
            return str(json_path)
            
        except Exception as e:
            logger.error(f"JSON generation error: {e}")
            raise e
    
    def _format_candidate_info(self, candidate_data: Dict[str, Any]) -> Table:
        """Format candidate information table"""
        data = [
            ['Field', 'Value'],
            ['Name', candidate_data.get('candidate_name', 'N/A')],
            ['Email', candidate_data.get('email', 'N/A')],
            ['Position', candidate_data.get('job_role', 'N/A')],
            ['Assessment Date', datetime.now().strftime('%Y-%m-%d %H:%M')],
            ['Overall Score', f"{candidate_data.get('overall_score', 0)}%"]
        ]
        
        table = Table(data, colWidths=[2*inch, 4*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        return table
    
    def _format_resume_analysis(self, resume_data: Dict[str, Any]) -> List:
        """Format resume analysis section"""
        elements = []
        
        # Skills analysis
        if 'skills' in resume_data:
            elements.append(Paragraph("Skills Analysis:", self.section_style))
            skills_text = f"Technical Skills: {', '.join(resume_data['skills'].get('technical', [])[:5])}"
            elements.append(Paragraph(skills_text, self.body_style))
            
            soft_skills_text = f"Soft Skills: {', '.join(resume_data['skills'].get('soft', [])[:5])}"
            elements.append(Paragraph(soft_skills_text, self.body_style))
        
        # Experience analysis
        if 'years_of_experience' in resume_data:
            exp_text = f"Years of Experience: {resume_data['years_of_experience']}"
            elements.append(Paragraph(exp_text, self.body_style))
        
        # Quality score
        if 'metrics' in resume_data:
            quality_score = resume_data['metrics'].get('resume_quality_score', 0)
            quality_text = f"Resume Quality Score: {quality_score:.1f}/100"
            elements.append(Paragraph(quality_text, self.score_style))
        
        return elements
    
    def _format_interview_analysis(self, interview_data: Dict[str, Any]) -> List:
        """Format interview analysis section"""
        elements = []
        
        # Overall score
        if 'overall_score' in interview_data:
            score_text = f"Overall Interview Score: {interview_data['overall_score']:.1f}/100"
            elements.append(Paragraph(score_text, self.score_style))
        
        # Category breakdown
        if 'category_breakdown' in interview_data:
            elements.append(Paragraph("Performance by Category:", self.body_style))
            for category, score in interview_data['category_breakdown'].items():
                cat_text = f"• {category.replace('_', ' ').title()}: {score:.1f}%"
                elements.append(Paragraph(cat_text, self.body_style))
        
        # Strengths and weaknesses
        if 'strengths' in interview_data:
            strengths_text = f"Strengths: {', '.join(interview_data['strengths'])}"
            elements.append(Paragraph(strengths_text, self.body_style))
        
        if 'weaknesses' in interview_data:
            weaknesses_text = f"Areas for Improvement: {', '.join(interview_data['weaknesses'])}"
            elements.append(Paragraph(weaknesses_text, self.body_style))
        
        return elements
    
    def _format_emotion_analysis(self, emotion_data: Dict[str, Any]) -> List:
        """Format emotion analysis section"""
        elements = []
        
        # Primary emotion
        if 'emotion' in emotion_data:
            emotion_text = f"Primary Emotion: {emotion_data['emotion'].title()}"
            elements.append(Paragraph(emotion_text, self.body_style))
        
        # Confidence level
        if 'confidence' in emotion_data:
            conf_text = f"Confidence Level: {emotion_data['confidence']:.1%}"
            elements.append(Paragraph(conf_text, self.body_style))
        
        # Sentiment analysis
        if 'sentiment' in emotion_data:
            sentiment_text = f"Overall Sentiment: {emotion_data['sentiment'].title()}"
            elements.append(Paragraph(sentiment_text, self.body_style))
        
        return elements
    
    def _format_assessment_results(self, assessment_data: Dict[str, Any]) -> List:
        """Format assessment results section"""
        elements = []
        
        # Test scores
        if 'scores' in assessment_data:
            elements.append(Paragraph("Assessment Scores:", self.body_style))
            for test_type, score in assessment_data['scores'].items():
                score_text = f"• {test_type.replace('_', ' ').title()}: {score:.1f}%"
                elements.append(Paragraph(score_text, self.body_style))
        
        return elements
    
    def _format_recommendations(self, recommendations: List[str]) -> List:
        """Format recommendations section"""
        elements = []
        
        if recommendations:
            elements.append(Paragraph("Key Recommendations:", self.body_style))
            for i, rec in enumerate(recommendations, 1):
                rec_text = f"{i}. {rec}"
                elements.append(Paragraph(rec_text, self.body_style))
        else:
            elements.append(Paragraph("No specific recommendations available.", self.body_style))
        
        return elements
    
    def _format_overall_score(self, candidate_data: Dict[str, Any]) -> Paragraph:
        """Format overall score section"""
        overall_score = candidate_data.get('overall_score', 0)
        
        if overall_score >= 80:
            score_text = f"EXCELLENT CANDIDATE - Score: {overall_score:.1f}%"
            color = colors.HexColor('#059669')
        elif overall_score >= 70:
            score_text = f"GOOD CANDIDATE - Score: {overall_score:.1f}%"
            color = colors.HexColor('#3b82f6')
        elif overall_score >= 60:
            score_text = f"AVERAGE CANDIDATE - Score: {overall_score:.1f}%"
            color = colors.HexColor('#f59e0b')
        else:
            score_text = f"NEEDS IMPROVEMENT - Score: {overall_score:.1f}%"
            color = colors.HexColor('#ef4444')
        
        score_style = ParagraphStyle(
            'OverallScore',
            parent=self.styles['Heading2'],
            fontSize=18,
            textColor=color,
            alignment=1,
            spaceAfter=20
        )
        
        return Paragraph(score_text, score_style)
    
    def _generate_charts_data(self, candidate_data: Dict[str, Any]) -> Dict[str, str]:
        """Generate chart data for HTML report"""
        charts_data = {}
        
        try:
            # Resume analysis chart
            if 'resume_analysis' in candidate_data:
                resume_data = candidate_data['resume_analysis']
                fig = go.Figure(data=[
                    go.Bar(
                        x=['Skills Match', 'Experience', 'Education', 'Quality'],
                        y=[
                            resume_data.get('skills_match', 0),
                            resume_data.get('experience_score', 0),
                            resume_data.get('education_score', 0),
                            resume_data.get('quality_score', 0)
                        ],
                        marker_color=['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
                    )
                ])
                fig.update_layout(title="Resume Analysis Breakdown", height=400)
                charts_data['resume_chart'] = json.dumps(fig, cls=PlotlyJSONEncoder)
            
            # Interview performance chart
            if 'interview_analysis' in candidate_data:
                interview_data = candidate_data['interview_analysis']
                categories = list(interview_data.get('category_breakdown', {}).keys())
                scores = list(interview_data.get('category_breakdown', {}).values())
                
                fig = go.Figure(data=[
                    go.Scatterpolar(
                        r=scores,
                        theta=[cat.replace('_', ' ').title() for cat in categories],
                        fill='toself',
                        name='Interview Performance'
                    )
                ])
                fig.update_layout(title="Interview Performance Radar", polar=dict(radialaxis=dict(visible=True, range=[0, 100])))
                charts_data['interview_chart'] = json.dumps(fig, cls=PlotlyJSONEncoder)
            
            # Emotion analysis chart
            if 'emotion_analysis' in emotion_data:
                emotion_data = candidate_data['emotion_analysis']
                emotions = list(emotion_data.get('emotion_distribution', {}).keys())
                values = list(emotion_data.get('emotion_distribution', {}).values())
                
                fig = go.Figure(data=[go.Pie(labels=emotions, values=values)])
                fig.update_layout(title="Emotion Distribution")
                charts_data['emotion_chart'] = json.dumps(fig, cls=PlotlyJSONEncoder)
            
        except Exception as e:
            logger.error(f"Chart generation error: {e}")
        
        return charts_data
    
    def _generate_report_summary(self, candidate_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate report summary"""
        overall_score = candidate_data.get('overall_score', 0)
        
        # Determine recommendation
        if overall_score >= 80:
            recommendation = "STRONG HIRE"
            confidence = "High"
        elif overall_score >= 70:
            recommendation = "HIRE"
            confidence = "Medium"
        elif overall_score >= 60:
            recommendation = "CONDITIONAL HIRE"
            confidence = "Low"
        else:
            recommendation = "NO HIRE"
            confidence = "High"
        
        return {
            "overall_score": overall_score,
            "recommendation": recommendation,
            "confidence": confidence,
            "key_strengths": candidate_data.get('strengths', [])[:3],
            "areas_for_improvement": candidate_data.get('weaknesses', [])[:3],
            "generated_at": datetime.now().isoformat()
        }

# Global instance
report_generator = ReportGenerator()

# Example usage
if __name__ == "__main__":
    # Sample candidate data
    sample_data = {
        "candidate_id": "test_001",
        "candidate_name": "John Doe",
        "email": "john.doe@example.com",
        "job_role": "Senior Software Engineer",
        "overall_score": 85,
        "resume_analysis": {
            "skills_match": 90,
            "experience_score": 85,
            "education_score": 80,
            "quality_score": 88,
            "skills": {
                "technical": ["Python", "JavaScript", "React", "Node.js"],
                "soft": ["Leadership", "Communication", "Problem Solving"]
            },
            "years_of_experience": 5
        },
        "interview_analysis": {
            "overall_score": 82,
            "category_breakdown": {
                "technical": 85,
                "communication": 80,
                "problem_solving": 88,
                "leadership": 75
            },
            "strengths": ["Strong technical skills", "Clear communication"],
            "weaknesses": ["Limited leadership experience"]
        },
        "emotion_analysis": {
            "emotion": "happy",
            "confidence": 0.85,
            "sentiment": "positive",
            "emotion_distribution": {
                "happy": 0.4,
                "neutral": 0.3,
                "surprise": 0.2,
                "sad": 0.05,
                "angry": 0.03,
                "fear": 0.02
            }
        },
        "recommendations": [
            "Excellent technical skills demonstrated",
            "Strong communication abilities",
            "Consider additional leadership training",
            "Great cultural fit for the team"
        ]
    }
    
    # Generate report
    generator = ReportGenerator()
    result = generator.generate_comprehensive_report(sample_data)
    print("Report generated successfully!")
    print(f"Report ID: {result['report_id']}")
    print(f"Formats: {list(result['formats'].keys())}")
