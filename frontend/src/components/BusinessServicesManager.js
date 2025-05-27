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

    if (loading) return <p className="services-loading">Carregando serviços...</p>;
    if (error) return <p className="services-error">{error}</p>;

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
        <div className="business-services-manager">
            <h5 className="services-manager-title">Serviços Oferecidos:</h5>
            {services.length === 0 ? (
                <p className="services-empty-state">Nenhum serviço cadastrado para esta empresa.</p>
            ) : (
                <ul className="services-list">
                    {services.map(service => (
                        <li key={service.id} className="service-item">
                            <h6 className="service-name">{service.name}</h6>
                            <p className="service-description">{service.description}</p>
                            <p className="service-details">
                                Duração: {service.duration_minutes} min
                            </p>
                            <p className="service-details">
                                Preço: R$ {Number(service.price).toFixed(2)}
                            </p>
                            <div className="service-actions">
                                <button 
                                    onClick={() => handleStartEditService(service)} 
                                    className="service-edit-btn"
                                >
                                    Editar
                                </button>
                                <button 
                                    onClick={() => handleDeleteService(service.id)} 
                                    className="service-delete-btn"
                                >
                                    Excluir Serviço
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default BusinessServicesManager;