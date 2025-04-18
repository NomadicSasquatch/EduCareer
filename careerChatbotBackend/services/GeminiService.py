import logging
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.adapters.openai import convert_openai_messages
from dotenv import load_dotenv
import os

# Additional imports for the PDF functionality
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.vectorstores import InMemoryVectorStore

load_dotenv(dotenv_path='.env')
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')

class GeminiService:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            temperature=0,
            model="gemini-1.5-pro",
            convert_system_message_to_human=True,
            google_api_key=GOOGLE_API_KEY
        )

    def classify_career_planning(self, prompt: str) -> str:
        """
        Classify whether the user prompt is about career planning / future planning
        or something else. Return 'career' if yes, or 'other' if no.
        """
        try:
            classification_prompt = [
                {
                    "role": "system",
                    "content": (
                        "You are an assistant that classifies user queries. "
                        "You ONLY care if the query is about career or future planning."
                    )
                },
                {
                    "role": "user",
                    "content": (
                        f'Classify the following input:\n\n"{prompt}"\n\n'
                        "Reply with one word:\n"
                        "- 'career' if it is about career advice, job search, professional development, future planning.\n"
                        "- 'other' if it is not about career or future planning."
                    )
                }
            ]

            lc_messages = convert_openai_messages(classification_prompt)
            classification_response = self.llm.invoke(lc_messages).content.strip().lower()
            # If the response contains "career", treat it as a "career" topic.
            if "career" in classification_response:
                return "career"
            else:
                return "other"

        except Exception as e:
            logging.error(f"Error in classify_career_planning: {e}")
            return "other"

    def get_career_response(self, user_prompt: str) -> str:
        """
        Generate a thorough response about career/future planning.
        """
        try:
            conversation_prompt = [
                {
                    "role": "system",
                    "content": (
                        "You are a helpful career coach providing thoughtful advice and resources "
                        "for career planning, job searching, and professional development. "
                        "If the user's question is definitely about career or future planning, "
                        "offer valuable insights and specific strategies."
                    )
                },
                {
                    "role": "user",
                    "content": user_prompt
                }
            ]
            messages = convert_openai_messages(conversation_prompt)
            response = self.llm.invoke(messages).content
            return response
        except Exception as e:
            logging.error(f"Error in get_career_response: {e}")
            return f"Error: {str(e)}"
        
    # def get_gemini_response(self, msg: str, content: str) -> str:
    #     try:
    #         # Reuse same LLM or instantiate new if needed
    #         llm = self.llm

    #         prompt = [
    #             {"role": "system", "content": "You are a friendly teacher ..."},
    #             {"role": "user", "content": f'Strictly follow these instructions... info: """{content}"""\n\nUser query: "{msg}"'}
    #         ]
    #         lc_messages = convert_openai_messages(prompt)
    #         response = llm.invoke(lc_messages).content
    #         return response or "I couldn't find a suitable response."
    #     except Exception as e:
    #         logging.error(f"Error in get_gemini_response: {e}")
    #         return f"Error: {str(e)}"

    # async def get_gemini_response2(self, msg: str) -> str:
    #     try:
    #         file_path = "C:/path/to/your/petcarebackenddocumentation.pdf"
    #         loader = PyPDFLoader(file_path)
    #         pages = []
    #         async for page in loader.alazy_load():
    #             pages.append(page)

    #         embeddings = GoogleGenerativeAIEmbeddings(
    #             model="models/embedding-001",
    #             google_api_key=GOOGLE_API_KEY
    #         )
    #         vector_store = InMemoryVectorStore.from_documents(pages, embeddings)
    #         docs = vector_store.similarity_search(msg, k=5)
            
    #         # Build your prompt
    #         prompt = [
    #             {"role": "system", "content": "You are a helpful chatbot assistant..."},
    #             {"role": "user", "content": f'Information: """{docs}"""\n\nUser query: "{msg}"'}
    #         ]
    #         llm = self.llm
    #         lc_messages = convert_openai_messages(prompt)
    #         report = llm.invoke(lc_messages).content
    #         return report
    #     except Exception as e:
    #         logging.error(f"Error in get_gemini_response2: {e}")
    #         return f"Error: {str(e)}"
