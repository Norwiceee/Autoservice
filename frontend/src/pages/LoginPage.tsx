import React, { useState } from "react";
import { login as apiLogin } from "../api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "./AuthPage.css";

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const resp = await apiLogin(username, password);
            login({ username: resp.username, user_id: resp.user_id }, resp.access_token);
            setLoading(false);
            navigate("/");
        } catch (err) {
            setLoading(false);
            setError("Неверный логин или пароль");
        }
    };

    return (
        <div className="page-glass auth-bg">
            <div className="glass-card auth-glass">
                <h2 className="page-title auth-title">Вход в автосервис</h2>
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
                    <button className="auth-btn" type="submit" disabled={loading}>
                        {loading ? "Вход..." : "Войти"}
                    </button>
                    {error && <div className="error-message auth-error">{error}</div>}
                </form>
                <div className="auth-switch">
                    Нет аккаунта?{" "}
                    <span className="auth-link" onClick={() => navigate("/register")}>
                        Зарегистрироваться
                    </span>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
