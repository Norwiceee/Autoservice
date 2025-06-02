import React, { useEffect, useState } from "react";
import { getParts, createPart, getCategories } from "../api";
import { Part, Category } from "../types";
import "./PartsPage.css";

const PartsPage: React.FC = () => {
    const [parts, setParts] = useState<Part[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [name, setName] = useState("");
    const [categoryId, setCategoryId] = useState<number | "">("");
    const [price, setPrice] = useState("");
    const [quantityInStock, setQuantityInStock] = useState("");
    const [sku, setSku] = useState("");
    const [purchasePrice, setPurchasePrice] = useState("");
    const [salePrice, setSalePrice] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        getParts().then(setParts).catch(() => setError("Ошибка загрузки запчастей"));
        getCategories().then(setCategories).catch(() => setError("Ошибка загрузки категорий"));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const newPart = await createPart(
                name,
                sku,
                Number(stock_qty),
                Number(purchasePrice),
                Number(salePrice)
            );
            setParts(prev => [...prev, newPart]);
            setName(""); setSku(""); setQuantityInStock(""); setPurchasePrice(""); setSalePrice(""); setPrice(""); setCategoryId("");
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
                <select
                    value={categoryId}
                    onChange={e => setCategoryId(Number(e.target.value))}
                    required
                >
                    <option value="">Категория</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
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
                <input
                    type="number"
                    placeholder="Цена"
                    min={0}
                    step="0.01"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    required
                />
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
                        <th>Категория</th>
                        <th>SKU</th>
                        <th>На складе</th>
                        <th>Закуп. цена</th>
                        <th>Цена продажи</th>
                        <th>Цена</th>
                    </tr>
                    </thead>
                    <tbody>
                    {parts.length === 0 ? (
                        <tr>
                            <td colSpan={8} style={{ textAlign: "center", color: "#888", padding: 16 }}>
                                Нет запчастей
                            </td>
                        </tr>
                    ) : (
                        parts.map(part => (
                            <tr key={part.id}>
                                <td>{part.id}</td>
                                <td>{part.name}</td>
                                <td>{categories.find(c => c.id === part.category_id)?.name || "—"}</td>
                                <td>{part.sku}</td>
                                <td>{part.quantity_in_stock}</td>
                                <td>{part.purchase_price}</td>
                                <td>{part.sale_price}</td>
                                <td>{part.price}</td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PartsPage;