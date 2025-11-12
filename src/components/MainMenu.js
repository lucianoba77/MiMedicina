import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './MainMenu.css';

const MainMenu = () => {
  const location = useLocation();

  return (
    <div className="main-menu">
      <Link 
        to="/dashboard" 
        className={`menu-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
      >
        <div className="menu-icon" style={{ backgroundColor: '#E3F2FD' }}>
          <span className="icon-home">🏠</span>
        </div>
        <span className="menu-text">Inicio</span>
      </Link>

      <Link 
        to="/nuevo" 
        className={`menu-item ${location.pathname === '/nuevo' ? 'active' : ''}`}
      >
        <div className="menu-icon" style={{ backgroundColor: '#E8F5E9' }}>
          <span className="icon-plus">+</span>
        </div>
        <span className="menu-text">Nueva</span>
      </Link>

      <Link 
        to="/botiquin" 
        className={`menu-item ${location.pathname === '/botiquin' ? 'active' : ''}`}
      >
        <div className="menu-icon" style={{ backgroundColor: '#F3E5F5' }}>
          <span className="icon-cabinet">💊</span>
        </div>
        <span className="menu-text">Botiquín</span>
      </Link>

      <Link 
        to="/ajustes" 
        className={`menu-item ${location.pathname === '/ajustes' ? 'active' : ''}`}
      >
        <div className="menu-icon" style={{ backgroundColor: '#FFF3E0' }}>
          <span className="icon-settings">⚙</span>
        </div>
        <span className="menu-text">Ajustes</span>
      </Link>
    </div>
  );
};

export default MainMenu;

