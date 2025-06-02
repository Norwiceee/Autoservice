import React, { useEffect, useState } from "react";
import { Client } from "../types";
import { getClients, createClient } from "../api";
import "./ClientsPage.css"; // либо ./App.css если всё в одном

const ClientsPage: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [clientType, setClientType] = useState('');
    const [discount, setDiscount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        getClients()
            .then(setClients)
            .catch(() => setError("Ошибка загрузки клиентов"));
    }, []);

    const handleAddClient = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);
        try {
            const newClient = await createClient(
                firstName, lastName, phone, email, clientType, discount ? Number(discount) : undefined
            );
            setClients(prev => [...prev, newClient]);
            setFirstName(''); setLastName(''); setPhone(''); setEmail(''); setClientType(''); setDiscount('');
            setSuccess("Клиент успешно добавлен!");
            setTimeout(() => setSuccess(null), 2000);
        } catch (err: any) {
            setError(err.message || 'Ошибка при добавлении клиента');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-glass">
            <h2 className="page-title">Клиенты</h2>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <form className="add-form" onSubmit={handleAddClient}>
                <input
                    type="text"
                    placeholder="Имя"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Фамилия"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Телефон"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Тип (physical/legal)"
                    value={clientType}
                    onChange={e => setClientType(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Скидка"
                    value={discount}
                    onChange={e => setDiscount(e.target.value)}
                    min={0}
                    max={100}
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Добавление..." : "Добавить клиента"}
                </button>
            </form>
            <div className="table-wrap">
                <table className="glass-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Имя</th>
                        <th>Фамилия</th>
                        <th>Телефон</th>
                        <th>Email</th>
                        <th>Тип</th>
                        <th>Скидка</th>
                        <th>Дата создания</th>
                    </tr>
                    </thead>
                    <tbody>
                    {clients.length === 0 ? (
                        <tr>
                            <td colSpan={8} style={{ textAlign: "center", color: "#888", padding: 16 }}>
                                Нет клиентов
                            </td>
                        </tr>
                    ) : (
                        clients.map(client => (
                            <tr key={client.id}>
                                <td>{client.id}</td>
                                <td>{client.first_name}</td>
                                <td>{client.last_name}</td>
                                <td>{client.phone || "—"}</td>
                                <td>{client.email || "—"}</td>
                                <td>{client.client_type || "—"}</td>
                                <td>{client.discount ?? "—"}</td>
                                <td>{client.created_at ? client.created_at.split('T')[0] : "—"}</td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClientsPage;
