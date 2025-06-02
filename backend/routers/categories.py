from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, constr
from typing import List, Optional
from routers.auth import get_current_user

router = APIRouter(
    prefix="/categories",
    tags=["Categories"],
    dependencies=[Depends(get_current_user)]
)

class CategoryModel(BaseModel):
    name: constr(min_length=1)
    description: Optional[str] = None

class CategoryDB(CategoryModel):
    id: int

@router.post("/", response_model=CategoryDB, summary="Создать категорию")
async def create_category(category: CategoryModel, request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        try:
            row = await conn.fetchrow(
                """
                INSERT INTO categories (name, description)
                VALUES ($1, $2)
                RETURNING id, name, description
                """,
                category.name, category.description
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Ошибка при создании категории: {str(e)}")
    return dict(row)

@router.get("/", response_model=List[CategoryDB], summary="Получить список категорий")
async def get_categories(request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT id, name, description FROM categories ORDER BY id"
        )
    return [dict(row) for row in rows]

@router.get("/{category_id}", response_model=CategoryDB, summary="Получить категорию по ID")
async def get_category(category_id: int, request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        category = await conn.fetchrow(
            "SELECT id, name, description FROM categories WHERE id = $1",
            category_id
        )
        if not category:
            raise HTTPException(status_code=404, detail="Категория не найдена")
    return dict(category)

@router.put("/{category_id}", response_model=CategoryDB, summary="Обновить категорию")
async def update_category(category_id: int, category: CategoryModel, request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        existing = await conn.fetchrow("SELECT id FROM categories WHERE id = $1", category_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Категория не найдена")
        await conn.execute(
            """
            UPDATE categories
            SET name=$1, description=$2
            WHERE id=$3
            """,
            category.name, category.description, category_id
        )
        updated = await conn.fetchrow(
            "SELECT id, name, description FROM categories WHERE id = $1",
            category_id
        )
    return dict(updated)

@router.delete("/{category_id}", summary="Удалить категорию")
async def delete_category(category_id: int, request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM categories WHERE id = $1", category_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Категория не найдена")
    return {"message": "Категория успешно удалена"}
