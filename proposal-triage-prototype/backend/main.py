from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

try:
    from .pipeline import run_pipeline
    from .proposals import SAMPLE_PROPOSALS
except ImportError:
    from pipeline import run_pipeline
    from proposals import SAMPLE_PROPOSALS


app = FastAPI(title="Proposal Triage Prototype")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EvaluateRequest(BaseModel):
    proposal_id: str


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "service": "Proposal Triage Prototype"
    }


@app.get("/api/proposals")
async def list_proposals():
    return {
        "proposals": [
            {
                "id": proposal_id,
                "company_name": proposal.get("company_name")
            }
            for proposal_id, proposal in SAMPLE_PROPOSALS.items()
        ]
    }


@app.post("/api/evaluate")
async def evaluate_proposal(request: EvaluateRequest):
    try:
        result = run_pipeline(request.proposal_id)
        return result
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"


@app.get("/", include_in_schema=False)
async def serve_frontend():
    index_file = FRONTEND_DIR / "index.html"

    if index_file.exists():
        return FileResponse(index_file)

    return {
        "message": "Frontend not found. Make sure you run the app from the project root."
    }


if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")