from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from datetime import datetime
import asyncpg

router = APIRouter()

class AppointmentModel(BaseModel):
    client_id: int
    car_id: int
    service_id: int
    appointment_date: datetime
    status: str

@router.post("/appointments", summary="Запись на обслуживание")
async def create_appointment(appointment: AppointmentModel, request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        try:
            result = await conn.fetchrow(
                "INSERT INTO appointments (client_id, car_id, service_id, appointment_date, status) "
                "VALUES ($1, $2, $3, $4, $5) "
                "RETURNING id, client_id, car_id, service_id, appointment_date, status",
                appointment.client_id, appointment.car_id, appointment.service_id, appointment.appointment_date, appointment.status
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    return dict(result)

@router.get("/appointments", summary="Список записей")
async def get_appointments(request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT id, client_id, car_id, service_id, appointment_date, status FROM appointments"
        )
    return [dict(row) for row in rows]

@router.get("/appointments/{appointment_id}", summary="Получить запись по ID")
async def get_appointment(appointment_id: int, request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        appointment = await conn.fetchrow(
            "SELECT id, client_id, car_id, service_id, appointment_date FROM appointments WHERE id=$1",
            appointment_id
        )
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
    return dict(appointment)

@router.delete("/appointments/{appointment_id}", summary="Отмена записи")
async def delete_appointment(appointment_id: int, request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM appointments WHERE id=$1", appointment_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": "Appointment cancelled successfully"}
