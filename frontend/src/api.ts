// src/api.ts
import { Employee, Part } from './types';
import { Client, Car, Service, Appointment, LoginResponse, Review } from './types';

export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";


function getToken(): string | null {
    try {
        const saved = localStorage.getItem("auth");
        if (saved) {
            const { token } = JSON.parse(saved);
            return token;
        }
    } catch {}
    return null;
}

// ----------- АВТОРИЗАЦИЯ ------------
export async function login(username: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username, password }),
    });
    if (!response.ok) throw new Error('Не удалось выполнить вход');
    return response.json();
}

export async function register(username: string, password: string): Promise<any> {
    const resp = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });
    if (!resp.ok) throw new Error("Ошибка регистрации");
    return resp.json();
}

// ----------- КЛИЕНТЫ ------------
export async function getClients(): Promise<Client[]> {
    const resp = await fetch(`${API_URL}/clients`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
    });
    if (!resp.ok) throw new Error("Ошибка загрузки клиентов");
    return resp.json();
}

export async function createClient(
    first_name: string,
    last_name: string,
    phone?: string,
    email?: string,
    client_type?: string,
    discount?: number
): Promise<Client> {
    const resp = await fetch(`${API_URL}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name, last_name, phone, email, client_type, discount }),
    });
    if (!resp.ok) throw new Error('Не удалось создать клиента');
    return resp.json();
}

// ----------- АВТО ------------
export async function getCars() {
    const resp = await fetch(`${API_URL}/cars`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
    });
    if (!resp.ok) throw new Error("Ошибка загрузки авто");
    return resp.json();
}

export async function createCar(
    client_id: number,
    make: string,
    model: string,
    year: number,
    license_plate: string,
    vin?: string,
    color?: string,
    mileage: number = 0,
    status: string = "active"
): Promise<Car> {
    const resp = await fetch(`${API_URL}/cars`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ client_id, make, model, year, license_plate, vin, color, mileage, status }),
    });
    if (!resp.ok) throw new Error("Ошибка создания авто");
    return resp.json();
}


// ----------- УСЛУГИ ------------
export async function getServices(): Promise<Service[]> {
    const resp = await fetch(`${API_URL}/services`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
    });
    if (!resp.ok) throw new Error("Ошибка загрузки услуг. Проверьте авторизацию.");
    return resp.json();
}

export async function createService(
    name: string,
    price: number,
    description?: string,
    category_id?: number,
    duration?: string // формат '01:30:00'
): Promise<Service> {
    const resp = await fetch(`${API_URL}/services`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name, price, description, category_id, duration }),
    });
    if (!resp.ok) throw new Error("Ошибка создания услуги");
    return resp.json();
}


// ----------- ЗАПИСИ ------------
export async function getAppointments(): Promise<Appointment[]> {
    const resp = await fetch(`${API_URL}/appointments`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
        },
    });
    if (!resp.ok) throw new Error('Не удалось загрузить список записей');
    return resp.json();
}

export async function createAppointment(
    client_id: number,
    car_id: number,
    service_id: number,
    appointment_date: string,
    employee_id?: number,
    status: string = "scheduled"
): Promise<Appointment> {
    const resp = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({
            client_id, car_id, service_id, appointment_date, employee_id, status
        }),
    });
    if (!resp.ok) throw new Error(`Ошибка сервера: ${resp.status}`);
    return resp.json();
}

// ----------- СОТРУДНИКИ ------------
export async function getEmployees() {
    const resp = await fetch(`${API_URL}/employees`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
    });
    if (!resp.ok) throw new Error("Ошибка загрузки сотрудников");
    return resp.json();
}

export async function createEmployee(
    first_name: string,
    last_name: string,
    role: string,
    phone?: string,
    email?: string
): Promise<Employee> {
    const resp = await fetch(`${API_URL}/employees`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ first_name, last_name, role, phone, email }),
    });
    if (!resp.ok) throw new Error("Ошибка создания сотрудника");
    return resp.json();
}


// ----------- ЗАПЧАСТИ ------------
export async function getParts() {
    const resp = await fetch(`${API_URL}/parts`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
    });
    if (!resp.ok) throw new Error("Ошибка загрузки запчастей");
    return resp.json();
}

export async function createPart(
    name: string,
    sku: string,
    stock_qty: number,
    purchase_price: number,
    sale_price: number,
    car_id: number
): Promise<Part> {
    const resp = await fetch(`${API_URL}/parts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name, sku, stock_qty, purchase_price, sale_price, car_id }),
    });
    if (!resp.ok) throw new Error("Ошибка создания запчасти");
    return resp.json();
}


// ----------- КАТЕГОРИИ ------------
export async function getCategories() {
    const resp = await fetch(`${API_URL}/categories`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
    });
    if (!resp.ok) throw new Error("Ошибка загрузки категорий");
    return resp.json();
}

export async function createCategory(name: string): Promise<any> {
    const resp = await fetch(`${API_URL}/categories`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name }),
    });
    if (!resp.ok) throw new Error("Ошибка создания категории");
    return resp.json();
}

// ----------- ОТЗЫВЫ ------------
export async function getReviews(): Promise<Review[]> {
    const resp = await fetch(`${API_URL}/reviews`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
    });
    if (!resp.ok) throw new Error("Ошибка загрузки отзывов");
    return resp.json();
}

export async function createReview(
    appointment_id: number,
    client_id: number,
    service_id: number,
    rating: number,
    comment: string
): Promise<Review> {
    const resp = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ appointment_id, client_id, service_id, rating, comment }),
    });
    if (!resp.ok) throw new Error("Ошибка создания отзыва");
    return resp.json();
}




