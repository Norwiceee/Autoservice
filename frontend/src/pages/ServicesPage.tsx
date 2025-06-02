import React, { useEffect, useState } from "react";
import { Service } from "../types";
import * as api from "../api";
import "./ServicesPage.css";

const ServicesPage: React.FC = () => {
    const [services, setServices] = useState<Array<any>>([]);
    const [categories, setCategories] = useState<Array<any>>([]);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [errorName, setErrorName] = useState('');
    const [errorPrice, setErrorPrice] = useState('');
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        fetch('/services')
            .then(res => res.json())
            .then(data => setServices(data))
            .catch(err => console.error(err));
        fetch('/service_categories')
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => console.error(err));
    }, []);

    const addService = () => {
        if (!name.trim()) {
            setErrorName('Название услуги обязательно');
            return;
        }
        setErrorName('');
        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum <= 0) {
            setErrorPrice('Цена должна быть числом больше 0');
            return;
        }
        setErrorPrice('');
        if (!categoryId) {
            setSubmitError('Выберите категорию');
            return;
        }
        setSubmitError('');

        const serviceData = {
            name,
            price: priceNum,
            duration: duration ? parseInt(duration) : null,
            categoryId: parseInt(categoryId)
        };
        fetch('/services', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(serviceData)
        })
            .then(res => {
                if (!res.ok) throw new Error('Ошибка при добавлении услуги');
                return res.json();
            })
            .then(newService => {
                setServices([...services, newService]);
                setName(''); setPrice(''); setDuration(''); setCategoryId('');
            })
            .catch(err => setSubmitError(err.message));
    };

    return (
        <div>
            <h2>Услуги</h2>

            <div>
                <h3>Добавить новую услугу</h3>
                <label>Название:</label><br/>
                <input type="text" value={name} onChange={e => setName(e.target.value)} /><br/>
                {errorName && <span style={{color:'red'}}>{errorName}</span>}<br/>

                <label>Цена:</label><br/>
                <input type="text" value={price} onChange={e => setPrice(e.target.value)} /><br/>
                {errorPrice && <span style={{color:'red'}}>{errorPrice}</span>}<br/>

                <label>Продолжительность (мин):</label><br/>
                <input type="number" value={duration} onChange={e => setDuration(e.target.value)} /><br/>

                <label>Категория:</label><br/>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                    <option value="">Выберите категорию</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select><br/>

                <button onClick={addService}>Добавить услугу</button><br/>
                {submitError && <span style={{color:'red'}}>{submitError}</span>}
            </div>

            <h3>Список услуг</h3>
            <table>
                <thead>
                <tr>
                    <th>ID</th><th>Название</th><th>Цена</th><th>Длительность</th><th>Категория</th>
                </tr>
                </thead>
                <tbody>
                {services.map(service => {
                    const category = categories.find(c => c.id === service.categoryId);
                    return (
                        <tr key={service.id}>
                            <td>{service.id}</td>
                            <td>{service.name}</td>
                            <td>{service.price}</td>
                            <td>{service.duration}</td>
                            <td>{category ? category.name : ''}</td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
};

export default ServicesPage;

