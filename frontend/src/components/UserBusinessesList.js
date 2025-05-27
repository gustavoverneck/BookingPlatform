// frontend/src/components/UserBusinessesList.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import ServiceCreateForm from './ServiceCreateForm';
import BusinessServicesManager from './BusinessServicesManager';
import WeeklyScheduleForm from './WeeklyScheduleForm';

import './UserBusinessesList.css'

const UserBusinessesList = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showServiceCreateFormFor, setShowServiceCreateFormFor] = useState(null);
  const [showServicesManagerFor, setShowServicesManagerFor] = useState(null);
  const [editingScheduleFor, setEditingScheduleFor] = useState(null);

  const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/businesses/me');
      setBusinesses(response.data);
    } catch (err) {
      setError('Falha ao carregar as empresas.');
      console.error("Erro ao buscar empresas:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const handleToggleServiceCreateForm = (businessId) => {
    setShowServiceCreateFormFor(prev => (prev === businessId ? null : businessId));
    setShowServicesManagerFor(null);
    setEditingScheduleFor(null);
  };

  const handleToggleServicesManager = (businessId) => {
    setShowServicesManagerFor(prev => (prev === businessId ? null : businessId));
    setShowServiceCreateFormFor(null);
    setEditingScheduleFor(null);
  };

  const handleToggleWeeklyScheduleForm = (businessId) => {
    setEditingScheduleFor(prev => (prev === businessId ? null : businessId));
    setShowServiceCreateFormFor(null);
    setShowServicesManagerFor(null);
  };

  const handleGenericUpdate = (businessIdUpdated) => {
    if (showServiceCreateFormFor === businessIdUpdated) setShowServiceCreateFormFor(null);
    if (editingScheduleFor === businessIdUpdated) setEditingScheduleFor(null);
  };

  if (loading) return <div className="user-businesses-container"><p>Carregando suas empresas...</p></div>;
  if (error) return <div className="user-businesses-container"><p style={{ color: 'red' }}>{error}</p></div>;

  return (
    <div className="user-businesses-container">
      <div className="user-businesses-header">
        <h1 className="user-businesses-title">Minhas Empresas</h1>
        <p className="user-businesses-subtitle">Gerencie seus negócios cadastrados</p>
      </div>
      
      {businesses.length === 0 ? (
        <div className="empty-businesses">
          <div className="empty-businesses-icon">🏢</div>
          <p>Você ainda não cadastrou nenhuma empresa.</p>
        </div>
      ) : (
        <div className="user-businesses-grid">
          {businesses.map((business) => (
            <div key={business.id} className="business-card">
              <div className="business-header">
                <h2 className="business-title">
                  <Link to={`/businesses/${business.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {business.name}
                  </Link>
                </h2>
              </div>
              
              <div className="business-content">
                {business.description && (
                  <div className="business-category">
                    {business.description}
                  </div>
                )}

                <div style={{ marginTop: '15px', borderTop: '1px solid #f0f0f0', paddingTop: '15px',  }}>
                  <button className="business-action-button" onClick={() => handleToggleServiceCreateForm(business.id)}>
                    {showServiceCreateFormFor === business.id ? 'Fechar Formulário Serviço' : 'Adicionar Novo Serviço'}
                  </button>
                  <button className="business-action-button" onClick={() => handleToggleServicesManager(business.id)}>
                    {showServicesManagerFor === business.id ? 'Ocultar Meus Serviços' : 'Gerenciar Meus Serviços'}
                  </button>
                  <button className="business-action-button" onClick={() => handleToggleWeeklyScheduleForm(business.id)}>
                    {editingScheduleFor === business.id ? 'Fechar Horários' : 'Configurar Horário Semanal'}
                  </button>
                </div>

                {showServiceCreateFormFor === business.id && (
                  <ServiceCreateForm
                    businessId={business.id}
                    onSuccess={() => {
                      handleGenericUpdate(business.id);
                      alert('Serviço criado! Se o painel "Gerenciar Meus Serviços" estiver aberto, ele pode precisar ser reaberto para mostrar o novo serviço, ou ele será atualizado se você realizar uma ação nele.');
                    }}
                  />
                )}

                {showServicesManagerFor === business.id && (
                  <BusinessServicesManager
                    businessId={business.id}
                  />
                )}

                {editingScheduleFor === business.id && (
                  <WeeklyScheduleForm
                    businessId={business.id}
                    onScheduleUpdated={() => {
                      handleGenericUpdate(business.id);
                      alert('Horário semanal atualizado! A página de disponibilidade da empresa refletirá essas mudanças.');
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserBusinessesList;
