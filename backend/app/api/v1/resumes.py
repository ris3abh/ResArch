# app/api/v1/resumes.py
from fastapi import APIRouter, Depends, HTTPException, Response, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_active_user
from app.schemas.resume import LatexCompileRequest
from app.utils.latex import LatexCompiler
from app.models.user import User

router = APIRouter()

# app/api/v1/resumes.py
@router.post("/compile")
async def compile_latex(
    request: LatexCompileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    try:
        pdf_content = await LatexCompiler.compile_latex(
            content=request.content
        )
        
        return Response(
            content=pdf_content,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "inline; filename=preview.pdf",
                "Content-Type": "application/pdf",
                # Add CORS headers if needed
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error during compilation: {str(e)}"
        )