// frontend/src/pages/DashboardPage.js

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import BusinessCreateForm from '../components/BusinessCreateForm';
import UserBusinessesList from '../components/UserBusinessesList';
import UserAppointmentsList from '../components/UserAppointmentsList';

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

            <hr style={{ margin: '20px 0' }} /> 

            <section style={{marginBottom: '30px'}}>
                <h3>Meus Agendamentos</h3>
                <UserAppointmentsList />
            </section>

            <hr style={{ margin: '20px 0' }} /> 

            <section style={{marginBottom: '30px'}}>
                <h3>Minhas Empresas</h3>
                <UserBusinessesList key={refreshKey} /> 
            </section>

            <hr style={{ margin: '20px 0' }} /> 

            <section>
                <h3>Cadastrar Nova Empresa</h3>
                <BusinessCreateForm onBusinessCreated={handleBusinessCreated} />
            </section>
        </div>
    );
};

export default DashboardPage;
