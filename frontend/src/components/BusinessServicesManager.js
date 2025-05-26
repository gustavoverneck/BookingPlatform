// frontend/src/components/BusinessServicesManager.js

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';
import ServiceCreateForm from './ServiceCreateForm';

const BusinessServicesManager = ({ businessId, onServicesUpdated }) => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingService, setEditingService] = useState(null); 


    const fetchServices = useCallback(async () => {
        if (!businessId) return;
        setLoading(true);
        setError('');
        try {
            const response = await apiClient.get(`/services/?business_id=${businessId}`);
            setServices(response.data);
        } catch (err) {
            setError('Falha ao carregar os serviços desta empresa.');
            console.error(err);
            setServices([]);
        } finally {
            setLoading(false);
        }
    }, [businessId]);

    const handleFormSuccess = () => {
        setEditingService(null);
        fetchServices();
        if (onServicesUpdated) {
        onServicesUpdated();
        }
    };

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const handleStartEditService = (service) => {
        setEditingService(service);
    };

    const handleDeleteService = async (serviceId) => {
        if (!window.confirm('Tem certeza que deseja excluir este serviço?')) {
            return;
        }
        try {
            await apiClient.delete(`/services/${serviceId}`);
            fetchServices(); 
            if (onServicesUpdated) {
                onServicesUpdated();
            }
        } catch (err) {
            setError('Falha ao excluir o serviço.');
            console.error(err);
        }
    };

    if (loading) return <p>Carregando serviços...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    if (editingService) {
        return (
        <ServiceCreateForm
            businessId={businessId}
            serviceToEdit={editingService}
            onSuccess={handleFormSuccess}
        />
        );
    }

    return (
        <div style={{ marginTop: '15px', borderTop: '1px dashed #ccc', paddingTop: '15px' }}>
        <h5>Serviços Oferecidos:</h5>
        {services.length === 0 ? (
            <p>Nenhum serviço cadastrado para esta empresa.</p>
        ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
            {services.map(service => (
                <li key={service.id} style={{ /* ... (estilos) ... */ }}>
                {/* ... (detalhes do serviço) ... */}
                <p>Duração: {service.duration_minutes} min | Preço: R$ {Number(service.price).toFixed(2)}</p>
                {/* 6. Botão de Editar */}
                <button onClick={() => handleStartEditService(service)} style={{ marginRight: '10px' }}>
                    Editar
                </button>
                <button onClick={() => handleDeleteService(service.id)} style={{ color: 'red' }}>
                    Excluir Serviço
                </button>
                </li>
            ))}
            </ul>
        )}
        </div>
    );
};

export default BusinessServicesManager;