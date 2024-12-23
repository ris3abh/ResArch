# app/core/skill_categorization.py
import json
import os
from pathlib import Path
from typing import Dict, List, Optional
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from app.models.skills import SkillCategory

class SkillCategorizer:
    def __init__(self):
        self.nlp = spacy.load("en_core_web_md")  # Medium-sized English model with word vectors
        self.skills_data = self._load_skills_data()
        self.vectorizer = TfidfVectorizer(stop_words='english')
        
        # Create vectorized representations of our known skills
        self.tech_vectors = self._vectorize_skills(self.skills_data['tech'])
        self.soft_vectors = self._vectorize_skills(self.skills_data['soft'])
        self.hard_vectors = self._vectorize_skills(self.skills_data['hard'])

    def _load_skills_data(self) -> Dict[str, List[Dict]]:
        """Load skills data from JSON files."""
        data_dir = Path(__file__).parent.parent / 'data'
        
        with open(data_dir / 'techstack.json', 'r') as f:
            tech_skills = json.load(f)
        with open(data_dir / 'softskills.json', 'r') as f:
            soft_skills = json.load(f)
        with open(data_dir / 'hardskills.json', 'r') as f:
            hard_skills = json.load(f)
            
        return {
            'tech': tech_skills,
            'soft': soft_skills,
            'hard': hard_skills
        }

    def _vectorize_skills(self, skills_list: List[Dict]) -> np.ndarray:
        """Create TF-IDF vectors for a list of skills."""
        # Combine skill names and descriptions for better context
        texts = [f"{item.get('skill', item.get('technology', ''))} {item['description']}" 
                for item in skills_list]
        return self.vectorizer.fit_transform(texts)

    def _get_similarity_scores(self, skill: str) -> Dict[str, float]:
        """Calculate similarity scores for a skill against each category."""
        # Preprocess the input skill
        skill_doc = self.nlp(skill.lower())
        skill_vector = self.vectorizer.transform([skill_doc.text])

        # Calculate cosine similarity with each category
        tech_sim = cosine_similarity(skill_vector, self.tech_vectors).max()
        soft_sim = cosine_similarity(skill_vector, self.soft_vectors).max()
        hard_sim = cosine_similarity(skill_vector, self.hard_vectors).max()

        return {
            'tech': float(tech_sim),
            'soft': float(soft_sim),
            'hard': float(hard_sim)
        }

    def _check_exact_matches(self, skill: str) -> Optional[SkillCategory]:
        """Check for exact matches in our skills data."""
        skill_lower = skill.lower()
        
        # Check in tech skills
        if any(s.get('technology', '').lower() == skill_lower for s in self.skills_data['tech']):
            return SkillCategory.TECHNICAL
            
        # Check in soft skills
        if any(s['skill'].lower() == skill_lower for s in self.skills_data['soft']):
            return SkillCategory.SOFT
            
        # Check in hard skills
        if any(s['skill'].lower() == skill_lower for s in self.skills_data['hard']):
            return SkillCategory.HARD
            
        return None

    def infer_category(self, skill_name: str) -> SkillCategory:
        """
        Infer the category of a skill using NLP techniques.
        
        Args:
            skill_name: The name of the skill to categorize
            
        Returns:
            SkillCategory: The inferred category of the skill
        """
        # First check for exact matches
        exact_match = self._check_exact_matches(skill_name)
        if exact_match is not None:
            return exact_match

        # Calculate similarity scores
        similarity_scores = self._get_similarity_scores(skill_name)
        
        # Get the category with the highest similarity score
        max_category = max(similarity_scores.items(), key=lambda x: x[1])
        
        # Map the category to SkillCategory enum
        category_mapping = {
            'tech': SkillCategory.TECHNICAL,
            'soft': SkillCategory.SOFT,
            'hard': SkillCategory.HARD
        }
        
        # If the highest similarity score is too low, default to HARD
        if max_category[1] < 0.1:  # Threshold can be adjusted
            return SkillCategory.HARD
            
        return category_mapping[max_category[0]]

# Create a singleton instance
categorizer = SkillCategorizer()

def infer_skill_category(skill_name: str) -> SkillCategory:
    """
    Wrapper function to infer skill category using the singleton categorizer instance.
    """
    return categorizer.infer_category(skill_name)