import React, { useEffect, useState } from "react";
import { Car, Client } from "../types";
import { getCars, createCar, getClients } from "../api";
import './CarsPage.css';

const CarsPage: React.FC = () => {
    const [cars, setCars] = useState<Car[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [clientId, setClientId] = useState('');
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [mileage, setMileage] = useState('');
    const [plate, setPlate] = useState('');
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [licensePlate, setLicensePlate] = useState('');
    const [vin, setVin] = useState('');
    const [color, setColor] = useState('');

    useEffect(() => {
        getCars().then(setCars).catch(console.error);
        getClients().then(setClients).catch(console.error);
    }, []);

    const handleAddCar = async () => {
        setSubmitError('');
        try {
            const newCar = await createCar(
                parseInt(clientId),
                make,
                model,
                parseInt(year),
                licensePlate,
                vin || undefined,
                color || undefined,
                mileage ? parseInt(mileage) : 0,
                status
            );
            setCars(prev => [...prev, newCar]);
            setClientId(''); setMake(''); setModel(''); setYear(''); setMileage(''); setPlate('');
        } catch (err: any) {
            setSubmitError(err.message || 'Ошибка при добавлении автомобиля');
        }
    };

    return (
        <div>
            <h1>Автомобили</h1>
            <form
                onSubmit={e => {
                    e.preventDefault();
                    handleAddCar();
                }}
            >
                <select value={clientId} onChange={e => setClientId(e.target.value)} required>
                    <option value="">Выберите клиента</option>
                    {clients.map(client => (
                        <option key={client.id} value={client.id}>
                            {client.first_name} {client.last_name}
                        </option>
                    ))}
                </select>
                <input value={make} onChange={e => setMake(e.target.value)} placeholder="Марка" required />
                <input value={model} onChange={e => setModel(e.target.value)} placeholder="Модель" required />
                <input value={year} onChange={e => setYear(e.target.value)} placeholder="Год" type="number" />
                <input value={mileage} onChange={e => setMileage(e.target.value)} placeholder="Пробег" type="number" />
                <input value={plate} onChange={e => setPlate(e.target.value)} placeholder="Госномер" />
                <button type="submit">Добавить авто</button>
                {submitError && <div style={{color:'red'}}>{submitError}</div>}
            </form>
            <table className="cars-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Клиент</th>
                    <th>Марка</th>
                    <th>Модель</th>
                    <th>Год</th>
                    <th>Гос. номер</th>
                    <th>VIN</th>
                    <th>Цвет</th>
                    <th>Пробег</th>
                    <th>Статус</th>
                </tr>
                </thead>
                <tbody>
                {cars.map(car => {
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
                            <td>{car.year}</td>
                            <td>{car.license_plate}</td>
                            <td>{car.vin}</td>
                            <td>{car.color}</td>
                            <td>{car.mileage}</td>
                            <td>{car.status}</td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
};

export default CarsPage;
