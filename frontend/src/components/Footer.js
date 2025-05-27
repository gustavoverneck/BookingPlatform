// frontend/src/components/Footer.js
import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <p>&copy; {new Date().getFullYear()} Plataforma de Agendamentos. Todos os direitos reservados.</p>
      {/* Você pode adicionar mais links ou informações aqui se desejar, 
          por exemplo, links para "Termos de Serviço" ou "Política de Privacidade" */}
    </footer>
  );
};

export default Footer;