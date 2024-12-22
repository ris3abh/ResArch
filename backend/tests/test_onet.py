import pandas as pd
import requests

def download_onet_database():
    # Latest database version URL
    url = "https://www.onetcenter.org/dl_files/database/db_27_3_excel.zip"
    # Download and extract relevant tables
    skills_df = pd.read_excel("Skills.xlsx")
    abilities_df = pd.read_excel("Abilities.xlsx")
    return skills_df, abilities_df

skills_df, abilities_df = download_onet_database()

print(skills_df.head())
print(abilities_df.head())