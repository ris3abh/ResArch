import os
import subprocess
import tempfile
import re


def sanitize_latex_error_message(message: str) -> str:
    """
    Extract meaningful LaTeX error messages from pdflatex output.
    Removes system paths and internal log details.
    """
    # Extract the most common errors
    error_patterns = [
        r"! LaTeX Error: (.*)",  # Capture LaTeX-specific errors
        r"! Undefined control sequence\.\s*(.*)",  # Undefined commands
        r"! Missing number, treated as zero\.",  # Missing number
        r"! Missing \\\\[A-Za-z]+",  # Missing \begin, \end, etc.
        r"! Extra \\\\[A-Za-z]+",  # Extra \end or similar
        r"l\.(\d+) (.*)",  # Line number errors
    ]
    
    extracted_errors = []
    for pattern in error_patterns:
        matches = re.findall(pattern, message)
        for match in matches:
            if isinstance(match, tuple):
                extracted_errors.append(f"Line {match[0]}: {match[1]}")
            else:
                extracted_errors.append(match)
    
    # Limit to first 5 unique errors to avoid information overload
    extracted_errors = list(dict.fromkeys(extracted_errors))[:5]
    return "\n".join(extracted_errors) if extracted_errors else "Unknown LaTeX error."


def convert_latex_to_pdf(latex_filepath: str, output_directory: str = None, compile_timeout: int = 30) -> str:
    """
    Converts a LaTeX (.tex) file to a PDF using pdflatex, while handling errors gracefully.
    Runs pdflatex twice to resolve cross-references.

    Args:
        latex_filepath (str): Path to the LaTeX file
        output_directory (str, optional): Directory for output files
        compile_timeout (int): Time limit for compilation (in seconds)
    
    Returns:
        str: Path to the generated PDF file
    
    Raises:
        RuntimeError: If the LaTeX file cannot be compiled
    """
    if not os.path.isfile(latex_filepath):
        raise FileNotFoundError(f"The file '{latex_filepath}' does not exist.")

    if not latex_filepath.endswith(".tex"):
        raise ValueError("The input file must be a LaTeX (.tex) file.")
    
    latex_directory = os.path.dirname(latex_filepath)
    latex_filename = os.path.basename(latex_filepath)
    
    if not output_directory:
        output_directory = latex_directory if latex_directory else '.'
    
    if not os.path.isdir(output_directory):
        raise NotADirectoryError(f"The directory '{output_directory}' does not exist.")
    
    original_directory = os.getcwd()
    os.chdir(latex_directory if latex_directory else '.')
    
    try:
        command = [
            'pdflatex',
            '-interaction=nonstopmode',
            '-output-directory', output_directory,
            latex_filename
        ]
        
        for i in range(2):  # Run pdflatex twice to ensure references are resolved
            try:
                result = subprocess.run(command, capture_output=True, text=True, timeout=compile_timeout)
            except subprocess.TimeoutExpired:
                raise RuntimeError("PDF generation timed out. Please check your LaTeX file for long-running tasks.")
            
            if result.returncode != 0:
                error_message = sanitize_latex_error_message(result.stderr)
                raise RuntimeError(f"LaTeX compilation failed: {error_message}")
        
        pdf_filename = os.path.splitext(latex_filename)[0] + ".pdf"
        pdf_path = os.path.join(output_directory, pdf_filename)
        
        if not os.path.isfile(pdf_path):
            raise FileNotFoundError(f"The PDF file '{pdf_path}' was not created.")
        
        return pdf_path
    finally:
        os.chdir(original_directory)