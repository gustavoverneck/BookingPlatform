// frontend/src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Componentes de Layout
import Header from './components/Header'; // Nosso novo Header (que contém a Navbar)
import Footer from './components/Footer'; // Nosso novo Footer

// Páginas
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import BusinessPublicPage from './pages/BusinessPublicPage';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <div className="App"> 
      <Header />
      <main className="main-content">
        <Routes>
          {/* --- Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/businesses/:businessId" element={<BusinessPublicPage />} />

          {/* --- Protected --- */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;