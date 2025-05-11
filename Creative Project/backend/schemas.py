# schemas.py
from pydantic import BaseModel
from typing import List


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserResponse(BaseModel):
    username: str
    email: str | None = None

class UserInDB(UserResponse):
    hashed_password: str

class UserStockBase(BaseModel):
    ticker: str
    name: str

class UserStockCreate(UserStockBase):
    pass

class UserStock(UserStockBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True

class UserStockResponse(UserStockBase):
    id: int

    class Config:
        orm_mode = True
