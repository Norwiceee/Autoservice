import React, { useEffect, useState } from "react";
import "./PartsPage.css";
import { getParts, createPart, getCars } from "../api";
import { Part, Car } from "../types";

const PartsPage: React.FC = () => {
    const [parts, setParts] = useState<Part[]>([]);
    const [name, setName] = useState("");
    const [sku, setSku] = useState("");
    const [quantityInStock, setQuantityInStock] = useState("");
    const [purchasePrice, setPurchasePrice] = useState("");
    const [salePrice, setSalePrice] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [carId, setCarId] = useState<number | "">("");
    const [cars, setCars] = useState<Car[]>([]);

    useEffect(() => {
        getParts().then(setParts).catch(() => setError("Ошибка загрузки запчастей"));
        getCars().then(setCars).catch(() => setError("Ошибка загрузки автомобилей"));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const newPart = await createPart(
                name,
                sku,
                Number(quantityInStock),
                Number(purchasePrice),
                Number(salePrice),
                Number(carId)
            );
            setParts(prev => [...prev, newPart]);
            setName(""); setSku(""); setQuantityInStock(""); setPurchasePrice(""); setSalePrice(""); setCarId("");
            setSuccess("Запчасть добавлена!");
            setTimeout(() => setSuccess(null), 2000);
        } catch (e: any) {
            setError(e.message || "Ошибка добавления");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-glass">
            <h2 className="page-title">Склад запчастей</h2>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <form className="add-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Название"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Артикул (SKU)"
                    value={sku}
                    onChange={e => setSku(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Количество на складе"
                    min={0}
                    value={quantityInStock}
                    onChange={e => setQuantityInStock(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Закупочная цена"
                    min={0}
                    step="0.01"
                    value={purchasePrice}
                    onChange={e => setPurchasePrice(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Цена продажи"
                    min={0}
                    step="0.01"
                    value={salePrice}
                    onChange={e => setSalePrice(e.target.value)}
                />
                <select
                    value={carId}
                    onChange={e => setCarId(Number(e.target.value))}
                    required
                >
                    <option value="">Автомобиль</option>
                    {cars.map(car => (
                        <option key={car.id} value={car.id}>
                            {car.make} {car.model} ({car.license_plate})
                        </option>
                    ))}
                </select>
                <button type="submit" disabled={loading}>
                    {loading ? "Добавление..." : "Добавить"}
                </button>
            </form>
            <div className="table-wrap">
                <table className="glass-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Название</th>
                        <th>SKU</th>
                        <th>На складе</th>
                        <th>Закуп. цена</th>
                        <th>Цена продажи</th>
                        <th>Автомобиль (модель)</th>
                    </tr>
                    </thead>
                    <tbody>
                    {parts.length === 0 ? (
                        <tr>
                            <td colSpan={7} style={{ textAlign: "center", color: "#888", padding: 16 }}>
                                Нет запчастей
                            </td>
                        </tr>
                    ) : (
                        parts.map(part => {
                            const car = cars.find(c => c.id === part.car_id);
                            return (
                                <tr key={part.id}>
                                    <td>{part.id}</td>
                                    <td>{part.name}</td>
                                    <td>{part.sku}</td>
                                    <td>{part.stock_qty}</td>
                                    <td>{part.purchase_price}</td>
                                    <td>{part.sale_price}</td>
                                    <td>{car ? `${car.make} ${car.model}` : "—"}</td>
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

export default PartsPage;
