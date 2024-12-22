# app/utils/latex.py
import os
import tempfile
import subprocess
from pathlib import Path
from fastapi import HTTPException

class LatexCompiler:
    @staticmethod
    async def compile_latex(content: str) -> bytes:
        # Create a temporary directory with a random name
        temp_dir = tempfile.mkdtemp()
        tex_path = os.path.join(temp_dir, "temp.tex")
        
        try:
            # Write the LaTeX content to temp file
            with open(tex_path, 'w') as f:
                f.write(content)

            # Compile to PDF
            process = subprocess.run(
                [
                    'pdflatex',
                    '-interaction=nonstopmode',
                    '-halt-on-error',
                    tex_path
                ],
                cwd=temp_dir,
                capture_output=True,
                text=True
            )

            pdf_path = os.path.join(temp_dir, "temp.pdf")
            log_path = os.path.join(temp_dir, "temp.log")

            if process.returncode != 0:
                # Get error from log if available
                error_msg = "LaTeX compilation failed"
                if os.path.exists(log_path):
                    with open(log_path, 'r') as f:
                        log_content = f.read()
                        if '!' in log_content:
                            error_msg = log_content.split('!')[1].split('\n')[0]
                raise HTTPException(status_code=400, detail=error_msg)

            # Read the generated PDF
            if os.path.exists(pdf_path):
                with open(pdf_path, 'rb') as f:
                    return f.read()
            else:
                raise HTTPException(
                    status_code=500, 
                    detail="PDF file was not generated"
                )

        finally:
            # Cleanup all temporary files
            for ext in ['.tex', '.aux', '.log', '.pdf', '.out']:
                file_path = os.path.join(temp_dir, f"temp{ext}")
                if os.path.exists(file_path):
                    os.remove(file_path)
            try:
                os.rmdir(temp_dir)
            except OSError:
                pass