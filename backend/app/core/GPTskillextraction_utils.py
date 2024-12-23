from PyPDF2 import PdfReader
from groq import Groq
import openai
import re
import os
from typing import List, Tuple
import json
from enum import Enum
from app.models.skills import SkillCategory


def extract_resume_content(file_path: str, file_type: str = "pdf") -> str:
    """
    Extracts relevant content from a resume file, focusing on skill-related sections and bullet points.
    """
    # Read file content
    content = ""
    if file_type.lower() == "pdf":
        reader = PdfReader(file_path)
        content = " ".join(page.extract_text() for page in reader.pages if page.extract_text())
    elif file_type.lower() == "tex":
        with open(file_path, "r") as file:
            content = file.read()

    if not content.strip():
        return "No content extracted from the file."

    # Synonyms for skill sections
    skill_section_synonyms = [
        "skills", "expertise", "technologies", "competencies", "strengths", "proficiencies"
    ]
    skill_pattern = "|".join(skill_section_synonyms)

    # Search for the section and bullet points
    skills_section = re.search(
        rf"({skill_pattern})[\s\S]*?(?=\n\n|\Z)", content, re.IGNORECASE
    )
    bullet_points = re.findall(r"(?:[-*•])\s*(.+)", content)  # Catch bullet points
    
    extracted_content = ""
    if skills_section:
        extracted_content += skills_section.group(0)
    if bullet_points:
        extracted_content += "\n" + "\n".join(bullet_points)

    # Return extracted content or notify of an empty extraction
    return extracted_content.strip() if extracted_content else "No relevant content found."

def gpt_extract_skills(resume_content: str) -> dict:
    """
    Uses GPT to extract and categorize skills from resume content, ensuring JSON validation.
    """
    openai.api_key = os.getenv("OPENAI_API_KEY")
    if not openai.api_key:
        raise ValueError("OpenAI API Key is not set in the environment.")

    prompt = f"""
    You are an expert at analyzing resumes. Given the text below, identify and categorize the skills into the following categories:

    1. **Technical Skills**: Include programming languages, frameworks, tools, and technical expertise.
    2. **Soft Skills**: Include communication, teamwork, leadership, and other interpersonal skills.
    3. **Hard Skills**: Include specific, measurable abilities like project management, data analysis, or budgeting.

    Resume Text:
    {resume_content}

    Provide the output in JSON format with the structure:
    {{
      "technical_skills": ["Skill1", "Skill2", ...],
      "soft_skills": ["Skill1", "Skill2", ...],
      "hard_skills": ["Skill1", "Skill2", ...]
    }}
    """
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
        )
        raw_output = response.choices[0].message.content

        # Extract JSON from the output
        json_text = re.search(r"{[\s\S]*}", raw_output).group(0)
        parsed_output = json.loads(json_text)
        return parsed_output
    except (AttributeError, json.JSONDecodeError):
        raise ValueError("GPT output did not return valid JSON.")
    except Exception as e:
        raise ValueError(f"An error occurred with GPT: {str(e)}")
    


def llama_extract_skills_groq(resume_content: str, client: Groq, model: str) -> list:
    """
    Uses Groq API with Llama to extract and categorize skills from resume content.
    Returns a flattened list of skills with their categories.
    """
    prompt = f"""
    You are an expert at analyzing resumes. Given the text below, identify and categorize the skills into the following categories:

    1. **Technical Skills**: Include programming languages, frameworks, tools, and technical expertise.
    2. **Soft Skills**: Include communication, teamwork, leadership, and other interpersonal skills.
    3. **Hard Skills**: Include specific, measurable abilities like project management, data analysis, or budgeting.

    Resume Text:
    {resume_content}

    Provide the output in JSON format with the structure:
    {{
        "technical_skills": ["Skill1", "Skill2", ...],
        "soft_skills": ["Skill1", "Skill2", ...],
        "hard_skills": ["Skill1", "Skill2", ...]
    }}
    """

    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a professional skill extractor that provides output strictly in the requested JSON format."},
                {"role": "user", "content": prompt}
            ],
            model=model,
            temperature=0.1,  # Low temperature for consistent, structured output
            max_tokens=500
        )

        # Get the response and parse JSON
        response_text = response.choices[0].message.content
        # Extract JSON from the response (in case there's any extra text)
        json_str = response_text[response_text.find('{'):response_text.rfind('}')+1]
        skills_data = json.loads(json_str)

        # Convert the categorized skills into a list of tuples (skill, category)
        categorized_skills = []
        for skill in skills_data.get('technical_skills', []):
            categorized_skills.append((skill, SkillCategory.TECHNICAL))
        for skill in skills_data.get('soft_skills', []):
            categorized_skills.append((skill, SkillCategory.SOFT))
        for skill in skills_data.get('hard_skills', []):
            categorized_skills.append((skill, SkillCategory.HARD))

        return categorized_skills

    except json.JSONDecodeError as e:
        raise ValueError(f"Error parsing JSON response: {str(e)}")
    except Exception as e:
        raise ValueError(f"Error processing skills with Groq: {str(e)}")