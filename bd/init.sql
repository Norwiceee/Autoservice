-- Таблица клиентов с дополнительными полями
CREATE TABLE clients (
                         id SERIAL PRIMARY KEY,
                         first_name TEXT NOT NULL,
                         last_name TEXT NOT NULL,
                         phone TEXT,
                         email TEXT,
                         client_type VARCHAR(50), -- 'physical' или 'legal'
                         discount NUMERIC(5,2) DEFAULT 0.0,
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица автомобилей
CREATE TABLE cars (
                      id SERIAL PRIMARY KEY,
                      client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
                      make TEXT NOT NULL,
                      model TEXT NOT NULL,
                      year INTEGER,
                      license_plate TEXT,
                      vin TEXT,
                      color TEXT,
                      mileage INTEGER DEFAULT 0,
                      status VARCHAR(50) DEFAULT 'active'
);

-- Категории услуг
CREATE TABLE categories (
                            id SERIAL PRIMARY KEY,
                            name TEXT NOT NULL UNIQUE,
                            description TEXT
);

-- Таблица услуг с категорией и временем выполнения
CREATE TABLE services (
                          id SERIAL PRIMARY KEY,
                          category_id INTEGER REFERENCES categories(id),
                          name TEXT NOT NULL,
                          description TEXT,
                          price NUMERIC(10,2) NOT NULL,
                          duration INTERVAL -- например '01:30:00'
);

-- Таблица сотрудников автосервиса
CREATE TABLE employees (
                           id SERIAL PRIMARY KEY,
                           first_name TEXT,
                           last_name TEXT,
                           role TEXT, -- например, 'mechanic', 'manager'
                           phone TEXT,
                           email TEXT
);

-- Таблица записей (записей на обслуживание)
CREATE TABLE appointments (
                              id SERIAL PRIMARY KEY,
                              client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
                              car_id INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
                              service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
                              employee_id INTEGER REFERENCES employees(id),
                              appointment_date TIMESTAMP NOT NULL,
                              status VARCHAR(50) DEFAULT 'scheduled',
                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица запчастей и материалов
CREATE TABLE parts (
                       id SERIAL PRIMARY KEY,
                       name TEXT NOT NULL,
                       sku TEXT UNIQUE,
                       quantity_in_stock INTEGER DEFAULT 0, -- это новое поле!
                       stock_qty INTEGER DEFAULT 0,
                       purchase_price NUMERIC(10,2),
                       sale_price NUMERIC(10,2),
                       price NUMERIC(10,2),
                       description TEXT
);


-- Связь услуг и запчастей (многие ко многим)
CREATE TABLE service_parts (
                               service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
                               part_id INTEGER REFERENCES parts(id) ON DELETE CASCADE,
                               quantity INTEGER DEFAULT 1,
                               PRIMARY KEY (service_id, part_id)
);

-- Таблица платежей
CREATE TABLE payments (
                          id SERIAL PRIMARY KEY,
                          appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
                          amount NUMERIC(10,2) NOT NULL,
                          payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          payment_method TEXT, -- 'cash', 'card', 'transfer' и т.п.
                          status TEXT DEFAULT 'pending'
);

-- Таблица отзывов клиентов
CREATE TABLE reviews (
                         id SERIAL PRIMARY KEY,
                         appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
                         rating INTEGER CHECK (rating >= 1 AND rating <= 5),
                         comment TEXT,
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица аудита (логи изменений)
CREATE TABLE audit_logs (
                            id SERIAL PRIMARY KEY,
                            user_id INTEGER, -- связь с users, если есть
                            action TEXT, -- 'insert', 'update', 'delete'
                            table_name TEXT,
                            record_id INTEGER,
                            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица пользователей системы
CREATE TABLE users (
                       id SERIAL PRIMARY KEY,
                       username TEXT UNIQUE NOT NULL,
                       password_hash TEXT NOT NULL,
                       full_name TEXT,
                       email TEXT,
                       role TEXT DEFAULT 'user' -- 'user', 'admin' и т.п.
);
