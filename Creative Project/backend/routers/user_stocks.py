from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.auth.auth_handler import get_current_active_user
from backend.database import get_db
from backend.models import User, UserStock
from backend.schemas import UserStockCreate, UserStockResponse

router = APIRouter()

@router.post("/", response_model=UserStockResponse)
async def save_stock(
    stock: UserStockCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Save a stock to the user's history.
    """
    # Check if the stock already exists for this user
    existing_stock = db.query(UserStock).filter(
        UserStock.user_id == current_user.id,
        UserStock.ticker == stock.ticker
    ).first()
    
    if existing_stock:
        # If it exists, return it
        return existing_stock
    
    # Create a new UserStock
    db_stock = UserStock(
        user_id=current_user.id,
        ticker=stock.ticker,
        name=stock.name
    )
    
    # Add it to the database
    db.add(db_stock)
    db.commit()
    db.refresh(db_stock)
    
    return db_stock

@router.get("/", response_model=List[UserStockResponse])
async def get_user_stocks(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all stocks in the user's history.
    """
    stocks = db.query(UserStock).filter(UserStock.user_id == current_user.id).all()
    return stocks

@router.delete("/{stock_id}", response_model=dict)
async def remove_stock(
    stock_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Remove a stock from the user's history.
    """
    # Get the stock
    stock = db.query(UserStock).filter(
        UserStock.id == stock_id,
        UserStock.user_id == current_user.id
    ).first()
    
    # Check if the stock exists
    if not stock:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock not found in user's history"
        )
    
    # Delete the stock
    db.delete(stock)
    db.commit()
    
    return {"message": "Stock removed from history"}