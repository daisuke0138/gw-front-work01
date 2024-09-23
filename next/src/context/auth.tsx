import apiClient from "@/lib/apiClient";
import React, { ReactNode, useContext, useEffect } from "react";

interface AuthContextType {
    login: (token: string) => void;
    logout: () => void;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = React.createContext<AuthContextType>({
    login: () => { },
    logout: () => { },
});

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const login = async (token: string) => {
        console.log(token, "token");
        window.localStorage.setItem("auth_token", token);
        // apiClient.defaults.headers["Authorization"] = `Bearer ${token}`;
    };

    const logout = () => {
        localStorage.removeItem("auth_token");
        delete apiClient.defaults.headers["Authorication"];
    };

    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        if (token) {
            apiClient.defaults.headers["Authorization"] = `Bearer ${token}`;
        }
    }, []);

    const value = {
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};