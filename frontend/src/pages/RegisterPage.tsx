// src/pages/RegisterPage.tsx
import React, { useState } from "react";
import { register as apiRegister } from "../api";
import { useNavigate } from "react-router-dom";
import "./AuthPage.css";

const RegisterPage: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);

        if (!username || !password || !password2) {
            setError("Все поля обязательны");
            return;
        }
        if (password.length < 4) {
            setError("Пароль слишком короткий");
            return;
        }
        if (password !== password2) {
            setError("Пароли не совпадают");
            return;
        }
        setLoading(true);
        try {
            await apiRegister(username, password);
            setLoading(false);
            setMessage("Регистрация прошла успешно! Войдите в аккаунт.");
            setTimeout(() => navigate("/login"), 1500);
        } catch (err) {
            setLoading(false);
            setError("Ошибка регистрации. Такой логин уже существует.");
        }
    };

    return (
        <div className="auth-bg">
            <div className="auth-glass">
                <h2 className="auth-title">Регистрация</h2>
                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-input-wrapper">
                        <input
                            className="auth-input"
                            type="text"
                            placeholder="Логин"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            autoFocus
                            required
                        />
                    </div>
                    <div className="auth-input-wrapper">
                        <input
                            className="auth-input"
                            type="password"
                            placeholder="Пароль"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="auth-input-wrapper">
                        <input
                            className="auth-input"
                            type="password"
                            placeholder="Повторите пароль"
                            value={password2}
                            onChange={e => setPassword2(e.target.value)}
                            required
                        />
                    </div>
                    <button className="auth-btn" type="submit" disabled={loading}>
                        {loading ? "Регистрация..." : "Зарегистрироваться"}
                    </button>
                    {error && <div className="auth-error">{error}</div>}
                    {message && <div className="auth-success">{message}</div>}
                </form>
                <div className="auth-switch">
                    Уже есть аккаунт?
                    <span className="auth-link" onClick={() => navigate("/login")}>
                        Войти
                    </span>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
