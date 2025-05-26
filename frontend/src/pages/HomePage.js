// frontend/src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom'; // Importa o componente de Link para navegação

const HomePage = () => {

  const buttonStyle = {
    margin: '0 10px',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Bem-vindo à Plataforma de Agendamentos</h2>
      <p>
        A solução definitiva para gerenciar seus compromissos de forma
        fácil e eficiente.
      </p>
      <p>
        Organize sua agenda, otimize seu tempo e nunca mais perca uma reunião.
      </p>
      <div style={{ marginTop: '30px' }}>
        <Link to="/login">
          <button style={buttonStyle}>Login</button>
        </Link>
        <Link to="/signup">
          <button style={buttonStyle}>Registrar-se</button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;