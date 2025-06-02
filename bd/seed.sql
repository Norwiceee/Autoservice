-- Клиенты
INSERT INTO clients (first_name, last_name, phone, email, client_type, discount) VALUES
                                                                                     ('Ivan', 'Ivanov', '1234567', 'ivanov@example.com', 'physical', 5.00),
                                                                                     ('Petr', 'Petrov', '7654321', 'petrov@example.com', 'physical', 0.00);

-- Автомобили
INSERT INTO cars (client_id, make, model, year, license_plate, vin, color, mileage, status) VALUES
                                                                                                (1, 'Toyota', 'Camry', 2015, 'A123BC77', 'VIN123CAMRY2015', 'Black', 120000, 'active'),
                                                                                                (1, 'Honda', 'Accord', 2018, 'B456CD77', 'VIN456ACCORD2018', 'White', 80000, 'active'),
                                                                                                (2, 'Ford', 'Focus', 2012, 'C789EF77', 'VIN789FOCUS2012', 'Blue', 150000, 'active');

-- Категории услуг
INSERT INTO categories (name) VALUES
                                  ('Обслуживание двигателя'),
                                  ('Шины и колёса'),
                                  ('Тормозная система');

-- Услуги
INSERT INTO services (category_id, name, description, price, duration) VALUES
                                                                           (1, 'Oil Change', 'Engine oil and filter change', 29.99, '01:00:00'),
                                                                           (2, 'Tire Rotation', 'Rotation of all four tires', 19.99, '00:30:00'),
                                                                           (3, 'Brake Inspection', 'Brake pads and fluids inspection', 39.99, '01:15:00');

-- Сотрудники
INSERT INTO employees (first_name, last_name, role, phone, email) VALUES
                                                                      ('Alexey', 'Smirnov', 'mechanic', '111222333', 'alexey.smirnov@example.com'),
                                                                      ('Elena', 'Kuznetsova', 'manager', '444555666', 'elena.kuznetsova@example.com');

-- Записи на обслуживание
INSERT INTO appointments (client_id, car_id, service_id, employee_id, appointment_date, status) VALUES
                                                                                                    (1, 1, 1, 1, '2023-07-01 10:00', 'completed'),
                                                                                                    (1, 2, 2, 1, '2023-07-10 14:00', 'scheduled'),
                                                                                                    (2, 3, 3, 2, '2023-07-15 09:00', 'scheduled');

-- Запчасти
INSERT INTO parts (name, sku, stock_qty, purchase_price, sale_price) VALUES
                                                                         ('Engine Oil', 'EO-1234', 50, 10.00, 15.00),
                                                                         ('Oil Filter', 'OF-5678', 30, 5.00, 8.00),
                                                                         ('Brake Pads Set', 'BP-9101', 20, 40.00, 60.00);

-- Связь услуг и запчастей
INSERT INTO service_parts (service_id, part_id, quantity) VALUES
                                                              (1, 1, 5),  -- Oil Change uses 5 units of Engine Oil
                                                              (1, 2, 1),  -- Oil Change uses 1 Oil Filter
                                                              (3, 3, 1);  -- Brake Inspection uses 1 set of Brake Pads

-- Платежи
INSERT INTO payments (appointment_id, amount, payment_date, payment_method, status) VALUES
                                                                                        (1, 44.99, '2023-07-01 11:00', 'card', 'paid'),
                                                                                        (2, 19.99, NULL, 'cash', 'pending');

-- Отзывы
INSERT INTO reviews (appointment_id, rating, comment, created_at) VALUES
                                                                      (1, 5, 'Отличное обслуживание!', '2023-07-02 10:00'),
                                                                      (2, 4, 'Все хорошо, но немного долго.', '2023-07-11 16:00');

-- Пользователи системы (пример)
INSERT INTO users (username, password_hash, full_name, email, role) VALUES
                                                                        ('admin', '$2b$12$KIXZLnGmZez/6jTH8WbZYOxN1bbkO3FqxTjTq9aD8qihJbxk.Rd6a', 'Администратор', 'admin@example.com', 'admin'),
                                                                        ('user1', '$2b$12$7QbYxg5FqOXL7hcBqVh4YOB6DlHvlcCqlUZ4bZzY9CXYfPR8PCxG6', 'Пользователь 1', 'user1@example.com', 'user');
