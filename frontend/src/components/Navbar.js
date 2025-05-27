// frontend/src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Nosso hook de autenticação
import './Navbar.css'; // Vamos criar este arquivo de estilo

const Navbar = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Limpa o token do contexto e localStorage
    navigate('/'); // Redireciona para a HomePage após o logout
  };

  return (
    <nav className="app-navbar">
      <div className="navbar-brand">
        <Link to="/">Plataforma de Agendamentos</Link>
      </div>
      <ul className="navbar-links">
        {token ? (
          // Links para usuários logados
          <>
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
            <li>
              {/* O botão de logout chama handleLogout */}
              <button onClick={handleLogout} className="navbar-button-link">
                Sair (Logout)
              </button>
            </li>
          </>
        ) : (
          // Links para usuários não logados
          <>
            <li>
              <Link to="/">Home</Link>
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