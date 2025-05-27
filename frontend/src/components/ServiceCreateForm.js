import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';

const ServiceCreateForm = ({ businessId, serviceToEdit, onSuccess }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [durationMinutes, setDurationMinutes] = useState('');
    const [price, setPrice] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const isEditMode = Boolean(serviceToEdit);

    useEffect(() => {
        if (isEditMode && serviceToEdit) {
            setName(serviceToEdit.name || '');
            setDescription(serviceToEdit.description || '');
            setDurationMinutes(serviceToEdit.duration_minutes || '');
            setPrice(serviceToEdit.price || '');
        } else {
            setName('');
            setDescription('');
            setDurationMinutes('');
            setPrice('');
        }
    }, [serviceToEdit, isEditMode]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        const payload = {
            name,
            description,
            duration_minutes: parseInt(durationMinutes, 10),
            price: parseFloat(price),
        };

        try {
            if (isEditMode) {
                await apiClient.put(`/services/${serviceToEdit.id}`, payload);
                setSuccess('Serviço atualizado com sucesso!');
            } else {
                if (!businessId) {
                    setError('ID da empresa não fornecido para criação.');
                    return;
                }
                await apiClient.post(`/services/?business_id=${businessId}`, payload);
                setSuccess('Serviço cadastrado com sucesso!');
            }

            if (onSuccess) {
                onSuccess();
            }

        } catch (err) {
            const errorMessage = err.response?.data?.detail || 
                               (isEditMode ? 'Ocorreu um erro ao atualizar o serviço.' : 'Ocorreu um erro ao cadastrar o serviço.');
            setError(errorMessage);
            console.error(err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="service-form">
            <h4>Novo Serviço</h4>
            <div className="service-form-group">
                <label htmlFor={`serviceName-${businessId}`}>Nome do Serviço:</label>
                <input
                    type="text"
                    id={`serviceName-${businessId}`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div className="service-form-group">
                <label htmlFor={`serviceDescription-${businessId}`}>Descrição:</label>
                <textarea
                    id={`serviceDescription-${businessId}`}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                />
            </div>
            <div className="service-form-group">
                <label htmlFor={`serviceDuration-${businessId}`}>Duração (minutos):</label>
                <input
                    type="number"
                    id={`serviceDuration-${businessId}`}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    required
                />
            </div>
            <div className="service-form-group">
                <label htmlFor={`servicePrice-${businessId}`}>Preço (R$):</label>
                <input
                    type="number"
                    step="0.01"
                    id={`servicePrice-${businessId}`}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                />
            </div>
            {error && <div className="service-form-error">{error}</div>}
            {success && <div className="service-form-success">{success}</div>}
            <button type="submit" className="service-form-button">Cadastrar Serviço</button>
        </form>
    );
};

export default ServiceCreateForm;