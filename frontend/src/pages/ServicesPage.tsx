import React, { useEffect, useState } from "react";
import { Service, Category } from "../types";
import { getServices, createService, getCategories } from '../api';
import "./ServicesPage.css";

const ServicesPage: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('');
    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        getServices().then(setServices).catch(() => setError("Ошибка загрузки услуг"));
        getCategories().then(setCategories).catch(() => setError("Ошибка загрузки категорий"));
    }, []);

    const handleAddService = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        if (!name.trim()) {
            setError("Название услуги обязательно");
            return;
        }
        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum <= 0) {
            setError("Цена должна быть числом больше 0");
            return;
        }
        if (!categoryId) {
            setError("Выберите категорию");
            return;
        }

        try {
            const newService = await createService(
                name,
                priceNum,
                undefined,
                Number(categoryId),
                duration ? duration : undefined
            );
            setServices(prev => [...prev, newService]);
            setName(''); setPrice(''); setDuration(''); setCategoryId('');
            setSuccess("Услуга добавлена!");
            setTimeout(() => setSuccess(null), 2000);
        } catch (err: any) {
            setError(err.message || 'Ошибка при добавлении услуги');
        }
    };

    return (
        <div className="page-glass">
            <h2 className="page-title">Услуги</h2>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <form className="add-form" onSubmit={handleAddService}>
                <input
                    type="text"
                    placeholder="Название услуги"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Цена"
                    min={1}
                    step="0.01"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Продолжительность (мин)"
                    min={1}
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                />
                <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                >
                    <option value="">Категория</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
                <button type="submit">Добавить услугу</button>
            </form>
            <div className="table-wrap">
                <table className="glass-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Название</th>
                        <th>Цена</th>
                        <th>Длительность</th>
                        <th>Категория</th>
                    </tr>
                    </thead>
                    <tbody>
                    {services.length === 0 ? (
                        <tr>
                            <td colSpan={5} style={{ textAlign: "center", color: "#888", padding: 16 }}>
                                Нет услуг
                            </td>
                        </tr>
                    ) : (
                        services.map(service => {
                            const category = categories.find(c => c.id === service.category_id);
                            return (
                                <tr key={service.id}>
                                    <td>{service.id}</td>
                                    <td>{service.name}</td>
                                    <td>{service.price}</td>
                                    <td>{service.duration || "—"}</td>
                                    <td>{category ? category.name : "—"}</td>
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

export default ServicesPage;
