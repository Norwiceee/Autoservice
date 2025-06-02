import React, { useEffect, useState } from "react";
import { getReviews, createReview, getClients, getServices } from "../api";
import { Review, Client, Service } from "../types";
import "./ReviewsPage.css";
import { getAppointments } from "../api";
import { Appointment } from "../types";

const ReviewsPage: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [clientId, setClientId] = useState<number | "">("");
    const [serviceId, setServiceId] = useState<number | "">("");
    const [rating, setRating] = useState<number | "">("");
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [appointmentId, setAppointmentId] = useState('');
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    useEffect(() => {
        getReviews().then(setReviews).catch(() => setError("Ошибка загрузки отзывов"));
        getClients().then(setClients).catch(() => setError("Ошибка загрузки клиентов"));
        getServices().then(setServices).catch(() => setError("Ошибка загрузки услуг"));
        getAppointments().then(setAppointments).catch(() => setError("Ошибка загрузки записей"));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const newReview = await createReview(
                Number(appointmentId),
                Number(clientId),
                Number(serviceId),
                Number(rating),
                comment
            );
            setReviews(prev => [...prev, newReview]);
            setAppointmentId(""); setRating(""); setComment("");
        } catch (e: any) {
            setError(e.message || "Ошибка добавления");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-glass">
            <h2 className="page-title">Отзывы клиентов</h2>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <form className="add-form" onSubmit={handleSubmit}>
                <select
                    value={clientId}
                    onChange={e => setClientId(Number(e.target.value))}
                    required
                >
                    <option value="">Клиент</option>
                    {clients.map(client => (
                        <option key={client.id} value={client.id}>
                            {client.first_name} {client.last_name}
                        </option>
                    ))}
                </select>
                <select
                    value={appointmentId}
                    onChange={e => setAppointmentId(e.target.value)}
                    required
                >
                    <option value="">Выберите запись</option>
                    {appointments.map(appt => (
                        <option key={appt.id} value={appt.id}>
                            {appt.id} — {appt.appointment_date
                            ? new Date(appt.appointment_date).toLocaleString()
                            : ""}
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
                    type="number"
                    min={1}
                    max={5}
                    placeholder="Оценка (1-5)"
                    value={rating}
                    onChange={e => setRating(Number(e.target.value))}
                    required
                />
                <input
                    type="text"
                    placeholder="Комментарий"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Добавление..." : "Добавить"}
                </button>
            </form>
            <div className="table-wrap">
                <table>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Клиент</th>
                        <th>Услуга</th>
                        <th>Оценка</th>
                        <th>Комментарий</th>
                        <th>Дата</th>
                    </tr>
                    </thead>
                    <tbody>
                    {reviews.length === 0 ? (
                        <tr>
                            <td colSpan={6} style={{ textAlign: "center", color: "#888", padding: 16 }}>
                                Нет отзывов
                            </td>
                        </tr>
                    ) : (
                        reviews.map(r => (
                            <tr key={r.id}>
                                <td>{r.id}</td>
                                <td>{clients.find(c => c.id === r.client_id)
                                    ? `${clients.find(c => c.id === r.client_id)?.first_name} ${clients.find(c => c.id === r.client_id)?.last_name}`
                                    : "—"}</td>
                                <td>{services.find(s => s.id === r.service_id)?.name || "—"}</td>
                                <td>{r.rating}</td>
                                <td>{r.comment || "—"}</td>
                                <td>{r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}</td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReviewsPage;
