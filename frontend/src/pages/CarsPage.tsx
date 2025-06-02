import React, { useEffect, useState } from "react";
import { Car, Client } from "../types";
import { getCars, createCar, getClients } from "../api";
import "./CarsPage.css"; // или ./App.css если общий файл

const CarsPage: React.FC = () => {
    const [cars, setCars] = useState<Car[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [clientId, setClientId] = useState('');
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [mileage, setMileage] = useState('');
    const [licensePlate, setLicensePlate] = useState('');
    const [vin, setVin] = useState('');
    const [color, setColor] = useState('');
    const [status, setStatus] = useState('active');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        getCars().then(setCars).catch(() => setError("Ошибка загрузки авто"));
        getClients().then(setClients).catch(() => setError("Ошибка загрузки клиентов"));
    }, []);

    const handleAddCar = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);
        try {
            const newCar = await createCar(
                parseInt(clientId),
                make,
                model,
                year ? parseInt(year) : 0,
                licensePlate,
                vin || undefined,
                color || undefined,
                mileage ? parseInt(mileage) : 0,
                status
            );
            setCars(prev => [...prev, newCar]);
            setClientId(''); setMake(''); setModel(''); setYear('');
            setMileage(''); setLicensePlate(''); setVin(''); setColor(''); setStatus('active');
            setSuccess("Авто добавлено!");
            setTimeout(() => setSuccess(null), 2000);
        } catch (err: any) {
            setError(err.message || "Ошибка при добавлении авто");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-glass">
            <h2 className="page-title">Автомобили</h2>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <form className="add-form" onSubmit={handleAddCar}>
                <select value={clientId} onChange={e => setClientId(e.target.value)} required>
                    <option value="">Клиент</option>
                    {clients.map(client => (
                        <option key={client.id} value={client.id}>
                            {client.first_name} {client.last_name}
                        </option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="Марка"
                    value={make}
                    onChange={e => setMake(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Модель"
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Год"
                    value={year}
                    onChange={e => setYear(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Пробег"
                    value={mileage}
                    onChange={e => setMileage(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Госномер"
                    value={licensePlate}
                    onChange={e => setLicensePlate(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="VIN"
                    value={vin}
                    onChange={e => setVin(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Цвет"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                />
                <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                >
                    <option value="active">Активен</option>
                    <option value="inactive">Неактивен</option>
                    <option value="sold">Продан</option>
                </select>
                <button type="submit" disabled={loading}>
                    {loading ? "Добавление..." : "Добавить авто"}
                </button>
            </form>
            <div className="table-wrap">
                <table className="glass-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Клиент</th>
                        <th>Марка</th>
                        <th>Модель</th>
                        <th>Год</th>
                        <th>Госномер</th>
                        <th>VIN</th>
                        <th>Цвет</th>
                        <th>Пробег</th>
                        <th>Статус</th>
                    </tr>
                    </thead>
                    <tbody>
                    {cars.length === 0 ? (
                        <tr>
                            <td colSpan={10} style={{ textAlign: "center", color: "#888", padding: 16 }}>
                                Нет данных
                            </td>
                        </tr>
                    ) : (
                        cars.map(car => {
                            const owner = clients.find(c => c.id === car.client_id);
                            return (
                                <tr key={car.id}>
                                    <td>{car.id}</td>
                                    <td>
                                        {owner
                                            ? `${owner.first_name} ${owner.last_name}`
                                            : car.client_id}
                                    </td>
                                    <td>{car.make}</td>
                                    <td>{car.model}</td>
                                    <td>{car.year || "—"}</td>
                                    <td>{car.license_plate || "—"}</td>
                                    <td>{car.vin || "—"}</td>
                                    <td>{car.color || "—"}</td>
                                    <td>{car.mileage || "—"}</td>
                                    <td>{car.status || "—"}</td>
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

export default CarsPage;
