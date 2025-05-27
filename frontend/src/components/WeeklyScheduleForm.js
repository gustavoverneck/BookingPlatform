import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';

const daysOfWeek = [
    { id: 0, name: 'Segunda-feira' },
    { id: 1, name: 'Terça-feira' },
    { id: 2, name: 'Quarta-feira' },
    { id: 3, name: 'Quinta-feira' },
    { id: 4, name: 'Sexta-feira' },
    { id: 5, name: 'Sábado' },
    { id: 6, name: 'Domingo' },
];

const WeeklyScheduleForm = ({ businessId, onScheduleUpdated }) => {
    const initialSchedule = daysOfWeek.map(day => ({
        day_of_week: day.id,
        open_time: '',
        close_time: '',
        is_closed: true,
    }));
    const [schedule, setSchedule] = useState(initialSchedule);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchSchedule = useCallback(async () => {
        if (!businessId) return;
        setLoading(true);
        setError('');
        try {
            const response = await apiClient.get(`/businesses/${businessId}/schedule/weekly`);
            if (response.data && response.data.length > 0) {
                const newSchedule = initialSchedule.map(dayState => {
                    const existingDayData = response.data.find(d => d.day_of_week === dayState.day_of_week);
                    if (existingDayData) {
                        return {
                            ...dayState,
                            open_time: existingDayData.open_time ? existingDayData.open_time.substring(0, 5) : '',
                            close_time: existingDayData.close_time ? existingDayData.close_time.substring(0, 5) : '',
                            is_closed: existingDayData.is_closed,
                        };
                    }
                    return dayState;
                });
                setSchedule(newSchedule);
            } else {
                setSchedule([...initialSchedule]);
            }
        } catch (err) {
            setError('Falha ao carregar o horário semanal.');
            console.error("Erro ao buscar horário semanal:", err);
        } finally {
            setLoading(false);
        }
    }, [businessId]);

    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]);

    const handleInputChange = (dayIndex, field, value) => {
        const newSchedule = [...schedule];
        newSchedule[dayIndex] = { ...newSchedule[dayIndex], [field]: value };

        if (field === 'is_closed' && value === true) {
            newSchedule[dayIndex].open_time = '';
            newSchedule[dayIndex].close_time = '';
        }
        if (field === 'is_closed' && value === false) {
            if (!newSchedule[dayIndex].open_time) newSchedule[dayIndex].open_time = '09:00';
            if (!newSchedule[dayIndex].close_time) newSchedule[dayIndex].close_time = '18:00';
        }

        setSchedule(newSchedule);
        setSuccess('');
        setError('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        const payload = schedule.map(day => ({
            day_of_week: day.day_of_week,
            open_time: day.is_closed ? null : (day.open_time ? `${day.open_time}:00` : null),
            close_time: day.is_closed ? null : (day.close_time ? `${day.close_time}:00` : null),
            is_closed: day.is_closed,
        }));

        for (const day of payload) {
            if (!day.is_closed && (!day.open_time || !day.close_time)) {
                setError(`Por favor, defina os horários de abertura e fechamento para ${daysOfWeek.find(d => d.id === day.day_of_week).name} ou marque como fechado.`);
                return;
            }
        }

        try {
            await apiClient.put(`/businesses/${businessId}/schedule/weekly`, payload);
            setSuccess('Horário semanal salvo com sucesso!');
            if (onScheduleUpdated) {
                onScheduleUpdated();
            }
            fetchSchedule();
        } catch (err) {
            setError(err.response?.data?.detail || 'Ocorreu um erro ao salvar o horário.');
            console.error(err);
        }
    };

    if (loading) return <p className="loading-message">Carregando formulário de horário...</p>;

    return (
        <form onSubmit={handleSubmit} className="weekly-schedule-form">
            <h4 className="form-title">Configurar Horário Semanal</h4>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            {schedule.map((daySetting, index) => (
                <div key={daySetting.day_of_week} className="day-setting">
                    <h5 className="day-name">{daysOfWeek.find(d => d.id === daySetting.day_of_week).name}</h5>
                    <label className="closed-checkbox-label">
                        <input
                            type="checkbox"
                            className="closed-checkbox"
                            checked={daySetting.is_closed}
                            onChange={(e) => handleInputChange(index, 'is_closed', e.target.checked)}
                        />
                        Fechado
                    </label>
                    {!daySetting.is_closed && (
                        <div className="time-inputs">
                            <label className="time-label">ABRE ÀS:</label>
                            <input
                                type="time"
                                className="time-input open-time"
                                value={daySetting.open_time}
                                onChange={(e) => handleInputChange(index, 'open_time', e.target.value)}
                                disabled={daySetting.is_closed}
                                required={!daySetting.is_closed}
                            />
                            <label className="time-label">FECHA ÀS:</label>
                            <input
                                type="time"
                                className="time-input close-time"
                                value={daySetting.close_time}
                                onChange={(e) => handleInputChange(index, 'close_time', e.target.value)}
                                disabled={daySetting.is_closed}
                                required={!daySetting.is_closed}
                            />
                        </div>
                    )}
                </div>
            ))}
            <button type="submit" className="submit-button">Salvar Horário Semanal</button>
        </form>
    );
};

export default WeeklyScheduleForm;
