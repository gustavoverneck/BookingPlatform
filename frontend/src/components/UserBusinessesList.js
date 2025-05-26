// frontend/src/components/UserBusinessesList.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';

const UserBusinessesList = () => {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
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

        fetchBusinesses();
    }, []);

    if (loading) return <p>Carregando empresas...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (businesses.length === 0) return <p>Você ainda não cadastrou nenhuma empresa.</p>;

    return (
        <div>
            <h4>Suas Empresas Cadastradas:</h4>
            <ul>
                {businesses.map((business) => (
                    <li key={business.id}>
                        <strong>
                            <Link to={`/businesses/${business.id}`}>{business.name}</Link>
                        </strong>
                        {business.description && <p>{business.description}</p>}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserBusinessesList;
