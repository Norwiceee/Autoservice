from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt
import config
from pydantic import BaseModel
from passlib.hash import bcrypt

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

class RegisterRequest(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

@router.post("/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), request: Request = None):
    pool = request.app.state.pool
    user = await pool.fetchrow("SELECT * FROM users WHERE username=$1", form_data.username)
    if not user or not pwd_context.verify(form_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Неверные учетные данные")
    access_token_expires = timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": user["username"]}
    expire = datetime.utcnow() + access_token_expires
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, config.SECRET_KEY, algorithm=config.ALGORITHM)
    return {"access_token": token, "token_type": "bearer", "username": user["username"], "user_id": user["id"]}

# Регистрация пользователя
@router.post("/auth/register")
async def register(data: RegisterRequest, request: Request):
    pool = request.app.state.pool
    existing = await pool.fetchrow("SELECT id FROM users WHERE username=$1", data.username)
    if existing:
        raise HTTPException(status_code=400, detail="Пользователь уже существует")
    hash_ = pwd_context.hash(data.password)
    await pool.execute("INSERT INTO users (username, password_hash) VALUES ($1, $2)", data.username, hash_)
    return {"msg": "Пользователь успешно зарегистрирован"}

# Логин пользователя
@router.post("/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), request: Request = None):
    pool = request.app.state.pool
    user = await pool.fetchrow("SELECT * FROM users WHERE username=$1", form_data.username)
    if not user or not pwd_context.verify(form_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Неверные учетные данные")
    access_token_expires = timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": user["username"]}
    expire = datetime.utcnow() + access_token_expires
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, config.SECRET_KEY, algorithm=config.ALGORITHM)
    return {"access_token": token, "token_type": "bearer"}

# Получение текущего пользователя
async def get_current_user(token: str = Depends(oauth2_scheme), request: Request = None):
    credentials_exception = HTTPException(
        status_code=401, detail="Не удалось проверить токен",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, config.SECRET_KEY, algorithms=[config.ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception
    # Проверяем что пользователь есть в базе
    pool = request.app.state.pool
    user = await pool.fetchrow("SELECT * FROM users WHERE username=$1", username)
    if not user:
        raise credentials_exception
    return user
