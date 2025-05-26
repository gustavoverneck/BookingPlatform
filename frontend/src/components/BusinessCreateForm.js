// frontend/src/components/BusinessCreateForm.js

import React, { useState } from 'react';
import apiClient from '../services/api';

const BusinessCreateForm = ({ onBusinessCreated }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        const payload = {
            name,
            description,
        };

        try {
            await apiClient.post('/businesses/', payload);
            setSuccess('Empresa cadastrada com sucesso!');
            setName('');
            setDescription('');

            if (onBusinessCreated) {
                onBusinessCreated();
            }

        } catch (err) {
            if (err.response && err.response.data && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError('Ocorreu um erro ao cadastrar a empresa.');
            }
            console.error(err);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="businessName">Nome da Empresa:</label>
                <input
                    type="text"
                    id="businessName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="businessDescription">Descrição:</label>
                <textarea
                    id="businessDescription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="4"
                />
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <button type="submit">Cadastrar Empresa</button>
        </form>
    );
};

export default BusinessCreateForm;
