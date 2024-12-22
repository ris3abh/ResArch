import os
import subprocess

def convert_latex_to_pdf(latex_filepath: str, output_directory: str = None) -> str:
    """
    Converts a LaTeX (.tex) file to a PDF using pdflatex.
    """
    
    # Validate the LaTeX file path
    if not os.path.isfile(latex_filepath):
        raise FileNotFoundError(f"The file '{latex_filepath}' does not exist.")
    
    if not latex_filepath.endswith(".tex"):
        raise ValueError("The input file must be a LaTeX (.tex) file.")
    
    # Get the directory and filename
    latex_directory = os.path.dirname(latex_filepath)
    latex_filename = os.path.basename(latex_filepath)
    
    # If output_directory is None or empty, use the LaTeX file directory
    if not output_directory:
        output_directory = latex_directory if latex_directory else '.'
    
    if not os.path.isdir(output_directory):
        raise NotADirectoryError(f"The directory '{output_directory}' does not exist.")
    
    # Change to the directory containing the LaTeX file
    original_directory = os.getcwd()
    os.chdir(latex_directory if latex_directory else '.')
    
    try:
        # Run the pdflatex command
        command = [
            'pdflatex',
            '-interaction=nonstopmode',
            '-output-directory', output_directory,
            latex_filename
        ]
        
        print(f"Running command: {' '.join(command)}")  # Debug print
        result = subprocess.run(command, capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"stdout: {result.stdout}")  # Debug print
            print(f"stderr: {result.stderr}")  # Debug print
            error_message = result.stderr if result.stderr else "An unknown error occurred."
            raise RuntimeError(f"pdflatex failed to generate PDF. Error message:\n{error_message}")
        
        # Get the PDF path
        pdf_filename = os.path.splitext(latex_filename)[0] + ".pdf"
        pdf_path = os.path.join(output_directory, pdf_filename)
        
        if not os.path.isfile(pdf_path):
            raise FileNotFoundError(f"The PDF file '{pdf_path}' was not created.")
        
        return pdf_path
    
    finally:
        # Change back to the original directory
        os.chdir(original_directory)

if __name__ == "__main__":
    try:
        # Get current directory
        current_dir = os.getcwd()
        print(f"Current directory: {current_dir}")  # Debug print
        
        # Test file paths
        latex_path = "./test.tex"
        output_dir = "."
        
        print(f"Converting {latex_path} to PDF...")  # Debug print
        pdf_path = convert_latex_to_pdf(latex_path, output_dir)
        print(f"PDF successfully created at: {pdf_path}")
        
    except Exception as e:
        print(f"Error: {e}")