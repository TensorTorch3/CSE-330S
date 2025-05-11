# main.py
import os
import sys
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Add the parent directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.routers import auth
from backend.routers import user
from backend.routers import findstock
from backend.routers import investment_grade
from backend.routers import user_stocks
from backend.routers import stock_chart

app = FastAPI(debug=True)

origins = [
    "http://localhost:5173",
    # Add more origins here
]

# Adding CORS middleware which is a security measure
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Includes routers that we made in auth.py and user.py
app.include_router(user.router)
app.include_router(auth.router, prefix="/auth")
app.include_router(findstock.router, prefix = "/findstock")
app.include_router(investment_grade.router, prefix = "/investment")
app.include_router(user_stocks.router, prefix = "/user-stocks")
app.include_router(stock_chart.router, prefix = "/stock-chart")

if __name__ == "__main__":
    # The application can now be run directly:
    # python main.py
    # or as a module:
    # python -m backend.main
    # or with uvicorn:
    # uvicorn main:app --reload
    uvicorn.run(app, host="0.0.0.0", port=8000)
