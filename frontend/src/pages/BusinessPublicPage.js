// frontend/src/pages/BusinessPublicPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';

import './BusinessPublicPage.css';

// Array auxiliar para nomes dos dias da semana
const dayNames = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

const BusinessPublicPage = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();

  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [errorBusiness, setErrorBusiness] = useState('');

  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState('');
  
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');

  // Busca detalhes da empresa e seus serviços
  useEffect(() => {
    const fetchBusinessDetailsAndServices = async () => {
      if (!businessId) return;
      setLoadingBusiness(true);
      setErrorBusiness('');
      try {
        const businessResponse = await apiClient.get(`/businesses/${businessId}`);
        console.log("Dados Completos da Empresa Recebidos:", businessResponse.data);
        setBusiness(businessResponse.data);

        const servicesResponse = await apiClient.get(`/services/?business_id=${businessId}`);
        setServices(servicesResponse.data);

      } catch (err) {
        setErrorBusiness('Falha ao carregar os dados da empresa ou serviços.');
        console.error("Erro ao buscar dados da empresa/serviços:", err);
        setBusiness(null);
        setServices([]);
      } finally {
        setLoadingBusiness(false);
      }
    };

    fetchBusinessDetailsAndServices();
  }, [businessId]);

  // Função para buscar os horários disponíveis (memorizada com useCallback)
  const fetchAvailableSlots = useCallback(async () => {
    if (!selectedService || !selectedDate || !businessId) {
      setAvailableSlots([]);
      return;
    }
    
    setLoadingSlots(true);
    setSlotsError('');
    setAvailableSlots([]);

    const apiUrl = `/businesses/${businessId}/availability?service_id=${selectedService.id}&date=${selectedDate}`;
    console.log("Buscando horários com URL:", apiUrl);

    try {
      const response = await apiClient.get(apiUrl);
      setAvailableSlots(response.data);
    } catch (err) {
      setSlotsError('Não foi possível carregar os horários disponíveis para esta data/serviço.');
      console.error("Erro ao buscar horários:", err);
      if (err.response && err.response.data) {
        console.error("Detalhes do erro do backend:", err.response.data);
      }
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [businessId, selectedService, selectedDate]);

  // Efeito para buscar horários disponíveis quando serviço selecionado ou data mudam
  useEffect(() => {
    if (selectedService && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedService, selectedDate, fetchAvailableSlots]);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setBookingSuccess(''); 
    setBookingError('');
    setSlotsError(''); 
    setAvailableSlots([]);
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
    setBookingSuccess(''); 
    setBookingError('');
    setSlotsError('');
    setAvailableSlots([]);
  };

  const handleBookAppointment = async (slotTime) => {
    setBookingSuccess('');
    setBookingError('');

    if (!token) {
      alert('Por favor, faça login para agendar um horário.');
      navigate('/login', { state: { from: location } });
      return;
    }

    if (!selectedService || !selectedDate) {
      setBookingError('Erro interno: Serviço ou data não selecionados para agendamento.');
      return;
    }

    const startTimeISO = new Date(`${selectedDate}T${slotTime}`).toISOString();
    const startDateObj = new Date(startTimeISO);
    const endDateObj = new Date(startDateObj.getTime() + selectedService.duration_minutes * 60000);
    const endTimeISO = endDateObj.toISOString();

    const appointmentPayload = {
      service_id: selectedService.id,
      start_time: startTimeISO,
      end_time: endTimeISO,
    };

    try {
      await apiClient.post('/appointments/', appointmentPayload);
      setBookingSuccess(`Agendamento para "${selectedService.name}" às ${slotTime.substring(0,5)} confirmado!`);
      fetchAvailableSlots(); 
    } catch (err) {
      console.error("Erro ao agendar:", err);

      let errorMessage = 'Falha ao realizar o agendamento. Tente novamente.';
      if (err.response && err.response.data) {
        if (err.response.data.detail) {
          if (Array.isArray(err.response.data.detail)) {
            errorMessage = err.response.data.detail[0].msg || errorMessage;
            console.error("Detalhes da validação do FastAPI:", err.response.data.detail);
          } else if (typeof err.response.data.detail === 'string') {
            errorMessage = err.response.data.detail;
            console.error("Detalhe da validação do FastAPI:", err.response.data.detail);
          }
        }
      }
      setBookingError(errorMessage);
    }
  };

  if (loadingBusiness) return <p className="loading-page">Carregando informações da empresa...</p>;
  if (errorBusiness) return <p className="error-page">{errorBusiness}</p>;
  if (!business) return <p className="not-found-page">Empresa não encontrada ou não foi possível carregar os dados.</p>;

  return (
    <div className="business-public-page">
      <header className="business-header">
        <h2>{business.name}</h2>
        <p className="business-description">{business.description || 'Esta empresa ainda não forneceu uma descrição detalhada.'}</p>
      </header>
      
      {/* Seção de Horário de Funcionamento */}
      {(business.weekly_schedule && business.weekly_schedule.length > 0) || (business.special_days && business.special_days.length > 0) ? (
        <section className="business-section">
          <h3>Horário de Funcionamento</h3>
          {business.weekly_schedule && business.weekly_schedule.length > 0 && (
            <div className="schedule-section">
              <strong>Semanal Regular:</strong>
              <ul className="schedule-list">
                {dayNames.map((dayName, index) => {
                  const daySetting = business.weekly_schedule.find(d => d.day_of_week === index);
                  let displayTime = 'Não definido';
                  if (daySetting) {
                    displayTime = daySetting.is_closed 
                      ? 'Fechado' 
                      : `${daySetting.open_time?.substring(0,5) || '--:--'} - ${daySetting.close_time?.substring(0,5) || '--:--'}`;
                  }
                  return (
                    <li key={index} className="schedule-item">
                      <span className="schedule-day">{dayName}:</span>
                      {daySetting?.is_closed ? (
                        <span className="closed-status">{displayTime}</span>
                      ) : (
                        <span>{displayTime}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {business.special_days && business.special_days.length > 0 && (
            <div className="schedule-section">
              <strong>Dias com Horário Especial / Fechamentos:</strong>
              <ul className="schedule-list">
                {business.special_days.map(specialDay => (
                  <li key={specialDay.id} className="schedule-item">
                    <span className="schedule-day">
                      {new Date(specialDay.date + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' })}:
                    </span>
                    {specialDay.is_closed ? (
                      <span className="closed-status">Fechado</span>
                    ) : (
                      <span>
                        {specialDay.open_time ? specialDay.open_time.substring(0,5) : 'Abre'} - {specialDay.close_time ? specialDay.close_time.substring(0,5) : 'Fecha'}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      ) : (
        <p>Horário de funcionamento não informado por esta empresa.</p>
      )}

      <hr className="divider" />
      
      <section className="business-section">
        <h3>Nossos Serviços</h3>
        {services.length > 0 ? (
          <ul className="services-list">
            {services.map(service => (
              <li 
                key={service.id} 
                className={`service-item ${selectedService?.id === service.id ? 'selected' : ''}`}
                onClick={() => handleServiceSelect(service)}
              >
                <h4>
                  {service.name}
                  {selectedService?.id === service.id && (
                    <span className="service-selected-badge"> (Selecionado)</span>
                  )}
                </h4>
                <p className="service-description">{service.description || 'Sem descrição adicional para este serviço.'}</p>
                <p className="service-details">Duração: {service.duration_minutes} minutos</p>
                <p className="service-price">Preço: R$ {Number(service.price).toFixed(2).replace('.', ',')}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Esta empresa ainda não cadastrou serviços publicamente.</p>
        )}
      </section>

      {selectedService && (
        <section className="availability-section">
          <h3>Verificar Disponibilidade para: <strong>{selectedService.name}</strong></h3>
          <div className="date-picker-container">
            <label htmlFor="date-picker" className="date-picker-label">Escolha uma data:</label>
            <input 
              type="date" 
              id="date-picker" 
              value={selectedDate} 
              onChange={handleDateChange} 
              min={new Date().toISOString().split('T')[0]}
              className="date-picker-input"
            />
          </div>

          {bookingSuccess && <p className="message-success">{bookingSuccess}</p>}
          {bookingError && <p className="message-error">{bookingError}</p>}

          {loadingSlots && <p className="loading-message">Carregando horários disponíveis...</p>}
          {slotsError && <p className="message-error">{slotsError}</p>}
          
          {!loadingSlots && !slotsError && selectedDate && (
            <div className="slots-container">
              <h4>Horários Disponíveis para {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })}:</h4>
              {availableSlots.length > 0 ? (
                <div className="slots-grid">
                  {availableSlots.map(slot => (
                    <button 
                      key={slot} 
                      onClick={() => handleBookAppointment(slot)}
                      className="slot-button"
                      title={token ? `Agendar ${selectedService.name} às ${slot.substring(0,5)}` : "Faça login para agendar"}
                      disabled={!token && false}
                    >
                      {slot.substring(0,5)}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="no-slots-message">Nenhum horário disponível para este serviço nesta data. Tente outra data ou serviço.</p>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default BusinessPublicPage;
