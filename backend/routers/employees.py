from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from routers.auth import get_current_user

router = APIRouter(
    prefix="/employees",
    tags=["Employees"],
    dependencies=[Depends(get_current_user)]
)

class EmployeeModel(BaseModel):
    first_name: str
    last_name: str
    role: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None

class EmployeeDB(EmployeeModel):
    id: int

@router.post("/", response_model=EmployeeDB, summary="Создать сотрудника")
async def create_employee(employee: EmployeeModel, request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        try:
            row = await conn.fetchrow(
                """
                INSERT INTO employees (first_name, last_name, role, phone, email)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, first_name, last_name, role, phone, email
                """,
                employee.first_name,
                employee.last_name,
                employee.role,
                employee.phone,
                employee.email
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Ошибка при создании сотрудника: {str(e)}")
    return dict(row)

@router.get("/", response_model=List[EmployeeDB], summary="Получить список сотрудников")
async def get_employees(request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT id, first_name, last_name, role, phone, email FROM employees ORDER BY id"
        )
    return [dict(row) for row in rows]

@router.get("/{employee_id}", response_model=EmployeeDB, summary="Получить сотрудника по ID")
async def get_employee(employee_id: int, request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        employee = await conn.fetchrow(
            "SELECT id, first_name, last_name, role, phone, email FROM employees WHERE id = $1",
            employee_id
        )
        if not employee:
            raise HTTPException(status_code=404, detail="Сотрудник не найден")
    return dict(employee)

@router.put("/{employee_id}", response_model=EmployeeDB, summary="Обновить данные сотрудника")
async def update_employee(employee_id: int, employee: EmployeeModel, request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        existing = await conn.fetchrow("SELECT id FROM employees WHERE id = $1", employee_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Сотрудник не найден")
        await conn.execute(
            """
            UPDATE employees
            SET first_name = $1, last_name = $2, role = $3, phone = $4, email = $5
            WHERE id = $6
            """,
            employee.first_name,
            employee.last_name,
            employee.role,
            employee.phone,
            employee.email,
            employee_id
        )
        updated = await conn.fetchrow(
            "SELECT id, first_name, last_name, role, phone, email FROM employees WHERE id = $1",
            employee_id
        )
    return dict(updated)

@router.delete("/{employee_id}", summary="Удалить сотрудника")
async def delete_employee(employee_id: int, request: Request):
    pool = request.app.state.pool
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM employees WHERE id = $1", employee_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Сотрудник не найден")
    return {"message": "Сотрудник успешно удален"}
