import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';
import './UserAppointmentsList.css';
import { FaCalendarAlt, FaClock, FaBuilding } from 'react-icons/fa';

const UserAppointmentsList = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await apiClient.get('/appointments/');
            const sortedAppointments = response.data.sort((a, b) => 
                new Date(b.start_time) - new Date(a.start_time)
            );
            setAppointments(sortedAppointments);
        } catch (err) {
            setError('Falha ao carregar seus agendamentos.');
            console.error("Erro ao buscar agendamentos:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC'
        });
    };

    if (loading) {
        return (
            <div className="user-businesses-container">
                <p>Carregando seus agendamentos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="user-businesses-container">
                <p style={{ color: 'red' }}>{error}</p>
            </div>
        );
    }

    if (appointments.length === 0) {
        return (
            <div className="user-businesses-container">
                <div className="empty-businesses">
                    <div className="empty-businesses-icon">📅</div>
                    <p>Você ainda não possui agendamentos.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="user-businesses-container">
            <div className="user-businesses-header">
                <h1 className="user-businesses-title">Meus Agendamentos</h1>
                <p className="user-businesses-subtitle">Gerencie seus compromissos agendados</p>
            </div>
            
            <div className="user-businesses-grid">
                {appointments.map((appointment) => (
                    <div key={appointment.id} className="business-card">
                        <div className="business-header">
                            <h3 className="business-title">
                                {appointment.title || appointment.service.name}
                            </h3>
                        </div>
                        
                        <div className="business-content">
                            <div className="business-info">
                                <FaCalendarAlt /> {formatDate(appointment.start_time)}
                            </div>
                            <div className="business-info">
                                <FaClock /> {formatDate(appointment.end_time)}
                            </div>
                            <div className="business-category">
                                <FaBuilding /> Empresa ID: {appointment.service.business_id}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserAppointmentsList;
