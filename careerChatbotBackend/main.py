from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controllers.ChatbotController import router as chatbot_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(chatbot_router, prefix="/chatbot", tags=["chatbot"])

@app.get("/")
def read_root():
    return {"message": "Career Chatbot is running!"}
