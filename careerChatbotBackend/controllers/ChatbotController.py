from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import logging

from services.GeminiService import GeminiService

router = APIRouter()

class Message(BaseModel):
    msg: str

gemini_service = GeminiService()

@router.post("/get_response")
async def get_response(message: Message):
    """
    Only respond if the message is about career/future planning.
    Otherwise, return a 'not relevant' message.
    """
    try:
        category = gemini_service.classify_career_planning(message.msg)
        print(category)

        if category == "career":
            response = gemini_service.get_career_response(message.msg)
            return JSONResponse(content={"response": response})
        else:
            return JSONResponse(
                content={"response": "I'm sorry, I only handle career or future planning questions."},
                status_code=200
            )

    except Exception as e:
        logging.error(f"Error while processing the chat message: {e}")
        raise HTTPException(status_code=500, detail="Error processing request.")
