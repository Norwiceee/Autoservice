from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, Field, constr
from typing import List, Optional
from routers.auth import get_current_user

router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"],
    dependencies=[Depends(get_current_user)]
)

class ReviewModel(BaseModel):
    client_id: int = Field(..., description="ID клиента, оставившего отзыв")
    appointment_id: int = Field(..., description="ID записи на сервис (обязателен!)")  # ← Должен быть тут
    service_id: Optional[int] = Field(None, description="ID услуги, если отзыв о конкретной услуге")
    rating: int = Field(..., ge=1, le=5, description="Оценка от 1 до 5")
    comment: Optional[constr(max_length=500)] = Field(None, description="Текст отзыва")


class ReviewDB(ReviewModel):
    id: int

@router.post("/", response_model=ReviewDB, summary="Создать отзыв")
async def create_review(review: ReviewModel, request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        try:
            row = await conn.fetchrow(
                """
                INSERT INTO reviews (client_id, appointment_id, service_id, rating, comment)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, client_id, appointment_id, service_id, rating, comment
                """,
                review.client_id, review.appointment_id, review.service_id, review.rating, review.comment
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Ошибка при создании отзыва: {str(e)}")
    return dict(row)


@router.get("/", response_model=List[ReviewDB], summary="Получить список всех отзывов")
async def get_reviews(request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT id, client_id, appointment_id, service_id, rating, comment FROM reviews ORDER BY id DESC"
        )
    return [dict(row) for row in rows]

@router.get("/{review_id}", response_model=ReviewDB, summary="Получить отзыв по ID")
async def get_review(review_id: int, request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        review = await conn.fetchrow(
            "SELECT id, client_id, appointment_id, service_id, rating, comment FROM reviews WHERE id = $1",
            review_id
        )
        if not review:
            raise HTTPException(status_code=404, detail="Отзыв не найден")
    return dict(review)

@router.put("/{review_id}", response_model=ReviewDB, summary="Обновить отзыв")
async def update_review(review_id: int, review: ReviewModel, request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        existing = await conn.fetchrow("SELECT id FROM reviews WHERE id = $1", review_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Отзыв не найден")
        await conn.execute(
            """
            UPDATE reviews
            SET client_id=$1, appointment_id=$2, service_id=$3, rating=$4, comment=$5
            WHERE id=$6
            """,
            review.client_id, review.appointment_id, review.service_id, review.rating, review.comment, review_id
        )
        updated = await conn.fetchrow(
            "SELECT id, client_id, appointment_id, service_id, rating, comment FROM reviews WHERE id = $1",
            review_id
        )
    return dict(updated)

@router.delete("/{review_id}", summary="Удалить отзыв")
async def delete_review(review_id: int, request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM reviews WHERE id = $1", review_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Отзыв не найден")
    return {"message": "Отзыв успешно удалён"}
