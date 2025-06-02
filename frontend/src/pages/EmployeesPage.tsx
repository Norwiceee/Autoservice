import React, { useEffect, useState } from "react";
import { getEmployees, createEmployee } from "../api";
import { Employee } from "../types";
import "./EmployeesPage.css";

const EmployeesPage: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [position, setPosition] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        getEmployees()
            .then(setEmployees)
            .catch(() => setError("Ошибка загрузки сотрудников"));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firstName || !lastName || !position) {
            setError("Заполните все поля!");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const newEmployee = await createEmployee(firstName, lastName, position, phone || undefined);
            setEmployees(prev => [...prev, newEmployee]);
            setFirstName("");
            setLastName("");
            setPosition("");
            setPhone("");
            setSuccess("Сотрудник добавлен");
            setTimeout(() => setSuccess(null), 2000);
        } catch {
            setError("Ошибка создания сотрудника");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-glass">
            <h2 className="page-title">Сотрудники автосервиса</h2>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form className="add-form" onSubmit={handleSubmit}>
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
                    placeholder="Должность"
                    value={position}
                    onChange={e => setPosition(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Телефон"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Добавление..." : "Добавить"}
                </button>
            </form>

            <div className="table-wrap">
                <table>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Имя</th>
                        <th>Фамилия</th>
                        <th>Должность</th>
                        <th>Телефон</th>
                        <th>Дата приёма</th>
                    </tr>
                    </thead>
                    <tbody>
                    {employees.length === 0 ? (
                        <tr>
                            <td colSpan={6} style={{ textAlign: "center", color: "#888", padding: 16 }}>
                                Нет сотрудников
                            </td>
                        </tr>
                    ) : (
                        employees.map(emp => (
                            <tr key={emp.id}>
                                <td>{emp.id}</td>
                                <td>{emp.first_name}</td>
                                <td>{emp.last_name}</td>
                                <td>{emp.position}</td>
                                <td>{emp.phone || "—"}</td>
                                <td>{emp.hired_at ? new Date(emp.hired_at).toLocaleDateString() : "—"}</td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EmployeesPage;
