// frontend/src/pages/DashboardPage.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div>
            <h2>Dashboard</h2>
            <p>Você está logado! Bem-vindo à sua página principal.</p>
            <button onClick={handleLogout}>Sair (Logout)</button>
        </div>
    );
};

export default DashboardPage;