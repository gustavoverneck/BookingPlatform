// frontend/src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); 
    navigate('/');
  };

  return (
    <nav className="app-navbar">
      <div className="navbar-brand">
        <Link to="/">
          <img src="/EncaixaAi_light.png" alt="Encaixa Ai" className="navbar-logo" />
        </Link>
      </div>
      <ul className="navbar-links">
        {token ? (
          <>
            <li>
              <Link to="/dashboard">Gerenciar</Link>
            </li>
            <li>
              <button onClick={handleLogout} className="navbar-button-link">
                Sair
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/">Início</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/signup">Registrar-se</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;