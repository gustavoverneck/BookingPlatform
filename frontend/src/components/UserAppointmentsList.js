import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';

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
        return <p>Carregando seus agendamentos...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    if (appointments.length === 0) {
        return <p>Você ainda não possui agendamentos.</p>;
    }

    return (
        <div>
            <h4>Seus Agendamentos:</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {appointments.map((appointment) => (
                    <li key={appointment.id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '10px', borderRadius: '5px' }}>
                        <p><strong>Serviço:</strong> {appointment.title || appointment.service.name}</p>
                        <p>
                            <strong>Início:</strong> {formatDate(appointment.start_time)}
                        </p>
                        <p>
                            <strong>Fim:</strong> {formatDate(appointment.end_time)}
                        </p>
                        <p>
                            <small>Empresa ID: {appointment.service.business_id}</small>
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserAppointmentsList;
