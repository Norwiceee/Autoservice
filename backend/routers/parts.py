from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, constr
from typing import Optional, List
from routers.auth import get_current_user

router = APIRouter(
    prefix="/parts",
    tags=["Parts"],
    dependencies=[Depends(get_current_user)]
)

class PartModel(BaseModel):
    name: str
    sku: str
    stock_qty: int
    purchase_price: float
    sale_price: float
    car_id: int

class PartDB(PartModel):
    id: int

@router.post("/", summary="Создать запчасть")
async def create_part(part: PartModel, request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        try:
            result = await conn.fetchrow(
                "INSERT INTO parts (name, sku, stock_qty, purchase_price, sale_price, car_id) "
                "VALUES ($1, $2, $3, $4, $5, $6) "
                "RETURNING id, name, sku, stock_qty, purchase_price, sale_price, car_id",
                part.name, part.sku, part.stock_qty, part.purchase_price, part.sale_price, part.car_id
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    return dict(result)

@router.get("/", summary="Список запчастей")
async def get_parts(request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, name, sku, stock_qty, purchase_price, sale_price, car_id FROM parts")
    return [dict(row) for row in rows]

@router.get("/{part_id}", response_model=PartDB, summary="Получить запчасть по ID")
async def get_part(part_id: int, request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        part = await conn.fetchrow(
            "SELECT id, name, sku, stock_qty, purchase_price, sale_price, car_id FROM parts WHERE id = $1",
            part_id
        )
        if not part:
            raise HTTPException(status_code=404, detail="Запчасть не найдена")
    return dict(part)

@router.put("/{part_id}", response_model=PartDB, summary="Обновить информацию о запчасти")
async def update_part(part_id: int, part: PartModel, request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        existing = await conn.fetchrow("SELECT id FROM parts WHERE id = $1", part_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Запчасть не найдена")
        await conn.execute(
            """
            UPDATE parts
            SET name=$1, sku=$2, stock_qty=$3, purchase_price=$4, sale_price=$5, car_id=$6
            WHERE id=$7
            """,
            part.name, part.sku, part.stock_qty, part.purchase_price, part.sale_price, part.car_id, part_id
        )
        updated = await conn.fetchrow(
            "SELECT id, name, sku, stock_qty, purchase_price, sale_price, car_id FROM parts WHERE id = $1",
            part_id
        )
    return dict(updated)

@router.delete("/{part_id}", summary="Удалить запчасть")
async def delete_part(part_id: int, request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM parts WHERE id = $1", part_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Запчасть не найдена")
    return {"message": "Запчасть успешно удалена"}
