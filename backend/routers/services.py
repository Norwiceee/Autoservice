from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
import asyncpg
from routers.auth import get_current_user

router = APIRouter(dependencies=[Depends(get_current_user)])

class ServiceModel(BaseModel):
    name: str
    description: str = None
    price: float
    category_id: int
    duration: int = None

@router.post("/services", summary="Создание услуги")
async def create_service(service: ServiceModel, request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        try:
            result = await conn.fetchrow(
                """
                INSERT INTO services (name, description, price, category_id, duration)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, name, description, price, category_id, duration
                """,
                service.name, service.description, service.price, service.category_id, service.duration
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    return dict(result)


@router.get("/services", summary="Список услуг")
async def get_services(request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, name, description, price, category_id, duration FROM services")
    return [dict(row) for row in rows]


@router.get("/services/{service_id}", summary="Получить услугу")
async def get_service(service_id: int, request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        service = await conn.fetchrow(
            "SELECT id, name, description, price FROM services WHERE id=$1",
            service_id
        )
        if not service:
            raise HTTPException(status_code=404, detail="Service not found")
    return dict(service)

@router.put("/services/{service_id}", summary="Обновление услуги")
async def update_service(service_id: int, service: ServiceModel, request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        existing = await conn.fetchrow("SELECT * FROM services WHERE id=$1", service_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Service not found")
        await conn.execute(
            "UPDATE services SET title=$1, description=$2, price=$3 WHERE id=$4",
            service.name, service.description, service.price, service_id
        )
    return {"message": "Service updated successfully"}

@router.delete("/services/{service_id}", summary="Удаление услуги")
async def delete_service(service_id: int, request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM services WHERE id=$1", service_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Service not found")
    return {"message": "Service deleted successfully"}
