import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import ClientsPage from "./pages/ClientsPage";
import CarsPage from "./pages/CarsPage";
import ServicesPage from "./pages/ServicesPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import EmployeesPage from "./pages/EmployeesPage";
import PartsPage from "./pages/PartsPage";
import CategoriesPage from "./pages/CategoriesPage";
import ReviewsPage from "./pages/ReviewsPage";
import { useAuth } from "./AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token } = useAuth();
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

const navLinks = [
    { to: "/", label: "Клиенты" },
    { to: "/cars", label: "Автомобили" },
    { to: "/services", label: "Услуги" },
    { to: "/appointments", label: "Записи" },
    { to: "/employees", label: "Сотрудники" },
    { to: "/parts", label: "Запчасти" },
    { to: "/categories", label: "Категории" },
    { to: "/reviews", label: "Отзывы" },
];

const App: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <Router>
            <nav style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "12px 0",
                borderBottom: "1px solid #eee",
                background: "#f8f9fa",
                marginBottom: 20,
                gap: 0
            }}>
                <div style={{ display: "flex", gap: 22 }}>
                    {navLinks.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            style={{
                                textDecoration: "none",
                                color: "#2a2a2a",
                                fontWeight: 500,
                                fontSize: 15,
                                padding: "4px 10px",
                                borderRadius: 4,
                                transition: "background .15s, color .15s"
                            }}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, paddingLeft: 24 }}>
                    {user ? (
                        <>
                            <span style={{ color: "#333" }}>
                                {user.username}
                            </span>
                            <button
                                style={{
                                    background: "#dc3545",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 4,
                                    padding: "6px 13px",
                                    marginLeft: 10,
                                    fontWeight: 600,
                                    cursor: "pointer"
                                }}
                                onClick={logout}
                            >
                                Выйти
                            </button>
                        </>
                    ) : (
                        <>
                            <Link style={{ color: "#007bff", marginRight: 10 }} to="/login">Войти</Link>
                            <Link style={{ color: "#007bff" }} to="/register">Регистрация</Link>
                        </>
                    )}
                </div>
            </nav>
            <main style={{ maxWidth: 1000, margin: "0 auto", padding: "0 20px" }}>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/" element={<RequireAuth><ClientsPage /></RequireAuth>} />
                    <Route path="/cars" element={<RequireAuth><CarsPage /></RequireAuth>} />
                    <Route path="/services" element={<RequireAuth><ServicesPage /></RequireAuth>} />
                    <Route path="/appointments" element={<RequireAuth><AppointmentsPage /></RequireAuth>} />
                    <Route path="/employees" element={<RequireAuth><EmployeesPage /></RequireAuth>} />
                    <Route path="/parts" element={<RequireAuth><PartsPage /></RequireAuth>} />
                    <Route path="/categories" element={<RequireAuth><CategoriesPage /></RequireAuth>} />
                    <Route path="/reviews" element={<RequireAuth><ReviewsPage /></RequireAuth>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </Router>
    );
};

export default App;
