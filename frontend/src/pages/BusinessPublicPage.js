// frontend/src/pages/BusinessPublicPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';

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
        console.log("Dados Completos da Empresa Recebidos:", businessResponse.data); // Para depuração
        setBusiness(businessResponse.data);

        const servicesResponse = await apiClient.get(`/services/?business_id=${businessId}`);
        setServices(servicesResponse.data);

        // Se houver serviços e nenhum serviço estiver selecionado, seleciona o primeiro da lista
        if (servicesResponse.data && servicesResponse.data.length > 0 && !selectedService) {
            // Verificação para não setar se já houver um selectedService (ex: vindo de um estado anterior)
            // No entanto, como selectedService começa como null, isso deve funcionar na primeira carga.
            // setSelectedService(servicesResponse.data[0]); // Removido para dar controle ao usuário
        }

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
  }, [businessId]); // Removido selectedService daqui para evitar loop com a auto-seleção

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
    console.log("Buscando horários com URL:", apiUrl); // Para depuração

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
    if (selectedService && selectedDate) { // Garante que ambos estão selecionados
      fetchAvailableSlots();
    }
  }, [selectedService, selectedDate, fetchAvailableSlots]); // fetchAvailableSlots é uma dependência


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
      console.error("Erro ao agendar:", err); // Mantenha este log para depuração completa

      let errorMessage = 'Falha ao realizar o agendamento. Tente novamente.';
      if (err.response && err.response.data) {
        if (err.response.data.detail) {
          // Se 'detail' for um array (comum para erros de validação Pydantic)
          if (Array.isArray(err.response.data.detail)) {
            // Pega a mensagem do primeiro erro do array para simplificar
            errorMessage = err.response.data.detail[0].msg || errorMessage;
            // Ou você pode juntar todas as mensagens:
            // errorMessage = err.response.data.detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join('; ');
            console.error("Detalhes da validação do FastAPI:", err.response.data.detail);
          } else if (typeof err.response.data.detail === 'string') {
            // Se 'detail' for uma string
            errorMessage = err.response.data.detail;
            console.error("Detalhe da validação do FastAPI:", err.response.data.detail);
          }
        }
      }
      setBookingError(errorMessage);
    }
  };

  if (loadingBusiness) return <p>Carregando informações da empresa...</p>;
  if (errorBusiness) return <p style={{ color: 'red' }}>{errorBusiness}</p>;
  if (!business) return <p>Empresa não encontrada ou não foi possível carregar os dados.</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
        <h2>{business.name}</h2>
        <p style={{ color: '#555' }}>{business.description || 'Esta empresa ainda não forneceu uma descrição detalhada.'}</p>
      </header>
      
      {/* Seção de Horário de Funcionamento */}
      {(business.weekly_schedule && business.weekly_schedule.length > 0) || (business.special_days && business.special_days.length > 0) ? (
        <section style={{ marginBottom: '30px' }}>
          <h3>Horário de Funcionamento</h3>
          {business.weekly_schedule && business.weekly_schedule.length > 0 && (
            <div style={{ marginBottom: '15px' }}>
              <strong>Semanal Regular:</strong>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9em' }}>
                {dayNames.map((dayName, index) => {
                  const daySetting = business.weekly_schedule.find(d => d.day_of_week === index);
                  let displayTime = 'Não definido';
                  if (daySetting) {
                    displayTime = daySetting.is_closed 
                      ? 'Fechado' 
                      : `${daySetting.open_time?.substring(0,5) || '--:--'} - ${daySetting.close_time?.substring(0,5) || '--:--'}`;
                  }
                  return ( <li key={index} style={{ padding: '2px 0' }}> <strong>{dayName}:</strong> {displayTime} </li> );
                })}
              </ul>
            </div>
          )}
          {business.special_days && business.special_days.length > 0 && (
            <div>
              <strong>Dias com Horário Especial / Fechamentos:</strong>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9em' }}>
                {business.special_days.map(specialDay => (
                  <li key={specialDay.id} style={{ padding: '2px 0' }}>
                    <strong>{new Date(specialDay.date + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' })}:</strong>
                    {' '}
                    {specialDay.is_closed
                        ? <span style={{color: 'red', fontWeight: 'bold'}}>Fechado</span>
                        : `${specialDay.open_time ? specialDay.open_time.substring(0,5) : 'Abre'} - ${specialDay.close_time ? specialDay.close_time.substring(0,5) : 'Fecha'}`
                    }
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      ) : (
        <p>Horário de funcionamento não informado por esta empresa.</p>
      )}

      <hr style={{ margin: '30px 0' }} />
      <section>
        <h3>Nossos Serviços</h3>
        {services.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {services.map(service => (
              <li 
                key={service.id} 
                style={{ 
                  border: selectedService?.id === service.id ? '2px solid dodgerblue' : '1px solid #ddd', 
                  padding: '15px', 
                  marginBottom: '10px', 
                  borderRadius: '5px',
                  cursor: 'pointer',
                  transition: 'border-color 0.3s ease'
                }}
                onClick={() => handleServiceSelect(service)}
              >
                <h4>{service.name} {selectedService?.id === service.id && <span style={{color: 'dodgerblue', fontSize: '0.9em'}}> (Selecionado)</span>}</h4>
                <p>{service.description || 'Sem descrição adicional para este serviço.'}</p>
                <p>Duração: {service.duration_minutes} minutos</p>
                <p>Preço: R$ {Number(service.price).toFixed(2).replace('.', ',')}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Esta empresa ainda não cadastrou serviços publicamente.</p>
        )}
      </section>

      {selectedService && (
        <section style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
          <h3>Verificar Disponibilidade para: <strong>{selectedService.name}</strong></h3>
          <div style={{display: 'flex', alignItems: 'center', marginBottom: '15px'}}>
            <label htmlFor="date-picker" style={{ marginRight: '10px' }}>Escolha uma data:</label>
            <input 
              type="date" 
              id="date-picker" 
              value={selectedDate} 
              onChange={handleDateChange} 
              min={new Date().toISOString().split('T')[0]}
              style={{ padding: '8px', marginRight: '10px', fontSize: '1em' }}
            />
          </div>

          {bookingSuccess && <p style={{ color: 'green', marginTop: '10px', fontWeight: 'bold' }}>{bookingSuccess}</p>}
          {bookingError && <p style={{ color: 'red', marginTop: '10px', fontWeight: 'bold' }}>{bookingError}</p>}

          {loadingSlots && <p style={{ marginTop: '15px' }}>Carregando horários disponíveis...</p>}
          {slotsError && <p style={{ color: 'red', marginTop: '15px' }}>{slotsError}</p>}
          
          {!loadingSlots && !slotsError && selectedDate && (
            <div style={{ marginTop: '15px' }}>
              <h4>Horários Disponíveis para {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })}:</h4>
              {availableSlots.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', listStyle: 'none', padding: 0, marginTop: '10px' }}>
                  {availableSlots.map(slot => (
                    <button 
                      key={slot} 
                      onClick={() => handleBookAppointment(slot)}
                      style={{ 
                        margin: '5px', 
                        padding: '10px 15px', 
                        cursor: 'pointer',
                        backgroundColor: token ? 'dodgerblue' : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '1em'
                      }}
                      title={token ? `Agendar ${selectedService.name} às ${slot.substring(0,5)}` : "Faça login para agendar"}
                      disabled={!token && false} // Mantém o botão clicável para mostrar o alerta de login
                    >
                      {slot.substring(0,5)}
                    </button>
                  ))}
                </div>
              ) : (
                <p>Nenhum horário disponível para este serviço nesta data. Tente outra data ou serviço.</p>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default BusinessPublicPage;