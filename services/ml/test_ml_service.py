#!/usr/bin/env python3
"""
Simple ML Service Test Script
Tests basic functionality without complex imports
"""

import sys
import os

def test_basic_imports():
    """Test basic Python imports"""
    try:
        import fastapi
        import uvicorn
        import redis
        import json
        import uuid
        print("OK: Basic imports working")
        return True
    except ImportError as e:
        print(f"ERROR: Basic import error: {e}")
        return False

def test_ml_imports():
    """Test ML-specific imports"""
    try:
        import transformers
        import spacy
        import numpy as np
        import pandas as pd
        print("OK: ML imports working")
        return True
    except ImportError as e:
        print(f"ERROR: ML import error: {e}")
        return False

def test_resume_parser():
    """Test resume parser module"""
    try:
        from resume_parser import ResumeParser
        parser = ResumeParser()
        print("OK: Resume parser working")
        return True
    except Exception as e:
        print(f"ERROR: Resume parser error: {e}")
        return False

def test_interview_bot():
    """Test interview bot module"""
    try:
        from interview_bot import InterviewBot
        bot = InterviewBot()
        print("OK: Interview bot working")
        return True
    except Exception as e:
        print(f"ERROR: Interview bot error: {e}")
        return False

def test_emotion_analysis():
    """Test emotion analysis module"""
    try:
        from emotion_analysis import EmotionAnalyzer
        analyzer = EmotionAnalyzer()
        print("OK: Emotion analysis working")
        return True
    except Exception as e:
        print(f"ERROR: Emotion analysis error: {e}")
        return False

def test_report_generator():
    """Test report generator module"""
    try:
        from report_generator import ReportGenerator
        generator = ReportGenerator()
        print("OK: Report generator working")
        return True
    except Exception as e:
        print(f"ERROR: Report generator error: {e}")
        return False


def main():
    """Run all tests"""
    print("Testing ML Service Components...")
    print("=" * 40)
    
    tests = [
        ("Basic Imports", test_basic_imports),
        ("ML Imports", test_ml_imports),
        ("Resume Parser", test_resume_parser),
        ("Interview Bot", test_interview_bot),
        ("Emotion Analysis", test_emotion_analysis),
        ("Report Generator", test_report_generator),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"Testing {test_name}...")
        if test_func():
            passed += 1
    
    print("\n" + "=" * 40)
    print(f"Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("All tests passed! ML service is ready.")
        return 0
    else:
        print("Some tests failed. Check the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
