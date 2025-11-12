import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingScreen.css';

const LandingScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-screen">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-icon">💊</div>
          <h1 className="hero-title">MiMedicina</h1>
          <p className="hero-subtitle">Tu asistente personal para el control de medicamentos</p>
          <p className="hero-description">
            Gestiona tus medicamentos de forma inteligente, nunca olvides una toma y mantén un control completo de tu salud
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate('/login')}>
              Comenzar Gratis
            </button>
            <button className="btn-secondary" onClick={() => navigate('/login')}>
              Iniciar Sesión
            </button>
          </div>
          <div className="play-store-badge">
            <span>📱</span>
            <span>Disponible en Google Play Store</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">¿Por qué elegir MiMedicina?</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3 className="feature-title">Supervisión Inteligente</h3>
            <p className="feature-description">
              Lleva un control preciso de la toma de tus medicamentos. Recibe recordatorios y mantén un historial completo de adherencia al tratamiento.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3 className="feature-title">Adherencia al Tratamiento</h3>
            <p className="feature-description">
              Visualiza estadísticas de cumplimiento, identifica patrones y mejora tu adherencia al tratamiento médico con datos claros y útiles.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💊</div>
            <h3 className="feature-title">Botiquín Virtual</h3>
            <p className="feature-description">
              Ve a simple vista todo lo que tienes en tu botiquín físico. Controla stock, organiza por medicamentos y mantén todo ordenado.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3 className="feature-title">Fechas de Vencimiento</h3>
            <p className="feature-description">
              Recibe alertas antes de que tus medicamentos caduquen. Nunca más tomes medicamentos vencidos.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👨‍⚕️</div>
            <h3 className="feature-title">Recordatorios Médicos</h3>
            <p className="feature-description">
              Agenda visitas médicas, recibe recordatorios y nunca olvides una cita importante con tu médico.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3 className="feature-title">Acceso Móvil</h3>
            <p className="feature-description">
              Descarga la app desde Google Play Store y lleva tu control de medicamentos siempre contigo, estés donde estés.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section">
        <h2 className="section-title">Planes y Precios</h2>
        
        <div className="pricing-grid">
          <div className="pricing-card free">
            <div className="pricing-header">
              <h3 className="pricing-title">Gratis</h3>
              <div className="pricing-price">
                <span className="price-amount">$0</span>
                <span className="price-period">/mes</span>
              </div>
            </div>
            <ul className="pricing-features">
              <li>✅ Hasta 5 medicamentos</li>
              <li>✅ Recordatorios de toma</li>
              <li>✅ Historial básico</li>
              <li>✅ Botiquín virtual</li>
              <li>❌ Sin límite de medicamentos</li>
              <li>❌ Estadísticas avanzadas</li>
            </ul>
            <button className="btn-pricing" onClick={() => navigate('/login')}>
              Comenzar Gratis
            </button>
          </div>

          <div className="pricing-card premium">
            <div className="pricing-badge">Recomendado</div>
            <div className="pricing-header">
              <h3 className="pricing-title">Premium</h3>
              <div className="pricing-price">
                <span className="price-amount">$4.99</span>
                <span className="price-period">/mes</span>
              </div>
            </div>
            <ul className="pricing-features">
              <li>✅ Medicamentos ilimitados</li>
              <li>✅ Recordatorios avanzados</li>
              <li>✅ Historial completo</li>
              <li>✅ Estadísticas detalladas</li>
              <li>✅ Alertas de vencimiento</li>
              <li>✅ Recordatorios médicos</li>
              <li>✅ Exportar reportes</li>
            </ul>
            <button className="btn-pricing premium-btn" onClick={() => navigate('/login')}>
              Suscribirse
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Comienza a cuidar tu salud hoy</h2>
          <p className="cta-description">
            Únete a miles de usuarios que ya confían en MiMedicina para gestionar sus medicamentos
          </p>
          <button className="btn-cta" onClick={() => navigate('/login')}>
            Empezar Ahora
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2025 MiMedicina. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default LandingScreen;

