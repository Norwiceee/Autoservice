from fastapi import FastAPI
import asyncpg
import config
from routers.clients import router as clients_router
from routers.cars import router as cars_router
from routers.services import router as services_router
from routers.appointments import router as appointments_router
from routers.auth import router as auth_router

# Новые роутеры
from routers.employees import router as employees_router
from routers.parts import router as parts_router
from routers.categories import router as categories_router
from routers.reviews import router as reviews_router

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Auto Service API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    app.state.pool = await asyncpg.create_pool(config.DATABASE_URL)

@app.on_event("shutdown")
async def shutdown():
    await app.state.pool.close()

# Регистрируем роутеры
app.include_router(auth_router)
app.include_router(clients_router)
app.include_router(cars_router)
app.include_router(services_router)
app.include_router(appointments_router)
app.include_router(employees_router)
app.include_router(parts_router)
app.include_router(categories_router)
app.include_router(reviews_router)
