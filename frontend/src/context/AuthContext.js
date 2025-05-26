// frontend/src/context/AuthContext.js
import React, { createContext, useState, useContext } from 'react';

// Create context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('accessToken'));

    const login = (newToken) => {
        setToken(newToken);
        localStorage.setItem('accessToken', newToken);
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem('accessToken');
    };

    const value = {
        token,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create hook to use auth context
export const useAuth = () => {
    return useContext(AuthContext);
};