import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "./types";

interface AuthState {
    user: User | null;
    token: string | null;
    login: (user: User, token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthState>({
    user: null,
    token: null,
    login: () => {},
    logout: () => {},
});

export function useAuth() {
    return useContext(AuthContext);
}

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem("auth");
        if (saved) {
            const { user, token } = JSON.parse(saved);
            setUser(user);
            setToken(token);
        }
    }, []);

    const login = (user: User, token: string) => {
        setUser(user);
        setToken(token);
        localStorage.setItem("auth", JSON.stringify({ user, token }));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("auth");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
