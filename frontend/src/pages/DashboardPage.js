// frontend/src/pages/DashboardPage.js

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import BusinessCreateForm from '../components/BusinessCreateForm';
import UserBusinessesList from '../components/UserBusinessesList';
import UserAppointmentsList from '../components/UserAppointmentsList';


import './DashboardPage.css';
import { FaCalendarAlt, FaBuilding, FaPlus } from 'react-icons/fa';

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

    const [showBusinessForm, setShowBusinessForm] = useState(false);

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2 className="dashboard-title">Gerenciar</h2>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <div className="card-header">
                        <h3 className="card-title">Meus Agendamentos</h3>
                        <div className="card-icon"><FaCalendarAlt /></div>
                    </div>
                    <div className="card-content">
                        <UserAppointmentsList />
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="card-header">
                        <h3 className="card-title">Minhas Empresas</h3>
                        <div className="card-icon" onClick={() => setShowBusinessForm(!showBusinessForm)} style={{ cursor: 'pointer' }}>
                            <FaPlus />
                        </div>
                    </div>
                    <div className="card-content">
                        <UserBusinessesList key={refreshKey} />
                        {showBusinessForm && (
                            <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                                <h4>Cadastrar Nova Empresa</h4>
                                <BusinessCreateForm onBusinessCreated={handleBusinessCreated} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
