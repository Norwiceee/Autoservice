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
        <div className="page-glass auth-bg">
            <div className="glass-card auth-glass">
                <h2 className="page-title auth-title">Регистрация</h2>
                <form className="add-form auth-form" onSubmit={handleSubmit}>
                    <input
                        className="auth-input"
                        type="text"
                        placeholder="Логин"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        autoFocus
                        required
                    />
                    <input
                        className="auth-input"
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <input
                        className="auth-input"
                        type="password"
                        placeholder="Повторите пароль"
                        value={password2}
                        onChange={e => setPassword2(e.target.value)}
                        required
                    />
                    <button className="auth-btn" type="submit" disabled={loading}>
                        {loading ? "Регистрация..." : "Зарегистрироваться"}
                    </button>
                    {error && <div className="error-message auth-error">{error}</div>}
                    {message && <div className="success-message auth-success">{message}</div>}
                </form>
                <div className="auth-switch">
                    Уже есть аккаунт?{" "}
                    <span className="auth-link" onClick={() => navigate("/login")}>
                        Войти
                    </span>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
