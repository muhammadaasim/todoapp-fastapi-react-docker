# main.py
from fastapi import FastAPI
from backend.db import lifespan
from backend.routers import todos
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    lifespan=lifespan,
    title="Hello World API with DB",
    version="0.0.1",
    servers=[
        {
            "url": "http://127.0.0.1:8000",  # ADD NGROK URL Here Before Creating GPT Action
            "description": "Development Server",
        }
    ],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the Todos router
app.include_router(todos.router, prefix="/todos", tags=["Todos"])


@app.get("/")
def read_root():
    return {"Message": "Backend Server has been started successfully 🚀🚀"}
