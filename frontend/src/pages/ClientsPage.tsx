import React, { useEffect, useState } from "react";
import { Client } from "../types";
import { getClients, createClient } from "../api";
import "./ClientsPage.css";

const ClientsPage: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [clientType, setClientType] = useState('');
    const [discount, setDiscount] = useState('');
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        getClients()
            .then(setClients)
            .catch(console.error);
    }, []);

    const handleAddClient = async () => {
        setSubmitError('');
        try {
            const newClient = await createClient(
                firstName, lastName, phone, email, clientType, discount ? Number(discount) : undefined
            );
            setClients(prev => [...prev, newClient]);
            setFirstName(''); setLastName(''); setPhone(''); setEmail(''); setClientType(''); setDiscount('');
        } catch (err: any) {
            setSubmitError(err.message || 'Ошибка при добавлении клиента');
        }
    };

    return (
        <div className="clients-page">
            <div className="clients-title">Клиенты</div>
            <form
                className="clients-form"
                onSubmit={e => {
                    e.preventDefault();
                    handleAddClient();
                }}
            >
                <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Имя" required />
                <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Фамилия" required />
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Телефон" />
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
                <input value={clientType} onChange={e => setClientType(e.target.value)} placeholder="Тип (physical/legal)" />
                <input value={discount} onChange={e => setDiscount(e.target.value)} placeholder="Скидка" />
                <button type="submit">Добавить клиента</button>
                {submitError && <div style={{color:'red'}}>{submitError}</div>}
            </form>
            <div className="clients-table-container">
                <table className="clients-table">
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
                    {clients.map(client => (
                        <tr key={client.id}>
                            <td>{client.id}</td>
                            <td>{client.first_name}</td>
                            <td>{client.last_name}</td>
                            <td>{client.phone}</td>
                            <td>{client.email}</td>
                            <td>{client.client_type}</td>
                            <td>{client.discount}</td>
                            <td>{client.created_at && client.created_at.split('T')[0]}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClientsPage;