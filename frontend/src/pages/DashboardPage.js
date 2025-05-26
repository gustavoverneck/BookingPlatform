// frontend/src/pages/DashboardPage.js

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import BusinessCreateForm from '../components/BusinessCreateForm';
import UserBusinessesList from '../components/UserBusinessesList';


const DashboardPage = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [refreshKey, setRefreshKey] = useState(0);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleBusinessCreated = () => {
        setRefreshKey(prevKey => prevKey + 1);
    };

    return (
        <div>
            <h2>Dashboard</h2>
            <p>Você está logado! Bem-vindo à sua página principal.</p>
            <button onClick={handleLogout}>Sair (Logout)</button>

            <hr style={{ margin: '20px 0' }} /> 

            <h3>Cadastrar Nova Empresa</h3>
            
            <BusinessCreateForm onBusinessCreated={handleBusinessCreated} />

            <hr style={{ margin: '20px 0' }} />
            <h3>Minhas Empresas</h3>
            
            <UserBusinessesList key={refreshKey} />
        </div>
    );
};

export default DashboardPage;