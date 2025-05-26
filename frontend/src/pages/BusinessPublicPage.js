// frontend/src/components/BusinessPublicPage.js

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../services/api';

const BusinessPublicPage = () => {
    const { businessId } = useParams(); 

    const [business, setBusiness] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBusinessData = async () => {
            setLoading(true);
            setError('');
            try {
                const businessResponse = await apiClient.get(`/businesses/${businessId}`);
                setBusiness(businessResponse.data);

                const servicesResponse = await apiClient.get(`/services/?business_id=${businessId}`);
                setServices(servicesResponse.data);

            } catch (err) {
                setError('Falha ao carregar os dados da empresa ou serviços.');
                console.error(err);
                setBusiness(null);
                setServices([]);
            } finally {
                setLoading(false);
            }
        };

        if (businessId) {
            fetchBusinessData();
        }
    }, [businessId]);

    if (loading) {
        return <p>Carregando informações da empresa...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    if (!business) {
        return <p>Empresa não encontrada.</p>;
    }

    return (
        <div>
            <h2>{business.name}</h2>
            <p>{business.description || 'Esta empresa ainda não tem uma descrição.'}</p>

            <hr style={{ margin: '20px 0' }} />
            <h3>Nossos Serviços</h3>
            {services.length > 0 ? (
                <ul>
                    {services.map(service => (
                        <li key={service.id}>
                            <h4>{service.name}</h4>
                            <p>{service.description || 'Sem descrição adicional.'}</p>
                            <p>Duração: {service.duration_minutes} minutos</p>
                            <p>Preço: R$ {Number(service.price).toFixed(2)}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Esta empresa ainda não cadastrou serviços.</p>
            )}
        </div>
    );
};

export default BusinessPublicPage;