import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { path: '/', key: 'dashboard', icon: '📊' },
    { path: '/reports', key: 'reports', icon: '📈' },
    { path: '/babies', key: 'babies', icon: '⏰' },
    { path: '/settings', key: 'settings', icon: '⚙️' },
  ];

  return (
    <div className="layout">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <main id="main-content" className="layout__main">
        {children}
      </main>

      <nav className="layout__nav" role="navigation" aria-label="Main navigation">
        <ul className="layout__nav-list">
          {navItems.map((item) => (
            <li key={item.key} className="layout__nav-item">
              <Link
                to={item.path}
                className={`layout__nav-link ${
                  location.pathname === item.path ? 'layout__nav-link--active' : ''
                }`}
                aria-current={location.pathname === item.path ? 'page' : undefined}
              >
                <span className="layout__nav-icon" aria-hidden="true">
                  {item.icon}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default Layout; 