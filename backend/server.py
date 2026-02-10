from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import json
from emergentintegrations.llm.chat import LlmChat, UserMessage


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Startup check for LLM key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.info(f"EMERGENT_LLM_KEY present: {bool(EMERGENT_LLM_KEY)}")
if EMERGENT_LLM_KEY:
    logger.info(f"EMERGENT_LLM_KEY format: {EMERGENT_LLM_KEY[:15]}...")

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])


# Seedling LLM Enrichment Models
class AssessmentData(BaseModel):
    answers: List[int]
    scores: Dict[str, int]
    primary_style: str
    secondary_style: str
    language: str = "en"
    micro_challenge: Optional[Dict[str, Any]] = None

class EnrichmentResponse(BaseModel):
    why_this_fits: str
    deeper_watchouts: List[str]
    personalized_next_steps: str
    micro_challenge_insight: Optional[str] = None
    shareable_summary: str

# LLM Enrichment Endpoint
@api_router.post("/enrich-insights", response_model=EnrichmentResponse)
async def enrich_insights(data: AssessmentData):
    """Generate personalized insights using LLM based on assessment results"""
    try:
        # Get API key
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="LLM API key not configured")
        
        # Create system prompt with safety guardrails
        system_message = """You are an empathetic self-reflection guide for Seedling, a platform helping Gen-Z youth understand themselves better.

CRITICAL RULES:
- Use VERY simple language (10th grade level)
- NO diagnosis, labels, or predictions
- NO motivational fluff or therapy talk
- Be honest but encouraging
- Focus on actions, not theory
- Respect user's intelligence

OUTPUT FORMAT: Strict JSON only, no markdown
{
  "why_this_fits": "2-3 sentences explaining why their result makes sense based on their answers",
  "deeper_watchouts": ["3 specific, actionable watch-outs based on their pattern"],
  "personalized_next_steps": "One concrete action they can take this week",
  "micro_challenge_insight": "If they completed a challenge, give specific feedback",
  "shareable_summary": "1 sentence they can share: 'I learned...' format"
}"""
        
        # Build user message with anonymized data
        user_content = f"""Assessment Results:
Primary Style: {data.primary_style}
Secondary Style: {data.secondary_style}
Category Scores: {json.dumps(data.scores)}
Language: {data.language}

Generate personalized insights in {data.language}. Be specific to their score pattern."""
        
        if data.micro_challenge:
            user_content += f"\n\nMicro-Challenge Completed: {json.dumps(data.micro_challenge)}"
        
        # Initialize LLM chat
        chat = LlmChat(
            api_key=api_key,
            session_id=f"seedling-{uuid.uuid4()}",
            system_message=system_message
        ).with_model("openai", "gpt-5.2")
        
        # Send message and get response
        user_message = UserMessage(text=user_content)
        response = await chat.send_message(user_message)
        
        # Parse JSON response
        try:
            enriched_data = json.loads(response)
            return EnrichmentResponse(**enriched_data)
        except json.JSONDecodeError:
            # Fallback if LLM doesn't return valid JSON
            logger.error(f"Invalid JSON from LLM: {response}")
            return EnrichmentResponse(
                why_this_fits="Your results reflect your current self-awareness patterns.",
                deeper_watchouts=["Stay curious about your growth areas", "Practice self-reflection regularly", "Be honest with yourself"],
                personalized_next_steps="Pick one small action from your results and try it this week.",
                shareable_summary="I learned something new about how I work best."
            )
    
    except Exception as e:
        logger.error(f"LLM enrichment error: {str(e)}")
        # Graceful degradation - return base insights
        return EnrichmentResponse(
            why_this_fits="Your results show your current self-reflection.",
            deeper_watchouts=["Review your strengths regularly", "Work on one growth area at a time", "Be patient with yourself"],
            personalized_next_steps="Choose one action from your results to focus on.",
            shareable_summary="I completed my Seedling self-reflection assessment."
        )

# Anonymous Analytics Endpoint (optional - stores aggregated data only)
@api_router.post("/analytics/record")
async def record_analytics(data: Dict[str, Any]):
    """Store anonymous aggregated analytics"""
    try:
        # Only store non-PII data
        analytics_doc = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "primary_style": data.get("primary_style"),
            "challenge_selected": data.get("challenge_selected"),
            "language": data.get("language"),
            # No personal data, no raw answers
        }
        await db.analytics.insert_one(analytics_doc)
        return {"status": "recorded"}
    except Exception as e:
        logger.error(f"Analytics error: {str(e)}")
        return {"status": "skipped"}

    
    return status_checks

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()