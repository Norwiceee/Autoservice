import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Appointment, Client, Car, Service } from '../types';
import * as api from '../api';
import './AppointmentsPage.css'; // стили ниже
import { getAppointments, getCars, getServices } from '../api';


const AppointmentsPage: React.FC = () => {
    const [appointments, setAppointments] = useState<Array<any>>([]);
    const [cars, setCars] = useState<Array<any>>([]);
    const [services, setServices] = useState<Array<any>>([]);
    const [carId, setCarId] = useState('');
    const [serviceId, setServiceId] = useState('');
    const [date, setDate] = useState('');
    const [status, setStatus] = useState('запланировано');
    const [errorCar, setErrorCar] = useState('');
    const [errorService, setErrorService] = useState('');
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        getAppointments()
            .then(setAppointments)
            .catch(console.error);
        getCars()
            .then(setCars)
            .catch(console.error);
        getServices()
            .then(setServices)
            .catch(console.error);
    }, []);

    const addAppointment = () => {
        if (!carId) {
            setErrorCar('Выберите автомобиль');
            return;
        }
        setErrorCar('');
        if (!serviceId) {
            setErrorService('Выберите услугу');
            return;
        }
        setErrorService('');

        const appointmentData = {
            carId: parseInt(carId),
            serviceId: parseInt(serviceId),
            date,
            status
        };
        fetch('/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointmentData)
        })
            .then(res => {
                if (!res.ok) throw new Error('Ошибка при добавлении записи');
                return res.json();
            })
            .then(newAppt => {
                setAppointments([...appointments, newAppt]);
                setCarId(''); setServiceId(''); setDate(''); setStatus('запланировано');
            })
            .catch(err => setSubmitError(err.message));
    };

    const statusOptions = ['запланировано', 'выполнено', 'отменено'];

    return (
        <div>
            <h2>Записи на сервис</h2>

            <div>
                <h3>Добавить запись</h3>
                <label>Автомобиль:</label><br/>
                <select value={carId} onChange={e => setCarId(e.target.value)}>
                    <option value="">Выберите автомобиль</option>
                    {cars.map(car => (
                        <option key={car.id} value={car.id}>
                            {car.make} {car.model} ({car.plate})
                        </option>
                    ))}
                </select><br/>
                {errorCar && <span style={{color:'red'}}>{errorCar}</span>}<br/>

                <label>Услуга:</label><br/>
                <select value={serviceId} onChange={e => setServiceId(e.target.value)}>
                    <option value="">Выберите услугу</option>
                    {services.map(service => (
                        <option key={service.id} value={service.id}>
                            {service.name}
                        </option>
                    ))}
                </select><br/>
                {errorService && <span style={{color:'red'}}>{errorService}</span>}<br/>

                <label>Дата и время:</label><br/>
                <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} /><br/>

                <label>Статус:</label><br/>
                <select value={status} onChange={e => setStatus(e.target.value)}>
                    {statusOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select><br/>

                <button onClick={addAppointment}>Добавить запись</button><br/>
                {submitError && <span style={{color:'red'}}>{submitError}</span>}
            </div>

            <h3>Список записей</h3>
            <table>
                <thead>
                <tr>
                    <th>ID</th><th>Автомобиль</th><th>Услуга</th><th>Дата и время</th><th>Статус</th>
                </tr>
                </thead>
                <tbody>
                {appointments.map(appt => {
                    const car = cars.find(c => c.id === appt.carId);
                    const service = services.find(s => s.id === appt.serviceId);
                    return (
                        <tr key={appt.id}>
                            <td>{appt.id}</td>
                            <td>{car ? `${car.make} ${car.model}` : appt.carId}</td>
                            <td>{service ? service.name : appt.serviceId}</td>
                            <td>{new Date(appt.date).toLocaleString()}</td>
                            <td>{appt.status}</td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
};

export default AppointmentsPage;
