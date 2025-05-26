// frontend/src/pages/LoginPage.js

import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';

const LoginPage = () => {
    const { token, login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    if (token) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        const loginData = new URLSearchParams();
        loginData.append('username', email);
        loginData.append('password', password);

        try {
            const response = await apiClient.post('/auth/login', loginData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            const { access_token } = response.data;

            login(access_token);

            navigate('/dashboard');

        } catch (err) {
            setError('Falha no login. Verifique seu email e senha.');
            console.error(err);
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Senha:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Entrar</button>
            </form>
        </div>
    );
};

export default LoginPage;