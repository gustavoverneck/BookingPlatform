// frontend/src/components/Footer.js
import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <p>&copy; {new Date().getFullYear()}. Encaixa Aí. Todos os direitos reservados.</p>
      {/* Adicionar links para "Termos de Serviço" e "Política de Privacidade" */}
    </footer>
  );
};

export default Footer;