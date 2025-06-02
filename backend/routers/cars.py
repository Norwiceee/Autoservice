from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import asyncpg
from typing import Optional

router = APIRouter()

class CarModel(BaseModel):
    client_id: int
    make: str
    model: str
    year: Optional[int] = None
    license_plate: Optional[str] = None
    vin: Optional[str] = None
    color: Optional[str] = None
    mileage: Optional[int] = 0
    status: Optional[str] = "active"

class CarUpdate(BaseModel):
    make: str = None
    model: str = None
    year: int = None
    license_plate: str = None

@router.post("/cars", summary="Добавление автомобиля клиента")
async def create_car(car: CarModel, request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        try:
            result = await conn.fetchrow(
                """
                INSERT INTO cars (client_id, make, model, year, license_plate, vin, color, mileage, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING id, client_id, make, model, year, license_plate, vin, color, mileage, status
                """,
                car.client_id, car.make, car.model, car.year, car.license_plate,
                car.vin, car.color, car.mileage, car.status
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    return dict(result)

@router.get("/cars", summary="Список всех автомобилей")
async def get_cars(request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT id, client_id, make, model, year, license_plate, vin, color, mileage, status FROM cars"
        )
    return [dict(row) for row in rows]

@router.get("/cars/{car_id}", summary="Информация об автомобиле")
async def get_car(car_id: int, request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        car = await conn.fetchrow(
            "SELECT id, client_id, make, model, year, license_plate, vin, color, mileage, status FROM cars WHERE id=$1",
            car_id
        )
        if not car:
            raise HTTPException(status_code=404, detail="Car not found")
    return dict(car)

@router.get("/clients/{client_id}/cars", summary="Автомобили клиента")
async def get_cars_by_client(client_id: int, request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT id, client_id, make, model, year, license_plate, vin, color, mileage, status FROM cars WHERE client_id=$1",
            client_id
        )
    return [dict(row) for row in rows]


@router.put("/cars/{car_id}", summary="Обновление данных автомобиля")
async def update_car(car_id: int, car: CarUpdate, request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        existing = await conn.fetchrow("SELECT * FROM cars WHERE id=$1", car_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Car not found")
        update_fields = []
        values = []
        if car.make is not None:
            update_fields.append("make=$" + str(len(values)+1))
            values.append(car.make)
        if car.model is not None:
            update_fields.append("model=$" + str(len(values)+1))
            values.append(car.model)
        if car.year is not None:
            update_fields.append("year=$" + str(len(values)+1))
            values.append(car.year)
        if car.license_plate is not None:
            update_fields.append("license_plate=$" + str(len(values)+1))
            values.append(car.license_plate)
        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")
        values.append(car_id)
        query = f"UPDATE cars SET {', '.join(update_fields)} WHERE id=${len(values)}"
        await conn.execute(query, *values)
    return {"message": "Car updated successfully"}

@router.delete("/cars/{car_id}", summary="Удаление автомобиля")
async def delete_car(car_id: int, request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM cars WHERE id=$1", car_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Car not found")
    return {"message": "Car deleted successfully"}
