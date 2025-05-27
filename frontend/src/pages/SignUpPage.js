// frontend/src/pages/SignUpPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';

const SignUpPage = () => {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        const payload = {
            email: email,
            full_name: fullName,
            password: password,
        };

        try {
            await apiClient.post('/users/', payload);

            setSuccess('Conta criada com sucesso! Redirecionando para o login...');

            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            if (err.response && err.response.data && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError('Ocorreu um erro ao criar a conta.');
            }
            console.error(err);
        }
    };

    return (
        <main className="auth-container">
            <div className="auth-wrapper">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1 className="auth-title">Criar Nova Conta</h1>
                        <p className="auth-subtitle">Cadastre-se para começar a gerenciar seus horários e conexões.</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="fullName" className="form-label">Nome Completo</label>
                            <input
                                type="text"
                                id="fullName"
                                className="form-input"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Digite seu nome completo"
                                required
                            />
                        </div>

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

                        {success && (
                            <div className="success-message" role="alert">
                                {success}
                            </div>
                        )}

                        <button type="submit" className="auth-button">
                            Criar Conta
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p className="signup-prompt">
                            Já tem uma conta? 
                            <a href="/login" className="signup-link"> Fazer login</a>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default SignUpPage;