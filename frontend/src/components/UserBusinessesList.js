// frontend/src/components/UserBusinessesList.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import ServiceCreateForm from './ServiceCreateForm';
import BusinessServicesManager from './BusinessServicesManager';
import WeeklyScheduleForm from './WeeklyScheduleForm';

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

  if (loading) return <p>Carregando suas empresas...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h4>Suas Empresas Cadastradas:</h4>
      {businesses.length === 0 ? (
        <p>Você ainda não cadastrou nenhuma empresa.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {businesses.map((business) => (
            <li key={business.id} style={{ border: '1px solid #eee', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>
                  <Link to={`/businesses/${business.id}`} style={{ fontSize: '1.2em', textDecoration: 'none' }}>
                    {business.name}
                  </Link>
                </strong>
              </div>
              {business.description && <p style={{ marginTop: '5px', color: '#555' }}>{business.description}</p>}

              <div style={{ marginTop: '15px', borderTop: '1px solid #f0f0f0', paddingTop: '15px' }}>
                <button onClick={() => handleToggleServiceCreateForm(business.id)} style={{ marginRight: '10px', marginBottom: '5px' }}>
                  {showServiceCreateFormFor === business.id ? 'Fechar Formulário Serviço' : 'Adicionar Novo Serviço'}
                </button>
                <button onClick={() => handleToggleServicesManager(business.id)} style={{ marginRight: '10px', marginBottom: '5px' }}>
                  {showServicesManagerFor === business.id ? 'Ocultar Meus Serviços' : 'Gerenciar Meus Serviços'}
                </button>
                <button onClick={() => handleToggleWeeklyScheduleForm(business.id)} style={{ marginBottom: '5px' }}>
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserBusinessesList;
