export interface Client {
    id: number;
    first_name: string;
    last_name: string;
    phone?: string;
    email?: string;
    client_type?: string;      // <-- добавь если нет
    discount?: number;         // <-- добавь если нет
    created_at?: string;       // <-- добавь если нет
}


export interface Car {
    id: number;
    client_id: number;
    make: string;
    model: string;
    year?: number;
    license_plate?: string;
    vin?: string;
    color?: string;
    mileage?: number;
    status?: string;
}


export interface Service {
    id: number;
    name: string;
    price: number;
    category_id: number;
    duration?: number | string;
}

export interface Appointment {
    id: number;
    client_id: number;
    car_id: number;
    service_id: number;
    appointment_date: string;
    status: string;
    created_at?: string;
}

export interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    position: string;
    phone?: string;
    hired_at?: string;
}


export interface Part {
    id: number;
    name: string;
    sku: string;
    stock_qty: number;
    purchase_price: number;
    sale_price: number;
    car_id: number;
}

export interface Category {
    id: number;
    name: string;
}

export interface Payment {
    id: number;
    client_id: number;
    appointment_id?: number | null; // опционально: к какой записи относится
    amount: number;
    payment_date: string;
    method?: string;                // наличные, карта, и т.д.
}

export interface Review {
    id: number;
    client_id: number;
    service_id?: number | null;      // может быть null, если отзыв общий
    rating: number;                  // от 1 до 5
    comment?: string | null;
    created_at?: string;
}

// --- АВТОРИЗАЦИЯ/ПОЛЬЗОВАТЕЛИ ---

export interface Credentials {
    username: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
    username: string;
    user_id: number;
}

export interface User {
    username: string;
    user_id: number;
}

export interface AuthResponse {
    access_token: string;
    user: User;
}

export interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    role: string;
    phone?: string;
    email?: string;
}

export interface Car {
    id: number;
    client_id: number;
    make: string;
    model: string;
    year?: number;
    license_plate?: string;
    vin?: string;
    color?: string;
    mileage?: number;
    status?: string;
}



