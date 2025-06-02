from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import asyncpg
from typing import Optional

router = APIRouter()

class ClientModel(BaseModel):
    first_name: str
    last_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    client_type: Optional[str] = None
    discount: Optional[float] = 0.0

@router.post("/clients", summary="Регистрация клиента")
async def create_client(client: ClientModel, request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        try:
            result = await conn.fetchrow(
                """
                INSERT INTO clients (first_name, last_name, phone, email, client_type, discount)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id, first_name, last_name, phone, email, client_type, discount, created_at
                """,
                client.first_name, client.last_name, client.phone, client.email, client.client_type, client.discount
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    return dict(result)


@router.get("/clients", summary="Список клиентов")
async def get_clients(request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, first_name, last_name, phone, email, client_type, discount, created_at FROM clients")
    return [dict(row) for row in rows]

@router.get("/clients/{client_id}", summary="Информация о клиенте и история обслуживаний")
async def get_client(client_id: int, request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        client = await conn.fetchrow(
            "SELECT id, first_name, last_name, phone, email, client_type, discount, created_at FROM clients WHERE id=$1",
            client_id
        )
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        history_rows = await conn.fetch(
            """SELECT a.id, a.appointment_date, s.name AS service_name,
                      c.make, c.model, c.license_plate
               FROM appointments a
               JOIN services s ON a.service_id = s.id
               JOIN cars c ON a.car_id = c.id
               WHERE a.client_id = $1
               ORDER BY a.appointment_date DESC""",
            client_id
        )
    client_dict = dict(client)
    client_dict["service_history"] = [dict(row) for row in history_rows]
    return client_dict
