import React, { useEffect, useState } from "react";
import { Appointment, Car, Service } from "../types";
import { getAppointments, getCars, getServices, createAppointment } from "../api";
import "./AppointmentsPage.css";

const statusOptions = ["запланировано", "выполнено", "отменено"];

const AppointmentsPage: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [cars, setCars] = useState<Car[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [carId, setCarId] = useState<number | "">("");
    const [serviceId, setServiceId] = useState<number | "">("");
    const [date, setDate] = useState("");
    const [status, setStatus] = useState(statusOptions[0]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        getAppointments().then(setAppointments).catch(() => setError("Ошибка загрузки записей"));
        getCars().then(setCars).catch(() => setError("Ошибка загрузки автомобилей"));
        getServices().then(setServices).catch(() => setError("Ошибка загрузки услуг"));
    }, []);

    const handleAddAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!carId) {
            setError("Выберите автомобиль");
            return;
        }
        if (!serviceId) {
            setError("Выберите услугу");
            return;
        }
        if (!date) {
            setError("Укажите дату и время");
            return;
        }

        setLoading(true);
        try {
            const car = cars.find(c => c.id === Number(carId));
            if (!car) throw new Error("Автомобиль не найден");
            const newAppointment = await createAppointment(
                car.client_id,
                Number(carId),
                Number(serviceId),
                date,
                undefined, // employee_id если будет нужно
                status
            );
            setAppointments(prev => [...prev, newAppointment]);
            setCarId(""); setServiceId(""); setDate(""); setStatus(statusOptions[0]);
            setSuccess("Запись добавлена!");
            setTimeout(() => setSuccess(null), 2000);
        } catch (e: any) {
            setError(e.message || "Ошибка при добавлении");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-glass">
            <h2 className="page-title">Записи на сервис</h2>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <form className="add-form" onSubmit={handleAddAppointment}>
                <select
                    value={carId}
                    onChange={e => setCarId(Number(e.target.value))}
                    required
                >
                    <option value="">Автомобиль</option>
                    {cars.map(car => (
                        <option key={car.id} value={car.id}>
                            {car.make} {car.model} ({car.license_plate || ""})
                        </option>
                    ))}
                </select>
                <select
                    value={serviceId}
                    onChange={e => setServiceId(Number(e.target.value))}
                    required
                >
                    <option value="">Услуга</option>
                    {services.map(service => (
                        <option key={service.id} value={service.id}>{service.name}</option>
                    ))}
                </select>
                <input
                    type="datetime-local"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                />
                <select value={status} onChange={e => setStatus(e.target.value)}>
                    {statusOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
                <button type="submit" disabled={loading}>
                    {loading ? "Добавление..." : "Добавить запись"}
                </button>
            </form>
            <div className="table-wrap">
                <table className="glass-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Автомобиль</th>
                        <th>Услуга</th>
                        <th>Дата и время</th>
                        <th>Статус</th>
                    </tr>
                    </thead>
                    <tbody>
                    {appointments.length === 0 ? (
                        <tr>
                            <td colSpan={5} style={{ textAlign: "center", color: "#888", padding: 16 }}>
                                Нет записей
                            </td>
                        </tr>
                    ) : (
                        appointments.map(appt => {
                            const car = cars.find(c => c.id === appt.car_id);
                            const service = services.find(s => s.id === appt.service_id);
                            return (
                                <tr key={appt.id}>
                                    <td>{appt.id}</td>
                                    <td>{car ? `${car.make} ${car.model} (${car.license_plate || ""})` : appt.car_id}</td>
                                    <td>{service ? service.name : appt.service_id}</td>
                                    <td>{appt.appointment_date ? new Date(appt.appointment_date).toLocaleString() : ""}</td>
                                    <td>{appt.status}</td>
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AppointmentsPage;
