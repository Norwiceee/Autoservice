import React, { useEffect, useState } from "react";
import { Category } from "../types";
import * as api from "../api";
import "./CategoriesPage.css";

const CategoriesPage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [name, setName] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.getCategories()
            .then(setCategories)
            .catch(() => setError("Ошибка при загрузке категорий."));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) {
            setError("Введите название категории");
            return;
        }
        setLoading(true);
        try {
            const newCategory = await api.createCategory(name);
            setCategories([...categories, newCategory]);
            setName("");
            setMessage("Категория добавлена!");
            setError(null);
        } catch {
            setError("Ошибка добавления категории");
        }
        setLoading(false);
        setTimeout(() => setMessage(null), 2000);
    };

    return (
        <div className="glass-bg">
            <div className="glass-card">
                <h2 className="page-title">Категории</h2>
                {message && <div className="success-msg">{message}</div>}
                {error && <div className="error-msg">{error}</div>}

                <form className="flex-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Название"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    <button type="submit" disabled={loading}>{loading ? "Добавление..." : "Добавить"}</button>
                </form>

                <table className="main-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Название</th>
                    </tr>
                    </thead>
                    <tbody>
                    {categories.length === 0 ? (
                        <tr>
                            <td colSpan={2} style={{ textAlign: "center", color: "#666" }}>Нет категорий</td>
                        </tr>
                    ) : categories.map(cat => (
                        <tr key={cat.id}>
                            <td>{cat.id}</td>
                            <td>{cat.name}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CategoriesPage;
