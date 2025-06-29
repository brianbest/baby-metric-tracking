import React from 'react';
import { useTranslation } from 'react-i18next';

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
  };

  return (
    <div className="settings">
      <header className="page-header">
        <h1>{t('settings.title')}</h1>
      </header>

      <div className="page-content">
        <section className="settings-section">
          <h2>{t('settings.language')}</h2>
          <div className="settings-group">
            <button
              className={`btn ${i18n.language === 'en-US' ? 'btn--primary' : 'btn--secondary'}`}
              onClick={() => handleLanguageChange('en-US')}
            >
              {t('settings.languages.en-US')}
            </button>
            <button
              className={`btn ${i18n.language === 'zh-CN' ? 'btn--primary' : 'btn--secondary'}`}
              onClick={() => handleLanguageChange('zh-CN')}
            >
              {t('settings.languages.zh-CN')}
            </button>
          </div>
        </section>

        <section className="settings-section">
          <h2>{t('settings.theme')}</h2>
          <div className="settings-group">
            <button className="btn btn--secondary">{t('settings.themes.dark')}</button>
            <button className="btn btn--secondary">{t('settings.themes.light')}</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
