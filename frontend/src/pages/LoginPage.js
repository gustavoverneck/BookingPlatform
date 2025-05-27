// frontend/src/pages/LoginPage.js

import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';

import './LoginPage.css'

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
        <main className="auth-container">
            <div className="auth-wrapper">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1 className="auth-title">Bem-vindo(a) de volta!</h1>
                        <p className="auth-subtitle">Faça login para gerenciar seus horários e conexões.</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                type="email"
                                id="email"
                                className="form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Digite seu email"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">Senha</label>
                            <input
                                type="password"
                                id="password"
                                className="form-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Digite sua senha"
                                required
                            />
                        </div>

                        
                        {error && (
                            <div className="error-message" role="alert">
                                {error}
                            </div>
                        )}

                        <button type="submit" className="auth-button">
                            Entrar
                        </button>
                        
                        <div className="form-options">
                            <a href="/forgot-password" className="forgot-password-link">
                                Esqueceu sua senha?
                            </a>
                        </div>
                    </form>

                    <div className="auth-footer">
                        <p className="signup-prompt">
                            Não tem uma conta? 
                            <a href="/signup" className="signup-link"> Criar conta</a>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default LoginPage;