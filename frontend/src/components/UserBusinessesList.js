// frontend/src/components/UserBusinessesList.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import ServiceCreateForm from './ServiceCreateForm';
import BusinessServicesManager from './BusinessServicesManager';

const UserBusinessesList = () => {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showServiceFormFor, setShowServiceFormFor] = useState(null);
    const [showServicesManagerFor, setShowServicesManagerFor] = useState(null);

    const fetchBusinesses = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await apiClient.get('/businesses/me');
            setBusinesses(response.data);
        } catch (err) {
            setError('Falha ao carregar as empresas.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleServiceForm = (businessId) => {
        setShowServiceFormFor(prev => prev === businessId ? null : businessId);
        setShowServicesManagerFor(null);
    };

    const handleToggleServicesManager = (businessId) => {
        setShowServicesManagerFor(prev => prev === businessId ? null : businessId);
        setShowServiceFormFor(null);
    };

    const handleServiceCreatedOrUpdated = () => {
        setShowServiceFormFor(null);
        alert('Operação no serviço realizada! O gerenciador de serviços irá recarregar da próxima vez que for aberto ou a lista de serviços será atualizada se já estiver visível.');
    };

    useEffect(() => {
        fetchBusinesses();
    }, []);

    if (loading) return <p>Carregando empresas...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (businesses.length === 0) return <p>Você ainda não cadastrou nenhuma empresa.</p>;

    return (
        <div>
            <h4>Suas Empresas Cadastradas:</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {businesses.map((business) => (
                    <li key={business.id} style={{ border: '1px solid #eee', padding: '10px', marginBottom: '10px' }}>
                        <strong>
                            <Link to={`/businesses/${business.id}`}>{business.name}</Link>
                        </strong>
                        {business.description && <p>{business.description}</p>}

                        <button onClick={() => handleToggleServiceForm(business.id)} style={{ marginLeft: '10px' }}>
                            {showServiceFormFor === business.id ? 'Fechar Formulário Serviço' : 'Adicionar Serviço'}
                        </button>

                        <button onClick={() => handleToggleServicesManager(business.id)} style={{ marginLeft: '10px' }}>
                            {showServicesManagerFor === business.id ? 'Ocultar Serviços' : 'Gerenciar Serviços'}
                        </button>

                        {showServiceFormFor === business.id && (
                            <ServiceCreateForm 
                                businessId={business.id} 
                                onServiceCreated={handleServiceCreatedOrUpdated} 
                            />
                        )}

                        {showServicesManagerFor === business.id && (
                            <BusinessServicesManager 
                                businessId={business.id} 
                                onServicesUpdated={handleServiceCreatedOrUpdated}
                            />
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserBusinessesList;
