// frontend/src/pages/HomePage.js
import React from 'react';

const HomePage = () => {

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <img src="EncaixaAi_dark.png" alt="Logo" style={{ maxWidth: '300px', height: 'auto' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '40px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ flex: 1 }}>
          <h2>Bem-vindo(a) ao Encaixa Aí</h2>
          <p>
            Dedique-se aos seus clientes, deixe a organização com a gente!
          </p>
          <p>
            Nossa plataforma foi desenhada para organizar seus atendimentos de forma inteligente, liberando seu tempo para o que realmente importa: seus clientes.
          </p>
        </div>
        <div style={{ flex: 1 }}>
          <img src="ilu1.png" alt="Illustration" style={{ maxWidth: '100%', height: 'auto' }} />
        </div>
      </div>
    </>
  );
};

export default HomePage;