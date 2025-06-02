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
    name: constr(min_length=1)
    description: Optional[str] = None
    price: float
    quantity_in_stock: int

class PartDB(PartModel):
    id: int

@router.post("/", response_model=PartDB, summary="Добавить новую запчасть")
async def create_part(part: PartModel, request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        try:
            row = await conn.fetchrow(
                """
                INSERT INTO parts (name, description, price, quantity_in_stock)
                VALUES ($1, $2, $3, $4)
                RETURNING id, name, description, price, quantity_in_stock
                """,
                part.name, part.description, part.price, part.quantity_in_stock
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Ошибка при добавлении запчасти: {str(e)}")
    return dict(row)

@router.get("/", response_model=List[PartDB], summary="Получить список запчастей")
async def get_parts(request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT id, name, description, price, quantity_in_stock FROM parts ORDER BY id"
        )
    return [dict(row) for row in rows]

@router.get("/{part_id}", response_model=PartDB, summary="Получить запчасть по ID")
async def get_part(part_id: int, request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        part = await conn.fetchrow(
            "SELECT id, name, description, price, quantity_in_stock FROM parts WHERE id = $1",
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
            SET name=$1, description=$2, price=$3, quantity_in_stock=$4
            WHERE id=$5
            """,
            part.name, part.description, part.price, part.quantity_in_stock, part_id
        )
        updated = await conn.fetchrow(
            "SELECT id, name, description, price, quantity_in_stock FROM parts WHERE id = $1",
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
